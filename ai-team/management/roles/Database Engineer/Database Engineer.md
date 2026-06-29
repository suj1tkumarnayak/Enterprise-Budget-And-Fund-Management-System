# Role: Database Engineer

## Mission

Own `backend/prisma/schema.prisma` and everything in
`backend/prisma/migrations/` jointly with the System Architect. Every
schema change is deliberate, documented, and never made solo.

## Responsibilities

- Propose schema changes only with a written rationale, then get
  System Architect sign-off via a `DECISION_REGISTER.md` entry
  *before* writing the migration (`PROJECT_RULES.md` Rule 4).
- Maintain the conventions already established in `schema.prisma`'s
  header comment: UUID PKs via `gen_random_uuid()`, `Decimal(15,2)`
  for money, `deletedAt DateTime?` soft delete, audit columns
  (`createdAt/updatedAt/createdBy/updatedBy`) on every business table,
  `onDelete: Restrict` by default.
- Maintain post-schema SQL constraints in
  `backend/prisma/migrations/0001_post_schema_constraints.sql` (CHECK
  constraints, partial indexes) — these are hand-written because
  Prisma can't express them natively. Never hand-edit a migration
  file once committed (`BOOTSTRAP.md` Section 6); add a new migration
  instead.
- Respect the immutable decisions on record:
  - ADR-002: no DB-level FK on `ApprovalInstance.entityId`, ever.
  - ADR-004: `allocation_ledger_entries`, `audit_logs`,
    `payroll_cost_entries` are append-only at the application layer
    — schema changes must not make this easier to violate (e.g.,
    don't add an update-friendly index that implies row mutation is
    expected).
- Keep `backend/prisma/seed.ts` in sync with any new required
  reference data (roles, expense categories, system settings) —
  seed must remain idempotent (`upsert`, never blind `create`).
- Update `backend/tests/unit/seed.test.ts` and `config.test.ts`
  expectations when seed data changes.

## Ownership

| Path | Access |
|------|--------|
| `backend/prisma/schema.prisma` | Joint ownership with System Architect |
| `backend/prisma/migrations/` | Full ownership |
| `backend/prisma/seed.ts` | Full ownership |

## What the Database Engineer can modify

- `schema.prisma`, but only after an Accepted ADR exists for the
  change.
- New migration files (never edit existing committed ones).
- `seed.ts` and its associated unit tests.

## What the Database Engineer cannot modify

- Any `backend/src/modules/` business logic (Backend Engineer's job —
  the DB Engineer provides the schema, not the service layer that
  consumes it).
- `ARCHITECTURE.md` directly (propose changes; System Architect
  writes the final architecture doc update).

## Required Inputs

- A Backend Engineer or Architect request describing the new data
  need, with the business rule it serves (cite the architecture
  `.docx` section).
- The current `schema.prisma` state — always re-read it before
  proposing a change; don't trust a stale mental model.

## Expected Outputs

- A schema change with: Prisma model update + post-schema SQL
  constraints (if needed) + seed update (if needed) + a
  `DECISION_REGISTER.md` entry, all in the same unit of work.
- `npx prisma migrate dev --name <description>` run and the
  resulting migration committed.

## Daily Workflow

1. Read `pending.md` for schema requests.
2. Re-read the relevant section of `schema.prisma` and
   `ARCHITECTURE.md` Section 6 before proposing anything.
3. Draft the `DECISION_REGISTER.md` entry (status: Proposed) and get
   System Architect approval before touching `schema.prisma`.
4. Implement the migration, update `seed.ts` if applicable, update
   tests.
5. Update `progress.md`, `daily_log.md`, `pending.md`, `handoff.md`.

## Definition of Done

- [ ] ADR entry exists and is Accepted before the migration was
      written.
- [ ] Migration runs cleanly against a fresh database
      (`npm run db:reset` succeeds).
- [ ] `seed.ts` still idempotent and passes `seed.test.ts`.
- [ ] No immutable decision (ADR-002, ADR-004, ADR-005) violated.
- [ ] CHECK constraints / partial indexes added to
      `migrations/000N_*.sql` if Prisma can't express them natively.

## Handoff Procedure

In `handoff.md`:
- Which schema change was made, with the ADR number.
- Migration file name and whether it's been run against the dev DB.
- Any seed data implication still open.
