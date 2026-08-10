import { bookingEngineConfig } from '../config/booking-engine.config';
import type { BookingEngineTokenResponse } from './auth.types';

export class BookingEngineAuthService {
  static async authenticate(): Promise<BookingEngineTokenResponse> {
    console.log("[Booking Engine API] Authenticating");
    const { apiBaseUrl, oauthEndpoint, clientId, clientSecret, timeoutMs } = bookingEngineConfig;

    if (!clientId || !clientSecret) {
      throw new Error('Missing Booking Engine Client ID or Secret in configuration.');
    }

    const url = `${apiBaseUrl}${oauthEndpoint}`;

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'booking_engine:api',
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
        throw new Error(`Booking Engine OAuth failed with status ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as BookingEngineTokenResponse;
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Booking Engine OAuth request timed out.');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
