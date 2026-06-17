# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
npm run seed       # Seed the database (idempotent)
```

There are no automated tests. Linting uses ESLint 9 flat config (`eslint.config.mjs`).

## Architecture

**Next.js 16 / React 19 / TypeScript** — hotel management system for Jagamn Palace.

### Route Groups

| Group | Path | Purpose |
|---|---|---|
| `(auth)` | `/login`, `/signup`, `/staff-login`, etc. | Authentication pages |
| `(guest)` | `/`, `/rooms`, `/booking`, `/dashboard` | Guest-facing portal |
| `(staff)/reception` | `/reception` | Receptionist portal |
| `(staff)/admin` | `/admin` | Admin & Manager portal |
| `(staff)/superadmin` | `/superadmin` | Owner portal |
| `(staff)/kitchen` | `/kitchen` | Kitchen staff portal |
| `(staff)/storekeeper` | `/storekeeper` | Storekeeper portal |

### Auth & Routing

- **`src/proxy.ts`** — Next.js middleware (exported as `proxy`). Handles Supabase session refresh, guest route protection (`/dashboard`), and staff portal role enforcement. Every staff role is strictly confined to its own portal prefix.
- **`src/lib/auth/guard.ts`** — Server-side route guards (`requireOwner`, `requireAdminOrHigher`, `requireStaffRole`). Used in page/layout Server Components.
- **`src/lib/auth/staff-session.ts`** — `getStaffSession()` reads the staff session cookie server-side.
- Session timeout: 20 minutes of inactivity (enforced in middleware via `ACTIVITY_COOKIE_NAME` cookie).

### Data Layer

- **Supabase** is the database and auth provider.
  - `src/lib/supabase.ts` — browser client (`createSupabaseBrowserClient`)
  - `src/lib/supabase-server.ts` — server client
  - `src/lib/supabase-client.ts` — shared client utilities
- **`src/lib/data/`** — Server-side data fetching functions, one file per domain (rooms, staff, payroll, dining, etc.). These are called from Server Components and API routes.
- **`src/types/database.ts`** — Supabase-generated TypeScript types for all tables.
- **Redis / Upstash** (`src/lib/redis/`) — caching, distributed locks, rate limiting, webhook deduplication.

### API Routes (`src/app/api/`)

REST endpoints organized by domain: `bookings`, `rooms`, `payments`, `dining`, `kitchen`, `reception`, `staff`, `hr`, `payroll`, `storekeeper`, `notifications`, `alerts`, `audit`, `admin`, `account`, `webhooks`.

### Payments

- **Stripe** for guest booking payments (`src/lib/payments/`).
- Stripe webhook at `src/app/api/webhooks/`.
- Test card: `4242 4242 4242 4242`, exp `12/34`, CVV `321`.

### Currency

All prices stored in **XAF** (Central African CFA Franc). Display conversion:
- CEMAC countries → FCFA
- GB → GBP  
- All others → USD

Rates: 1 USD ≈ 615 XAF, 1 GBP ≈ 780 XAF. See `src/lib/currency.ts`.

### UI

- **shadcn/ui** components in `src/components/ui/` (Radix-based).
- **Tailwind CSS v4** — config via `postcss.config.mjs`, no `tailwind.config.js`.
- `components.json` configures the shadcn CLI.

### Database Setup

Run `supabase/schema.sql` in the Supabase SQL editor first, then `npm run seed`.

## Staff Roles

| Role | Portal | Auth |
|---|---|---|
| `owner` | `/superadmin` | staff login |
| `admin` / `manager` | `/admin` | staff login |
| `reception` | `/reception` | staff login |
| `kitchen` | `/kitchen` | staff login |
| `storekeeper` | `/storekeeper` | staff login |

Guests authenticate via the standard Supabase auth flow (`/login`, `/signup`).
