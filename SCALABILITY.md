# Jagamn Palace — Scalability, Reliability & Performance Guide

This document records what is already in place and what to add as traffic grows.
It is grounded in the actual stack: **Next.js 16 (App Router, Node runtime)**,
**Supabase/Postgres**, **Upstash Redis**, **Stripe/Fapshi**, deployed on Vercel
or a Node/Docker host.

> Golden rule already encoded in `src/lib/redis/cache.ts`: **Postgres + the
> payment provider are the only sources of truth.** Redis and the Next cache are
> accelerators that must fail open. Never cache payment status, booking status,
> money-received decisions, or auth/session.

---

## 1. Caching

### In place
- **Cache-aside layer** — `src/lib/redis/cache.ts`: `getCached`/`setCached`/
  `invalidate`/`invalidateByPrefix`. Layer order Redis → `unstable_cache` →
  Supabase, fail-open if Redis is down. Already migrated to Next 16's two-arg
  `revalidateTag`.
- **Newly applied:** `getHelpArticles()` now reads through `getCached`
  (`help:role:*`, 120 s TTL) — see `src/lib/data/help.ts`.

### Add next (highest ROI first)
1. **Cache hot, non-financial reads** with `getCached`:
   - Public room types & detail (`roomtype:slug:*`, 300 s) and availability
     (`availability:slug:*`, 30–60 s).
   - Menu (`menu:*`, 120 s) — guest dining + kitchen.
   - Admin/superadmin dashboard aggregates (`dashboard:*`, 60–120 s): revenue
     views, occupancy, KPI counts. These are read-heavy and tolerate seconds of
     staleness.
2. **Invalidate on write.** After a booking/room/menu/price mutation, call
   `invalidate(key)` / `invalidateByPrefix(prefix)` so users see fresh data
   immediately instead of waiting out the TTL (pattern already used by webhooks).
3. **HTTP caching at the edge** for truly public, anonymous pages (marketing,
   room listing): `Cache-Control: s-maxage=60, stale-while-revalidate=300` via
   route segment config, served from the CDN.
4. **Consider Cache Components (Next 16 PPR)** — `cacheComponents: true` to
   prerender static shells and stream the dynamic, per-user parts. Migrate
   incrementally; keep money/session paths dynamic.

---

## 2. Load balancing & auto-scaling

### Enablers in place
- **Readiness probe** — `GET /api/health?check=db` now pings the DB and returns
  **503** when it is unreachable, so a load balancer / orchestrator drains the
  instance. `GET /api/health` stays a lightweight liveness probe.
- **Stateless app tier** — sessions live in Supabase auth cookies + the
  `staff_last_activity` cookie (not in server memory), so any instance can serve
  any request. This is the precondition for horizontal scaling.

### Add next
- **Horizontal scaling:** run N stateless instances behind a load balancer
  (Vercel does this automatically; for self-host use an ALB / Nginx / Cloud Run).
  - Liveness: `GET /api/health`
  - Readiness: `GET /api/health?check=db`
- **Autoscaling policy:** scale on p95 latency + CPU + concurrent requests, not
  just CPU. Set sane min instances to avoid cold starts during business hours.
- **Pin background/cron work off the request path** (see §4) so autoscaling the
  web tier never duplicates scheduled jobs.
- **Sticky sessions are NOT required** — keep it that way (no in-process state).

---

## 3. Database (the real scaling bottleneck)

- **Connection pooling (do this first):** serverless/many instances exhaust
  Postgres connections fast. Route app traffic through **Supabase Supavisor /
  PgBouncer (transaction mode)** and keep direct connections only for migrations.
- **Read replicas:** send dashboards, reporting views, and exports to a read
  replica; keep writes + money paths on primary.
- **Indexes:** the schema already ships covering indexes (e.g.
  `notifications_staff_idx`, `notifications_role_idx`, `help_articles_role_idx`).
  Audit slow queries with `pg_stat_statements` and add composite indexes for the
  hottest filters (bookings by date/status, folio by booking).
- **Partitioning at volume:** range-partition the append-heavy tables —
  `audit_log`, `notifications`, `payment_events`, `folio_entries`,
  `dining_orders` — by month (or adopt `pg_partman`). The fix-prompt schema
  already includes a partitioning template/scaffold.
- **Archive cold data:** move audit/notification rows older than N months to
  cold storage to keep hot tables small.

---

## 4. Background work, queues & rate limiting

- **Rate limiting** — `src/lib/redis/rate-limit.ts` (Upstash sliding window,
  fail-open) already guards booking/auth/check-email/payment. **Extend** the
  named-limiter pattern to:
  - `/api/notifications` (per caller) and `/api/staff/heartbeat` (per session),
  - all mutating admin routes (payroll pay, leave decisions, deductions).
- **Idempotency** — `src/lib/redis/webhook.ts` already dedupes provider webhooks
  (Redis SET NX → `webhook_events` fallback). Keep using a per-item idempotency
  key for any external side effect (the payroll pay route is structured for it).
- **Move slow/async work to a queue** (Upstash QStash, or Postgres-backed):
  email sending (Resend), PDF/receipt generation (jsPDF), report exports, and
  notification fan-out — so request latency stays low and retries are durable.
- **Cron** — booking expiry (`/api/bookings/expire`) and reconciliation
  (`src/lib/redis/reconcile.ts`) should run as scheduled jobs on a single owner,
  not per-instance.

---

## 5. Reliability & correctness

- **Graceful degradation everywhere** — Redis down ⇒ rate limit fails open,
  cache falls through to Postgres, webhook dedup falls back to the table.
  Preserve this property in any new code.
- **Notifications are display-only** — `notify()` swallows/logs errors so a
  notification failure never breaks the originating flow. Keep this contract.
- **Server-side authz on every privileged route** — `proxy.ts` (the Next 16
  renamed middleware) is defence-in-depth, but each route handler must re-check
  `getStaffSession` + role (`requireStaffRole`). Next 16 explicitly warns not to
  rely on proxy alone for authz.
- **Session timeout** — 20-min idle is enforced in three places: `proxy.ts`,
  `getStaffSession`, and the client `SessionGuard`. Server checks are the teeth.

---

## 6. Observability (add before you need it)

- **Structured logging** with a request/correlation id; ship to a log sink.
- **Error tracking** (Sentry) on both server and client.
- **Metrics & tracing** (OpenTelemetry): p50/p95/p99 latency per route, DB query
  time, cache hit ratio, Redis health, payment success rate.
- **Dashboards & alerts** on the readiness probe, 5xx rate, payment failures,
  and DB connection saturation.
- **Audit log** — already written by 20+ routes into `audit_log` and surfaced in
  `superadmin/audit`; route security-relevant events through it.

---

## 7. Suggested priority order

1. **DB connection pooling** (Supavisor) — cheapest, biggest stability win.
2. **Cache hot reads** (rooms, availability, menu, dashboards) via `getCached` +
   invalidate-on-write.
3. **Readiness-probe-based autoscaling** behind a load balancer.
4. **Extend rate limiting** to notifications/heartbeat/admin-mutations.
5. **Move email/PDF/exports to a queue.**
6. **Read replicas** for reporting.
7. **Partition** `audit_log` / `notifications` / `payment_events` /
   `folio_entries` / `dining_orders` when row counts warrant it.
8. **Observability** (logs, errors, metrics, alerts).
