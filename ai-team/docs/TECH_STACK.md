# TECH_STACK.md
## EBFMS — Technology Stack Reference

> Canonical reference for all technology choices.
> Changing a technology requires a DECISION_REGISTER entry.

---

## BACKEND

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20 LTS | Runtime |
| Express | 4.x | HTTP framework |
| TypeScript | 5.x | Type safety |
| Prisma | 5.x | ORM + migrations |
| PostgreSQL | 15+ | Primary database |
| Zod | 3.x | Request validation |
| Winston | 3.x | Structured logging |
| bcrypt | 5.x | Password hashing |
| jsonwebtoken | 9.x | JWT issuance/verification |
| Jest | 29.x | Unit + integration testing |
| ESLint | 8.x | Code linting |

**Key files:**
- `backend/package.json` — exact dependency versions
- `backend/tsconfig.json` — TypeScript configuration
- `backend/jest.config.ts` — test configuration
- `backend/.eslintrc.json` — lint rules

---

## FRONTEND

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool / dev server |
| React Router | 6.x | Client-side routing |
| Zustand | 4.x | Global state management |
| Axios | 1.x | HTTP client |
| Tailwind CSS | 3.x | Utility-first styling |
| ESLint | 8.x | Code linting |

**Key files:**
- `frontend/package.json` — exact dependency versions
- `frontend/tsconfig.json` — TypeScript configuration
- `frontend/vite.config.ts` — build configuration
- `frontend/tailwind.config.js` — Tailwind configuration

---

## INFRASTRUCTURE

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local + staging orchestration |
| GitHub Actions | CI/CD pipeline |
| nginx | Frontend static file serving in production |

**Key files:**
- `docker-compose.yml` — service orchestration
- `backend/Dockerfile` — backend container
- `frontend/Dockerfile` — frontend container
- `frontend/nginx.conf` — nginx configuration
- `.github/workflows/ci.yml` — CI pipeline

---

## CODING CONVENTIONS BY LAYER

### TypeScript (all)
- `strict: true` always
- No `any` without comment
- Prefer `const`, `readonly` where possible
- All async functions are `async/await` (no raw `.then()` chains)

### Backend (Express)
- All route handlers wrapped in `asyncHandler`
- All request bodies validated with Zod schemas before reaching the controller
- All business logic in `.service.ts` — controllers are thin
- All DB access through Prisma client (never raw SQL except in migrations)
- UUIDs are DB-generated (`gen_random_uuid()`), never application-generated

### Frontend (React)
- Functional components only (no class components)
- Custom hooks for all data fetching
- Zustand for global state; `useState`/`useReducer` for local component state
- No inline styles — use Tailwind classes
- All API calls go through `src/api/httpClient.ts`

---

## WHAT NOT TO USE

| Forbidden | Reason |
|-----------|--------|
| `number` for money | Floating point errors |
| Raw SQL in app code | Use Prisma; SQL only in migrations |
| `console.log` in production code | Use Winston logger |
| Class components in React | Functional components only |
| Direct Fetch API in frontend | Use httpClient.ts (has interceptors) |
| `any` in TypeScript (undocumented) | Defeats type safety |
| Storing secrets in code | Security violation |
| Direct DB queries bypassing Prisma | Breaks type safety and audit |

---

*This document is owned by the System Architect.*
*Version changes must be noted here before updating package.json.*
