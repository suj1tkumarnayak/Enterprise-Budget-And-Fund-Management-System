# anti-patterns.md
## EBFMS Anti-Patterns

> Maintained by: Documentation Engineer + Code Reviewer
> Purpose: Document things that look reasonable but are wrong in this codebase.
> Updated: When a new anti-pattern is identified in PRs or post-mortems.

---

## Anti-Pattern: "I'll Add the Audit Log Later"

**Looks like:** Shipping a service method that creates/updates/deletes data
without an audit log entry, planning to add it "in a cleanup PR."
**Why it's wrong:** The cleanup PR never comes. Financial operations without
audit trails violate `PROJECT_RULES.md` Rule 8 and may break compliance
requirements. Every state-changing operation must emit an audit log entry in
the same service call, not in a follow-up.
**Correct:** Audit log emission is part of the Definition of Done. No service
method that mutates financial data is "done" without it.

---

## Anti-Pattern: Hardcoded Role Strings in Business Logic

**Looks like:**
```typescript
if (user.role.name === 'FinanceHead' || user.role.name === 'Admin') {
  // allow
}
```
**Why it's wrong:** Role checks scattered through service code are impossible
to audit, easy to miss when roles change, and violate the principle that
authorization is enforced in the middleware layer.
**Correct:** Use the `authorize(['FinanceHead', 'Admin'])` middleware in the
route definition. If a business rule requires role-aware branching inside a
service, use a typed permission check, not string comparison.

---

## Anti-Pattern: Querying Transactional Tables in Analytics Endpoints

**Looks like:**
```typescript
// analytics.service.ts
const burnRate = await prisma.expense.aggregate({
  where: { status: 'Posted', departmentId },
  _sum: { amount: true }
});
```
**Why it's wrong:** Analytics queries on live transactional tables add read
load to the OLTP tier, can cause table-level lock contention, and will degrade
as data grows. `ARCHITECTURE.md` Section 14 and the architecture doc Section
4.11 explicitly require analytics to run from `analytics_snapshots`.
**Correct:** Analytics endpoints read from pre-aggregated snapshot tables,
refreshed on a schedule by background jobs.

---

## Anti-Pattern: Returning Full Prisma Models From Services

**Looks like:**
```typescript
return prisma.user.findUnique({ where: { id } });
// Returns: { id, email, passwordHash, failedLoginAttempts, ... }
```
**Why it's wrong:** Prisma models often include sensitive fields
(`passwordHash`, `failedLoginAttempts`, `lockedUntil`) that must never be
serialized to API responses.
**Correct:** Always map to a DTO. Use `select` in the Prisma query or map
the result to the DTO type before returning from the service.

---

## Anti-Pattern: Swallowing Errors in Catch Blocks

**Looks like:**
```typescript
try {
  await expensiveOperation();
} catch (err) {
  // do nothing, or just console.log(err)
}
```
**Why it's wrong:** Silent failures are the hardest bugs to diagnose. In a
financial system, a silently failed audit log write or ledger entry is a
data integrity problem.
**Correct:** Either handle the error explicitly and throw an `AppError` if
it affects the response, or log it at `logger.error()` level and decide
whether to re-throw or continue.

---

## Anti-Pattern: Using `any` as an Escape Hatch

**Looks like:**
```typescript
const data: any = req.body;
data.amount.toString(); // TypeScript won't catch the crash at runtime
```
**Why it's wrong:** `any` defeats TypeScript's entire value proposition. In
a financial system, a runtime type error on an amount field can mean a $0
allocation or a crash.
**Correct:** Define a Zod schema, validate `req.body` against it before it
reaches the controller, and type the validated result. If `any` is truly
unavoidable, document why in a comment.

---

## Anti-Pattern: Editing a Committed Migration File

**Looks like:** Opening `migrations/0001_initial.sql` and changing a column
type after the migration has been applied to any environment.
**Why it's wrong:** Prisma (and Flyway-style tools) track migration history
by file hash. Editing a committed file causes the migration history to diverge
between environments, making it impossible to `migrate deploy` cleanly.
**Correct:** Always add a new migration file. If a column type was wrong in
a previous migration, write a new `ALTER TABLE` migration.

---

## Anti-Pattern: Direct DB Access Bypassing Prisma

**Looks like:**
```typescript
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const result = await pool.query(`SELECT * FROM budget_requests WHERE id = $1`, [id]);
```
**Why it's wrong:** Bypasses Prisma's type safety, soft-delete middleware
(if applied), and connection pooling configuration. Raw queries also risk
SQL injection if string interpolation sneaks in.
**Correct:** Use Prisma client exclusively. If you need something Prisma
can't express, use `prisma.$queryRaw` with tagged template literals (still
parameterized and safe) and document the exception.
