import { z } from 'zod';

export const testSchema = z.object({
  body: z.object({
    name: z.string().min(3),
  }),
  query: z.object({}),
  params: z.object({}),
});