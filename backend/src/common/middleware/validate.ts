import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Zod request-body validation middleware factory.
 *
 * Usage:
 *   router.post('/login', validate(loginSchema), authController.login)
 *
 * Parses req.body against the given schema and replaces req.body with the
 * parsed (typed, defaulted) result. Throws ZodError on failure, which
 * `errorHandler.ts` already catches and maps to a 400 VALIDATION_ERROR
 * envelope — no try/catch needed here.
 *
 * ── EMERGENCY FIX NOTE (Rule C-02) ──────────────────────────────────────
 * This file is owned by the System Architect (ARCHITECTURE.md §11 —
 * `backend/src/common/`). It is being patched here, outside normal
 * ownership, as a documented emergency exception: the file previously
 * contained a non-functional stub —
 *
 *     export function validate() {}
 *
 * — which takes no arguments and returns `undefined`. Every call site
 * (`validate(loginSchema)` etc. in `auth.routes.ts`) therefore evaluated
 * to `router.post(path, undefined, controller)`, which Express rejects
 * at route-registration time. In its previous state, the application
 * could not start: every router that imports `validate` — i.e. the
 * entire auth module, the only module with implemented routes — would
 * throw immediately on `createApp()`. This blocked all of M2, including
 * every passing-looking test that never actually exercised a live
 * `createApp()` call.
 * Flagged to System Architect's `pending.md` for review/ownership
 * sign-off in the same session this fix was made.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
}
