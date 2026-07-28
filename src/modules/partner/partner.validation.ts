import { z } from 'zod';

const imageSchema = z.object({
  assetId: z.string(),
  alt: z.string(),
});

export const updatePartnerSchema = z.object({
  body: z.object({
    title: z.string(),
    subtitle: z.string(),
    partners: z.array(
      z.object({
        name: z.string(),
        logo: imageSchema,
        url: z.string().optional(),
      })
    ),
  }),

  query: z.object({}),
  params: z.object({}),
});

export type UpdatePartnerInput = z.infer<
  typeof updatePartnerSchema
>['body'];
