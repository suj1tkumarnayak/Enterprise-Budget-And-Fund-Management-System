import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/**
 * Shared layout for all public auth pages (login, forgot-password, reset-password).
 * No AppShell — these are outside the authenticated route tree.
 */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      {/* Logo mark */}
      <div className="mb-8 flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 shadow-sm">
          <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <span className="mt-3 text-xl font-semibold tracking-tight text-gray-900">EBFMS</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="card">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {subtitle !== undefined && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>

          {children}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Enterprise Budget &amp; Fund Management System
        </p>
      </div>
    </div>
  );
}
