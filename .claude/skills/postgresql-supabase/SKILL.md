---
name: postgresql-supabase
description: Expertise d'architecte sénior pour la conception de schémas PostgreSQL et le workflow de migration Supabase ("Database-as-Code"). Utilise systématiquement ce skill dès qu'il est question de schéma SQL, migration Supabase, supabase db push/reset/diff, supabase migration list/new/repair, indexes (B-Tree, GIN, BRIN, GiST), EXPLAIN ANALYZE, VACUUM, fonctions Postgres, RPC, triggers, JSONB, UUID, timestamptz, soft delete, hard delete, audit columns, lock_timeout, SECURITY DEFINER, search_path, performance Postgres, ou toute conception/audit/optimisation d'une base PostgreSQL Supabase. Inclut 10 principes schéma sain, workflow migration complet, stratégie indexation, arbitrage fonctions Postgres vs Edge Functions, patterns triggers, optimisation, types utiles, stratégies de suppression, audit timestamps, checklist 12 points avant merge.
---

# Guide de Référence Stratégique : Architecture Postgres et Workflow Supabase pour Agents IA

En tant qu'Architecte de Solutions Sénior, on pose un postulat non-négociable : la rigueur sémantique d'un schéma Postgres n'est pas une préférence esthétique, mais le garant absolu de l'intégrité des données et de la scalabilité d'un système. Pour un agent IA ou un système autonome, un schéma ambigu est une source de défaillance critique. Ce document définit les directives architecturales impératives pour tout environnement Supabase professionnel.

## 1. Les 10 principes fondamentaux d'un schéma Postgres sain

La qualité structurelle d'une base de données détermine la viabilité des couches applicatives supérieures. Tout écart par rapport à ces principes doit être justifié par une analyse d'exception documentée.

- **Mandat de normalisation et clés** :
  - **Clés primaires (PK)** : aucune table ne doit exister sans une clé primaire unique.
  - **Clés étrangères (FK)** : la cohérence référentielle doit être forcée au niveau du moteur Postgres via des `FOREIGN KEY`. Toute relation entre tables sans contrainte explicite est une dette technique immédiate.
- **Défense de l'intégrité par les contraintes** : utiliser les contraintes comme première ligne de défense contre la corruption applicative.
  - `NOT NULL` : obligatoire pour tout champ dont l'absence invalide la logique métier.
  - `UNIQUE` : pour prévenir les collisions de données métier (emails, slugs).
  - `CHECK` : indispensable pour valider les domaines de valeurs (ex. `prix > 0`, `date_fin > date_debut`).
- **Conventions de nommage** : adopter une nomenclature `snake_case` constante, au pluriel pour les tables (`profiles`, `leads`) et explicite pour les colonnes. L'IA doit pouvoir inférer la nature d'une donnée par son simple nom.

## 2. Maîtrise du workflow de migration Supabase — du local à la production

L'approche "Database-as-Code" est l'unique méthode tolérée pour garantir la parité des environnements. Toute modification manuelle sur un environnement distant ("Remote") est une violation de la **Golden Rule**.

### Diagnostic et cycle de vie

1. **Étape de diagnostic (Step 1)** : avant toute action, exécuter `supabase migration list`. C'est l'outil primaire pour identifier où les environnements divergent et valider l'historique appliqué.
2. **Développement local** : les changements sont initiés via `supabase migration new <nom>`. Pour repartir d'un état sain, `supabase db reset` réapplique l'intégralité des migrations et peuple la base avec `supabase/seed.sql`.
3. **Capture par diffing** : si des modifications sont faites via le Dashboard local, utiliser `supabase db diff --local > migrations/timestamp_name.sql` pour capturer l'état réel.
4. **Sécurité des migrations (locking)** : pour les environnements à fort trafic, insérer `SET lock_timeout = '5s';` en tête des fichiers SQL. Cela évite le "migration queuing" qui peut bloquer toutes les transactions entrantes et provoquer un temps d'arrêt applicatif.
5. **Déploiement et réparation** : pousser les changements via `supabase db push`. En cas de désynchronisation de l'historique, utiliser `supabase migration repair` pour marquer une migration comme appliquée (ou non) sans réexécuter le SQL, afin de réaligner la table `schema_migrations`.

## 3. Stratégie d'indexation — performance et mesure

L'indexation est un arbitrage stratégique : gain de vitesse en lecture versus coût en écriture et stockage.

- **B-Tree (par défaut)** : mandaté pour les recherches d'égalité (`=`) et de plages de valeurs.
- **Index spécialisés** :
  - **GIN** : obligatoire pour les colonnes `JSONB` et la recherche textuelle (Full-text search).
  - **BRIN** : à privilégier pour les tables massives (> 1M de lignes) stockées séquentiellement (ex. logs temporels), offrant un stockage ultra-compact.
  - **GiST / Hash** : à utiliser pour les données géospatiales (PostGIS) ou les comparaisons d'égalité simples sur de larges chaînes de caractères.
- **Validation par l'analyse** : ne jamais présumer de l'efficacité d'un index. Utiliser la commande `EXPLAIN` (ou `EXPLAIN ANALYZE` en environnement de test) pour confirmer que le planificateur Postgres ne réalise pas un "Sequential Scan" sur une requête critique.

## 4. Logique applicative — fonctions Postgres vs Edge Functions

L'arbitrage architectural repose sur la proximité de la donnée.

- **Fonctions Postgres (RPC)** : à utiliser pour la logique "Data-Intensive" nécessitant atomicité et performance brute.
  - **Sécurité critique** : pour les fonctions `SECURITY DEFINER`, définir impérativement un `search_path` restreint. **Directive de sécurité** : forcer `pg_temp` en dernière position dans le `search_path` pour neutraliser les vecteurs d'attaque via des tables temporaires malveillantes.
- **Edge Functions (Deno)** : à réserver pour les "I/O-Intensive" (appels d'APIs tierces comme Stripe ou OpenAI) et les traitements lourds hors-données.

## 5. Triggers — patterns sains et anti-patterns risqués

Les triggers assurent une automatisation de l'intégrité "invisible" pour la couche applicative.

- **Mécanismes** : choisir entre `BEFORE` (pour valider/transformer avant stockage) et `AFTER` (pour les effets de bord comme l'audit).
- **Variables de contexte** : exploiter les records `OLD` et `NEW` pour comparer les états.
- **Pattern de prévention de récursivité** : pour éviter les boucles infinies ou les déclenchements inutiles, encapsuler les mises à jour dans une condition de changement réel : `IF NEW.champ IS DISTINCT FROM OLD.champ THEN ...`.
- **Gestion des dépendances** : si un trigger bloque la modification d'un schéma dans un environnement restreint, utiliser `DROP FUNCTION ... CASCADE` pour supprimer proprement la fonction et tous les triggers associés.

## 6. Optimisation et diagnostic de performance

L'observabilité est le pilier d'une infrastructure réactive.

- **EXPLAIN ANALYZE** : outil de diagnostic ultime. Il exécute la requête et expose les coûts réels. Chercher les "Sequential Scans" et les "Hash Joins" coûteux.
- **Mandat de maintenance** :
  - **ANALYZE** : à exécuter après des imports massifs pour mettre à jour les statistiques du planificateur.
  - **VACUUM** : indispensable pour récupérer l'espace disque et prévenir le "bloat" (gonflement) des tables suite à de nombreux `UPDATE` ou `DELETE`.
- **Détection du N+1** : identifier les patterns où l'applicatif effectue des boucles de requêtes au lieu d'une jointure SQL unique.

## 7. Exploitation des types Postgres utiles

Un typage précis réduit la complexité du code et optimise le stockage.

- **JSONB vs JSON** : utiliser exclusivement `JSONB` pour bénéficier de l'indexation et des opérateurs de recherche binaire.
- **UUID** : préféré aux `SERIAL/INT` pour les identifiants dans les systèmes distribués, évitant les collisions lors des synchronisations.
- **Arrays et Enums** : utiliser les `ENUM` pour les listes de constantes métier afin de garantir la validité sans jointure supplémentaire.
- **Timestamps** : le type `timestamptz` (avec fuseau horaire) est le seul standard acceptable pour éviter les décalages de dates entre serveurs et clients.

## 8. Stratégies de suppression — Soft Delete vs Hard Delete

Le choix de suppression est une décision métier critique.

- **Hard Delete (`DELETE`)** : supprime physiquement les données. Utiliser `ON DELETE CASCADE` pour les relations subordonnées sans valeur historique (ex. supprimer les tags d'un article supprimé).
- **Soft Delete (`deleted_at`)** : implémentation obligatoire pour les entités métier sensibles telles que les **Leads** (opportunités commerciales) et les **Meets** (rendez-vous).
  - **Analyse de valeur** : la perte de données sur ces entités rend tout audit ou analyse de performance commerciale impossible. Un champ `deleted_at` permet la conservation pour conformité et reporting, malgré un coût légèrement supérieur en stockage et une complexité de filtrage.

## 9. Patterns d'audit et automatisation des timestamps

L'auditabilité est une exigence non-négociable en environnement de production.

- **Colonnes de base** : chaque table doit inclure `created_at` et `updated_at`.
- **Automatisation totale** : ne jamais déléguer la mise à jour de `updated_at` au client. Utiliser un trigger `BEFORE UPDATE` pour forcer `NEW.updated_at = now();`. Cela garantit une piste d'audit intègre, même en cas de modification directe via le Dashboard (bien que cela doive rester exceptionnel).

## 10. Checklist avant merge — les 12 points de contrôle

Ce protocole doit être validé par l'agent IA ou le lead technique avant chaque migration de production :

- [ ] **PK mandatoire** : chaque table possède une clé primaire explicite.
- [ ] **Intégrité NOT NULL** : les colonnes obligatoires possèdent la contrainte `NOT NULL`.
- [ ] **Indexation des FK** : toutes les clés étrangères sont indexées pour éviter les ralentissements sur les jointures.
- [ ] **Migration safety** : le `lock_timeout` est défini dans le fichier de migration pour protéger la disponibilité.
- [ ] **Standard temporel** : utilisation systématique de `timestamptz`.
- [ ] **Idempotence locale** : `supabase db reset` s'exécute sans erreur sur l'environnement de développement.
- [ ] **Diagnostic d'état** : `supabase migration list` confirme la cohérence de l'historique.
- [ ] **Sécurité SECURITY DEFINER** : le `search_path` est restreint et inclut `pg_temp` en dernier.
- [ ] **Performance validée** : `EXPLAIN` ne montre aucun scan séquentiel sur les tables volumineuses.
- [ ] **Respect de la Golden Rule** : aucune modification n'a été effectuée sur l'instance distante sans migration.
- [ ] **Validation des Enums** : les types énumérés sont cohérents et documentés.
- [ ] **Seed data** : le fichier `supabase/seed.sql` contient des données de test représentatives.

## Conclusion

Cette documentation constitue la directive suprême pour la maintenance de l'infrastructure de données. L'agent IA doit s'y référer lors de chaque audit de schéma pour garantir une résilience maximale du système.
