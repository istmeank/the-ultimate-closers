-- Reconstituée en session 34 depuis `supabase_migrations.schema_migrations`
-- (version 20260609175708). Appliquée en production le 2026-06-09, session 18,
-- mais jamais versionnée dans le dépôt — BLOCKER-012.
-- C'est la migration qui résout BLOCKER-001 (jetons OAuth en clair) : son absence
-- du dépôt signifiait qu'un environnement reconstruit depuis Git aurait stocké
-- les jetons en clair.
-- SQL identique à celui exécuté ; seul cet en-tête a été ajouté.

-- ============================================================
-- BLOCKER-001 — M1 : Remplacement des tokens OAuth en clair
-- par des pointeurs Vault (secret_id UUID)
-- Tables: closer_integrations + google_calendar_tokens
-- Approche: Supabase Vault (supabase_vault v0.3.1 installé)
-- pgsodium TCE écarté (non installé + dépréciation annoncée)
-- Toutes les tables ont 0 lignes → migration schéma pure
-- ============================================================

SET lock_timeout = '5s';

-- ----------------------------------------------------------------
-- 1. closer_integrations : accès_token + refresh_token → secret_id
-- ----------------------------------------------------------------

-- Ajouter les colonnes UUID pointant vers vault.secrets
ALTER TABLE public.closer_integrations
  ADD COLUMN access_token_secret_id  UUID,
  ADD COLUMN refresh_token_secret_id UUID; -- nullable comme refresh_token

-- Supprimer les colonnes en clair
-- (0 lignes confirmé via list_tables — aucune donnée perdue)
ALTER TABLE public.closer_integrations
  DROP COLUMN access_token,
  DROP COLUMN refresh_token;

-- Contrainte NOT NULL sur access_token_secret_id
-- (le refresh est optionnel, comme l'était refresh_token)
ALTER TABLE public.closer_integrations
  ALTER COLUMN access_token_secret_id SET NOT NULL;

-- Index pour lookup rapide par closer_id (déjà existant sur closer_id)
-- Index sur les secret_id pour les lookups Vault
CREATE INDEX IF NOT EXISTS closer_integrations_access_secret_idx
  ON public.closer_integrations (access_token_secret_id);

CREATE INDEX IF NOT EXISTS closer_integrations_refresh_secret_idx
  ON public.closer_integrations (refresh_token_secret_id)
  WHERE refresh_token_secret_id IS NOT NULL;

-- ----------------------------------------------------------------
-- 2. google_calendar_tokens : access_token + refresh_token → secret_id
-- ----------------------------------------------------------------

ALTER TABLE public.google_calendar_tokens
  ADD COLUMN access_token_secret_id  UUID,
  ADD COLUMN refresh_token_secret_id UUID;

ALTER TABLE public.google_calendar_tokens
  DROP COLUMN access_token,
  DROP COLUMN refresh_token;

ALTER TABLE public.google_calendar_tokens
  ALTER COLUMN access_token_secret_id SET NOT NULL,
  ALTER COLUMN refresh_token_secret_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS gct_access_secret_idx
  ON public.google_calendar_tokens (access_token_secret_id);

CREATE INDEX IF NOT EXISTS gct_refresh_secret_idx
  ON public.google_calendar_tokens (refresh_token_secret_id);

-- ----------------------------------------------------------------
-- 3. Commentaires explicites pour les futurs agents
-- ----------------------------------------------------------------

COMMENT ON COLUMN public.closer_integrations.access_token_secret_id IS
  'UUID pointant vers vault.secrets. Déchiffrement via vault.decrypted_secrets (service_role uniquement). JAMAIS exposé via PostgREST public.';

COMMENT ON COLUMN public.closer_integrations.refresh_token_secret_id IS
  'UUID pointant vers vault.secrets. Nullable (certaines intégrations ne fournissent pas de refresh token).';

COMMENT ON COLUMN public.google_calendar_tokens.access_token_secret_id IS
  'UUID pointant vers vault.secrets. Déchiffrement via Edge Function get-token uniquement.';

COMMENT ON COLUMN public.google_calendar_tokens.refresh_token_secret_id IS
  'UUID pointant vers vault.secrets. Utilisé pour le refresh automatique du access_token Google.';
