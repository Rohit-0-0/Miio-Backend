import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),

  PORT: z.coerce.number().int().positive(),

  SANITY_PROJECT_ID: z.string(),

  SANITY_DATASET: z.string(),

  SANITY_API_VERSION: z.string(),

  SANITY_API_TOKEN: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables');
  console.error(parsed.error.format());

  process.exit(1);
}

export const env = parsed.data;
