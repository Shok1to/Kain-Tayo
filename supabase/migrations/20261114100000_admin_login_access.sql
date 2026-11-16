-- Admin login: let a signed in person read ONLY their own admin_users row.
--
-- Why: after someone signs in with Supabase Auth, the server asks
-- "is this person in admin_users?" using that person's own login, not the
-- secret key. Row level security makes sure each person can see only the
-- row whose id matches their own user id, and nothing else.
--
-- What this does NOT allow:
--   * no insert, update or delete for anyone signed in
--   * no access at all for anon (people who are not signed in)
--   * no access to applicants, businesses or consents
--
-- Do not run this from code. Paste it into the Supabase SQL Editor.

grant select on public.admin_users to authenticated;

create policy "Signed in admins can read their own admin row"
  on public.admin_users
  for select
  to authenticated
  using ((select auth.uid()) = id);
