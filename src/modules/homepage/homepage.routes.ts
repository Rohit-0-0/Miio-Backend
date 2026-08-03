import { Router } from 'express';
import { HomepageController } from './homepage.controller';
import { validate } from '@/shared/validation';
import { asyncHandler } from '@/shared/middleware';
import {
  patchHeroSchema,
  patchFeaturedPropertiesSchema,
  patchEditorialStatementSchema,
  patchLocationsSchema,
  patchTrustSchema,
  patchJournalSchema,
  patchFinalCtaSchema,
  patchSeoSchema
} from './homepage.validation';

const router = Router();
const controller = new HomepageController();

router.get('/', asyncHandler(controller.get.bind(controller)));

router.patch('/hero', validate(patchHeroSchema), asyncHandler(controller.patchHero.bind(controller)));
router.patch('/featured-properties', validate(patchFeaturedPropertiesSchema), asyncHandler(controller.patchFeaturedProperties.bind(controller)));
router.patch('/editorial-statement', validate(patchEditorialStatementSchema), asyncHandler(controller.patchEditorialStatement.bind(controller)));
router.patch('/locations', validate(patchLocationsSchema), asyncHandler(controller.patchLocations.bind(controller)));
router.patch('/trust', validate(patchTrustSchema), asyncHandler(controller.patchTrust.bind(controller)));
router.patch('/journal', validate(patchJournalSchema), asyncHandler(controller.patchJournal.bind(controller)));
router.patch('/final-cta', validate(patchFinalCtaSchema), asyncHandler(controller.patchFinalCta.bind(controller)));
router.patch('/seo', validate(patchSeoSchema), asyncHandler(controller.patchSeo.bind(controller)));

export default router;
