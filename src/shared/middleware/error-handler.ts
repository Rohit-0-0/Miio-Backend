import type { NextFunction, Request, Response } from 'express';

import { env } from '@/shared/config/env';
import { AppError } from '@/shared/errors';
import { logger } from '@/shared/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  return res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    code: 'INTERNAL_SERVER_ERROR',
  });
}
