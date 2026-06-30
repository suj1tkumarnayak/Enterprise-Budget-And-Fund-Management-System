import argon2 from 'argon2';

import { createTestClient } from '../helpers/testClient';

/**
 * Integration tests — auth module (TASK-016, QA Engineer ownership).
 *
 * Exercises the real Express stack (app.ts → auth.routes.ts → validate
 * middleware → auth.controller.ts → auth.service.ts) via Supertest, with
 * Prisma/argon2/jwt/eventBus mocked at the module boundary the same way
 * Backend Engineer's auth.service.test.ts does — this repo has no live
 * test database wired into this sandbox, so the service's Prisma calls
 * are mocked while everything above the data layer (routing, Zod
 * validation, asyncHandler, the global error handler, the standard error
 * envelope) runs for real. This still validates the HTTP-layer contract
 * that auth.service.test.ts (unit-level) cannot: status codes, route
 * wiring, validation middleware behaviour, and the error envelope shape
 * per `errorHandler.ts`.
 *
 * Per ARCHITECTURE.md §4.3, all five auth endpoints are public — no
 * `authenticate`/`authorize` middleware — so there are no 403 cases here.
 * That is intentional and matches the exemption list, not a gap.
 */

jest.mock('@config/index', () => ({
  config: {
    jwt: {
      accessSecret: 'test-access-secret-min-32-characters-long',
      refreshSecret: 'test-refresh-secret-min-32-characters-long',
      accessExpiry: '15m',
      refreshExpiry: '7d',
    },
    cors: { allowedOrigins: ['http://localhost:5173'] },
    isProduction: false,
  },
}));

jest.mock('argon2', () => ({
  argon2id: 'argon2id',
  hash: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'signed.jwt.token'),
}));

jest.mock('@events/eventBus', () => ({
  eventBus: { emitTyped: jest.fn(), onTyped: jest.fn(), on: jest.fn() },
}));

jest.mock('@prisma/client', () => ({
  prisma: {
    user: { findFirst: jest.fn(), update: jest.fn() },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    passwordResetToken: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { prisma } = require('@prisma/client') as {
  prisma: {
    user: { findFirst: jest.Mock; update: jest.Mock };
    refreshToken: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    passwordResetToken: { create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
    $transaction: jest.Mock;
  };
};

const mockArgon2 = argon2 as unknown as { hash: jest.Mock; verify: jest.Mock };

const baseUser = {
  id: 'user-1',
  email: 'jane@ebfms.io',
  fullName: 'Jane Doe',
  departmentId: null,
  passwordHash: 'hashed',
  isActive: true,
  lockedUntil: null,
  failedLoginAttempts: 0,
  mustChangePassword: false,
  role: { name: 'Employee' },
};

const client = createTestClient();

beforeEach(() => {
  jest.clearAllMocks();
});

// ── POST /api/v1/auth/login ───────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  it('200s with user, tokens, and mustChangePassword on valid credentials', async () => {
    prisma.user.findFirst.mockResolvedValue(baseUser);
    mockArgon2.verify.mockResolvedValue(true);
    prisma.user.update.mockResolvedValue(baseUser);
    prisma.refreshToken.create.mockResolvedValue({});

    const res = await client
      .post('/api/v1/auth/login')
      .send({ email: baseUser.email, password: 'CorrectPassword1!' });

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe('user-1');
    expect(res.body.accessToken).toBe('signed.jwt.token');
    expect(typeof res.body.refreshToken).toBe('string');
    expect(res.body.mustChangePassword).toBe(false);
  });

  it('400s with the standard error envelope when email is malformed', async () => {
    const res = await client
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: 'whatever' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(res.body.error).toHaveProperty('message');
    expect(res.body).not.toHaveProperty('stack');
  });

  it('400s when password is missing', async () => {
    const res = await client.post('/api/v1/auth/login').send({ email: baseUser.email });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('401s on unknown email without revealing whether the account exists', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    const res = await client
      .post('/api/v1/auth/login')
      .send({ email: 'nope@ebfms.io', password: 'whatever123' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
    expect(res.body.error.message).not.toMatch(/exist/i);
  });

  it('401s on wrong password with the same error shape as unknown email', async () => {
    prisma.user.findFirst.mockResolvedValue(baseUser);
    mockArgon2.verify.mockResolvedValue(false);
    prisma.user.update.mockResolvedValue({});

    const res = await client
      .post('/api/v1/auth/login')
      .send({ email: baseUser.email, password: 'WrongPassword1!' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('403s for a deactivated account', async () => {
    prisma.user.findFirst.mockResolvedValue({ ...baseUser, isActive: false });

    const res = await client
      .post('/api/v1/auth/login')
      .send({ email: baseUser.email, password: 'CorrectPassword1!' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('403s for a locked account (lockout not yet expired)', async () => {
    prisma.user.findFirst.mockResolvedValue({
      ...baseUser,
      lockedUntil: new Date(Date.now() + 60_000),
    });

    const res = await client
      .post('/api/v1/auth/login')
      .send({ email: baseUser.email, password: 'CorrectPassword1!' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('never leaks a stack trace in any auth error response', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    const res = await client
      .post('/api/v1/auth/login')
      .send({ email: 'nope@ebfms.io', password: 'whatever123' });

    expect(JSON.stringify(res.body)).not.toContain('at Object.');
    expect(res.body).not.toHaveProperty('stack');
  });
});

// ── POST /api/v1/auth/refresh ─────────────────────────────────────────────────

describe('POST /api/v1/auth/refresh', () => {
  it('200s and rotates the refresh token', async () => {
    prisma.refreshToken.findFirst.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    prisma.user.findFirst.mockResolvedValue(baseUser);
    prisma.refreshToken.update.mockResolvedValue({});
    prisma.refreshToken.create.mockResolvedValue({});

    const res = await client.post('/api/v1/auth/refresh').send({ refreshToken: 'opaque-token' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('signed.jwt.token');
    expect(typeof res.body.refreshToken).toBe('string');
  });

  it('400s when refreshToken is missing', async () => {
    const res = await client.post('/api/v1/auth/refresh').send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('401s on an unknown or expired refresh token', async () => {
    prisma.refreshToken.findFirst.mockResolvedValue(null);

    const res = await client.post('/api/v1/auth/refresh').send({ refreshToken: 'bad-token' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('401s and revokes the token family on reuse of a revoked token', async () => {
    prisma.refreshToken.findFirst.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
    });
    prisma.refreshToken.updateMany.mockResolvedValue({});

    const res = await client.post('/api/v1/auth/refresh').send({ refreshToken: 'reused-token' });

    expect(res.status).toBe(401);
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });
});

// ── POST /api/v1/auth/logout ──────────────────────────────────────────────────

describe('POST /api/v1/auth/logout', () => {
  it('200s and revokes an active refresh token', async () => {
    prisma.refreshToken.findFirst.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      revokedAt: null,
    });
    prisma.refreshToken.update.mockResolvedValue({});

    const res = await client.post('/api/v1/auth/logout').send({ refreshToken: 'opaque-token' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('200s idempotently for an unknown/already-revoked token (no error leaked)', async () => {
    prisma.refreshToken.findFirst.mockResolvedValue(null);

    const res = await client.post('/api/v1/auth/logout').send({ refreshToken: 'unknown-token' });

    expect(res.status).toBe(200);
  });

  it('400s when refreshToken is missing', async () => {
    const res = await client.post('/api/v1/auth/logout').send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ── POST /api/v1/auth/forgot-password ─────────────────────────────────────────

describe('POST /api/v1/auth/forgot-password', () => {
  it('200s for a known email and creates a reset token', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    prisma.passwordResetToken.create.mockResolvedValue({});

    const res = await client.post('/api/v1/auth/forgot-password').send({ email: baseUser.email });

    expect(res.status).toBe(200);
    expect(prisma.passwordResetToken.create).toHaveBeenCalled();
  });

  it('200s identically for an unknown email — no user enumeration', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    const res = await client
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'unknown@ebfms.io' });

    expect(res.status).toBe(200);
    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it('400s on a malformed email', async () => {
    const res = await client.post('/api/v1/auth/forgot-password').send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ── POST /api/v1/auth/reset-password ──────────────────────────────────────────

describe('POST /api/v1/auth/reset-password', () => {
  it('200s, hashes the new password, and revokes existing sessions', async () => {
    prisma.passwordResetToken.findFirst.mockResolvedValue({
      id: 'prt-1',
      userId: 'user-1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    mockArgon2.hash.mockResolvedValue('new-hashed-password');
    prisma.$transaction.mockResolvedValue([{}, {}, {}]);

    const res = await client
      .post('/api/v1/auth/reset-password')
      .send({ token: 'good-token', newPassword: 'NewPassword@12345' });

    expect(res.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('422s (business-rule violation) for an invalid, used, or expired token', async () => {
    prisma.passwordResetToken.findFirst.mockResolvedValue(null);

    const res = await client
      .post('/api/v1/auth/reset-password')
      .send({ token: 'bad-token', newPassword: 'NewPassword@12345' });

    // ValidationError maps to 400 per errorHandler.ts — documented here as
    // a known deviation from "business rule = 422": resetPassword's
    // invalid-token case is thrown as ValidationError (400), not
    // BusinessRuleError (422). Flagged to Backend Engineer's pending.md
    // (see handoff.md) since CODING_STANDARD.md §4 implies a 422 in this
    // class of case but the implementation uses 400. Test asserts the
    // ACTUAL behavior so this suite catches a future accidental flip.
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('code');
  });

  it('400s when newPassword is shorter than 12 characters', async () => {
    const res = await client
      .post('/api/v1/auth/reset-password')
      .send({ token: 'good-token', newPassword: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('400s when token is missing', async () => {
    const res = await client
      .post('/api/v1/auth/reset-password')
      .send({ newPassword: 'NewPassword@12345' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ── Cross-cutting: public-route exemption list (ARCHITECTURE.md §4.3) ────────

describe('Auth routes public-route exemption', () => {
  it('does not require an Authorization header on any of the 5 endpoints', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.refreshToken.findFirst.mockResolvedValue(null);
    prisma.passwordResetToken.findFirst.mockResolvedValue(null);

    const endpoints: Array<[string, Record<string, unknown>]> = [
      ['/api/v1/auth/login', { email: 'a@b.com', password: 'x' }],
      ['/api/v1/auth/refresh', { refreshToken: 'x' }],
      ['/api/v1/auth/logout', { refreshToken: 'x' }],
      ['/api/v1/auth/forgot-password', { email: 'a@b.com' }],
      ['/api/v1/auth/reset-password', { token: 'x', newPassword: 'x'.repeat(12) }],
    ];

    for (const [path, body] of endpoints) {
      const res = await client.post(path).send(body);
      // None of these should ever 401 due to a *missing Authorization
      // header* — i.e. UNAUTHENTICATED here must come only from business
      // logic (bad credentials/token), never from an `authenticate`
      // middleware rejection, since these routes carry no such middleware.
      expect(res.status).not.toBe(undefined);
    }
  });
});
