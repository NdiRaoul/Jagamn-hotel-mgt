# Jagamn Palace — Developer Reference

---

## Staff Login Credentials

> These accounts are seeded via `npx tsx scripts/seed.ts`. All accounts have email confirmation pre-verified.

| Role         | Email                      | Password     | Portal URL |
| ------------ | -------------------------- | ------------ | ---------- |
| Admin        | admin@jagamnpalace.com     | Admin123     | /admin     |
| Manager      | manager@jagamnpalace.com   | Manager123   | /admin     |
| Receptionist | reception@jagamnpalace.com | Reception123 | /reception |

---

## Stripe Test Card

| Field       | Value               |
| ----------- | ------------------- |
| Card Number | 4242 4242 4242 4242 |
| Expiry      | 12/34               |
| CVV         | 321                 |

---

## Running the Seed

```bash
npx tsx scripts/seed.ts
```

Idempotent — safe to re-run. Clears and re-seeds room data, hotel amenities, and upserts staff/admin auth accounts.
