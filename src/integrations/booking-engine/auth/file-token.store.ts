import fs from 'fs';
import path from 'path';
import type { TokenData, TokenStore } from './token-store';

export class FileTokenStore implements TokenStore {
  private filePath: string;

  constructor() {
    this.filePath = path.join(process.cwd(), '.guesty-be-token.json');
  }

  get(): TokenData | null {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(fileContent) as TokenData;
      }
    } catch (error) {
      console.warn('[BE Token Store] Failed to read token file', error);
    }
    return null;
  }

  set(data: TokenData): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.warn('[BE Token Store] Failed to write token file', error);
    }
  }

  clear(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
    } catch (error) {
      console.warn('[BE Token Store] Failed to clear token file', error);
    }
  }
}
