import { z } from 'zod';
import { LIFECYCLE_STATUS, PROPERTY_TYPES, SYNC_PROVIDERS, SYNC_STATUS } from './constants';

const imageSchema = z.object({
  assetId: z.string(),
  alt: z.string().optional(),
  filename: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  mimeType: z.string().optional(),
});

const amenitySchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  category: z.string().optional(),
});

const syncSchema = z.object({
  provider: z.nativeEnum(SYNC_PROVIDERS),
  status: z.nativeEnum(SYNC_STATUS),
  lastSyncedAt: z.string().optional(),
  lastError: z.string().optional(),
  version: z.string().optional(),
});

export const listPropertiesSchema = z.object({
  body: z.unknown().optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sort: z.enum(['sortOrder', 'createdAt', 'updatedAt', 'title']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    search: z.string().optional(),
    status: z.nativeEnum(LIFECYCLE_STATUS).optional(),
    propertyType: z.nativeEnum(PROPERTY_TYPES).optional(),
    featured: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
    country: z.string().optional(),
    city: z.string().optional(),
  }),
});

export const getPropertiesByIdsSchema = z.object({
  body: z.unknown().optional(),
  params: z.object({}).optional(),
  query: z.object({
    ids: z.string().min(1),
  }),
});

export const createPropertySchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({
    id: z.string().min(1),
    guestyId: z.string().optional(),
    title: z.string().min(1),
    slug: z.string().optional(),
    shortDescription: z.string().optional(),
    longDescription: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    gallery: z.array(imageSchema).optional(),
    coverImageId: z.string().optional(),
    propertyType: z.nativeEnum(PROPERTY_TYPES),
    bedrooms: z.number().min(0).optional(),
    bathrooms: z.number().min(0).optional(),
    maxGuests: z.number().min(1).optional(),
    beds: z.number().min(0).optional(),
    amenities: z.array(amenitySchema).optional(),
    minimumStay: z.number().min(1).optional(),
    maximumStay: z.number().min(1).optional(),
    petsAllowed: z.boolean().optional(),
    smokingAllowed: z.boolean().optional(),
    instantBook: z.boolean().optional(),
    lifecycleStatus: z.nativeEnum(LIFECYCLE_STATUS).default(LIFECYCLE_STATUS.DRAFT),
    featured: z.boolean().optional(),
    active: z.boolean().optional(),
    visibleOnWebsite: z.boolean().optional(),
    sortOrder: z.number().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    canonicalUrl: z.string().optional(),
    ogImage: imageSchema.optional(),
    metaRobots: z.string().optional(),
    sync: syncSchema.optional(),
  }),
});

export const updatePropertySchema = z.object({
  query: z.object({}).optional(),
  body: createPropertySchema.shape.body.partial(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export type ListPropertyQuery = z.infer<typeof listPropertiesSchema>['query'];
export type CreatePropertyInput = z.infer<typeof createPropertySchema>['body'];
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>['body'];
