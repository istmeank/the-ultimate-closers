-- Accorder un accès total aux owners sur toutes les tables
-- Les owners auront les mêmes droits que les admins partout

-- 1. APPOINTMENTS - Ajouter owners aux policies existantes
DROP POLICY IF EXISTS "appointments_assigned_or_admin" ON public.appointments;
CREATE POLICY "appointments_assigned_admin_owner"
ON public.appointments FOR ALL
TO authenticated
USING (
  assigned_to = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'owner'::app_role)
  OR EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = appointments.lead_id 
    AND leads.owner_id = auth.uid()
  )
);

-- 2. CALL_BOOKINGS - Ajouter owners
DROP POLICY IF EXISTS "admins_view_bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "admins_update_bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "admins_delete_bookings" ON public.call_bookings;

CREATE POLICY "admins_owners_view_bookings"
ON public.call_bookings FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "admins_owners_update_bookings"
ON public.call_bookings FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "admins_owners_delete_bookings"
ON public.call_bookings FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- 3. CLOSER_ASSIGNMENTS - Ajouter owners
DROP POLICY IF EXISTS "admins_manage_assignments" ON public.closer_assignments;
DROP POLICY IF EXISTS "closers_view_own_assignments" ON public.closer_assignments;

CREATE POLICY "admins_owners_manage_assignments"
ON public.closer_assignments FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "closers_view_own_assignments"
ON public.closer_assignments FOR SELECT
TO authenticated
USING (
  closer_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'owner'::app_role)
);

-- 4. DEALS - Ajouter owners
DROP POLICY IF EXISTS "deals_via_lead_ownership" ON public.deals;
CREATE POLICY "deals_via_lead_ownership"
ON public.deals FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id = deals.lead_id
    AND (
      leads.owner_id = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'owner'::app_role)
    )
  )
);

-- 5. EXTERNAL_SYNC_LOG - Ajouter owners
DROP POLICY IF EXISTS "external_sync_admin_only" ON public.external_sync_log;
CREATE POLICY "external_sync_admin_owner"
ON public.external_sync_log FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- 6. FORMATIONS - Ajouter owners
DROP POLICY IF EXISTS "Admins can manage formations" ON public.formations;
CREATE POLICY "Admins and owners can manage formations"
ON public.formations FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- 7. INTERACTIONS - Ajouter owners
DROP POLICY IF EXISTS "interactions_via_lead_ownership" ON public.interactions;
CREATE POLICY "interactions_via_lead_ownership"
ON public.interactions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id = interactions.lead_id
    AND (
      leads.owner_id = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'owner'::app_role)
    )
  )
);

-- 8. LEAD_SCORES - Ajouter owners
DROP POLICY IF EXISTS "lead_scores_via_ownership" ON public.lead_scores;
CREATE POLICY "lead_scores_via_ownership"
ON public.lead_scores FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id = lead_scores.lead_id
    AND (
      leads.owner_id = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'owner'::app_role)
    )
  )
);

-- 9. LEADS - Ajouter owners
DROP POLICY IF EXISTS "admin_all_leads" ON public.leads;
DROP POLICY IF EXISTS "closers_own_leads_select" ON public.leads;
DROP POLICY IF EXISTS "closers_own_leads_update" ON public.leads;
DROP POLICY IF EXISTS "closers_own_leads_insert" ON public.leads;

CREATE POLICY "admin_owner_all_leads"
ON public.leads FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "closers_own_leads_select"
ON public.leads FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'owner'::app_role)
);

CREATE POLICY "closers_own_leads_update"
ON public.leads FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'owner'::app_role)
);

CREATE POLICY "closers_own_leads_insert"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'owner'::app_role)
);

-- 10. PAYMENTS - Ajouter owners
DROP POLICY IF EXISTS "payments_via_deal_ownership" ON public.payments;
CREATE POLICY "payments_via_deal_ownership"
ON public.payments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM deals
    JOIN leads ON leads.id = deals.lead_id
    WHERE deals.id = payments.deal_id
    AND (
      leads.owner_id = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'owner'::app_role)
    )
  )
);

-- 11. RESOURCES - Ajouter owners
DROP POLICY IF EXISTS "resources_via_ownership" ON public.resources;
CREATE POLICY "resources_via_ownership"
ON public.resources FOR ALL
TO authenticated
USING (
  lead_id IS NULL
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'owner'::app_role)
  OR EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id = resources.lead_id
    AND leads.owner_id = auth.uid()
  )
);

-- 12. SITE_ANALYTICS - Ajouter owners
DROP POLICY IF EXISTS "Admins can view analytics" ON public.site_analytics;
CREATE POLICY "Admins and owners can view analytics"
ON public.site_analytics FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- 13. SITE_CONTENT - Ajouter owners
DROP POLICY IF EXISTS "Admins can manage site content" ON public.site_content;
CREATE POLICY "Admins and owners can manage site content"
ON public.site_content FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- 14. USER_ROLES - Permettre aux owners de voir tous les rôles
CREATE POLICY "Owners and admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'owner'::app_role)
);