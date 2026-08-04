import type { GuestyListingDto } from './listing.dto';

/**
 * DTO for the single listing response from Guesty Open API (GET /v1/listings/:id)
 * It extends the base listing DTO but can include additional detailed fields 
 * that are only returned when querying a specific listing.
 */
export interface GuestyListingDetailsDto extends GuestyListingDto {
  // Add any detailed fields that are exclusively in the single listing response
  // For now, GuestyListingDto already contains publicDescription, amenities, and pictures.
}
