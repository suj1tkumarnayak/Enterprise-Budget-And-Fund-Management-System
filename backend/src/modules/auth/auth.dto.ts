import type { RoleName } from '@common/types';

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
