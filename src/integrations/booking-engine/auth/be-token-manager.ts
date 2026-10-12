import { BookingEngineAuthService } from './booking-engine-auth.service';
import type { TokenStore, TokenData } from './token-store';
import { SanityBeTokenStore } from './sanity-be-token.store';

export class BeTokenManager {
  private static instance: BeTokenManager;
  
  private store: SanityBeTokenStore;
  
  // Promise to handle deduplication of concurrent refresh requests
  private refreshPromise: Promise<string> | null = null;

  private constructor() {
    this.store = new SanityBeTokenStore();
  }

  static getInstance(): BeTokenManager {
    if (!BeTokenManager.instance) {
      BeTokenManager.instance = new BeTokenManager();
    }
    return BeTokenManager.instance;
  }

  /**
   * Retrieves a valid access token. If the current token is missing or expired
   * (within the 30-minute refresh buffer), it fetches a new one. Deduplicates concurrent requests.
   */
  async getToken(): Promise<string> {
    const data = await this.store.getAsync();

    // Check if token is present and hasn't expired (using 30-minute buffer)
    const thirtyMinutes = 30 * 60 * 1000;
    const now = Date.now();

    if (data && data.accessToken && data.expiresAt && data.expiresAt > now + thirtyMinutes) {
      console.log('[Booking Engine API] Using cached token from Sanity / memory.');
      return data.accessToken;
    }

    // If a refresh is already in progress, wait for it instead of starting a new one
    if (this.refreshPromise) {
      console.log('[Booking Engine API] Waiting for existing token refresh promise.');
      return this.refreshPromise;
    }

    console.log('[Booking Engine API] Token expired or missing, attempting refresh.');
    this.refreshPromise = this.performRefresh(data);
    return this.refreshPromise;
  }

  private async performRefresh(existingData: TokenData | null): Promise<string> {
    console.log('[Booking Engine API] Refreshing OAuth token.');
    try {
      const response = await BookingEngineAuthService.authenticate();
      
      const data: TokenData = {
        accessToken: response.access_token,
        expiresAt: Date.now() + (response.expires_in * 1000)
      };
      
      await this.store.setAsync(data);
      console.log('[Booking Engine API] Successfully refreshed access token.');
      
      return data.accessToken;
    } catch (error) {
      console.error('[Booking Engine API] Failed to refresh access token:', error);
      
      // Fallback: If refresh fails (e.g. rate limit), use existing token if not yet hard-expired
      if (existingData && existingData.accessToken && existingData.expiresAt > Date.now()) {
        console.warn('[Booking Engine API] Refresh failed, falling back to existing unexpired token.');
        return existingData.accessToken;
      }
      
      throw error;
    } finally {
      // Clear the promise so subsequent requests know the refresh is done
      this.refreshPromise = null;
    }
  }

  /**
   * Invalidates the current in-memory token cache.
   */
  invalidateToken(): void {
    console.log('[Booking Engine API] Token cache invalidated.');
    this.store.clear();
  }
}
