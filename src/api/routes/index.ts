import { Router } from 'express';
import { testRouter } from '@/modules/test';
import { sanityRoutes } from '@/modules/sanity';
import { aboutRoutes } from '@/modules/about';
import { partnerRoutes } from '@/modules/partner';
import { journalRoutes } from '@/modules/journal';
import { mediaRoutes } from '@/modules/media';

import homepageRouter from '@/modules/homepage/homepage.routes';
import { authRoutes } from '@/modules/auth/auth.routes';

import propertyRouter from '@/modules/property/property.routes';

const router = Router();

router.use('/properties', propertyRouter);
router.use('/homepage', homepageRouter);
// router.use('/about', aboutRouter);
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Miio Backend is running.',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/auth', authRoutes);
router.use('/test', testRouter);
router.use('/sanity', sanityRoutes);
router.use('/about', aboutRoutes);
router.use('/partner', partnerRoutes);
router.use('/journal', journalRoutes);
router.use('/media', mediaRoutes);

export default router;