-- Reconstituée en session 34 depuis `supabase_migrations.schema_migrations`
-- (version 20260608163636). Appliquée en production le 2026-06-08, session 11,
-- mais jamais versionnée dans le dépôt — BLOCKER-012.
-- SQL identique à celui exécuté ; seul cet en-tête a été ajouté.

-- Critical 1 fix : empêche un closer de manipuler owner_id
-- Trigger BEFORE INSERT/UPDATE qui force owner_id = auth.uid() pour les non-admin/owner

CREATE OR REPLACE FUNCTION public.enforce_lead_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  -- Admin et owner gardent la capacité d'assigner manuellement n'importe quel owner_id
  IF public.has_role(auth.uid(), 'admin'::public.app_role)
     OR public.has_role(auth.uid(), 'owner'::public.app_role) THEN
    RETURN NEW;
  END IF;
  -- Closer et user : owner_id est FORCÉ à auth.uid(), peu importe ce que le client envoie
  NEW.owner_id := auth.uid();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_lead_owner() IS
'Critical 1 fix (scanner Lovable) : ferme le vecteur IDOR sur leads.owner_id. Pour les closers/users, le moteur DB force owner_id = auth.uid() même si le client manipule la requête. Admin/owner gardent leur capacité d''assigner manuellement.';

CREATE TRIGGER trg_leads_enforce_owner
  BEFORE INSERT OR UPDATE OF owner_id ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_lead_owner();
