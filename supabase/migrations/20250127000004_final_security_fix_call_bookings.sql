-- CORRECTION FINALE - Sécurité call_bookings
-- Migration pour bloquer INSERT public et utiliser Edge Function sécurisée

-- Étape 1: Supprimer la policy INSERT publique
DROP POLICY IF EXISTS "public_can_create_booking" ON public.call_bookings;
DROP POLICY IF EXISTS "secure_create_booking" ON public.call_bookings;

-- Étape 2: Créer une policy restrictive pour INSERT
-- Seule l'Edge Function (service role) peut insérer
CREATE POLICY "only_service_role_can_insert_bookings"
ON public.call_bookings FOR INSERT
TO service_role
WITH CHECK (true);

-- Étape 3: Garder les autres policies sécurisées
-- (Les policies SELECT/UPDATE/DELETE restent inchangées)

-- Étape 4: Ajouter des contraintes de validation supplémentaires
ALTER TABLE public.call_bookings 
ADD CONSTRAINT IF NOT EXISTS valid_phone_format 
CHECK (phone ~* '^[\+]?[0-9\s\-\(\)]{10,}$');

ALTER TABLE public.call_bookings 
ADD CONSTRAINT IF NOT EXISTS valid_company_name 
CHECK (length(company_name) >= 2 AND length(company_name) <= 100);

ALTER TABLE public.call_bookings 
ADD CONSTRAINT IF NOT EXISTS valid_names 
CHECK (
  length(first_name) >= 2 AND length(first_name) <= 50 AND
  length(last_name) >= 2 AND length(last_name) <= 50
);

-- Étape 5: Ajouter un champ pour tracking des soumissions
ALTER TABLE public.call_bookings 
ADD COLUMN IF NOT EXISTS submission_source TEXT DEFAULT 'edge_function';

-- Étape 6: Commentaire de sécurité
COMMENT ON TABLE public.call_bookings IS 'Sensitive customer booking data - INSERT ONLY VIA SECURE EDGE FUNCTION. No public access.';

-- Étape 7: Vérification finale
SELECT 'Security fix applied - INSERT now restricted to Edge Function only' as status;
