import { prisma } from '../../../config/database';
import { Request } from 'express';

export interface CreateAuditLogParams {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  req?: Request;
}

export class AuditService {
  /**
   * Records a financial or administrative audit log.
   */
  public static async log(params: CreateAuditLogParams): Promise<void> {
    try {
      const ipAddress =
        params.req?.headers['x-forwarded-for']?.toString() ||
        params.req?.socket?.remoteAddress ||
        undefined;
      const userAgent = params.req?.headers['user-agent'] || undefined;

      await prisma.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          oldValues: params.oldValues ? (params.oldValues as any) : undefined,
          newValues: params.newValues ? (params.newValues as any) : undefined,
          ipAddress: ipAddress ? ipAddress.slice(0, 45) : undefined,
          userAgent: userAgent ? userAgent.slice(0, 500) : undefined,
        },
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // We don't fail user requests if audit logging encounters a secondary error,
      // but log it for forensics.
    }
  }

  public static async findAll(filters: {
    userId?: string;
    entityType?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.action) where.action = { contains: filters.action, mode: 'insensitive' };

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
      }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
