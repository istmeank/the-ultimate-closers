-- Reconstituée en session 34 depuis `supabase_migrations.schema_migrations`
-- (version 20260607194749). Seconde partie de la baseline — BLOCKER-012.
--
-- Ce fichier contient l'INSERT des trois buckets de stockage. C'est la raison
-- pour laquelle `supabase migration squash` a été écarté : la documentation
-- officielle précise que la consolidation omet les instructions de manipulation
-- de données, « y compris les buckets de stockage ». Un squash aurait produit un
-- fichier d'apparence propre reconstruisant une base sans buckets.
--
-- Note : `site_analytics_insert_anyone` et `call_bookings_insert_public` sont
-- créées ici, puis supprimées par la migration 20260609185416 une fois les
-- Edge Functions à rate limiting en place (BLOCKER H8/H9). Elles documentent un
-- état historique — ne pas les retirer de ce fichier.
--
-- SQL identique à celui exécuté ; seul cet en-tête a été ajouté.

-- RLS POLICIES (41 policies optimisées avec (select auth.uid()))

CREATE POLICY "user_roles_select_own_or_admin_owner" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "user_roles_manage_admin_owner" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (id = (select auth.uid()));

CREATE POLICY "profiles_select_admin_owner" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid())) WITH CHECK (id = (select auth.uid()));

CREATE POLICY "profiles_update_admin_owner" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "profiles_delete_admin_owner" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "site_content_select_public" ON public.site_content
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "site_content_manage_admin_owner" ON public.site_content
  FOR ALL TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "site_analytics_insert_anyone" ON public.site_analytics
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "site_analytics_select_admin_owner" ON public.site_analytics
  FOR SELECT TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "formations_select_published" ON public.formations
  FOR SELECT TO authenticated USING (is_published = true);

CREATE POLICY "formations_manage_admin_owner" ON public.formations
  FOR ALL TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "leads_select_owner_or_admin" ON public.leads
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND (owner_id = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)));

CREATE POLICY "leads_insert_authenticated" ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "leads_update_owner_or_admin" ON public.leads
  FOR UPDATE TO authenticated
  USING (deleted_at IS NULL AND (owner_id = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)))
  WITH CHECK (owner_id = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "leads_delete_admin_owner" ON public.leads
  FOR DELETE TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "interactions_via_lead" ON public.interactions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.leads l WHERE l.id = interactions.lead_id
    AND l.deleted_at IS NULL AND (l.owner_id = (select auth.uid())
      OR public.has_role((select auth.uid()), 'admin'::public.app_role)
      OR public.has_role((select auth.uid()), 'owner'::public.app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.leads l WHERE l.id = interactions.lead_id
    AND (l.owner_id = (select auth.uid())
      OR public.has_role((select auth.uid()), 'admin'::public.app_role)
      OR public.has_role((select auth.uid()), 'owner'::public.app_role))));

CREATE POLICY "lead_scores_via_lead" ON public.lead_scores
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_scores.lead_id
    AND l.deleted_at IS NULL AND (l.owner_id = (select auth.uid())
      OR public.has_role((select auth.uid()), 'admin'::public.app_role)
      OR public.has_role((select auth.uid()), 'owner'::public.app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_scores.lead_id
    AND (l.owner_id = (select auth.uid())
      OR public.has_role((select auth.uid()), 'admin'::public.app_role)
      OR public.has_role((select auth.uid()), 'owner'::public.app_role))));

CREATE POLICY "closer_assignments_select_own_or_admin" ON public.closer_assignments
  FOR SELECT TO authenticated
  USING (closer_id = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "closer_assignments_manage_admin_owner" ON public.closer_assignments
  FOR ALL TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "closer_integrations_select_own_or_admin" ON public.closer_integrations
  FOR SELECT TO authenticated
  USING (closer_id = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "closer_integrations_manage_own" ON public.closer_integrations
  FOR ALL TO authenticated
  USING (closer_id = (select auth.uid()))
  WITH CHECK (closer_id = (select auth.uid()));

CREATE POLICY "call_bookings_insert_public" ON public.call_bookings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "call_bookings_select_admin_owner" ON public.call_bookings
  FOR SELECT TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "call_bookings_update_admin_owner" ON public.call_bookings
  FOR UPDATE TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "call_bookings_delete_admin_owner" ON public.call_bookings
  FOR DELETE TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "appointments_select_assigned_or_admin" ON public.appointments
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND (assigned_to = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
    OR EXISTS (SELECT 1 FROM public.leads l WHERE l.id = appointments.lead_id AND l.owner_id = (select auth.uid()))));

CREATE POLICY "appointments_insert_authenticated" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (assigned_to = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "appointments_update_assigned_or_admin" ON public.appointments
  FOR UPDATE TO authenticated
  USING (deleted_at IS NULL AND (assigned_to = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)))
  WITH CHECK (assigned_to = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

CREATE POLICY "deals_via_lead" ON public.deals
  FOR ALL TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.leads l WHERE l.id = deals.lead_id
    AND l.deleted_at IS NULL AND (l.owner_id = (select auth.uid())
      OR public.has_role((select auth.uid()), 'admin'::public.app_role)
      OR public.has_role((select auth.uid()), 'owner'::public.app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.leads l WHERE l.id = deals.lead_id
    AND (l.owner_id = (select auth.uid())
      OR public.has_role((select auth.uid()), 'admin'::public.app_role)
      OR public.has_role((select auth.uid()), 'owner'::public.app_role))));

CREATE POLICY "payments_via_deal" ON public.payments
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.deals d JOIN public.leads l ON l.id = d.lead_id
    WHERE d.id = payments.deal_id AND d.deleted_at IS NULL AND l.deleted_at IS NULL
    AND (l.owner_id = (select auth.uid())
      OR public.has_role((select auth.uid()), 'admin'::public.app_role)
      OR public.has_role((select auth.uid()), 'owner'::public.app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.deals d JOIN public.leads l ON l.id = d.lead_id
    WHERE d.id = payments.deal_id
    AND (l.owner_id = (select auth.uid())
      OR public.has_role((select auth.uid()), 'admin'::public.app_role)
      OR public.has_role((select auth.uid()), 'owner'::public.app_role))));

CREATE POLICY "resources_via_lead_or_public" ON public.resources
  FOR ALL TO authenticated
  USING (lead_id IS NULL
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
    OR EXISTS (SELECT 1 FROM public.leads l WHERE l.id = resources.lead_id
      AND l.deleted_at IS NULL AND l.owner_id = (select auth.uid())))
  WITH CHECK (lead_id IS NULL
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
    OR EXISTS (SELECT 1 FROM public.leads l WHERE l.id = resources.lead_id AND l.owner_id = (select auth.uid())));

CREATE POLICY "google_calendar_tokens_manage_own" ON public.google_calendar_tokens
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "external_sync_log_admin_owner" ON public.external_sync_log
  FOR ALL TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role));

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true),
       ('formations',  'formations',  false),
       ('avatars',     'avatars',     true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_site_images_manage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'site-images' AND (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)))
  WITH CHECK (bucket_id = 'site-images' AND (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)));

CREATE POLICY "storage_site_images_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'site-images');

CREATE POLICY "storage_formations_admin_owner" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'formations' AND (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)))
  WITH CHECK (bucket_id = 'formations' AND (public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)));

CREATE POLICY "storage_formations_authenticated_read" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'formations');

CREATE POLICY "storage_avatars_manage_own" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (select auth.uid())::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (select auth.uid())::text);

CREATE POLICY "storage_avatars_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'avatars');
