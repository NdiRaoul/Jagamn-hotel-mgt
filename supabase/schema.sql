-- ============================================================
-- Jagamn Palace — Supabase Schema  (v2 — users table)
-- Run this in the Supabase SQL Editor.
-- Drops ALL tables and recreates them from scratch.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "pgcrypto";
-- btree_gist is required for the date-range exclusion constraint (Phase 3A)
create extension if not exists "btree_gist";

-- ── Drop existing views / functions / triggers ───────────────
drop view     if exists room_availability_summary;
drop function if exists generate_booking_ref() cascade;

-- ── Drop existing tables (dependency order) ──────────────────
drop table if exists payments                    cascade;
drop table if exists bookings                    cascade;
drop table if exists payment_methods             cascade;
drop table if exists users                       cascade;
drop table if exists guest_profiles              cascade;
drop table if exists room_type_unavailable_dates cascade;
drop table if exists rooms                       cascade;
drop table if exists room_amenities              cascade;
drop table if exists hotel_amenities             cascade;
drop table if exists room_types                  cascade;

-- ============================================================
-- TABLES
-- ============================================================

-- ── room_types ───────────────────────────────────────────────
create table room_types (
  id                  uuid        primary key default gen_random_uuid(),
  slug                text        unique not null,
  name                text        not null,
  collection_label    text        not null,
  collection          text        not null,
  badge               text,
  price_per_night     integer     not null,
  description         text,
  long_description    text,
  sqft                integer,
  bed_type            text,
  max_guests          integer,
  cancellation_policy text,
  main_image          text,
  gallery_images      text[],
  sort_order          integer     default 0,
  created_at          timestamptz default now()
);

-- ── room_amenities ───────────────────────────────────────────
create table room_amenities (
  id           uuid    primary key default gen_random_uuid(),
  room_type_id uuid    references room_types(id) on delete cascade,
  icon         text    not null,
  label        text    not null,
  sort_order   integer default 0
);

-- ── rooms (physical units) ───────────────────────────────────
create table rooms (
  id           uuid        primary key default gen_random_uuid(),
  room_type_id uuid        references room_types(id) on delete cascade,
  unit_code    text        unique not null,
  floor        integer,
  is_active    boolean     default true,
  created_at   timestamptz default now()
);

-- ── room_type_unavailable_dates ──────────────────────────────
create table room_type_unavailable_dates (
  id                   uuid  primary key default gen_random_uuid(),
  room_type_id         uuid  references room_types(id) on delete cascade,
  from_date            date  not null,
  to_date              date  not null,
  alternate_room_slugs text[],
  alternate_dates      jsonb
);

-- ── users  (replaces guest_profiles) ────────────────────────
-- Holds every person who has ever interacted with the app.
-- role = 'guest'  → booked without an account
-- role = 'member' → has a Supabase auth account
create table users (
  id               uuid        primary key default gen_random_uuid(),
  auth_user_id     uuid        references auth.users(id) on delete set null,
  full_name        text,
  email            text        not null,
  phone            text,
  country          text,
  nationality      text,
  id_type          text,
  id_number        text,
  role             text        not null default 'guest',
  loyalty_tier     text        default 'standard',
  special_requests text,
  avatar_url       text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create unique index users_email_idx        on users (email);
create unique index users_auth_user_id_idx on users (auth_user_id)
  where auth_user_id is not null;

-- ── payment_methods ──────────────────────────────────────────
create table payment_methods (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        references auth.users(id) on delete cascade,
  app_user_id      uuid        references users(id) on delete cascade,
  method_type      text        not null,
  label            text,
  card_last4       text,
  card_brand       text,
  card_expiry      text,
  card_holder_name text,
  phone            text,
  stripe_pm_id     text,
  is_default       boolean     default false,
  created_at       timestamptz default now()
);

-- ── bookings ─────────────────────────────────────────────────
create table bookings (
  id                   uuid        primary key default gen_random_uuid(),
  booking_ref          text        unique not null default '',
  -- legacy auth.users link (kept for backward compat, do not use in new code)
  user_id              uuid        references auth.users(id),
  -- new link to our users table
  app_user_id          uuid        references users(id) on delete set null,
  guest_email          text        not null,
  guest_name           text        not null,
  guest_phone          text,
  guest_country        text,
  guest_id_type        text,
  guest_id_number      text,
  room_type_id         uuid        references room_types(id),
  room_id              uuid        references rooms(id),
  room_slug            text        not null,
  check_in             date        not null,
  check_out            date        not null,
  nights               integer     not null,
  guests               integer     not null,
  room_price_per_night integer     not null,
  resort_fee           integer     default 150,
  tax_amount           integer,
  total_amount         integer     not null,
  payment_method       text,
  payment_status       text        default 'pending',
  status               text        default 'pending',
  special_requests     text,
  cancelled_at         timestamptz,
  cancellation_fee     integer     default 0,
  refund_amount        integer     default 0,
  created_at           timestamptz default now()
);

-- ── payments ─────────────────────────────────────────────────
create table payments (
  id                       uuid        primary key default gen_random_uuid(),
  booking_id               uuid        references bookings(id) on delete cascade,
  booking_ref              text,
  user_id                  uuid        references auth.users(id),
  -- app_user_id links to our users table (exists for BOTH guests and members)
  app_user_id              uuid        references users(id) on delete set null,
  amount                   integer     not null,
  currency                 text        default 'USD',
  payment_method           text,
  provider                 text,
  provider_tx_id           text,
  status                   text        default 'pending',
  fapshi_trans_id          text        unique,
  stripe_payment_intent_id text        unique,
  refund_status            text,
  refund_tx_id             text,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

-- ── hotel_amenities ──────────────────────────────────────────
create table hotel_amenities (
  id          uuid    primary key default gen_random_uuid(),
  name        text    not null,
  description text,
  icon        text,
  image       text,
  sort_order  integer default 0
);

-- ============================================================
-- INDEXES (Phase 3A — performance for hot query paths)
-- ============================================================

-- Availability overlap queries
create index if not exists bookings_room_slug_dates_idx
  on bookings (room_slug, check_in, check_out);

create index if not exists bookings_status_idx
  on bookings (status);

-- Dashboard / GET queries
create index if not exists bookings_app_user_id_idx
  on bookings (app_user_id);

create index if not exists bookings_guest_email_idx
  on bookings (guest_email);

-- Idempotency lookups on payment rows
create index if not exists payments_app_user_id_idx
  on payments (app_user_id);

-- ============================================================
-- EXCLUSION CONSTRAINT — prevent double-booking at DB level (Phase 3A)
-- Requires btree_gist extension (enabled above).
-- Blocks any two non-cancelled bookings for the same room_id
-- whose date ranges overlap (using half-open interval [check_in, check_out)).
-- ============================================================
alter table bookings
  add constraint no_overlap
  exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  )
  where (status <> 'cancelled' and room_id is not null);

-- ============================================================
-- TRIGGER — Auto-generate booking_ref  (JP-XXXX-YY)
-- ============================================================

create or replace function generate_booking_ref()
returns trigger language plpgsql as $$
declare
  digits  text;
  letters text;
  ref     text;
  attempts int := 0;
begin
  if new.booking_ref is null or new.booking_ref = '' then
    loop
      digits  := lpad(floor(random() * 10000)::int::text, 4, '0');
      letters := chr(65 + floor(random() * 26)::int) ||
                 chr(65 + floor(random() * 26)::int);
      ref := 'JP-' || digits || '-' || letters;
      if not exists (select 1 from bookings where booking_ref = ref) then
        new.booking_ref := ref;
        exit;
      end if;
      attempts := attempts + 1;
      if attempts > 100 then
        raise exception 'Could not generate unique booking_ref after 100 attempts';
      end if;
    end loop;
  end if;
  return new;
end;
$$;

create trigger trg_booking_ref
  before insert on bookings
  for each row execute function generate_booking_ref();

-- ============================================================
-- VIEW — Room availability summary
-- ============================================================

create or replace view room_availability_summary as
select
  rt.id                                    as room_type_id,
  rt.slug,
  rt.name,
  count(r.id)::int                         as total_rooms,
  count(b.id)::int                         as booked_today,
  (count(r.id) - count(b.id))::int         as available_today
from room_types rt
left join rooms r
  on  r.room_type_id = rt.id
  and r.is_active = true
left join bookings b
  on  b.room_id    = r.id
  and b.check_in  <= current_date
  and b.check_out >  current_date
  and b.status   != 'cancelled'
group by rt.id, rt.slug, rt.name;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table room_types                  enable row level security;
alter table room_amenities              enable row level security;
alter table rooms                       enable row level security;
alter table room_type_unavailable_dates enable row level security;
alter table users                       enable row level security;
alter table payment_methods             enable row level security;
alter table bookings                    enable row level security;
alter table payments                    enable row level security;
alter table hotel_amenities             enable row level security;

-- Public read: room catalogue
create policy "public_read_room_types"
  on room_types for select using (true);

create policy "public_read_room_amenities"
  on room_amenities for select using (true);

create policy "public_read_rooms"
  on rooms for select using (true);

create policy "public_read_unavailable_dates"
  on room_type_unavailable_dates for select using (true);

create policy "public_read_hotel_amenities"
  on hotel_amenities for select using (true);

-- users: own row only (service role bypasses RLS for API routes)
create policy "users_select_own"
  on users for select using (auth.uid() = auth_user_id);

create policy "users_update_own"
  on users for update using (auth.uid() = auth_user_id);

-- payment_methods: own rows only
create policy "payment_methods_select_own"
  on payment_methods for select using (auth.uid() = user_id);

create policy "payment_methods_insert_own"
  on payment_methods for insert with check (auth.uid() = user_id);

create policy "payment_methods_update_own"
  on payment_methods for update using (auth.uid() = user_id);

create policy "payment_methods_delete_own"
  on payment_methods for delete using (auth.uid() = user_id);

-- bookings: authenticated users see own; anyone can insert (guest checkout)
create policy "bookings_select_own"
  on bookings for select
  using (auth.uid() = user_id or app_user_id in (
    select id from users where auth_user_id = auth.uid()
  ));

create policy "bookings_insert_anyone"
  on bookings for insert with check (true);

create policy "bookings_update_own"
  on bookings for update
  using (auth.uid() = user_id or app_user_id in (
    select id from users where auth_user_id = auth.uid()
  ));

-- payments: authenticated users see own (by auth.users id or app_user_id)
create policy "payments_select_own"
  on payments for select
  using (
    auth.uid() = user_id
    or app_user_id in (select id from users where auth_user_id = auth.uid())
  );

create policy "payments_insert_own"
  on payments for insert
  with check (
    auth.uid() = user_id
    or app_user_id in (select id from users where auth_user_id = auth.uid())
  );


-- =====================================================================
-- SCHEMA ADDITIONS — safe to run on the existing database.
-- Everything uses "if not exists" / "create or replace" / additive ALTERs.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. BOOKING STATUS — allow the new "expired" state used by the cron
--    (Phase C reconciliation marks abandoned pending bookings expired).
--    No enum is used (status is plain text), so nothing to alter on the
--    column itself; this is just documentation of allowed values:
--      pending | confirmed | cancelled | expired
-- A partial index speeds up the cron's "find stale pending" scan.
-- ---------------------------------------------------------------------
create index if not exists bookings_pending_created_idx
  on bookings (created_at)
  where status = 'pending';

-- ---------------------------------------------------------------------
-- 2. assign_room_and_book() — atomic room assignment + booking insert.
--    Picks a free unit with FOR UPDATE SKIP LOCKED and inserts in ONE
--    transaction so concurrent requests cannot grab the same unit.
--    The no_overlap exclusion constraint is the final backstop.
--    Called from the API via supabaseAdmin.rpc('assign_room_and_book', {...}).
-- ---------------------------------------------------------------------
create or replace function assign_room_and_book(
  p_room_slug       text,
  p_room_type_id    uuid,
  p_check_in        date,
  p_check_out       date,
  p_guest_email     text,
  p_guest_name      text,
  p_guest_phone     text,
  p_guest_country   text,
  p_guest_id_type   text,
  p_guest_id_number text,
  p_nights          integer,
  p_guests          integer,
  p_room_price      integer,
  p_resort_fee      integer,
  p_tax_amount      integer,
  p_total_amount    integer,
  p_payment_method  text,
  p_special_requests text,
  p_user_id         uuid,
  p_app_user_id     uuid
)
returns table (booking_id uuid, booking_ref text)
language plpgsql
as $$
declare
  v_room_id uuid;
  v_id      uuid;
  v_ref     text;
begin
  -- Lock and pick one active unit of this type with no overlapping booking.
  select r.id into v_room_id
  from rooms r
  where r.room_type_id = p_room_type_id
    and r.is_active = true
    and not exists (
      select 1 from bookings b
      where b.room_id = r.id
        and b.status <> 'cancelled'
        and daterange(b.check_in, b.check_out, '[)')
         && daterange(p_check_in, p_check_out, '[)')
    )
  order by r.unit_code
  for update skip locked
  limit 1;

  -- v_room_id may be null (no physical unit free / room not unit-tracked);
  -- we still insert the booking but room_id stays null. The no_overlap
  -- constraint only applies when room_id is not null.
  insert into bookings (
    user_id, app_user_id, guest_email, guest_name, guest_phone,
    guest_country, guest_id_type, guest_id_number,
    room_type_id, room_id, room_slug, check_in, check_out,
    nights, guests, room_price_per_night, resort_fee, tax_amount,
    total_amount, payment_method, payment_status, status, special_requests
  ) values (
    p_user_id, p_app_user_id, p_guest_email, p_guest_name, p_guest_phone,
    p_guest_country, p_guest_id_type, p_guest_id_number,
    p_room_type_id, v_room_id, p_room_slug, p_check_in, p_check_out,
    p_nights, p_guests, p_room_price, p_resort_fee, p_tax_amount,
    p_total_amount, p_payment_method, 'pending', 'pending', p_special_requests
  )
  returning id, bookings.booking_ref into v_id, v_ref;

  return query select v_id, v_ref;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. DINING / ROOM SERVICE
-- ---------------------------------------------------------------------
create table if not exists menu_categories (
  id          uuid    primary key default gen_random_uuid(),
  name        text    not null,
  sort_order  integer default 0,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

create table if not exists menu_items (
  id            uuid    primary key default gen_random_uuid(),
  category_id   uuid    references menu_categories(id) on delete set null,
  name          text    not null,
  description   text,
  price         integer not null,   -- whole XAF
  currency      text    default 'XAF',
  image_url     text,
  is_special    boolean default false,
  is_available  boolean default true,
  sort_order    integer default 0,
  created_at    timestamptz default now()
);

create table if not exists dining_orders (
  id            uuid    primary key default gen_random_uuid(),
  app_user_id   uuid    references users(id) on delete set null,
  booking_id    uuid    references bookings(id) on delete set null,
  guest_email   text,
  status        text    default 'placed',  -- placed | preparing | delivered | cancelled
  total_amount  integer not null default 0,
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists dining_order_items (
  id            uuid    primary key default gen_random_uuid(),
  order_id      uuid    references dining_orders(id) on delete cascade,
  menu_item_id  uuid    references menu_items(id) on delete set null,
  item_name     text    not null,   -- snapshot of name at order time
  unit_price    integer not null,   -- snapshot of price at order time
  quantity      integer not null default 1
);

create index if not exists dining_orders_user_idx   on dining_orders (app_user_id);
create index if not exists dining_orders_status_idx on dining_orders (status);

-- ---------------------------------------------------------------------
-- 4. STAY PREFERENCES
-- ---------------------------------------------------------------------
create table if not exists stay_preferences (
  app_user_id   uuid    primary key references users(id) on delete cascade,
  bed_type      text,
  floor_pref    text,
  dietary       text,
  newsletter    boolean default false,
  updated_at    timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 5. NOTIFICATIONS
-- ---------------------------------------------------------------------
create table if not exists notifications (
  id          uuid    primary key default gen_random_uuid(),
  app_user_id uuid    references users(id) on delete cascade,
  type        text    not null,  -- booking | payment | dining | system
  title       text    not null,
  body        text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

create index if not exists notifications_user_idx
  on notifications (app_user_id, is_read);

-- ---------------------------------------------------------------------
-- 6. WEBHOOK EVENT LOG — durable backstop for webhook idempotency.
--    Redis dedup is the fast path; this table is the permanent record
--    in case Redis is unavailable.
-- ---------------------------------------------------------------------
create table if not exists webhook_events (
  id           uuid    primary key default gen_random_uuid(),
  provider     text    not null,   -- stripe | fapshi
  event_key    text    not null,   -- stripe event.id, or fapshi transId:status
  processed_at timestamptz default now(),
  unique (provider, event_key)
);

-- ---------------------------------------------------------------------
-- 7. DASHBOARD ANALYTICS VIEW
-- ---------------------------------------------------------------------
create or replace view dashboard_booking_summary as
select
  b.app_user_id,
  count(*)                                              as total_bookings,
  count(*) filter (where b.status = 'confirmed')        as confirmed_bookings,
  count(*) filter (where b.status = 'cancelled')        as cancelled_bookings,
  count(*) filter (
    where b.check_in >= current_date
      and b.status = 'confirmed'
  )                                                     as upcoming_bookings,
  coalesce(
    sum(b.total_amount) filter (where b.payment_status = 'paid'), 0
  )                                                     as total_spent
from bookings b
group by b.app_user_id;

-- ---------------------------------------------------------------------
-- 8. ROLE-BASED ACCESS
--    Allowed roles: guest | member | receptionist | storekeeper | manager | admin
-- ---------------------------------------------------------------------
create or replace function current_user_role()
returns text
language sql
stable
as $$
  select role from users where auth_user_id = auth.uid() limit 1;
$$;

-- Staff policy: receptionist/manager/admin can read all bookings.
drop policy if exists "bookings_select_staff" on bookings;
create policy "bookings_select_staff"
  on bookings for select
  using ( current_user_role() in ('receptionist', 'manager', 'admin') );

-- RLS on new tables
alter table dining_orders      enable row level security;
alter table dining_order_items enable row level security;
alter table stay_preferences   enable row level security;
alter table notifications      enable row level security;
alter table menu_categories    enable row level security;
alter table menu_items         enable row level security;

drop policy if exists "dining_orders_own" on dining_orders;
create policy "dining_orders_own"
  on dining_orders for select
  using (
    app_user_id in (select id from users where auth_user_id = auth.uid())
    or current_user_role() in ('receptionist', 'manager', 'admin')
  );

drop policy if exists "stay_preferences_own" on stay_preferences;
create policy "stay_preferences_own"
  on stay_preferences for all
  using (
    app_user_id in (select id from users where auth_user_id = auth.uid())
  )
  with check (
    app_user_id in (select id from users where auth_user_id = auth.uid())
  );

drop policy if exists "notifications_own" on notifications;
create policy "notifications_own"
  on notifications for select
  using (
    app_user_id in (select id from users where auth_user_id = auth.uid())
  );

drop policy if exists "menu_public_read" on menu_items;
create policy "menu_public_read"
  on menu_items for select using ( true );

drop policy if exists "menu_cat_public_read" on menu_categories;
create policy "menu_cat_public_read"
  on menu_categories for select using ( true );

-- =====================================================================
-- END SCHEMA ADDITIONS
-- =====================================================================

-- =====================================================================
-- EVENT-DRIVEN EXPIRY — replaces cron-based stale booking cleanup.
--
-- Architecture:
--   1. Redis TTL (lock:room:* and session:booking:*) auto-expires after
--      PAYMENT_WINDOW_SECONDS (900 s). This immediately frees the room
--      for new bookings without any DB write.
--
--   2. This trigger fires on any UPDATE to the bookings table and marks
--      rows that have been "pending" for > 15 minutes as "expired".
--      It runs inline — no polling, no cron, no external scheduler.
--
--   3. For Fapshi (single-attempt webhook), the Fapshi payment route
--      itself calls /api/bookings/expire when a payment definitively
--      fails, giving immediate DB consistency.
--
-- WHY TRIGGERS BEAT CRON:
--   • Triggers fire on the exact event (a write to bookings), not on a
--     fixed schedule. Latency is O(ms), not O(minutes).
--   • No race conditions — the trigger runs inside the same transaction
--     as the write that caused it.
--   • No operational overhead — no secrets, no schedules, no monitoring
--     of a separate job.
-- =====================================================================

-- Function: mark a single booking expired if it has been pending too long.
-- Called by the trigger below on every bookings UPDATE.
create or replace function expire_stale_pending_bookings()
returns trigger
language plpgsql
as $$
begin
  -- Mark any pending booking older than 15 minutes as expired.
  -- Uses a sub-select so it only touches rows that actually need changing,
  -- avoiding a full table scan on every write.
  update bookings
  set status = 'expired'
  where status = 'pending'
    and created_at < now() - interval '15 minutes'
    and id <> new.id;  -- exclude the row being written right now

  return new;
end;
$$;

-- Trigger: fires AFTER any UPDATE on bookings (e.g. when a webhook confirms
-- or fails a payment). Piggybacks on real traffic — zero idle overhead.
drop trigger if exists trg_expire_stale_bookings on bookings;
create trigger trg_expire_stale_bookings
  after update on bookings
  for each statement
  execute function expire_stale_pending_bookings();

-- =====================================================================
-- END EVENT-DRIVEN EXPIRY
-- =====================================================================

-- =====================================================================
-- FIX 3 — Replace broken per-write trigger with a correct, self-contained
-- expire_stale_bookings() function called by the reconcile queue drain.
--
-- WHY THE OLD TRIGGER WAS WRONG:
--   1. It only fired AFTER UPDATE on bookings. On a quiet period with no
--      other writes, stale pending rows were NEVER expired.
--   2. It ran a table-wide UPDATE on EVERY single write — redundant work
--      under load.
--   3. The "id <> new.id" exclusion meant the last stale row could never
--      expire itself.
--
-- THE REPLACEMENT:
--   A plain SQL function called explicitly by drainReconcileQueue() during
--   organic traffic. No trigger, no scheduler. Runs exactly when needed.
-- =====================================================================

-- Drop the old broken trigger and function
drop trigger if exists trg_expire_stale_bookings on bookings;
drop function if exists expire_stale_pending_bookings();

-- New function: expire ALL stale pending bookings in one statement.
-- Returns the count of rows updated so the caller can log it.
create or replace function expire_stale_bookings()
returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  update bookings
  set status = 'expired'
  where status = 'pending'
    and created_at < now() - interval '15 minutes';

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- =====================================================================
-- FIX 4 — Sweep old webhook_events rows (retention: 7 days).
-- Called from the same reconcile drain so no separate job is needed.
-- =====================================================================
create or replace function sweep_old_webhook_events()
returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  delete from webhook_events
  where processed_at < now() - interval '7 days';

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- =====================================================================
-- END FIX 3 + FIX 4
-- =====================================================================
