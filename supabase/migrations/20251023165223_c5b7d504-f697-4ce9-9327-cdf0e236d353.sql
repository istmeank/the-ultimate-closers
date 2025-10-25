-- ============================================
-- TRIGGERS COMPLETS POUR LE SYSTÈME DE RÉSERVATION
-- ============================================

-- ============================================
-- Phase 1: Trigger updated_at pour site_content
-- ============================================

CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Phase 2: Validation métier pour call_bookings
-- ============================================

CREATE OR REPLACE FUNCTION public.validate_call_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que la date préférée est dans le futur
  IF NEW.preferred_date IS NOT NULL AND NEW.preferred_date <= now() THEN
    RAISE EXCEPTION 'La date de réservation doit être dans le futur';
  END IF;
  
  -- Vérifier que l'engagement est confirmé
  IF NEW.commitment_confirmed != true THEN
    RAISE EXCEPTION 'Vous devez confirmer votre engagement avant de réserver';
  END IF;
  
  -- Vérifier que l'email est bien professionnel (pas Gmail, etc.)
  IF NEW.email ~* '@(gmail|hotmail|yahoo|outlook|live)\.' THEN
    NEW.is_business_email = false;
  ELSE
    NEW.is_business_email = true;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_booking_before_insert
BEFORE INSERT ON public.call_bookings
FOR EACH ROW
EXECUTE FUNCTION public.validate_call_booking();

-- ============================================
-- Phase 3: Validation métier pour formations
-- ============================================

CREATE OR REPLACE FUNCTION public.validate_formation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que la durée est positive si renseignée
  IF NEW.duration_minutes IS NOT NULL AND NEW.duration_minutes <= 0 THEN
    RAISE EXCEPTION 'La durée doit être supérieure à 0 minutes';
  END IF;
  
  -- Vérifier que file_url n'est pas vide
  IF NEW.file_url IS NULL OR trim(NEW.file_url) = '' THEN
    RAISE EXCEPTION 'L''URL du fichier ne peut pas être vide';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_formation_before_insert
BEFORE INSERT ON public.formations
FOR EACH ROW
EXECUTE FUNCTION public.validate_formation();

CREATE TRIGGER validate_formation_before_update
BEFORE UPDATE ON public.formations
FOR EACH ROW
EXECUTE FUNCTION public.validate_formation();

-- ============================================
-- Phase 4: Traçabilité des confirmations
-- ============================================

CREATE OR REPLACE FUNCTION public.track_booking_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si le statut passe à 'confirmed', remplir confirmed_at
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    NEW.confirmed_at = now();
  END IF;
  
  -- Si le statut repasse à pending ou cancelled, vider confirmed_at
  IF NEW.status IN ('pending', 'cancelled') THEN
    NEW.confirmed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER track_confirmation_timestamp
BEFORE UPDATE ON public.call_bookings
FOR EACH ROW
EXECUTE FUNCTION public.track_booking_confirmation();

-- ============================================
-- Phase 5: Notification nouvelles réservations
-- ============================================

CREATE OR REPLACE FUNCTION public.notify_new_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insérer un événement dans site_analytics
  INSERT INTO public.site_analytics (
    event_type,
    page_path,
    metadata
  ) VALUES (
    'new_booking_created',
    '/reserver-appel',
    jsonb_build_object(
      'booking_id', NEW.id,
      'company_name', NEW.company_name,
      'email', NEW.email,
      'urgency', NEW.urgency,
      'annual_revenue', NEW.annual_revenue,
      'industry', NEW.industry
    )
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_on_new_booking
AFTER INSERT ON public.call_bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_booking();

-- ============================================
-- Phase 6: Archivage automatique
-- ============================================

CREATE OR REPLACE FUNCTION public.archive_old_bookings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Marquer comme 'completed' les réservations dont la date est passée
  IF NEW.preferred_date IS NOT NULL AND NEW.preferred_date < now() AND NEW.status = 'confirmed' THEN
    NEW.status = 'completed';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_archive_completed_bookings
BEFORE UPDATE ON public.call_bookings
FOR EACH ROW
EXECUTE FUNCTION public.archive_old_bookings();