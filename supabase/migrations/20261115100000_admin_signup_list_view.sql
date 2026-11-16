-- Admin list: one row per signup, joining the person, their business and
-- their latest consent record, so the admin list can search, filter, sort
-- and page through signups in one simple query.
--
-- security_invoker = true means the view follows the row level security of
-- the person or role reading it, instead of the view owner's rights.
--
-- Only our server (service_role) may read it. Nobody signed in or signed
-- out can read it through the public API.
--
-- Do not run this from code. Paste it into the Supabase SQL Editor.

create view public.admin_signup_list
with (security_invoker = true)
as
select
  a.id,
  a.first_name,
  a.last_name,
  a.first_name || ' ' || a.last_name as full_name,
  a.email,
  a.mobile,
  a.province,
  a.created_at,
  b.company_name,
  b.business_type,
  c.privacy_consent,
  c.privacy_withdrawn_at,
  c.email_opt_in,
  c.email_withdrawn_at,
  coalesce(c.email_opt_in and c.email_withdrawn_at is null, false) as email_consent_active
from public.applicants a
left join lateral (
  select company_name, business_type
  from public.businesses
  where applicant_id = a.id
  order by created_at
  limit 1
) b on true
left join lateral (
  select privacy_consent, privacy_withdrawn_at, email_opt_in, email_withdrawn_at
  from public.consents
  where applicant_id = a.id
  order by consented_at desc
  limit 1
) c on true;

revoke all on public.admin_signup_list from public, anon, authenticated;
grant select on public.admin_signup_list to service_role;
