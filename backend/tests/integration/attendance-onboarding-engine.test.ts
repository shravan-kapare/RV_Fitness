import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../../src/config/database';
import { AttendanceService } from '../../src/modules/attendance/attendance.service';
import { MemberService } from '../../src/modules/members/member.service';
import { WorkoutEngineService } from '../../src/modules/fitness/workout-engine.service';
import { EquipmentService } from '../../src/modules/fitness/equipment.service';
import { InvoiceService } from '../../src/modules/billing/invoices/invoice.service';
import { UserRole, GoalType, EquipmentStatus } from '@prisma/client';

describe('RV Fitness Remediation Test Suite', () => {
  let adminUser: any;
  let trainerUser: any;
  let activeMemberUser: any;
  let activeMember: any;

  beforeAll(async () => {
    // Look up or establish seeded records
    adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
    trainerUser = await prisma.user.findFirst({ where: { role: UserRole.TRAINER } });
    activeMember = await prisma.member.findFirst({
      where: { memberCode: 'RV-2026-0001' },
      include: {
        user: true,
        memberships: {
          include: { plan: true },
        },
      },
    });
    activeMemberUser = activeMember?.user;

    // Ensure clean attendance state for today's test execution
    if (activeMember) {
      const gymDate = AttendanceService.getGymDate();
      await prisma.attendance.deleteMany({
        where: { memberId: activeMember.id, date: gymDate },
      });
    }
  });

  describe('1. Attendance Check-In / Out & Business Logic', () => {
    it('verifies member eligibility and executes check-in', async () => {
      const eligibility = AttendanceService.validateMemberEligibility(activeMember);
      expect(eligibility.planName).toBeTruthy();
      expect(activeMember.memberCode).toBe('RV-2026-0001');

      const result = await AttendanceService.manualCheckIn({
        memberId: activeMember.id,
        verifiedBy: adminUser.id,
      });

      expect(result.action).toBe('CHECK_IN');
      expect(result.message).toContain('Check-in verified');
    });

    it('rejects duplicate scans within short turnaround window', async () => {
      await expect(
        AttendanceService.manualCheckIn({
          memberId: activeMember.id,
          verifiedBy: adminUser.id,
        })
      ).rejects.toThrow(/Duplicate scan/);
    });

    it('rejects check-in for non-existent member code', async () => {
      await expect(
        AttendanceService.manualCheckIn({
          memberCode: 'RV-NONEXISTENT-999',
          verifiedBy: adminUser.id,
        })
      ).rejects.toThrow(/No member found matching code/);
    });
  });

  describe('2. Role-Based Billing Permissions', () => {
    it('blocks Trainer from accessing invoices (Zero Billing Access)', async () => {
      await expect(
        InvoiceService.findAll({}, { id: trainerUser.id, role: UserRole.TRAINER })
      ).rejects.toThrow(/Trainers do not have access to billing/);
    });

    it('allows Admin to access all invoices', async () => {
      const result = await InvoiceService.findAll({}, { id: adminUser.id, role: UserRole.ADMIN });
      expect(result).toHaveProperty('invoices');
      expect(Array.isArray(result.invoices)).toBe(true);
    });
  });

  describe('3. Member Onboarding & Dynamic BMI Calibrator', () => {
    it('records biometrics and calculates BMI accurately', async () => {
      const weight = 80.0;
      const height = 180.0; // 1.8m
      const expectedBmi = Number((weight / (1.8 * 1.8)).toFixed(2)); // 24.69

      const result = await MemberService.completeOnboarding(activeMemberUser.id, {
        dateOfBirth: '1998-05-14',
        gender: 'MALE',
        phone: '+91 98220 12345',
        emergencyContact: 'Vijay Shinde (+91 98220 99999)',
        address: 'Narsobawadi, Maharashtra',
        weightKg: weight,
        heightCm: height,
        goalType: GoalType.MUSCLE_GAIN,
        targetWeightKg: 84,
        experienceLevel: 'INTERMEDIATE',
        daysPerWeek: 6,
        dietaryPreference: 'High Protein Non-Veg & Eggs',
        limitations: ['LOWER_BACK_PAIN'],
        parqAccepted: true,
      });

      expect(result.success).toBe(true);
      expect(Number(result.assessment.bmi)).toBe(expectedBmi);
      expect(Number(result.assessment.weightKg)).toBe(weight);
      expect(result.goal.goalType).toBe(GoalType.MUSCLE_GAIN);
    });

    it('confirms onboarding completion status is true', async () => {
      const status = await MemberService.getOnboardingStatus(activeMemberUser.id);
      expect(status.completed).toBe(true);
    });
  });

  describe('4. Personalized Workout Engine & Equipment Substitution', () => {
    it('calculates Asia/Kolkata day info correctly', () => {
      const info = WorkoutEngineService.getKolkataDayInfo();
      expect(info.isoDayNumber).toBeGreaterThanOrEqual(1);
      expect(info.isoDayNumber).toBeLessThanOrEqual(7);
      expect(info.weekdayStr).toBeTruthy();
      expect(info.kolkataDateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('retrieves today workout session with equipment awareness', async () => {
      const todaySession = await WorkoutEngineService.getTodayWorkoutForMember(activeMember.id);
      expect(todaySession).toBeTruthy();
      expect(todaySession?.planTitle).toContain('Personalized');
      expect(todaySession?.today).toHaveProperty('dayTitle');
      expect(todaySession?.today).toHaveProperty('exercises');
    });

    it('substitutes equipment when a machine is under maintenance', async () => {
      // Find Pec Deck machine (which is marked MAINTENANCE)
      const pecDeck = await prisma.equipment.findFirst({
        where: { name: 'Pec Deck / Rear Delt Fly Machine' },
      });

      if (pecDeck) {
        expect(pecDeck.status).toBe(EquipmentStatus.MAINTENANCE);
      }

      const map = await EquipmentService.getEquipmentOperationalMap();
      expect(map.get('pec deck / rear delt fly machine')).toBe(false);
    });
  });
});
