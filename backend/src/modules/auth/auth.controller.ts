import type { Request, Response } from 'express';

import { asyncHandler } from '@common/utils/asyncHandler';

import { authService } from './auth.service';
import type {
  ForgotPasswordInput,
  LoginInput,
  LogoutInput,
  RefreshInput,
  ResetPasswordInput,
} from './auth.schema';

function requestContext(req: Request): { ipAddress: string | null; userAgent: string | null } {
  return {
    ipAddress: req.ip ?? null,
    userAgent: req.headers['user-agent'] ?? null,
  };
}

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as LoginInput;
  const result = await authService.login(dto, requestContext(req));
  res.status(200).json(result);
});

export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as RefreshInput;
  const result = await authService.refresh(dto.refreshToken, requestContext(req));
  res.status(200).json(result);
});

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as LogoutInput;
  await authService.logout(dto.refreshToken);
  res.status(200).json({ message: 'Logged out successfully' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as ForgotPasswordInput;
  await authService.forgotPassword(dto);
  // Always 200 — never reveal whether the email exists.
  res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as ResetPasswordInput;
  await authService.resetPassword(dto);
  res.status(200).json({ message: 'Password has been reset successfully' });
});
