import { useNavigate } from 'react-router-dom';

import { selectIsAuthenticated, useAuthStore } from '../../../store/authStore';
import { AuthLayout } from '../components/AuthLayout';
import { ResetPasswordForm } from '../components/Resetpasswordform';
import { useResetPassword } from '../hooks/useResetPassword';

/**
 * ChangePasswordPage — shown immediately after login when mustChangePassword=true.
 * Uses the same ResetPasswordForm but without a URL token (the user is already
 * authenticated, so the server validates via the session).
 *
 * NOTE: The backend does not yet have a dedicated /auth/change-password endpoint.
 * This page is a UI stub that will be wired once that endpoint lands in M3/M16.
 * For now it renders the UI in a non-functional state with an informational note.
 */
export function ChangePasswordPage(): JSX.Element {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  if (!isAuthenticated) {
    void navigate('/login', { replace: true });
    return <></>;
  }

  return (
    <AuthLayout
      title="Change your password"
      subtitle="Your administrator requires you to set a new password before continuing."
    >
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Password change endpoint is available in a future milestone. For now, use the{' '}
        <a href="/forgot-password" className="font-medium underline hover:text-amber-900">
          forgot password
        </a>{' '}
        flow to reset your password.
      </div>
    </AuthLayout>
  );
}
