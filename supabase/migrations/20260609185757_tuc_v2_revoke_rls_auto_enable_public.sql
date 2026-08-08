-- Reconstituée en session 34 depuis `supabase_migrations.schema_migrations`
-- (version 20260609185757). Appliquée en production le 2026-06-09, session 19,
-- mais jamais versionnée dans le dépôt — BLOCKER-012.
-- SQL identique à celui exécuté ; seul cet en-tête a été ajouté.

-- M4 : tuc_v2_revoke_rls_auto_enable_public
-- Retire le grant EXECUTE PUBLIC sur rls_auto_enable (event trigger interne).
-- La fonction reste opérationnelle via le mécanisme event trigger PostgreSQL.
-- Supprime l'advisor SECURITY DEFINER exécutable publiquement (BLOCKER H10).
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
