export interface TokenData {
  accessToken: string;
  expiresAt: number; // Timestamp in milliseconds
}

export interface TokenStore {
  get(): TokenData | null;
  set(data: TokenData): void;
  clear(): void;
}
