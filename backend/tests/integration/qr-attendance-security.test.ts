import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../../src/config/database';
import { AttendanceService } from '../../src/modules/attendance/attendance.service';
import { UserRole, MembershipStatus, AttendanceMethod } from '@prisma/client';

describe('QR Attendance Security & Turnstile Flow Test Suite', () => {
  let adminUser: any;
  let activeMember: any;
  let testMemberUser: any;
  let testMember: any;
  let createdTokenRecord: any;

  beforeAll(async () => {
    adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
    activeMember = await prisma.member.findFirst({
      where: { memberCode: 'RV-2026-0001' },
      include: {
        user: true,
        memberships: {
          where: { status: MembershipStatus.ACTIVE },
          include: { plan: true },
        },
      },
    });

    // Create or find an isolated test member for token security checks
    testMember = await prisma.member.findFirst({
      where: { memberCode: 'RV-2026-0002' },
      include: {
        user: true,
        memberships: {
          where: { status: MembershipStatus.ACTIVE },
          include: { plan: true },
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up test QR tokens generated during test runs
    if (activeMember) {
      await prisma.attendanceQrToken.deleteMany({
        where: { memberId: activeMember.id, token: { contains: 'TEST-' } },
      });
    }
  });

  describe('1. Member Digital QR Pass Token Generation', () => {
    it('generates secure rotating QR token with both token and qrPayload attributes', async () => {
      const targetMember = activeMember || testMember;
      expect(targetMember).toBeDefined();

      const qrResponse = await AttendanceService.generateQrToken(targetMember.id);

      expect(qrResponse).toBeDefined();
      expect(qrResponse.token).toBeTruthy();
      expect(qrResponse.qrPayload).toBeTruthy();
      // Verifies the fix for DigitalIdCard.tsx
      expect(qrResponse.qrPayload).toBe(qrResponse.token);
      expect(qrResponse.token.startsWith(`RV-QR-${targetMember.memberCode}-`)).toBe(true);
      expect(qrResponse.hasActiveMembership).toBe(true);
      expect(qrResponse.planName).toBeTruthy();
      expect(new Date(qrResponse.expiresAt).getTime()).toBeGreaterThan(Date.now());

      createdTokenRecord = qrResponse;
    });

    it('revokes previously issued active tokens when a new token is generated', async () => {
      const targetMember = activeMember || testMember;
      const firstToken = await AttendanceService.generateQrToken(targetMember.id);

      // Generate a second token
      const secondToken = await AttendanceService.generateQrToken(targetMember.id);

      // Verify the first token record in the database is marked isRevoked: true
      const firstDbRecord = await prisma.attendanceQrToken.findUnique({
        where: { token: firstToken.token },
      });

      expect(firstDbRecord?.isRevoked).toBe(true);

      // The new second token should be active (isRevoked: false)
      const secondDbRecord = await prisma.attendanceQrToken.findUnique({
        where: { token: secondToken.token },
      });
      expect(secondDbRecord?.isRevoked).toBe(false);
    });
  });

  describe('2. Anti-Replay & Token Expiry Security', () => {
    it('rejects an invalid or tampered QR token string', async () => {
      await expect(
        AttendanceService.scanAndCheckIn('RV-QR-FAKE-TOKEN-9999', adminUser.id)
      ).rejects.toThrow(/Invalid QR check-in pass/);
    });

    it('rejects an expired QR token', async () => {
      const targetMember = activeMember || testMember;
      const expiredTokenString = `RV-QR-${targetMember.memberCode}-EXPIRED-${Date.now()}`;

      // Insert an already expired token into DB
      await prisma.attendanceQrToken.create({
        data: {
          memberId: targetMember.id,
          token: expiredTokenString,
          expiresAt: new Date(Date.now() - 60 * 1000), // 1 minute in the past
          isRevoked: false,
        },
      });

      await expect(
        AttendanceService.scanAndCheckIn(expiredTokenString, adminUser.id)
      ).rejects.toThrow(/expired or was already used/);

      // Cleanup
      await prisma.attendanceQrToken.delete({ where: { token: expiredTokenString } });
    });

    it('rejects a revoked QR token', async () => {
      const targetMember = activeMember || testMember;
      const revokedTokenString = `RV-QR-${targetMember.memberCode}-REVOKED-${Date.now()}`;

      await prisma.attendanceQrToken.create({
        data: {
          memberId: targetMember.id,
          token: revokedTokenString,
          expiresAt: new Date(Date.now() + 600 * 1000),
          isRevoked: true,
        },
      });

      await expect(
        AttendanceService.scanAndCheckIn(revokedTokenString, adminUser.id)
      ).rejects.toThrow(/expired or was already used/);

      // Cleanup
      await prisma.attendanceQrToken.delete({ where: { token: revokedTokenString } });
    });
  });

  describe('3. Attendance History & Filter Search API', () => {
    it('returns paginated attendance records with correct structure', async () => {
      const history = await AttendanceService.searchHistory({ page: 1, limit: 10 });

      expect(history).toHaveProperty('records');
      expect(history).toHaveProperty('pagination');
      expect(Array.isArray(history.records)).toBe(true);
      expect(history.pagination.page).toBe(1);
      expect(history.pagination.limit).toBe(10);
      expect(typeof history.pagination.total).toBe('number');
      expect(typeof history.pagination.totalPages).toBe('number');
    });

    it('filters attendance records by member code or query keyword', async () => {
      const targetMember = activeMember || testMember;
      if (!targetMember) return;

      const history = await AttendanceService.searchHistory({
        search: targetMember.memberCode,
        page: 1,
        limit: 10,
      });

      expect(history).toBeDefined();
      for (const rec of history.records) {
        expect(rec.member.memberCode).toBe(targetMember.memberCode);
      }
    });

    it('respects date boundaries when date filters are specified', async () => {
      const today = new Date().toISOString().split('T')[0];
      const history = await AttendanceService.searchHistory({
        dateFrom: today,
        dateTo: today,
        page: 1,
        limit: 50,
      });

      expect(history).toBeDefined();
      for (const rec of history.records) {
        const recDate = new Date(rec.date).toISOString().split('T')[0];
        expect(recDate).toBe(today);
      }
    });
  });
});
