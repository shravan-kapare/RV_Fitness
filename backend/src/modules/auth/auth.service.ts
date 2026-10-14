import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { ConflictError, UnauthorizedError, ForbiddenError } from '../../shared/errors';
import { JwtPayload } from '../../types';
import { LoginInput, RegisterInput } from './auth.schema';
import { AuditService } from '../billing/audit/audit.service';

export class AuthService {
  /**
   * Hashes a password using bcrypt with cost factor 12.
   */
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Compares plain password with stored bcrypt hash.
   */
  public static async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  /**
   * Generates access and refresh tokens.
   */
  public static generateTokens(user: { id: string; email: string; role: UserRole; fullName: string }) {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN || '15m',
    } as any);

    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d',
    } as any);

    return { accessToken, refreshToken };
  }

  /**
   * Authenticates user via email and password.
   */
  public static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await this.verifyPassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = this.generateTokens(user);

    await AuditService.log({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  /**
   * Registers a new user. Only ADMIN can assign ADMIN or TRAINER roles.
   */
  public static async register(input: RegisterInput, requesterRole?: UserRole, requesterId?: string) {
    const email = input.email.toLowerCase().trim();

    // Prevent public assignment of privileged roles
    if (input.role !== UserRole.MEMBER && requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Only administrators can create users with Admin or Trainer roles');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const passwordHash = await this.hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: input.fullName.trim(),
        phone: input.phone?.trim() || null,
        role: input.role || UserRole.MEMBER,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (requesterId) {
      await AuditService.log({
        userId: requesterId,
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: user.id,
        newValues: { email: user.email, role: user.role, fullName: user.fullName },
      });
    }

    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user,
    };
  }

  /**
   * Verifies a refresh token and returns a new access token.
   */
  public static async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, fullName: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid session. Please log in again.');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedError('Invalid or expired session. Please log in again.');
    }
  }

  /**
   * Returns profile of the current user.
   */
  public static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        memberProfile: {
          select: {
            id: true,
            memberCode: true,
            joinDate: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user;
  }
}
