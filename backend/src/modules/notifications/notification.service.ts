import { prisma } from '../../config/database';
import { NotificationType, NotificationTarget, UserRole } from '@prisma/client';
import { NotFoundError } from '../../shared/errors';

export class NotificationService {
  public static async createNotification(data: {
    title: string;
    message: string;
    type?: NotificationType;
    targetType?: NotificationTarget;
    targetUserId?: string;
  }) {
    return prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || NotificationType.INFO,
        targetType: data.targetType || NotificationTarget.ALL,
        targetUserId: data.targetUserId,
      },
    });
  }

  public static async getUserNotifications(userId: string, role: UserRole) {
    const targetTypes: NotificationTarget[] = [NotificationTarget.ALL];
    if (role === UserRole.ADMIN) targetTypes.push(NotificationTarget.ADMIN_ONLY);
    if (role === UserRole.TRAINER) targetTypes.push(NotificationTarget.TRAINERS_ONLY);
    if (role === UserRole.MEMBER) targetTypes.push(NotificationTarget.MEMBERS_ONLY);

    return prisma.notification.findMany({
      where: {
        OR: [
          { targetUserId: userId },
          { targetType: { in: targetTypes } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  public static async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  public static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { targetUserId: userId },
      data: { isRead: true },
    });
  }

  public static async getAll(limit = 100) {
    return prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        targetUser: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }
}
