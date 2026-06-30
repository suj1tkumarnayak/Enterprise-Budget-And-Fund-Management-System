import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { AuthUser } from '../types';

/**
 * Authentication Zustand slice.
 *
 * M2 additions:
 * - mustChangePassword flag (from login response, schema: User.mustChangePassword)
 * - clearAuth now also removes 'refreshToken' from localStorage
 * - setAuth accepts mustChangePassword parameter
 *
 * Token storage contract:
 * - user          → Zustand persist (survives page refresh)
 * - accessToken   → localStorage + Zustand state (httpClient reads sync)
 * - refreshToken  → localStorage only (read by httpClient 401 interceptor)
 */

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthLoading: boolean;
  /**
   * When true, the app must redirect the user to /change-password
   * before granting access to protected routes.
   * Set from the login response (User.mustChangePassword in schema.prisma).
   */
  mustChangePassword: boolean;

  // ── Actions ──────────────────────────────────────────────────────────────

  setAuth: (user: AuthUser, accessToken: string, mustChangePassword: boolean) => void;

  clearAuth: () => void;

  setAuthLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        isAuthLoading: false,
        mustChangePassword: false,

        setAuth: (user, accessToken, mustChangePassword): void => {
          localStorage.setItem('accessToken', accessToken);
          set({ user, accessToken, mustChangePassword }, false, 'auth/setAuth');
        },

        clearAuth: (): void => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set(
            { user: null, accessToken: null, mustChangePassword: false },
            false,
            'auth/clearAuth',
          );
        },

        setAuthLoading: (loading): void => {
          set({ isAuthLoading: loading }, false, 'auth/setAuthLoading');
        },
      }),
      {
        name: 'ebfms-auth',
        partialize: (state) => ({
          user: state.user,
          mustChangePassword: state.mustChangePassword,
        }),
      },
    ),
    { name: 'AuthStore' },
  ),
);

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectIsAuthenticated = (state: AuthState): boolean => state.user !== null;

export const selectUserRole = (state: AuthState): AuthUser['role'] | null =>
  state.user?.role ?? null;

export const selectMustChangePassword = (state: AuthState): boolean => state.mustChangePassword;
