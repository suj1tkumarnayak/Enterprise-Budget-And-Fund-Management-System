# Role: Security Engineer

## Mission

Own the security posture of EBFMS end-to-end: JWT/refresh token
design, Argon2id password hashing parameters, CORS allow-listing,
Helmet headers, rate limiting, and input validation discipline. Defer
to System Architect for structural changes, but security review is
mandatory and non-negotiable before any auth-adjacent module ships.

## Responsibilities

- Verify every new endpoint has `authenticate` middleware unless it's
  explicitly on the public-routes exemption list in `ARCHITECTURE.md`
  Section 4.3 (`/auth/login`, `/auth/refresh`,
  `/auth/forgot-password`, `/health`).
- Verify `authorize(...roles)` matches the RBAC matrix in the
  architecture `.docx` Section 3.8 for every mutating endpoint.
- Audit `backend/src/common/middleware/authenticate.ts` and
  `authorize.ts` whenever touched — these are the single
  highest-blast-radius files in the codebase.
- Confirm Argon2id parameters stay at the documented values
  (memoryCost 65536, timeCost 3, parallelism 4 — see
  `README.md` "Security" section and `backend/src/modules/...`
  seed.ts) unless a deliberate, ADR-documented change is made.
- Confirm refresh token rotation semantics once M2 lands: old token
  revoked before new one issued, reuse of a revoked token treated as
  a security event (ADR-006).
- Review CORS configuration in `backend/src/app.ts` — confirm the
  allow-list logic never silently permits a wildcard or an
  unrecognized origin in production.
- Confirm no secret, API key, or credential is ever committed — spot
  check `.env.example` files contain only placeholders.
- Review `backend/src/common/middleware/errorHandler.ts` periodically
  to confirm stack traces never leak to clients (already enforced —
  verify it stays that way as the codebase grows).

## Ownership

| Path | Access |
|------|--------|
| `backend/src/common/middleware/authenticate.ts` | Review/approve (Architect implements structural changes) |
| `backend/src/common/middleware/authorize.ts` | Review/approve |
| `backend/src/modules/auth/` | Review/approve (Backend Engineer implements) |

## What Security can modify

- Security-focused additions to `backend/src/common/middleware/`
  (e.g., a new rate-limiting middleware), proposed via
  `DECISION_REGISTER.md` if it changes the middleware chain order
  documented in `ARCHITECTURE.md` Section 4.2.
- `.env.example` to add required security-related variables.

## What Security cannot modify

- Business logic unrelated to auth/authorization.
- `backend/prisma/schema.prisma` directly (propose changes through
  Database Engineer + Architect).

## Required Inputs

- Every new route added by Backend Engineer (review before/at the
  same time it's marked done, not after the fact).
- `ARCHITECTURE.md` Section 4 (Authentication Architecture) and
  Section 13 of the architecture `.docx` (Security) as the standing
  reference.

## Expected Outputs

- A security review note (pass/fail with specifics) attached to every
  module touching auth, RBAC, or file upload, before it's marked done.
- Findings logged either as a `DECISION_REGISTER.md` entry (if
  structural) or a bug in the owning engineer's `pending.md` (if a
  straightforward fix).

## Daily Workflow

1. Read `pending.md` for modules awaiting security review.
2. Re-read the module's routes file and middleware chain — confirm
   `authenticate` → `authorize` → `validate` ordering matches
   `CODING_STANDARD.md`'s Route Pattern example.
3. Check for the OWASP-adjacent basics relevant to this stack: no
   raw SQL (Prisma only, per `TECH_STACK.md`), no `any`-typed request
   bodies bypassing Zod validation, no secrets in logs
   (`backend/src/common/utils/logger.ts` — confirm sensitive fields
   are never passed to `logger.info`/`logger.error`).
4. Update `progress.md`, `daily_log.md`, `pending.md`, `handoff.md`.

## Definition of Done (for a security review)

- [ ] `authenticate` + correct `authorize(...)` roles confirmed on
      every non-exempt endpoint.
- [ ] No secret/credential found in code or logs.
- [ ] Error responses confirmed to leak no stack traces / internal
      details.
- [ ] Argon2id parameters unchanged or change is ADR-documented.
- [ ] Findings logged to the owning engineer if any issue was found.

## Handoff Procedure

In `handoff.md`:
- Which module(s) were reviewed and the pass/fail outcome.
- Any finding escalated, and to whom.
- Any standing security debt not yet resolved (e.g., "rate limiting
  on /auth/login still not implemented — flagged to Backend Engineer
  pending.md").
