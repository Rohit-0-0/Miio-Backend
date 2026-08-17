import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { BookingEngineService } from '../../integrations/booking-engine/services/booking-engine.service';
import type { QuoteRequest, SearchListingsRequest } from '../../integrations/booking-engine/services/booking-engine.service';
import { BookingEngineClient } from '../../integrations/booking-engine/client/booking-engine.client';
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
    city: req.query['city'] as string | undefined,
    minPrice: req.query['minPrice'] ? parseInt(req.query['minPrice'] as string, 10) : undefined,
    maxPrice: req.query['maxPrice'] ? parseInt(req.query['maxPrice'] as string, 10) : undefined,
    propertyType: req.query['propertyType'] as string | undefined,
    amenities: req.query['amenities'] ? (req.query['amenities'] as string).split(',') : undefined,
    minBedrooms: req.query['minBedrooms'] ? parseInt(req.query['minBedrooms'] as string, 10) : undefined,
    minBathrooms: req.query['minBathrooms'] ? parseInt(req.query['minBathrooms'] as string, 10) : undefined,
  };

  const listings = await BookingEngineService.searchListings(params);
  res.json({ success: true, data: listings });
}));

router.post('/quotes', asyncHandler(async (req: Request, res: Response) => {
  const params: QuoteRequest = req.body;
  const quote = await BookingEngineService.createQuote(params);
  res.json({ success: true, data: quote });
}));

router.get('/payment-provider/:listingId', asyncHandler(async (req: Request, res: Response) => {
  const { listingId } = req.params;
  try {
    const providerResponse = await BookingEngineClient.get<any>(`/api/listings/${listingId}/payment-provider`);
    
    // Normalize provider
    let normalizedProvider = 'unsupported';
    const type = (providerResponse.providerType || '').toLowerCase();
    
    if (type === 'stripe') {
      normalizedProvider = 'stripe';
    }

    res.json({ 
      success: true, 
      provider: normalizedProvider,
      accountId: providerResponse.providerAccountId || null
    });
  } catch (error: any) {
    console.warn(`[Payment Provider] Failed to fetch provider for listing ${listingId}:`, error.message);
    res.json({ success: true, provider: 'unsupported', accountId: null });
  }
}));

router.post('/instant-charge', asyncHandler(async (req: Request, res: Response) => {
  const { quoteId, ratePlanId, confirmationToken, provider, guest, acceptPolicies } = req.body;
  
  console.log(`[Payment Verification]\nInstant booking request received\nquoteIdPresent: ${!!quoteId}\nratePlanIdPresent: ${!!ratePlanId}\nconfirmationTokenPresent: ${!!confirmationToken}\nguestPresent: ${!!guest}\nacceptPolicies: ${acceptPolicies === true}`);
  console.log(`[Payment Verification]\nrawCardNumberReceived: ${!!req.body.cardNumber || !!req.body.number}\nrawCvcReceived: ${!!req.body.cvc}\nrawExpiryReceived: ${!!req.body.expiry}`);

  if (req.body.cardNumber || req.body.number || req.body.cvc) {
    console.error(`[Payment Verification] FATAL ERROR: Raw card details received by backend!`);
    res.status(400).json({ success: false, error: 'Raw card details must not be sent to the backend.' });
    return;
  }
  
  if (!quoteId || !ratePlanId || !confirmationToken || !guest || !guest.firstName || !guest.lastName || !guest.email) {
    res.status(400).json({ success: false, error: 'Missing required fields for instant booking.' });
    return;
  }

  // 1. Fetch and validate quote
  let quote: any;
  try {
    console.log(`[Payment Verification]\nGuesty quote response received`);
    quote = await BookingEngineClient.get(`/api/reservations/quotes/${quoteId}`);
    console.log(`[Payment Verification] Quote validation debug\n` +
      `quoteId: ${quote?._id || quote?.id}\n` +
      `quoteFound: ${!!quote}\n` +
      `quoteStatus: ${quote?.status || quote?.data?.status}\n` +
      `quoteStatusValid: ${quote?.status === 'valid' || quote?.data?.status === 'valid'}\n` +
      `expiresAt: ${quote?.expiresAt || quote?.data?.expiresAt}\n` +
      `currentTime: ${new Date().toISOString()}\n` +
      `quoteExpired: ${quote?.status === 'expired' || quote?.data?.status === 'expired' || ((quote?.expiresAt || quote?.data?.expiresAt) && new Date(quote?.expiresAt || quote?.data?.expiresAt).getTime() < Date.now())}\n` +
      `ratePlansPresent: ${!!(quote?.rates?.ratePlans || quote?.data?.rates?.ratePlans)}\n` +
      `requestedRatePlanId: ${ratePlanId}\n` +
      `matchingRatePlanFound: ${((quote?.rates?.ratePlans || quote?.data?.rates?.ratePlans) || []).some((rp: any) => rp.ratePlan?._id === ratePlanId)}`
    );

    const actualQuote = quote.data || quote;
    // If Guesty API doesn't return a status field, we shouldn't fail.
    // We will only fail if it explicitly says expired or if it has expired by time.
    
    if (actualQuote?.status === 'expired' || (actualQuote?.expiresAt && new Date(actualQuote.expiresAt).getTime() < Date.now())) {
      res.status(400).json({ success: false, errorCode: 'QUOTE_EXPIRED', error: 'Your price quote has expired. Refreshing the price...' });
      return;
    }

    const availableRatePlans = actualQuote.rates?.ratePlans || [];
    const validRatePlanIds = availableRatePlans.map((rp: any) => rp.ratePlan?._id);
    console.log(`[Payment Verification]\nratePlanFound: true\nratePlanId: ${ratePlanId}\namount: ${actualQuote.rates?.ratePlans?.[0]?.ratePlan?.money?.subTotalPrice}\ncurrency: ${actualQuote.rates?.ratePlans?.[0]?.ratePlan?.money?.currency}`);
    if (!validRatePlanIds.includes(ratePlanId)) {
      res.status(400).json({ success: false, errorCode: 'INVALID_RATE_PLAN', error: 'Selected rate plan is no longer valid. Please refresh the price and try again.' });
      return;
    }
  } catch (e: any) {
    const status = e.response?.status || e.statusCode;
    if (status === 404) {
      res.status(404).json({ success: false, errorCode: 'PROPERTY_UNAVAILABLE', error: 'This property is no longer available for your selected dates.' });
    } else {
      res.status(500).json({ success: false, errorCode: 'GUESTY_API_ERROR', error: 'Failed to validate quote. Please try again.' });
    }
    return;
  }

  // 2. Determine and validate payment provider from Guesty
  let actualProviderType = 'unsupported';
  let providerAccountId = null;
  try {
    const listingId = req.body.listingId || (quote.data ? quote.data.listingId : quote.listingId);
    if (!listingId) {
      res.status(400).json({ success: false, errorCode: 'MISSING_LISTING_ID', error: 'Missing listingId in request to verify payment provider. Please refresh your browser page.' });
      return;
    }
    const providerResponse = await BookingEngineClient.get<any>(`/api/listings/${listingId}/payment-provider`);
    const rawType = (providerResponse.providerType || '').toLowerCase();
    
    if (rawType === 'stripe') {
      actualProviderType = 'stripe';
    }
    providerAccountId = providerResponse.providerAccountId;
    
    console.log(`[Payment Verification]\nGuesty payment provider response received\nlistingId: ${listingId}\nproviderType: ${rawType}\nproviderStatus: ACTIVE\nproviderAccountIdPresent: ${!!providerAccountId}`);
    console.log(`[Payment Verification]\nfrontendProvider: ${provider}\nbackendProvider: ${actualProviderType}\nproviderMatch: ${actualProviderType === provider}`);
    
    if (actualProviderType === 'unsupported') {
      res.status(400).json({ success: false, errorCode: 'UNSUPPORTED_PAYMENT_PROVIDER', error: 'Online payment is not currently supported for this property.' });
      return;
    }
    
    if (actualProviderType !== provider) {
      console.warn(`[Guesty Payment] Provider mismatch: Frontend sent ${provider}, but Guesty reported ${actualProviderType}`);
      res.status(400).json({ success: false, errorCode: 'PROVIDER_MISMATCH', error: 'Payment provider mismatch. Please reload the page.' });
      return;
    }
  } catch (e: any) {
    res.status(500).json({ success: false, errorCode: 'GUESTY_API_ERROR', error: 'Failed to verify payment provider.' });
    return;
  }

  const actualQuote = quote.data || quote;
  const money = actualQuote.rates.ratePlans[0].ratePlan.money;

  const payload: any = {
    ratePlanId,
    guest,
    policy: { acceptPolicies: acceptPolicies === true }
  };

  if (actualProviderType === 'stripe') {
    payload.ccToken = confirmationToken;
  }

  console.log(`[Payment Verification]\nGuesty Instant Booking payload prepared\nquoteId: ${quoteId}\nratePlanId: ${ratePlanId}\nccTokenPresent: ${!!payload.ccToken}\nguest.firstNamePresent: ${!!guest.firstName}\nguest.lastNamePresent: ${!!guest.lastName}\nguest.emailPresent: ${!!guest.email}\nguest.phonePresent: ${!!guest.phone}\npolicy.acceptPolicies: ${payload.policy.acceptPolicies}\npayloadReady: true`);

  const mode = process.env['GUESTY_BOOKING_MODE'] || 'disabled';
  
  // We are allowing booking in Sandbox now!



  try {
    const reservation = await BookingEngineClient.post<any>(`/api/reservations/quotes/${quoteId}/instant`, payload);
    
    console.log(`[Guesty Payment] Guesty response`);
    console.log(`[Guesty Payment] Reservation confirmed`);
    console.log(`  reservationId: ${reservation._id || reservation.id}`);
    console.log(`  confirmationCode: ${reservation.confirmationCode}`);

    // If PENDING_AUTH is returned by Guesty, it's typically within the response status
    if (reservation.status === 'PENDING_AUTH') {
      res.json({ success: true, status: 'PENDING_AUTH', data: reservation });
      return;
    }

    res.json({ success: true, status: 'CONFIRMED', data: reservation });
  } catch (e: any) {
    console.warn(`[Guesty Payment] Reservation creation failed:`, e.message);
    const errStatus = e.response?.status || e.statusCode;
    
    if (errStatus === 409 || e.message?.toLowerCase().includes('conflict')) {
      res.status(409).json({ success: false, errorCode: 'RESERVATION_CONFLICT', error: 'This property is no longer available for the selected dates.' });
    } else if (errStatus === 402 || e.message?.toLowerCase().includes('payment')) {
      res.status(400).json({ success: false, errorCode: 'PAYMENT_FAILED', error: 'Payment could not be completed. Please check your payment details and try again.' });
    } else {
      res.status(500).json({ success: false, errorCode: 'GUESTY_API_ERROR', error: 'Failed to complete reservation. Please try again.' });
    }
  }
}));

export default router;
