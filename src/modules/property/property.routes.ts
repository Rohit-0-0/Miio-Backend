import { Router } from 'express';
import { PropertyController } from './property.controller';
import { validate } from '@/shared/validation';
import { listPropertiesSchema, createPropertySchema, updatePropertySchema, getPropertiesByIdsSchema } from './property.validation';
import { asyncHandler } from '@/shared/middleware';

const router = Router();
const controller = new PropertyController();

router.get('/', validate(listPropertiesSchema), asyncHandler(controller.list.bind(controller)));
router.get('/by-ids', validate(getPropertiesByIdsSchema), asyncHandler(controller.getByIds.bind(controller)));
router.get('/slug/:slug', asyncHandler(controller.getBySlug.bind(controller)));
router.get('/:id', asyncHandler(controller.get.bind(controller)));
router.post('/', validate(createPropertySchema), asyncHandler(controller.create.bind(controller)));
router.put('/:id', validate(updatePropertySchema), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', asyncHandler(controller.delete.bind(controller)));

export default router;
