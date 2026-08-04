export interface TokenData {
  accessToken: string;
  expiresAt: number;
}

export interface TokenStore {
  /**
   * Retrieves the token data if it exists.
   */
  get(): TokenData | null;

  /**
   * Saves the token data.
   */
  set(data: TokenData): void;

  /**
   * Clears the token data.
   */
  clear(): void;
}
