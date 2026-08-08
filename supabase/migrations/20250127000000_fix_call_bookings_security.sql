-- URGENT: Fix security vulnerability in call_bookings table
-- This migration addresses the critical security issue where call_bookings
-- table was accessible to public users, exposing sensitive customer data

-- Step 1: Drop existing policies that might allow public access
DROP POLICY IF EXISTS "Anyone can create booking" ON public.call_bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.call_bookings;

-- Step 2: Create secure policies that explicitly deny public access

-- Policy 1: Only authenticated users can INSERT (for booking form)
CREATE POLICY "authenticated_users_can_create_booking"
ON public.call_bookings FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 2: Only admins can SELECT (view) bookings
CREATE POLICY "only_admins_can_view_bookings"
ON public.call_bookings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Policy 3: Only admins can UPDATE bookings
CREATE POLICY "only_admins_can_update_bookings"
ON public.call_bookings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Policy 4: Only admins can DELETE bookings
CREATE POLICY "only_admins_can_delete_bookings"
ON public.call_bookings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Step 3: Ensure RLS is enabled (should already be enabled)
ALTER TABLE public.call_bookings ENABLE ROW LEVEL SECURITY;

-- Step 4: Add comment for documentation
COMMENT ON TABLE public.call_bookings IS 'Sensitive customer booking data - ACCESS RESTRICTED TO ADMINS ONLY';

-- Step 5: Verify the security by checking policies
-- This query should return only admin-accessible policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'call_bookings'
ORDER BY policyname;
