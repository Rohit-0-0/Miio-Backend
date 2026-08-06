import { GuestyClient } from '../client/guesty.client';
import type { GuestyListingsQuery, GuestyListingsResponse } from '../dto/listing.dto';
import type { GuestyListingDetailsDto } from '../dto/listing-details.dto';

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
   * This is a temporary method for verification and will be expanded later.
   */
  static async verifyAuthentication(): Promise<any> {
    console.log('[ListingsRepository] Verifying Guesty authentication via GET /v1/listings?limit=1');
    return GuestyClient.get<any>('/v1/listings?limit=1');
  }
}
