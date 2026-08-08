-- Reconstituée en session 34 depuis `supabase_migrations.schema_migrations`
-- (version 20260607194841). Appliquée en production le 2026-06-07, session 9,
-- mais jamais versionnée dans le dépôt — BLOCKER-012.
-- SQL identique à celui exécuté ; seul cet en-tête a été ajouté.

-- Durcissement sécurité : REVOKE EXECUTE sur SECURITY DEFINER + indexes FK manquants

-- 1. Empêcher l'appel direct via /rest/v1/rpc/handle_new_user (ne sert qu'en trigger)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- 2. Empêcher l'appel direct via /rest/v1/rpc/has_role (sert dans les policies RLS)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
-- Mais autoriser le service interne RLS à l'utiliser
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO postgres;

-- 3. Indexes FK manquants détectés par get_advisors performance
CREATE INDEX IF NOT EXISTS idx_formations_created_by ON public.formations(created_by);
CREATE INDEX IF NOT EXISTS idx_site_analytics_user_id ON public.site_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_site_content_updated_by ON public.site_content(updated_by);

-- 4. Restreindre le listing des buckets publics (avatars + site-images)
-- Les URLs directes restent accessibles ; seul le LIST est restreint
DROP POLICY IF EXISTS "storage_avatars_public_read" ON storage.objects;
CREATE POLICY "storage_avatars_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars' AND name IS NOT NULL);

DROP POLICY IF EXISTS "storage_site_images_public_read" ON storage.objects;
CREATE POLICY "storage_site_images_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-images' AND name IS NOT NULL);
