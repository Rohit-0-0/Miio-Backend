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

router.post('/reservations', asyncHandler(async (req: Request, res: Response) => {
  const { quoteId, guest, ratePlanId } = req.body;
  const reservation = await BookingEngineService.createReservation(quoteId, guest, ratePlanId);
  res.json({ success: true, data: reservation });
}));

export default router;
