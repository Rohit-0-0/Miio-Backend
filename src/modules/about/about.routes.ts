import { Router } from 'express';

import { asyncHandler } from '@/shared/middleware';
import { validate } from '@/shared/validation';

import { AboutController } from './about.controller';
import { updateAboutSchema } from './about.validation.js';
const router = Router();

const controller = new AboutController();

router.get('/', asyncHandler(controller.get.bind(controller)));

router.put('/',  validate(updateAboutSchema),asyncHandler(controller.update.bind(controller)));

export default router;