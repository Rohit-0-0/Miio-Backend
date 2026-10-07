import { z } from 'zod';
const imageSchema = z.object({
  assetId: z.string(),
  alt: z.string().optional(),
  filename: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  mimeType: z.string().optional(),
});

const ctaSchema = z.object({
  text: z.string(),
  href: z.string(),
  style: z.string().optional(),
});

export const updateAboutSchema = z.object({
  body: z.object({
    hero: z.object({
      title: z.string(),
      subtitle: z.string(),
    }),

    intro: z.object({
      label: z.string(),
      body: z.string(),
    }),

    story: z.object({
      label: z.string(),
      heading: z.string(),
      paragraphs: z.array(z.string()),
      founderImage: imageSchema.optional(),
    }),

    pullQuote: z.object({
      text: z.string(),
    }),

    philosophy: z.object({
      label: z.string(),
      heading: z.string(),
      paragraphs: z.array(z.string()),
    }),

    closing: z.object({
      body: z.string(),
      cta: ctaSchema,
    }),

    seo: z.object({
      title: z.string(),
      description: z.string(),
      keywords: z.array(z.string()),
    }),
  }),

  query: z.object({}),

  params: z.object({}),
});

export type UpdateAboutInput = z.infer<
  typeof updateAboutSchema
>['body'];