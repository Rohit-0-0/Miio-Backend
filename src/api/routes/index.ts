import { Router } from 'express';
import { testRouter } from '@/modules/test';
import { sanityRoutes } from '@/modules/sanity';
import { aboutRoutes } from '@/modules/about';
import { partnerRoutes } from '@/modules/partner';
import { journalRoutes } from '@/modules/journal';
import { mediaRoutes } from '@/modules/media';
import { dashboardRoutes } from '@/modules/dashboard';
import { staysPageRoutes } from '@/modules/stays-page';

import homepageRouter from '@/modules/homepage/homepage.routes';
import { authRoutes } from '@/modules/auth/auth.routes';
import userRoutes from '@/modules/user/user.routes';

import propertyRouter from '@/modules/property/property.routes';

const router = Router();

import { env } from '@/shared/config/env';
import { emailService } from '@/services/email';

if (env.NODE_ENV === 'development') {
  router.post('/dev/test-email', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const result = await emailService.sendWelcomeEmail(email, { name: 'Test User' });
      
      if (!result.success) {
        return res.status(500).json({ success: false, message: 'Failed to send email' });
      }

      return res.status(200).json({ success: true, message: 'Test email sent successfully', data: result });
    } catch (_error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
}

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
router.use('/users', userRoutes);
router.use('/test', testRouter);
router.use('/sanity', sanityRoutes);
router.use('/about', aboutRoutes);
router.use('/partner', partnerRoutes);
router.use('/journal', journalRoutes);
router.use('/media', mediaRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/stays-page', staysPageRoutes);

export default router;