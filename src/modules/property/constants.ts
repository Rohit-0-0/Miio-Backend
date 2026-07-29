export const PROPERTY_DOCUMENT = {
  TYPE: 'property',
} as const;

export const LIFECYCLE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type LifecycleStatus = typeof LIFECYCLE_STATUS[keyof typeof LIFECYCLE_STATUS];

export const PROPERTY_TYPES = {
  APARTMENT: 'Apartment',
  VILLA: 'Villa',
  CABIN: 'Cabin',
  HOUSE: 'House',
  STUDIO: 'Studio',
  RESORT: 'Resort',
  PENTHOUSE: 'Penthouse',
} as const;

export type PropertyType = typeof PROPERTY_TYPES[keyof typeof PROPERTY_TYPES];

export const SYNC_PROVIDERS = {
  GUESTY: 'GUESTY',
  NONE: 'NONE',
} as const;

export type SyncProvider = typeof SYNC_PROVIDERS[keyof typeof SYNC_PROVIDERS];

export const SYNC_STATUS = {
  SYNCED: 'SYNCED',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  UNLINKED: 'UNLINKED',
} as const;

export type SyncStatus = typeof SYNC_STATUS[keyof typeof SYNC_STATUS];
