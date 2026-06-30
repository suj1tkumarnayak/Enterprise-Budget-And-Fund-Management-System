import type { RoleName } from '../../../types';

// ── Request DTOs ──────────────────────────────────────────────────────────────

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RefreshRequestDto {
  refreshToken: string;
}

export interface LogoutRequestDto {
  refreshToken: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  newPassword: string;
}

// ── Response DTOs — mirrors backend auth.dto.ts ───────────────────────────────

export interface AuthUserDto {
  id: string;
  email: string;
  fullName: string;
  role: RoleName;
  departmentId: string | null;
}

export interface LoginResponseDto {
  user: AuthUserDto;
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
}

export interface RefreshResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface MessageResponseDto {
  message: string;
}
