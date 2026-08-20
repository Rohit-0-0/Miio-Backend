import type { Image, Seo } from '@/types';

export interface FAQ {
  question: string;
  answer: string;
}

export interface MiioStandard {
  icon: string;
  title: string;
  description: string;
}

export interface RelatedPropertiesSettings {
  displayMode: 'AUTO' | 'MANUAL' | 'OFF';
  properties: string[]; // guestyListingIds for manual selection
}

export interface PropertyEditorialData {
  guestyListingId: string;
  description: string;
  experience: string;
  miioStandard: MiioStandard[];
  faq: FAQ[];
  featuredAmenityIds: string[];
  seo: Seo;
  relatedProperties: RelatedPropertiesSettings;
  relatedJournals?: any[];
}

export interface PropertyEditorialDocument extends PropertyEditorialData {
  _id: string;
  _type: 'propertyEditorial';
  _createdAt: string;
  _updatedAt: string;
}

// Generate the fallback when the document doesn't exist
export const DEFAULT_PROPERTY_EDITORIAL: PropertyEditorialData = {
  guestyListingId: '',
  description: '',
  experience: '',
  miioStandard: [],
  faq: [],
  featuredAmenityIds: [],
  seo: {
    title: '',
    description: '',
    keywords: [],
  },
  relatedProperties: {
    displayMode: 'AUTO',
    properties: [],
  },
  relatedJournals: [],
};
