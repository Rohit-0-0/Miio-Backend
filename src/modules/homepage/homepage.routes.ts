import { Router } from 'express';
import { asyncHandler } from '@/shared/middleware';
import { validate } from '@/shared/validation';
import { HomepageController } from './homepage.controller';
import { patchHeroSchema } from './homepage.validation';

const router = Router();
const controller = new HomepageController();

router.get('/', asyncHandler(controller.get.bind(controller)));
router.put('/hero', validate(patchHeroSchema), asyncHandler(controller.patchHero.bind(controller)));

export default router;
