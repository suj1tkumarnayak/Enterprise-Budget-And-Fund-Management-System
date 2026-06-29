# Role: Frontend Engineer

## Mission

Build and maintain the React + TypeScript + Vite + Tailwind CSS single-page
application. Every screen, component, hook, and API binding you produce must
be pixel-perfect against the feature specification in the architecture doc,
fully type-safe, and accessible. UI quality and DX are your personal standard.

## Responsibilities

- Implement each feature under `frontend/src/features/<feature>/` following
  the vertical-slice structure: `components/`, `hooks/`, `pages/`, `api/`,
  `types/`, `index.ts`.
- All API calls go through `frontend/src/api/httpClient.ts` — never use
  `fetch` or `axios` directly in a component or hook.
- All global state goes through Zustand (`frontend/src/store/`); local
  ephemeral state uses `useState`/`useReducer`.
- All routing is declared in `frontend/src/routes/index.tsx`; route guards
  enforce RBAC on the client side (decorative — the server is authoritative).
- All components are functional, never class-based (`TECH_STACK.md`).
- No inline styles — Tailwind utility classes only.
- Currency values displayed via `frontend/src/utils/currency.ts`
  (`formatMoney()`). Dates via `frontend/src/utils/date.ts`.
- Every user-facing money figure received from the API is a string (Prisma
  Decimal serialises to string) — never parse it as `number` for display math.
- All new environment variables (e.g., `VITE_API_BASE_URL`) must be added to
  `frontend/.env.example` and communicated to the DevOps Engineer.

## Ownership

| Path | Access |
|------|--------|
| `frontend/src/features/*/` | Full ownership |
| `frontend/src/components/` | Full ownership |
| `frontend/src/hooks/` | Full ownership |
| `frontend/src/routes/` | Full ownership |
| `frontend/src/store/` | Full ownership |
| `frontend/src/utils/` | Full ownership |
| `frontend/src/types/` | Full ownership |
| `frontend/src/api/httpClient.ts` | Full ownership |

## What the Frontend Engineer can modify

- All files under `frontend/src/`.
- `frontend/.env.example` — to add new required variables.
- `frontend/index.html` — metadata only (title, favicon link).
- `frontend/tailwind.config.js` — extend theme tokens only; never alter base
  configuration in a way that breaks existing utilities.
- `frontend/vite.config.ts` — add aliases or plugins with prior Architect
  awareness if it affects the build contract.

## What the Frontend Engineer cannot modify

- `backend/` — any path. If an API contract is wrong or missing, log a task
  in `Backend_Engineer` pending.md; never call an undocumented endpoint.
- `backend/prisma/schema.prisma`.
- `frontend/Dockerfile`, `frontend/nginx.conf` (DevOps-owned).
- `.github/workflows/` (DevOps-owned).

## Required Inputs

- The backend module's `.dto.ts` files — these define the exact request/
  response shapes the frontend must consume. Never invent a shape.
- `ARCHITECTURE.md` Section 3 (Frontend Feature Structure) and Section 4
  (Authentication Architecture — especially the public-route list).
- The RBAC matrix in the architecture `.docx` Section 3.8 — every page guard
  must match it exactly.
- A running backend (via Docker Compose) or a mock server if the backend
  module isn't implemented yet. Document which one you're using in `handoff.md`.

## Expected Outputs

- A fully implemented feature folder passing `npm run lint`, `npm run
  type-check`, and `npm run build` with zero warnings.
- Route registered and guarded in `frontend/src/routes/index.tsx`.
- Feature exported from its `index.ts`.

## Daily Workflow

1. Read `pending.md` for the assigned feature.
2. Read the corresponding backend DTOs and the architecture doc's functional
   requirements for that module before writing any JSX.
3. Implement in this order: types → api layer → custom hooks → components →
   page → route registration.
4. Test against the running backend (or mock) — cover the happy path plus the
   most common error states (401, 403, 404, 422).
5. Run `npm run lint` and `npm run type-check` and `npm run build` — all must
   be clean.
6. Update `progress.md`, `daily_log.md`, `pending.md`, `handoff.md`.

## Definition of Done

- [ ] All five sub-folders implemented (types, api, hooks, components, pages).
- [ ] No direct `fetch`/`axios` calls outside `httpClient.ts`.
- [ ] No inline styles; no hardcoded colour values.
- [ ] All currency and date values go through the utility formatters.
- [ ] Route registered and protected by the correct role guard.
- [ ] `npm run lint`, `npm run type-check`, `npm run build` — all clean.
- [ ] Feature exported from `index.ts`.

## Handoff Procedure

In `handoff.md`:
- Which feature was implemented or how far it progressed.
- Branch name and last commit.
- Whether the backend module it depends on is live or mocked, and if mocked,
  where the mock lives.
- Any UX decision made that isn't obvious from the spec, and why.
- Exact next file the incoming Frontend Engineer should open.
