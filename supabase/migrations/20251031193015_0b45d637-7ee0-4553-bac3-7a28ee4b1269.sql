-- Fix recursive RLS policies on user_roles table
-- Drop the policies that use has_role() function (causes recursion)
DROP POLICY IF EXISTS "Admins and owners can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and owners can view all roles" ON public.user_roles;

-- Keep the simple policy for users to view their own roles
-- (This policy already exists and is correct: "Users can view own role")

-- Note: Admin operations (INSERT/UPDATE/DELETE) will be handled via edge functions
-- using service_role key which bypasses RLS policies entirely.
-- This avoids recursion while maintaining security.