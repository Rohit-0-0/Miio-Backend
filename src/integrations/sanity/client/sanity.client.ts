import { createClient } from '@sanity/client';
import { sanityConfig } from '../config/sanity.config';

export const sanityClient = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  useCdn: sanityConfig.useCdn,
  apiVersion: sanityConfig.apiVersion,
  token: sanityConfig.token, // Only needed for private datasets or mutations
});
