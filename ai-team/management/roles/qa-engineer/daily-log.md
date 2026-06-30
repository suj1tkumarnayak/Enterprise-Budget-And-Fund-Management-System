# daily_log.md — QA Engineer

> Owner: QA Engineer
> Rule: Append new entries at the TOP. Never delete existing entries.

---

## 2026-06-30 — Session: TASK-016 — auth.test.ts (integration)

**Branch:** `qa-engineer/TASK-016/auth-integration-tests`

Read `ai-team/management/roles/backend-engineer/pending-template.md` and
`handoff-template.md` to confirm the auth module's real state (fully
implemented, including refresh-rotation + reuse detection + lockout) and
that `jest.config.ts`'s coverage key was genuinely fixed (AUDIT-002-BE).
Confirmed TASK-016 (this task) was the only QA-owned gap blocking M2.

Wrote `backend/tests/integration/auth.test.ts`: 5 endpoints × happy path +
the standard error cases (400 validation, 401 unauthenticated, 403
forbidden where applicable), plus a cross-cutting check that none of the
5 routes depend on `authenticate` middleware (correct per the public-route
exemption list in `ARCHITECTURE.md` §4.3 — there's no 403-via-RBAC case to
test here precisely because these routes are pre-auth).

Found one discrepancy while writing the reset-password tests: an invalid/
expired/used reset token throws `ValidationError` (→ HTTP 400) in
`auth.service.ts`, not `BusinessRuleError` (→ HTTP 422) as
`CODING_STANDARD.md` §4's general framing might suggest. Asserted the
actual (400) behavior in the test so the suite reflects reality, and
logged the question to Backend Engineer/System Architect in `pending.md`
rather than silently treating it as a bug — it may well be the correct
classification (a malformed/used credential is arguably closer to "your
request is invalid" than "a business rule was violated").

Could not execute the suite for real — no live Postgres test database
attached in this sandbox session. Mocked Prisma/argon2/jwt/eventBus at
the module boundary (same pattern as `auth.service.test.ts`) so routing,
Zod validation, and the error-handler envelope are exercised for real,
even though the DB layer itself is not. Logged as the explicit first
action for the next QA session in `handoff.md`.

### Next Session Starting Point

1. Run `npm run test:coverage` against a real test DB to confirm this
   suite is actually green and that auth coverage clears 80%.
2. Resolve the 400-vs-422 question with Backend Engineer.
3. M2 is then blocked only on TASK-017 (Security Engineer sign-off).
