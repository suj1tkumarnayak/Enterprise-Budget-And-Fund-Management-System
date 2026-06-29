# common-pitfalls.md
## EBFMS Common Pitfalls

> Maintained by: Documentation Engineer + Code Reviewer
> Updated: Whenever a pitfall is observed more than once in PRs or sessions.
> Purpose: Stop the same mistake from happening a third time.

---

## Pitfall Format

```
### [Pitfall Title]

**Category:** [Backend / Frontend / Database / DevOps / Process]
**Frequency:** [Seen once / Recurring]
**Symptom:** [What goes wrong / what the error looks like]
**Root Cause:** [Why this happens]
**Correct Approach:** [What to do instead]
**Detection:** [How to catch it — linter / test / code review / runtime]
```

---

## Pitfalls

### Missing `deletedAt: null` Filter in findMany

**Category:** Backend
**Frequency:** Recurring
**Symptom:** Soft-deleted records appear in list API responses. Users see
"deleted" budget requests, expenses, or users in their dashboards.
**Root Cause:** Prisma's `findMany` returns all rows by default; soft delete
is enforced by convention, not DB constraint. Easy to forget.
**Correct Approach:**
```typescript
// Always include deletedAt: null for business entity queries
const records = await prisma.budgetRequest.findMany({
  where: { departmentId, deletedAt: null }
});
```
**Detection:** Integration test — after soft-deleting a record, call the list
endpoint and assert the deleted record is absent.

---

### Using Native `number` for Monetary Values

**Category:** Backend / Frontend
**Frequency:** Recurring
**Symptom:** Rounding errors in budget calculations. `$100.10 + $200.20 = $300.30000000000003`.
**Root Cause:** JavaScript/TypeScript `number` is IEEE 754 double precision.
**Correct Approach:** Use `decimal.ts` helpers on the backend. On the frontend,
display values received as strings from the API using `formatMoney()` — never
parse them to `number` for display math.
**Detection:** Code Review Checklist item; grep for `parseFloat`, `parseInt`,
`Number(` in service files.

---

### Controllers With Business Logic

**Category:** Backend
**Frequency:** Recurring
**Symptom:** Controllers that are hundreds of lines long, containing if/else
chains, database calls, and email-sending logic.
**Root Cause:** Convenience — it's faster to put everything in one place.
**Correct Approach:** Controllers parse the request, call one service method,
and return the result. All logic lives in `.service.ts`.
```typescript
// Correct: thin controller
export const createBudgetRequest: RequestHandler = asyncHandler(async (req, res) => {
  const dto = req.body as CreateBudgetRequestDto;
  const result = await budgetRequestService.create(dto, req.user!.id);
  res.status(201).json(result);
});
```
**Detection:** Code Review Checklist; PR review.

---

### Inventing API Contracts on the Frontend

**Category:** Frontend
**Frequency:** Recurring
**Symptom:** Frontend calls an endpoint that doesn't exist, or sends a field
the backend doesn't expect, causing 400/404 errors in production.
**Root Cause:** Frontend Engineer assumed the contract instead of reading the
backend `.dto.ts` file.
**Correct Approach:** Always read the backend module's `.dto.ts` before
building the API layer. If the endpoint doesn't exist yet, use a mock and
log a task for the Backend Engineer — never call a non-existent endpoint.
**Detection:** `PROJECT_RULES.md` Rule 3 enforcement; integration testing.

---

### Missing `asyncHandler` Wrapper

**Category:** Backend
**Frequency:** Occasional
**Symptom:** An unhandled promise rejection crashes the Express process or
produces an uninformative 500 response instead of the expected error JSON.
**Root Cause:** Async route handler throws an error that Express can't catch
without the wrapper.
**Correct Approach:** All controllers must be wrapped in `asyncHandler`.
**Detection:** Code Review Checklist.

---

### Modifying Another Role's Files Without Approval

**Category:** Process
**Frequency:** Occasional
**Symptom:** Merge conflicts, overwritten work, inconsistent architectural
decisions, broken assumptions.
**Root Cause:** One Claude assumes its change is "obviously correct" and edits
a file owned by another role.
**Correct Approach:** Read `ARCHITECTURE.md` Section 11 (File Ownership Map).
If you need a change outside your ownership, log a task for the owning role or
get approval documented in `DECISION_REGISTER.md`.
**Detection:** PR review; file ownership map check.

---

### Direct Service-to-Service Imports for Cross-Cutting Concerns

**Category:** Backend
**Frequency:** Occasional
**Symptom:** Tight coupling between modules; circular dependency errors; modules
that can't be tested in isolation.
**Root Cause:** It's simpler to `import { notificationService }` directly than
to emit an event.
**Correct Approach:** Use `eventBus.ts` for all cross-module side effects
(ADR-007). `import { eventBus } from '../events/eventBus'` and emit a typed
event.
**Detection:** Code Review; architecture review.
