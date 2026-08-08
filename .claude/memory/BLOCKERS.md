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

---

## BLOCKER-008 — index.lock git bloqué (NTFS)

**Date** : 2026-06-23  
**Statut** : ouvert  
**Agent** : orchestrateur (session 32)

### Symptôme
`fatal: Unable to create '.git/index.lock': File exists` — le sandbox Linux ne peut pas supprimer un lock créé sur NTFS Windows.

### Cause probable
Le hook `snapshot-git.sh` (P22 — Stop hook) a créé un lock lors d'une session précédente et ne l'a pas libéré (session interrompue ou contexte saturé).

### Action requise de Nacer
Dans un terminal Windows (PowerShell ou CMD) :
```powershell
# PowerShell
Remove-Item "D:\GitHub\the-ultimate-closers\.git\index.lock" -Force

# Puis commit :
git -C "D:\GitHub\the-ultimate-closers" add .claude/agents/orchestrateur.md docs/infrastructure-decision.md .claude/memory/DECISIONS.md .claude/memory/JOURNAL.md .claude/memory/BLOCKERS.md
git -C "D:\GitHub\the-ultimate-closers" commit -m "feat: squelette Silicate v0.6 complet - P16/P16-B/P18/P21 + ADR-032/033 - Score 23/23"
```

### Résolution
Marquer BLOCKER-008 `résolu` après exécution.

---

## BLOCKER-009 — 265 fichiers marqués modifiés sans changement de contenu (CRLF)

**Date** : 2026-07-25
**Statut** : ouvert
**Gravité** : moyenne — n'empêche rien, mais rend tout `git diff` illisible et masque les vraies modifications

### Constat
`git status --porcelain` retourne 265 fichiers modifiés dans TUC tech, dont des fichiers auxquels personne n'a touché depuis des semaines (`CNAME`, `AUTH-PAGE-FIX.md`, `.gitignore`, l'ensemble de `.claude/`). Le diff de `CNAME` affiche 1 insertion et 1 suppression pour une ligne dont le contenu visible est identique — signature classique d'un changement de fin de ligne CRLF / LF.

`.gitattributes` est **absent** du dépôt.

### Cause probable
Normalisation des fins de ligne entre Windows et les outils qui écrivent dans le dépôt, sans `.gitattributes` pour arbitrer.

### Ce que ça coûte
Toute revue de diff devient impraticable : une modification réelle de trois lignes se noie dans 265 fichiers de bruit. C'est un obstacle direct à la règle d'or, dont la première porte est « relis ton diff ».

### Note importante — la solution existe déjà dans le réseau
**LULG tech a rencontré et résolu exactement ce problème** : cf. `LEARNING-004` de LULG (« Un `git diff` massif n'est pas toujours un vrai diff »), résolu par l'ajout d'un `.gitattributes`. La leçon a été capitalisée dans LULG mais **jamais propagée à TUC**.

C'est un défaut de circulation de la mémoire entre entités sœurs du réseau Silicate : deux dépôts gouvernés par le même squelette, l'un ayant la réponse au problème de l'autre, sans mécanisme de transfert.

### Action requise de Nacer
1. Créer `.gitattributes` à la racine de TUC tech, en s'inspirant de celui de LULG tech.
2. Relancer la normalisation : `git add --renormalize .` puis un commit dédié `chore: normalisation des fins de ligne (.gitattributes)`, séparé de tout commit fonctionnel.
3. Vérifier que `git status` redevient propre avant de committer les changements AEO de la session 33.

### Résolution
Marquer `résolu` après normalisation, et ajouter un LEARNING sur la propagation des leçons entre entités sœurs.

---

## BLOCKER-009 — statut : RÉSOLU (2026-08-08, session 34)
`.gitattributes` créé (`* text=auto eol=lf` + exceptions Windows et binaires),
renormalisation effectuée dans un commit dédié `fc8675c`, séparé de tout commit
fonctionnel. Contrôle : `git diff --cached --ignore-cr-at-eol` ne retournait que
`.gitattributes` lui-même — aucun contenu modifié. `git status` est revenu propre.
Leçon de propagation entre entités sœurs capitalisée en LEARNING-087.

---

## BLOCKER-010 — Le front connaît six rôles, la base n'en accepte que quatre
**Ouvert** — 2026-08-08 (session 34)
**Gravité** : haute — erreur d'exécution garantie dès qu'un rôle absent de l'enum est écrit

### Constat
`src/lib/services/auth.service.ts` déclare six rôles :
`owner | admin | developer | closer | client | user`.
L'enum PostgreSQL `app_role` (baseline, ADR-001) n'en contient que quatre :
`owner | admin | closer | user`.

`developer` et `client` sont utilisés dans le code de routage
(`useAuth.tsx` choisit `developer` comme rôle principal, `UnifiedSidebar.tsx` et
`ProtectedRoute.tsx` filtrent dessus). Toute écriture de l'un de ces deux rôles
dans `user_roles` échoue en `invalid input value for enum app_role` (22P02).

Aggravant : le type `AppRole` est redéclaré à l'identique dans trois composants
au lieu d'être importé du service. Une correction de l'enum ne se propagera pas.

### Ce que ça coûte
Un utilisateur à qui l'on tenterait d'attribuer le rôle `developer` ou `client`
ne peut pas être créé. Le front est en avance sur la base — écart introduit sans
migration correspondante.

### Action requise
1. **T03** (`database-postgres`) : migration d'extension de l'enum `app_role`.
   Rappel : `ALTER TYPE ... ADD VALUE` ne s'exécute pas dans un bloc transactionnel
   sur les versions concernées — migration dédiée.
2. Décider en amont si `client` et `developer` sont réellement des rôles de
   sécurité, ou seulement des vues d'interface. Si ce sont des vues, ils n'ont
   rien à faire dans l'enum et la correction se fait côté front.
3. Supprimer les trois redéclarations locales de `AppRole` au profit de l'import
   depuis `@/lib/services/auth.service`.

### Détection
Écart relevé lors de l'audit T28 en croisant les types du front avec la baseline SQL.
Aucun test ne le couvrait — aucun test n'existait.

---

## NOTE DE REGISTRE — 2026-08-08 (session 34) — Deux séries de numérotation, et un statut trompeur

Signalé par Nacer : « il y a deux blocker h10 ».

### 1. `BLOCKER-H10` apparaît deux fois — le blocage est CLOS
- L'entrée d'ouverture (2026-06-09) porte encore `[ouvert]` **dans son titre**.
- Sa résolution est l'entrée immédiatement suivante : session 19,
  `REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC` (migration M4),
  résultat : 0 advisor de sécurité sur le projet.

**Statut faisant foi : CLOS depuis le 2026-06-09.** Aucune action requise.

Le titre d'ouverture n'est pas corrigé en place : ce registre est append-only, et la
protection l'a d'ailleurs refusé. C'est cette note qui fait foi. `BLOCKER-H10` est le
seul blocage du fichier dont le titre d'ouverture affiche un statut — c'est ce qui le
fait ressortir comme actif à toute relecture ou recherche, alors que les autres
(001 à 005, 009) laissent leur clôture parler seule.

**Leçon de forme** : ne pas inscrire de statut dans un titre au sein d'un registre
append-only. Le statut vit dans le corps de l'entrée, ou dans une entrée de clôture.
Un titre est immuable ; un statut ne l'est pas.

### 2. `BLOCKER-H10` et `BLOCKER-010` sont deux blocages sans aucun rapport
Deux séries cohabitent dans ce fichier :

| Série | Origine | Membres | Sens |
|---|---|---|---|
| `H` + numéro | Audit sécurité de la baseline (sessions 7 à 19) | H8, H9, H10 | `H` = gravité **haute** dans le rapport `docs/security-audit-baseline.md` |
| Numérique | Série générale du projet | 001 à 005, 008, 009, 010 | Ordre chronologique d'apparition |

- `BLOCKER-H10` → fonction `rls_auto_enable` exécutable publiquement. **Clos.**
- `BLOCKER-010` → le front utilise les rôles `developer` et `client`, absents de
  l'enum `app_role`. **Ouvert**, conditionne T03.

Aucun renommage : renommer un blocage historique réécrirait la mémoire.

**Convention pour la suite** : la série `H` est close et ne sera pas rouverte. Tout
nouveau blocage prend un numéro de la série générale, à partir de `BLOCKER-011`.
Les numéros 006 et 007 n'ont jamais été attribués — le trou est historique, on ne le
comble pas rétroactivement.

---

## BLOCKER-010 — mise à jour de statut (2026-08-08, session 34)

**Statut : partiellement traité — en attente d'application sur la base.**

Décidé par Nacer (ADR-036) : sept rôles cumulables
`owner · admin · manager · closer · developer · client · user`.

**Fait** :
- Front aligné — `AppRole` étendu et documenté dans `auth.service.ts`, devenu
  source de vérité unique. Les trois redéclarations locales du type
  (`ProtectedRoute`, `RoleSwitcher`, `UnifiedSidebar`) sont supprimées au profit
  d'un import : une correction de l'enum se propage désormais partout.
- Migrations écrites : extension de l'enum, puis attribution des rôles fondateur.

**Reste à faire pour clore** :
1. Nacer crée le compte `abdenacer.maredj@theultimateclosers.com` — la création
   d'un compte suppose un mot de passe, elle ne se délègue pas à un agent.
2. Application des deux migrations sur TUC-v2 (session disposant du MCP Supabase,
   ou tableau de bord). Aucun accès Supabase depuis la session Cowork.
3. Vérification : `SELECT unnest(enum_range(NULL::public.app_role));` → 7 valeurs,
   et `user_roles` contenant `owner` + `admin` pour le compte fondateur.

**Ne pas clore avant** : l'écriture des politiques RLS pour `manager`, `developer`
et `client` (tâche T03, `auth-security-rls`). En l'état, ces trois rôles existent
sans aucun droit — inoffensif, mais inutilisable.
