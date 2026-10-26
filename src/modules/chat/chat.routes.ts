import { Router } from 'express';

import { asyncHandler } from '@/shared/middleware';
import { validate } from '@/shared/validation';

import { streamChat } from './chat.controller';
import { chatRateLimiters } from './chat.rate-limit';
import { chatRequestSchema } from './chat.validation';

const router = Router();

// Rate limit first so rejected requests are cheap, then validate, then stream.
router.post('/', ...chatRateLimiters, validate(chatRequestSchema), asyncHandler(streamChat));

export const chatRoutes = router;
