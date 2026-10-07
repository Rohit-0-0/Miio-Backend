import { Router } from 'express';
import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/middleware';
import { emailService as klaviyoService } from '@/infrastructure/email/klaviyo';
import { env } from '@/shared/config/env';

const router = Router();

router.post('/subscribe', asyncHandler(async (req: Request, res: Response) => {
  const { email, firstName, lastName, source } = req.body;
  if (!email) {
    res.status(400).json({ success: false, error: 'Email is required' });
    return;
  }

  const listId = env.KLAVIYO_NEWSLETTER_LIST_ID;
  if (!listId) {
    console.warn('Newsletter subscription attempted but KLAVIYO_NEWSLETTER_LIST_ID is not configured');
    res.status(500).json({ success: false, error: 'Newsletter service is not configured' });
    return;
  }

  if (klaviyoService.subscribeToNewsletter) {
    const result = await klaviyoService.subscribeToNewsletter(email, listId, {
      firstName,
      lastName,
      source
    });
    if (!result.success) {
      res.status(500).json({ success: false, error: result.error || 'Failed to subscribe to newsletter' });
      return;
    }
  } else {
    res.status(500).json({ success: false, error: 'Email service does not support newsletters' });
    return;
  }

  res.json({ success: true, message: 'Successfully subscribed to newsletter' });
}));

export default router;
