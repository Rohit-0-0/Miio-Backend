import { guestyConfig } from '../config/guesty.config';
import { TokenManager } from '../auth/token-manager';
import { GuestyApiError, GuestyAuthenticationError } from '../errors';

export class GuestyClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const tokenManager = TokenManager.getInstance();
    
    try {
      const token = await tokenManager.getToken();
      
      const url = `${guestyConfig.apiBaseUrl}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...((options.headers as Record<string, string>) || {}),
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Handle Authentication Failure (401 / 403)
        if ((response.status === 401 || response.status === 403) && !isRetry) {
          console.warn(`[Guesty Integration] Received ${response.status} from API. Invalidating token and retrying...`);
          tokenManager.invalidateToken();
          
          // Retry the request exactly once
          return this.request<T>(endpoint, options, true);
        }

        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        
        throw new GuestyApiError(
          `Guesty API Error: ${response.status} ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return (await response.json()) as T;
      
    } catch (error) {
      if (error instanceof GuestyApiError || error instanceof GuestyAuthenticationError) {
        throw error;
      }
      throw new GuestyApiError(`Unexpected error during Guesty API call: ${(error as Error).message}`);
    }
  }

  static async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  static async post<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async put<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static async patch<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  static async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}
