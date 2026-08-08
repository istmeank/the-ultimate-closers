-- SPRINT 1: Extension des rôles pour le système CRM
-- Migration pour ajouter les rôles closer, owner, client et tables associées

-- Étape 1: Ajouter nouveaux rôles à l'enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'closer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';

-- Étape 2: Ajouter champs métier aux profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialty TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_concurrent_leads INTEGER DEFAULT 10;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Étape 3: Créer table pour rotation round-robin des closers
CREATE TABLE IF NOT EXISTS public.closer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_assigned_at TIMESTAMPTZ DEFAULT now(),
  total_assigned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Étape 4: Créer table pour les intégrations des closers
CREATE TABLE IF NOT EXISTS public.closer_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL, -- 'google_calendar', 'slack', 'hubspot'
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB, -- calendar_id, timezone, channel_id, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Contraintes
  CONSTRAINT valid_integration_type CHECK (integration_type IN ('google_calendar', 'slack', 'hubspot', 'stripe')),
  CONSTRAINT unique_closer_integration UNIQUE (closer_id, integration_type)
);

-- Étape 5: Index pour performances
CREATE INDEX IF NOT EXISTS idx_closer_assignments_closer ON closer_assignments(closer_id);
CREATE INDEX IF NOT EXISTS idx_closer_assignments_last_assigned ON closer_assignments(last_assigned_at);
CREATE INDEX IF NOT EXISTS idx_closer_integrations_closer ON closer_integrations(closer_id);
CREATE INDEX IF NOT EXISTS idx_closer_integrations_type ON closer_integrations(integration_type);

-- Étape 6: Triggers pour updated_at
CREATE TRIGGER update_closer_assignments_updated_at
BEFORE UPDATE ON public.closer_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_closer_integrations_updated_at
BEFORE UPDATE ON public.closer_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Étape 7: RLS Policies pour les nouvelles tables

-- Closer Assignments - Seuls les admins peuvent voir/modifier
ALTER TABLE public.closer_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "closer_assignments_admin_only"
ON public.closer_assignments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Closer Integrations - Chaque closer voit ses propres intégrations, admins voient tout
ALTER TABLE public.closer_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "closer_integrations_own_or_admin"
ON public.closer_integrations FOR ALL
TO authenticated
USING (
  closer_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'owner'::app_role)
)
WITH CHECK (
  closer_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'owner'::app_role)
);

-- Étape 8: Mettre à jour les policies existantes pour supporter les nouveaux rôles

-- Mettre à jour la fonction has_role pour supporter les nouveaux rôles
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name app_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = user_id AND user_roles.role = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour les policies leads pour supporter owner
DROP POLICY IF EXISTS "closers_own_leads_select" ON public.leads;
CREATE POLICY "closers_own_leads_select"
ON public.leads FOR SELECT TO authenticated
USING (
  (owner_id = auth.uid()) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'owner'::app_role)
);

DROP POLICY IF EXISTS "closers_own_leads_insert" ON public.leads;
CREATE POLICY "closers_own_leads_insert"
ON public.leads FOR INSERT TO authenticated
WITH CHECK (
  (owner_id = auth.uid()) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'owner'::app_role)
);

DROP POLICY IF EXISTS "closers_own_leads_update" ON public.leads;
CREATE POLICY "closers_own_leads_update"
ON public.leads FOR UPDATE TO authenticated
USING (
  (owner_id = auth.uid()) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'owner'::app_role)
)
WITH CHECK (
  (owner_id = auth.uid()) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'owner'::app_role)
);

-- Mettre à jour les policies interactions pour supporter owner
DROP POLICY IF EXISTS "interactions_via_lead_ownership" ON public.interactions;
CREATE POLICY "interactions_via_lead_ownership"
ON public.interactions FOR ALL USING (
  EXISTS(
    SELECT 1 FROM leads 
    WHERE leads.id = interactions.lead_id 
    AND (leads.owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role))
  )
);

-- Mettre à jour les policies deals pour supporter owner
DROP POLICY IF EXISTS "deals_via_lead_ownership" ON public.deals;
CREATE POLICY "deals_via_lead_ownership"
ON public.deals FOR ALL USING (
  EXISTS(
    SELECT 1 FROM leads 
    WHERE leads.id = deals.lead_id 
    AND (leads.owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role))
  )
);

-- Mettre à jour les policies appointments pour supporter owner
DROP POLICY IF EXISTS "appointments_assigned_or_admin" ON public.appointments;
CREATE POLICY "appointments_assigned_or_admin"
ON public.appointments FOR ALL USING (
  assigned_to = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'owner'::app_role)
  OR EXISTS(
    SELECT 1 FROM leads 
    WHERE leads.id = appointments.lead_id 
    AND leads.owner_id = auth.uid()
  )
);

-- Étape 9: Ajouter commentaires pour documentation
COMMENT ON TABLE public.closer_assignments IS 'Table pour gérer la rotation round-robin des closers et leur charge de travail';
COMMENT ON TABLE public.closer_integrations IS 'Table pour stocker les tokens OAuth et configurations des intégrations externes des closers';
COMMENT ON COLUMN public.profiles.specialty IS 'Array des spécialités/secteurs du closer (ex: ["tech", "finance"])';
COMMENT ON COLUMN public.profiles.max_concurrent_leads IS 'Nombre maximum de leads simultanés que peut gérer le closer';
COMMENT ON COLUMN public.profiles.is_active IS 'Indique si le closer est actif et peut recevoir de nouveaux leads';

-- Étape 10: Vérification finale
SELECT 'Sprint 1 migration completed successfully' as status;
SELECT 'New roles available: ' || string_agg(enumlabel, ', ') as available_roles
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role');
