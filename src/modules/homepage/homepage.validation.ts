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
  query: z.object({}),
  params: z.object({}),
});
