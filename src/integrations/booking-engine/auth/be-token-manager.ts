import { BookingEngineAuthService } from './booking-engine-auth.service';
import type { TokenStore, TokenData } from './token-store';
import { MemoryTokenStore } from './memory-token.store';
import { FileTokenStore } from './file-token.store';

export class BeTokenManager {
  private static instance: BeTokenManager;
  
  private store: TokenStore;
  
  // Promise to handle deduplication of concurrent refresh requests
  private refreshPromise: Promise<string> | null = null;

  private constructor() {
    // Automatically select storage based on environment
    if (process.env['NODE_ENV'] === 'development') {
      this.store = new FileTokenStore();
    } else {
      this.store = new MemoryTokenStore();
    }
  }

  static getInstance(): BeTokenManager {
    if (!BeTokenManager.instance) {
      BeTokenManager.instance = new BeTokenManager();
    }
    return BeTokenManager.instance;
  }

  /**
   * Retrieves a valid access token. If the current token is missing or expired
   * (within the refresh buffer), it fetches a new one. Deduplicates concurrent requests.
   */
  async getToken(): Promise<string> {
    const data = this.store.get();

    // Check if token is present and hasn't expired (with a 5-minute buffer)
    const fiveMinutes = 5 * 60 * 1000;
    const now = Date.now();

    if (data && data.accessToken && data.expiresAt && data.expiresAt > now + fiveMinutes) {
      console.log('[Booking Engine API] Using cached token.');
      return data.accessToken;
    }

    // If a refresh is already in progress, wait for it instead of starting a new one
    if (this.refreshPromise) {
      console.log('[Booking Engine API] Waiting for existing token refresh promise.');
      return this.refreshPromise;
    }

    console.log('[Booking Engine API] Token expired or missing.');
    this.refreshPromise = this.performRefresh();
    return this.refreshPromise;
  }

  private async performRefresh(): Promise<string> {
    console.log('[Booking Engine API] Refreshing OAuth token.');
    try {
      const response = await BookingEngineAuthService.authenticate();
      
      const data: TokenData = {
        accessToken: response.access_token,
        expiresAt: Date.now() + (response.expires_in * 1000)
      };
      
      this.store.set(data);
      console.log('[Booking Engine API] Successfully refreshed access token.');
      
      return data.accessToken;
    } catch (error) {
      console.error('[Booking Engine API] Failed to refresh access token:', error);
      throw error;
    } finally {
      // Clear the promise so subsequent requests know the refresh is done
      this.refreshPromise = null;
    }
  }

  /**
   * Invalidates the current token. Useful if an API call returns a 401/403.
   */
  invalidateToken(): void {
    console.log('[Booking Engine API] Token invalidated.');
    this.store.clear();
  }
}
