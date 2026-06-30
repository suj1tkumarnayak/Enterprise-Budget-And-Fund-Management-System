import { createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { AppShell } from '@components/layout';

/**
 * Application route tree.
 *
 * Routes are registered here as each feature module is implemented.
 * Lazy imports are used for all feature routes to enable code splitting —
 * users only download the JavaScript for routes they actually visit.
 *
 * Auth guard (ProtectedRoute) is added in M2 (Authentication milestone).
 * The AppShell is already wired so the layout renders correctly on M2.
 *
 * Route guard RBAC matrix (from architecture doc Section 3.8) is enforced
 * per-route in M2 using the useAuthStore role selector.
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
        <button type="button" onClick={() => window.location.reload()} className="btn-primary mt-6">
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppShell>
        <ComingSoonPage title="Dashboard" />
      </AppShell>
    ),
    errorElement: <RootErrorBoundary />,
    children: [],
  },

  // ── Feature routes — registered as each milestone completes ──────────────
  // M2: /login, /forgot-password, /reset-password (public, no AppShell)
  // M3: /users, /users/:id
  // M4: /departments, /departments/:id
  // M5: /projects, /projects/:id, /teams
  // M6: /budget-requests, /budget-requests/:id, /budget-requests/new
  // M7: /approvals, /approvals/:id
  // M8: /allocations, /allocations/:id
  // M9: /expenses, /expenses/:id, /expenses/new
  // M10: /notifications
  // M11: /audit
  // M12: /payroll
  // M13: /reports
  // M14: /analytics
  // M16: /settings
  // M18: /profile

  {
    path: '/budget-requests',
    element: (
      <AppShell>
        <ComingSoonPage title="Budget Requests" />
      </AppShell>
    ),
  },
  {
    path: '/approvals',
    element: (
      <AppShell>
        <ComingSoonPage title="Approvals" />
      </AppShell>
    ),
  },
  {
    path: '/allocations',
    element: (
      <AppShell>
        <ComingSoonPage title="Fund Allocations" />
      </AppShell>
    ),
  },
  {
    path: '/expenses',
    element: (
      <AppShell>
        <ComingSoonPage title="Expenses" />
      </AppShell>
    ),
  },
  {
    path: '/departments',
    element: (
      <AppShell>
        <ComingSoonPage title="Departments" />
      </AppShell>
    ),
  },
  {
    path: '/projects',
    element: (
      <AppShell>
        <ComingSoonPage title="Projects" />
      </AppShell>
    ),
  },
  {
    path: '/reports',
    element: (
      <AppShell>
        <ComingSoonPage title="Reports" />
      </AppShell>
    ),
  },
  {
    path: '/analytics',
    element: (
      <AppShell>
        <ComingSoonPage title="Analytics" />
      </AppShell>
    ),
  },
  {
    path: '/settings',
    element: (
      <AppShell>
        <ComingSoonPage title="Settings" />
      </AppShell>
    ),
  },

  // 404 fallback
  {
    path: '*',
    element: (
      <AppShell>
        <NotFoundPage />
      </AppShell>
    ),
  },
]);
