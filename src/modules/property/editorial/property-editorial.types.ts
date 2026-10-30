import type { Image, Seo } from '@/types';

export interface FAQ {
  question: string;
  answer: string;
}

export type HouseRuleCategory = 'checkInOut' | 'duringStay' | 'beforeYouLeave' | 'safety' | 'additional';

export interface HouseRule {
  category: HouseRuleCategory;
  rule: string;
  details?: string;
  icon?: string;
}

export interface HouseRulesGroup {
  _id: string;
  title?: string;
  intro?: string;
  rules?: HouseRule[];
}

export interface CancellationTier {
  title: string;
  timeframe?: string;
  details?: string;
}

export interface CancellationPolicy {
  title: string;
  summary?: string;
  intro?: string;
  tiers: CancellationTier[];
  details?: unknown[];
}

export interface CancellationPolicyDocument extends Partial<CancellationPolicy> {
  _id: string;
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
  subtitle?: string;
  shortDescription?: string;
  description: string;
  experience: string;
  miioStandard: MiioStandard[];
  faq: FAQ[];
  houseRules: HouseRule[];
  houseRulesIntro?: string;
  cancellationPolicy: CancellationPolicy | null;
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
  houseRules: [],
  cancellationPolicy: null,
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
