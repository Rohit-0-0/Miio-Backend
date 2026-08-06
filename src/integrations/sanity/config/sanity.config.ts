export const sanityConfig = {
  projectId: process.env['SANITY_PROJECT_ID'] || 'jvblp287',
  dataset: process.env['SANITY_DATASET'] || 'development',
  apiVersion: process.env['SANITY_API_VERSION'] || '2025-01-01',
  token: process.env['SANITY_TOKEN'] || '',
  useCdn: false, // Disabled to ensure immediate editorial updates
};
