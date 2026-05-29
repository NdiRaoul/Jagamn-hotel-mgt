-- ============================================================
-- Jagamn Palace — Supabase Schema  (v2 — users table)
-- Run this in the Supabase SQL Editor.
-- Drops ALL tables and recreates them from scratch.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "pgcrypto";

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
  status               text        default 'confirmed',
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
  amount                   integer     not null,
  currency                 text        default 'USD',
  payment_method           text,
  provider                 text,
  provider_tx_id           text,
  status                   text        default 'pending',
  fapshi_trans_id          text,
  stripe_payment_intent_id text,
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

-- payments: authenticated users see own
create policy "payments_select_own"
  on payments for select using (auth.uid() = user_id);

create policy "payments_insert_own"
  on payments for insert with check (auth.uid() = user_id);
