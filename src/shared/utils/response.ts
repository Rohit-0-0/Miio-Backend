import type { Response } from 'express';

import { HTTP_STATUS } from '@/shared/constants';

export function ok<T>(res: Response, data: T, message = 'Success'): Response {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
  });
}

export function created<T>(res: Response, data: T, message = 'Created successfully'): Response {
  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message,
    data,
  });
}

export function noContent(res: Response): Response {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
}
