/**
 * Zustand store root.
 *
 * Each feature slice is defined in its own file and re-exported here.
 * Import from the specific slice file for best tree-shaking,
 * or from here for convenience.
 */
export {
  selectIsAuthenticated,
  selectMustChangePassword,
  selectUserRole,
  useAuthStore,
} from './authStore';
