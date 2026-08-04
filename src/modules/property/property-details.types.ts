import type { Image } from '@/types';
import type { Amenity } from './property.types';

export interface PropertyDetails {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | undefined;
  longDescription?: string | undefined;
  location: {
    city: string;
    state: string;
    country: string;
  };
  gallery: Image[];
  coverImageId?: string | undefined;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  beds: number;
  amenities: Amenity[];
  
  // Future fields for the Editorial merge
  editorial?: any;
  lifecycleStatus?: string;
  visibleOnWebsite?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}
