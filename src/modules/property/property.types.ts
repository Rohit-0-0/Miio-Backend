import type { LifecycleStatus, PropertyType, SyncProvider, SyncStatus } from './constants';
import type { Image, Seo } from '@/types';
import type { PropertyEditorialData } from './editorial/property-editorial.types';

export interface Amenity {
  id: string;
  label: string;
  icon?: string;
  category?: string;
}

export interface SyncMetadata {
  provider: SyncProvider;
  status: SyncStatus;
  lastSyncedAt?: string;
  lastError?: string;
  version?: string;
}

export interface PropertyData {
  // Stable ID
  id: string;
  guestyId?: string;

  // General
  title: string;
  slug: string;
  shortDescription?: string;
  longDescription?: string;

  // Location
  location?: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    latitude: number;
    longitude: number;
    placeId?: string;
    source: 'manual';
    mapViewport?: {
      zoom?: number;
    };
  };

  // Media
  gallery?: Image[];
  coverImageId?: string;

  // Details
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  beds?: number;

  // Amenities
  amenities?: Amenity[];

  // Availability / Booking Rules
  minimumStay?: number;
  maximumStay?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  instantBook?: boolean;

  // Publishing & Visibility
  lifecycleStatus: LifecycleStatus;
  featured?: boolean;
  active?: boolean;
  visibleOnWebsite?: boolean;
  sortOrder?: number;

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImage?: Image;
  metaRobots?: string;

  // Sync
  sync?: SyncMetadata;

  // Editorial (Merged from CMS)
  editorial?: PropertyEditorialData;

  // Soft Delete
  deletedAt?: string;
}

export interface PropertyDocument extends PropertyData {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
}

/**
 * Lightweight model specifically for the Stays page list view.
 * Contains only the fields required for the PropertyBrowseCard.
 */
export interface PropertySummary {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | undefined;
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
}
