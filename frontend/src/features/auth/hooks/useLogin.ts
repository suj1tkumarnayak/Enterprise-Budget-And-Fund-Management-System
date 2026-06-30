import { useState } from 'react';

import { useApiError } from '../../../hooks/useApiError';
import { useAuthStore } from '../../../store/authStore';
import type { AuthUser } from '../../../types';
import { authApi } from '../api/authApi';
import type { LoginRequestDto } from '../types';

interface UseLoginResult {
  login: (dto: LoginRequestDto) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Handles the login flow:
 * 1. Calls POST /auth/login
 * 2. Stores tokens in localStorage
 * 3. Updates the Zustand auth slice
 * 4. Returns mustChangePassword flag for redirect logic
 */
export function useLogin(): UseLoginResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { getErrorMessage } = useApiError();

  const login = async (dto: LoginRequestDto): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(dto);

      // Store refresh token in localStorage — read by httpClient 401 handler
      localStorage.setItem('refreshToken', response.refreshToken);

      // Map API user to AuthUser shape used by Zustand
      const authUser: AuthUser = {
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.fullName,
        role: response.user.role,
        departmentId: response.user.departmentId,
      };

      setAuth(authUser, response.accessToken, response.mustChangePassword);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
    clearError: () => {
      setError(null);
    },
  };
}
