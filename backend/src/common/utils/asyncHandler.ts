import type { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Wraps an async Express route handler and forwards any rejected promise
 * to Express's next(err) so the global error handler catches it.
 *
 * Without this wrapper, unhandled async errors in Express 4 crash the
 * process silently. Express 5 handles this natively, but we are targeting
 * Express 4 to match the stated LTS-stable stack.
 */
export function asyncHandler(fn: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
