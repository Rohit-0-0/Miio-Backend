import { sanityClient } from '@/infrastructure/sanity';
import type { TokenStore, TokenData } from './token-store';

const PRIMARY_DOC_ID = 'guestyBeToken';
const LEGACY_DOC_ID = 'system.guestyBeToken';

export class SanityBeTokenStore implements TokenStore {
  private cache: TokenData | null = null;
  private lastFetch: number = 0;

  async getAsync(): Promise<TokenData | null> {
    const now = Date.now();
    // Return cached token if fetched within the last 5 minutes to avoid excessive Sanity API calls
    if (this.cache && (now - this.lastFetch < 5 * 60 * 1000)) {
      return this.cache;
    }

    try {
      let doc = await sanityClient.getDocument(PRIMARY_DOC_ID);
      if (!doc || !doc['accessToken']) {
        doc = await sanityClient.getDocument(LEGACY_DOC_ID);
      }

      if (doc && doc['accessToken'] && doc['expiresAt']) {
        this.cache = {
          accessToken: doc['accessToken'] as string,
          expiresAt: doc['expiresAt'] as number,
        };
        this.lastFetch = now;
        console.log('[Booking Engine Integration] Loaded token from Sanity.');
        return this.cache;
      }
    } catch (error) {
      console.error('[Booking Engine Integration] Failed to fetch token from Sanity:', error);
    }

    return null;
  }

  get(): TokenData | null {
    return this.cache;
  }

  async setAsync(data: TokenData): Promise<void> {
    this.cache = data;
    this.lastFetch = Date.now();

    try {
      await sanityClient
        .transaction()
        .createIfNotExists({ _id: PRIMARY_DOC_ID, _type: 'guestyBeToken' })
        .patch(PRIMARY_DOC_ID, (p) =>
          p.set({
            accessToken: data.accessToken,
            expiresAt: data.expiresAt,
            updatedAt: new Date().toISOString(),
          })
        )
        .commit();
      console.log('[Booking Engine Integration] Saved token to Sanity.');
    } catch (error) {
      console.error('[Booking Engine Integration] Failed to save token to Sanity:', error);
    }
  }

  set(data: TokenData): void {
    this.setAsync(data).catch(console.error);
  }

  clear(): void {
    this.cache = null;
    this.lastFetch = 0;
    console.log('[Booking Engine Integration] In-memory token cache cleared (Sanity document preserved).');
  }
}
