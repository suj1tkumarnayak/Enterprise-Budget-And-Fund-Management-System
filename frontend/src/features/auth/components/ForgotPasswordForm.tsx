import { useState } from 'react';

import type { ForgotPasswordRequestDto } from '../types';

interface ForgotPasswordFormProps {
  onSubmit: (dto: ForgotPasswordRequestDto) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function ForgotPasswordForm({
  onSubmit,
  isLoading,
  error,
}: ForgotPasswordFormProps): JSX.Element {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!isLoading && email.length > 0) {
      void onSubmit({ email: email.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error !== null && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Work email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          className="input-field mt-1 px-3"
          placeholder="you@company.com"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || email.length === 0}
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
            Sending…
          </span>
        ) : (
          'Send reset link'
        )}
      </button>

      <p className="text-center text-sm text-gray-500">
        Remember your password?{' '}
        <a href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Sign in
        </a>
      </p>
    </form>
  );
}
