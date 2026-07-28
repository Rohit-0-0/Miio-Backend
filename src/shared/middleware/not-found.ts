import type { Request, Response } from 'express';

import { ERROR_CODES } from '@/shared/errors';
import { HTTP_STATUS } from '@/shared/constants';
export function notFoundHandler(req: Request, res: Response) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    code: ERROR_CODES.RESOURCE_NOT_FOUND,
  });
}
