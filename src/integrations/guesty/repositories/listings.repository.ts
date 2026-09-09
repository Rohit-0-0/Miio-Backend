import { GuestyClient } from '../client/guesty.client';
import type { GuestyListingsQuery, GuestyListingsResponse } from '../dto/listing.dto';
import type { GuestyListingDetailsDto } from '../dto/listing-details.dto';

export type GuestyReviewsQuery = {
  listingId?: string;
  limit?: number;
  skip?: number;
  includeCustomChannels?: boolean;
};

export class ListingsRepository {
  /**
   * Retrieves paginated listings from Guesty
   */
  static async getListings(query: GuestyListingsQuery = {}): Promise<GuestyListingsResponse> {
    const params = new URLSearchParams();
    if (query.limit !== undefined) params.append('limit', query.limit.toString());
    if (query.skip !== undefined) params.append('skip', query.skip.toString());
    
    if (query.availability) {
      params.append('available', JSON.stringify(query.availability));
    }
    
    if (query.city) {
      params.append('city', query.city);
    }

    const queryString = params.toString();
    const endpoint = `/v1/listings${queryString ? `?${queryString}` : ''}`;
    
    return GuestyClient.get<GuestyListingsResponse>(endpoint);
  }

  /**
   * Retrieves a single listing from Guesty by ID
   */
  static async getListingById(id: string): Promise<GuestyListingDetailsDto> {
    return GuestyClient.get<GuestyListingDetailsDto>(`/v1/listings/${id}`);
  }

  /**
   * Fetches a lightweight response of listings to verify the authentication layer works.
   */
  static async verifyAuthentication(): Promise<any> {
    console.log('[ListingsRepository] Verifying Guesty authentication via GET /v1/listings?limit=1');
    return GuestyClient.get<any>('/v1/listings?limit=1');
  }

  /**
   * Retrieves reviews from Guesty.
   * listingId is optional — omit to fetch across all listings.
   * Supports limit/skip pagination (Guesty max limit typically 100).
   */
  static async getReviews(query: GuestyReviewsQuery = {}): Promise<any> {
    const params = new URLSearchParams();
    if (query.listingId) params.append('listingId', query.listingId);
    params.append('includeCustomChannels', String(query.includeCustomChannels ?? false));
    if (query.limit !== undefined) params.append('limit', String(Math.min(Math.max(query.limit, 1), 100)));
    if (query.skip !== undefined) params.append('skip', String(Math.max(query.skip, 0)));

    const queryString = params.toString();
    return GuestyClient.get<any>(`/v1/reviews?${queryString}`);
  }
}