import { guestyConfig } from '../config/guesty.config';
import type { GuestyTokenResponse } from './auth.types';
import { GuestyAuthenticationError } from '../errors';

export class GuestyAuthService {
  /**
   * Exchanges Client ID & Secret for an OAuth 2.0 Token from Guesty.
   */
  static async authenticate(): Promise<GuestyTokenResponse> {
    console.log("AUTHENTICATING WITH GUESTY");
    const { apiBaseUrl, oauthEndpoint, clientId, clientSecret, timeoutMs } = guestyConfig;

    if (!clientId || !clientSecret) {
      throw new GuestyAuthenticationError('Missing Guesty Client ID or Secret in configuration.');
    }

    const url = `${apiBaseUrl}${oauthEndpoint}`;

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'open-api',
      client_id: clientId,
      client_secret: clientSecret,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
        signal: controller.signal,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new GuestyAuthenticationError(`Guesty OAuth failed with status ${response.status}`, errorText);
      }

      const data = (await response.json()) as GuestyTokenResponse;
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new GuestyAuthenticationError('Guesty OAuth request timed out.');
      }
      if (error instanceof GuestyAuthenticationError) {
        throw error;
      }
      throw new GuestyAuthenticationError(`Unexpected error during Guesty OAuth: ${error.message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
