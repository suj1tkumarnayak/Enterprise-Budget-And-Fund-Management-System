import { useState } from 'react';

import type { ResetPasswordRequestDto } from '../types';

interface ResetPasswordFormProps {
  token: string;
  onSubmit: (dto: ResetPasswordRequestDto) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function ResetPasswordForm({
  token,
  onSubmit,
  isLoading,
  error,
}: ResetPasswordFormProps): JSX.Element {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setValidationError(null);

    if (newPassword.length < 12) {
      setValidationError('Password must be at least 12 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setValidationError('Passwords do not match.');
      return;
    }

    void onSubmit({ token, newPassword });
  };

  const displayError = validationError ?? error;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {displayError !== null && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {displayError}
        </div>
      )}

      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
          New password
        </label>
        <p className="mt-0.5 text-xs text-gray-400">At least 12 characters</p>
        <div className="relative mt-1">
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
            }}
            className="input-field pr-10 px-3"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => {
              setShowPassword((v) => !v);
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  showPassword
                    ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21'
                    : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                }
              />
            </svg>
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
          }}
          className="input-field mt-1 px-3"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || newPassword.length === 0 || confirm.length === 0}
        className="btn-primary w-full"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Resetting…
          </span>
        ) : (
          'Reset password'
        )}
      </button>
    </form>
  );
}
