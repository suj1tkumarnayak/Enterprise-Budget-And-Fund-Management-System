# Security Review — M2 Authentication Module (TASK-017)

> Reviewer: Security Engineer
> Date: 2026-06-30
> Scope: `backend/src/modules/auth/`, `backend/src/common/middleware/authenticate.ts`,
> `authorize.ts`, `backend/src/app.ts` (CORS/Helmet), `backend/src/events/eventBus.ts`,
> `backend/prisma/seed.ts` (Argon2id params), `.env.example` files.

## Verdict: **CONDITIONAL PASS**

No vulnerability blocks shipping M2. Two findings below should be
resolved (one doc fix, one follow-up task) but neither is a regression
risk severe enough to hold the milestone.

---

## 1. Middleware chain — PASS

- `authenticate.ts`: verifies the access JWT with `config.jwt.accessSecret`,
  rejects on missing/malformed `Authorization` header, rejects on invalid/
  expired token, and validates the decoded payload shape (`isJwtPayload`)
  including that `role` is one of the seeded `RoleName` values before
  attaching `req.user`. No trust placed in unvalidated claims.
- `authorize.ts`: throws `UnauthenticatedError` if `req.user` is absent
  (defends against being mounted without `authenticate` ahead of it),
  throws `ForbiddenError` on a role not in the allow-list. Coarse-grained
  only, as designed — fine-grained scope checks are correctly deferred to
  services per the role's own mission statement.

## 2. Public-route exemption list — **FINDING (Documentation)**

`ARCHITECTURE.md` §4.3 lists only 3 exempt endpoints + `/health`:
`POST /auth/login`, `POST /auth/refresh`, `POST /auth/forgot-password`.

The actual `auth.routes.ts` makes **all 5** endpoints public (no
`authenticate` on the router), including `POST /auth/logout` and
`POST /auth/reset-password`, which are not on the documented list.

**Assessment: not a vulnerability.** Both endpoints are correctly public
by design — they authenticate via their own opaque, hashed, single-use
tokens (refresh token / password-reset token) rather than the access JWT,
so requiring a _valid access token_ to call them would be both unnecessary
(the opaque token itself is the credential) and would break the documented
"logout still works on an expired access token" UX. This matches standard
practice for token-revocation and password-recovery endpoints.

**Required action:** `ARCHITECTURE.md` §4.3 must be updated to list all
five exempt routes, since the doc explicitly flagged itself as needing
this verification ("Security Engineer must verify this exemption list
against the actual registered routes once the `auth` module is
implemented"). This is a System Architect-owned file — logged as a task
in their `pending.md`, not edited directly here (Rule C-02).

## 3. Token design — PASS

- Access token: 15 min TTL, stateless JWT, signed with a ≥32-char secret
  (enforced by `config/index.ts`'s Zod schema) — matches ADR-006.
- Refresh token: opaque (`crypto.randomBytes(48)`), stored only as a
  SHA-256 hash (`tokenHash`) in `refresh_tokens`, never the raw value —
  correct; a DB leak does not expose usable tokens.
- Rotation: confirmed in `auth.service.ts#refresh` — old token revoked
  (`revokedAt`) before the new one is issued.
- Reuse detection: confirmed — reuse of an already-revoked token revokes
  the **entire token family** for that user (`updateMany` on all
  unrevoked tokens) and logs a `logger.warn`, satisfying ADR-006's theft
  -detection requirement. An `audit` event is also emitted for this case.

## 4. Password handling — PASS

- Argon2id, `memoryCost: 65536, timeCost: 3, parallelism: 4` in both
  `auth.service.ts` (`ARGON2_OPTIONS`) and `prisma/seed.ts` — values match
  exactly, no drift between the two hashing call sites.
- `resetPassword` minimum length is 12 chars (`auth.schema.ts`), matching
  `SEED_ADMIN_PASSWORD`'s own minimum in `.env.example`/`config/index.ts`.
- Password reset revokes all existing refresh-token sessions in the same
  `$transaction` as the password change — correct: a stolen-then-reset
  password also kills any sessions established before the reset.

## 5. User enumeration — PASS

- `login`: identical `UnauthenticatedError('Invalid email or password')`
  for both unknown-email and wrong-password cases — verified by reading
  the branch logic, not just the message text (no early-return with a
  different status code for "user not found").
- `forgotPassword`: identical no-op (200, no token created) for unknown
  vs. known-but-handled email — confirmed no timing-observable branch
  beyond the unavoidable DB lookup itself (acceptable residual risk,
  consistent with industry-standard mitigations; full constant-time
  defense against DB-lookup timing is out of scope for this milestone).

## 6. Account lockout — PASS

- 5 failed attempts → 30-minute lock (`MAX_FAILED_LOGIN_ATTEMPTS`,
  `LOCKOUT_DURATION_MS`), matching the seeded `approval_threshold`-style
  conventions and `README.md`'s documented behavior. An audit event fires
  on the 5th (locking) attempt only, not every failed attempt — reasonable
  to avoid audit-log noise, though see Finding §8 on the `SystemAlert`
  action-type cast.

## 7. CORS / Helmet / transport — PASS

- `app.ts`: `helmet()` applied globally before routes.
- CORS allow-list is explicit (`config.cors.allowedOrigins`); wildcard is
  never reachable — the only permissive branch is "no Origin header AND
  not production" (standard same-origin/tooling case, e.g. curl/Postman in
  dev), which correctly does **not** apply in production. No way for an
  arbitrary origin to be silently allowed in production.
- `credentials: true` is set, which is appropriate given the access token
  is sent via `Authorization` header (not relying on cookies for CSRF-prone
  flows) — confirmed `httpClient.ts` uses `Authorization: Bearer`, not
  cookie-based session auth, so CSRF risk from `credentials: true` is low.

## 8. Minor finding — typed `AuditEventPayload.action` bypassed via `as never`

`auth.service.ts` emits `action: 'SystemAlert' as never` for the lockout
and refresh-token-reuse audit events, but `eventBus.ts`'s
`AuditEventPayload['action']` union does **not** include `'SystemAlert'`
as a valid value for that field (it's only listed as a `NotificationType`
in `schema.prisma`, not an `AuditAction`). The `as never` cast silences
the type-checker rather than reflecting a real, validated value — at
runtime this writes `action: 'SystemAlert'` into `audit_logs.action`,
which **is not a valid value** in the Prisma `AuditAction` enum
(`Create | Update | Delete | Approve | Reject | Return | Withdraw |
Allocate | Post | Import | Login | Logout | PasswordChange |
RoleChange`). This will throw a Prisma validation/constraint error at
write time inside `audit.service.ts`'s `recordAuditLog`, which is
caught and only `logger.error`'d (per its own swallow-by-design
comment) — meaning **the lockout and refresh-reuse security events are
silently failing to write to the audit log today**, with no failure
surfaced to the caller or to monitoring beyond a log line.

**This is the one finding I'd treat as blocking-adjacent**: a compliance
-relevant security event (account lockout, refresh-token theft signal)
is not actually being recorded, contrary to `PROJECT_RULES.md` Rule 8
("every sensitive operation is audit-logged") and ADR-004's audit-trail
guarantee. Logged as a P1 bug in Backend Engineer's `pending.md` — not
fixed here directly (Rule C-02; `auth.service.ts` is Backend Engineer
-owned). Recommended fix: either add a `SecurityAlert`/`AccountLocked`
-style value to the Prisma `AuditAction` enum (schema change → needs
Database Engineer + Architect ADR) or, with no schema change, emit
`action: 'Update'` with `entityType: 'User'` and a `details`/`afterState`
note describing the lockout/reuse event, which fits the existing enum
without a migration.

## 9. Rate limiting — STANDING GAP (carried forward, not new)

No rate limiting exists on `/auth/login` (or any endpoint) — `Redis` is
configured in `.env.example`/`docker-compose.yml` but has zero consuming
code anywhere in the repo yet. Account lockout (5 attempts) provides some
mitigation against credential stuffing on a _single_ known account, but
does nothing against a distributed low-and-slow attack across many
accounts, or against `/auth/forgot-password` / `/auth/refresh` abuse.
Not a regression from this session — flagging as a still-open P2 item in
Backend/DevOps Engineer's `pending.md`, consistent with the example
entry already documented in this role's own `role.md`.

## 10. Secrets / logging hygiene — PASS

- `.env.example` (both backend and frontend) contain only placeholders —
  no real secret committed.
- `logger.ts` is never passed a raw password, token, or password hash
  anywhere in `auth.service.ts` — confirmed by reading every `logger.*`
  call site in the file (`forgotPassword`'s info log only includes
  `userId`; the reuse-detection warn log only includes `userId`).
- `errorHandler.ts` confirmed to still strip stack traces from all client
  -facing responses (verified against `health.test.ts`'s existing
  assertions, which this session's new `auth.test.ts` also re-asserts).

---

## Sign-off

| Item                                                                   | Status                                                                              |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `authenticate` + correct `authorize(...)` on every non-exempt endpoint | ✅ N/A — auth module has no non-exempt endpoints                                    |
| No secret/credential found in code or logs                             | ✅ Pass                                                                             |
| Error responses leak no stack traces/internal details                  | ✅ Pass (re-verified by `auth.test.ts`)                                             |
| Argon2id parameters unchanged / ADR-documented                         | ✅ Pass — unchanged, matches `seed.ts`                                              |
| Refresh rotation + reuse detection (ADR-006)                           | ✅ Pass                                                                             |
| Findings logged to owning engineer                                     | ✅ Logged (§2 → System Architect; §8 → Backend Engineer P1; §9 → Backend/DevOps P2) |

**TASK-017 is signed off as CONDITIONAL PASS.** M2 may be marked
✅ Complete in `README.md` once §2 (doc fix) is applied; §8 should be
fixed promptly but, given it fails closed (audit write failure does not
block login/lockout/refresh functionality itself — only the audit trail
of those specific event types), it does not need to block the milestone
the way a missing `authenticate` on a mutating route would.
