# Jagamn Palace — Hotel Management System: Feature Inventory

Status legend: ✅ Done · 🚧 Partial / In progress · ❌ Not done (stub or missing)

---

## Guest-Facing Website

| Feature | Status |
| --- | --- |
| Landing / home page | ✅ Done |
| Rooms listing page | ✅ Done |
| Room detail page (`/rooms/[slug]`) | ✅ Done |
| Room availability check (per room/date) | ✅ Done |
| Online booking flow | ✅ Done |
| Booking confirmation page + printable receipt | ✅ Done |
| Booking expiry (auto-release unpaid holds) | ✅ Done |

## Authentication & Accounts

| Feature | Status |
| --- | --- |
| Guest login / signup | ✅ Done |
| Staff login (separate portal) | ✅ Done |
| Forgot password | ✅ Done |
| Reset password | ✅ Done |
| Email confirmation / auth callback | ✅ Done |
| Create profile on first login | ✅ Done |
| Session timeout / idle logout (staff, 20 min) | ✅ Done |
| Role-based access guard (each role confined to its portal; owner all-access; role-mismatch bounces to own portal) | ✅ Done |
| Login event capture (device + location) for audit | ✅ Done |

## Guest Dashboard

| Feature | Status |
| --- | --- |
| Dashboard overview | ✅ Done |
| My bookings list + booking detail | ✅ Done |
| In-room dining ordering | ✅ Done |
| Payments / transaction history | ✅ Done |
| Profile management | ✅ Done |

## Payments

| Feature | Status |
| --- | --- |
| Stripe card payments | ✅ Done |
| Stripe setup intent / save payment method | ✅ Done |
| Stripe refunds | ✅ Done |
| Fapshi (Mobile Money) payments | ✅ Done |
| Fapshi refunds | ✅ Done |
| Payment webhooks (Stripe/Fapshi) | ✅ Done |
| Payment ledger (double-entry) | ✅ Done |
| Booking confirmation on successful payment | ✅ Done |
| Payment/booking status auto-flips pending → paid (or failed) on processor result | ✅ Done |
| Reception cash payments | ✅ Done |
| Currency handling (XAF/FCFA, zero-decimal) — client & server | ✅ Done |

## Reception / Front Desk

| Feature | Status |
| --- | --- |
| Reception dashboard | ✅ Done |
| Reservations list | ✅ Done |
| Arrivals board | ✅ Done |
| Check-in flow | ✅ Done |
| Check-in success screen | ✅ Done |
| Departures + check-out flow | ✅ Done |
| Walk-in booking | ✅ Done |
| Room board (status overview) | ✅ Done |
| Guest search | ✅ Done |
| Transactions view | ✅ Done |
| Folio (charge-to-room: dining, minibar, damages) | ✅ Done |
| Reception settings | ✅ Done |
| Reception help articles | ✅ Done |

## Kitchen / F&B

| Feature | Status |
| --- | --- |
| Kitchen orders board (realtime) | ✅ Done |
| Order status updates | ✅ Done |
| Menu management (kitchen view) | ✅ Done |
| Kitchen reporting | ✅ Done |
| Inventory requests (kitchen → store) | ✅ Done |
| Kitchen help articles | ✅ Done |

## Storekeeper / Inventory

| Feature | Status |
| --- | --- |
| Storekeeper portal (own sidebar, session-guarded, live staff) | ✅ Done |
| Dashboard (KPI cards: total inventory value, critical alerts, open orders) | ✅ Done |
| Inventory page (dynamic, 10/page, status badges) | ✅ Done |
| Add Inventory item (modal + DB write + table refresh) | ✅ Done |
| Inventory item image upload (Supabase storage) | ✅ Done |
| Update stock count / manual audit | ✅ Done |
| Inventory request fulfillment workflow (approve/fulfill/reject + stock decrement + notify kitchen) | ✅ Done |
| Purchase orders (list, create via modal, receive goods → stock increment) | ✅ Done |
| Reports (valuation, stock movement, low stock, PO history, consumption) | ✅ Done |
| Reports export (CSV + PDF) | ✅ Done |
| Pricing in FCFA via `formatMoney` | ✅ Done |
| Color scheme aligned to app tokens | ✅ Done |

> Runtime note: storekeeper screens depend on the `supabase/migrations/2026_storekeeper.sql` migration being applied (adds `inventory_items.max_stock/image_url/last_counted_at/supplier_id`, request approval columns, `storekeeper_stock_today` view). Apply it in the Supabase SQL editor, then `npm run seed`.

## Admin / Manager Portal

| Feature | Status |
| --- | --- |
| Admin dashboard overview (+ operations alerts & procurement KPI cards) | ✅ Done |
| Rooms & room types management | ✅ Done |
| Users / Customers page (members + guests, returning, account status, detail modal) | ✅ Done |
| Staff management + staff detail | ✅ Done |
| Send staff credentials / reset password / suspend / reactivate | ✅ Done |
| HR (departments, positions, leave) | ✅ Done |
| HR deductions (own sidebar item) | ✅ Done |
| Payroll runs + pay items (FCFA) | ✅ Done |
| Procurement — approve/decline orders (admin/owner only); suppliers; create PO with line-item quantities | ✅ Done |
| F&B / menu management (live `menu_items`) | ✅ Done |
| Revenue reporting (FCFA) | ✅ Done |
| Alerts management | ✅ Done |
| Audit logs (Operations / Logins tabs, device + location, CSV/PDF export) | ✅ Done |

## Superadmin / Owner Portal

| Feature | Status |
| --- | --- |
| Superadmin dashboard overview (+ procurement & low-stock cards) | ✅ Done |
| Rooms management | ✅ Done |
| Users / Customers page | ✅ Done |
| Staff management + staff detail | ✅ Done |
| HR + deductions | ✅ Done |
| Payroll | ✅ Done |
| Procurement | ✅ Done |
| Revenue reporting | ✅ Done |
| Financial sync | ✅ Done |
| Audit log (Operations / Logins tabs, device + location, CSV/PDF export) | ✅ Done |
| System alerts | ✅ Done |
| Settings / system config / hotel policies | ✅ Done |
| F&B management | ✅ Done |

## HR & Payroll

| Feature | Status |
| --- | --- |
| Departments & positions | ✅ Done |
| Leave types, requests, balances | ✅ Done |
| Staff deductions | ✅ Done |
| Payroll runs (monthly) | ✅ Done |
| Payroll items + pay-out | ✅ Done |
| Self-service payslips | ✅ Done |
| Self-service leave requests | ✅ Done |
| Self-service profile / avatar / change password | ✅ Done |

## Notifications & Realtime

| Feature | Status |
| --- | --- |
| Notifications (guest + staff) | ✅ Done |
| Realtime updates via Supabase subscriptions | ✅ Done |
| Email notifications (Resend) — booking receipt/confirmation | ✅ Done |
| System alerts engine | ✅ Done |
| Staff heartbeat / presence | ✅ Done |

## Platform / Infrastructure

| Feature | Status |
| --- | --- |
| Supabase database schema + seed script | ✅ Done |
| Redis caching (Upstash) | ✅ Done |
| Rate limiting | ✅ Done |
| Distributed locks (Redis) | ✅ Done |
| Webhook idempotency / dedup | ✅ Done |
| Payment reconciliation | ✅ Done |
| Health check endpoint | ✅ Done |
| Audit logging | ✅ Done |
| PDF generation (jsPDF) | ✅ Done |
| Money formatting with comma separators (XAF) | ✅ Done |

