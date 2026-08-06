import type { GuestyListingDto } from '@/integrations/guesty';
import type { PropertySummary, Amenity } from './property.types';
import type { Image } from '@/types';
import { generateBaseSlug } from '@/shared/utils';
import { GUESTY_CONSTANTS } from '@/integrations/guesty';

export class PropertyMapper {
  static toPropertySummary(dto: GuestyListingDto): PropertySummary {
    const gallery: Image[] = (dto.pictures || []).map(pic => ({
      assetId: pic.original || GUESTY_CONSTANTS.DEFAULT_IMAGE_URL,
      alt: pic.caption || dto.title || 'Property image',
      caption: pic.caption
    }));

    const coverImageId = (gallery && gallery.length > 0) ? gallery[0]?.assetId : undefined;

    const amenities: Amenity[] = (dto.amenities || []).map(amenity => ({
      id: generateBaseSlug(amenity), // Just an internal ID
      label: amenity
    }));

    return {
      id: dto._id,
      title: dto.title,
      nickname: dto.nickname,
      unitType: dto.type,
      slug: generateBaseSlug(dto.title),
      shortDescription: dto.publicDescription?.summary || undefined,
      location: {
        city: dto.address?.city || '',
        state: dto.address?.state || '',
        country: dto.address?.country || ''
      },
      gallery,
      coverImageId,
      propertyType: dto.propertyType || GUESTY_CONSTANTS.DEFAULT_PROPERTY_TYPE,
      bedrooms: dto.bedrooms || 0,
      bathrooms: dto.bathrooms || 0,
      maxGuests: dto.accommodates || 0,
      beds: dto.beds || 0,
      amenities
    };
  }
}
