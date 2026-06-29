import { createBrowserRouter } from 'react-router-dom';

/**
 * Application route tree.
 *
 * Routes are registered here as each feature module is implemented.
 * Lazy imports are used for all feature routes to enable code splitting —
 * users only download the JavaScript for routes they actually visit.
 *
 * Route guards (auth, role-based) are added in M2 (Authentication milestone).
 */
export const router = createBrowserRouter([
  {
    path: '/',
    // Layout shell added in M2
    children: [
      {
        index: true,
        // Dashboard added in M14
        element: null,
      },
    ],
  },
]);
