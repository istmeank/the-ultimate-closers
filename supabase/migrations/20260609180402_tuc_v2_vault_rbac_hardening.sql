-- Reconstituée en session 34 depuis `supabase_migrations.schema_migrations`
-- (version 20260609180402). Appliquée en production le 2026-06-09, session 18,
-- mais jamais versionnée dans le dépôt — BLOCKER-012.
-- SQL identique à celui exécuté ; seul cet en-tête a été ajouté.

-- ============================================================
-- BLOCKER-001 — M2 : RBAC Vault hardening
-- Objectif : aucun rôle public ne peut lire vault.secrets
-- ni vault.decrypted_secrets — service_role uniquement
-- Anti-pattern #5 du skill secrets-vault-pgsodium
-- ============================================================

SET lock_timeout = '5s';

-- Révoquer tout accès sur vault.secrets
REVOKE ALL PRIVILEGES ON vault.secrets           FROM anon;
REVOKE ALL PRIVILEGES ON vault.secrets           FROM authenticated;
REVOKE ALL PRIVILEGES ON vault.decrypted_secrets FROM anon;
REVOKE ALL PRIVILEGES ON vault.decrypted_secrets FROM authenticated;

-- S'assurer que service_role conserve son accès (lecture)
GRANT SELECT, INSERT, UPDATE, DELETE ON vault.secrets TO service_role;
GRANT SELECT                         ON vault.decrypted_secrets TO service_role;

-- Révoquer aussi sur le schéma vault pour être exhaustif
REVOKE USAGE ON SCHEMA vault FROM anon;
REVOKE USAGE ON SCHEMA vault FROM authenticated;

-- Garder service_role
GRANT USAGE ON SCHEMA vault TO service_role;
