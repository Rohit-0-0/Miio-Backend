import { z } from 'zod';

export const listReviewsQuerySchema = z.object({
  body: z.unknown().optional(),
  params: z.object({}),
  query: z.object({
    listingId: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    skip: z.coerce.number().int().min(0).optional().default(0),
  }),
});

export const updateFeaturedReviewsSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        reviewId: z.string().min(1),
        listingId: z.string().optional().default(''),
        _key: z.string().optional(),
      })
    ),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const toggleFeaturedReviewSchema = z.object({
  body: z.object({
    reviewId: z.string().min(1),
    listingId: z.string().optional().default(''),
    featured: z.boolean(),
  }),
  query: z.object({}),
  params: z.object({}),
});