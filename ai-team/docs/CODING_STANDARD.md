# CODING_STANDARD.md
## EBFMS — Coding Standards

> These standards are enforced via ESLint where possible, and by code review otherwise.

---

## 1. NAMING CONVENTIONS

### Files
- Backend modules: `<module>.<layer>.ts` — e.g., `allocations.service.ts`
- Frontend components: `PascalCase.tsx` — e.g., `BudgetRequestCard.tsx`
- Frontend hooks: `use<Name>.ts` — e.g., `useBudgetRequests.ts`
- Frontend pages: `<Name>Page.tsx` — e.g., `AllocationsPage.tsx`
- Utilities: `camelCase.ts` — e.g., `formatCurrency.ts`
- Types: `camelCase.ts` or `index.ts`

### Variables & Functions
```typescript
// Variables: camelCase
const budgetRequest = await service.findById(id);

// Constants: UPPER_SNAKE_CASE
const MAX_FAILED_LOGIN_ATTEMPTS = 5;

// Functions: camelCase, verb + noun
async function createBudgetRequest(dto: CreateBudgetRequestDto) {}
async function findAllByDepartment(departmentId: string) {}

// Boolean variables: is/has/can prefix
const isActive = user.deletedAt === null;
const hasPermission = await checkAccess(user, resource);
```

### TypeScript Types & Interfaces
```typescript
// Interfaces: PascalCase, no 'I' prefix
interface BudgetRequestDto {}
interface CreateExpenseDto {}

// Enums: PascalCase, values PascalCase
enum BudgetRequestStatus {
  Draft = 'Draft',
  PendingStage1 = 'PendingStage1',
}

// Type aliases: PascalCase
type UserId = string;
type MonetaryAmount = Prisma.Decimal;
```

### Database (Prisma)
- Model names: `PascalCase` singular (e.g., `BudgetRequest`)
- Table names: `snake_case` plural (e.g., `budget_requests`) via `@@map`
- Column names: `camelCase` in Prisma, `snake_case` in DB via `@map` if needed

---

## 2. BACKEND PATTERNS

### Controller Pattern
```typescript
// controllers are thin — parse, call service, respond
export const createBudgetRequest: RequestHandler = asyncHandler(async (req, res) => {
  const dto = req.body as CreateBudgetRequestDto; // already Zod-validated
  const result = await budgetRequestService.create(dto, req.user!.id);
  res.status(201).json(result);
});
```

### Service Pattern
```typescript
// services contain business logic
export const budgetRequestService = {
  async create(dto: CreateBudgetRequestDto, actorId: string): Promise<BudgetRequestDto> {
    // validate business rules
    // perform DB operation
    // fire events
    // return typed response
  }
};
```

### Route Pattern
```typescript
// routes wire middleware to controllers
router.post(
  '/',
  authenticate,
  authorize(['BudgetManager', 'Admin']),
  validate(createBudgetRequestSchema), // Zod middleware
  createBudgetRequest
);
```

### Error Throwing
```typescript
// always throw AppError, never plain Error
throw new AppError('Budget request not found', 404, 'BUDGET_REQUEST_NOT_FOUND');
throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
throw new AppError('Amount exceeds department ceiling', 422, 'BUDGET_CEILING_EXCEEDED');
```

### Prisma Query Pattern
```typescript
// always handle not-found explicitly
const record = await prisma.budgetRequest.findUnique({ where: { id } });
if (!record || record.deletedAt !== null) {
  throw new AppError('Not found', 404, 'NOT_FOUND');
}

// always scope to active records
const records = await prisma.budgetRequest.findMany({
  where: { departmentId, deletedAt: null }
});
```

### Monetary Arithmetic
```typescript
// NEVER use native number for money
import { add, subtract, multiply, isGreaterThan } from '../common/utils/decimal';

const remaining = subtract(allocation.amount, totalSpent);
if (isGreaterThan(expense.amount, remaining)) {
  throw new AppError('Expense exceeds available allocation', 422, 'INSUFFICIENT_FUNDS');
}
```

---

## 3. FRONTEND PATTERNS

### Component Pattern
```tsx
// Props interface always defined
interface BudgetRequestCardProps {
  request: BudgetRequestDto;
  onApprove?: (id: string) => void;
}

export function BudgetRequestCard({ request, onApprove }: BudgetRequestCardProps) {
  return (
    <div className="rounded-lg border p-4">
      {/* component JSX */}
    </div>
  );
}
```

### Custom Hook Pattern
```typescript
export function useBudgetRequests(departmentId?: string) {
  const [requests, setRequests] = useState<BudgetRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // fetch logic
  }, [departmentId]);

  return { requests, loading, error, refetch };
}
```

### API Call Pattern
```typescript
// All API calls in the feature's api/ folder
import { httpClient } from '../../../api/httpClient';

export const budgetRequestApi = {
  getAll: (params?: BudgetRequestQueryParams) =>
    httpClient.get<BudgetRequestDto[]>('/budget-requests', { params }),

  create: (dto: CreateBudgetRequestDto) =>
    httpClient.post<BudgetRequestDto>('/budget-requests', dto),
};
```

---

## 4. TESTING STANDARDS

### Unit Tests
- Location: `backend/tests/unit/`
- Naming: `<module>.test.ts`
- Must mock Prisma client
- Must mock external services
- Coverage target: 80% for service files

### Integration Tests
- Location: `backend/tests/integration/`
- Use `testClient.ts` helper
- Test actual HTTP endpoints
- Use a test database (`.env.test`)
- Clean up after each test

### Test Naming Convention
```typescript
describe('BudgetRequestService', () => {
  describe('create', () => {
    it('should create a budget request in Draft status', async () => {});
    it('should throw 422 when amount exceeds department ceiling', async () => {});
    it('should throw 403 when user is not in the department', async () => {});
  });
});
```

---

## 5. GIT COMMIT FORMAT

```
<type>(<scope>): <imperative description>

[optional body: what and why, not how]

[optional footer: TASK-NNN, BREAKING CHANGE]
```

Examples:
```
feat(budget-requests): add multi-department budget request support

fix(auth): prevent refresh token reuse race condition

The previous implementation had a TOCTOU race where two concurrent
requests could both succeed with the same refresh token.

Closes TASK-089
```

---

## 6. CODE REVIEW CHECKLIST

Before approving any PR, verify:

- [ ] No `any` types without comment explanation
- [ ] All monetary arithmetic uses `decimal.ts` utilities
- [ ] All new routes have `authenticate` + `authorize` middleware
- [ ] All controllers use `asyncHandler`
- [ ] All request bodies have Zod schema validation
- [ ] All new DB queries filter `deletedAt: null` where applicable
- [ ] All sensitive operations produce an `AuditLog` entry
- [ ] All new environment variables are in `.env.example`
- [ ] Tests exist for new service methods
- [ ] No secrets or credentials in code

---

*This document is owned by the System Architect and Code Reviewer.*
