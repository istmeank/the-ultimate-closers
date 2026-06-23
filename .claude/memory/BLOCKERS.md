# BLOCKERS — Registre des blocages

> Tout bug, toute erreur récurrente, toute friction est consignée ici **dès qu'elle apparaît**.
> Une fois résolue, on déplace la solution dans `LEARNINGS.md` et on marque le blocage comme "résolu".

## La boucle (lire avant tout)
1. Tu rencontres un bug ou un obstacle → tu l'inscris ici, immédiatement.
2. Tu cherches la cause racine → tu documentes ce que tu as essayé.
3. Tu trouves la solution → tu la documentes ici.
4. Tu copies la leçon générale dans `LEARNINGS.md` (pour qu'on la retrouve hors contexte).
5. Tu marques le blocage "résolu" avec la date et le lien vers `LEARNINGS.md`.

## Format d'une entrée

```
## BLOCKER-001 — Titre court
- Date : YYYY-MM-DD
- Domaine : (acquisition / messagerie / matching / meet / onboarding / transverse)
- Symptôme : ce qu'on observe
- Hypothèses testées : ce qu'on a essayé et le résultat
- Statut : ouvert | résolu (voir LEARNING-XXX)
- Solution finale : (à remplir à la résolution)
```

---

<!-- Premier blocage à ajouter ici quand il arrive -->

## BLOCKER-001 — Tokens OAuth stockés en clair en DB
- Date : 2026-06-07
- Domaine : transverse (sécurité + intégrations)
- Symptôme : `closer_integrations.access_token`, `closer_integrations.refresh_token`, `google_calendar_tokens.access_token`, `google_calendar_tokens.refresh_token` sont des `TEXT` non chiffrés. Un dump DB = vol des comptes Google/Slack/HubSpot des closers.
- Hypothèses testées : aucune (constat à l'audit baseline).
- Statut : ouvert
- Solution finale : (à remplir) — chiffrement via Supabase Vault ou pgsodium. Décision : peut être différé en Vague 2 si la baseline est appliquée en environnement de dev, MUST avant prod réelle.
- Lien rapport : `docs/security-audit-baseline.md` §3 C2

## BLOCKER-002 — Enum `app_role` incohérent dans migrations Lovable
- Date : 2026-06-07
- Domaine : transverse (sécurité + DB)
- Symptôme : enum créé avec `('admin', 'user')` mais les migrations utilisent `'closer'::app_role` et `'owner'::app_role` qui n'existent pas. Les policies utilisant ces casts peuvent silencieusement ne jamais matcher → fuite de données.
- Hypothèses testées : aucune migration `ALTER TYPE app_role ADD VALUE` trouvée.
- Statut : ouvert
- Solution finale : (à remplir lors de la baseline) — définir l'enum complet `('owner', 'admin', 'closer', 'user')` dès le début dans `00000000000001_baseline.sql`.
- Lien rapport : `docs/security-audit-baseline.md` §3 C1

## BLOCKER-003 — Anti-pattern `auth.uid()` non wrappé partout
- Date : 2026-06-07
- Domaine : transverse (perf + sécurité)
- Symptôme : 90% des policies des 30 migrations utilisent `auth.uid()` au lieu de `(select auth.uid())` → perte de perf jusqu'à 99% sur tables volumineuses (cf. skill `supabase-auth-rls` anti-pattern #5).
- Hypothèses testées : aucune.
- Statut : ouvert
- Solution finale : (à remplir) — réécriture systématique dans baseline.
- Lien rapport : `docs/security-audit-baseline.md` §3 C3

## BLOCKER-004 — Fonction `has_role` redéfinie avec 2 signatures
- Date : 2026-06-07
- Domaine : transverse (sécurité)
- Symptôme : migration `20251023161623` définit `has_role(_user_id UUID, _role public.app_role)` (typage strict), migration `20251026162800` définit `has_role(user_id UUID, role_name TEXT)` (typage TEXT). Overload PostgreSQL → bypass possible si les policies utilisent la version TEXT.
- Hypothèses testées : aucune.
- Statut : ouvert
- Solution finale : (à remplir) — une seule fonction `has_role(uuid, app_role)` typée strict dans baseline.
- Lien rapport : `docs/security-audit-baseline.md` §3 C4

## BLOCKER-005 — `search_path` SECURITY DEFINER sans `pg_temp` en dernier
- Date : 2026-06-07
- Domaine : transverse (sécurité)
- Symptôme : toutes les fonctions DEFINER ont au mieux `SET search_path = public`. Aucune n'inclut `pg_temp` en dernière position → vecteur d'attaque par table temporaire malveillante (skill `postgresql-supabase` §4).
- Hypothèses testées : aucune.
- Statut : ouvert
- Solution finale : (à remplir) — `SET search_path = pg_catalog, public, pg_temp` partout dans baseline.
- Lien rapport : `docs/security-audit-baseline.md` §3 C5

---
## BLOCKER-001 — Tokens OAuth en clair [RÉSOLU — 2026-06-09]
- **Statut** : ✅ RÉSOLU
- **Session** : 18
- **Ce qui a été fait** :
  - M1 `tuc_v2_vault_token_schema` : colonnes TEXT en clair supprimées, remplacées par `access_token_secret_id UUID` + `refresh_token_secret_id UUID` dans `closer_integrations` et `google_calendar_tokens`
  - M2 `tuc_v2_vault_rbac_hardening` : REVOKE ALL sur `vault.secrets` + `vault.decrypted_secrets` pour `anon` et `authenticated`. GRANT SELECT au `service_role` uniquement.
  - Edge Function `store-oauth-token` déployée (ACTIVE) : stocke les tokens dans Vault, persiste les secret_id
  - Edge Function `get-oauth-token` déployée (ACTIVE) : déchiffre just-in-time via `vault.decrypted_secrets`, jamais en cache ni log
- **Skill utilisé** : `secrets-vault-pgsodium`
- **Approche finale** : Vault secrets (UUID pointeurs) plutôt que pgsodium TCE bytea (pgsodium non installé + dépréciation annoncée)
- **Warnings résiduels** : BLOCKER H8/H9 (call_bookings + site_analytics INSERT public) — toujours ouverts. `rls_auto_enable` SECURITY DEFINER — faux positif Supabase interne.

---
## BLOCKER-H8 — INSERT public non protégé sur `call_bookings` [RÉSOLU — 2026-06-09]
- **Statut** : ✅ RÉSOLU
- **Session** : 19
- **Ce qui a été fait** :
  - Edge Function `submit-call-booking` déployée (ACTIVE, verify_jwt: false) : Turnstile optionnel + Sliding Window 3 req/min IP + 1 req/min email via Upstash Redis
  - M3 `tuc_v2_drop_permissive_insert_policies` : DROP POLICY `call_bookings_insert_public` — plus aucun INSERT direct anon/authenticated possible
- **Advisor résolu** : `rls_policy_always_true` sur `call_bookings` disparu

## BLOCKER-H9 — INSERT public non protégé sur `site_analytics` [RÉSOLU — 2026-06-09]
- **Statut** : ✅ RÉSOLU
- **Session** : 19
- **Ce qui a été fait** :
  - Edge Function `track-analytics` déployée (ACTIVE, verify_jwt: false) : Sliding Window 100 req/min IP + 1000 req/h global via Upstash Redis. Auth optionnelle (analytics anonyme autorisé).
  - M3 `tuc_v2_drop_permissive_insert_policies` : DROP POLICY `site_analytics_insert_anyone` — plus aucun INSERT direct anon/authenticated possible
- **Advisor résolu** : `rls_policy_always_true` sur `site_analytics` disparu

## BLOCKER-H10 — `rls_auto_enable` SECURITY DEFINER exécutable publiquement [ouvert]
- Date : 2026-06-09
- Domaine : transverse (sécurité)
- Symptôme : `public.rls_auto_enable()` est SECURITY DEFINER, exécutable par `anon` et `authenticated` via `/rest/v1/rpc/rls_auto_enable`. REVOKE appliqué en M3 mais advisor Supabase toujours présent (cache ou grant PUBLIC résiduel).
- Statut : ouvert — à traiter en M4 (DROP ou SECURITY INVOKER ou déplacement hors schema public)

## BLOCKER-H10 — `rls_auto_enable` SECURITY DEFINER [RÉSOLU — 2026-06-09]
- **Statut** : ✅ RÉSOLU
- **Session** : 19
- **Cause** : GRANT EXECUTE TO PUBLIC résiduel (défaut PostgreSQL). Le REVOKE de M3 ciblait `anon, authenticated` mais pas `PUBLIC`.
- **Fix** : M4 `tuc_v2_revoke_rls_auto_enable_public` — `REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC`
- **Résultat** : 0 advisors de sécurité sur le projet

---
## BLOCKER-002 — Enum `app_role` incohérent [RÉSOLU — 2026-06-10]
- **Statut** : ✅ RÉSOLU
- **Session** : 20 (constat audit — déjà corrigé dans baseline TUC-v2)
- **Solution finale** : migration `tuc_v2_baseline` (2026-06-07) définit l'enum complet `('owner', 'admin', 'closer', 'user')` dès l'origine. Vérifié via `pg_enum` : 4 valeurs présentes.

## BLOCKER-003 — `auth.uid()` non wrappé [RÉSOLU — 2026-06-10]
- **Statut** : ✅ RÉSOLU
- **Session** : 20 (constat audit — déjà corrigé dans baseline TUC-v2)
- **Solution finale** : toutes les policies RLS de TUC-v2 utilisent `( SELECT auth.uid() AS uid)` — forme normalisée par PostgreSQL de `(SELECT auth.uid())`. Vérifié sur 28+ policies via `pg_policies`.

## BLOCKER-004 — Fonction `has_role` double signature [RÉSOLU — 2026-06-10]
- **Statut** : ✅ RÉSOLU
- **Session** : 20 (constat audit — déjà corrigé dans baseline TUC-v2)
- **Solution finale** : une seule fonction `has_role(_user_id uuid, _role app_role)` avec `search_path = pg_catalog, public, pg_temp`. Vérifié via `pg_proc`.

## BLOCKER-005 — `search_path` SECURITY DEFINER sans `pg_temp` [RÉSOLU — 2026-06-10]
- **Statut** : ✅ RÉSOLU
- **Session** : 20
- **Solution finale** :
  - `has_role` et `handle_new_user` : déjà corrects dans baseline
  - `rls_auto_enable` : résidu `search_path=pg_catalog` corrigé via M5 (`tuc_v2_fix_rls_auto_enable_search_path`)
  - Résultat post-M5 : `get_advisors` = 0 advisors sécurité
- **Migration** : `supabase/migrations/20260610000001_tuc_v2_fix_rls_auto_enable_search_path.sql`
