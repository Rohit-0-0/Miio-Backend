import { Router } from 'express';
import { asyncHandler } from '@/shared/middleware';
import { PartnerWithUsController } from './partner-with-us.controller';

const router = Router();
const controller = new PartnerWithUsController();

router.get('/', asyncHandler(controller.get.bind(controller)));

export default router;
