-- Step 2: Update RLS policies on closer_integrations
-- Drop existing policy
DROP POLICY IF EXISTS "closers_manage_own_integrations" ON public.closer_integrations;

-- Policy 1: Owners and developers can do everything
CREATE POLICY "owners_developers_full_access" 
ON public.closer_integrations
FOR ALL 
USING (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'developer'::app_role)
);

-- Policy 2: Admins and closers can view their own integrations
CREATE POLICY "admins_closers_view_own" 
ON public.closer_integrations
FOR SELECT 
USING (
  (closer_id = auth.uid() AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'closer'::app_role)
  ))
);

-- Policy 3: Closers can update their own integrations
CREATE POLICY "closers_update_own_integrations" 
ON public.closer_integrations
FOR UPDATE 
USING (
  closer_id = auth.uid() AND has_role(auth.uid(), 'closer'::app_role)
)
WITH CHECK (
  closer_id = auth.uid() AND has_role(auth.uid(), 'closer'::app_role)
);