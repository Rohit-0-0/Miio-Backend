import { ListingsRepository } from './repositories/listings.repository';
import type { GuestyListingsQuery, GuestyListingsResponse } from './dto/listing.dto';

/**
 * GuestyProvider serves as the generic facade for all Guesty operations.
 * It coordinates repositories and returns raw DTOs without domain-specific mapping.
 */
export class GuestyProvider {
  async getListings(query: GuestyListingsQuery): Promise<GuestyListingsResponse> {
    return ListingsRepository.getListings(query);
  }
}
