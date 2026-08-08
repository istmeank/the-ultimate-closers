-- Étape 1: Supprimer les politiques qui dépendent de l'ancienne fonction
DROP POLICY IF EXISTS "admin_all_leads" ON public.leads;
DROP POLICY IF EXISTS "closers_own_leads_select" ON public.leads;
DROP POLICY IF EXISTS "closers_own_leads_insert" ON public.leads;
DROP POLICY IF EXISTS "closers_own_leads_update" ON public.leads;
DROP POLICY IF EXISTS "interactions_via_lead_ownership" ON public.interactions;
DROP POLICY IF EXISTS "deals_via_lead_ownership" ON public.deals;
DROP POLICY IF EXISTS "appointments_assigned_or_admin" ON public.appointments;
DROP POLICY IF EXISTS "payments_via_deal_ownership" ON public.payments;
DROP POLICY IF EXISTS "lead_scores_via_ownership" ON public.lead_scores;
DROP POLICY IF EXISTS "resources_via_ownership" ON public.resources;
DROP POLICY IF EXISTS "external_sync_admin_only" ON public.external_sync_log;

-- Étape 2: Supprimer les anciennes fonctions
DROP FUNCTION IF EXISTS public.has_role(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(user_id uuid, role_name text) CASCADE;

-- Étape 3: S'assurer que la bonne fonction existe
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Étape 4: Recréer toutes les politiques avec la bonne signature
CREATE POLICY "admin_all_leads"
ON public.leads
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "closers_own_leads_select"
ON public.leads
FOR SELECT
TO authenticated
USING ((owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "closers_own_leads_insert"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK ((owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "closers_own_leads_update"
ON public.leads
FOR UPDATE
TO authenticated
USING ((owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "interactions_via_lead_ownership"
ON public.interactions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.leads
    WHERE leads.id = interactions.lead_id
    AND ((leads.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "deals_via_lead_ownership"
ON public.deals
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.leads
    WHERE leads.id = deals.lead_id
    AND ((leads.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "appointments_assigned_or_admin"
ON public.appointments
FOR ALL
TO authenticated
USING (
  (assigned_to = auth.uid()) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR (EXISTS (
    SELECT 1
    FROM public.leads
    WHERE leads.id = appointments.lead_id
    AND leads.owner_id = auth.uid()
  ))
);

CREATE POLICY "payments_via_deal_ownership"
ON public.payments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.deals
    JOIN public.leads ON leads.id = deals.lead_id
    WHERE deals.id = payments.deal_id
    AND ((leads.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "lead_scores_via_ownership"
ON public.lead_scores
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.leads
    WHERE leads.id = lead_scores.lead_id
    AND ((leads.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "resources_via_ownership"
ON public.resources
FOR ALL
TO authenticated
USING (
  (lead_id IS NULL)
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR (EXISTS (
    SELECT 1
    FROM public.leads
    WHERE leads.id = resources.lead_id
    AND leads.owner_id = auth.uid()
  ))
);

CREATE POLICY "external_sync_admin_only"
ON public.external_sync_log
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Étape 5: Corriger les autres fonctions
CREATE OR REPLACE FUNCTION public.check_booking_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
$$;

CREATE OR REPLACE FUNCTION public.validate_call_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.preferred_date IS NOT NULL AND NEW.preferred_date <= now() THEN
    RAISE EXCEPTION 'La date de réservation doit être dans le futur';
  END IF;
  
  IF NEW.commitment_confirmed != true THEN
    RAISE EXCEPTION 'Vous devez confirmer votre engagement avant de réserver';
  END IF;
  
  IF NEW.email ~* '@(gmail|hotmail|yahoo|outlook|live)\.' THEN
    NEW.is_business_email = false;
  ELSE
    NEW.is_business_email = true;
  END IF;
  
  RETURN NEW;
END;
$$;