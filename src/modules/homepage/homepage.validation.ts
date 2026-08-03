import { z } from 'zod';

const imageSchema = z.object({
  assetId: z.string(),
  alt: z.string().optional(),
  filename: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  mimeType: z.string().optional(),
});

export const patchHeroSchema = z.object({
  body: z.object({
    eyebrow: z.string().optional(),
    title: z.string(),
    subtitle: z.string(),
    heroImages: z.array(imageSchema).optional(),
    backgroundImage: imageSchema.optional(),
    backgroundAlt: z.string().optional(),
    primaryCta: z.object({ label: z.string(), href: z.string() }),
    secondaryCta: z.object({ label: z.string(), href: z.string() }).optional(),
    overlayOpacity: z.number().min(0).max(1).optional(),
    textAlignment: z.enum(['left', 'center', 'right']).optional(),
    heroHeight: z.string().optional(),
    showScrollIndicator: z.boolean().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const patchFeaturedPropertiesSchema = z.object({
  body: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaLink: z.string().optional(),
    maxProperties: z.number().min(1).optional(),
    displayMode: z.enum(['MANUAL', 'FEATURED', 'LATEST', 'COLLECTION']),
    manualSelection: z.array(z.string()).optional(),
    collectionId: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const patchEditorialStatementSchema = z.object({
  body: z.object({
    heading: z.string(),
    description: z.string(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const patchLocationsSchema = z.object({
  body: z.object({
    heading: z.string(),
    items: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      image: imageSchema.optional(),
      displayOrder: z.number().optional(),
    })),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const patchTrustSchema = z.object({
  body: z.object({
    heading: z.string(),
    rating: z.string(),
    reviewCount: z.string(),
    verifiedText: z.string(),
    items: z.array(z.object({
      id: z.string(),
      title: z.string(),
      icon: z.string().optional(),
    })),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const patchJournalSchema = z.object({
  body: z.object({
    heading: z.string(),
    ctaText: z.string(),
    ctaLink: z.string(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const patchFinalCtaSchema = z.object({
  body: z.object({
    heading: z.string(),
    description: z.string().optional(),
    buttonText: z.string(),
    buttonLink: z.string(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const patchSeoSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    canonicalUrl: z.string().optional(),
    ogImage: imageSchema.optional(),
    metaRobots: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
