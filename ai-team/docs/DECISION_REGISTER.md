# DECISION_REGISTER.md

## Architectural Decision Register

> All significant architectural, design, or process decisions are recorded here.
> Format: ADR (Architecture Decision Record)
> Owner: System Architect

---

## How to Add an Entry

Copy the template at the bottom of this file. Fill in all fields. Never delete existing entries.

---

## ADR-001 — PostgreSQL over MongoDB

| Field           | Value             |
| --------------- | ----------------- |
| **Date**        | Project inception |
| **Status**      | Accepted          |
| **Decided By**  | System Architect  |
| **Approved By** | Project Manager   |

**Context**: EBFMS handles financial data requiring ACID compliance, complex relational queries across departments/projects/approvals, and immutable ledger entries.

**Decision**: Use PostgreSQL as the primary data store.

**Consequences**:

- Strong consistency and transactional integrity for financial operations
- Complex multi-table joins are performant and safe
- Prisma ORM provides type-safe query interface
- Trade-off: Less flexible for unstructured data (not needed here)

---

## ADR-002 — Polymorphic Approval Engine

| Field           | Value             |
| --------------- | ----------------- |
| **Date**        | Project inception |
| **Status**      | Accepted          |
| **Decided By**  | System Architect  |
| **Approved By** | Database Engineer |

**Context**: Both BudgetRequests and Expenses require approval workflows. Maintaining two separate approval systems would double the code and create inconsistent behavior.

**Decision**: Single polymorphic approval engine using `entityType` + `entityId` on `ApprovalInstance`. No DB-level FK on `entityId`. Referential integrity enforced at the application layer.

**Consequences**:

- Single approval codebase for all entity types
- New entity types can use the engine without schema changes
- Trade-off: No DB-enforced referential integrity on entityId — application layer must be carefully maintained
- **Immutable decision**: Do not add DB FKs to `ApprovalInstance.entityId`

---

## ADR-003 — Soft Delete Strategy

| Field          | Value             |
| -------------- | ----------------- |
| **Date**       | Project inception |
| **Status**     | Accepted          |
| **Decided By** | System Architect  |

**Context**: Financial records must be preserved for audit and compliance. Hard deletes would break audit trails and ledger integrity.

**Decision**: All business entities use soft delete via `deletedAt DateTime?`. NULL = active, non-null = deleted.

**Consequences**:

- All queries on active records must filter `WHERE deleted_at IS NULL`
- Prisma middleware can be used to apply this filter globally
- Trade-off: Tables grow larger over time — mitigated by archival strategy (future)

---

## ADR-004 — Append-Only Ledger

| Field          | Value             |
| -------------- | ----------------- |
| **Date**       | Project inception |
| **Status**     | Accepted          |
| **Decided By** | System Architect  |

**Decision**: `allocation_ledger_entries`, `audit_logs`, and `payroll_cost_entries` are append-only at the application layer. Corrections are made via reversal entries, not UPDATE/DELETE.

**Consequences**:

- Complete immutable audit trail for all financial movements
- Reversals are first-class operations
- Trade-off: More complex balance calculation (sum of entries, not a single value)

---

## ADR-005 — Decimal(15,2) for All Monetary Values

| Field          | Value             |
| -------------- | ----------------- |
| **Date**       | Project inception |
| **Status**     | Accepted          |
| **Decided By** | Database Engineer |

**Decision**: All monetary columns use `Decimal @db.Decimal(15,2)`. All TypeScript monetary arithmetic uses the `decimal.ts` utility. Native JavaScript `number` is forbidden for financial calculations.

**Consequences**:

- No floating-point rounding errors
- 15 digits of precision supports values up to 999,999,999,999,999.99
- Trade-off: Requires Prisma Decimal type handling and serialization care

---

## ADR-006 — JWT with Refresh Token Rotation

| Field          | Value                                |
| -------------- | ------------------------------------ |
| **Date**       | Project inception                    |
| **Status**     | Accepted                             |
| **Decided By** | Security Engineer + System Architect |

**Decision**: Short-lived JWT access tokens (15 min) + long-lived opaque refresh tokens stored as hashes in DB. Refresh tokens are rotated (old revoked, new issued) on every use.

**Consequences**:

- Refresh token theft is detectable (reuse of a revoked token = security alert)
- Access token compromise window is limited to 15 minutes
- Trade-off: Every `/auth/refresh` call requires a DB write

---

## ADR-007 — Internal Event Bus for Side Effects

| Field          | Value             |
| -------------- | ----------------- |
| **Date**       | Project inception |
| **Status**     | Accepted          |
| **Decided By** | System Architect  |

**Decision**: Cross-cutting side effects (notifications, analytics invalidation) are triggered via the internal `eventBus.ts` (Node.js EventEmitter), not direct service-to-service imports.

**Consequences**:

- Services remain decoupled
- Easy to add new side effects without modifying the originating service
- Trade-off: Events are in-process only — if the process dies, in-flight events are lost (acceptable for this use case; critical operations are already persisted before events fire)

---

## ADR-008 — `ARCHITECTURE.md` Supersedes `.docx` Sections 9–11

| Field           | Value                                                                                |
| --------------- | ------------------------------------------------------------------------------------ |
| **Date**        | 2026-06-30                                                                           |
| **Status**      | Accepted                                                                             |
| **Decided By**  | System Architect                                                                     |
| **Approved By** | System Architect (self-evident correction; flagged to Project Manager for awareness) |

**Context**: `EBFMS_Architecture_Document.docx` is the pre-implementation
planning document. Its Sections 9 (System Architecture), 10 (Project
Structure), and 11 (Tech Stack) describe a Spring Boot / Java / Kubernetes /
RabbitMQ/SQS / read-replica target architecture. The actual repository —
`README.md`, `package.json` (both frontend and backend), `docker-compose.yml`,
both `Dockerfile`s, and every module skeleton — implements a materially
different, lighter-weight stack: Node.js + Express + TypeScript + Prisma +
PostgreSQL, deployed to Vercel + Render + Neon, with no message queue, no
read replica, and no Java anywhere. Until now, `ARCHITECTURE.md` did not
explicitly state that it supersedes those `.docx` sections, creating a risk
that a future Claude session would read the `.docx`, treat Java/Spring Boot
as the target, and attempt to converge the real codebase toward a stack it
was never built on.

**Decision**: `ARCHITECTURE.md` is the authoritative source for system
architecture, project structure, and tech stack. It supersedes
`EBFMS_Architecture_Document.docx` Sections 9–11 specifically. The `.docx`
remains authoritative for Sections 1–8 and 12–15 (functional requirements,
RBAC, business workflows, database design and ERD, API conventions,
development roadmap, security requirements, NFRs, future enhancements) —
none of which are stack-specific and all of which the actual implementation
already follows (e.g., the RBAC matrix, the polymorphic approval engine,
Decimal(15,2) monetary handling, JWT + refresh rotation).

**Consequences**:

- Future Claude sessions reading `ARCHITECTURE.md` first (per `BOOTSTRAP.md`
  Section 2) get the correct, current stack without needing to reconcile
  two architecture documents themselves.
- No code change required — this ADR documents an already-existing de facto
  state; it makes explicit what every other artifact in the repo already
  assumes.
- Trade-off: none identified. This is a clarification, not a new
  constraint.

---

## TEMPLATE — Copy for New Decisions

```markdown
## ADR-NNN — [Decision Title]

| Field           | Value                                       |
| --------------- | ------------------------------------------- |
| **Date**        | YYYY-MM-DD                                  |
| **Status**      | Proposed / Accepted / Rejected / Superseded |
| **Decided By**  | [Role]                                      |
| **Approved By** | [Role]                                      |

**Context**: [Why was this decision needed? What was the problem?]

**Decision**: [What was decided?]

**Consequences**:

- [Positive outcome]
- [Negative trade-off]
- [Constraints this imposes]
```
