import crypto from 'crypto';

import argon2 from 'argon2';
import jwt, { type SignOptions } from 'jsonwebtoken';

import type { StringValue } from 'ms';

import { config } from '@config/index';
import { ForbiddenError, UnauthenticatedError, ValidationError } from '@common/errors';
import type { RoleName } from '@common/types';
import { isValidRoleName } from '@common/types';
import { eventBus } from '@events/eventBus';
import { prisma } from '@db/client';
import { logger } from '@common/utils/logger';

import type { AuthUserDto, LoginResponseDto, RefreshResponseDto } from './auth.dto';
import type { ForgotPasswordInput, LoginInput, ResetPasswordInput } from './auth.schema';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
} as const;

interface RequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateOpaqueToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

function toAuthUserDto(user: {
  id: string;
  email: string;
  fullName: string;
  departmentId: string | null;
  role: { name: string };
}): AuthUserDto {
  if (!isValidRoleName(user.role.name)) {
    throw new Error(`Unknown role name '${user.role.name}' on user ${user.id}`);
  }
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role.name as RoleName,
    departmentId: user.departmentId,
  };
}

function signAccessToken(user: AuthUserDto): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role as RoleName,
      departmentId: user.departmentId,
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry as StringValue },
  );
}

function parseExpiryToMs(expiry: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiry);
  if (match === null) {
    throw new Error(`Invalid expiry format: ${expiry}`);
  }
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * unitMs[unit as string]!;
}

async function issueRefreshToken(userId: string, ctx: RequestContext): Promise<string> {
  const token = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + parseExpiryToMs(config.jwt.refreshExpiry));

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      userAgent: ctx.userAgent ?? null,
      ipAddress: ctx.ipAddress ?? null,
    },
  });

  return token;
}

async function login(dto: LoginInput, ctx: RequestContext): Promise<LoginResponseDto> {
  const user = await prisma.user.findFirst({
    where: { email: dto.email, deletedAt: null },
    include: { role: true },
  });

  // Constant-shape failure: do not reveal whether the email exists.
  if (user === null) {
    throw new UnauthenticatedError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new ForbiddenError('This account has been deactivated');
  }

  if (user.lockedUntil !== null && user.lockedUntil > new Date()) {
    throw new ForbiddenError('Account is temporarily locked due to repeated failed login attempts');
  }

  const passwordValid = await argon2.verify(user.passwordHash, dto.password);

  if (!passwordValid) {
    const failedAttempts = user.failedLoginAttempts + 1;
    const shouldLock = failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: failedAttempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
      },
    });

    if (shouldLock) {
      eventBus.emitTyped('audit', {
        actorId: user.id,
        action: 'SystemAlert' as never, // see note below
        entityType: 'User',
        entityId: user.id,
        ipAddress: ctx.ipAddress ?? null,
        userAgent: ctx.userAgent ?? null,
      });
    }

    throw new UnauthenticatedError('Invalid email or password');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  const authUser = toAuthUserDto(user);
  const accessToken = signAccessToken(authUser);
  const refreshToken = await issueRefreshToken(user.id, ctx);

  eventBus.emitTyped('audit', {
    actorId: user.id,
    action: 'Login',
    entityType: 'User',
    entityId: user.id,
    ipAddress: ctx.ipAddress ?? null,
    userAgent: ctx.userAgent ?? null,
  });

  return {
    user: authUser,
    accessToken,
    refreshToken,
    mustChangePassword: user.mustChangePassword,
  };
}

async function refresh(refreshToken: string, ctx: RequestContext): Promise<RefreshResponseDto> {
  const tokenHash = hashToken(refreshToken);
  const existing = await prisma.refreshToken.findFirst({ where: { tokenHash } });

  if (existing === null || existing.expiresAt < new Date()) {
    throw new UnauthenticatedError('Invalid or expired refresh token');
  }

  if (existing.revokedAt !== null) {
    // Reuse of a revoked token — possible theft (ADR-006). Revoke the
    // entire token family for this user as a precaution.
    await prisma.refreshToken.updateMany({
      where: { userId: existing.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    logger.warn('Refresh token reuse detected — all sessions revoked', {
      userId: existing.userId,
    });

    eventBus.emitTyped('audit', {
      actorId: existing.userId,
      action: 'SystemAlert' as never,
      entityType: 'User',
      entityId: existing.userId,
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    });

    throw new UnauthenticatedError('Refresh token has already been used');
  }

  const user = await prisma.user.findFirst({
    where: { id: existing.userId, deletedAt: null, isActive: true },
    include: { role: true },
  });

  if (user === null) {
    throw new UnauthenticatedError('User account no longer active');
  }

  // Rotate: revoke old, issue new.
  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });

  const authUser = toAuthUserDto(user);
  const accessToken = signAccessToken(authUser);
  const newRefreshToken = await issueRefreshToken(user.id, ctx);

  return { accessToken, refreshToken: newRefreshToken };
}

async function logout(refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  const existing = await prisma.refreshToken.findFirst({ where: { tokenHash } });

  if (existing !== null && existing.revokedAt === null) {
    await prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    eventBus.emitTyped('audit', {
      actorId: existing.userId,
      action: 'Logout',
      entityType: 'User',
      entityId: existing.userId,
    });
  }
  // Idempotent: unknown/already-revoked tokens do not error.
}

async function forgotPassword(dto: ForgotPasswordInput): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { email: dto.email, deletedAt: null, isActive: true },
  });

  // Always behave identically whether or not the user exists, to avoid
  // user enumeration.
  if (user === null) {
    return;
  }

  const token = generateOpaqueToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
    },
  });

  // Email delivery is out of scope for M2 (SMTP integration is a later
  // milestone) — log instead so the flow is exercisable in dev/test.
  logger.info('Password reset token issued', { userId: user.id });
  // TODO(M-notifications): replace with eventBus 'notification' emission
  // once the notifications module consumes SMTP, per ARCHITECTURE.md §7.
}

async function resetPassword(dto: ResetPasswordInput): Promise<void> {
  const tokenHash = hashToken(dto.token);
  const resetToken = await prisma.passwordResetToken.findFirst({ where: { tokenHash } });

  if (resetToken === null || resetToken.usedAt !== null || resetToken.expiresAt < new Date()) {
    throw new ValidationError('Invalid or expired password reset token');
  }

  const passwordHash = await argon2.hash(dto.newPassword, ARGON2_OPTIONS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    // Revoke all existing sessions on password change.
    prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  eventBus.emitTyped('audit', {
    actorId: resetToken.userId,
    action: 'PasswordChange',
    entityType: 'User',
    entityId: resetToken.userId,
  });
}

export const authService = { login, refresh, logout, forgotPassword, resetPassword };
