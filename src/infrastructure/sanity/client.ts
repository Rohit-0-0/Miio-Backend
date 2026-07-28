import { createClient, type ClientConfig } from '@sanity/client';

import { env } from '@/shared/config/env';

const config: ClientConfig = {
  projectId: env.SANITY_PROJECT_ID,
  dataset: env.SANITY_DATASET,
  apiVersion: env.SANITY_API_VERSION,
  useCdn: false,
};

if (env.SANITY_TOKEN) {
  config.token = env.SANITY_TOKEN;
}

export const sanityClient = createClient(config);