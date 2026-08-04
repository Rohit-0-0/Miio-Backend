import * as fs from 'fs';
import * as path from 'path';
import type { TokenStore, TokenData } from './token-store';

export class FileTokenStore implements TokenStore {
  private readonly cacheDir: string;
  private readonly cacheFile: string;

  constructor() {
    this.cacheDir = path.resolve(process.cwd(), '.cache');
    this.cacheFile = path.join(this.cacheDir, 'guesty-token.json');
    this.ensureCacheDir();
  }

  private ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  get(): TokenData | null {
    if (!fs.existsSync(this.cacheFile)) {
      return null;
    }

    try {
      const data = fs.readFileSync(this.cacheFile, 'utf-8');
      const parsed = JSON.parse(data) as TokenData;
      console.log('[Guesty Integration] Loaded cached token from file.');
      return parsed;
    } catch (error) {
      console.error('[Guesty Integration] Failed to load cached token from file:', error);
      return null;
    }
  }

  set(data: TokenData): void {
    try {
      this.ensureCacheDir();
      fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2), 'utf-8');
      console.log('[Guesty Integration] Saved token to development cache.');
    } catch (error) {
      console.error('[Guesty Integration] Failed to save token to development cache:', error);
    }
  }

  clear(): void {
    if (fs.existsSync(this.cacheFile)) {
      try {
        fs.unlinkSync(this.cacheFile);
        console.log('[Guesty Integration] Cleared development token cache.');
      } catch (error) {
        console.error('[Guesty Integration] Failed to clear development token cache:', error);
      }
    }
  }
}
