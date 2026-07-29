import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().positive(),

  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().url().optional(),
  
  JWT_ACCESS_SECRET: z.string().min(1).default("secret"),
  JWT_REFRESH_SECRET: z.string().min(1).default("refresh_secret"),
  
  KLAVIYO_API_KEY: z.string().optional(),

  SANITY_PROJECT_ID: z.string().min(1),
  SANITY_DATASET: z.string().default("production"),
  SANITY_API_VERSION: z.string().default("2025-01-01"),
  SANITY_TOKEN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables');
  console.error(parsed.error.format());

  process.exit(1);
}

export const env = parsed.data;
