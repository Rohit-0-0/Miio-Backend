import { z } from 'zod';
const imageSchema = z.object({
  assetId: z.string(),
  alt: z.string(),
});

const ctaSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const sectionSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const valueSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string(),
});

export const updateAboutSchema = z.object({
  body: z.object({
    hero: z.object({
      title: z.string(),
      subtitle: z.string(),
      backgroundImage: imageSchema,
      cta: ctaSchema,
    }),

    story: z.object({
      title: z.string(),
      content: z.string(),
      image: imageSchema,
    }),

    mission: sectionSchema,

    vision: sectionSchema,

    values: z.array(valueSchema),

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