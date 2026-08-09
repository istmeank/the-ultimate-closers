-- TUC v2 — Triggers for automatic interaction logging
-- Task: T05 (Création triggers interactions)
-- Date: 2026-08-09
-- Domains: acquisition-qualification (domain 1), meet-coaching (domain 4)
-- What: Extends interactions.type CHECK constraint to accept 'note' type;
-- creates triggers on appointments and deals tables to automatically log them as interactions.

-- 1. Extend CHECK constraint on interactions.type
ALTER TABLE public.interactions DROP CONSTRAINT IF EXISTS interactions_type_check;
ALTER TABLE public.interactions ADD CONSTRAINT interactions_type_check
  CHECK (type = ANY(ARRAY['call','msg','email','meet','whatsapp','telegram','messenger','instagram','note']));

COMMENT ON CONSTRAINT interactions_type_check ON public.interactions IS
'Enum-like CHECK: allowed interaction types include call, msg, email, meet, whatsapp, telegram, messenger, instagram, and note (for automated logs).';

-- 2. Function and trigger: log appointments as interactions
CREATE OR REPLACE FUNCTION public.log_appointment_as_interaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE v_owner_id UUID;
BEGIN
  SELECT owner_id INTO v_owner_id FROM public.leads WHERE id = NEW.lead_id;
  INSERT INTO public.interactions (lead_id, type, content, by_user_id)
  VALUES (NEW.lead_id, 'meet',
    format('Rendez-vous programmé le %s via %s', to_char(NEW.start_at, 'DD/MM/YYYY HH24:MI'), NEW.channel),
    v_owner_id);
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.log_appointment_as_interaction() IS
'Automatically creates an interaction record (type=meet) when a new appointment is inserted. Captures lead owner_id and formats a French-language summary.';

-- Trigger functions must not be directly executable by client roles (BLOCKER-H10 lesson:
-- a SECURITY DEFINER function left executable by PUBLIC is a privilege escalation vector).
REVOKE EXECUTE ON FUNCTION public.log_appointment_as_interaction() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_appointments_log_interaction ON public.appointments;
CREATE TRIGGER trg_appointments_log_interaction
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_appointment_as_interaction();

-- 3. Function and trigger: log deals as interactions
CREATE OR REPLACE FUNCTION public.log_deal_as_interaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE v_owner_id UUID;
BEGIN
  SELECT owner_id INTO v_owner_id FROM public.leads WHERE id = NEW.lead_id;
  INSERT INTO public.interactions (lead_id, type, content, by_user_id)
  VALUES (NEW.lead_id, 'note',
    format('Deal créé: %s - Montant: %s %s - Étape: %s',
      NEW.offer_name, to_char(NEW.amount_cents / 100.0, 'FM999999990.00'), NEW.currency, NEW.stage),
    v_owner_id);
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.log_deal_as_interaction() IS
'Automatically creates an interaction record (type=note) when a new deal is inserted. Captures deal metadata (offer_name, amount_cents/100, currency, stage) in a formatted French-language summary.';

REVOKE EXECUTE ON FUNCTION public.log_deal_as_interaction() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_deals_log_interaction ON public.deals;
CREATE TRIGGER trg_deals_log_interaction
  AFTER INSERT ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.log_deal_as_interaction();
