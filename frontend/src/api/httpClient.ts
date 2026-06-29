import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * Configured Axios instance used by all feature API modules.
 *
 * Responsibilities:
 * - Attaches the JWT access token from localStorage to every request
 * - Handles 401 responses by clearing auth state and redirecting to login
 * - Normalises error shapes so TanStack Query error handlers receive
 *   a consistent object
 *
 * Refresh token rotation is implemented in M2 (Authentication milestone).
 */

const BASE_URL = import.meta.env['VITE_API_URL'] as string | undefined ?? 'http://localhost:3000';

export const httpClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15_000,
});

// ── Request interceptor: attach access token ──────────────────────────────────

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');

  if (typeof token === 'string' && token.length > 0) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

// ── Response interceptor: handle 401, normalise errors ───────────────────────

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);
