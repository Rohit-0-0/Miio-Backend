import { Router } from 'express';
import { testRouter } from '@/modules/test';
import { sanityRoutes } from '@/modules/sanity';
import { aboutRoutes } from '@/modules/about';

const router = Router();

// Future routes
// router.use('/homepage', homepageRouter);
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

router.use('/test', testRouter);
router.use('/sanity', sanityRoutes);
router.use('/about', aboutRoutes);

export default router;