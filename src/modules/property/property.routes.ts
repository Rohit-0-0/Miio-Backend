import { Router } from 'express';
import { PropertyController } from './property.controller';
import { PropertyEditorialController } from './editorial/property-editorial.controller';
import { requireAuth } from '@/shared/middleware/auth';
import { validate } from '@/shared/validation';
import { listPropertiesSchema, createPropertySchema, updatePropertySchema, getPropertiesByIdsSchema } from './property.validation';
import { asyncHandler } from '@/shared/middleware';

const router = Router();
const controller = new PropertyController();
const editorialController = new PropertyEditorialController();

// Admin Editorial Endpoints
router.get('/editorial/:id', requireAuth, editorialController.get);
router.patch('/editorial/:id', requireAuth, editorialController.update);

// Public routes
router.get('/', validate(listPropertiesSchema), asyncHandler(controller.list.bind(controller)));
router.get('/by-ids', validate(getPropertiesByIdsSchema), asyncHandler(controller.getByIds.bind(controller)));
router.get('/slug/:slug', asyncHandler(controller.getBySlug.bind(controller)));
router.get('/:id/reviews', asyncHandler(controller.getReviews.bind(controller)));
router.get('/:id', asyncHandler(controller.get.bind(controller)));
router.post('/', validate(createPropertySchema), asyncHandler(controller.create.bind(controller)));
router.put('/:id', validate(updatePropertySchema), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', asyncHandler(controller.delete.bind(controller)));

export default router;
