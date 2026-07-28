import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import type { ZodObject, ZodTypeAny } from 'zod';

import { AppError } from '@/shared/errors';
import { HTTP_STATUS } from '@/shared/constants';

type RequestSchema = ZodObject<{
  body: ZodTypeAny;
  query: ZodTypeAny;
  params: ZodTypeAny;
}>;

export function validate(schema: RequestSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return next(
        new AppError(
          'Validation failed',
          HTTP_STATUS.BAD_REQUEST,
          'VALIDATION_ERROR',
          result.error.flatten(),
        ),
      );
    }

    // Only replace body. Express 5 exposes query/params as read-only.
    req.body = result.data.body;

    next();
  };
}