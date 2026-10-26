import type { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';

import { HTTP_STATUS } from '@/shared/constants';

import { CHAT_CONFIG } from './chat.config';

function tooManyRequests(_req: Request, res: Response) {
  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
    success: false,
    message: 'You are sending messages too quickly. Please wait a moment and try again.',
    code: 'TOO_MANY_REQUESTS',
  });
}

/**
 * Per-IP limits. In-memory, so they reset when the server restarts; good enough to stop
 * casual abuse and runaway cost until a captcha or per-session limits are added.
 */
export const chatRateLimiters = [
  rateLimit({
    windowMs: 60 * 1000,
    limit: CHAT_CONFIG.rateLimit.perMinute,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: tooManyRequests,
  }),
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: CHAT_CONFIG.rateLimit.perHour,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: tooManyRequests,
  }),
];
