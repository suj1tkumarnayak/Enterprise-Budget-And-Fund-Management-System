/**
 * Shared frontend types.
 *
 * These mirror the backend DTOs and API response shapes.
 * Domain-specific types live inside their feature folder.
 */

// ─── Role names (mirror backend RoleName) ────────────────────────────────────

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

// ─── Authenticated user stored in Zustand auth slice ─────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: RoleName;
  departmentId: string | null;
}

// ─── Standard paginated API response ─────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ─── Standard API error shape ─────────────────────────────────────────────────

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>|undefined;
  };
}

// ─── Select option (used by form dropdowns) ───────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}
