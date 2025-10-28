-- CORRECTION URGENTE - Sécurité call_bookings
-- Migration pour bloquer les insertions publiques directes

-- ========================================
-- 1. CORRECTION call_bookings
-- ========================================

-- Supprimer toutes les policies INSERT publiques existantes
DROP POLICY IF EXISTS "public_can_create_booking" ON public.call_bookings;
DROP POLICY IF EXISTS "secure_create_booking" ON public.call_bookings;
DROP POLICY IF EXISTS "Anyone can create booking" ON public.call_bookings;
DROP POLICY IF EXISTS "public_create_booking" ON public.call_bookings;

-- Créer une policy restrictive pour INSERT (service_role seulement)
CREATE POLICY "only_service_role_can_insert_bookings"
ON public.call_bookings FOR INSERT
TO service_role
WITH CHECK (true);

-- S'assurer que RLS est activé
ALTER TABLE public.call_bookings ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes contraintes si elles existent
ALTER TABLE public.call_bookings DROP CONSTRAINT IF EXISTS valid_phone_format;
ALTER TABLE public.call_bookings DROP CONSTRAINT IF EXISTS valid_company_name;
ALTER TABLE public.call_bookings DROP CONSTRAINT IF EXISTS valid_names;

-- Ajouter des contraintes de validation
ALTER TABLE public.call_bookings 
ADD CONSTRAINT valid_phone_format 
CHECK (phone ~* '^[\+]?[0-9\s\-\(\)]{10,}$');

ALTER TABLE public.call_bookings 
ADD CONSTRAINT valid_company_name 
CHECK (length(company_name) >= 2 AND length(company_name) <= 100);

ALTER TABLE public.call_bookings 
ADD CONSTRAINT valid_names 
CHECK (
  length(first_name) >= 2 AND length(first_name) <= 50 AND
  length(last_name) >= 2 AND length(last_name) <= 50
);

-- Ajouter champ de tracking pour identifier la source de soumission
ALTER TABLE public.call_bookings 
ADD COLUMN IF NOT EXISTS submission_source text DEFAULT 'direct';