import { Router } from 'express';

import { validate } from '@common/middleware/validate';

import * as authController from './auth.controller';
import {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  resetPasswordSchema,
} from './auth.schema';

/**
 * Auth routes — all public per ARCHITECTURE.md §4.3 exemption list.
 * No `authenticate` middleware on this router: these endpoints establish
 * authentication, they don't consume it.
 */
const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', validate(logoutSchema), authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;
