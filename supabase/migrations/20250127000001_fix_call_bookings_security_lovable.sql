-- Migration pour corriger la sécurité call_bookings
-- À exécuter via Lovable Cloud ou Supabase CLI

-- Supprimer toutes les policies existantes
DROP POLICY IF EXISTS "Anyone can create booking" ON public.call_bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "authenticated_users_can_create_booking" ON public.call_bookings;
DROP POLICY IF EXISTS "only_admins_can_view_bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "only_admins_can_update_bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "only_admins_can_delete_bookings" ON public.call_bookings;

-- S'assurer que RLS est activé
ALTER TABLE public.call_bookings ENABLE ROW LEVEL SECURITY;

-- Créer des policies sécurisées

-- Policy 1: Seuls les utilisateurs authentifiés peuvent créer des réservations
CREATE POLICY "secure_create_booking"
ON public.call_bookings FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 2: Seuls les admins peuvent voir les réservations
CREATE POLICY "secure_view_bookings"
ON public.call_bookings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Policy 3: Seuls les admins peuvent modifier les réservations
CREATE POLICY "secure_update_bookings"
ON public.call_bookings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Policy 4: Seuls les admins peuvent supprimer les réservations
CREATE POLICY "secure_delete_bookings"
ON public.call_bookings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Ajouter commentaire pour documentation
COMMENT ON TABLE public.call_bookings IS 'Sensitive customer booking data - ACCESS RESTRICTED TO ADMINS ONLY';

-- Vérification finale
SELECT 'Security fix applied successfully' as status;
