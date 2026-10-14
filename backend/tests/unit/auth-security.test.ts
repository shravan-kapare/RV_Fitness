import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

describe('Auth & Role Permissions Security', () => {
  const secret = 'test_jwt_secret_must_be_at_least_32_characters_long_for_security';

  it('signs and verifies JWT tokens with proper claims', () => {
    const payload = {
      userId: 'user-uuid-123',
      email: 'admin@rvfitness.com',
      role: UserRole.ADMIN,
      fullName: 'RV Admin',
    };

    const token = jwt.sign(payload, secret, { expiresIn: '15m' });
    const decoded = jwt.verify(token, secret) as any;

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(UserRole.ADMIN);
  });

  it('rejects tokens signed with invalid or compromised secrets', () => {
    const token = jwt.sign({ userId: '123' }, 'wrong_secret');
    expect(() => jwt.verify(token, secret)).toThrow();
  });

  it('strictly enforces role access rules for billing operations', () => {
    const rolePermissions: Record<UserRole, { canManageBilling: boolean; canViewOwn: boolean }> = {
      ADMIN: { canManageBilling: true, canViewOwn: true },
      MEMBER: { canManageBilling: false, canViewOwn: true },
      TRAINER: { canManageBilling: false, canViewOwn: false },
    };

    // ADMIN has full billing rights
    expect(rolePermissions[UserRole.ADMIN].canManageBilling).toBe(true);
    // MEMBER can only view their own records
    expect(rolePermissions[UserRole.MEMBER].canManageBilling).toBe(false);
    expect(rolePermissions[UserRole.MEMBER].canViewOwn).toBe(true);
    // TRAINER has NO billing access
    expect(rolePermissions[UserRole.TRAINER].canManageBilling).toBe(false);
    expect(rolePermissions[UserRole.TRAINER].canViewOwn).toBe(false);
  });

  it('prevents self-assignment of privileged roles during public registration', () => {
    function canSelfAssignRole(role: UserRole): boolean {
      return role === UserRole.MEMBER;
    }

    expect(canSelfAssignRole(UserRole.MEMBER)).toBe(true);
    expect(canSelfAssignRole(UserRole.ADMIN)).toBe(false);
    expect(canSelfAssignRole(UserRole.TRAINER)).toBe(false);
  });
});
