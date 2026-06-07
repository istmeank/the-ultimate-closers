# DECISIONS — Architecture Decision Records (ADR)

> Chaque décision structurante du projet TUC est consignée ici.
> Format : ADR léger. On ne supprime jamais une décision, on l'annote "superseded by ADR-XXX" si elle change.

## Pourquoi ce registre
Pour qu'aucune décision importante ne soit perdue, contredite par accident, ou refaite sans raison. La cohérence du projet en dépend.

## Format d'une entrée

```
## ADR-001 — Titre court de la décision
- Date : YYYY-MM-DD
- Statut : proposée | acceptée | refusée | superseded by ADR-XXX
- Contexte : pourquoi la question se pose
- Décision : ce qu'on choisit, en une phrase
- Conséquences : ce que ça change, ce qu'on accepte de perdre
- Alternatives écartées : ce qu'on a regardé et pourquoi on n'a pas pris
```

---

<!-- Première décision à ajouter ici quand elle arrive -->

## ADR-001 — Architecture RBAC + RLS pour TUC-v2
- Date : 2026-06-07
- Statut : acceptée
- Contexte : TUC-v2 (Supabase llxgyomevketvypusafl) doit garantir une isolation stricte des données entre owners, admins, closers et leurs leads, sans aucune faille RLS et conformément OWASP 2025. Le legacy Lovable contenait 30 migrations chaotiques avec 6 anomalies critiques (enum incohérent, has_role doublé, auth.uid() non wrappé, search_path non sécurisé, USING true non justifiés, tokens en clair).
- Décision : adopter le modèle RBAC hiérarchique `owner > admin > closer > user` (enum app_role 4 valeurs) + table `user_roles` source de vérité + fonction `has_role(uuid, app_role)` SECURITY DEFINER avec search_path restreint (pg_catalog, public, pg_temp). RLS optimisée : `(select auth.uid())` wrappée systématiquement (perf +99%), clause `TO authenticated/anon` partout, `USING` + `WITH CHECK` séparés sur UPDATE/INSERT, soft delete (`deleted_at`) sur leads/appointments/deals avec partial indexes. SECURITY DEFINER REVOKE EXECUTE FROM anon/authenticated (utilisable uniquement par triggers/policies). Stockage : 3 buckets (avatars public read URL-only, formations admin-only, site-images public). 17 tables, 41 policies RLS, 66 indexes, 3 migrations versionnées appliquées sur TUC-v2 (tuc_v2_baseline, tuc_v2_rls_policies_and_storage, tuc_v2_security_hardening).
- Conséquences : modèle stable et performant pour MVP. RBAC stocké en table → 1 JOIN par requête RLS (acceptable jusqu'à ~10k users actifs). Migration vers `app_metadata` JWT reportée Vague 3 (gros refactor Auth Hook + frontend). Tokens OAuth en clair acceptés en MVP avec BLOCKER-001 ouvert (à chiffrer via pgsodium/Vault avant prod réelle).
- Alternatives écartées : (a) RBAC via JWT app_metadata dès baseline → rejeté car nécessite Auth Hook custom + refactor frontend (trop coûteux pour Vague 1) ; (b) un seul rôle `admin` sans hiérarchie → rejeté car ne permet pas la distinction owner/closer/user requise par le produit ; (c) RLS sans wrapping `(select auth.uid())` → rejeté car perte de perf 99% sur grosses tables documentée par le skill `supabase-auth-rls`.
- Conformité skill `supabase-auth-rls` : 13/15 checklist (items manquants : RBAC JWT app_metadata et getClaims SSR — N/A pour Vite SPA).
- Lien rapport audit : `docs/security-audit-baseline.md`
- Lien BLOCKERS ouverts : BLOCKER-001 (tokens), H8/H9 (rate limit INSERT public)
