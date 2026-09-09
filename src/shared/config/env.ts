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
  
  // Email is optional in development so local API can boot without Resend
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email("EMAIL_FROM must be a valid email").optional(),
  EMAIL_FROM_NAME: z.string().optional(),
  APP_URL: z.string().url("APP_URL must be a valid URL"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables');
  console.error(parsed.error.format());

  process.exit(1);
}

if (parsed.data.NODE_ENV === 'production') {
  const missingEmail: string[] = [];
  if (!parsed.data.RESEND_API_KEY) missingEmail.push('RESEND_API_KEY');
  if (!parsed.data.EMAIL_FROM) missingEmail.push('EMAIL_FROM');
  if (!parsed.data.EMAIL_FROM_NAME) missingEmail.push('EMAIL_FROM_NAME');
  if (missingEmail.length > 0) {
    console.error('❌ Invalid environment variables');
    console.error(`Missing required email config in production: ${missingEmail.join(', ')}`);
    process.exit(1);
  }
}

export const env = parsed.data;
