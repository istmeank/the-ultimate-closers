-- Supprimer l'ancienne politique et en créer une nouvelle qui inclut 'owner'
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Admins and owners can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'owner'::app_role)
);

-- Mettre à jour aussi la politique de gestion
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins and owners can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'owner'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'owner'::app_role)
);

-- Mettre à jour les autres tables pour inclure 'owner'
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins and owners can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'owner'::app_role)
);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins and owners can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'owner'::app_role)
);

DROP POLICY IF EXISTS "Only admins can delete profiles" ON public.profiles;

CREATE POLICY "Admins and owners can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'owner'::app_role)
);