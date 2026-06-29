# PROJECT_RULES.md
## EBFMS — Non-Negotiable Project Rules

> These rules are enforced unconditionally. No exceptions, no overrides.
> Violation of these rules requires an entry in the DECISION_REGISTER with justification.

---

## RULE 1 — GITHUB IS THE ONLY SOURCE OF TRUTH

- All documentation lives in the repository.
- No decision exists unless it is committed to GitHub.
- No task exists unless it is in the task files.
- No architectural choice is valid unless it is in `ARCHITECTURE.md` or `DECISION_REGISTER.md`.

---

## RULE 2 — NEVER TOUCH ANOTHER ROLE'S OWNERSHIP WITHOUT APPROVAL

Each file and module has a designated owner (see `ARCHITECTURE.md`).
- You may **read** any file.
- You may **not modify** files outside your ownership without explicit approval documented in `DECISION_REGISTER.md`.
- Emergency exceptions must be documented within the same commit.

---

## RULE 3 — NEVER INVENT API CONTRACTS

- All API endpoints are defined in `backend/src/modules/<module>/<module>.routes.ts`
- All request/response shapes are defined in `<module>.dto.ts`
- If you need a new endpoint, create a task and assign it to the Backend Engineer.
- Frontend must use only endpoints that exist in the backend routes files.

---

## RULE 4 — NEVER CHANGE THE DATABASE SCHEMA ALONE

- Schema changes require approval from both the **Database Engineer** AND the **System Architect**.
- The approval must be documented in `DECISION_REGISTER.md` before the migration is written.
- Schema changes must include a migration file and a seed update if applicable.
- Never manually edit migration SQL files once committed.

---

## RULE 5 — NEVER DELETE DOCUMENTATION

- Outdated docs must be **updated**, not deleted.
- Deprecated sections must be marked with `> ⚠️ DEPRECATED as of [DATE]` and the reason.
- If a file is truly obsolete, move it to `ai-team/archive/` with a deprecation note.

---

## RULE 6 — ALWAYS READ ARCHITECTURE BEFORE CODING

- Before writing any new module, service, or component, read:
  - `ai-team/architecture/ARCHITECTURE.md`
  - The relevant section of `TECH_STACK.md`
  - The existing module structure in `backend/src/modules/`
- Ignorance of the architecture is not a valid excuse for deviating from it.

---

## RULE 7 — ALL MONETARY VALUES ARE DECIMAL(15,2)

- This is enforced at the DB level via Prisma schema.
- All monetary arithmetic in TypeScript MUST use the `decimal.ts` utility (`backend/src/common/utils/decimal.ts`).
- **Never** use native JavaScript `number` for financial calculations. Floating point errors in financial systems are unacceptable.

---

## RULE 8 — ALL SENSITIVE OPERATIONS ARE AUDIT-LOGGED

- Every Create, Update, Delete, Approve, Reject, Allocate, Post operation must produce an `AuditLog` entry.
- The audit service is at `backend/src/modules/audit/audit.service.ts`.
- Skipping audit logging for "convenience" is a critical bug.

---

## RULE 9 — SECRETS NEVER ENTER THE REPOSITORY

- `.env` files are git-ignored.
- Use `.env.example` files to document required variables.
- No API keys, passwords, tokens, or connection strings in any committed file.
- If a secret is accidentally committed, treat it as compromised immediately.

---

## RULE 10 — ALL ENDPOINTS REQUIRE AUTHENTICATION BY DEFAULT

- Every Express route must go through the `authenticate` middleware unless explicitly exempted.
- Exemptions (public routes like `/health`, `/auth/login`) must be listed in `ARCHITECTURE.md`.
- Authorization checks (role-based) use the `authorize` middleware.

---

## RULE 11 — SOFT DELETE ONLY

- Business entities use soft delete: `deletedAt DateTime? @db.Timestamptz`
- `NULL` = active, non-null = deleted.
- Hard deletes of financial records are **forbidden** — they break audit trails.
- Financial data (FundAllocation, AllocationLedgerEntry, AuditLog) is **append-only** at the application layer.

---

## RULE 12 — COMMIT MESSAGES FOLLOW CONVENTIONAL COMMITS

Format: `<type>(<scope>): <description>`

```
feat(allocations): add bulk allocation endpoint
fix(auth): prevent refresh token reuse after revocation
chore(deps): upgrade prisma to 5.14.0
docs(architecture): document polymorphic approval engine
test(expenses): add integration test for expense rejection flow
refactor(budget-requests): extract status machine to separate service
```

Valid types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`, `ci`, `build`

---

## RULE 13 — ALL WORK IS DONE ON BRANCHES

- `main` is protected — no direct pushes.
- All work happens on feature branches.
- Branch naming: `<role>/<task-id>/<short-description>`
- PRs require at least one review before merge.

---

## RULE 14 — UPDATE ROLE FILES BEFORE ENDING ANY SESSION

Before finishing work, every Claude MUST update:
- `progress.md`
- `daily_log.md`
- `handoff.md`
- `pending.md`

This is non-negotiable. It is how the next Claude picks up without data loss.

---

## RULE 15 — TYPESCRIPT STRICT MODE IS ALWAYS ON

- `strict: true` is set in all `tsconfig.json` files.
- No `any` types without a documented reason in a comment.
- All async functions return typed Promises.
- All Express handlers use `asyncHandler` wrapper.

---

*These rules are maintained by the System Architect and Project Manager.*
*Changes require a DECISION_REGISTER entry with justification.*
