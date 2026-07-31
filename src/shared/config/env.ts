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
  
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_FROM: z.string().email("EMAIL_FROM must be a valid email"),
  EMAIL_FROM_NAME: z.string().min(1, "EMAIL_FROM_NAME is required"),
  APP_URL: z.string().url("APP_URL must be a valid URL"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables');
  console.error(parsed.error.format());

  process.exit(1);
}

export const env = parsed.data;
