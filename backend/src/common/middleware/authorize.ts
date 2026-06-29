import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError, UnauthenticatedError } from '@common/errors';
import type { AuthenticatedRequest, RoleName } from '@common/types';

/**
 * Role-based authorization middleware factory.
 *
 * Usage:
 *   router.post('/departments', authenticate, authorize('Admin'), handler)
 *   router.get('/reports',      authenticate, authorize('FinanceHead', 'FinanceOfficer'), handler)
 *
 * Enforces coarse-grained role-level access. Fine-grained resource-scope
 * checks (e.g., "Department Manager may only approve their own department's
 * requests") are performed inside the relevant service, not here.
 */
export function authorize(...allowedRoles: RoleName[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authedReq = req as AuthenticatedRequest;

    if (authedReq.user === undefined) {
      throw new UnauthenticatedError();
    }

    if (!allowedRoles.includes(authedReq.user.role)) {
      throw new ForbiddenError(
        `Role '${authedReq.user.role}' is not permitted to access this resource`,
      );
    }

    next();
  };
}
