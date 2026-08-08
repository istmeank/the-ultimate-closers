-- Reconstituée en session 34 depuis `supabase_migrations.schema_migrations`
-- (version 20260609185416). Appliquée en production le 2026-06-09, session 19,
-- mais jamais versionnée dans le dépôt — BLOCKER-012.
-- C'est la migration qui ferme BLOCKER-H8 et H9 : son absence du dépôt signifiait
-- qu'un environnement reconstruit depuis Git aurait gardé des INSERT publics
-- non protégés sur call_bookings et site_analytics.
-- SQL identique à celui exécuté ; seul cet en-tête a été ajouté.

-- M3 : tuc_v2_drop_permissive_insert_policies
-- Supprime les politiques INSERT publiques rendues obsolètes par les Edge Functions (H8/H9)
-- + Sécurise la fonction rls_auto_enable contre l'exécution publique

-- H8 : call_bookings — plus aucun INSERT direct autorisé depuis anon/authenticated
DROP POLICY IF EXISTS call_bookings_insert_public ON public.call_bookings;

-- H9 : site_analytics — même traitement
DROP POLICY IF EXISTS site_analytics_insert_anyone ON public.site_analytics;

-- Sécuriser rls_auto_enable : retirer l'accès public (SECURITY DEFINER exposée)
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;
