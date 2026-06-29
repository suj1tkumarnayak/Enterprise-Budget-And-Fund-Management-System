# ARCHITECTURE.md
## EBFMS — System Architecture Reference

> This is the authoritative architecture document.
> Any deviation requires a DECISION_REGISTER entry.

---

## 1. SYSTEM OVERVIEW

EBFMS is a multi-tier enterprise financial management system. It manages the full lifecycle of organizational budgets: from requests through multi-stage approval chains to fund allocations, expense tracking, payroll cost integration, analytics, and audit.

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT TIER                         │
│   React + TypeScript + Vite + Tailwind CSS (SPA)        │
│   Communicates only via REST API over HTTPS             │
└─────────────────────────┬───────────────────────────────┘
                          │ REST / JSON
┌─────────────────────────▼───────────────────────────────┐
│                     API TIER                            │
│   Node.js + Express + TypeScript                        │
│   JWT Authentication (access + refresh tokens)          │
│   Modular architecture (one folder per domain)          │
└─────────────────────────┬───────────────────────────────┘
                          │ Prisma ORM
┌─────────────────────────▼───────────────────────────────┐
│                   DATA TIER                             │
│   PostgreSQL (primary)                                  │
│   Append-only ledger tables                             │
│   Partitioned audit_logs table                          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. BACKEND MODULE STRUCTURE

Each domain is a self-contained module under `backend/src/modules/<module>/`:

```
<module>/
  <module>.controller.ts   ← HTTP layer: parse req, call service, return res
  <module>.service.ts      ← Business logic, DB access via Prisma
  <module>.routes.ts       ← Express router, middleware wiring
  <module>.dto.ts          ← TypeScript interfaces for request/response
  <module>.schema.ts       ← Zod validation schemas for request bodies
```

**Modules:**
| Module | Responsibility |
|--------|---------------|
| `auth` | Login, logout, refresh tokens, password reset |
| `users` | User CRUD, role assignment |
| `departments` | Org hierarchy, budget ceilings |
| `projects` | Project lifecycle |
| `teams` | Team management |
| `budget-requests` | Request creation, submission, withdrawal |
| `approvals` | Approval chain engine (polymorphic) |
| `allocations` | Fund allocation against approved requests |
| `expenses` | Expense submission, approval, posting |
| `payroll` | Payroll cost import, cost center routing |
| `notifications` | In-app notifications, preferences |
| `reports` | Financial reports generation |
| `analytics` | Pre-aggregated snapshots, dashboards |
| `audit` | Append-only audit log |
| `settings` | System configuration |

---

## 3. FRONTEND FEATURE STRUCTURE

Each business domain maps to a feature folder under `frontend/src/features/<feature>/`:

```
<feature>/
  components/    ← Feature-specific React components
  hooks/         ← Custom hooks (data fetching, state)
  pages/         ← Page-level components (routed)
  api/           ← API call functions (uses httpClient)
  types/         ← Feature-specific TypeScript types
  index.ts       ← Public exports
```

**Global structure:**
```
frontend/src/
  api/httpClient.ts        ← Axios instance with interceptors
  components/common/       ← Shared UI primitives
  components/domain/       ← Domain-aware shared components
  components/layout/       ← Shell, sidebar, nav
  routes/index.tsx         ← React Router route definitions
  store/index.ts           ← Zustand global state
  types/index.ts           ← Global TypeScript types
  utils/currency.ts        ← Currency formatting
  utils/date.ts            ← Date formatting
```

---

## 4. AUTHENTICATION ARCHITECTURE

### 4.1 Token Strategy
- **Access Token**: JWT, short-lived (15 min), stateless
- **Refresh Token**: Opaque, hashed in DB (`refresh_tokens` table), rotated on each use
- **Rotation**: Old refresh token is revoked before issuing new one (prevents reuse)

### 4.2 Middleware Chain
```
Request → authenticate.ts → authorize.ts → Controller
```
- `authenticate.ts`: Validates JWT, attaches `req.user`
- `authorize.ts`: Checks `req.user.role` against allowed roles

### 4.3 Public Routes (no auth required)
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `GET  /health`

---

## 5. APPROVAL ENGINE ARCHITECTURE

### 5.1 Design
The approval engine is **polymorphic** — it drives both BudgetRequest and Expense approvals using a single set of tables. This is documented in schema.prisma under the `ApprovalInstance` model.

### 5.2 Tables
```
ApprovalChain          ← Configuration: which roles approve, in which order
ApprovalChainStage     ← Ordered stages within a chain
ApprovalInstance       ← A live approval process for one entity
ApprovalInstanceStage  ← One row per stage per live process (records decisions)
```

### 5.3 Key Design Decision
`ApprovalInstance.entityId` is intentionally **not a database-level foreign key**. It is a polymorphic reference to either a `BudgetRequest` or `Expense` row, determined by `entityType`. Referential integrity is enforced at the application/service layer.

**This decision is immutable.** Do not add DB-level FKs to `ApprovalInstance.entityId`.

### 5.4 Approval Flow
```
Entity Created (Draft)
  → Submit → ApprovalInstance created → Stage 1 starts
  → Stage N approved → Stage N+1 starts (or final approval)
  → Any stage Rejected → entity status → Rejected
  → Any stage Returned → entity status → Returned (requester can revise)
  → All stages Approved → entity status → Approved
  → SLA breached → escalation notification fired
```

---

## 6. DATA MODEL CONVENTIONS

### 6.1 All Tables
- **PK**: UUID via `gen_random_uuid()` (DB-generated)
- **Monetary values**: `Decimal @db.Decimal(15, 2)` — never `Float`
- **Timestamps**: `@db.Timestamptz` (timezone-aware)
- **Soft delete**: `deletedAt DateTime? @db.Timestamptz` — NULL = active
- **Audit columns**: `createdAt`, `updatedAt`, `createdBy`, `updatedBy` on all business tables
- **FK behavior**: Default `Restrict` (no silent cascades on financial records)

### 6.2 Append-Only Tables (never UPDATE/DELETE at application layer)
- `allocation_ledger_entries`
- `audit_logs`
- `payroll_cost_entries`

### 6.3 Key Indexes
Defined in schema.prisma. Critical composite indexes:
- `[departmentId, status]` on `budget_requests` (dashboard queries)
- `[entityType, entityId]` on `approval_instances` (polymorphic lookup)
- `[fundAllocationId, status]` on `expenses` (balance calculations)
- `[userId, isRead]` on `notifications` (unread count)

---

## 7. EVENT SYSTEM

`backend/src/events/eventBus.ts` — Internal Node.js EventEmitter for decoupled side effects.

Events trigger:
- Notification creation
- Audit log entries for cross-module actions
- Analytics snapshot invalidation

Do not use direct service-to-service imports for cross-cutting concerns. Use the event bus.

---

## 8. ERROR HANDLING

- All controllers wrapped with `asyncHandler` (`backend/src/common/utils/asyncHandler.ts`)
- Errors thrown as `AppError` instances (`backend/src/common/errors/AppError.ts`)
- Global error handler middleware: `backend/src/common/middleware/errorHandler.ts`
- All errors produce structured JSON: `{ error: string, code: string, statusCode: number }`

---

## 9. LOGGING

`backend/src/common/utils/logger.ts` — Winston-based structured logger.
- Log levels: `error`, `warn`, `info`, `debug`
- All HTTP requests logged via `requestLogger.ts` middleware
- Sensitive fields (passwords, tokens) must never appear in logs

---

## 10. INFRASTRUCTURE

### 10.1 Docker
- `docker-compose.yml` at root: orchestrates backend, frontend, postgres
- Each service has its own `Dockerfile`
- Never hardcode ports — use environment variables

### 10.2 CI/CD
- `.github/workflows/ci.yml`: lint, type-check, test on every PR
- Deployments are triggered by merges to `main`

### 10.3 Database
- PostgreSQL — primary datastore
- Prisma ORM — schema management and query interface
- `audit_logs` table is partitioned by month (defined in migration SQL)
- Migrations in `backend/prisma/migrations/`

---

## 11. FILE OWNERSHIP MAP

| Path | Owner Role |
|------|-----------|
| `backend/src/modules/*/` | Backend Engineer |
| `backend/src/common/` | System Architect |
| `backend/prisma/schema.prisma` | Database Engineer + Architect |
| `backend/prisma/migrations/` | Database Engineer |
| `frontend/src/features/*/` | Frontend Engineer |
| `frontend/src/components/common/` | Frontend Engineer |
| `frontend/src/api/` | Frontend Engineer |
| `docker-compose.yml` | DevOps Engineer |
| `.github/workflows/` | DevOps Engineer |
| `backend/Dockerfile` | DevOps Engineer |
| `frontend/Dockerfile` | DevOps Engineer |
| `ai-team/` | Project Manager |
| `ai-team/architecture/` | System Architect |
| `ai-team/docs/` | Documentation Engineer |

---

*This document is owned by the System Architect.*
*All changes require a DECISION_REGISTER entry.*
