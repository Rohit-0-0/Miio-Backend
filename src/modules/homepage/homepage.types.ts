import type { Image, Seo } from '@/types';

export interface SectionMetadata {
  updatedAt?: string;
  updatedBy?: string;
}

/** Sanity image ref shape used across homepage sections */
export type ImageAsset =
  | Image
  | {
      _type?: string;
      assetId?: string;
      alt?: string;
      asset?: { _ref?: string; _id?: string };
    };

export type SeoMetadata = Seo;

export interface HeroSection extends SectionMetadata {
  eyebrow?: string;
  title: string;
  subtitle: string;
  images?: ImageAsset[];
  backgroundAlt?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  overlayOpacity?: number;
  textAlignment?: 'left' | 'center' | 'right';
  heroHeight?: string;
  showScrollIndicator?: boolean;
  searchWidgetLabels?: {
    whereTo?: string;
    chooseLocation?: string;
    dates?: string;
    addDates?: string;
    guests?: string;
    addGuests?: string;
    searchButton?: string;
  };
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
  image?: ImageAsset;
  displayOrder?: number;
  ctaText?: string;
  ctaLink?: string;
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

export interface SeoSection extends SeoMetadata, SectionMetadata {
  canonicalUrl?: string;
  ogImage?: ImageAsset;
  metaRobots?: string;
}

export interface BenefitItem {
  icon?: string;
  iconImage?: ImageAsset;
  title: string;
  description: string;
}

export interface StayBenefitsSection extends SectionMetadata {
  backgroundImage?: ImageAsset;
  items: BenefitItem[];
}

export interface TestimonialItem {
  quote: string;
  author: string;
  date?: string;
  location?: string;
  source?: string;
  rating?: number;
  sourceLogo?: ImageAsset;
}

export interface TestimonialsSection extends SectionMetadata {
  items: TestimonialItem[];
}

export interface HomepageData {
  version: number;
  analytics?: unknown;
  
  hero: HeroSection;
  featuredProperties?: FeaturedPropertiesSection;
  editorialStatement?: EditorialStatementSection;
  benefits?: StayBenefitsSection;
  locations?: LocationsSection;
  trust?: TrustSection;
  testimonials?: TestimonialsSection;
  journal?: JournalSection;
  finalCta?: FinalCtaSection;
  
  seo?: SeoSection;
  footerTags?: string[];
  footerColumns?: {
    title: string;
    links: { label: string; href: string }[];
  }[];
  newsletter?: {
    heading: string;
    description?: string;
  };
}

export interface HomepageDocument extends HomepageData {
  _id: string;
  _type: string;
}
