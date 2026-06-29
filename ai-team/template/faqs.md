# faqs.md
## EBFMS Frequently Asked Questions

> Maintained by: Documentation Engineer
> Updated: When a question appears more than once across role sessions.
> Purpose: Answers that new Claude instances ask repeatedly.

---

## Process & Workflow

**Q: I'm a new Claude starting my first session. What do I do?**
A: Read `BOOTSTRAP.md` from start to finish. Follow the mandatory reading
order in Section 2 exactly. Do not write any code until you have read
all mandatory files. The reading order takes less than 5 minutes and
eliminates almost every onboarding question.

**Q: I finished my task. What do I do before ending my session?**
A: Exactly this, in order: update `progress.md`, update `daily_log.md`,
update `handoff.md` (be specific — the next Claude depends on this), update
`pending.md` (move task to done), push your branch. See `BOOTSTRAP.md`
Section 8 for the full checklist.

**Q: Another role's file has a bug I can see. Can I fix it?**
A: No. Log a task in that role's `pending.md` with the exact problem and
the exact file. The owning role fixes it. See `PROJECT_RULES.md` Rule 2
and `ARCHITECTURE.md` Section 11.

**Q: I need to make an architectural decision. What's the process?**
A: Write a draft `DECISION_REGISTER.md` entry using the template at the
bottom of that file, set status to "Proposed", then flag it in the System
Architect's `pending.md`. Do not implement until the ADR status is "Accepted".

---

## Backend Development

**Q: How do I add a new API endpoint?**
A: In the module's `.routes.ts` file, add the route following the existing
pattern: `router.METHOD('/path', authenticate, authorize([...roles]),
validate(schema), controller)`. Register the router in `backend/src/app.ts`
if this is a new module.

**Q: What roles are available to pass to `authorize()`?**
A: `'Admin'`, `'FinanceHead'`, `'FinanceOfficer'`, `'DeptManager'`,
`'ProjectManager'`, `'Employee'`, `'Auditor'`. Match the RBAC matrix in
`ARCHITECTURE.md` / architecture `.docx` Section 3.8.

**Q: How do I handle monetary values in TypeScript?**
A: Import from `backend/src/common/utils/decimal.ts`. Use `add()`,
`subtract()`, `multiply()`, `isGreaterThan()`, etc. Never use `+`, `-`, `*`
on monetary values with native `number`. See `PROJECT_RULES.md` Rule 7.

**Q: Where should I put business logic vs. controller logic?**
A: Business logic goes in `.service.ts`. Controllers are one-liners:
parse body, call service, return result. See `CODING_STANDARD.md` Section 2.

**Q: How do I emit an audit log?**
A: `import { auditService } from '../audit/audit.service'` — wait, actually
use the event bus: `eventBus.emit('audit', { action: 'CREATE', entityType:
'BudgetRequest', entityId: result.id, actorId, afterState: result })`.
See `ARCHITECTURE.md` Section 7 and ADR-007.

**Q: Can I change the Prisma schema?**
A: Only after an Accepted ADR entry exists. Read `PROJECT_RULES.md` Rule 4
and `Database_Engineer.md` before touching `schema.prisma`.

---

## Frontend Development

**Q: How do I call the backend API?**
A: Create a function in your feature's `api/` folder that uses `httpClient`
from `frontend/src/api/httpClient.ts`. Never call `fetch` or `axios` directly
from a component or hook. See `CODING_STANDARD.md` Section 3.

**Q: How do I display a monetary value?**
A: `import { formatMoney } from '../../utils/currency'`. The value from the
API is a string (Prisma Decimal serialises that way). Pass it to `formatMoney`
— do not parse it to `number`.

**Q: Where does global state live?**
A: In Zustand, at `frontend/src/store/`. Local component state uses
`useState`. Per-feature state that doesn't need to be shared can stay in a
custom hook.

---

## Database

**Q: Why is there no foreign key on `ApprovalInstance.entityId`?**
A: This is an intentional architectural decision (ADR-002). The approval
engine is polymorphic — `entityId` can refer to a `BudgetRequest` or an
`Expense`. A DB-level FK can only point to one table. Referential integrity
is enforced at the application layer. Do not add a DB FK — this decision is
immutable.

**Q: How do I run a migration?**
A: `npx prisma migrate dev --name <descriptive-name>`. The migration file is
auto-generated. Review it before committing. Never edit a migration file after
it has been committed.

**Q: How do I add test data?**
A: Add to `backend/prisma/seed.ts` using `upsert` (not `create`). Run
`npm run db:seed`. Seed must remain idempotent.
