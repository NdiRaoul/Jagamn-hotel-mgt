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
| Role-based access guard | ✅ Done |

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
| Reception cash payments | ✅ Done |
| Currency handling (XAF, zero-decimal) | ✅ Done |

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
| Storekeeper portal | 🚧 Partial (stub) |
| Inventory request fulfillment workflow | ❌ Not done (placeholder/stub endpoint) |
| Inventory items management | 🚧 Partial |

## Admin / Manager Portal

| Feature | Status |
| --- | --- |
| Admin dashboard overview | ✅ Done |
| Rooms & room types management | ✅ Done |
| Staff management + staff detail | ✅ Done |
| Send staff credentials / reset password / suspend / reactivate | ✅ Done |
| HR (departments, positions, leave) | ✅ Done |
| HR deductions | ✅ Done |
| Payroll runs + pay items | ✅ Done |
| Procurement (suppliers, purchase orders, budgets) | ✅ Done |
| F&B / menu management | ✅ Done |
| Revenue reporting | ✅ Done |
| Alerts management | ✅ Done |

## Superadmin / Owner Portal

| Feature | Status |
| --- | --- |
| Superadmin dashboard overview | ✅ Done |
| Rooms management | ✅ Done |
| Staff management + staff detail | ✅ Done |
| HR + deductions | ✅ Done |
| Payroll | ✅ Done |
| Procurement | ✅ Done |
| Revenue reporting | ✅ Done |
| Financial sync | ✅ Done |
| Audit log (partitioned) | ✅ Done |
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

---

### Known incomplete areas
- **Storekeeper portal** — UI is a placeholder with a `TODO(storekeeper)` marker; the inventory-request fulfillment API (`/api/storekeeper/inventory-requests/[id]`) returns a permissive stub and full fulfillment logic is pending.
