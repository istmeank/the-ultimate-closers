-- Phase 1: Infrastructure CRM Closers
-- Tables tracking + intégrations + extension profiles + triggers auto-assignation

-- ========================================
-- 1. Table: closer_assignments (tracking auto-assignation)
-- ========================================
CREATE TABLE IF NOT EXISTS public.closer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_assigned_at TIMESTAMPTZ,
  total_assigned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(closer_id)
);

-- ========================================
-- 2. Table: closer_integrations (OAuth tokens)
-- ========================================
CREATE TABLE IF NOT EXISTS public.closer_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('google_calendar', 'slack', 'hubspot')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(closer_id, integration_type)
);

-- ========================================
-- 3. Extension profiles pour closers
-- ========================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_concurrent_leads INTEGER DEFAULT 10;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialties JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- ========================================
-- 4. RLS Policies
-- ========================================
ALTER TABLE public.closer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closer_integrations ENABLE ROW LEVEL SECURITY;

-- Policies: closer_assignments
CREATE POLICY "closers_view_own_assignments"
ON public.closer_assignments FOR SELECT
USING (closer_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins_manage_assignments"
ON public.closer_assignments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies: closer_integrations
CREATE POLICY "closers_manage_own_integrations"
ON public.closer_integrations FOR ALL
USING (closer_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- ========================================
-- 5. Fonction Auto-Assignation Intelligente
-- ========================================
CREATE OR REPLACE FUNCTION public.auto_assign_closer_to_lead()
RETURNS TRIGGER AS $$
DECLARE
  selected_closer_id UUID;
BEGIN
  -- Uniquement si score >= 75 et non assigné
  IF NEW.score >= 75 AND NEW.owner_id IS NULL THEN
    
    -- Sélectionner le closer optimal (round-robin + charge)
    WITH active_closers AS (
      SELECT 
        p.id,
        COALESCE(p.max_concurrent_leads, 10) AS max_leads,
        COALESCE(ca.last_assigned_at, '1970-01-01'::timestamptz) AS last_assigned,
        COALESCE((
          SELECT COUNT(*) 
          FROM public.leads l 
          WHERE l.owner_id = p.id 
          AND l.status IN ('new', 'qualified', 'in_progress')
        ), 0) AS current_leads,
        COALESCE((
          SELECT COUNT(*) 
          FROM public.appointments a 
          WHERE a.assigned_to = p.id 
          AND a.start_at >= NOW() 
          AND a.start_at < NOW() + INTERVAL '7 days'
        ), 0) AS upcoming_appointments
      FROM public.profiles p
      INNER JOIN public.user_roles ur ON ur.user_id = p.id
      LEFT JOIN public.closer_assignments ca ON ca.closer_id = p.id
      WHERE ur.role = 'closer'::app_role
        AND COALESCE(p.is_active, true) = true
    ),
    available_closers AS (
      SELECT 
        id,
        last_assigned,
        (current_leads + upcoming_appointments) AS total_workload,
        max_leads
      FROM active_closers
      WHERE (current_leads + upcoming_appointments) < max_leads
    )
    SELECT id INTO selected_closer_id
    FROM available_closers
    ORDER BY 
      total_workload ASC,
      last_assigned ASC
    LIMIT 1;
    
    -- Fallback: prendre le moins chargé même si saturé
    IF selected_closer_id IS NULL THEN
      WITH active_closers AS (
        SELECT 
          p.id,
          COALESCE((
            SELECT COUNT(*) 
            FROM public.leads l 
            WHERE l.owner_id = p.id 
            AND l.status IN ('new', 'qualified', 'in_progress')
          ), 0) + COALESCE((
            SELECT COUNT(*) 
            FROM public.appointments a 
            WHERE a.assigned_to = p.id 
            AND a.start_at >= NOW() 
            AND a.start_at < NOW() + INTERVAL '7 days'
          ), 0) AS total_workload
        FROM public.profiles p
        INNER JOIN public.user_roles ur ON ur.user_id = p.id
        WHERE ur.role = 'closer'::app_role
          AND COALESCE(p.is_active, true) = true
      )
      SELECT id INTO selected_closer_id
      FROM active_closers
      ORDER BY total_workload ASC
      LIMIT 1;
    END IF;
    
    -- Assignation
    IF selected_closer_id IS NOT NULL THEN
      NEW.owner_id := selected_closer_id;
      IF NEW.status = 'new' THEN
        NEW.status := 'qualified';
      END IF;
      
      -- Update tracking
      INSERT INTO public.closer_assignments (closer_id, last_assigned_at, total_assigned)
      VALUES (selected_closer_id, NOW(), 1)
      ON CONFLICT (closer_id) 
      DO UPDATE SET 
        last_assigned_at = NOW(),
        total_assigned = public.closer_assignments.total_assigned + 1;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ========================================
-- 6. Triggers Auto-Assignation
-- ========================================

-- Drop existing triggers if any
DROP TRIGGER IF EXISTS trigger_auto_assign_on_lead_insert ON public.leads;
DROP TRIGGER IF EXISTS trigger_auto_assign_on_score_update ON public.leads;

-- Trigger sur INSERT (nouveau lead)
CREATE TRIGGER trigger_auto_assign_on_lead_insert
BEFORE INSERT ON public.leads
FOR EACH ROW
WHEN (NEW.score >= 75 AND NEW.owner_id IS NULL)
EXECUTE FUNCTION public.auto_assign_closer_to_lead();

-- Trigger sur UPDATE score
CREATE TRIGGER trigger_auto_assign_on_score_update
BEFORE UPDATE OF score ON public.leads
FOR EACH ROW
WHEN (NEW.score >= 75 AND NEW.owner_id IS NULL AND (OLD.score IS NULL OR OLD.score < 75))
EXECUTE FUNCTION public.auto_assign_closer_to_lead();

-- ========================================
-- 7. Trigger pour updated_at sur closer_integrations
-- ========================================
CREATE TRIGGER update_closer_integrations_updated_at
BEFORE UPDATE ON public.closer_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();