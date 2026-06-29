import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError, ValidationError } from '@common/errors';
import type { ApiErrorResponse } from '@common/types';
import { logger } from '@common/utils/logger';

/**
 * Global Express error-handling middleware.
 *
 * Must be registered LAST in the middleware chain (after all routes).
 * Normalises three error categories into the standard API error envelope
 * defined in the architecture document (Section 8.1):
 *
 *   1. AppError subclasses  — operational errors with known HTTP codes
 *   2. ZodError             — schema validation failures (treated as 400)
 *   3. Everything else      — unexpected errors mapped to 500
 *
 * Stack traces are logged server-side but never sent to clients.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // ── ZodError: validation failure from request schema parsing ─────────────
  if (err instanceof ZodError) {
    const validationError = new ValidationError('Request validation failed', {
      fields: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });

    const body: ApiErrorResponse = {
      error: {
        code: validationError.errorCode,
        message: validationError.message,
        details: validationError.details,
      },
    };

    res.status(400).json(body);
    return;
  }

  // ── AppError: known operational error ────────────────────────────────────
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Non-operational AppError', { error: err.message, stack: err.stack });
    }

    const body: ApiErrorResponse = {
      error: {
        code: err.errorCode,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      },
    };

    res.status(err.statusCode).json(body);
    return;
  }

  // ── Unknown error: log full details, return opaque 500 ───────────────────
  const message = err instanceof Error ? err.message : 'Unknown error';
  const stack = err instanceof Error ? err.stack : undefined;

  logger.error('Unhandled error', { message, stack });

  const body: ApiErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };

  res.status(500).json(body);
}
