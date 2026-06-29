import { RouterProvider } from 'react-router-dom';

import { router } from '@routes/index';

/**
 * Root application component.
 * Provides the router — all layout, auth guards, and feature rendering
 * are handled inside the route tree.
 */
export default function App(): JSX.Element {
  return <RouterProvider router={router} />;
}
