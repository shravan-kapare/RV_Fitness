import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../shared/errors';
import { AuthenticatedRequest } from '../types';

/**
 * Checks if the authenticated user has one of the allowed roles.
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Role ${req.user.role} does not have permission to perform this action.`
        )
      );
    }

    next();
  };
}

export const requireAdmin = authorize(UserRole.ADMIN);
export const requireMemberOrAdmin = authorize(UserRole.ADMIN, UserRole.MEMBER);
