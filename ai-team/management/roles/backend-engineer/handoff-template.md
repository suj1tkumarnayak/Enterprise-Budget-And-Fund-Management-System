# handoff.md — Backend Engineer

## Handoff — 2026-06-30 UTC

### Role

Backend Engineer

### Session Summary

This was a full repository intake session. All 230+ project files were read and analyzed. No module implementation was started. One critical bug was fixed (`jest.config.ts` coverage threshold key — 80% gate was silently unenforced since M1). All four Backend Engineer role management files were created from scratch. The project stands at M1 complete, M2 ready-to-start, all 15 module stubs untouched.

---

### Completed This Session

- Full read-through of all repository files in context
- **Fixed `backend/jest.config.ts`**: `coverageThresholds` (invalid key, silently ignored by Jest) → `coverageThreshold` (correct). The 80% coverage gate was never enforced — it is now.
- Created `progress.md` (milestone + task tracking), `pending.md` (actionable queue), `daily_log.md`, and this `handoff.md`
- Identified and formalized **TASK-019** (eventBus.ts implementation) — was flagged by System Architect as needed but missing from BACKLOG.md
- Documented TASK-012 / TASK-013 as already complete (they were done in M1, but BACKLOG.md still lists them as M2 pending)

---

### Current State

| Field               | Value                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| Branch              | `backend-engineer/AUDIT-001-BE/fix-jest-coverage-threshold`                                         |
| Last commit         | (files staged for output; commit after review)                                                      |
| CI status           | Should be green after `jest.config.ts` fix lands; verify on next push                               |
| Files modified      | `backend/jest.config.ts` (1-line key fix)                                                           |
| Files created       | `ai-team/management/roles/backend-engineer/progress.md`, `daily_log.md`, `handoff.md`, `pending.md` |
| Modules implemented | 0 of 15 (all `export {}` stubs)                                                                     |

---

### Next Steps for Incoming Backend Engineer Claude — BE PRECISE

**Step 1 — Verify the jest.config.ts fix is applied**

```bash
grep -n "coverageThreshold" backend/jest.config.ts
# Should output ONE line: 'coverageThreshold: {' (no 's')
# If it still says 'coverageThresholds', apply the fix from the output file
```

**Step 2 — Implement `backend/src/events/eventBus.ts` (TASK-019, P1)**

The file currently contains only `export {}`. You need to replace it with a typed event bus. Minimum viable implementation for M2:

```typescript
import EventEmitter from 'events';

// ── Payload types ─────────────────────────────────────────────────────────────
export interface AuditLogEventPayload {
  actorId: string | null;
  action: string; // AuditAction enum value from schema.prisma
  entityType: string;
  entityId: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  ipAddress?: string;
}

// ── Event map ──────────────────────────────────────────────────────────────────
export interface EbfmsEventMap {
  'audit.log': [AuditLogEventPayload];
  // Expand as more modules are implemented:
  // 'notification.send': [NotificationEventPayload];
  // 'analytics.invalidate': [{ departmentId: string }];
}

// ── Typed emitter ─────────────────────────────────────────────────────────────
class EbfmsEventBus extends EventEmitter {
  emit<K extends keyof EbfmsEventMap>(event: K, ...args: EbfmsEventMap[K]): boolean {
    return super.emit(event, ...args);
  }
  on<K extends keyof EbfmsEventMap>(event: K, listener: (...args: EbfmsEventMap[K]) => void): this {
    return super.on(event, listener as (...args: unknown[]) => void);
  }
}

export const eventBus = new EbfmsEventBus();
```

Also update `backend/src/events/index.ts` to re-export everything meaningfully:

```typescript
export * from './eventBus';
```

**Step 3 — Implement the auth module (TASK-010)**

Read these files BEFORE writing a single line of auth code:

1. `ARCHITECTURE.md` §4 — token strategy, public routes list
2. `EBFMS_Architecture_Document.docx` §2.1 (Authentication) — all business rules
3. `backend/prisma/schema.prisma` — User, RefreshToken, PasswordResetToken models
4. `backend/src/common/types/index.ts` — JwtPayload interface you must match
5. `backend/src/common/middleware/authenticate.ts` — what claims your JWT must include

Implement in this exact order (validation-first principle per CODING_STANDARD.md §2):

```
auth.schema.ts   → Zod schemas for all 5 request bodies
auth.dto.ts      → TypeScript interfaces for request/response
auth.service.ts  → All business logic; emit 'audit.log' events
auth.controller.ts → Thin HTTP layer; all wrapped in asyncHandler
auth.routes.ts   → Add routes to existing Router stub (file already exists with empty Router)
```

**Step 4 — Register auth router in `app.ts`**

Add to `backend/src/app.ts` AFTER the existing imports block:

```typescript
import authRoutes from '@modules/auth/auth.routes';
```

Then uncomment the matching line in the routes section:

```typescript
app.use('/api/v1/auth', authRoutes);
```

**DO NOT** change middleware order or any other line in app.ts — that's Architect-owned.

**Step 5 — Write tests alongside the service (TASK-015)**

File: `backend/tests/unit/auth.service.test.ts`

Must cover:

- Successful login (returns token pair, clears failed attempts)
- Login with wrong password (increments failedLoginAttempts)
- Login on locked account (returns 401 ACCOUNT_LOCKED)
- Login with `mustChangePassword = true` (returns 403 MUST_CHANGE_PASSWORD)
- Successful token refresh (old token revoked, new token issued)
- Refresh with revoked token (security event, account locked)
- Logout (token revoked)
- `npm run test:coverage` must show ≥80% on `auth.service.ts`

---

### Blockers / Decisions Needed

| Blocker                                       | Owner                  | Notes                                                                                                                                                                                                                                                                      |
| --------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| eventBus.ts implementation                    | Backend Engineer (you) | See Step 2 above; unblock before auth service                                                                                                                                                                                                                              |
| Account lockout threshold (N failed attempts) | Architecture decision  | Doc says "N failed attempts" without specifying N. Suggest: read from `system_settings` key `account_lockout_threshold` (seed at 5). If not in system_settings yet, hardcode 5 for M2 and add to seed in same PR. Check with DB Engineer if a new seed entry needs an ADR. |

---

### Context That Doesn't Exist in Code

- **TASK-012/013 are done**: `authenticate.ts` and `authorize.ts` are fully implemented in `backend/src/common/middleware/`. BACKLOG.md lists them as M2 tasks — they are not. Do not re-implement.

- **The jest.config.ts fix**: The `jest.config.FIX-REFERENCE.ts` file mentioned in the System Architect's handoff was a reference the SA left (not an actual committed file). The real fix was applied by the Backend Engineer this session. The SA's reference is obsolete.

- **server.ts imports prisma from `@prisma/client`**: This resolves to `backend/src/prisma/client.ts` (the singleton) via tsconfig path alias `@prisma/*`. It does NOT import from the actual Prisma npm package. The singleton in turn imports `PrismaClient` from the actual `@prisma/client` package. This is by design. Do not change this pattern.

- **auth.routes.ts already has a Router**: `backend/src/modules/auth/auth.routes.ts` already contains `import { Router } from 'express'; const router = Router(); export default router;`. Just add your routes to the existing `router` object. Do not start from scratch.

- **Public routes distinction** (critical for auth router):
  - `/login`, `/refresh`, `/forgot-password` → **no** `authenticate` middleware (public per ARCHITECTURE.md §4.3)
  - `/logout`, `/reset-password` → **no** standard JWT `authenticate` needed either (logout receives the refresh token as body param to identify what to revoke; reset-password uses its own one-time token). These are effectively also public-facing but require their own token validation inside the service.

- **Argon2 parameters for password verification** (set in seed.ts, must match in auth service):
  - `type: argon2.argon2id`
  - `memoryCost: 65536` (64 MiB)
  - `timeCost: 3`
  - `parallelism: 4`

---

### Files the Incoming Claude Should Open First

1. `backend/src/events/eventBus.ts` — first thing to implement (Step 2 above)
2. `backend/src/events/index.ts` — update re-export after eventBus is done
3. `backend/prisma/schema.prisma` — scroll to `User`, `RefreshToken`, `PasswordResetToken` models
4. `backend/src/common/types/index.ts` — `JwtPayload` interface
5. `ai-team/management/roles/backend-engineer/pending.md` — your task queue
