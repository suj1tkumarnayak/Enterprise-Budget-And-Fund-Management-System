import { AuthLayout } from '../components/AuthLayout';
import { ForgotPasswordForm } from '../components/ForgotpasswordForm';
import { useForgotPassword } from '../hooks/useForgotPassword';

export function ForgotPasswordPage(): JSX.Element {
  const { submit, isLoading, isSubmitted, error } = useForgotPassword();

  if (isSubmitted) {
    return (
      <AuthLayout title="Check your email">
        <div className="space-y-4">
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            If that email is registered, we have sent a password reset link. Check your inbox and
            spam folder.
          </div>
          <p className="text-center text-sm text-gray-500">
            <a href="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Back to sign in
            </a>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your work email and we'll send you a reset link."
    >
      <ForgotPasswordForm onSubmit={submit} isLoading={isLoading} error={error} />
    </AuthLayout>
  );
}
