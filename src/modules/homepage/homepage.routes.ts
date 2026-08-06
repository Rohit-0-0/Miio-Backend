import { Router } from 'express';
import { HomepageController } from './homepage.controller';
import { asyncHandler } from '@/shared/middleware';

const router = Router();
const controller = new HomepageController();

router.get('/', asyncHandler(controller.get.bind(controller)));

export default router;
