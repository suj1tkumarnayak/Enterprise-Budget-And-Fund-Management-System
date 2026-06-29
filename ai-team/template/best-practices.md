# best-practices.md
## EBFMS Best Practices

> Maintained by: Documentation Engineer + Performance Engineer + Code Reviewer
> Updated: As practices are confirmed in real work on this codebase.

---

## Backend

### Service Layer First, HTTP Layer Last
Build in this order every time: Zod schema → DTO types → service →
controller → route registration. Validation prevents garbage reaching
business logic. Business logic in services is testable without spinning
up HTTP. Controllers stay thin and uniform.

### Always Throw AppError, Never Raw Error
```typescript
// Correct
throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');

// Wrong — loses the error code and statusCode
throw new Error('Department not found');
```
The global error handler only knows how to format `AppError` instances.
Raw `Error` objects produce generic 500 responses.

### Test the Service, Integration-Test the Route
Unit tests mock Prisma and test the service's business logic directly.
Integration tests use the real HTTP stack and a test database. Both are
required — neither substitutes for the other.

### Emit Audit Logs Before Returning, Not After
Audit log emission should happen inside the service, within the same
transaction if possible, before the response is returned. Emitting after
the response risks losing the audit entry if the process crashes.

### Use `select` to Avoid Over-Fetching
```typescript
// Avoid returning password_hash, failed_login_attempts, etc.
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, fullName: true, role: true }
});
```
DTOs define what the client sees. Services should select only what the
DTO requires.

---

## Frontend

### Types Before Components
Define the TypeScript types for a feature's API response first. This
forces you to understand the contract before writing JSX, and catches
mismatches at compile time rather than at runtime.

### One Custom Hook Per Data Concern
Separate data fetching from rendering. A component should call a hook
(`useBudgetRequests()`) and render what the hook returns. The hook
handles loading state, error state, and refetching.

### Error States Are Not Optional
Every page that fetches data must handle three states: loading, error,
and data. A loading spinner with no error handling means users see a
blank page on any API failure.

### Guard Routes at the Router Level
Role-based access is enforced at the server. On the client, guard routes
in `routes/index.tsx` using the RBAC matrix from the architecture doc.
This is a UX guard, not a security control — but it prevents confusing
"403 Forbidden" flashes after navigation.

---

## Database

### Write the ADR Before the Migration
Never open `schema.prisma` for a new change without a `DECISION_REGISTER.md`
entry at status "Accepted" first. The ADR forces you to articulate the
business need, which often reveals a better approach.

### Keep Seed Data Idempotent
Every `seed.ts` operation uses `upsert`, never blind `create`. This makes
`db:seed` safe to run repeatedly without errors, which matters for CI and
local dev resets.

### Post-Schema SQL for What Prisma Can't Express
CHECK constraints, partial indexes, and custom triggers go in a migration
SQL file. Don't skip them because Prisma doesn't generate them — they're
often the most important data integrity rules.

---

## Process

### Read Handoff Before Touching Any File
The previous Claude documented exactly what state things are in. Reading
`handoff.md` before opening any code file saves time and prevents
undoing completed work.

### One Task Per Branch
Branch names encode the task ID: `backend-engineer/TASK-042/add-payroll-import`.
One task per branch means one focused PR, cleaner diffs, and easier rollback.

### Never End a Session Without Updating Memory Files
`handoff.md`, `daily_log.md`, `progress.md`, and `pending.md` are the
project's long-term memory. A session that ends without updating these
files is like a surgeon who doesn't write surgical notes — the next person
is flying blind.
