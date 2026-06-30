# pending.md — Backend Engineer Task Queue

> Owner: Backend Engineer
> Updated: 2026-06-30 — First real entry (created from scratch; only a template existed before)
> Rule: Update at the START and END of every work session.

---

## IN PROGRESS

| Task ID      | Description                                                                                                                            | Priority | Started    | Branch                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------- |
| AUDIT-001-BE | Fix `backend/jest.config.ts`: `coverageThresholds` → `coverageThreshold` (singular). Coverage gate was silently not enforced since M1. | P1       | 2026-06-30 | `backend-engineer/AUDIT-001-BE/fix-jest-coverage-threshold` |

---

## PENDING (not yet started — M2 Authentication, next sprint)

| Task ID      | Description                                                                                                                                                                                                                                                                                                                                                                                                       | Priority | Assigned By                                           | Notes                                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-019     | **Implement `backend/src/events/eventBus.ts`**: typed Node.js EventEmitter singleton. Define `EbfmsEventMap` interface with at minimum: `audit.log` → `AuditLogEventPayload`. Re-export from `index.ts`.                                                                                                                                                                                                          | P1       | System Architect (ADR-007, flagged PROJECT_STATUS.md) | **Hard prerequisite for M2.** Auth service must emit `Login`, `Logout`, `PasswordChange` audit events. Cannot start TASK-010 service until this is done. |
| TASK-010     | **Implement auth module** — all 5 files in order: `auth.schema.ts` (Zod: LoginBody, RefreshBody, ForgotPasswordBody, ResetPasswordBody) → `auth.dto.ts` (TS interfaces: LoginResponseDto, TokenPairDto) → `auth.service.ts` (login, refresh, logout, forgotPassword, resetPassword, Argon2id verify, lockout) → `auth.controller.ts` (thin, asyncHandler) → `auth.routes.ts` (add routes to existing Router stub) | P1       | Project Manager                                       | Read architecture doc §2.1–2.2 + ARCHITECTURE.md §4 + `schema.prisma` User/RefreshToken/PasswordResetToken models BEFORE writing any code                |
| TASK-014     | **Refresh token rotation** (part of TASK-010 service): revoke old token before issuing new; reuse of a revoked token = security event — log it, lock account                                                                                                                                                                                                                                                      | P1       | Project Manager                                       | ADR-006; see `schema.prisma` RefreshToken model                                                                                                          |
| TASK-015     | **Auth service unit tests** (`backend/tests/unit/auth.service.test.ts`): happy path login, invalid credentials, account lockout after 5 failures, successful refresh, revoked-token reuse detection, logout. Service coverage ≥80%.                                                                                                                                                                               | P1       | Project Manager                                       | Write alongside service (TDD where possible), not after                                                                                                  |
| TASK-011-REG | **Register auth router in `app.ts`**: add `import authRoutes from '@modules/auth/auth.routes'` and uncomment `app.use('/api/v1/auth', authRoutes)`                                                                                                                                                                                                                                                                | P1       | Project Manager                                       | Only add the import + uncomment — do NOT change middleware order or global config (Architect-owned per ARCHITECTURE.md §11)                              |

---

## PENDING (M3 — User & Role Management, after M2 completes)

| Task ID  | Description                                                 | Priority | Assigned By     | Notes                                                                                               |
| -------- | ----------------------------------------------------------- | -------- | --------------- | --------------------------------------------------------------------------------------------------- |
| TASK-020 | Users module: CRUD, role assignment, department association | P1       | Project Manager | Depends on M2 complete; RBAC: GET /users → Any; POST/PUT → Admin; DELETE → Admin (soft-delete only) |

---

## BLOCKED

| Task ID  | Description                                | Blocked By                                                                           | Escalated To | Date Blocked |
| -------- | ------------------------------------------ | ------------------------------------------------------------------------------------ | ------------ | ------------ |
| TASK-010 | Auth module implementation (service layer) | TASK-019 (eventBus.ts must be implemented before auth service can emit audit events) | —            | 2026-06-30   |

---

## DONE (M1 Foundation — completed before this role had a handoff trail)

| Task ID  | Description                                                                                                                                                                                                                                      | Completed        | PR / Commit |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ----------- |
| TASK-006 | Backend scaffold: `app.ts`, `server.ts`, `config/index.ts` with Zod env validation, `asyncHandler.ts`, `AppError` hierarchy, `errorHandler.ts`, `notFound.ts`, `requestLogger.ts`, `decimal.ts`, `logger.ts`, `types/index.ts`, Prisma singleton | M1 (pre-session) | —           |
| TASK-012 | `authenticate.ts` middleware: JWT validation, req.user attachment, isJwtPayload type guard                                                                                                                                                       | M1 (pre-session) | —           |
| TASK-013 | `authorize.ts` middleware: role-based access control factory `authorize(...allowedRoles)`                                                                                                                                                        | M1 (pre-session) | —           |

> **NOTE on TASK-012 and TASK-013**: These are listed in `BACKLOG.md` as M2 tasks. They were in fact implemented during M1 as part of the common middleware scaffold. **Do not re-implement them.** They are production-ready.

---

## DONE (this session — 2026-06-30)

| Task ID       | Description                                                 | Completed  | PR / Commit                                         |
| ------------- | ----------------------------------------------------------- | ---------- | --------------------------------------------------- |
| AUDIT-001-BE  | Fix `jest.config.ts` coverage threshold key                 | 2026-06-30 | See `/mnt/user-data/outputs/backend/jest.config.ts` |
| INTAKE-001-BE | Full repo read-through; all 4 role management files created | 2026-06-30 | See output files                                    |

---

## Priority Legend

- **P1** — Blocks another role or the current sprint milestone. Do this first.
- **P2** — Important, should be done this sprint.
- **P3** — Backlog; do after P1 and P2 are clear.

---

## Implementation Notes for TASK-010 (Auth Service)

### Files to read BEFORE writing any code

1. `ARCHITECTURE.md` §4 — JWT strategy, public-route exemption list
2. `EBFMS_Architecture_Document.docx` §2.1 (Authentication) and §2.2 (Authorization) — business rules
3. `backend/prisma/schema.prisma` — User, RefreshToken, PasswordResetToken models
4. `backend/src/common/types/index.ts` — `JwtPayload` interface the JWT must match
5. `backend/src/common/middleware/authenticate.ts` — what the token must contain

### Business rules summary

- Password: Argon2id, verify with `argon2.verify(hash, password)`
- Lockout: increment `failedLoginAttempts`; set `lockedUntil` when threshold hit (suggest 5 attempts)
- `mustChangePassword = true`: login succeeds but returns 403 with code `MUST_CHANGE_PASSWORD`
- Access token: JWT, 15min TTL, payload matches `JwtPayload` (sub, email, role, departmentId, iat, exp)
- Refresh token: opaque UUID, stored as **hash** in `refresh_tokens`, rotated on every use
- Refresh reuse: if old token (already revoked) is used again → security event, lock account
- Password reset: single-use token, hashed in `password_reset_tokens`, expires via `expiresAt`

### Public routes (no `authenticate` middleware)

Per `ARCHITECTURE.md` §4.3:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/forgot-password`

Routes that still need a token:

- `POST /api/v1/auth/logout` — needs to identify which refresh token to revoke (pass token in body)
- `POST /api/v1/auth/reset-password` — needs the one-time reset token (in body, not a JWT)
