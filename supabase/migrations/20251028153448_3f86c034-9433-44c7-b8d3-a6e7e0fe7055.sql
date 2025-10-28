-- CORRECTION SÉCURITÉ - RLS Policies call_bookings
-- Suppression des anciennes policies
DROP POLICY IF EXISTS "Anyone can create booking" ON public.call_bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.call_bookings;

-- Recréation des policies sécurisées
-- Permet aux visiteurs NON AUTHENTIFIÉS de créer des réservations (formulaire public)
CREATE POLICY "public_create_booking"
ON public.call_bookings FOR INSERT
WITH CHECK (true);

-- Seuls les admins peuvent voir les réservations
CREATE POLICY "admins_view_bookings"
ON public.call_bookings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Seuls les admins peuvent mettre à jour les réservations
CREATE POLICY "admins_update_bookings"
ON public.call_bookings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Seuls les admins peuvent supprimer les réservations
CREATE POLICY "admins_delete_bookings"
ON public.call_bookings FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));