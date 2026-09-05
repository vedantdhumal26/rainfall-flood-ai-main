/**
 * Centralized API client for RainShield AI
 * Dynamically resolves API base URL:
 * - In production browser environments (e.g. *.vercel.app or custom domains), uses same-origin relative path ''
 * - In local development (localhost / 127.0.0.1), uses VITE_API_URL or defaults to 'http://localhost:8000'
 */
function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  // If explicitly set to a custom remote host
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }
  // In production browser environments, use same-origin relative URLs
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '';
  }
  // Local development fallback
  return (envUrl || 'http://localhost:8000').replace(/\/+$/, '');
}

const BASE_URL = getApiBaseUrl();

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code?: string;
    message: string;
  };
  timestamp: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('rainshield_token') : null;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('rainshield_token', token);
      } else {
        localStorage.removeItem('rainshield_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${BASE_URL}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const json = await response.json();

      if (!response.ok || json.success === false) {
        const errorMsg = json.error?.message || json.detail || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      // If backend wrapped in { success: true, data: ... }, unwrap data
      return (json.data !== undefined ? json.data : json) as T;
    } catch (err: unknown) {
      console.warn(`[API] Error calling ${endpoint}:`, err);
      throw err;
    }
  }

  get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
