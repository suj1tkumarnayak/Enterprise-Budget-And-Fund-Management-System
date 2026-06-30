import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * Configured Axios instance used by all feature API modules.
 *
 * M2 additions:
 * - 401 interceptor attempts refresh token rotation before redirecting to /login
 * - Queues concurrent requests that arrive during a refresh attempt
 *
 * Token storage contract:
 * - accessToken  → localStorage (read here synchronously on every request)
 * - refreshToken → localStorage (read here on 401 to attempt rotation)
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

export const httpClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15_000,
});

// ── State for token refresh coordination ─────────────────────────────────────

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function drainQueue(token: string | null, err: unknown = null): void {
  pendingQueue.forEach((p) => {
    if (token !== null) {
      p.resolve(token);
    } else {
      p.reject(err);
    }
  });
  pendingQueue = [];
}

function redirectToLogin(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}

// ── Request interceptor: attach access token ──────────────────────────────────

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (typeof token === 'string' && token.length > 0) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: attempt refresh on 401, then redirect ───────────────

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only handle 401 on non-auth endpoints and only once per request
    const isAuthEndpoint =
      typeof originalRequest.url === 'string' && originalRequest.url.startsWith('/auth/');

    if (error.response?.status !== 401 || isAuthEndpoint || originalRequest._retry === true) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken === null || refreshToken.length === 0) {
      redirectToLogin();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the in-flight refresh completes
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return httpClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${BASE_URL}/api/v1/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      httpClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      drainQueue(accessToken);

      return httpClient(originalRequest);
    } catch (refreshError) {
      drainQueue(null, refreshError);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
