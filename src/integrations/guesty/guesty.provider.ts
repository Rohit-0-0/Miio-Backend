import { ListingsRepository, type GuestyReviewsQuery } from './repositories/listings.repository';
import type { GuestyListingsQuery, GuestyListingsResponse } from './dto/listing.dto';
import type { GuestyListingDetailsDto } from './dto/listing-details.dto';

/**
 * GuestyProvider serves as the generic facade for all Guesty operations.
 * It coordinates repositories and returns raw DTOs without domain-specific mapping.
 */
export class GuestyProvider {
  async getListings(query: GuestyListingsQuery): Promise<GuestyListingsResponse> {
    return ListingsRepository.getListings(query);
  }

  async getListingById(id: string): Promise<GuestyListingDetailsDto> {
    return ListingsRepository.getListingById(id);
  }

  async getReviews(query: GuestyReviewsQuery | string = {}): Promise<any> {
    // Backward compatible: string = listingId
    if (typeof query === 'string') {
      return ListingsRepository.getReviews({ listingId: query });
    }
    return ListingsRepository.getReviews(query);
  }
}