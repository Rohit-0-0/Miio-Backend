import { Router } from 'express';
import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/middleware';
import { emailService as klaviyoService } from '@/infrastructure/email/klaviyo';

const router = Router();

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const formData = req.body;
  if (!formData.email || !formData.firstName) {
    res.status(400).json({ success: false, error: 'Email and First Name are required' });
    return;
  }

  const result = await klaviyoService.submitInteriorDesignEnquiry(formData);
  
  if (!result.success) {
    res.status(500).json({ success: false, error: result.error || 'Failed to submit enquiry' });
    return;
  }

  res.json({ success: true });
}));

export default router;
