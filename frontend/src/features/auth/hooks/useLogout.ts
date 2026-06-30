import { useState } from 'react';

import { useAuthStore } from '../../../store/authStore';
import { authApi } from '../api/authApi';

interface UseLogoutResult {
  logout: () => Promise<void>;
  isLoading: boolean;
}

export function useLogout(): UseLogoutResult {
  const [isLoading, setIsLoading] = useState(false);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (typeof refreshToken === 'string' && refreshToken.length > 0) {
        await authApi.logout({ refreshToken });
      }
    } catch {
      // Logout should always succeed on the client even if the API call fails.
      // The server token will expire naturally.
    } finally {
      clearAuth();
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
}
