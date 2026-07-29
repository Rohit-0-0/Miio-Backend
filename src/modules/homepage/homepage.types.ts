import type { Image, Seo } from '@/types';

export interface SectionMetadata {
  updatedAt?: string;
  updatedBy?: string;
}

export interface HeroSection extends SectionMetadata {
  eyebrow?: string;
  title: string;
  subtitle: string;
  backgroundImage: Image;
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
  ctaLink?: string;
  maxProperties?: number;
  displayMode: FeaturedPropertiesMode;
  manualSelection?: string[]; // Array of property IDs
  collectionId?: string; // For future
}

export interface WhyMiioSection extends SectionMetadata {
  title: string;
  subtitle?: string;
  content: string; // rich text, starting as simple textarea
  image?: Image;
  ctaLabel?: string;
  ctaLink?: string;
}

export interface ExperienceCard {
  id: string;
  title: string;
  description: string;
  icon?: Image;
}

export interface ExperiencesSection extends SectionMetadata {
  title: string;
  subtitle?: string;
  items: ExperienceCard[];
}

export interface TestimonialItem {
  id: string;
  customerName: string;
  location?: string;
  testimonial: string;
  rating: 1 | 2 | 3 | 4 | 5;
  avatar?: Image;
}

export interface TestimonialsSection extends SectionMetadata {
  title: string;
  subtitle?: string;
  items: TestimonialItem[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSection extends SectionMetadata {
  title: string;
  subtitle?: string;
  items: FaqItem[];
}

export interface NewsletterSection extends SectionMetadata {
  heading: string;
  description: string;
  ctaText: string;
}

export interface SeoSection extends Seo, SectionMetadata {}

export interface HomepageData {
  version: number;
  analytics?: unknown;
  
  hero: HeroSection;
  featuredProperties?: FeaturedPropertiesSection;
  whyMiio?: WhyMiioSection;
  experiences?: ExperiencesSection;
  testimonials?: TestimonialsSection;
  faq?: FaqSection;
  newsletter?: NewsletterSection;
  seo?: SeoSection;
}

export interface HomepageDocument extends HomepageData {
  _id: string;
  _type: string;
}
