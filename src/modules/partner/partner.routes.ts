import { Router } from 'express';

import { asyncHandler } from '@/shared/middleware';
import { validate } from '@/shared/validation';

import { PartnerController } from './partner.controller';
import { updatePartnerSchema } from './partner.validation';

const router = Router();
const controller = new PartnerController();

router.get('/', asyncHandler(controller.get.bind(controller)));

router.put(
  '/',
  validate(updatePartnerSchema),
  asyncHandler(controller.update.bind(controller)),
);

export default router;
