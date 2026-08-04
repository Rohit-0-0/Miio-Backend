export const guestyConfig = {
  apiBaseUrl: process.env['GUESTY_API_BASE_URL'] || 'https://open-api.guesty.com',
  oauthEndpoint: '/oauth2/token',
  clientId: process.env['GUESTY_CLIENT_ID'] || '',
  clientSecret: process.env['GUESTY_CLIENT_SECRET'] || '',
  // Refresh buffer in milliseconds (5 minutes)
  refreshBufferMs: 5 * 60 * 1000,
  // Request timeout in milliseconds (10 seconds)
  timeoutMs: 10000,
};
