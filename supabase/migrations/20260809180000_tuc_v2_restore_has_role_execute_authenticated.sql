-- TUC v2 — Restore EXECUTE on has_role() for authenticated users
-- Date: 2026-08-09
-- Severity: production outage — every signed-in user was locked out of the app.
--
-- Root cause: public.has_role(uuid, app_role) is SECURITY DEFINER and its ACL had been
-- narrowed to {postgres, service_role} by an earlier hardening pass. 33 RLS policies
-- across 16 tables call has_role(). When an authenticated user issued any SELECT on one
-- of those tables, Postgres evaluated the policy, failed to execute has_role for lack of
-- privilege, and PostgREST returned 403 — not an empty result set, a hard refusal.
--
-- Visible symptom: signing in redirected to the public homepage, because useAuth could
-- not read user_roles, fell back to the 'user' role, and Auth.tsx routes 'user' to '/'.
-- The failure was silent: useAuth catches the error and degrades to 'user'.
--
-- Why this is safe: has_role() only answers "does this user id hold this role?" against
-- user_roles. It grants no data access on its own — the RLS policies remain the gate.
-- Granting EXECUTE to authenticated is what makes those policies evaluable at all.
-- anon is deliberately NOT granted: no policy applying to anon calls has_role (verified
-- against pg_policies before applying).
--
-- Applied to llxgyomevketvypusafl on 2026-08-09 and confirmed in the browser: /admin
-- loads for an owner+admin account, and the 403s on /rest/v1/user_roles are gone.

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

COMMENT ON FUNCTION public.has_role(uuid, public.app_role) IS
'Returns whether a user holds a given role. SECURITY DEFINER so it can read user_roles regardless of the caller''s own RLS. EXECUTE must stay granted to authenticated: 33 RLS policies across 16 tables call it, and revoking it makes every one of them fail with 403 rather than simply returning no rows. Do not revoke without migrating those policies first.';
