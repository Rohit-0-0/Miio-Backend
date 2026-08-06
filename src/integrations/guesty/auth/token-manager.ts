import { guestyConfig } from '../config/guesty.config';
import { GuestyAuthService } from './guesty-auth.service';
import type { TokenStore, TokenData } from './token-store';
import { MemoryTokenStore } from './memory-token.store';
import { FileTokenStore } from './file-token.store';

export class TokenManager {
  private static instance: TokenManager;
  
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

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
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
      console.log('[Guesty Integration] Using cached token.', data.accessToken);
      return data.accessToken;
    }

    // If a refresh is already in progress, wait for it instead of starting a new one
    if (this.refreshPromise) {
      console.log('[Guesty Integration] Waiting for existing token refresh promise.');
      return this.refreshPromise;
    }

    console.log('[Guesty Integration] Token expired or missing.');
    this.refreshPromise = this.performRefresh();
    return this.refreshPromise;
  }

  private async performRefresh(): Promise<string> {
    console.log('[Guesty Integration] Refreshing OAuth token.');
    try {
      const response = await GuestyAuthService.authenticate();
      
      const data: TokenData = {
        accessToken: response.access_token,
        expiresAt: Date.now() + (response.expires_in * 1000)
      };
      
      this.store.set(data);
      console.log('[Guesty Integration] Successfully refreshed access token.');
      
      return data.accessToken;
    } catch (error) {
      console.error('[Guesty Integration] Failed to refresh access token:', error);
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
    console.log('[Guesty Integration] Token invalidated.');
    this.store.clear();
  }
}
