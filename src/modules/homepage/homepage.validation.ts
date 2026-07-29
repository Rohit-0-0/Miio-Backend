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
    backgroundImage: imageSchema,
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

export const patchWhyMiioSchema = z.object({
  body: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    content: z.string(),
    image: imageSchema.optional(),
    ctaLabel: z.string().optional(),
    ctaLink: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const patchExperiencesSchema = z.object({
  body: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    items: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      icon: imageSchema.optional(),
    })),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const patchTestimonialsSchema = z.object({
  body: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    items: z.array(z.object({
      id: z.string(),
      customerName: z.string(),
      location: z.string().optional(),
      testimonial: z.string(),
      rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
      avatar: imageSchema.optional(),
    })),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const patchFaqSchema = z.object({
  body: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    items: z.array(z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
    })),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const patchNewsletterSchema = z.object({
  body: z.object({
    heading: z.string(),
    description: z.string(),
    ctaText: z.string(),
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
