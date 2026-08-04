import type { TokenStore, TokenData } from './token-store';

export class MemoryTokenStore implements TokenStore {
  private data: TokenData | null = null;

  get(): TokenData | null {
    return this.data;
  }

  set(data: TokenData): void {
    this.data = data;
    console.log('[Guesty Integration] Saved token to in-memory cache.');
  }

  clear(): void {
    this.data = null;
    console.log('[Guesty Integration] Cleared in-memory token cache.');
  }
}
