-- Corriger les fonctions pour ajouter search_path (sécurité)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_booking_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si email a déjà réservé dans les 7 derniers jours
  IF EXISTS (
    SELECT 1 FROM public.call_bookings
    WHERE email = NEW.email
    AND created_at > now() - interval '7 days'
    AND status != 'cancelled'
  ) THEN
    RAISE EXCEPTION 'Vous avez déjà une réservation en cours. Veuillez patienter 7 jours avant de réserver à nouveau.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;