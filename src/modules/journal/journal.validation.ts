import { z } from 'zod';

const imageSchema = z.object({
  assetId: z.string(),
  alt: z.string(),
});

const seoSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
});

export const journalStatusSchema = z.enum(['draft', 'published', 'archived']);

export const createJournalSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    excerpt: z.string().optional(),
    content: z.string().min(1, 'Content is required'),
    coverImage: imageSchema.optional(),
    author: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: journalStatusSchema,
    featured: z.boolean().optional(),
    publishedAt: z.string().datetime().optional(),
    seo: seoSchema.optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const updateJournalSchema = z.object({
  body: createJournalSchema.shape.body.partial(),
  query: z.object({}),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listJournalSchema = z.object({
  body: z.unknown().optional(),
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    status: journalStatusSchema.optional(),
    featured: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
    author: z.string().optional(),
    sort: z.enum(['publishedAt', 'createdAt', 'updatedAt', 'title']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
  params: z.object({}),
});

export const slugParamSchema = z.object({
  body: z.unknown().optional(),
  query: z.object({}),
  params: z.object({
    slug: z.string().min(1),
  }),
});

export const idParamSchema = z.object({
  body: z.unknown().optional(),
  query: z.object({}),
  params: z.object({
    id: z.string().min(1),
  }),
});

export type CreateJournalInput = z.infer<typeof createJournalSchema>['body'];
export type UpdateJournalInput = z.infer<typeof updateJournalSchema>['body'];
export type ListJournalQuery = z.infer<typeof listJournalSchema>['query'];
