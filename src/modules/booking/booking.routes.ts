import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { BookingEngineService } from '../../integrations/booking-engine/services/booking-engine.service';
import type { QuoteRequest, SearchListingsRequest } from '../../integrations/booking-engine/services/booking-engine.service';
import { asyncHandler } from '../../shared/middleware';

const router = Router();

router.get('/search', asyncHandler(async (req: Request, res: Response) => {
  const params: SearchListingsRequest = {
    checkIn: req.query['checkIn'] as string | undefined,
    checkOut: req.query['checkOut'] as string | undefined,
    adults: req.query['adults'] ? parseInt(req.query['adults'] as string, 10) : undefined,
    children: req.query['children'] ? parseInt(req.query['children'] as string, 10) : undefined,
    infants: req.query['infants'] ? parseInt(req.query['infants'] as string, 10) : undefined,
    pets: req.query['pets'] ? parseInt(req.query['pets'] as string, 10) : undefined,
  };

  const listings = await BookingEngineService.searchListings(params);
  res.json({ success: true, data: listings });
}));

router.post('/quotes', asyncHandler(async (req: Request, res: Response) => {
  const params: QuoteRequest = req.body;
  const quote = await BookingEngineService.createQuote(params);
  res.json({ success: true, data: quote });
}));

router.post('/instant', asyncHandler(async (req: Request, res: Response) => {
  const { quoteId, ratePlanId, paymentToken, guest } = req.body;
  
  if (!quoteId || !ratePlanId || !paymentToken || !guest || !guest.firstName || !guest.lastName || !guest.email) {
    res.status(400).json({ success: false, error: 'Missing required fields for instant booking.' });
    return;
  }

  const mode = process.env['GUESTY_BOOKING_MODE'] || 'disabled';
  
  if (mode === 'disabled') {
    // Return a mocked success response to test the UI flow without hitting Guesty
    console.log(`[Instant Booking] Sandbox mode is disabled. Intercepting request and returning mock confirmation.`);
    res.json({ 
      success: true, 
      isMocked: true,
      data: { 
        confirmationCode: 'GY-MOCK-1234',
        status: 'confirmed'
      } 
    });
    return;
  }

  const reservation = await BookingEngineService.createInstantBooking(quoteId, ratePlanId, guest, paymentToken);
  res.json({ success: true, data: reservation });
}));

export default router;
