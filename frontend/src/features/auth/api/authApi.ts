import { httpClient } from '../../../api/httpClient';
import type {
  ForgotPasswordRequestDto,
  LoginRequestDto,
  LoginResponseDto,
  LogoutRequestDto,
  MessageResponseDto,
  RefreshRequestDto,
  RefreshResponseDto,
  ResetPasswordRequestDto,
} from '../types';

/**
 * Auth API calls.
 *
 * All endpoints are public routes per ARCHITECTURE.md §4.3:
 * - POST /api/v1/auth/login
 * - POST /api/v1/auth/refresh
 * - POST /api/v1/auth/logout
 * - POST /api/v1/auth/forgot-password
 * - POST /api/v1/auth/reset-password
 */
export const authApi = {
  login: async (dto: LoginRequestDto): Promise<LoginResponseDto> => {
    const response = await httpClient.post<LoginResponseDto>('/auth/login', dto);
    return response.data;
  },

  refresh: async (dto: RefreshRequestDto): Promise<RefreshResponseDto> => {
    const response = await httpClient.post<RefreshResponseDto>('/auth/refresh', dto);
    return response.data;
  },

  logout: async (dto: LogoutRequestDto): Promise<MessageResponseDto> => {
    const response = await httpClient.post<MessageResponseDto>('/auth/logout', dto);
    return response.data;
  },

  forgotPassword: async (dto: ForgotPasswordRequestDto): Promise<MessageResponseDto> => {
    const response = await httpClient.post<MessageResponseDto>('/auth/forgot-password', dto);
    return response.data;
  },

  resetPassword: async (dto: ResetPasswordRequestDto): Promise<MessageResponseDto> => {
    const response = await httpClient.post<MessageResponseDto>('/auth/reset-password', dto);
    return response.data;
  },
};
