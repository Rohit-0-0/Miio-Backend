import type { TokenData, TokenStore } from './token-store';

export class MemoryTokenStore implements TokenStore {
  private data: TokenData | null = null;

  get(): TokenData | null {
    return this.data;
  }

  set(data: TokenData): void {
    this.data = data;
  }

  clear(): void {
    this.data = null;
  }
}
