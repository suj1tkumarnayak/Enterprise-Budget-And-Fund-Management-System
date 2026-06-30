import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import { ForbiddenError, UnauthenticatedError, ValidationError } from '@common/errors';
import { eventBus } from '@events/eventBus';
import { prisma } from '@prisma/client';

import { authService } from '../../src/modules/auth/auth.service';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@config/index', () => ({
  config: {
    jwt: {
      accessSecret: 'test-access-secret-min-32-characters-long',
      refreshSecret: 'test-refresh-secret-min-32-characters-long',
      accessExpiry: '15m',
      refreshExpiry: '7d',
    },
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
  eventBus: { emitTyped: jest.fn() },
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

const mockPrisma = prisma as unknown as {
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

const mockArgon2 = argon2 as unknown as { hash: jest.Mock; verify: jest.Mock };
const mockJwt = jwt as unknown as { sign: jest.Mock };
const mockEventBus = eventBus as unknown as { emitTyped: jest.Mock };

const ctx = { ipAddress: '127.0.0.1', userAgent: 'jest' };

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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authService.login', () => {
  it('returns user, tokens, and mustChangePassword on success', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(baseUser);
    mockArgon2.verify.mockResolvedValue(true);
    mockPrisma.user.update.mockResolvedValue(baseUser);
    mockPrisma.refreshToken.create.mockResolvedValue({});

    const result = await authService.login({ email: baseUser.email, password: 'pw' }, ctx);

    expect(result.user.id).toBe('user-1');
    expect(result.accessToken).toBe('signed.jwt.token');
    expect(typeof result.refreshToken).toBe('string');
    expect(result.mustChangePassword).toBe(false);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
    expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
      'audit',
      expect.objectContaining({ action: 'Login', entityId: 'user-1' }),
    );
  });

  it('throws UnauthenticatedError without revealing whether the email exists', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'nope@ebfms.io', password: 'pw' }, ctx),
    ).rejects.toThrow(UnauthenticatedError);
  });

  it('throws ForbiddenError for a deactivated account', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ ...baseUser, isActive: false });

    await expect(authService.login({ email: baseUser.email, password: 'pw' }, ctx)).rejects.toThrow(
      ForbiddenError,
    );
  });

  it('throws ForbiddenError when locked and lockout has not expired', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      ...baseUser,
      lockedUntil: new Date(Date.now() + 60_000),
    });

    await expect(authService.login({ email: baseUser.email, password: 'pw' }, ctx)).rejects.toThrow(
      ForbiddenError,
    );
  });

  it('increments failedLoginAttempts on wrong password without locking before threshold', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ ...baseUser, failedLoginAttempts: 1 });
    mockArgon2.verify.mockResolvedValue(false);
    mockPrisma.user.update.mockResolvedValue({});

    await expect(
      authService.login({ email: baseUser.email, password: 'wrong' }, ctx),
    ).rejects.toThrow(UnauthenticatedError);

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { failedLoginAttempts: 2, lockedUntil: null },
    });
  });

  it('locks the account and emits an audit event on the 5th failed attempt', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ ...baseUser, failedLoginAttempts: 4 });
    mockArgon2.verify.mockResolvedValue(false);
    mockPrisma.user.update.mockResolvedValue({});

    await expect(
      authService.login({ email: baseUser.email, password: 'wrong' }, ctx),
    ).rejects.toThrow(UnauthenticatedError);

    const updateArgs = mockPrisma.user.update.mock.calls[0][0];
    expect(updateArgs.data.failedLoginAttempts).toBe(5);
    expect(updateArgs.data.lockedUntil).toBeInstanceOf(Date);
    expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
      'audit',
      expect.objectContaining({ entityId: 'user-1' }),
    );
  });
});

describe('authService.refresh', () => {
  it('rotates the token: revokes the old one and issues a new one', async () => {
    mockPrisma.refreshToken.findFirst.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    mockPrisma.user.findFirst.mockResolvedValue(baseUser);
    mockPrisma.refreshToken.update.mockResolvedValue({});
    mockPrisma.refreshToken.create.mockResolvedValue({});

    const result = await authService.refresh('opaque-token', ctx);

    expect(result.accessToken).toBe('signed.jwt.token');
    expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 'rt-1' },
      data: { revokedAt: expect.any(Date) },
    });
    expect(mockPrisma.refreshToken.create).toHaveBeenCalled();
  });

  it('throws on an unknown or expired token', async () => {
    mockPrisma.refreshToken.findFirst.mockResolvedValue(null);

    await expect(authService.refresh('bad-token', ctx)).rejects.toThrow(UnauthenticatedError);
  });

  it('revokes the entire token family and emits an audit event on revoked-token reuse', async () => {
    mockPrisma.refreshToken.findFirst.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
    });
    mockPrisma.refreshToken.updateMany.mockResolvedValue({});

    await expect(authService.refresh('reused-token', ctx)).rejects.toThrow(UnauthenticatedError);

    expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
      'audit',
      expect.objectContaining({ entityId: 'user-1' }),
    );
  });

  it('throws if the associated user is no longer active', async () => {
    mockPrisma.refreshToken.findFirst.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    mockPrisma.user.findFirst.mockResolvedValue(null);

    await expect(authService.refresh('opaque-token', ctx)).rejects.toThrow(UnauthenticatedError);
  });
});

describe('authService.logout', () => {
  it('revokes an active refresh token and emits Logout', async () => {
    mockPrisma.refreshToken.findFirst.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      revokedAt: null,
    });
    mockPrisma.refreshToken.update.mockResolvedValue({});

    await authService.logout('opaque-token');

    expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 'rt-1' },
      data: { revokedAt: expect.any(Date) },
    });
    expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
      'audit',
      expect.objectContaining({ action: 'Logout', entityId: 'user-1' }),
    );
  });

  it('is idempotent for an unknown or already-revoked token (no error)', async () => {
    mockPrisma.refreshToken.findFirst.mockResolvedValue(null);

    await expect(authService.logout('unknown-token')).resolves.toBeUndefined();
    expect(mockPrisma.refreshToken.update).not.toHaveBeenCalled();
  });
});

describe('authService.forgotPassword', () => {
  it('does nothing (no error, no token) for an unknown email — no user enumeration', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    await expect(
      authService.forgotPassword({ email: 'unknown@ebfms.io' }),
    ).resolves.toBeUndefined();
    expect(mockPrisma.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it('creates a hashed, expiring reset token for an existing active user', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    mockPrisma.passwordResetToken.create.mockResolvedValue({});

    await authService.forgotPassword({ email: baseUser.email });

    expect(mockPrisma.passwordResetToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'user-1' }),
      }),
    );
  });
});

describe('authService.resetPassword', () => {
  it('throws ValidationError for an invalid, used, or expired token', async () => {
    mockPrisma.passwordResetToken.findFirst.mockResolvedValue(null);

    await expect(
      authService.resetPassword({ token: 'bad', newPassword: 'NewPassword@12345' }),
    ).rejects.toThrow(ValidationError);
  });

  it('hashes the new password, marks the token used, and revokes all sessions', async () => {
    mockPrisma.passwordResetToken.findFirst.mockResolvedValue({
      id: 'prt-1',
      userId: 'user-1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    mockArgon2.hash.mockResolvedValue('new-hashed-password');
    mockPrisma.$transaction.mockResolvedValue([{}, {}, {}]);

    await authService.resetPassword({ token: 'good', newPassword: 'NewPassword@12345' });

    expect(mockArgon2.hash).toHaveBeenCalledWith(
      'NewPassword@12345',
      expect.objectContaining({ type: 'argon2id', memoryCost: 65536, timeCost: 3, parallelism: 4 }),
    );
    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
      'audit',
      expect.objectContaining({ action: 'PasswordChange', entityId: 'user-1' }),
    );
  });
});
