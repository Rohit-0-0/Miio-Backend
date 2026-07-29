import type { Image, Seo } from '@/types';

export interface HeroSection {
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

export interface HomepageData {
  hero: HeroSection;
  // placeholders for future sections
  featuredProperties?: unknown;
  whyMiio?: unknown;
  experiences?: unknown;
  testimonials?: unknown;
  faq?: unknown;
  newsletter?: unknown;
  seo?: Seo;
}

export interface HomepageDocument extends HomepageData {
  _id: string;
  _type: string;
}
