-- Signup website: first database migration
-- Creates the four tables from the Developer Brief, section 5.
-- Run once. Do not edit after it has been applied; add a new migration instead.

-- 1. A small helper that keeps updated_at current whenever a row changes.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. applicants: Part 1 of the form (Personal Information).
create table applicants (
  id            uuid primary key default gen_random_uuid(),
  first_name    text not null check (char_length(first_name) <= 50),
  middle_name   text check (char_length(middle_name) <= 50),
  last_name     text not null check (char_length(last_name) <= 50),
  street_number text,
  street_name   text,
  city          text,
  province      text,
  postal_code   text check (postal_code = upper(postal_code)),
  country       text not null default 'Canada',
  phone         text check (phone ~ '^\+1[0-9]{10}$'),
  mobile        text not null check (mobile ~ '^\+1[0-9]{10}$'),
  email         text not null check (email = lower(email) and char_length(email) <= 254),
  email_2       text check (email_2 = lower(email_2) and char_length(email_2) <= 254),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- One primary email per person, ignoring capital letters.
create unique index applicants_email_unique on applicants (lower(email));

create trigger applicants_set_updated_at
  before update on applicants
  for each row execute function set_updated_at();

-- 3. businesses: Part 2 of the form (Business Information).
create table businesses (
  id            uuid primary key default gen_random_uuid(),
  applicant_id  uuid not null references applicants (id) on delete cascade,
  company_name  text not null,
  business_type text not null
                check (business_type in ('Sole Proprietor', 'Partnership', 'Corporation', 'Other')),
  street_number text,
  street_name   text,
  city          text,
  province      text,
  postal_code   text check (postal_code = upper(postal_code)),
  country       text not null default 'Canada',
  phone         text check (phone ~ '^\+1[0-9]{10}$'),
  website       text,
  email         text check (email = lower(email) and char_length(email) <= 254),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index businesses_applicant_id_idx on businesses (applicant_id);

create trigger businesses_set_updated_at
  before update on businesses
  for each row execute function set_updated_at();

-- 4. consents: proof of what the person agreed to.
create table consents (
  id                    uuid primary key default gen_random_uuid(),
  applicant_id          uuid not null references applicants (id) on delete cascade,
  privacy_consent       boolean not null check (privacy_consent is true),
  email_opt_in          boolean not null default false,
  consented_at          timestamptz not null default now(),
  wording_version       text not null,
  page_url              text not null,
  privacy_withdrawn_at  timestamptz,
  email_withdrawn_at    timestamptz
);

create index consents_applicant_id_idx on consents (applicant_id);

-- 5. admin_users: who may open the admin area.
-- Passwords and multi factor sign in are handled by Supabase Auth,
-- so no password is stored in this table.
create table admin_users (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  role          text not null default 'admin',
  last_login_at timestamptz
);

-- 6. Lock every table. With no access rules added yet, nobody can read or
-- write through the public API. Our server code will get access later.
alter table applicants  enable row level security;
alter table businesses  enable row level security;
alter table consents    enable row level security;
alter table admin_users enable row level security;
