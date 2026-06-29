import type { NextFunction, Request, Response } from 'express';

import { NotFoundError } from '@common/errors';

/**
 * Catch-all handler for routes that do not match any registered route.
 * Must be mounted after all route registrations, before the error handler.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route ${req.method} ${req.path}`));
}
