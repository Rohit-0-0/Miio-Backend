import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/shared/utils/security';
import { AppError } from '@/shared/errors';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return next(new AppError('Authentication required', 401));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (req.user.role !== 'ADMIN') {
    return next(new AppError('Access denied. Admin role required.', 403));
  }

  next();
};
