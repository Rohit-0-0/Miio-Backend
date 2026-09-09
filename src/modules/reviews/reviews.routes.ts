import { Router } from 'express';
import { asyncHandler } from '@/shared/middleware';
import { validate } from '@/shared/validation';
import { requireAuth, requireAdmin } from '@/shared/middleware/auth';
import { ReviewsController } from './reviews.controller';
import {
  listReviewsQuerySchema,
  updateFeaturedReviewsSchema,
  toggleFeaturedReviewSchema,
} from './reviews.validation';

const router = Router();
const controller = new ReviewsController();

// Public list — used by Sanity Studio ReviewSelector (same pattern as booking/search for properties)
router.get('/', validate(listReviewsQuerySchema), asyncHandler(controller.list));

// Admin featured management (Miio Admin /admin/reviews)
router.get('/featured', requireAuth, requireAdmin, asyncHandler(controller.getFeatured));
router.put(
  '/featured',
  requireAuth,
  requireAdmin,
  validate(updateFeaturedReviewsSchema),
  asyncHandler(controller.setFeatured)
);
router.patch(
  '/featured/toggle',
  requireAuth,
  requireAdmin,
  validate(toggleFeaturedReviewSchema),
  asyncHandler(controller.toggleFeatured)
);

export default router;