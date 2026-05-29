-- ============================================================
-- Jagamn Palace — Supabase Schema  (v4 — consolidated)
-- Run this in the Supabase SQL Editor.
-- Drops ALL tables and recreates them from scratch.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "pgcrypto";
-- btree_gist is required for the date-range exclusion constraint
create extension if not exists "btree_gist";

-- ── Drop existing views / functions / triggers ───────────────
drop view     if exists room_availability_summary;
drop view     if exists payment_timeline;
drop view     if exists dashboard_booking_summary;
drop function if exists generate_booking_ref() cascade;
drop function if exists generate_staff_code() cascade;
drop function if exists derive_payment_status(uuid) cascade;
drop function if exists set_updated_at() cascade;
drop function if exists is_staff() cascade;
drop function if exists staff_role() cascade;
drop function if exists current_user_role() cascade;
drop function if exists assign_room_and_book(text,uuid,date,date,text,text,text,text,text,text,integer,integer,integer,integer,integer,integer,text,text,uuid,uuid) cascade;
drop function if exists expire_stale_bookings() cascade;
drop function if exists sweep_old_webhook_events() cascade;

-- ── Drop existing tables (dependency order) ──────────────────
drop table if exists webhook_events              cascade;
drop table if exists refunds                     cascade;
drop table if exists payment_events              cascade;
drop table if exists payment_ledger              cascade;
drop table if exists audit_log                   cascade;
drop table if exists notifications               cascade;
drop table if exists stay_preferences            cascade;
drop table if exists dining_order_items          cascade;
drop table if exists dining_orders               cascade;
drop table if exists menu_items                  cascade;
drop table if exists menu_categories             cascade;
drop table if exists payments                    cascade;
drop table if exists bookings                    cascade;
drop table if exists payment_methods             cascade;
drop table if exists staff                       cascade;
drop table if exists users                       cascade;
drop table if exists guest_profiles              cascade;
drop table if exists room_type_unavailable_dates cascade;
drop table if exists rooms                       cascade;
drop table if exists room_amenities              cascade;
drop table if exists hotel_amenities             cascade;
drop table if exists room_types                  cascade;

-- ── Drop existing enum types ─────────────────────────────────
drop type if exists staff_role   cascade;
drop type if exists staff_status cascade;

-- ============================================================
-- ENUM TYPES
-- ============================================================

create type staff_role as enum (
  'admin', 'manager', 'receptionist', 'front_desk',
  'housekeeping', 'maintenance', 'fb', 'security'
);

create type staff_status as enum ('active', 'suspended', 'removed');

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
  id                  uuid        primary key default gen_random_uuid(),
  room_type_id        uuid        references room_types(id) on delete cascade,
  unit_code           text        unique not null,
  floor               integer,
  is_active           boolean     default true,
  housekeeping_status text        not null default 'clean',
  -- 'clean' | 'dirty' | 'out_of_order'
  created_at          timestamptz default now()
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
  id                  uuid        primary key default gen_random_uuid(),
  auth_user_id        uuid        references auth.users(id) on delete set null,
  full_name           text,
  email               text        not null,
  phone               text,
  country             text,
  nationality         text,
  id_type             text,
  id_number           text,
  role                text        not null default 'guest',
  loyalty_tier        text        default 'standard',
  special_requests    text,
  avatar_url          text,
  stripe_customer_id  text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create unique index users_email_idx        on users (email);
create unique index users_auth_user_id_idx on users (auth_user_id)
  where auth_user_id is not null;

-- ── staff ────────────────────────────────────────────────────
create table staff (
  id              uuid          primary key default gen_random_uuid(),
  auth_user_id    uuid          unique references auth.users(id) on delete cascade,
  full_name       text          not null,
  email           text          unique not null,
  role            staff_role    not null default 'receptionist',
  status          staff_status  not null default 'active',
  avatar_url      text,
  must_reset_pw   boolean       not null default false,
  staff_code      text          unique,
  phone           text,
  department      text,
  position        text,
  salary          integer       default 0,
  hire_date       date,
  created_at      timestamptz   default now(),
  updated_at      timestamptz   default now()
);

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
  tax_amount           integer,
  total_amount         integer     not null,
  payment_method       text,
  payment_status       text        default 'pending',
  status               text        default 'pending',
  -- valid values: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'expired'
  special_requests     text,
  receipt_sent_at      timestamptz,
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

-- ── audit_log ────────────────────────────────────────────────
create table audit_log (
  id          bigserial     primary key,
  actor_id    uuid,                          -- auth.users.id of the actor
  actor_role  text,
  action      text          not null,        -- e.g. 'booking.confirm', 'refund.create'
  target_type text,                          -- e.g. 'booking', 'payment'
  target_id   text,
  payload     jsonb,
  ip          text,
  created_at  timestamptz   default now()
);

-- ── payment_ledger ───────────────────────────────────────────
create table payment_ledger (
  id                      uuid        primary key default gen_random_uuid(),
  booking_ref             text        not null references bookings(booking_ref),
  provider                text        not null,   -- 'stripe' | 'fapshi'
  amount_minor            bigint      not null,   -- amount in smallest currency unit
  currency                text        not null default 'USD',
  processor_ref           text,                   -- PaymentIntent id / Fapshi transId
  client_idempotency_key  text        unique not null,
  status                  text        not null default 'pending',
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create index payment_ledger_booking_ref_idx
  on payment_ledger (booking_ref);

-- ── payment_events (append-only) ─────────────────────────────
create table payment_events (
  id            bigserial     primary key,
  payment_id    uuid          not null references payment_ledger(id) on delete cascade,
  type          text          not null,
  -- e.g. 'intent_created' | 'processor_sent' | 'authorization_pending'
  --      | 'processor_succeeded' | 'processor_failed'
  --      | 'refund_requested' | 'refund_succeeded' | 'refund_failed'
  source        text,         -- 'client' | 'webhook' | 'poll' | 'reconcile'
  amount_minor  bigint,       -- for refund events
  payload       jsonb,
  created_at    timestamptz   default now()
);

-- Prevent UPDATE and DELETE on payment_events (append-only guarantee)
create or replace rule payment_events_no_update as
  on update to payment_events do instead nothing;

create or replace rule payment_events_no_delete as
  on delete to payment_events do instead nothing;

create index payment_events_payment_id_idx
  on payment_events (payment_id);

-- ── refunds ──────────────────────────────────────────────────
create table refunds (
  id                      uuid        primary key default gen_random_uuid(),
  payment_id              uuid        not null references payment_ledger(id),
  booking_ref             text        not null,
  amount_minor            bigint      not null,
  currency                text        not null default 'USD',
  status                  text        not null default 'requested',
  -- 'requested' | 'succeeded' | 'failed'
  processor_refund_id     text,
  requested_by            uuid        references auth.users(id),
  client_idempotency_key  text        unique not null,
  reason                  text,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create index refunds_payment_id_idx  on refunds (payment_id);
create index refunds_booking_ref_idx on refunds (booking_ref);

-- ── webhook_events (dedup table) ─────────────────────────────
create table webhook_events (
  id           bigserial   primary key,
  provider     text        not null,
  event_key    text        not null,
  processed_at timestamptz default now(),
  unique (provider, event_key)
);

-- ── menu_categories ──────────────────────────────────────────
create table menu_categories (
  id          uuid    primary key default gen_random_uuid(),
  name        text    not null,
  sort_order  integer default 0,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ── menu_items ────────────────────────────────────────────────
create table menu_items (
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

-- ── dining_orders ─────────────────────────────────────────────
create table dining_orders (
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

-- ── dining_order_items ────────────────────────────────────────
create table dining_order_items (
  id            uuid    primary key default gen_random_uuid(),
  order_id      uuid    references dining_orders(id) on delete cascade,
  menu_item_id  uuid    references menu_items(id) on delete set null,
  item_name     text    not null,   -- snapshot of name at order time
  unit_price    integer not null,   -- snapshot of price at order time
  quantity      integer not null default 1
);

-- ── stay_preferences ──────────────────────────────────────────
create table stay_preferences (
  app_user_id   uuid    primary key references users(id) on delete cascade,
  bed_type      text,
  floor_pref    text,
  dietary       text,
  newsletter    boolean default false,
  updated_at    timestamptz default now()
);

-- ── notifications ─────────────────────────────────────────────
create table notifications (
  id          uuid    primary key default gen_random_uuid(),
  app_user_id uuid    references users(id) on delete cascade,
  type        text    not null,  -- booking | payment | dining | system
  title       text    not null,
  body        text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Availability overlap queries
create index bookings_room_slug_dates_idx on bookings (room_slug, check_in, check_out);
create index bookings_status_idx          on bookings (status);

-- Dashboard / GET queries
create index bookings_app_user_id_idx on bookings (app_user_id);
create index bookings_guest_email_idx on bookings (guest_email);

-- Stale pending scan (used by expire_stale_bookings)
create index bookings_pending_created_idx on bookings (created_at) where status = 'pending';

-- Idempotency lookups on payment rows
create index payments_app_user_id_idx on payments (app_user_id);

-- Dining
create index dining_orders_user_idx   on dining_orders (app_user_id);
create index dining_orders_status_idx on dining_orders (status);

-- Notifications
create index notifications_user_idx on notifications (app_user_id, is_read);

-- ============================================================
-- EXCLUSION CONSTRAINT — prevent double-booking at DB level
-- Requires btree_gist extension (enabled above).
-- Blocks any two non-cancelled bookings for the same room_id
-- whose date ranges overlap (half-open interval [check_in, check_out)).
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
-- FUNCTION — Generate unique staff code (JP-XXXXX)
-- ============================================================

create or replace function generate_staff_code()
returns text language plpgsql as $$
declare
  v_code text;
  v_attempts int := 0;
begin
  loop
    v_code := 'JP-' || lpad(floor(random() * 100000)::int::text, 5, '0');
    if not exists (select 1 from staff where staff_code = v_code) then
      return v_code;
    end if;
    v_attempts := v_attempts + 1;
    if v_attempts > 100 then
      raise exception 'Could not generate unique staff_code';
    end if;
  end loop;
end;
$$;

-- ============================================================
-- FUNCTION — Derive payment status from events
-- ============================================================

create or replace function derive_payment_status(p_payment_id uuid)
returns text language plpgsql security definer as $$
declare
  v_succeeded_count   int;
  v_failed_count      int;
  v_refund_succeeded  bigint;
  v_captured          bigint;
begin
  select count(*) into v_succeeded_count
    from payment_events
   where payment_id = p_payment_id
     and type = 'processor_succeeded';

  select count(*) into v_failed_count
    from payment_events
   where payment_id = p_payment_id
     and type = 'processor_failed';

  select coalesce(sum(amount_minor), 0) into v_refund_succeeded
    from payment_events
   where payment_id = p_payment_id
     and type = 'refund_succeeded';

  select amount_minor into v_captured
    from payment_ledger
   where id = p_payment_id;

  if v_succeeded_count > 0 then
    if v_refund_succeeded >= v_captured then
      return 'refunded';
    elsif v_refund_succeeded > 0 then
      return 'partially_refunded';
    else
      return 'paid';
    end if;
  elsif v_failed_count > 0 then
    return 'failed';
  else
    return 'pending';
  end if;
end;
$$;

-- ============================================================
-- FUNCTION — updated_at trigger helper
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger staff_updated_at
  before update on staff
  for each row execute function set_updated_at();

create trigger payment_ledger_updated_at
  before update on payment_ledger
  for each row execute function set_updated_at();

create trigger refunds_updated_at
  before update on refunds
  for each row execute function set_updated_at();

-- ============================================================
-- FUNCTION — Staff helpers
-- ============================================================

-- Is the caller an active staff member?
create or replace function is_staff()
returns boolean language sql security definer as $$
  select exists (
    select 1 from staff
    where auth_user_id = auth.uid()
      and status = 'active'
  );
$$;

-- Get the role of the calling staff member
create or replace function staff_role()
returns text language sql security definer as $$
  select role::text from staff
  where auth_user_id = auth.uid()
    and status = 'active'
  limit 1;
$$;

-- ============================================================
-- FUNCTION — current_user_role() for RLS policies
-- Returns the role of the calling user from the users table.
-- Allowed values: guest | member | receptionist | storekeeper | manager | admin
-- ============================================================

create or replace function current_user_role()
returns text language sql stable as $$
  select role from users where auth_user_id = auth.uid() limit 1;
$$;

-- ============================================================
-- FUNCTION — assign_room_and_book()
-- Atomic room assignment + booking insert in one transaction.
-- Picks a free unit with FOR UPDATE SKIP LOCKED.
-- The no_overlap exclusion constraint is the final backstop.
-- Called from the API via supabaseAdmin.rpc('assign_room_and_book', {...}).
-- ============================================================

create or replace function assign_room_and_book(
  p_room_slug        text,
  p_room_type_id     uuid,
  p_check_in         date,
  p_check_out        date,
  p_guest_email      text,
  p_guest_name       text,
  p_guest_phone      text,
  p_guest_country    text,
  p_guest_id_type    text,
  p_guest_id_number  text,
  p_nights           integer,
  p_guests           integer,
  p_room_price       integer,
  p_tax_amount       integer,
  p_total_amount     integer,
  p_payment_method   text,
  p_special_requests text,
  p_user_id          uuid,
  p_app_user_id      uuid
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
    nights, guests, room_price_per_night, tax_amount,
    total_amount, payment_method, payment_status, status, special_requests
  ) values (
    p_user_id, p_app_user_id, p_guest_email, p_guest_name, p_guest_phone,
    p_guest_country, p_guest_id_type, p_guest_id_number,
    p_room_type_id, v_room_id, p_room_slug, p_check_in, p_check_out,
    p_nights, p_guests, p_room_price, p_tax_amount,
    p_total_amount, p_payment_method, 'pending', 'pending', p_special_requests
  )
  returning id, bookings.booking_ref into v_id, v_ref;

  return query select v_id, v_ref;
end;
$$;

-- ============================================================
-- FUNCTION — expire_stale_bookings()
-- Marks all pending bookings older than 15 minutes as expired.
-- Called explicitly by drainReconcileQueue() — no trigger/cron needed.
-- Returns the count of rows updated so the caller can log it.
-- ============================================================

create or replace function expire_stale_bookings()
returns integer language plpgsql as $$
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

-- ============================================================
-- FUNCTION — sweep_old_webhook_events()
-- Deletes webhook_events rows older than 7 days.
-- Called from the same reconcile drain — no separate job needed.
-- ============================================================

create or replace function sweep_old_webhook_events()
returns integer language plpgsql as $$
declare
  v_count integer;
begin
  delete from webhook_events
   where processed_at < now() - interval '7 days';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

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
-- VIEW — Payment timeline (for admin/reception UI)
-- ============================================================

create or replace view payment_timeline as
select
  pl.id           as payment_id,
  pl.booking_ref,
  pl.provider,
  pl.amount_minor,
  pl.currency,
  pl.processor_ref,
  pl.status       as ledger_status,
  derive_payment_status(pl.id) as derived_status,
  b.guest_name,
  b.guest_email,
  b.room_slug,
  pe.id           as event_id,
  pe.type         as event_type,
  pe.source,
  pe.amount_minor as event_amount_minor,
  pe.payload,
  pe.created_at   as event_at
from payment_ledger pl
join payment_events pe on pe.payment_id = pl.id
left join bookings b on b.booking_ref = pl.booking_ref
order by pe.created_at desc;

-- ============================================================
-- VIEW — Dashboard booking summary (per user)
-- ============================================================

create or replace view dashboard_booking_summary as
select
  b.app_user_id,
  count(*)                                                              as total_bookings,
  count(*) filter (where b.status = 'confirmed')                       as confirmed_bookings,
  count(*) filter (where b.status = 'cancelled')                       as cancelled_bookings,
  count(*) filter (where b.check_in >= current_date
                     and b.status = 'confirmed')                       as upcoming_bookings,
  coalesce(sum(b.total_amount) filter (where b.payment_status = 'paid'), 0) as total_spent
from bookings b
group by b.app_user_id;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table room_types                  enable row level security;
alter table room_amenities              enable row level security;
alter table rooms                       enable row level security;
alter table room_type_unavailable_dates enable row level security;
alter table users                       enable row level security;
alter table staff                       enable row level security;
alter table payment_methods             enable row level security;
alter table bookings                    enable row level security;
alter table payments                    enable row level security;
alter table hotel_amenities             enable row level security;
alter table audit_log                   enable row level security;
alter table payment_ledger              enable row level security;
alter table payment_events              enable row level security;
alter table refunds                     enable row level security;
alter table webhook_events              enable row level security;
alter table menu_categories             enable row level security;
alter table menu_items                  enable row level security;
alter table dining_orders               enable row level security;
alter table dining_order_items          enable row level security;
alter table stay_preferences            enable row level security;
alter table notifications               enable row level security;

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

-- staff: own row only (service role bypasses RLS for API routes)
create policy "staff_select_own"
  on staff for select
  using (auth.uid() = auth_user_id);

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

-- payments: authenticated users see own
create policy "payments_select_own"
  on payments for select using (auth.uid() = user_id);

create policy "payments_insert_own"
  on payments for insert with check (auth.uid() = user_id);

-- bookings: staff (receptionist/manager/admin) can read all bookings
create policy "bookings_select_staff"
  on bookings for select
  using (current_user_role() in ('receptionist', 'manager', 'admin'));

-- menu: public read
create policy "menu_cat_public_read"
  on menu_categories for select using (true);

create policy "menu_public_read"
  on menu_items for select using (true);

-- dining_orders: own rows + staff
create policy "dining_orders_own"
  on dining_orders for select
  using (
    app_user_id in (select id from users where auth_user_id = auth.uid())
    or current_user_role() in ('receptionist', 'manager', 'admin')
  );

-- stay_preferences: own row only
create policy "stay_preferences_own"
  on stay_preferences for all
  using (app_user_id in (select id from users where auth_user_id = auth.uid()))
  with check (app_user_id in (select id from users where auth_user_id = auth.uid()));

-- notifications: own rows only
create policy "notifications_own"
  on notifications for select
  using (app_user_id in (select id from users where auth_user_id = auth.uid()));

-- audit_log, payment_ledger, payment_events, refunds, webhook_events,
-- dining_order_items: service role only (no user-facing policies — service role bypasses RLS)
