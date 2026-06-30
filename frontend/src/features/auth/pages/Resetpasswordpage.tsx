import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '../components/AuthLayout';
import { ResetPasswordForm } from '../components/Resetpasswordform';
import { useResetPassword } from '../hooks/useResetPassword';

export function ResetPasswordPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const { submit, isLoading, isSuccess, error } = useResetPassword();

  if (token === null || token.length === 0) {
    return (
      <AuthLayout title="Invalid link">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            This password reset link is invalid or has expired.
          </p>
          <a href="/forgot-password" className="btn-primary block text-center">
            Request a new link
          </a>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Password updated">
        <div className="space-y-4">
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Your password has been reset successfully. You can now sign in with your new password.
          </div>
          <button
            type="button"
            onClick={() => {
              void navigate('/login', { replace: true });
            }}
            className="btn-primary w-full"
          >
            Sign in
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a strong password with at least 12 characters."
    >
      <ResetPasswordForm token={token} onSubmit={submit} isLoading={isLoading} error={error} />
    </AuthLayout>
  );
}
