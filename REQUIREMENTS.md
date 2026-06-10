# Jagamn Palace — Configuration & Environment Requirements

This document lists **every external service and environment variable** the application
depends on, **where to find each value**, and **what it does**. It is the technical
reference for whoever deploys or maintains the app.

> For the **client-facing checklist** of accounts to open and what they cost, see
> [CLIENT_PRODUCTION_SETUP.md](CLIENT_PRODUCTION_SETUP.md).

All variables live in `.env` locally and must be re-entered in the hosting provider's
environment settings (Vercel → Project → Settings → Environment Variables) for production.

---

## 1. Application URLs

| Variable | What it does | Where to get the value |
| --- | --- | --- |
| `NEXT_APP_BASE_URL` | Internal base URL used by server code. | Your production domain, e.g. `https://jagamnpalace.com`. Locally `http://localhost:3000`. |
| `NEXT_PUBLIC_APP_URL` | Public app URL used in emails (staff login links, etc.). | Same production domain. |
| `NEXT_PUBLIC_SITE_URL` | Public marketing/site URL used in metadata and links. | Same production domain. |
| `WEBHOOK_URL` | Base URL that external services call back to (payments, email). | Production domain `+ /api/webhooks`. In dev this is the ngrok tunnel URL. |
| `INTERNAL_WEBHOOK_SECRET` | Protects the booking-expiry cron endpoint so only our own scheduler can call it. | **Self-generated.** Create any random 32+ character string (e.g. `openssl rand -hex 32`). |

---

## 2. Supabase — Database, Auth, Realtime, Storage

Supabase is the **primary database** (PostgreSQL) plus user authentication, realtime
subscriptions (kitchen orders, notifications), and file storage (avatars).

The full schema lives in [supabase/schema.sql](supabase/schema.sql) and is seeded with
[scripts/seed.ts](scripts/seed.ts).

| Variable | What it does | Where to get the value |
| --- | --- | --- |
| `SUPABASE_URL` | Project API URL (server-side). | Supabase Dashboard → Project → **Settings → Data API → Project URL**. |
| `SUPABASE_SERVICE_ROLE_KEY` | Full-access server key. **Never exposed to the browser.** | Supabase Dashboard → **Settings → API Keys → `service_role` secret**. |
| `NEXT_PUBLIC_SUPABASE_URL` | Same project URL, browser-safe. | Same Project URL as above. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe public key (respects row-level security). | Supabase Dashboard → **Settings → API Keys → `anon` public**. |

**To set up:** create a project at https://supabase.com, run `supabase/schema.sql` in the
SQL Editor, then run `npx tsx scripts/seed.ts` to load rooms, staff accounts, menu, etc.

---

## 3. Fapshi — Mobile Money Payments (Cameroon)

Fapshi handles **MTN/Orange Mobile Money** payments and refunds. Used for guest bookings
and reception walk-ins.

| Variable | What it does | Where to get the value |
| --- | --- | --- |
| `FAPSHI_API_USER` | API user identifier for your Fapshi service. | Fapshi Dashboard → your service → **API Keys / User**. |
| `FAPSHI_API_KEY` | Secret API key for that service. | Fapshi Dashboard → your service → **API Keys**. |
| `FAPSHI_BASE_URL` | API endpoint. Sandbox vs Live differ. | Sandbox: `https://sandbox.fapshi.com` · Live: `https://live.fapshi.com`. |
| `FAPSHI_WEBHOOK_SECRET` | Verifies that payment callbacks genuinely come from Fapshi. | Fapshi Dashboard → **Webhook settings** (set the webhook URL to `https://yourdomain/api/webhooks`). |

**Sandbox → Live:** create a **separate Live service** in the Fapshi dashboard, swap the
base URL, and re-issue the API user/key/webhook secret from the live service.

---

## 4. Stripe — Card Payments & Refunds

Stripe handles **international card payments**, saved payment methods, and refunds.

| Variable | What it does | Where to get the value |
| --- | --- | --- |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Browser-safe key that loads Stripe.js / card form. | Stripe Dashboard → **Developers → API keys → Publishable key**. |
| `STRIPE_SECRET_KEY` | Server-side secret key to create charges/refunds. | Stripe Dashboard → **Developers → API keys → Secret key**. |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe webhook events (payment success, refunds). | Stripe Dashboard → **Developers → Webhooks → add endpoint** (`https://yourdomain/api/webhooks`) → copy the **Signing secret**. |
| `NEXT_PUBLIC_STRIPE_MERCHANT_COUNTRY` | Merchant country for the payment sheet (defaults to `CM`). | Set to the hotel's country code, e.g. `CM`. |

**Test vs Live:** the keys above are **Test mode** by default (`pk_test_…`, `sk_test_…`).
Switch the dashboard toggle to **Live**, copy the `pk_live_…` / `sk_live_…` keys, and
create a **new live webhook endpoint** to get its signing secret.

---

## 5. Resend — Transactional Email

Resend sends **booking confirmations, receipts, staff credentials, and payslips**.

| Variable | What it does | Where to get the value |
| --- | --- | --- |
| `RESEND_API_KEY` | Authenticates email sending. | Resend Dashboard → **API Keys → Create API Key**. |
| `RESEND_WEBHOOK_SECRET` | Verifies delivery/bounce webhook events. | Resend Dashboard → **Webhooks → add endpoint** → copy signing secret. |
| `EMAIL_FROM` | The "from" address on all outgoing email. | Must be an address on a **domain you verified** in Resend, e.g. `noreply@jagamnpalace.com`. |

**Important:** to send from your own domain you must **verify the domain** in Resend
(add the DNS records they provide — see Namecheap DNS in the client doc). Until then you
can only send from `onboarding@resend.dev`.

---

## 6. Upstash Redis — Caching, Rate Limiting, Locks

Upstash provides serverless Redis used for caching, API rate limiting, distributed locks
(prevents double-booking), and webhook deduplication.

| Variable | What it does | Where to get the value |
| --- | --- | --- |
| `UPSTASH_REDIS_REST_URL` | REST endpoint of your Redis database. | Upstash Console → your database → **REST API → UPSTASH_REDIS_REST_URL**. |
| `UPSTASH_REDIS_REST_TOKEN` | Auth token for the REST endpoint. | Upstash Console → same page → **UPSTASH_REDIS_REST_TOKEN**. |

---

## 7. Ngrok — Local Development Only (not needed in production)

`@ngrok/ngrok` exposes your local machine so payment/email webhooks can reach it during
development. **In production, webhooks point at your real domain, so ngrok is not used.**

---

## Quick checklist for going live

- [ ] Create production accounts for: Supabase, Fapshi (Live), Stripe (Live), Resend, Upstash, Vercel, Namecheap.
- [ ] Verify the email domain in Resend (add DNS records in Namecheap).
- [ ] Point Fapshi, Stripe, and Resend webhooks at `https://yourdomain/api/webhooks`.
- [ ] Re-enter every variable above in Vercel → Settings → Environment Variables (Production).
- [ ] Run `supabase/schema.sql` and `npx tsx scripts/seed.ts` against the production database.
- [ ] Generate a fresh `INTERNAL_WEBHOOK_SECRET`.
- [ ] Change the seeded staff passwords listed in [readme.md](readme.md).
