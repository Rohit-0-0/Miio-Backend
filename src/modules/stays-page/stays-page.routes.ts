import { Router } from 'express';
import { StaysPageController } from './stays-page.controller';
import { requireAuth, requireAdmin } from '@/shared/middleware/auth';

const router = Router();
const controller = new StaysPageController();

// Public routes
router.get('/', controller.get);

// Admin routes
router.use(requireAuth, requireAdmin);
router.patch('/general', controller.updateGeneral);
router.patch('/filters', controller.updateFilters);
router.patch('/empty-state', controller.updateEmptyState);
router.patch('/final-cta', controller.updateFinalCta);
router.patch('/seo', controller.updateSeo);

export default router;
