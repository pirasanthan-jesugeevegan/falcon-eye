import { toast } from 'sonner';
import type { ApiError } from '@/types';

// Base URL for API calls
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        ) as ApiError;
        error.status = response.status;
        error.code = errorData.code;
        throw error;
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      // Network or other errors
      const apiError = new Error(
        'Network error or server unavailable',
      ) as ApiError;
      apiError.status = 0;
      throw apiError;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL + 'api');

// Global error handler for API calls
export const handleApiError = (error: unknown) => {
  if (error instanceof Error) {
    const apiError = error as ApiError;

    // Don't show toast for certain errors (handled by components)
    if (apiError.status === 404) {
      return;
    }

    // Show user-friendly error messages
    toast.error(
      apiError.message ||
        apiError.githubApiResponse?.error?.message ||
        'An unexpected error occurred',
    );
  }

  console.error('API Error:', error);
  throw error;
};
