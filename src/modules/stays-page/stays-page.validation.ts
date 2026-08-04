import { z } from 'zod';
const imageSchema = z.object({
  assetId: z.string(),
  alt: z.string().optional(),
  filename: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  mimeType: z.string().optional(),
});

const seoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().optional(),
  ogImage: imageSchema.optional(),
  metaRobots: z.string().optional(),
});

export const updateGeneralSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  introText: z.string().min(1, 'Intro text is required'),
});

export const updateFiltersSchema = z.object({
  showLocationFilter: z.boolean(),
  showGuestsFilter: z.boolean(),
  showPriceFilter: z.boolean(),
  enableMapButton: z.boolean(),
  defaultSort: z.enum(['newest', 'price_asc', 'price_desc', 'recommended']),
});

export const updateEmptyStateSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  description: z.string().min(1, 'Description is required'),
  ctaText: z.string().min(1, 'CTA Text is required'),
  ctaLink: z.string().min(1, 'CTA Link is required'),
  image: imageSchema.optional(),
});

export const updateSeoSchema = seoSchema;
