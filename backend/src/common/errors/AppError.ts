/**
 * Base error class for all application-level errors.
 * Carries an HTTP status code and a machine-readable error code
 * so the global error handler can produce consistent responses
 * without inspecting error messages.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: Record<string, unknown> | undefined;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    errorCode: string,
    message: string,
    details?: Record<string, unknown>,
    isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = isOperational;

    // Restore prototype chain broken by extending built-in Error
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── 400 Bad Request ─────────────────────────────────────────────────────────

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

// ─── 401 Unauthenticated ─────────────────────────────────────────────────────

export class UnauthenticatedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHENTICATED', message);
    this.name = 'UnauthenticatedError';
  }
}

// ─── 403 Forbidden ───────────────────────────────────────────────────────────

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

// ─── 404 Not Found ───────────────────────────────────────────────────────────

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message =
      id !== undefined ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(404, 'NOT_FOUND', message, { resource, id });
    this.name = 'NotFoundError';
  }
}

// ─── 409 Conflict ────────────────────────────────────────────────────────────

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(409, 'CONFLICT', message, details);
    this.name = 'ConflictError';
  }
}

// ─── 422 Unprocessable Entity (business rule violation) ──────────────────────

export class BusinessRuleError extends AppError {
  constructor(errorCode: string, message: string, details?: Record<string, unknown>) {
    super(422, errorCode, message, details);
    this.name = 'BusinessRuleError';
  }
}

// ─── 429 Too Many Requests ───────────────────────────────────────────────────

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(429, 'RATE_LIMIT_EXCEEDED', message);
    this.name = 'RateLimitError';
  }
}

// ─── 500 Internal Server Error ───────────────────────────────────────────────

export class InternalError extends AppError {
  constructor(message = 'An unexpected error occurred') {
    super(500, 'INTERNAL_ERROR', message, undefined, false);
    this.name = 'InternalError';
  }
}
