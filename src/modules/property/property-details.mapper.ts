import type { GuestyListingDetailsDto } from '@/integrations/guesty/dto/listing-details.dto';
import type { PropertyDetails } from './property-details.types';
import type { Image } from '@/types';
import { generateBaseSlug } from '@/shared/utils';
import { GUESTY_CONSTANTS } from '@/integrations/guesty';
import type { Amenity } from './property.types';

export class PropertyDetailsMapper {
  static toPropertyDetails(dto: GuestyListingDetailsDto): PropertyDetails {
    const gallery: Image[] = (dto.pictures || []).map(pic => ({
      assetId: pic.original || GUESTY_CONSTANTS.DEFAULT_IMAGE_URL,
      alt: pic.caption || dto.title || 'Property image',
      caption: pic.caption
    }));

    const coverImageId = (gallery && gallery.length > 0) ? gallery[0]?.assetId : undefined;

    const amenities: Amenity[] = (dto.amenities || []).map(amenity => ({
      id: generateBaseSlug(amenity), // Internal ID for UI keys
      label: amenity
    }));

    // Construct a long description by combining public description parts if they exist
    const descParts = [];
    if (dto.publicDescription?.summary) descParts.push(dto.publicDescription.summary);
    if (dto.publicDescription?.space) descParts.push(dto.publicDescription.space);
    if (dto.publicDescription?.neighborhood) descParts.push(dto.publicDescription.neighborhood);
    
    const longDescription = descParts.length > 0 ? descParts.join('\n\n') : undefined;

    return {
      id: dto._id,
      title: dto.title,
      ...(dto.nickname ? { nickname: dto.nickname } : {}),
      slug: generateBaseSlug(dto.title),
      shortDescription: dto.publicDescription?.summary || undefined,
      longDescription,
      location: {
        city: dto.address?.city || '',
        state: dto.address?.state || '',
        country: dto.address?.country || '',
        ...(dto.address?.lat !== undefined ? { latitude: dto.address.lat } : {}),
        ...(dto.address?.lng !== undefined ? { longitude: dto.address.lng } : {})
      },
      gallery,
      coverImageId,
      propertyType: dto.propertyType || GUESTY_CONSTANTS.DEFAULT_PROPERTY_TYPE,
      bedrooms: dto.bedrooms || 0,
      bathrooms: dto.bathrooms || 0,
      maxGuests: dto.accommodates || 0,
      beds: dto.beds || 0,
      amenities,
      
      // Defaulting these to ensure the frontend displays the property correctly
      lifecycleStatus: 'PUBLISHED',
      visibleOnWebsite: true
    };
  }
}
