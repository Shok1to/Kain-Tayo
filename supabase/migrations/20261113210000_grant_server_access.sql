-- Supabase no longer gives new tables to any role automatically.
-- Our server uses the secret key, which runs as the service_role.
-- Give it, and only it, access to our tables.
-- anon and authenticated (the public and signed in visitors) get nothing.

grant usage on schema public to service_role;

grant select, insert, update, delete
  on public.applicants, public.businesses, public.consents, public.admin_users
  to service_role;
