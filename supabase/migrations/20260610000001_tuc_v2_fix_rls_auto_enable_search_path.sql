-- M5 — Fix search_path de rls_auto_enable (BLOCKER-005 résidu)
-- Appliquée : 2026-06-10 (Session 20)
-- Contexte : rls_auto_enable() est SECURITY DEFINER avec search_path=pg_catalog uniquement.
-- La doctrine TUC impose pg_catalog, public, pg_temp sur toutes les fonctions SECURITY DEFINER
-- pour prévenir les attaques par table temporaire malveillante (skill postgresql-supabase §4).
-- Le REVOKE EXECUTE FROM PUBLIC (M4) mitige déjà le risque — ce fix complète la conformité.

ALTER FUNCTION public.rls_auto_enable()
  SET search_path = pg_catalog, public, pg_temp;
