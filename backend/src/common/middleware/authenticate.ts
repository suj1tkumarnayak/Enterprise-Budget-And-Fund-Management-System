import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '@config/index';
import { UnauthenticatedError } from '@common/errors';
import type { AuthenticatedRequest, JwtPayload, RoleName } from '@common/types';
import { ROLE_NAMES } from '@common/types';
import { asyncHandler } from '@common/utils/asyncHandler';

function isValidRoleName(role: string): role is RoleName {
  return (ROLE_NAMES as readonly string[]).includes(role);
}

function isJwtPayload(payload: unknown): payload is JwtPayload {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const p = payload as Record<string, unknown>;
  return (
    typeof p['sub'] === 'string' &&
    typeof p['email'] === 'string' &&
    typeof p['role'] === 'string' &&
    isValidRoleName(p['role']) &&
    (p['departmentId'] === null || typeof p['departmentId'] === 'string')
  );
}

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];

    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthenticatedError('Missing or malformed Authorization header');
    }

    const token = authHeader.slice(7);

    let payload: unknown;

    try {
      payload = jwt.verify(token, config.jwt.accessSecret);
    } catch {
      throw new UnauthenticatedError('Invalid or expired access token');
    }

    if (!isJwtPayload(payload)) {
      throw new UnauthenticatedError('Malformed token payload');
    }

    (req as AuthenticatedRequest).user = {
      id:           payload.sub,
      email:        payload.email,
      role:         payload.role,
      departmentId: payload.departmentId,
    };

    next();
  },
);
