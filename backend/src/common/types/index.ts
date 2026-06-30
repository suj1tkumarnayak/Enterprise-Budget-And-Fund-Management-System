import type { Request } from 'express';

// ─── Role names matching the seed data ───────────────────────────────────────

export const ROLE_NAMES = [
  'Admin',
  'FinanceHead',
  'FinanceOfficer',
  'DeptManager',
  'ProjectManager',
  'Employee',
  'Auditor',
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

// ─── JWT payload shape ───────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string; // user UUID
  email: string;
  role: RoleName;
  departmentId: string | null;
  iat: number;
  exp: number;
}

// ─── Authenticated request — augments Express Request ────────────────────────

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: RoleName;
  departmentId: string | null;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

// ─── Standard paginated response envelope ────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ─── Standard API error response shape (matches architecture doc Section 8.1) ─

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | undefined;
  };
}

// ─── Pagination query params ──────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  pageSize: number;
}

// ─── Soft-deletable entity base ───────────────────────────────────────────────

export interface SoftDeletable {
  deletedAt: Date | null;
}
