# Jagamn Palace — Developer Reference

---

## Staff Login Credentials

> These accounts are seeded via `npx tsx scripts/seed.ts`. All accounts have email confirmation pre-verified.

| Role         | Email                      | Password     | Portal URL   |
| ------------ | -------------------------- | ------------ | ------------ |
| Owner        | owner@jagamnpalace.com     | Owner123     | /superadmin  |
| Admin        | admin@jagamnpalace.com     | Admin123     | /admin       |
| Manager      | manager@jagamnpalace.com   | Manager123   | /admin       |
| Receptionist | reception@jagamnpalace.com | Reception123 | /reception   |
| Kitchen      | kitchen@jagamnpalace.com   | Kitchen123   | /kitchen     |

---

## Currency System

All prices are stored in **XAF (Central African CFA Franc)** as the base currency:

- Room rates: whole XAF (e.g., 122,000 XAF)
- Menu items: whole XAF (e.g., 4,500 XAF)
- Payroll/folio: XAF minor units (×100)

**Display conversion by visitor location:**

- CEMAC countries (CM, CF, TD, CG, GQ, GA) → FCFA (XAF)
- United Kingdom (GB) → GBP
- All others → USD

Indicative rates: 1 USD ≈ 615 XAF, 1 GBP ≈ 780 XAF

---

## Stripe Test Card

| Field       | Value               |
| ----------- | ------------------- |
| Card Number | 4242 4242 4242 4242 |
| Expiry      | 12/34               |
| CVV         | 321                 |

---

## Running the Seed

### Initial Setup

1. **Run the consolidated schema in Supabase SQL Editor:**

   ```sql
   -- Run supabase/schema.sql (contains all migrations merged)
   -- This includes: base schema, HR/payroll tables, dining flow, notifications, help articles, and all indexes
   ```

2. **Run the consolidated seed script:**
   ```bash
   npx tsx scripts/seed.ts  # All data: rooms, amenities, staff, departments, menu, inventory, help articles, sample data
   ```

The seed script is **idempotent** — safe to re-run. It includes:

- Base data (room types, amenities, physical units, staff accounts)
- Extended data (departments, positions, leave types, menu categories/items, inventory, suppliers, budgets)
- Sample data (staff salaries/hire dates, help articles)

All prices are automatically in XAF (base currency).

---

## Architecture Notes

- **Session timeout:** 20 minutes of inactivity (staff portals)
- **Notifications:** Real-time via Supabase subscriptions (guest + staff)
- **Payroll:** Monthly runs with deductions, Stripe Connect + MoMo payouts
- **Dining flow:** Guest → Kitchen (realtime) → Storekeeper (stub, to be completed)
- **Folio:** Charge-to-room for dining, minibar, damages; cash/card payments
- **Help:** Dynamic articles from `help_articles` table (editable without code deploy)
