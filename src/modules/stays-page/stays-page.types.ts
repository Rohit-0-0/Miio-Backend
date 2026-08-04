import type { Image, Seo } from '@/types';

export interface SectionMetadata {
  updatedAt?: string;
  updatedBy?: string;
}

export interface GeneralSettings extends SectionMetadata {
  heading: string;
  introText: string;
}

export interface FilterConfiguration extends SectionMetadata {
  showLocationFilter: boolean;
  showGuestsFilter: boolean;
  showPriceFilter: boolean;
  enableMapButton: boolean;
  defaultSort: 'newest' | 'price_asc' | 'price_desc' | 'recommended';
}

export interface EmptyStateSettings extends SectionMetadata {
  heading: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  image?: Image;
}

export interface SeoSettings extends Seo, SectionMetadata {}

export interface StaysPageData {
  version: number;
  general: GeneralSettings;
  filters: FilterConfiguration;
  emptyState: EmptyStateSettings;
  seo?: SeoSettings;
}

export interface StaysPageDocument extends StaysPageData {
  _id: string;
  _type: string;
}
