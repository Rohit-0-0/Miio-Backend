import { createClient, type ClientConfig } from '@sanity/client';

import { env } from '@/shared/config/env';

const config: ClientConfig = {
  projectId: env.SANITY_PROJECT_ID,
  dataset: env.SANITY_DATASET,
  apiVersion: env.SANITY_API_VERSION,
  useCdn: false,
};

const token = env.SANITY_TOKEN || process.env['SANITY_API_WRITE_TOKEN'] || process.env['SANITY_API_TOKEN'];
if (token) {
  config.token = token;
}

export const sanityClient = createClient(config);