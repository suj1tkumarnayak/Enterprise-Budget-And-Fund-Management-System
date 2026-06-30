import { createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { AppShell } from '../components/layout';
import {
  ChangePasswordPage,
  ForgotPasswordPage,
  LoginPage,
  ResetPasswordPage,
} from '../features/auth';

/**
 * Application route tree — M2 complete.
 *
 * Auth routes are public (no AppShell, no ProtectedRoute).
 * All other routes are wrapped in ProtectedRoute + AppShell.
 *
 * RBAC per-route allowedRoles is added here as each module is implemented,
 * following the RBAC matrix in architecture doc §3.8.
 */

function NotFoundPage(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="mt-2 text-sm text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <a href="/" className="btn-primary mt-8">
        Go to Dashboard
      </a>
    </div>
  );
}

function RootErrorBoundary(): JSX.Element {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  if (is404) {
    return (
      <AppShell>
        <NotFoundPage />
      </AppShell>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-lg font-semibold text-red-600">Application error</p>
        <p className="mt-2 text-sm text-gray-500">Something went wrong. Please refresh the page.</p>
        <button
          type="button"
          onClick={() => {
            window.location.reload();
          }}
          className="btn-primary mt-6"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

function ComingSoonPage({ title }: { title: string }): JSX.Element {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-gray-400">— Coming in a future milestone —</p>
      <p className="mt-1 text-xl font-semibold text-gray-700">{title}</p>
    </div>
  );
}

/** Helper: wraps a page in ProtectedRoute + AppShell. */
function Protected({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: import('../types').RoleName[];
}): JSX.Element {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  // ── Public auth routes (no AppShell, no ProtectedRoute) ──────────────────
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },

  // ── Change-password: authenticated but no role restriction ────────────────
  {
    path: '/change-password',
    element: (
      <ProtectedRoute>
        <ChangePasswordPage />
      </ProtectedRoute>
    ),
  },

  // ── Protected application routes ──────────────────────────────────────────
  {
    path: '/',
    element: (
      <Protected>
        <ComingSoonPage title="Dashboard" />
      </Protected>
    ),
    errorElement: <RootErrorBoundary />,
  },

  // M3: Users — Admin only
  // { path: '/users', element: <Protected allowedRoles={['Admin']}><UsersPage /></Protected> },

  // M4: Departments
  {
    path: '/departments',
    element: (
      <Protected>
        <ComingSoonPage title="Departments" />
      </Protected>
    ),
  },

  // M5: Projects
  {
    path: '/projects',
    element: (
      <Protected>
        <ComingSoonPage title="Projects" />
      </Protected>
    ),
  },

  // M6: Budget Requests
  {
    path: '/budget-requests',
    element: (
      <Protected>
        <ComingSoonPage title="Budget Requests" />
      </Protected>
    ),
  },

  // M7: Approvals
  {
    path: '/approvals',
    element: (
      <Protected>
        <ComingSoonPage title="Approvals" />
      </Protected>
    ),
  },

  // M8: Allocations
  {
    path: '/allocations',
    element: (
      <Protected>
        <ComingSoonPage title="Fund Allocations" />
      </Protected>
    ),
  },

  // M9: Expenses
  {
    path: '/expenses',
    element: (
      <Protected>
        <ComingSoonPage title="Expenses" />
      </Protected>
    ),
  },

  // M13: Reports
  {
    path: '/reports',
    element: (
      <Protected>
        <ComingSoonPage title="Reports" />
      </Protected>
    ),
  },

  // M14: Analytics
  {
    path: '/analytics',
    element: (
      <Protected>
        <ComingSoonPage title="Analytics" />
      </Protected>
    ),
  },

  // M16: Settings — Admin only
  {
    path: '/settings',
    element: (
      <Protected allowedRoles={['Admin']}>
        <ComingSoonPage title="Settings" />
      </Protected>
    ),
  },

  // 404 fallback
  {
    path: '*',
    element: (
      <Protected>
        <NotFoundPage />
      </Protected>
    ),
  },
]);
