import { prisma } from '../../config/database';
import crypto from 'crypto';
import { AttendanceMethod, MembershipStatus } from '@prisma/client';
import { NotFoundError, BusinessRuleError } from '../../shared/errors';

export class AttendanceService {
  /**
   * Helper to normalize a date to UTC midnight for the Asia/Kolkata gym timezone.
   */
  public static getGymDate(date: Date = new Date()): Date {
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
    return new Date(`${dateStr}T00:00:00.000Z`);
  }

  /**
   * Validates whether a member's account and membership status allow gym entry.
   */
  public static validateMemberEligibility(member: any): { planName: string; membershipId: string } {
    if (!member.isActive) {
      throw new BusinessRuleError(
        `Member account for ${member.user?.fullName || 'this athlete'} is inactive. Please contact the front desk.`
      );
    }

    const now = new Date();
    const allMemberships = member.memberships || [];

    // Check for an active membership within valid dates
    const activeMembership = allMemberships.find(
      (m: any) =>
        m.status === MembershipStatus.ACTIVE &&
        new Date(m.startDate) <= now &&
        new Date(m.endDate) >= now
    );

    if (activeMembership) {
      return {
        planName: activeMembership.plan?.name || 'Active Membership',
        membershipId: activeMembership.id,
      };
    }

    // Check if membership is expired
    const expiredMembership = allMemberships.find(
      (m: any) => m.status === MembershipStatus.EXPIRED || new Date(m.endDate) < now
    );
    if (expiredMembership) {
      const expDate = new Date(expiredMembership.endDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      throw new BusinessRuleError(
        `Membership for ${member.user?.fullName} expired on ${expDate}. Please renew subscription at the desk before admission.`
      );
    }

    // Check if membership is frozen
    const frozenMembership = allMemberships.find((m: any) => m.status === MembershipStatus.FROZEN);
    if (frozenMembership) {
      throw new BusinessRuleError(
        `Membership for ${member.user?.fullName} is currently frozen. Please consult the admin desk to resume access.`
      );
    }

    // Check if membership is cancelled
    const cancelledMembership = allMemberships.find((m: any) => m.status === MembershipStatus.CANCELLED);
    if (cancelledMembership) {
      throw new BusinessRuleError(
        `Membership for ${member.user?.fullName} has been cancelled. Please register for a new membership plan.`
      );
    }

    throw new BusinessRuleError(
      `Member ${member.user?.fullName} has no active membership record. Please assign a plan before turnstile admission.`
    );
  }

  /**
   * Generates a secure, rotating QR check-in token for a member.
   */
  public static async generateQrToken(memberId: string) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: { select: { fullName: true } },
        memberships: {
          where: { status: MembershipStatus.ACTIVE },
          include: { plan: true },
          take: 1,
        },
      },
    });
    if (!member) throw new NotFoundError('Member record not found');

    this.validateMemberEligibility(member);

    // Invalidate existing active tokens for this member
    await prisma.attendanceQrToken.updateMany({
      where: { memberId, isRevoked: false },
      data: { isRevoked: true },
    });

    const randomPayload = crypto.randomBytes(24).toString('hex');
    const token = `RV-QR-${member.memberCode}-${randomPayload}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    const record = await prisma.attendanceQrToken.create({
      data: {
        memberId,
        token,
        expiresAt,
      },
    });

    return {
      token: record.token,
      expiresAt: record.expiresAt,
      memberCode: member.memberCode,
      hasActiveMembership: true,
      memberName: member.user.fullName,
    };
  }

  /**
   * Verifies and processes a QR check-in/check-out scan from the desk or turnstile.
   */
  public static async scanAndCheckIn(tokenString: string, staffUserId: string) {
    const tokenRecord = await prisma.attendanceQrToken.findUnique({
      where: { token: tokenString },
      include: {
        member: {
          include: {
            user: { select: { fullName: true, email: true } },
            memberships: { include: { plan: true } },
          },
        },
      },
    });

    if (!tokenRecord) {
      throw new NotFoundError('Invalid QR check-in pass. Please generate a fresh QR code from your member sanctuary.');
    }

    if (tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      throw new BusinessRuleError('This digital QR pass has expired or was already used. Please refresh the pass on your screen.');
    }

    return this.processCheckInOrOut(
      tokenRecord.member,
      AttendanceMethod.QR_CODE,
      staffUserId,
      { qrTokenRecord: tokenRecord }
    );
  }

  /**
   * Manual desk check-in / check-out by staff, trainer, or admin.
   * Supports lookup by memberCode OR memberId.
   */
  public static async manualCheckIn(data: {
    memberCode?: string;
    memberId?: string;
    verifiedBy: string;
    method?: AttendanceMethod;
    notes?: string;
  }) {
    let member = null;

    if (data.memberCode && data.memberCode.trim()) {
      const code = data.memberCode.trim();
      member = await prisma.member.findFirst({
        where: {
          OR: [
            { memberCode: code },
            { memberCode: code.toUpperCase() },
          ],
        },
        include: {
          user: { select: { fullName: true, email: true } },
          memberships: { include: { plan: true } },
        },
      });
    } else if (data.memberId && data.memberId.trim()) {
      member = await prisma.member.findUnique({
        where: { id: data.memberId.trim() },
        include: {
          user: { select: { fullName: true, email: true } },
          memberships: { include: { plan: true } },
        },
      });
    }

    if (!member) {
      throw new NotFoundError(
        data.memberCode
          ? `No member found matching code "${data.memberCode.trim()}". Please verify the code or check member registration.`
          : 'Member not found with the provided identifier.'
      );
    }

    return this.processCheckInOrOut(
      member,
      data.method || AttendanceMethod.MANUAL_DESK,
      data.verifiedBy,
      { notes: data.notes }
    );
  }

  /**
   * Unified transaction handling check-in, duplicate prevention, and check-out.
   */
  private static async processCheckInOrOut(
    member: any,
    method: AttendanceMethod,
    staffUserId: string,
    options?: { qrTokenRecord?: any; notes?: string }
  ) {
    // 1. Verify membership eligibility
    const eligibility = this.validateMemberEligibility(member);
    const gymDate = this.getGymDate();
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      // Invalidate QR token if used
      if (options?.qrTokenRecord) {
        await tx.attendanceQrToken.update({
          where: { id: options.qrTokenRecord.id },
          data: { isRevoked: true },
        });
      }

      // 2. Check for today's existing attendance
      const existing = await tx.attendance.findUnique({
        where: {
          memberId_date: {
            memberId: member.id,
            date: gymDate,
          },
        },
      });

      // CASE A: First scan of the day -> CHECK-IN
      if (!existing) {
        const attendance = await tx.attendance.create({
          data: {
            memberId: member.id,
            date: gymDate,
            checkInTime: now,
            method,
            verifiedBy: staffUserId,
            notes: options?.notes || (method === AttendanceMethod.QR_CODE ? 'Contactless QR Check-in' : 'Front desk verification'),
          },
          include: {
            member: {
              include: {
                user: { select: { fullName: true, email: true } },
              },
            },
            verifier: { select: { fullName: true } },
          },
        });

        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        return {
          action: 'CHECK_IN',
          message: `Check-in verified for ${member.user.fullName} (${member.memberCode}) at ${timeStr}. Plan: ${eligibility.planName}`,
          member: {
            id: member.id,
            name: member.user.fullName,
            code: member.memberCode,
            planName: eligibility.planName,
            checkInTime: attendance.checkInTime,
          },
          attendance,
        };
      }

      // CASE B: Already checked in, but not checked out yet
      if (existing.checkOutTime === null) {
        const elapsedMs = now.getTime() - new Date(existing.checkInTime).getTime();
        const elapsedMinutes = Math.floor(elapsedMs / 60000);

        // Accidental duplicate scan within 3 minutes
        if (elapsedMinutes < 3) {
          const checkInFormatted = new Date(existing.checkInTime).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          });
          throw new BusinessRuleError(
            `Duplicate scan: ${member.user.fullName} is already checked in ${
              elapsedMinutes === 0 ? 'just now' : `${elapsedMinutes}m ago`
            } at ${checkInFormatted}.`
          );
        }

        // Valid Check-out (> 3 minutes after check-in)
        const updated = await tx.attendance.update({
          where: { id: existing.id },
          data: {
            checkOutTime: now,
            notes: existing.notes
              ? `${existing.notes} | Out at ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
              : `Checked out at ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
          },
          include: {
            member: {
              include: {
                user: { select: { fullName: true, email: true } },
              },
            },
            verifier: { select: { fullName: true } },
          },
        });

        return {
          action: 'CHECK_OUT',
          message: `Check-out recorded for ${member.user.fullName} (${member.memberCode}). Session duration: ${elapsedMinutes} minutes. Great workout!`,
          member: {
            id: member.id,
            name: member.user.fullName,
            code: member.memberCode,
            planName: eligibility.planName,
            checkInTime: existing.checkInTime,
            checkOutTime: updated.checkOutTime,
            durationMinutes: elapsedMinutes,
          },
          attendance: updated,
        };
      }

      // CASE C: Already completed a visit today (checked in and checked out)
      const inTime = new Date(existing.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const outTime = new Date(existing.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      throw new BusinessRuleError(
        `Member ${member.user.fullName} has already completed their workout session today (In: ${inTime}, Out: ${outTime}). Please consult the desk for secondary entry.`
      );
    });
  }

  /**
   * Retrieves daily attendance log with summary statistics.
   */
  public static async getDailyReport(dateStr?: string) {
    const queryDate = dateStr ? this.getGymDate(new Date(dateStr)) : this.getGymDate(new Date());

    const attendances = await prisma.attendance.findMany({
      where: { date: queryDate },
      orderBy: { checkInTime: 'desc' },
      include: {
        member: {
          include: {
            user: { select: { fullName: true, email: true, phone: true } },
            memberships: {
              where: { status: 'ACTIVE' },
              select: { plan: { select: { name: true } } },
              take: 1,
            },
          },
        },
        verifier: { select: { fullName: true } },
      },
    });

    // Calculate hourly distribution
    const hourlyDistribution: Record<number, number> = {};
    for (let h = 5; h <= 23; h++) hourlyDistribution[h] = 0;

    let activeInGymCount = 0;

    for (const a of attendances) {
      if (a.checkOutTime === null) {
        activeInGymCount++;
      }
      const hour = new Date(a.checkInTime).getHours();
      if (hourlyDistribution[hour] !== undefined) {
        hourlyDistribution[hour]++;
      }
    }

    return {
      date: queryDate.toISOString().split('T')[0],
      totalCheckIns: attendances.length,
      activeInGymCount,
      qrCheckIns: attendances.filter((a) => a.method === 'QR_CODE').length,
      manualCheckIns: attendances.filter((a) => a.method !== 'QR_CODE').length,
      hourlyDistribution,
      records: attendances,
    };
  }

  /**
   * Member's personal check-in history.
   */
  public static async getMemberHistory(memberId: string) {
    return prisma.attendance.findMany({
      where: { memberId },
      orderBy: { checkInTime: 'desc' },
      take: 30,
    });
  }
}
