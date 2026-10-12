import { guestyConfig } from '../config/guesty.config';
import { GuestyAuthService } from './guesty-auth.service';
import type { TokenStore, TokenData } from './token-store';
import { MemoryTokenStore } from './memory-token.store';
import { FileTokenStore } from './file-token.store';
import { SanityTokenStore } from './sanity-token.store';

export class TokenManager {
  private static instance: TokenManager;
  
  private store: TokenStore | SanityTokenStore;
  
  // Promise to handle deduplication of concurrent refresh requests
  private refreshPromise: Promise<string> | null = null;

  private constructor() {
    // Both development and production share SanityTokenStore!
    // Guesty has a strict limit of 5 tokens per 24 hours per clientId across all environments.
    // Sharing Sanity ensures local and production reuse the exact same token.
    this.store = new SanityTokenStore();
  }

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Retrieves a valid access token. If the current token is missing or expired
   * (within the 30-minute refresh buffer advised by Guesty), it fetches a new one. Deduplicates concurrent requests.
   */
  async getToken(): Promise<string> {
    let data: TokenData | null = null;
    
    // Support async get for SanityTokenStore
    if (this.store instanceof SanityTokenStore) {
      data = await this.store.getAsync();
    } else {
      data = this.store.get();
    }

    // Guesty best practice: refresh 30 - 60 minutes before it expires
    const refreshBuffer = 30 * 60 * 1000;
    const now = Date.now();

    if (data && data.accessToken && data.expiresAt && data.expiresAt > now + refreshBuffer) {
      console.log('[Guesty Integration] Using cached token.');
      return data.accessToken;
    }
    
    // Fallback to hardcoded token from environment (emergency bypass)
    if (process.env['FALLBACK_GUESTY_TOKEN']) {
      console.log('[Guesty Integration] Using emergency FALLBACK_GUESTY_TOKEN.');
      const emergencyData = {
        accessToken: process.env['FALLBACK_GUESTY_TOKEN'],
        expiresAt: now + (24 * 60 * 60 * 1000) // Assumed 24h
      };
      if (this.store instanceof SanityTokenStore) {
        await this.store.setAsync(emergencyData);
      } else {
        this.store.set(emergencyData);
      }
      return process.env['FALLBACK_GUESTY_TOKEN'];
    }

    // If a refresh is already in progress, wait for it instead of starting a new one
    if (this.refreshPromise) {
      console.log('[Guesty Integration] Waiting for existing token refresh promise.');
      return this.refreshPromise;
    }

    console.log('[Guesty Integration] Token expired or within 30-min refresh window.');
    this.refreshPromise = this.performRefresh(data);
    return this.refreshPromise;
  }

  private async performRefresh(existingTokenData: TokenData | null): Promise<string> {
    console.log('[Guesty Integration] Refreshing OAuth token.');
    try {
      const response = await GuestyAuthService.authenticate();
      
      const data: TokenData = {
        accessToken: response.access_token,
        expiresAt: Date.now() + (response.expires_in * 1000)
      };
      
      if (this.store instanceof SanityTokenStore) {
        await this.store.setAsync(data);
      } else {
        this.store.set(data);
      }
      console.log('[Guesty Integration] Successfully refreshed access token.');
      
      return data.accessToken;
    } catch (error) {
      console.error('[Guesty Integration] Failed to refresh access token:', error);

      // If Guesty rate-limits us (TOO_MANY_REQUESTS) or fails, fallback to existing token if still not strictly expired
      if (existingTokenData && existingTokenData.accessToken && existingTokenData.expiresAt > Date.now()) {
        console.warn('[Guesty Integration] Refresh failed; falling back to existing unexpired token.');
        return existingTokenData.accessToken;
      }

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
