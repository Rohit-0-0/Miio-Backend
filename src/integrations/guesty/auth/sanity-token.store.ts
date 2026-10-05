import { sanityClient } from '@/infrastructure/sanity';
import type { TokenStore, TokenData } from './token-store';

const DOC_ID = 'system.guestyToken';

export class SanityTokenStore implements TokenStore {
  private cache: TokenData | null = null;
  private lastFetch: number = 0;

  async getAsync(): Promise<TokenData | null> {
    const now = Date.now();
    // Return cached token if fetched within the last 5 minutes to avoid excessive Sanity API calls
    if (this.cache && (now - this.lastFetch < 5 * 60 * 1000)) {
      return this.cache;
    }

    try {
      const doc = await sanityClient.getDocument(DOC_ID);
      if (doc && doc['accessToken'] && doc['expiresAt']) {
        this.cache = {
          accessToken: doc['accessToken'] as string,
          expiresAt: doc['expiresAt'] as number
        };
        this.lastFetch = now;
        console.log('[Guesty Integration] Loaded token from Sanity.');
        return this.cache;
      }
    } catch (error) {
      console.error('[Guesty Integration] Failed to fetch token from Sanity:', error);
    }
    
    return null;
  }

  // TokenStore interface requires synchronous get(), but we need async for Sanity.
  // We'll throw an error if this is called directly, and adapt TokenManager instead.
  get(): TokenData | null {
    return this.cache; 
  }

  async setAsync(data: TokenData): Promise<void> {
    this.cache = data;
    this.lastFetch = Date.now();
    
    try {
      await sanityClient
        .transaction()
        .createIfNotExists({ _id: DOC_ID, _type: 'system.tokens' })
        .patch(DOC_ID, p => p.set({ 
          accessToken: data.accessToken, 
          expiresAt: data.expiresAt 
        }))
        .commit();
      console.log('[Guesty Integration] Saved token to Sanity.');
    } catch (error) {
      console.error('[Guesty Integration] Failed to save token to Sanity:', error);
    }
  }

  set(data: TokenData): void {
    // Fire and forget
    this.setAsync(data).catch(console.error);
  }

  clear(): void {
    this.cache = null;
    this.lastFetch = 0;
    sanityClient.delete(DOC_ID).catch(console.error);
  }
}
