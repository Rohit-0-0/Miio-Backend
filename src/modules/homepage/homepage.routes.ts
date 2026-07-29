import { Router } from 'express';
import { HomepageController } from './homepage.controller';
import { validate } from '@/shared/validation';
import { asyncHandler } from '@/shared/middleware';
import {
  patchHeroSchema,
  patchFeaturedPropertiesSchema,
  patchWhyMiioSchema,
  patchExperiencesSchema,
  patchTestimonialsSchema,
  patchFaqSchema,
  patchNewsletterSchema,
  patchSeoSchema
} from './homepage.validation';

const router = Router();
const controller = new HomepageController();

router.get('/', asyncHandler(controller.get.bind(controller)));

router.patch('/hero', validate(patchHeroSchema), asyncHandler(controller.patchHero.bind(controller)));
router.patch('/featured-properties', validate(patchFeaturedPropertiesSchema), asyncHandler(controller.patchFeaturedProperties.bind(controller)));
router.patch('/why-miio', validate(patchWhyMiioSchema), asyncHandler(controller.patchWhyMiio.bind(controller)));
router.patch('/experiences', validate(patchExperiencesSchema), asyncHandler(controller.patchExperiences.bind(controller)));
router.patch('/testimonials', validate(patchTestimonialsSchema), asyncHandler(controller.patchTestimonials.bind(controller)));
router.patch('/faq', validate(patchFaqSchema), asyncHandler(controller.patchFaq.bind(controller)));
router.patch('/newsletter', validate(patchNewsletterSchema), asyncHandler(controller.patchNewsletter.bind(controller)));
router.patch('/seo', validate(patchSeoSchema), asyncHandler(controller.patchSeo.bind(controller)));

export default router;
