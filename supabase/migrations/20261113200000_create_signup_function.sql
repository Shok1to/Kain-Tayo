-- Saves one signup (applicant, business, consent) as a single all or nothing step.
-- If any part fails, nothing is saved. Only our server may run it.

create or replace function public.create_signup(
  p_applicant jsonb,
  p_business  jsonb,
  p_consent   jsonb
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.applicants (
    first_name, middle_name, last_name,
    street_number, street_name, city, province, postal_code, country,
    phone, mobile, email, email_2
  ) values (
    p_applicant->>'first_name', p_applicant->>'middle_name', p_applicant->>'last_name',
    p_applicant->>'street_number', p_applicant->>'street_name', p_applicant->>'city',
    p_applicant->>'province', p_applicant->>'postal_code',
    coalesce(p_applicant->>'country', 'Canada'),
    p_applicant->>'phone', p_applicant->>'mobile', p_applicant->>'email', p_applicant->>'email_2'
  )
  returning id into v_id;

  insert into public.businesses (
    applicant_id, company_name, business_type,
    street_number, street_name, city, province, postal_code, country,
    phone, website, email
  ) values (
    v_id, p_business->>'company_name', p_business->>'business_type',
    p_business->>'street_number', p_business->>'street_name', p_business->>'city',
    p_business->>'province', p_business->>'postal_code',
    coalesce(p_business->>'country', 'Canada'),
    p_business->>'phone', p_business->>'website', p_business->>'email'
  );

  insert into public.consents (
    applicant_id, privacy_consent, email_opt_in, wording_version, page_url
  ) values (
    v_id,
    (p_consent->>'privacy_consent')::boolean,
    coalesce((p_consent->>'email_opt_in')::boolean, false),
    p_consent->>'wording_version',
    p_consent->>'page_url'
  );

  return v_id;
end;
$$;

-- Nobody but our server (the service role) may run this.
revoke all on function public.create_signup(jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_signup(jsonb, jsonb, jsonb) to service_role;
