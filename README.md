# EBFMS — Enterprise Budget & Fund Management System

A production-quality full-stack financial management system built for organizations of 500–5,000 employees.

---

## Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, Zustand |
| Backend    | Node.js 20, Express 4, TypeScript, Prisma ORM           |
| Database   | PostgreSQL 16 (Neon in production)                      |
| Auth       | JWT (access + refresh tokens), Argon2id password hashing |
| Storage    | Cloudinary (file uploads)                               |
| Email      | Nodemailer / SMTP                                       |
| Cache      | Redis (optional — rate limiting, session caching)       |
| Testing    | Jest, Supertest                                         |
| Deployment | Vercel (frontend), Render (backend), Neon (database)    |

---

## Prerequisites

- Node.js >= 20
- Docker & Docker Compose (for local development)
- PostgreSQL 16 (or use Docker)

---

## Quick Start (Docker)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/ebfms.git
cd ebfms

# 2. Configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT secrets, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD

# 3. Configure frontend environment
cp frontend/.env.example frontend/.env

# 4. Start all services
docker compose up -d

# 5. Run database migrations
docker compose exec backend npx prisma migrate dev --name init

# 6. Run the seed script
docker compose exec backend npm run db:seed
```

The API is now available at `http://localhost:3000` and the frontend at `http://localhost:5173`.

---

## Quick Start (Local)

```bash
# Backend
cd backend
cp .env.example .env          # Edit with your values
npm install
npm run db:generate           # Generate Prisma client
npm run db:migrate            # Run migrations against your local DB
npm run db:seed               # Seed roles, categories, settings, admin user
npm run dev                   # Start dev server on port 3000

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                   # Start Vite dev server on port 5173
```

---

## Environment Variables

| Variable               | Required | Description                                         |
|------------------------|----------|-----------------------------------------------------|
| `DATABASE_URL`         | ✓        | PostgreSQL connection string (`postgresql://...`)   |
| `JWT_ACCESS_SECRET`    | ✓        | Min 32 chars. Generate: `openssl rand -hex 64`      |
| `JWT_REFRESH_SECRET`   | ✓        | Min 32 chars. Different from access secret.         |
| `JWT_ACCESS_EXPIRY`    |          | Default: `15m`                                      |
| `JWT_REFRESH_EXPIRY`   |          | Default: `7d`                                       |
| `CORS_ALLOWED_ORIGINS` |          | Default: `http://localhost:5173`                    |
| `SEED_ADMIN_EMAIL`     | seed     | Admin user email (seed script only)                 |
| `SEED_ADMIN_PASSWORD`  | seed     | Admin user password — min 12 chars (seed only)      |
| `CLOUDINARY_*`         |          | Required for file upload features                   |
| `SMTP_*`               |          | Required for email notifications                    |
| `REDIS_URL`            |          | Optional — enables rate limiting and caching        |

---

## Available Scripts

### Backend

| Script                  | Description                                   |
|-------------------------|-----------------------------------------------|
| `npm run dev`           | Start dev server with hot reload (tsx watch)  |
| `npm run build`         | Compile TypeScript to `dist/`                 |
| `npm run start`         | Run compiled production server                |
| `npm test`              | Run all tests                                 |
| `npm run test:coverage` | Run tests with coverage report (≥80% required)|
| `npm run lint`          | ESLint with zero-warnings policy              |
| `npm run type-check`    | TypeScript type check without emit            |
| `npm run db:migrate`    | Run Prisma migrations (dev)                   |
| `npm run db:migrate:prod` | Deploy migrations (production)              |
| `npm run db:seed`       | Seed roles, categories, settings, admin user  |
| `npm run db:studio`     | Open Prisma Studio                            |
| `npm run db:reset`      | Reset database and re-run migrations (dev only)|

### Frontend

| Script               | Description                               |
|----------------------|-------------------------------------------|
| `npm run dev`        | Start Vite dev server on port 5173        |
| `npm run build`      | Production build to `dist/`              |
| `npm run lint`       | ESLint with zero-warnings policy          |
| `npm run type-check` | TypeScript type check                     |

---

## Module Roadmap

| Module | Status     | Description                            |
|--------|------------|----------------------------------------|
| M1     | ✅ Complete | Foundation (structure, schema, config, seed, Docker) |
| M2     | Pending    | Authentication (login, refresh, logout, password reset) |
| M3     | Pending    | User & Role Management                 |
| M4     | Pending    | Department Management                  |
| M5     | Pending    | Project & Team Management              |
| M6     | Pending    | Budget Requests                        |
| M7     | Pending    | Approval Engine                        |
| M8     | Pending    | Fund Allocation                        |
| M9     | Pending    | Expense Management                     |
| M10    | Pending    | Notifications                          |
| M11    | Pending    | Audit Logging                          |
| M12    | Pending    | Payroll Integration                    |
| M13    | Pending    | Reports                                |
| M14    | Pending    | Analytics Dashboard                    |
| M15    | Pending    | Search                                 |
| M16    | Pending    | Settings & Admin Config                |
| M17    | Pending    | Security Hardening                     |
| M18    | Pending    | UAT & Deployment                       |

---

## Architecture

See `EBFMS_Architecture_Document.docx` for the full specification.

Key patterns:
- **Vertical-slice modules** — each module owns its controller, service, routes, DTOs, and Zod schema
- **Thin controllers, fat services** — all business logic lives in service classes
- **Append-only audit log** — no UPDATE or DELETE on `audit_logs`, ever
- **Ledger-based fund tracking** — allocations are immutable; corrections via reversing entries
- **Generic approval engine** — data-driven chains drive both budget request and expense approvals
- **Monetary arithmetic via `decimal.js`** — never native JS `number` for financial values

---

## Security

- Passwords hashed with **Argon2id** (64 MiB memory, 3 iterations, 4 parallelism)
- JWT access tokens expire in **15 minutes**; refresh tokens rotate on every use
- All secrets validated at startup — server refuses to start with missing configuration
- CORS allow-list enforced; wildcard never permitted in production
- Helmet security headers on all responses
- `Admin` user created with `mustChangePassword = true` — forced rotation on first login
