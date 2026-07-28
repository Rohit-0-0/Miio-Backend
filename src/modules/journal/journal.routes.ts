import { Router } from 'express';
import { asyncHandler } from '@/shared/middleware';
import { validate } from '@/shared/validation';
import { JournalController } from './journal.controller';
import {
  createJournalSchema,
  updateJournalSchema,
  listJournalSchema,
  slugParamSchema,
  idParamSchema,
} from './journal.validation';

const router = Router();
const controller = new JournalController();

router.get(
  '/',
  validate(listJournalSchema),
  asyncHandler(controller.list.bind(controller)),
);

router.get(
  '/:slug',
  validate(slugParamSchema),
  asyncHandler(controller.getBySlug.bind(controller)),
);

router.post(
  '/',
  validate(createJournalSchema),
  asyncHandler(controller.create.bind(controller)),
);

router.put(
  '/:id',
  validate(updateJournalSchema),
  asyncHandler(controller.update.bind(controller)),
);

router.delete(
  '/:id',
  validate(idParamSchema),
  asyncHandler(controller.delete.bind(controller)),
);

export default router;
