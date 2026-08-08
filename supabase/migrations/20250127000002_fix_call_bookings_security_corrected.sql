-- CORRECTION SÉCURISÉE - call_bookings
-- Migration pour Lovable Cloud - Sécurité corrigée
-- Cette migration corrige le problème de sécurité tout en gardant le formulaire fonctionnel

-- Étape 1: Supprimer toutes les policies existantes
DROP POLICY IF EXISTS "Anyone can create booking" ON public.call_bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "authenticated_users_can_create_booking" ON public.call_bookings;
DROP POLICY IF EXISTS "only_admins_can_view_bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "only_admins_can_update_bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "only_admins_can_delete_bookings" ON public.call_bookings;

-- Étape 2: S'assurer que RLS est activé
ALTER TABLE public.call_bookings ENABLE ROW LEVEL SECURITY;

-- Étape 3: Créer des policies sécurisées

-- Policy 1: TOUS (authentifiés ET non-authentifiés) peuvent créer des réservations
-- ✅ CORRECTION: Utilise TO public au lieu de TO authenticated
CREATE POLICY "public_can_create_booking"
ON public.call_bookings FOR INSERT
TO public
WITH CHECK (true);

-- Policy 2: Seuls les admins peuvent voir les réservations
CREATE POLICY "only_admins_can_view_bookings"
ON public.call_bookings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Policy 3: Seuls les admins peuvent modifier les réservations
CREATE POLICY "only_admins_can_update_bookings"
ON public.call_bookings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Policy 4: Seuls les admins peuvent supprimer les réservations
CREATE POLICY "only_admins_can_delete_bookings"
ON public.call_bookings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Étape 4: Ajouter commentaire pour documentation
COMMENT ON TABLE public.call_bookings IS 'Sensitive customer booking data - ACCESS RESTRICTED TO ADMINS ONLY. Public can create bookings via form.';

-- Étape 5: Vérification finale
SELECT 'Security fix applied successfully - public can still create bookings' as status;

-- Étape 6: Vérifier les policies créées
SELECT 
    policyname,
    cmd as command,
    roles,
    CASE 
        WHEN roles IS NULL OR 'public' = ANY(roles) THEN '✅ Public access'
        WHEN 'authenticated' = ANY(roles) THEN '⚠️ Authenticated access'
        ELSE '✅ Restricted access'
    END as access_level
FROM pg_policies 
WHERE tablename = 'call_bookings'
ORDER BY policyname;
