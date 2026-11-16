-- Step 6: admin actions (edit, withdraw consent, delete, CSV export)
-- and a record of WHO did WHAT and WHEN. The record holds no personal data:
-- only the admin's id, the action name, the id of the record, and the time.
-- Each function below makes the change AND writes the record in one step,
-- so either both happen or neither does.

-- 1. The record of admin actions.
create table public.admin_actions (
  id         uuid primary key default gen_random_uuid(),
  admin_id   uuid not null,
  action     text not null check (action in (
               'edit_applicant', 'edit_business', 'withdraw_privacy',
               'withdraw_email', 'delete_applicant', 'export_csv')),
  record_id  uuid,
  created_at timestamptz not null default now()
);

create index admin_actions_created_at_idx on public.admin_actions (created_at desc);

alter table public.admin_actions enable row level security;
revoke all on public.admin_actions from public, anon, authenticated;
-- The server may add and read entries, but never change or remove them.
grant select, insert on public.admin_actions to service_role;

-- 2. Edit a person's details. Returns false when the record does not exist.
create or replace function public.admin_update_applicant(p_admin uuid, p_id uuid, p_data jsonb)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  update public.applicants set
    first_name    = p_data->>'first_name',
    middle_name   = p_data->>'middle_name',
    last_name     = p_data->>'last_name',
    street_number = p_data->>'street_number',
    street_name   = p_data->>'street_name',
    city          = p_data->>'city',
    province      = p_data->>'province',
    postal_code   = p_data->>'postal_code',
    country       = coalesce(p_data->>'country', 'Canada'),
    phone         = p_data->>'phone',
    mobile        = p_data->>'mobile',
    email         = p_data->>'email',
    email_2       = p_data->>'email_2'
  where id = p_id;
  if not found then return false; end if;

  insert into public.admin_actions (admin_id, action, record_id)
  values (p_admin, 'edit_applicant', p_id);
  return true;
end;
$$;

-- 3. Edit a business. It must belong to the given person.
create or replace function public.admin_update_business(
  p_admin uuid, p_applicant uuid, p_id uuid, p_data jsonb
)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  update public.businesses set
    company_name  = p_data->>'company_name',
    business_type = p_data->>'business_type',
    street_number = p_data->>'street_number',
    street_name   = p_data->>'street_name',
    city          = p_data->>'city',
    province      = p_data->>'province',
    postal_code   = p_data->>'postal_code',
    country       = coalesce(p_data->>'country', 'Canada'),
    phone         = p_data->>'phone',
    website       = p_data->>'website',
    email         = p_data->>'email'
  where id = p_id and applicant_id = p_applicant;
  if not found then return false; end if;

  insert into public.admin_actions (admin_id, action, record_id)
  values (p_admin, 'edit_business', p_id);
  return true;
end;
$$;

-- 4. Record a consent withdrawal. The original consent rows are kept;
-- only the withdrawal time is filled in. Withdrawing privacy consent also
-- withdraws email consent, so that person is never emailed again.
create or replace function public.admin_withdraw_consent(p_admin uuid, p_id uuid, p_kind text)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  if p_kind not in ('privacy', 'email') then
    raise exception 'unknown consent kind';
  end if;
  if not exists (select 1 from public.applicants where id = p_id) then
    return false;
  end if;

  update public.consents
     set email_withdrawn_at = now()
   where applicant_id = p_id and email_opt_in and email_withdrawn_at is null;

  if p_kind = 'privacy' then
    update public.consents
       set privacy_withdrawn_at = now()
     where applicant_id = p_id and privacy_withdrawn_at is null;
  end if;

  insert into public.admin_actions (admin_id, action, record_id)
  values (p_admin, 'withdraw_' || p_kind, p_id);
  return true;
end;
$$;

-- 5. Delete a person. Their business and consent rows go with them
-- (on delete cascade). The admin record keeps only the id that was deleted.
create or replace function public.admin_delete_applicant(p_admin uuid, p_id uuid)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  delete from public.applicants where id = p_id;
  if not found then return false; end if;

  insert into public.admin_actions (admin_id, action, record_id)
  values (p_admin, 'delete_applicant', p_id);
  return true;
end;
$$;

-- 6. Only our server (the service role) may run these.
revoke all on function public.admin_update_applicant(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.admin_update_business(uuid, uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.admin_withdraw_consent(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.admin_delete_applicant(uuid, uuid) from public, anon, authenticated;

grant execute on function public.admin_update_applicant(uuid, uuid, jsonb) to service_role;
grant execute on function public.admin_update_business(uuid, uuid, uuid, jsonb) to service_role;
grant execute on function public.admin_withdraw_consent(uuid, uuid, text) to service_role;
grant execute on function public.admin_delete_applicant(uuid, uuid) to service_role;
