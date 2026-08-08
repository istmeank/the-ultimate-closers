# Migrations TUC-v2 — état de correspondance avec la production

> Mis à jour en session 34 (2026-08-08), à la clôture de BLOCKER-012.
> Projet Supabase : `llxgyomevketvypusafl`

## Ce que ce dossier garantit

Ce dossier doit permettre de **reconstruire la base de production depuis zéro**.
C'est sa seule raison d'être. Un dossier de migrations qui ne reconstruit pas la
production ne documente rien — il donne l'illusion de documenter.

## Ce qui a été corrigé en session 34

**Six migrations de sécurité manquaient.** Elles avaient été appliquées en
production (sessions 9, 11, 18, 19) sans jamais être versionnées. Une base
reconstruite depuis ce dossier stockait donc les jetons OAuth **en clair** et
conservait des politiques d'insertion publiques non protégées. Elles ont été
récupérées mot pour mot depuis `supabase_migrations.schema_migrations`.

**Trente migrations Lovable de 2025 ont été supprimées.** Elles n'ont jamais été
appliquées sur TUC-v2 — la production commence au 7 juin 2026. Pire, leurs
horodatages de 2025 les plaçaient **avant** la baseline censée les remplacer :
toute reconstruction aurait rejoué le chaos dont le projet est sorti en session 8
(30 migrations contradictoires, 6 anomalies critiques). Elles restent accessibles
dans l'historique Git, avant le commit qui les retire.

**Quatre fichiers ont été renommés** pour porter la version exacte enregistrée en
production. Sans cela, un `supabase db push` aurait tenté de rejouer des
migrations déjà appliquées sous un autre numéro.

## Correspondance dépôt ↔ production

| Fichier | Version en production | Note |
|---|---|---|
| `00000000000001_baseline.sql` | `20260607194643` + `20260607194749` | Voir ci-dessous |
| `20260607194841_tuc_v2_security_hardening.sql` | `20260607194841` | ✓ |
| `20260608163636_tuc_v2_enforce_lead_owner.sql` | `20260608163636` | ✓ |
| `20260609175708_tuc_v2_vault_token_schema.sql` | `20260609175708` | ✓ |
| `20260609180402_tuc_v2_vault_rbac_hardening.sql` | `20260609180402` | ✓ |
| `20260609185416_tuc_v2_drop_permissive_insert_policies.sql` | `20260609185416` | ✓ |
| `20260609185757_tuc_v2_revoke_rls_auto_enable_public.sql` | `20260609185757` | ✓ |
| `20260610182204_tuc_v2_fix_rls_auto_enable_search_path.sql` | `20260610182204` | ✓ |
| `20260808162829_tuc_v2_extend_app_role_enum.sql` | `20260808162829` | ✓ |
| `20260808162849_tuc_v2_manager_read_and_reassign.sql` | `20260808162849` | ✓ |
| `20260808163211_tuc_v2_grant_founder_roles.sql` | `20260808163211` | ✓ |

### La seule divergence restante : la baseline

Le fichier `00000000000001_baseline.sql` est **monolithique**. En production, il
correspond à deux migrations, parce que la première tentative d'application avait
échoué : `has_role` y était créée avant la table `user_roles`, et PostgreSQL
valide le corps d'une fonction `LANGUAGE SQL` dès sa création (LEARNING-011). Elle
avait donc été découpée en trois.

Le contenu SQL est équivalent, l'ordre d'exécution diffère. Sur une base neuve, le
fichier monolithique **échouerait** pour la raison exacte qui avait imposé le
découpage.

**Conséquence pratique** : ce dossier ne reconstruit pas encore une base vierge en
une passe. Découper la baseline en trois fichiers portant les versions de
production reste à faire — c'est la dernière étape de BLOCKER-012.

## Règle pour la suite

Toute migration appliquée en production doit exister ici, avec la même version.
Le contrôle tient en une requête :

```sql
SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;
```

Comparez avec `ls supabase/migrations/`. Tout écart est un incident, pas un détail.
La cause de BLOCKER-012 n'était pas une négligence ponctuelle : appliquer une
migration par `apply_migration` **n'écrit aucun fichier**. Les deux gestes sont
distincts, et rien ne le rappelle au moment où on les oublie.
