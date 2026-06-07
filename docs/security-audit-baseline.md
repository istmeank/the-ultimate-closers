# AUDIT SÉCURITÉ & SCHÉMA — Baseline TUC-v2

> Rapport d'audit des 30 migrations Lovable + 7 SQL d'audit racine.
> Produit le 2026-06-07 en mode orchestrateur (skills `supabase-auth-rls`, `owasp-saas-supabase`, `postgresql-supabase`).
> Source de vérité pour la construction de `supabase/migrations/00000000000001_baseline.sql`.

## 1. Inventaire des sources scannées

- **30 migrations** dans `supabase/migrations/` (de `20250127000000` à `20251114132807`)
- **7 fichiers SQL d'audit** à la racine (`security-*.sql`, `fix-*.sql`, `verify-*.sql`, `test-*.sql`, `create-master-key-user*.sql`)
- **0 table** sur TUC-v2 actuel (`llxgyomevketvypusafl`) → reconstruction from scratch possible

## 2. Schéma final cumulé (état cible)

### Domaine 0 — Identité & rôles
| Table | Colonnes clés | Notes |
|---|---|---|
| `user_roles` | `id`, `user_id`, `role app_role`, `created_at`, UNIQUE(user_id, role) | Source de vérité RBAC |
| `profiles` | `id` (= auth.users.id), `email`, `full_name`, `avatar_url`, `created_at`, `updated_at`, **+ extensions** : `is_active`, `max_concurrent_leads`, `specialties JSONB`, `bio` | Trigger `handle_new_user` auto-crée à l'inscription |
| `site_content` | `id`, `section_id UNIQUE`, `content_fr/en/ar`, `image_url`, `updated_at`, `updated_by` | CMS du site public |
| `site_analytics` | `id`, `event_type`, `page_path`, `user_id`, `metadata JSONB`, `created_at` | Tracking events publics |
| `formations` | `id`, `title`, `description`, `file_url`, `file_type`, `thumbnail_url`, `duration_minutes`, `order_index`, `is_published`, `created_at`, `updated_at`, `created_by` | Modules de formation closer |

### Domaine 1 — Acquisition & Qualification
| Table | Colonnes clés | Notes |
|---|---|---|
| `leads` | `id`, `full_name`, `email`, `phone`, `source` CHECK, `interest`, `status` CHECK, `owner_id FK profiles`, `score` CHECK 0-100, `created_at`, `updated_at` | **À étendre** : ajouter `tenant_id` ou similaire pour multi-tenant, `deleted_at` (soft delete) |
| `interactions` | `id`, `lead_id FK CASCADE`, `type` CHECK, `content`, `by_user_id FK profiles`, `created_at` | Historique contacts |
| `lead_scores` | `id`, `lead_id FK CASCADE`, `score` CHECK 0-100, `sentiment NUMERIC(3,2)` CHECK -1..1, `features JSONB`, `model`, `updated_at` | Historique scoring IA |

### Domaine 2 — Messagerie (à créer en Vague 3, **PAS dans baseline initiale**)
N'existe pas encore — placeholders prévus dans `docs/domains/02-messagerie-multicanaux/PLAN.md`.

### Domaine 3 — Matching & pilotage closers
| Table | Colonnes clés | Notes |
|---|---|---|
| `closer_assignments` | `id`, `closer_id FK auth.users CASCADE UNIQUE`, `last_assigned_at`, `total_assigned`, `created_at` | Tracking round-robin |
| `closer_integrations` | `id`, `closer_id FK auth.users CASCADE`, `integration_type` CHECK, `access_token`, `refresh_token`, `expires_at`, `is_active`, `created_at`, `updated_at`, UNIQUE(closer_id, integration_type) | **CRITIQUE : tokens en clair** — à chiffrer via pgsodium/vault |

### Domaine 4 — Meet & coaching
| Table | Colonnes clés | Notes |
|---|---|---|
| `call_bookings` | (à reconstruire depuis migration `20251023163747`) | Réservations formulaire public |
| `appointments` | `id`, `lead_id FK CASCADE`, `assigned_to FK profiles`, `start_at`, `end_at`, `channel` CHECK, `status` CHECK, `gcal_event_id`, `auto_assigned`, `created_at` | RDV |
| `deals` | `id`, `lead_id FK CASCADE`, `offer_name`, `amount_cents`, `currency DEFAULT 'EUR'`, `stage` CHECK, `expected_close_date`, `created_at`, `updated_at` | Opportunités commerciales |
| `payments` | `id`, `deal_id FK CASCADE`, `provider` CHECK ('stripe','paypal','cib','edahabia'), `status` CHECK, `amount_cents`, `tx_ref`, `paid_at`, `created_at` | **CRITIQUE** : `tx_ref` exposé en lecture → vérifier RLS |
| `resources` | `id`, `lead_id FK CASCADE`, `title`, `url`, `type` CHECK, `created_at` | Documents partagés client |
| `google_calendar_tokens` | `id`, `user_id FK auth.users CASCADE UNIQUE`, `access_token`, `refresh_token`, `expires_at`, `calendar_email`, `created_at`, `updated_at` | **CRITIQUE : tokens en clair** |

### Domaine 5 — Onboarding & suivi (à créer en Vague 3-4, **PAS dans baseline initiale**)
Tables prévues : `onboarding_paths`, `performance_snapshots`, etc.

### Tables transverses
| Table | Notes |
|---|---|
| `external_sync_log` | Log sync HubSpot. Admin/owner only. |

## 3. Anomalies détectées — classées par sévérité

### 🔴 CRITIQUE (à corriger AVANT toute prod)

| # | Anomalie | Détection | Impact | Action baseline |
|---|---|---|---|---|
| C1 | **Enum `app_role` incohérent** : créé avec `('admin', 'user')` mais les migrations utilisent `'closer'::app_role` et `'owner'::app_role` qui n'existent PAS dans l'enum | Migrations `20251023161623` vs `20251029123034` vs `20251031201031` | Erreur d'exécution silencieuse OU policies qui ne s'appliquent jamais → leads visibles par tous | Définir enum complet dès la baseline : `('owner', 'admin', 'closer', 'user')` |
| C2 | **Tokens OAuth stockés en clair** : `closer_integrations.access_token`, `google_calendar_tokens.access_token/refresh_token` | Migrations `20251029123034`, `20251114132807` | Vol DB = vol des comptes Google/Slack/HubSpot des closers | Activer **pgsodium** ou **Supabase Vault** pour chiffrement au repos |
| C3 | **`auth.uid()` non wrappé dans `(select auth.uid())`** : présent dans 90% des policies | Toutes migrations | Performance dégradée de 99% sur grosses tables (skill `supabase-auth-rls` anti-pattern #5) | Wrapper systématique dans baseline |
| C4 | **Fonction `has_role` redéfinie avec 2 signatures** : `(_user_id UUID, _role app_role)` vs `(user_id UUID, role_name TEXT)` | `20251023161623` vs `20251026162800` | Confusion overload + bypass possible | Une seule fonction `has_role(uuid, app_role)` typée strict |
| C5 | **`search_path` SECURITY DEFINER sans `pg_temp`** : risque d'attaque par table temporaire malveillante | Toutes fonctions DEFINER | Skill `postgresql-supabase` §4 : directive de sécurité violée | `SET search_path = pg_catalog, public, pg_temp` partout |
| C6 | **3 versions de policies contradictoires sur `leads`** en 5 jours | `20251026162800`, `20251026174742`, `20251026174817`, `20251031201031` | Dette technique massive, état réel incertain | Baseline = une seule version finale propre |

### 🟠 HAUTE (à corriger dans baseline mais pas bloquant immédiat)

| # | Anomalie | Action |
|---|---|---|
| H1 | Clause `TO authenticated` manquante dans certaines policies (ex. `20251029123034`) | Ajout systématique dans baseline |
| H2 | Aucun `lock_timeout` dans aucune migration | Ajouter `SET lock_timeout = '5s';` en tête de baseline |
| H3 | Pas de `deleted_at` sur entités métier (`leads`, `appointments`, `deals`) | Ajouter soft delete + policy `USING (deleted_at IS NULL)` |
| H4 | Indexes manquants sur FK : `lead_scores.lead_id`, `resources.lead_id`, `external_sync_log.entity_id` | Index B-Tree systématique |
| H5 | Index manquant sur colonnes filtrées par RLS : `closer_integrations.closer_id`, `google_calendar_tokens.user_id` | Index B-Tree |
| H6 | Pas de trigger `update_updated_at_column()` sur certaines tables | Trigger générique appliqué partout où il y a `updated_at` |
| H7 | RBAC repose sur table `user_roles` (1 JOIN par requête) → recommandation skill : utiliser `app_metadata` JWT | À évaluer post-baseline (gros refactor) |
| H8 | Policy `Anyone can insert analytics` sans rate limiting → vecteur d'abus | Ajouter rate limit Edge Function + cap par IP |
| H9 | Policy `call_bookings`/INSERT publique → spam possible | Idem rate limit |

### 🟡 MOYENNE

| # | Anomalie | Action |
|---|---|---|
| M1 | Tables sans `tenant_id` → multi-tenant futur compromis | Ajouter `tenant_id` ou prévoir migration plus tard |
| M2 | Pas de `CHECK` sur format email/phone | Ajouter `CHECK (email ~* '^...@...')` |
| M3 | Pas de constraint sur longueur des `TEXT` | `CHECK (length(full_name) BETWEEN 2 AND 100)` etc. |
| M4 | Migration `20250127000000` à `20250127000006` créées AVANT les tables qu'elles modifient → preuve de chaos chronologique | Ignorer ces migrations, baseline les remplace toutes |
| M5 | Buckets storage créés sans policy de taille max ni type MIME | Ajouter policies + max upload size |
| M6 | Triggers `handle_new_user` et `auto_assign_closer_to_lead` sans test idempotent | Tester avec `supabase db reset` |

### 🟢 BASSE

| # | Anomalie | Action |
|---|---|---|
| B1 | Pas de seed.sql pour reset local | Créer un seed minimal (1 owner, 1 admin, 1 closer test) |
| B2 | Nommage policies incohérent (snake_case vs Phrase) | Standardiser sur `<table>_<action>_<scope>` |
| B3 | Commentaires français mélangés à des termes anglais | Acceptable, code = anglais, commentaires de contexte = FR OK |

## 4. Tables manquantes par rapport aux 5 domaines TUC

| Domaine | Tables ABSENTES de la baseline mais prévues | Vague de création |
|---|---|---|
| 2 — Messagerie | `conversations`, `messages`, `channel_configs`, `opt_in_logs` | Vague 3 |
| 3 — Matching | `closer_profiles` (profil personnalité), `prospect_profiles`, `matches` | Vague 3 |
| 4 — Meet | `briefings`, `transcripts`, `coaching_feedbacks` | Vague 2-3 |
| 5 — Onboarding | `onboarding_paths`, `onboarding_steps`, `performance_snapshots`, `recommendations` | Vague 3-4 |

→ **La baseline initiale ne crée QUE ce qui est utilisé actuellement par le code frontend** (Domain 0, 1, 3 partiel, 4 partiel). Les autres tables seront créées au fur et à mesure des besoins (migrations incrémentales).

## 5. Plan de baseline `00000000000001_baseline.sql`

Structure recommandée (sera produite par `database-postgres` + `auth-security-rls` en collaboration) :

```sql
-- Section 1 — Setup
SET lock_timeout = '5s';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- (pgsodium si on chiffre les tokens OAuth dès maintenant)

-- Section 2 — Types/Enums
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'closer', 'user');

-- Section 3 — Fonctions utilitaires (avant tables car triggers)
-- update_updated_at_column() avec search_path sécurisé
-- has_role(uuid, app_role) typée strict
-- handle_new_user() pour auto-création profile

-- Section 4 — Tables Domain 0 (Identité)
-- user_roles, profiles (+ extensions), site_content, site_analytics, formations

-- Section 5 — Tables Domain 1 (Acquisition)
-- leads (+ deleted_at + tenant_id ?), interactions, lead_scores

-- Section 6 — Tables Domain 3 (Matching)
-- closer_assignments, closer_integrations (tokens chiffrés)

-- Section 7 — Tables Domain 4 (Meet)
-- call_bookings, appointments, deals, payments, resources, google_calendar_tokens

-- Section 8 — Tables transverses
-- external_sync_log

-- Section 9 — Indexes (B-Tree sur toutes FK + colonnes RLS)

-- Section 10 — Triggers (update_updated_at + auto_assign_closer + handle_new_user)

-- Section 11 — RLS (ENABLE + policies optimisées avec (select auth.uid()))

-- Section 12 — Storage buckets (site-images, formations, avatars) + policies

-- Section 13 — Seed minimal (référencé depuis seed.sql)
```

## 6. Conformité checklist 15 points (skill `supabase-auth-rls`)

| # | Item | Avant baseline | Après baseline (cible) |
|---|---|---|---|
| 1 | RLS activée sur 100% tables publiques | ✅ (a priori) | ✅ |
| 2 | Pas de `service_role` côté frontend | ⚠️ à vérifier dans `src/` | ✅ |
| 3 | Index B-Tree sur colonnes RLS | ⚠️ partiel | ✅ |
| 4 | Wrapping `(select auth.uid())` | ❌ | ✅ |
| 5 | Clause `TO authenticated`/`TO anon` | ⚠️ partiel | ✅ |
| 6 | Vues `security_invoker=true` (PG 15+) | N/A (pas de vue) | ✅ si vues créées |
| 7 | Vues hors public si PG < 15 | N/A (PG 17) | N/A |
| 8 | Rôles dans `app_metadata` | ❌ (utilise table) | ⚠️ migration future (gros refactor) |
| 9 | `USING` + `WITH CHECK` sur UPDATE | ⚠️ partiel | ✅ |
| 10 | `ON DELETE CASCADE` sur FK vers `auth.users` | ✅ | ✅ |
| 11 | `search_path` SECURITY DEFINER avec `pg_temp` | ❌ | ✅ |
| 12 | Audit SECURITY DEFINER hors public exposé | ✅ | ✅ |
| 13 | Filtres redondants côté client | ⚠️ à vérifier `src/` | ✅ recommandation `auditeur-qualite` |
| 14 | JWT < 4 KB | ✅ (peu de claims) | ✅ |
| 15 | `getClaims()` au lieu de `getSession()` SSR | ⚠️ pas de SSR Vite | N/A |

**Score cible baseline** : **13/15** (les items 8 et 13 demandent un refactor frontend et seront traités en Vague 2).

## 7. Recommandations post-baseline

1. **Lancer `get_advisors`** sur TUC-v2 après apply pour détecter failles résiduelles (advisor security + performance).
2. **Générer `generate_typescript_types`** pour le frontend après baseline → fichier `src/lib/database.types.ts`.
3. **Créer BLOCKER pour C2** (tokens en clair) : doit être traité avant production réelle, peut attendre Vague 2 pour pgsodium/vault.
4. **Créer ADR-001** : modèle RBAC retenu (owner > admin > closer > user, via table `user_roles` jusqu'à migration vers `app_metadata`).
5. **Auditer `src/`** : `grep -r "service_role" src/` pour confirmer 0 occurrence.

## 8. Verdict

**État actuel** : ⚠️ **dette technique massive** (30 migrations, 3 versions contradictoires de policies leads, enum incohérent, tokens en clair).

**Faisabilité baseline propre** : ✅ **OUI** sur TUC-v2 (vierge). Effort estimé 4-6 heures pour la rédaction de `00000000000001_baseline.sql` + validation locale + `apply_migration`.

**Risque résiduel post-baseline** : faible si les 6 anomalies critiques sont toutes corrigées dans la baseline et si `get_advisors` retourne 0 alerte.
