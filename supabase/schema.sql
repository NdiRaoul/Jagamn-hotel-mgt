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
  'owner', 'admin', 'manager', 'reception', 'kitchen', 'storekeeper'
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
  role            staff_role    not null default 'reception',
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

create or replace function current_user_role()
returns text language sql stable as $$
  select role from users where auth_user_id = auth.uid() limit 1;
-- Returns the role of the calling user from the users table.
-- Allowed values: guest | member | owner | admin | manager | reception | kitchen | storekeeper
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

-- bookings: staff (reception/manager/admin) can read all bookings
create policy "bookings_select_staff"
  on bookings for select
  using (current_user_role() in ('reception', 'manager', 'admin'));

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
    or current_user_role() in ('reception', 'manager', 'admin')
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


-- ============================================================
-- MERGED FROM: 02_schema_additions.sql
-- ============================================================
-- ============================================================
-- Jagamn Palace — Schema Additions v6
-- Run in Supabase SQL Editor AFTER the base schema.
-- This file is idempotent — safe to re-run.
-- ============================================================

-- ============================================================
-- SECTION 0 — Role enum migration (run first, commit, then rest)
-- Only runs if the old enum is missing the new values.
-- ============================================================

do $$
begin
  -- Add missing values if they don't exist yet
  if not exists (
    select 1 from pg_enum
    where enumtypid = 'staff_role'::regtype
      and enumlabel = 'storekeeper'
  ) then
    alter type staff_role add value if not exists 'storekeeper';
  end if;
end;
$$;

-- Remap any legacy role labels to the canonical six
update staff set role = 'reception'   where role::text in ('receptionist','front_desk');
update staff set role = 'kitchen'     where role::text in ('fb','chef');
update staff set role = 'storekeeper' where role::text in ('maintenance','store_keeper');
update staff set role = 'admin'       where role::text in ('housekeeping','security','concierge');

-- ============================================================
-- SECTION 1 — New tables
-- ============================================================

-- ── Add is_owner to staff if not present ────────────────────
alter table staff add column if not exists is_owner boolean not null default false;
update staff set is_owner = true where role = 'owner';

-- ── departments ──────────────────────────────────────────────
create table if not exists departments (
  id          uuid        primary key default gen_random_uuid(),
  name        text        unique not null,
  is_active   boolean     default true,
  sort_order  integer     default 0,
  created_at  timestamptz default now()
);

-- ── positions ────────────────────────────────────────────────
create table if not exists positions (
  id              uuid        primary key default gen_random_uuid(),
  title           text        not null,
  department_id   uuid        references departments(id) on delete set null,
  default_role    text,
  is_active       boolean     default true,
  created_at      timestamptz default now(),
  unique (title, department_id)
);

-- ── staff_payout_accounts ────────────────────────────────────
create table if not exists staff_payout_accounts (
  id                  uuid        primary key default gen_random_uuid(),
  staff_id            uuid        not null references staff(id) on delete cascade,
  method              text        not null,  -- 'stripe' | 'mtn_momo' | 'orange_money' | 'bank'
  provider            text,
  account_number      text,
  account_last4       text,
  account_holder_name text,
  stripe_account_id   text,
  stripe_status       text,
  is_verified         boolean     default false,
  is_default          boolean     default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── leave_types ──────────────────────────────────────────────
create table if not exists leave_types (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  code        text        unique not null,
  color       text        default '#6B7280',
  max_days    integer     default 30,
  is_active   boolean     default true,
  created_at  timestamptz default now()
);

-- ── leave_requests ───────────────────────────────────────────
create table if not exists leave_requests (
  id              uuid        primary key default gen_random_uuid(),
  staff_id        uuid        not null references staff(id) on delete cascade,
  leave_type_id   uuid        references leave_types(id) on delete set null,
  start_date      date        not null,
  end_date        date        not null,
  days            integer     not null default 1,
  reason          text,
  supporting_doc  text,
  status          text        not null default 'pending',  -- pending | approved | rejected
  decided_by      uuid        references staff(id) on delete set null,
  decided_at      timestamptz,
  manager_notes   text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── leave_balances ───────────────────────────────────────────
create table if not exists leave_balances (
  id              uuid        primary key default gen_random_uuid(),
  staff_id        uuid        not null references staff(id) on delete cascade,
  leave_type_id   uuid        not null references leave_types(id) on delete cascade,
  year            integer     not null,
  accrued         integer     not null default 0,
  used            integer     not null default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (staff_id, leave_type_id, year)
);

-- ── payroll_runs ─────────────────────────────────────────────
create table if not exists payroll_runs (
  id                  uuid        primary key default gen_random_uuid(),
  period_label        text        not null,
  period_start        date        not null,
  period_end          date        not null,
  status              text        not null default 'draft',  -- draft | approved | closed
  gross_total_minor   bigint      not null default 0,
  net_total_minor     bigint      not null default 0,
  generated_by        uuid        references staff(id) on delete set null,
  approved_by         uuid        references staff(id) on delete set null,
  approved_at         timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── payroll_items ────────────────────────────────────────────
create table if not exists payroll_items (
  id                  uuid        primary key default gen_random_uuid(),
  run_id              uuid        not null references payroll_runs(id) on delete cascade,
  staff_id            uuid        not null references staff(id) on delete cascade,
  gross_minor         bigint      not null default 0,
  deductions_minor    bigint      not null default 0,
  net_minor           bigint      not null default 0,
  payment_status      text        not null default 'unpaid',  -- unpaid | processing | paid | failed
  payment_method      text,
  payment_ref         text,
  paid_at             timestamptz,
  notes               text,
  idempotency_key     text        unique,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (run_id, staff_id)
);

-- ── staff_deductions ─────────────────────────────────────────
create table if not exists staff_deductions (
  id              uuid        primary key default gen_random_uuid(),
  staff_id        uuid        not null references staff(id) on delete cascade,
  category        text        not null,  -- 'absence' | 'penalty' | 'loan' | 'tax' | 'other'
  reason_type     text,
  amount_minor    bigint      not null,
  reason          text,
  applied_on      date        not null default current_date,
  created_by      uuid        references staff(id) on delete set null,
  created_at      timestamptz default now()
);

-- ── suppliers ────────────────────────────────────────────────
create table if not exists suppliers (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  category    text,
  contact     text,
  email       text,
  phone       text,
  rating      numeric(3,1) default 0,
  is_active   boolean     default true,
  created_at  timestamptz default now()
);

-- ── purchase_orders ──────────────────────────────────────────
create table if not exists purchase_orders (
  id              uuid        primary key default gen_random_uuid(),
  po_number       text        unique not null default '',
  supplier_id     uuid        references suppliers(id) on delete set null,
  description     text        not null,
  total_minor     bigint      not null default 0,
  currency        text        default 'USD',
  status          text        not null default 'pending_approval',
  -- pending_approval | approved | ordered | in_transit | delivered | cancelled
  priority        text        default 'medium',  -- low | medium | high | urgent
  department      text,
  ordered_at      timestamptz,
  delivered_at    timestamptz,
  created_by      uuid        references staff(id) on delete set null,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Auto-generate PO number
create or replace function generate_po_number()
returns trigger language plpgsql as $$
declare
  v_num text;
  v_attempts int := 0;
begin
  if new.po_number is null or new.po_number = '' then
    loop
      v_num := 'PO-' || lpad(floor(random() * 10000)::int::text, 4, '0');
      if not exists (select 1 from purchase_orders where po_number = v_num) then
        new.po_number := v_num;
        exit;
      end if;
      v_attempts := v_attempts + 1;
      if v_attempts > 100 then raise exception 'Could not generate PO number'; end if;
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_po_number on purchase_orders;
create trigger trg_po_number
  before insert on purchase_orders
  for each row execute function generate_po_number();

-- ── purchase_order_items ─────────────────────────────────────
create table if not exists purchase_order_items (
  id              uuid        primary key default gen_random_uuid(),
  order_id        uuid        not null references purchase_orders(id) on delete cascade,
  description     text        not null,
  quantity        integer     not null default 1,
  unit_price_minor bigint     not null default 0,
  total_minor     bigint      generated always as (quantity * unit_price_minor) stored
);

-- ── procurement_budgets ──────────────────────────────────────
create table if not exists procurement_budgets (
  id              uuid        primary key default gen_random_uuid(),
  department      text        not null,
  year            integer     not null,
  month           integer,
  budget_minor    bigint      not null default 0,
  created_at      timestamptz default now(),
  unique (department, year, month)
);

-- ── inventory_items ──────────────────────────────────────────
create table if not exists inventory_items (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  category        text,
  unit            text        default 'unit',
  on_hand         integer     not null default 0,
  reorder_level   integer     not null default 5,
  is_active       boolean     default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── inventory_requests ───────────────────────────────────────
create table if not exists inventory_requests (
  id              uuid        primary key default gen_random_uuid(),
  item_id         uuid        references inventory_items(id) on delete set null,
  item_name       text        not null,
  quantity        integer     not null default 1,
  requested_by    uuid        references staff(id) on delete set null,
  status          text        not null default 'requested',  -- requested | approved | fulfilled | rejected
  notes           text,
  fulfilled_at    timestamptz,
  fulfilled_by    uuid        references staff(id) on delete set null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── folio_entries ────────────────────────────────────────────
create table if not exists folio_entries (
  id              uuid        primary key default gen_random_uuid(),
  booking_id      uuid        not null references bookings(id) on delete cascade,
  booking_ref     text        not null,
  category        text        not null,  -- 'room' | 'tax' | 'dining' | 'minibar' | 'damage' | 'misc' | 'cash' | 'card' | 'payment'
  description     text,
  amount_minor    bigint      not null,  -- positive = charge, negative = payment/credit
  entry_type      text        not null default 'charge',  -- 'charge' | 'payment'
  created_by      uuid        references staff(id) on delete set null,
  created_at      timestamptz default now()
);

create index if not exists folio_entries_booking_id_idx on folio_entries (booking_id);
create index if not exists folio_entries_booking_ref_idx on folio_entries (booking_ref);

-- ── staff_payout_accounts updated_at trigger ─────────────────
create or replace function set_updated_at_generic()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists spa_updated_at on staff_payout_accounts;
create trigger spa_updated_at before update on staff_payout_accounts
  for each row execute function set_updated_at_generic();

drop trigger if exists leave_requests_updated_at on leave_requests;
create trigger leave_requests_updated_at before update on leave_requests
  for each row execute function set_updated_at_generic();

drop trigger if exists leave_balances_updated_at on leave_balances;
create trigger leave_balances_updated_at before update on leave_balances
  for each row execute function set_updated_at_generic();

drop trigger if exists payroll_runs_updated_at on payroll_runs;
create trigger payroll_runs_updated_at before update on payroll_runs
  for each row execute function set_updated_at_generic();

drop trigger if exists payroll_items_updated_at on payroll_items;
create trigger payroll_items_updated_at before update on payroll_items
  for each row execute function set_updated_at_generic();

drop trigger if exists purchase_orders_updated_at on purchase_orders;
create trigger purchase_orders_updated_at before update on purchase_orders
  for each row execute function set_updated_at_generic();

drop trigger if exists inventory_items_updated_at on inventory_items;
create trigger inventory_items_updated_at before update on inventory_items
  for each row execute function set_updated_at_generic();

drop trigger if exists inventory_requests_updated_at on inventory_requests;
create trigger inventory_requests_updated_at before update on inventory_requests
  for each row execute function set_updated_at_generic();

-- ============================================================
-- SECTION 2 — Reporting views (12 total)
-- ============================================================

-- 1. revenue_daily
create or replace view revenue_daily as
select
  date_trunc('day', pe.created_at)::date as day,
  coalesce(sum(pl.amount_minor) filter (
    where pe.type = 'processor_succeeded'
  ), 0) as revenue_minor
from payment_ledger pl
join payment_events pe on pe.payment_id = pl.id
group by 1
order by 1;

-- 2. revenue_monthly
create or replace view revenue_monthly as
select
  date_trunc('month', pe.created_at)::date as month,
  coalesce(sum(pl.amount_minor) filter (
    where pe.type = 'processor_succeeded'
  ), 0) as revenue_minor
from payment_ledger pl
join payment_events pe on pe.payment_id = pl.id
group by 1
order by 1;

-- 3. revenue_by_room_type
create or replace view revenue_by_room_type as
select
  rt.name as room_type,
  coalesce(sum(b.total_amount), 0) as revenue_minor
from bookings b
join room_types rt on rt.id = b.room_type_id
where b.payment_status = 'paid'
group by rt.name
order by revenue_minor desc;

-- 4. occupancy_daily (30-day rolling window)
create or replace view occupancy_daily as
select
  d.day,
  count(distinct b.id) as occupied_rooms,
  (select count(*) from rooms where is_active = true) as total_rooms,
  round(
    count(distinct b.id)::numeric /
    nullif((select count(*) from rooms where is_active = true), 0) * 100,
    1
  ) as occupancy_pct
from generate_series(
  current_date - interval '29 days',
  current_date,
  interval '1 day'
) as d(day)
left join bookings b
  on b.check_in <= d.day
  and b.check_out > d.day
  and b.status not in ('cancelled', 'expired')
group by d.day
order by d.day;

-- 5. hr_leave_summary
create or replace view hr_leave_summary as
select
  lt.name as leave_type,
  count(*) filter (where lr.status = 'pending')  as pending_count,
  count(*) filter (where lr.status = 'approved') as approved_count,
  count(*) filter (where lr.status = 'rejected') as rejected_count,
  sum(lr.days) filter (where lr.status = 'approved') as total_days_approved
from leave_requests lr
join leave_types lt on lt.id = lr.leave_type_id
where extract(year from lr.created_at) = extract(year from current_date)
group by lt.name;

-- 6. payroll_monthly
create or replace view payroll_monthly as
select
  pr.period_label,
  pr.period_start,
  pr.period_end,
  pr.status,
  pr.gross_total_minor,
  pr.net_total_minor,
  count(pi.id) as staff_count,
  count(pi.id) filter (where pi.payment_status = 'paid') as paid_count
from payroll_runs pr
left join payroll_items pi on pi.run_id = pr.id
group by pr.id, pr.period_label, pr.period_start, pr.period_end,
         pr.status, pr.gross_total_minor, pr.net_total_minor
order by pr.period_start desc;

-- 7. procurement_status_summary
create or replace view procurement_status_summary as
select
  status,
  count(*) as order_count,
  coalesce(sum(total_minor), 0) as total_minor
from purchase_orders
group by status;

-- 8. dining_order_status_summary
create or replace view dining_order_status_summary as
select
  status,
  count(*) as order_count,
  coalesce(sum(total_amount), 0) as total_amount
from dining_orders
group by status;

-- 9. dining_daily
create or replace view dining_daily as
select
  date_trunc('day', created_at)::date as day,
  count(*) as order_count,
  coalesce(sum(total_amount), 0) as revenue
from dining_orders
where status != 'cancelled'
group by 1
order by 1;

-- 10. dining_top_items
create or replace view dining_top_items as
select
  doi.item_name,
  sum(doi.quantity) as total_ordered,
  sum(doi.quantity * doi.unit_price) as total_revenue
from dining_order_items doi
join dining_orders do2 on do2.id = doi.order_id
where do2.status != 'cancelled'
group by doi.item_name
order by total_ordered desc
limit 20;

-- 11. inventory_low_stock
create or replace view inventory_low_stock as
select *
from inventory_items
where on_hand <= reorder_level
  and is_active = true
order by (on_hand::float / nullif(reorder_level, 0)) asc;

-- 12. booking_folio_balance
create or replace view booking_folio_balance as
select
  b.id as booking_id,
  b.booking_ref,
  b.guest_name,
  b.total_amount as booking_total_minor,
  coalesce(sum(fe.amount_minor) filter (where fe.entry_type = 'charge'), 0) as charges_minor,
  coalesce(sum(abs(fe.amount_minor)) filter (where fe.entry_type = 'payment'), 0) as paid_minor,
  coalesce(sum(fe.amount_minor) filter (where fe.entry_type = 'charge'), 0)
    - coalesce(sum(abs(fe.amount_minor)) filter (where fe.entry_type = 'payment'), 0) as balance_minor
from bookings b
left join folio_entries fe on fe.booking_id = b.id
group by b.id, b.booking_ref, b.guest_name, b.total_amount;

-- ============================================================
-- SECTION 3 — decide_leave RPC
-- ============================================================

create or replace function decide_leave(
  p_id     uuid,
  p_status text,
  p_notes  text,
  p_actor  uuid
) returns void language plpgsql security definer as $$
declare
  v_staff_id    uuid;
  v_type_id     uuid;
  v_days        integer;
  v_year        integer;
begin
  select staff_id, leave_type_id, days, extract(year from start_date)::int
    into v_staff_id, v_type_id, v_days, v_year
    from leave_requests
   where id = p_id;

  update leave_requests
     set status = p_status,
         decided_by = p_actor,
         decided_at = now(),
         manager_notes = p_notes,
         updated_at = now()
   where id = p_id;

  if p_status = 'approved' then
    insert into leave_balances (staff_id, leave_type_id, year, accrued, used)
    values (v_staff_id, v_type_id, v_year, v_days, v_days)
    on conflict (staff_id, leave_type_id, year)
    do update set used = leave_balances.used + v_days,
                  updated_at = now();
  end if;
end;
$$;

-- ============================================================
-- SECTION 4 — RLS for new tables
-- ============================================================

alter table departments          enable row level security;
alter table positions            enable row level security;
alter table staff_payout_accounts enable row level security;
alter table leave_types          enable row level security;
alter table leave_requests       enable row level security;
alter table leave_balances       enable row level security;
alter table payroll_runs         enable row level security;
alter table payroll_items        enable row level security;
alter table staff_deductions     enable row level security;
alter table suppliers            enable row level security;
alter table purchase_orders      enable row level security;
alter table purchase_order_items enable row level security;
alter table procurement_budgets  enable row level security;
alter table inventory_items      enable row level security;
alter table inventory_requests   enable row level security;
alter table folio_entries        enable row level security;

-- Staff can read departments/positions/leave_types
create policy "staff read departments" on departments for select using (is_staff());
create policy "staff read positions"   on positions   for select using (is_staff());
create policy "staff read leave_types" on leave_types for select using (is_staff());

-- Staff can read/write their own leave requests and balances
create policy "staff own leave_requests" on leave_requests
  for all using (
    staff_id = (select id from staff where auth_user_id = auth.uid() limit 1)
    or staff_role() in ('owner','admin','manager')
  );

create policy "staff own leave_balances" on leave_balances
  for all using (
    staff_id = (select id from staff where auth_user_id = auth.uid() limit 1)
    or staff_role() in ('owner','admin','manager')
  );

-- Staff can read/write their own payout accounts
create policy "staff own payout_accounts" on staff_payout_accounts
  for all using (
    staff_id = (select id from staff where auth_user_id = auth.uid() limit 1)
    or staff_role() in ('owner','admin','manager')
  );

-- Payroll: admin/manager/owner only
create policy "admin payroll_runs" on payroll_runs
  for all using (staff_role() in ('owner','admin','manager'));

create policy "admin payroll_items" on payroll_items
  for all using (
    staff_id = (select id from staff where auth_user_id = auth.uid() limit 1)
    or staff_role() in ('owner','admin','manager')
  );

create policy "admin staff_deductions" on staff_deductions
  for all using (staff_role() in ('owner','admin','manager'));

-- Procurement: admin/manager/owner/storekeeper
create policy "procurement read suppliers" on suppliers
  for select using (staff_role() in ('owner','admin','manager','storekeeper'));
create policy "procurement write suppliers" on suppliers
  for all using (staff_role() in ('owner','admin','manager','storekeeper'));

create policy "procurement purchase_orders" on purchase_orders
  for all using (staff_role() in ('owner','admin','manager','storekeeper'));

create policy "procurement po_items" on purchase_order_items
  for all using (staff_role() in ('owner','admin','manager','storekeeper'));

create policy "procurement budgets" on procurement_budgets
  for all using (staff_role() in ('owner','admin','manager','storekeeper'));

-- Inventory: kitchen/storekeeper/admin/manager/owner
create policy "inventory read" on inventory_items
  for select using (staff_role() in ('owner','admin','manager','kitchen','storekeeper'));
create policy "inventory write" on inventory_items
  for all using (staff_role() in ('owner','admin','manager','storekeeper'));

create policy "inventory_requests all" on inventory_requests
  for all using (staff_role() in ('owner','admin','manager','kitchen','storekeeper'));

-- Folio: staff can read/write
create policy "staff folio" on folio_entries
  for all using (staff_role() in ('owner','admin','manager','reception'));

-- Departments/positions write: admin/manager/owner
create policy "admin write departments" on departments
  for all using (staff_role() in ('owner','admin','manager'));
create policy "admin write positions" on positions
  for all using (staff_role() in ('owner','admin','manager'));

-- ============================================================
-- MERGED FROM: 03_staff_fk.sql
-- ============================================================
-- ============================================================
-- Jagamn Palace — Staff Foreign Keys Migration
-- Run AFTER 02_schema_additions.sql
-- Adds department_id and position_id foreign keys to staff table
-- ============================================================

-- Add department_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE staff ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add position_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'position_id'
  ) THEN
    ALTER TABLE staff ADD COLUMN position_id UUID REFERENCES positions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS staff_department_id_idx ON staff(department_id);
CREATE INDEX IF NOT EXISTS staff_position_id_idx ON staff(position_id);

-- Migrate existing department and position text fields to FK relationships
-- This will attempt to match existing text values to department/position records

DO $$
DECLARE
  staff_record RECORD;
  dept_id UUID;
  pos_id UUID;
BEGIN
  -- For each staff member with a department text value
  FOR staff_record IN 
    SELECT id, department, position 
    FROM staff 
    WHERE department IS NOT NULL AND department_id IS NULL
  LOOP
    -- Try to find matching department
    SELECT id INTO dept_id 
    FROM departments 
    WHERE name = staff_record.department 
    LIMIT 1;
    
    -- If found, update the FK
    IF dept_id IS NOT NULL THEN
      UPDATE staff 
      SET department_id = dept_id 
      WHERE id = staff_record.id;
    END IF;
  END LOOP;

  -- For each staff member with a position text value
  FOR staff_record IN 
    SELECT id, position 
    FROM staff 
    WHERE position IS NOT NULL AND position_id IS NULL
  LOOP
    -- Try to find matching position
    SELECT id INTO pos_id 
    FROM positions 
    WHERE title = staff_record.position 
    LIMIT 1;
    
    -- If found, update the FK
    IF pos_id IS NOT NULL THEN
      UPDATE staff 
      SET position_id = pos_id 
      WHERE id = staff_record.id;
    END IF;
  END LOOP;
END $$;

-- Note: We keep the original department and position text columns for backward compatibility
-- They can be removed in a future migration once all code is updated to use the FK relationships

COMMENT ON COLUMN staff.department_id IS 'Foreign key to departments table - preferred over text department field';
COMMENT ON COLUMN staff.position_id IS 'Foreign key to positions table - preferred over text position field';

-- ============================================================
-- MERGED FROM: 04_flow_partitioning_hiredate.sql
-- ============================================================
-- ============================================================
-- Jagamn Palace — Flow Completion + Partitioning + Currency Base
-- Run AFTER 02_schema_additions.sql and 03_staff_fk.sql
-- This file is idempotent — safe to re-run.
-- ============================================================

-- ============================================================
-- SECTION 1 — Dining → Kitchen → Storekeeper Flow
-- ============================================================

-- Add dining_order_id to inventory_requests (link stock requests to orders)
ALTER TABLE inventory_requests 
  ADD COLUMN IF NOT EXISTS dining_order_id UUID REFERENCES dining_orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS inventory_requests_dining_order_idx 
  ON inventory_requests(dining_order_id);

-- Add staff_id to notifications (for individual staff notifications)
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff(id) ON DELETE CASCADE;

-- Add role to notifications (for role-based fan-out)
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS role TEXT;

-- Update notifications indexes
CREATE INDEX IF NOT EXISTS notifications_staff_idx 
  ON notifications(staff_id, is_read) WHERE staff_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS notifications_role_idx 
  ON notifications(role, is_read) WHERE role IS NOT NULL;

-- Create notify_role function for role-based fan-out
CREATE OR REPLACE FUNCTION notify_role(
  p_role TEXT,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (role, type, title, body, is_read, created_at)
  VALUES (p_role, p_type, p_title, p_body, false, now());
END;
$$;

COMMENT ON FUNCTION notify_role IS 'Fan-out notification to all staff with a given role';

-- ============================================================
-- SECTION 2 — Help Articles (Dynamic Help Center)
-- ============================================================

CREATE TABLE IF NOT EXISTS help_articles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  role        TEXT,       -- 'kitchen' | 'reception' | 'storekeeper' | 'account' | NULL (global)
  slug        TEXT        NOT NULL,
  title       TEXT        NOT NULL,
  body        TEXT        NOT NULL,
  category    TEXT,
  sort_order  INTEGER     DEFAULT 0,
  is_active   BOOLEAN     DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (role, slug)
);

CREATE INDEX IF NOT EXISTS help_articles_role_idx ON help_articles(role, is_active, sort_order);

-- ============================================================
-- SECTION 3 — Remove Resort Fee
-- ============================================================

-- Drop resort_fee column from room_types if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'room_types' AND column_name = 'resort_fee'
  ) THEN
    ALTER TABLE room_types DROP COLUMN resort_fee;
  END IF;
END $$;

-- ============================================================
-- SECTION 4 — Backfill hire_date + Indexes
-- ============================================================

-- Backfill demo hire dates for seeded staff (idempotent)
-- This gives realistic tenure for payroll/HR views
DO $$
DECLARE
  staff_record RECORD;
  random_days INTEGER;
BEGIN
  FOR staff_record IN 
    SELECT id, email FROM staff WHERE hire_date IS NULL
  LOOP
    -- Random hire date between 1-5 years ago
    random_days := floor(random() * 1825 + 365)::INTEGER;
    UPDATE staff 
    SET hire_date = current_date - (random_days || ' days')::INTERVAL
    WHERE id = staff_record.id;
  END LOOP;
END $$;

-- Index hire_date for tenure reports
CREATE INDEX IF NOT EXISTS staff_hire_date_idx ON staff(hire_date) WHERE hire_date IS NOT NULL;

-- ============================================================
-- SECTION 5 — Hot-Path Indexes
-- ============================================================

-- Dining orders by status and time (kitchen board queries)
CREATE INDEX IF NOT EXISTS dining_orders_status_created_idx 
  ON dining_orders(status, created_at DESC);

-- Folio entries by booking (checkout balance queries)
CREATE INDEX IF NOT EXISTS folio_entries_booking_created_idx 
  ON folio_entries(booking_id, created_at);

-- Payroll items by run (payroll detail queries)
CREATE INDEX IF NOT EXISTS payroll_items_run_idx 
  ON payroll_items(run_id, staff_id);

-- Notifications by created_at (recent notifications queries)
CREATE INDEX IF NOT EXISTS notifications_created_idx 
  ON notifications(created_at DESC);

-- Leave requests by status and staff (HR dashboard)
CREATE INDEX IF NOT EXISTS leave_requests_status_staff_idx 
  ON leave_requests(status, staff_id, created_at DESC);

-- Purchase orders by status (procurement dashboard)
CREATE INDEX IF NOT EXISTS purchase_orders_status_idx 
  ON purchase_orders(status, created_at DESC);

-- ============================================================
-- SECTION 6 — Currency Base Documentation
-- ============================================================

-- All stored money values are in XAF (Central African CFA Franc)
-- - room_types.price_per_night: whole XAF (e.g., 122000)
-- - menu_items.price: whole XAF (e.g., 4500)
-- - bookings.total_amount, tax_amount: whole XAF
-- - staff.salary: whole XAF (monthly)
-- - *_minor columns (payroll_*, folio_entries.amount_minor): XAF × 100
--
-- Display conversion happens at the boundary via src/lib/currency.ts:
-- - CEMAC countries (CM, CF, TD, CG, GQ, GA) → display as FCFA (XAF)
-- - United Kingdom (GB) → display as GBP
-- - All others → display as USD
--
-- Indicative rates (to be replaced with live/admin-set rates in production):
-- - 1 USD ≈ 615 XAF
-- - 1 GBP ≈ 780 XAF

COMMENT ON COLUMN room_types.price_per_night IS 'Whole XAF (base currency)';
COMMENT ON COLUMN menu_items.price IS 'Whole XAF (base currency)';
COMMENT ON COLUMN bookings.total_amount IS 'Whole XAF (base currency)';
COMMENT ON COLUMN staff.salary IS 'Whole XAF monthly (base currency)';

-- ============================================================
-- SECTION 7 — Optional: Charged Currency Tracking
-- ============================================================

-- Optional columns to track what currency was actually charged
-- (for reporting when guests pay in their display currency)
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS charged_currency TEXT,
  ADD COLUMN IF NOT EXISTS charged_amount INTEGER,
  ADD COLUMN IF NOT EXISTS exchange_rate_used NUMERIC(10,4);

ALTER TABLE dining_orders 
  ADD COLUMN IF NOT EXISTS charged_currency TEXT,
  ADD COLUMN IF NOT EXISTS charged_amount INTEGER,
  ADD COLUMN IF NOT EXISTS exchange_rate_used NUMERIC(10,4);

COMMENT ON COLUMN bookings.charged_currency IS 'Currency actually charged (USD/GBP/XAF) - optional for reporting';
COMMENT ON COLUMN bookings.charged_amount IS 'Amount charged in charged_currency - optional for reporting';
COMMENT ON COLUMN bookings.exchange_rate_used IS 'XAF per unit of charged_currency - optional for reporting';

-- ============================================================
-- SECTION 8 — Partitioning Templates (Commented)
-- ============================================================

-- Partitioning is recommended for high-volume append-heavy tables
-- when they grow beyond ~10M rows or when date-range queries dominate.
--
-- Tables to partition (by created_at, monthly):
-- - audit_log
-- - notifications
-- - payment_events
-- - folio_entries
-- - dining_orders (+ cascade dining_order_items)
--
-- MIGRATION APPROACH (for existing populated tables):
-- 1. Create partitioned table *_p with same structure
-- 2. Create monthly child partitions + default partition
-- 3. Copy data: INSERT INTO *_p SELECT * FROM *
-- 4. Swap names: ALTER TABLE * RENAME TO *_old; ALTER TABLE *_p RENAME TO *
-- 5. Drop old table after verification
--
-- FRESH INSTALL: Convert the CREATE TABLE to CREATE TABLE ... PARTITION BY RANGE (created_at)
-- and create child partitions immediately.
--
-- AUTOMATION: Use pg_partman extension or a monthly cron/Edge function to create new partitions.
--
-- Example (audit_log):
/*
CREATE TABLE audit_log_p (
  LIKE audit_log INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE audit_log_p_2026_05 PARTITION OF audit_log_p
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE audit_log_p_2026_06 PARTITION OF audit_log_p
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE audit_log_p_default PARTITION OF audit_log_p DEFAULT;

-- Copy data
INSERT INTO audit_log_p SELECT * FROM audit_log;

-- Swap
ALTER TABLE audit_log RENAME TO audit_log_old;
ALTER TABLE audit_log_p RENAME TO audit_log;

-- Verify and drop
DROP TABLE audit_log_old;
*/

-- ============================================================
-- SECTION 9 — Optional: Property/Tenant Sharding Scaffold
-- ============================================================

-- For future horizontal scaling, add a property_id/tenant_id column
-- to all top-level tables. This enables:
-- - Citus distributed tables: SELECT create_distributed_table('bookings','property_id')
-- - Per-property databases (app-level sharding)
-- - Read replica routing by property
--
-- Example (commented, add when multi-property support is needed):
/*
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS property_id UUID DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS property_id UUID DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE room_types ADD COLUMN IF NOT EXISTS property_id UUID DEFAULT '00000000-0000-0000-0000-000000000001';
-- ... etc for all top-level tables

CREATE INDEX bookings_property_idx ON bookings(property_id);
CREATE INDEX staff_property_idx ON staff(property_id);
-- ... etc
*/

-- ============================================================
-- SECTION 10 — RLS for New Columns/Tables
-- ============================================================

ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;

-- Staff can read help articles for their role or global articles
CREATE POLICY "staff_read_help" ON help_articles
  FOR SELECT USING (
    is_staff() AND (
      role IS NULL 
      OR role = staff_role()
    )
  );

-- Admin/owner can manage help articles
CREATE POLICY "admin_manage_help" ON help_articles
  FOR ALL USING (staff_role() IN ('owner', 'admin'));

-- ============================================================
-- DONE
-- ============================================================

-- Run this file, then proceed with:
-- 1. npx tsx scripts/seed.ts
-- 2. npx tsx scripts/04_seed_samples.ts
