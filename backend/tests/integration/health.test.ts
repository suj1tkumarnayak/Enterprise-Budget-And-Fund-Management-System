import { createTestClient } from '../helpers/testClient';

describe('GET /health', () => {
  const client = createTestClient();

  it('returns 200 with status ok', async () => {
    const response = await client.get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok' });
  });

  it('returns a valid ISO 8601 timestamp', async () => {
    const response = await client.get('/health');

    expect(response.body).toHaveProperty('timestamp');
    const ts = response.body.timestamp as string;
    expect(() => new Date(ts)).not.toThrow();
    expect(new Date(ts).toISOString()).toBe(ts);
  });

  it('returns JSON content-type', async () => {
    const response = await client.get('/health');
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('404 handler', () => {
  const client = createTestClient();

  it('returns 404 for an unregistered route', async () => {
    const response = await client.get('/api/v1/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: 'NOT_FOUND' },
    });
  });

  it('includes the HTTP method and path in the error message', async () => {
    const response = await client.get('/api/v1/does-not-exist');
    const message = response.body.error.message as string;

    expect(message).toContain('GET');
    expect(message).toContain('/api/v1/does-not-exist');
  });
});

describe('Global error handler', () => {
  const client = createTestClient();

  it('does not expose stack traces in error responses', async () => {
    const response = await client.get('/api/v1/does-not-exist');
    const body = response.body as Record<string, unknown>;

    expect(body).not.toHaveProperty('stack');
    expect(JSON.stringify(body)).not.toContain('at Object.');
  });

  it('returns a well-formed error envelope on 404', async () => {
    const response = await client.get('/api/v1/does-not-exist');

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('code');
    expect(response.body.error).toHaveProperty('message');
  });
});
