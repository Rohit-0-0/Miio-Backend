import { BookingEngineClient } from '../client/booking-engine.client';

export interface GuestBreakdown {
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfInfants: number;
  numberOfPets: number;
}

export interface QuoteRequest {
  listingId: string;
  checkInDateLocalized: string;
  checkOutDateLocalized: string;
  guestsCount: number;
  numberOfGuests: GuestBreakdown;
}

export interface QuoteResponse {
  _id: string; // Quote ID
  status: string;
  listingId: string;
  checkInDateLocalized: string;
  checkOutDateLocalized: string;
  nightsCount: number;
  currency: string;
  financials: {
    revenue: {
      nightlyRate: number;
      totalNightlyRate: number;
    };
    taxes: {
      amount: number;
    };
    fees: {
      amount: number;
    };
    total: {
      amount: number;
    };
  };
}

export interface SearchListingsRequest {
  checkIn?: string | undefined;
  checkOut?: string | undefined;
  adults?: number | undefined;
  children?: number | undefined;
  infants?: number | undefined;
  pets?: number | undefined;
  city?: string | undefined;
}

export class BookingEngineService {
  /**
   * Generates a reservation quote. This also serves to check availability and pricing
   * for a specific property given dates and guest configuration.
   */
  static async createQuote(params: QuoteRequest): Promise<QuoteResponse> {
    console.log(`[Booking Engine API] Requesting quote for listing ${params.listingId}`);
    return BookingEngineClient.post<QuoteResponse>('/api/reservations/quotes', params);
  }

  /**
   * Search available properties for a date range and occupancy
   */
  static async searchListings(params: SearchListingsRequest): Promise<any> {
    const isBrowseMode = !params.checkIn || !params.checkOut;
    const mode = isBrowseMode ? 'BROWSE' : 'AVAILABILITY';
    
    console.log(`[Booking ${mode}] Incoming request`);
    console.log(`  checkIn: ${params.checkIn || 'none'}`);
    console.log(`  checkOut: ${params.checkOut || 'none'}`);
    console.log(`  adults: ${params.adults || 0}`);
    console.log(`  children: ${params.children || 0}`);
    console.log(`  infants: ${params.infants || 0}`);
    console.log(`  pets: ${params.pets || 0}`);
    
    const queryParams = new URLSearchParams();
    if (params.checkIn) queryParams.append('checkIn', params.checkIn);
    if (params.checkOut) queryParams.append('checkOut', params.checkOut);
    if (params.city) {
      queryParams.append('city', params.city);
      // Guesty requires country if city is provided
      queryParams.append('country', 'Australia');
    }
    
    // Map distinct guest counts to Guesty's minOccupancy and boolean flags
    const adults = params.adults || 1;
    const children = params.children || 0;
    const infants = params.infants || 0;
    const pets = params.pets || 0;
    
    const totalOccupancy = adults + children + infants;
    if (totalOccupancy > 0 && params.checkIn && params.checkOut) {
      queryParams.append('minOccupancy', totalOccupancy.toString());
      if (pets > 0) queryParams.append('petsAllowed', 'true');
      if (children > 0) queryParams.append('suitableForChildren', 'true');
      if (infants > 0) queryParams.append('suitableForInfants', 'true');
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/listings?${queryString}` : '/api/listings';
    
    console.log(`[Booking ${mode}] Calling Guesty`);
    console.log(`  method: GET`);
    console.log(`  endpoint: /api/listings`);
    console.log(`  query: ${queryString}`);
    
    const startTime = Date.now();
    try {
      const response = await BookingEngineClient.get<any>(endpoint);
      const responseTime = Date.now() - startTime;
      
      const listings = response.results || response.data || [];
      const listingIds = listings.map((l: any) => l._id || l.id);
      
      console.log(`[Booking ${mode}] Guesty response`);
      console.log(`  status: 200`);
      console.log(`  responseTime: ${responseTime}ms`);
      console.log(`  listingCount: ${listings.length}`);
      console.log(`  listingIds: ${JSON.stringify(listingIds)}`);
      
      if (listings.length > 0) {
        const samplePrices = listings[0].prices || {};
        const priceKeys = Object.keys(samplePrices);
        console.log(`  pricing fields returned (sample): ${JSON.stringify(priceKeys)}`);
      }
      
      return listings;
    } catch (error: any) {
      console.log(`[Booking ${mode}] Guesty API error occurred.`);
      // If error is an AppError from BookingEngineClient, it has statusCode and code.
      console.log(`  status: ${error.statusCode || 500}`);
      console.log(`  Guesty error code: ${error.code || 'UNKNOWN'}`);
      console.log(`  Guesty message: ${error.message || 'No message provided'}`);
      
      // Request ID might be inside error.details if populated by the client
      const reqId = error.details?.data?.requestId || error.details?.requestId || 'UNKNOWN';
      console.log(`  Guesty request ID: ${reqId}`);
      
      throw error;
    }
  }
}
