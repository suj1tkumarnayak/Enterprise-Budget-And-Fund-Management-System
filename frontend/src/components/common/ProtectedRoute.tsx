import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import {
  selectIsAuthenticated,
  selectMustChangePassword,
  useAuthStore,
} from '../../store/authStore';
import type { RoleName } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Optional role allowlist from the RBAC matrix (architecture doc §3.8).
   * If omitted, any authenticated user may access the route.
   * The server is the authoritative RBAC enforcer — this is a UX guard only.
   */
  allowedRoles?: RoleName[] | undefined;
}

/**
 * Client-side route guard.
 *
 * Enforces three checks:
 * 1. User must be authenticated → redirect to /login.
 * 2. User with mustChangePassword=true → redirect to /change-password
 *    (except when the current route IS /change-password).
 * 3. If allowedRoles is provided, user's role must be in the list → redirect to /.
 *
 * ARCHITECTURE.md §4: "route guards enforce RBAC on the client side (decorative
 * — the server is authoritative)."
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps): JSX.Element {
  const location = useLocation();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const mustChangePassword = useAuthStore(selectMustChangePassword);
  const userRole = useAuthStore((s) => s.user?.role ?? null);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isChangingPassword = location.pathname === '/change-password';

  if (mustChangePassword && !isChangingPassword) {
    return <Navigate to="/change-password" replace />;
  }

  if (
    allowedRoles !== undefined &&
    allowedRoles.length > 0 &&
    (userRole === null || !allowedRoles.includes(userRole))
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
