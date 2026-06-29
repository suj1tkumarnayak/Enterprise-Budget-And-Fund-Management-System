import supertest from 'supertest';

import { createApp } from '../../src/app';

/**
 * Returns a Supertest agent wrapping the Express app.
 *
 * Importing the app factory (not server.ts) means tests never bind a real
 * port — Supertest creates an ephemeral in-process HTTP server instead.
 * This makes tests faster and allows parallel test suites without port conflicts.
 */
export function createTestClient(): supertest.SuperTest<supertest.Test> {
  const app = createApp();
  return supertest(app);
}
