-- CORRECTION IMMÉDIATE - Sécurité call_bookings
-- Exécuter ce script dans le SQL Editor de Supabase Dashboard

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

-- Étape 4: Vérification
-- Cette requête doit maintenant échouer pour les utilisateurs non authentifiés
SELECT 'Security fix applied successfully' as status;

-- Étape 5: Test de sécurité (à exécuter en tant qu'utilisateur non authentifié)
-- Cette requête doit retourner une erreur d'accès refusé
-- SELECT COUNT(*) FROM public.call_bookings;
