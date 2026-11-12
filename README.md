# RAREsidence

A full-stack web app for managing residential rental units.

- **Public visitors** browse available units and request a viewing.
- **Tenants** log in to see their assigned unit and payment history.
- **Admins** manage units (including photos), tenants, viewing requests and payments.

The project is TypeScript throughout: a **Next.js** frontend and a **NestJS** backend with **Prisma** on **SQLite**.

## Tech stack

| Part | Stack |
| --- | --- |
| Frontend (`frontend/`) | Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui (Base UI), lucide-react, sonner |
| Backend (`backend/`) | NestJS 11 (Express), Prisma 6, SQLite, Passport JWT, bcrypt, class-validator, Multer |

## Getting started

### Prerequisites

- Node.js 20 or later
- npm

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # then set JWT_SECRET (the file says how to generate one)
npx prisma db push       # creates prisma/dev.db from the schema and generates the Prisma client
npm run seed             # optional: loads sample data (wipes existing data)
npm run start:dev
```

The API runs at **http://localhost:3001/api**. Uploaded photos are saved to `backend/uploads/` and served from `http://localhost:3001/uploads/...`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open **http://localhost:3000**.

### Sample accounts

After running `npm run seed` in `backend/`:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@raresidence.com` | `admin123` |
| Tenant | `tenant@example.com` | `tenant123` |

The seed also creates two units (one available, one occupied by the sample tenant), a pending rent payment and a pending viewing request.

## Configuration

The backend reads `backend/.env` (git-ignored; start from `backend/.env.example`):

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `JWT_SECRET` | Yes, 32+ characters | none (the API won't start without it) | Signs login tokens |
| `JWT_EXPIRES_IN` | No | `24h` | How long a login lasts |
| `PORT` | No | `3001` | Port the API listens on |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Frontend origin(s) allowed to call the API, comma-separated |
| `TRUST_PROXY` | No | unset (`.env.example`: `loopback`) | Which proxies to trust for the client IP used by rate limits. `loopback` locally, because requests arrive via the Next.js server |
| `COOKIE_SECURE` | No | `true` when `NODE_ENV=production` | Mark the session cookie HTTPS-only. Set `true` on any HTTPS deployment |

The frontend reads `frontend/.env.local` (git-ignored; start from `frontend/.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `API_URL` | `http://localhost:3001` | Where Next.js forwards `/api/*` and `/uploads/*` (the API's origin, without `/api`). Server-side only; restart after changing it |

Still fixed in code: the `/api` prefix (`backend/src/main.ts`) and the SQLite database path `file:./dev.db` (`backend/prisma/schema.prisma`).

### Security defaults

- Login is limited to 5 attempts per 15 minutes per client IP **and** per email address; viewing requests to 5 per 15 minutes per IP (`@nestjs/throttler`).
- `helmet` sets security headers on every API response.
- Uploads accept only JPEG, PNG or WebP images up to 5 MB.

## Project structure

```
RAREsidence/
├── backend/                  NestJS API
│   ├── prisma/
│   │   ├── schema.prisma     Data model
│   │   └── seed.ts           Sample data
│   ├── src/
│   │   ├── main.ts           Bootstrap: CORS, validation, /api prefix, port
│   │   ├── auth/             Login, JWT strategy, guards, @Public/@Roles decorators
│   │   ├── users/            Current user, tenant list/creation, unit assignment
│   │   ├── units/            Unit CRUD and photo uploads
│   │   ├── bookings/         Viewing requests
│   │   ├── payments/         Tenant payments
│   │   └── prisma/           Shared PrismaService
│   └── uploads/              Uploaded unit photos
└── frontend/                 Next.js app
    ├── app/
    │   ├── (public)/         Home, /units, /units/[id], /book/[unitId], /login
    │   ├── (tenant)/         /tenant, /tenant/unit, /tenant/payments
    │   └── (admin)/          /admin, units (list/new/edit), tenants, bookings
    ├── components/           shadcn/ui components and shared layout
    ├── context/              Auth context (asks GET /users/me who is logged in)
    ├── proxy.ts              Redirects logged-out visitors away from /admin and /tenant
    └── lib/                  API client (api.ts) and shared types (types.ts)
```

`frontend/` and `backend/` are separate git repositories.

## Data model

| Model | Purpose | Key fields |
| --- | --- | --- |
| `User` | Admins and tenants | `role`: `ADMIN` / `TENANT`; optional link to a `Unit` |
| `Unit` | A rentable property | `priceCents` (monthly rent in cents), bedrooms, bathrooms, area, `status`: `AVAILABLE` / `OCCUPIED` / `MAINTENANCE`, amenities (JSON string) |
| `UnitPhoto` | Photos for a unit | file path, belongs to a `Unit` |
| `Booking` | A guest's viewing request | guest contact details, preferred date, `status`: `PENDING` / `ACCEPTED` / `DECLINED` |
| `Payment` | A charge to a tenant | `amountCents`, due date, `type`: `RENT` / `DEPOSIT` / `UTILITY`, `status`: `PENDING` / `SUBMITTED` / `PAID` / `OVERDUE` |

Money is stored and sent by the API as whole cents (`250000` = $2,500.00) so totals never pick up floating-point rounding errors. The frontend converts to and from dollars only for display and input (`frontend/lib/money.ts`).

## Authentication and roles

Every API route requires a valid JWT unless it's marked `@Public()`. Admin-only routes also use `@Roles('ADMIN')` with `RolesGuard`.

- **Session cookie.** `POST /auth/login` sets the JWT in an `HttpOnly`, `SameSite=Lax` cookie (`raresidence_session`) and returns only the user. Page scripts can't read it, so an XSS bug can't steal it. `POST /auth/logout` clears it. A `Bearer` header is still accepted for scripts and API clients.
- **Same-origin API.** The browser calls `/api/*` on the frontend's own origin; `next.config.ts` rewrites those requests (and `/uploads/*`) to the NestJS server. That keeps the cookie first-party and removes the need for CORS in the browser.
- **Route protection.** `frontend/proxy.ts` (Next 16's replacement for middleware) redirects visitors without a session from `/admin` and `/tenant` to `/login?next=…`, and sends each role to its own area. It only *reads* the cookie to decide where to redirect; the API verifies the token on every request.

### Deploying

- Serve over HTTPS and set `COOKIE_SECURE=true` (or `NODE_ENV=production`).
- Next.js passes a client-supplied `X-Forwarded-For` through unchanged, so don't expose it directly to the internet: put a load balancer or CDN in front that sets that header, and set the backend's `TRUST_PROXY` to the number of proxies in between (e.g. `2` for load balancer → Next.js). The per-email login limit still applies if this is misconfigured.

## API overview

All routes are under `/api`.

| Method | Route | Access |
| --- | --- | --- |
| POST | `/auth/login` | Public (sets the session cookie) |
| POST | `/auth/logout` | Public (clears it) |
| GET | `/units` | Public |
| GET | `/units/:id` | Public |
| GET | `/units/my-unit` | Logged in |
| POST | `/units` | Admin |
| PATCH | `/units/:id` | Admin |
| DELETE | `/units/:id` | Admin |
| POST | `/units/:id/photos` | Admin |
| DELETE | `/units/:id/photos/:photoId` | Admin |
| POST | `/bookings` | Public |
| GET | `/bookings` | Admin |
| PATCH | `/bookings/:id` | Admin |
| GET | `/users/me` | Logged in |
| GET | `/users` | Admin |
| POST | `/users` | Admin |
| PATCH | `/users/:id/assign` | Admin |
| GET | `/payments` | Admin |
| GET | `/payments/my`, `/payments/my-payments` | Logged in |
| POST | `/payments` | Admin |
| PATCH | `/payments/:id` | Logged in (the service checks role and ownership) |

## Scripts

**Backend** (`backend/`)

| Command | Does |
| --- | --- |
| `npm run start:dev` | Run the API with hot reload |
| `npm run build` / `npm run start:prod` | Build and run the compiled API |
| `npm run seed` | Reset the database with sample data |
| `npm run lint` / `npm run format` | ESLint / Prettier |
| `npm test` / `npm run test:e2e` | Unit / end-to-end tests (Jest) |

**Frontend** (`frontend/`)

| Command | Does |
| --- | --- |
| `npm run dev` | Run the dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |

## Notes for contributors

- `frontend/AGENTS.md`: this Next.js version has breaking API changes. Check the docs in `frontend/node_modules/next/dist/docs/` before writing frontend code.
- `backend/src/app.controller.ts` and `app.service.ts` are unused leftovers from the Nest starter.
