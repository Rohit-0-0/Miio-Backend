import { bookingEngineConfig } from '../config/booking-engine.config';
import { BeTokenManager } from '../auth/be-token-manager';
import { AppError } from '../../../shared/errors';

export class BookingEngineClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const tokenManager = BeTokenManager.getInstance();
    
    try {
      const token = await tokenManager.getToken();
      
      const url = `${bookingEngineConfig.apiBaseUrl}${endpoint}`;
      
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
        if ((response.status === 401 || response.status === 403) && !isRetry) {
          console.warn(`[Booking Engine API] Received ${response.status} from API. Invalidating token and retrying...`);
          tokenManager.invalidateToken();
          return this.request<T>(endpoint, options, true);
        }

        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        
        // Log detailed error for debugging securely
        console.error(`[Booking Engine API] Request Failed`);
        console.error(`- Endpoint: ${endpoint}`);
        console.error(`- Status: ${response.status} ${response.statusText}`);
        if (typeof errorData === 'object' && errorData !== null) {
          console.error(`- Error Code: ${errorData.code || 'N/A'}`);
          console.error(`- Error Message: ${errorData.message || 'N/A'}`);
          console.error(`- Request ID: ${errorData.requestId || response.headers.get('x-request-id') || 'N/A'}`);
          console.error(`- Details:`, JSON.stringify(errorData.details || errorData));
        } else {
          console.error(`- Data:`, errorData);
        }
        
        // Create a structured error to pass to the frontend
        let message = typeof errorData === 'object' && errorData.message 
          ? errorData.message 
          : 'Booking Engine API request failed.';
          
        if (message.includes('checkIn') && message.includes('invalid')) {
          message = 'Please select a future check-in date.';
        }
          
        const code = typeof errorData === 'object' && errorData.code ? errorData.code : 'GUESTY_API_ERROR';
        const details = typeof errorData === 'object' ? errorData : null;
        
        throw new AppError(message, response.status, code, details);
      }

      return (await response.json()) as T;
      
    } catch (error) {
      throw error;
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
