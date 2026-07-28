import { Router } from 'express';

import { asyncHandler } from '@/shared/middleware';

import { SanityController } from './sanity.controller';

const router = Router();
const controller = new SanityController();

router.get('/test', asyncHandler(controller.test.bind(controller) as any));

export default router;