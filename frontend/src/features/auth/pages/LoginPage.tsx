import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  selectIsAuthenticated,
  selectMustChangePassword,
  useAuthStore,
} from '../../../store/authStore';
import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';

/**
 * Login page — public route, no AppShell.
 *
 * Post-login routing:
 * - mustChangePassword = true → /change-password
 * - Otherwise → / (dashboard)
 */
export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const mustChangePassword = useAuthStore(selectMustChangePassword);
  const { login, isLoading, error } = useLogin();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      void navigate(mustChangePassword ? '/change-password' : '/', { replace: true });
    }
  }, [isAuthenticated, mustChangePassword, navigate]);

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Use your work email and password to continue."
    >
      <LoginForm onSubmit={login} isLoading={isLoading} error={error} />
    </AuthLayout>
  );
}
