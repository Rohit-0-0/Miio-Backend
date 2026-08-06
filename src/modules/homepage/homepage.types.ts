import type { Image, Seo } from '@/types';

export interface SectionMetadata {
  updatedAt?: string;
  updatedBy?: string;
}

export interface HeroSection extends SectionMetadata {
  eyebrow?: string;
  title: string;
  subtitle: string;
  images?: Image[];
  backgroundAlt?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  overlayOpacity?: number;
  textAlignment?: 'left' | 'center' | 'right';
  heroHeight?: string;
  showScrollIndicator?: boolean;
}

export type FeaturedPropertiesMode = 'MANUAL' | 'FEATURED' | 'LATEST' | 'COLLECTION';

export interface FeaturedPropertiesSection extends SectionMetadata {
  title: string;
  subtitle?: string;
  description?: string;
  ctaLabel?: string;
  ctaText?: string;
  ctaLink?: string;
  maxProperties?: number;
  placeholderPrice?: string;
  displayMode: FeaturedPropertiesMode;
  manualSelection?: string[]; // Legacy
  featuredPropertyReferences?: string[];
  collectionId?: string; // For future
}

export interface EditorialStatementSection extends SectionMetadata {
  heading: string;
  description: string;
}

export interface LocationItem {
  id: string;
  name: string;
  description: string;
  image?: Image;
  displayOrder?: number;
}

export interface LocationsSection extends SectionMetadata {
  heading: string;
  items: LocationItem[];
}

export interface TrustItem {
  id: string;
  title: string;
  icon?: string;
}

export interface TrustSection extends SectionMetadata {
  heading: string;
  rating: string;
  reviewCount: string;
  verifiedText: string;
  items: TrustItem[];
}

export interface JournalSection extends SectionMetadata {
  heading: string;
  ctaText: string;
  ctaLink: string;
}

export interface FinalCtaSection extends SectionMetadata {
  heading: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
}

export interface SeoSection extends Seo, SectionMetadata {}

export interface HomepageData {
  version: number;
  analytics?: unknown;
  
  hero: HeroSection;
  featuredProperties?: FeaturedPropertiesSection;
  editorialStatement?: EditorialStatementSection;
  locations?: LocationsSection;
  trust?: TrustSection;
  journal?: JournalSection;
  finalCta?: FinalCtaSection;
  
  seo?: SeoSection;
}

export interface HomepageDocument extends HomepageData {
  _id: string;
  _type: string;
}
