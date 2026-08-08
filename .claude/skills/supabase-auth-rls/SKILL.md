---
name: supabase-auth-rls
description: Expertise complète pour auditer, concevoir et corriger les politiques Row Level Security (RLS) et l'authentification Supabase. Utilise systématiquement ce skill dès qu'il est question de RLS, policies SQL, auth.uid(), auth.jwt(), service_role, app_metadata, RBAC Supabase, JWT claims, Auth Hooks, sécurité multi-tenant Supabase, audit de politiques, ou toute correction de faille d'isolation des données. Inclut 10 concepts clés, 10 patterns RLS canoniques avec SQL, 10 anti-patterns critiques à détecter, modélisation RBAC (admin/closer/owner), pièges spécifiques Supabase, checklist 15 points avant prod, 8 snippets prêts à l'emploi.
---

# Synthèse Stratégique : Sécurisation et Audit RLS pour l'Écosystème Supabase

## 1. Concepts clés — les fondations de l'isolement des données

La sécurité dans l'écosystème Supabase repose sur une séparation stricte : l'authentification (via GoTrue) valide l'identité, tandis que l'autorisation (via PostgreSQL RLS) définit les privilèges d'accès. Cette architecture délègue la responsabilité du contrôle d'accès à la couche de données, garantissant qu'aucune ligne ne peut être exfiltrée, même en cas de compromission du client applicatif.

Les 10 concepts critiques pour un audit de sécurité robuste :

- **Row Level Security (RLS)** : mécanisme PostgreSQL qui intercepte chaque requête pour appliquer des filtres invisibles. Essentiel pour la "défense en profondeur".
- **JWT (JSON Web Token)** : vecteur d'identité signé cryptographiquement. Sa validité est vérifiée par la base de données avant toute évaluation de politique.
- **auth.uid()** : fonction d'aide extrayant l'ID de l'utilisateur du JWT. Elle renvoie `null` si la session est expirée ou absente, invalidant par défaut les comparaisons d'égalité.
- **security_invoker** : paramètre (Postgres 15+) pour les Vues, forçant l'application des politiques RLS des tables sources plutôt que d'utiliser les droits du créateur.
- **Rôle `anon`** : rôle Postgres pour le trafic public non authentifié. À distinguer absolument de l'utilisateur anonyme.
- **Rôle `authenticated`** : rôle assigné à toute requête avec un JWT valide, incluant les "Anonymous Sign-ins" de Supabase Auth (identifiables via le claim `is_anonymous`).
- **service_role** : clé d'administration possédant le privilège `BYPASSRLS`. Son exposition côté client est une faille critique de niveau 1.
- **app_metadata** : section du JWT pour les données d'autorisation (rôles, permissions). Non modifiable par l'utilisateur, contrairement aux `user_metadata`.
- **initPlan & Caching** : technique d'optimisation consistant à envelopper les fonctions dans un `(SELECT ...)`, permettant à Postgres de mettre en cache le résultat pour toute la requête.
- **PostgREST** : couche middleware qui transforme les requêtes HTTP en SQL, injectant dynamiquement les claims du JWT dans la session Postgres.

## 2. Patterns RLS recommandés — modèles de conception canoniques

Les politiques RLS agissent comme des clauses `WHERE` implicites. Leur conception impacte directement la capacité de l'optimiseur Postgres à utiliser les index. Voici les 10 patterns canoniques :

### 1. Propriété simple (isolation stricte)
- **Cas d'usage** : données personnelles (profils, paramètres).
- **SQL** : `USING ((select auth.uid()) = user_id)`
- **Avantage** : garantit qu'un utilisateur ne peut voir ou agir que sur ses propres lignes.

### 2. Accès public en lecture seule
- **Cas d'usage** : catalogues produits, articles de blog.
- **SQL** : `FOR SELECT TO anon, authenticated USING (true)`
- **Avantage** : visibilité universelle sans droits d'écriture pour les rôles non privilégiés.

### 3. Accès par équipe (basé sur le JWT)
- **Cas d'usage** : SaaS multi-tenant.
- **SQL** : `USING (team_id = (auth.jwt() -> 'app_metadata' ->> 'team_id')::uuid)`
- **Avantage** : performance maximale en évitant une jointure avec une table de membres.

### 4. Contrôle d'insertion (validation d'identité)
- **Cas d'usage** : empêcher l'usurpation d'identité à la création.
- **SQL** : `FOR INSERT WITH CHECK ((select auth.uid()) = user_id)`
- **Avantage** : interdit la création de ressources pour le compte d'un autre utilisateur.

### 5. Mise à jour restrictive (immuabilité du propriétaire)
- **Cas d'usage** : empêcher le transfert de propriété non autorisé.
- **SQL** : `FOR UPDATE USING ((select auth.uid()) = owner_id) WITH CHECK ((select auth.uid()) = owner_id)`
- **Avantage** : valide que l'utilisateur est propriétaire *avant* et *après* la modification.

### 6. Accès conditionnel MFA (Assurance Level)
- **Cas d'usage** : actions sensibles (paiements, exports).
- **SQL** : `USING (auth.jwt() ->> 'aal' = 'aal2')`
- **Avantage** : force une authentification forte pour des segments spécifiques de données.

### 7. Accès temporaire (time-based)
- **Cas d'usage** : offres promotionnelles, fenêtres d'édition limitées.
- **SQL** : `USING (expires_at > now())`
- **Avantage** : automatise l'expiration des droits sans intervention manuelle.

### 8. Exclusion des suppressions logiques (soft-delete)
- **Cas d'usage** : conservation de données auditables.
- **SQL** : `USING (deleted_at IS NULL)`
- **Avantage** : masque les lignes supprimées de l'API tout en les gardant en base.

### 9. Attributs de statut (ABAC)
- **Cas d'usage** : workflow de validation (Brouillon vs Publié).
- **SQL** : `USING (status = 'published' OR (select auth.uid()) = author_id)`
- **Avantage** : combine propriété et état de l'objet dans une règle unique.

### 10. Validation croisée par sous-requête (IN/ANY)
- **Cas d'usage** : accès basé sur des permissions dynamiques complexes.
- **SQL** : `USING (category_id IN (SELECT id FROM categories WHERE is_public = true))`
- **Avantage** : permet des règles dépendant de l'état d'autres tables de référence.

## 3. Anti-patterns — les 10 failles de sécurité RLS à auditer

Une politique sécurisée peut être catastrophique pour les performances. L'absence de filtres explicites côté application, bien que couverte par le RLS, empêche Postgres de choisir le meilleur plan d'exécution — l'ajout d'un filtre `.eq()` peut améliorer les performances de plus de 94%.

Erreurs critiques à détecter :

1. **Oubli de `ENABLE ROW LEVEL SECURITY`** : la table est totalement exposée sur le web. *Action* : forcer l'activation via `ALTER TABLE`.
2. **Confiance en `auth.getSession()` sur le serveur** : données potentiellement falsifiées. *Action* : utiliser `auth.getClaims()` qui valide la signature cryptographique du JWT.
3. **Utilisation de `user_metadata` pour les rôles** : l'utilisateur peut modifier ses propres privilèges via `supabase.auth.update()`. *Action* : migrer vers `app_metadata`.
4. **Absence de la clause `TO`** : la politique s'évalue pour tous les rôles, gaspillant des cycles CPU. *Action* : spécifier `TO authenticated`.
5. **Fonctions non enveloppées dans un `SELECT`** : provoque un appel de fonction par ligne scannée. *Action* : utiliser `(select auth.uid())` pour activer l'initPlan (gain jusqu'à 99%).
6. **Jointures récursives dans les politiques** : cause des timeouts sur les tables volumineuses. *Action* : utiliser des claims JWT ou des fonctions `security definer`.
7. **Vues sans `security_invoker`** : contournement total du RLS par défaut. *Action* : appliquer `WITH (security_invoker = true)`.
8. **Colonnes de filtrage non indexées** : force un Sequential Scan sur chaque requête. *Action* : indexer systématiquement les colonnes utilisées dans `USING`.
9. **Exposition du schéma `auth`** : permet l'énumération des utilisateurs. *Action* : retirer `auth` des "Exposed schemas" dans les paramètres API.
10. **Absence de SELECT pour un UPDATE** : la ligne est invisible pour l'opération de mise à jour. *Action* : toujours garantir qu'un SELECT est possible sur la ligne à modifier.

## 4. RBAC patterns — modélisation des accès "Closer" vs "Admin"

L'utilisation des claims JWT via `app_metadata` est la méthode recommandée par les DBA pour les performances RLS. Elle évite les lectures disque répétitives sur les tables de profils.

| Méthode | Latence | Impact Performance | Fraîcheur des données |
|---|---|---|---|
| **JOIN (Table Profils)** | ~10-50ms | Significatif (lectures index) | Temps réel |
| **JWT Claim (app_metadata)** | < 1ms | Nul (lecture mémoire) | **Stale** (jusqu'au refresh) |

**Exemple de hiérarchie Admin/Closer** :

```sql
CREATE POLICY "Hierarchy access" ON leads
FOR SELECT TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR 
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'closer' AND user_id = (select auth.uid()))
);
```

*Note critique* : un changement de rôle dans la base n'est effectif pour l'utilisateur qu'après le rafraîchissement de son JWT.

## 5. JWT & sessions — injection de claims et flux de sécurité

Le JWT est généré par GoTrue après succès de l'authentification. Il contient les claims standard (`sub`, `email`) et les métadonnées personnalisées.

1. **Cycle de vie** : le JWT est envoyé dans le header `Authorization: Bearer <token>`. Postgres le décode et injecte les variables dans `current_setting('request.jwt.claims')`.
2. **Injection** : les **Auth Hooks** permettent d'ajouter dynamiquement des permissions lors de l'émission du jeton.
3. **Limite de taille** : les navigateurs limitent les cookies à **4096 octets**. Un JWT trop volumineux (trop de rôles/claims) empêchera purement et simplement la connexion.
4. **Sécurité SSR** : en environnement serveur, ne jamais faire confiance au stockage local. Utiliser les cookies sécurisés et valider via `getClaims()`.

## 6. Auth Hooks — extensibilité et contrôle granulaire

Les Auth Hooks interviennent comme des intercepteurs avant la finalisation du processus d'authentification.

- **Custom Claims** : idéal pour injecter des IDs d'organisation ou des flags de modération directement dans le token pour une utilisation RLS immédiate sans jointure.
- **Validation d'accès** : permet de bloquer une connexion (ex. maintenance par utilisateur) avant même que la session ne soit créée.
- **Hook vs Trigger** : utiliser un **Trigger** pour synchroniser des données (ex. créer un profil public). Utiliser un **Hook** pour modifier le contenu du JWT ou la logique de connexion elle-même.

## 7. Pièges spécifiques Supabase — éviter le contournement involontaire

- **Clé `service_role`** : cette clé ignore le RLS. Son utilisation dans une Edge Function est acceptable, mais son exposition dans un fichier `.env` côté client est une erreur fatale.
- **Vues en pré-Postgres 15** : si le projet tourne sur une version ancienne, l'option `security_invoker` n'existe pas. La règle d'or : **révoquer explicitement** les accès `SELECT` sur la vue pour les rôles `anon` et `authenticated`, ou déplacer la vue dans un schéma privé.
- **Schémas internes** : ne jamais exposer le schéma `auth` ou `storage` via PostgREST. Créer des vues dans `public` si on doit exposer des statistiques utilisateurs.

## 8. Checklist avant mise en prod — 15 points de contrôle

- [ ] `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` appliqué sur 100% des tables publiques.
- [ ] Absence totale de la clé `service_role` dans le code source frontend.
- [ ] Index B-Tree présents sur toutes les colonnes de filtrage (`user_id`, `org_id`, etc.).
- [ ] Emballage systématique : `(select auth.uid())` et `(select auth.jwt())`.
- [ ] Utilisation explicite du mot-clé `TO authenticated` ou `TO anon` dans chaque politique.
- [ ] Pour Postgres 15+, toutes les vues ont l'option `security_invoker = true`.
- [ ] Pour Postgres < 15, les vues sensibles sont hors du schéma `public`.
- [ ] Les rôles applicatifs sont extraits de `app_metadata`, jamais de `user_metadata`.
- [ ] Les politiques `UPDATE` incluent à la fois `USING` (accès) et `WITH CHECK` (intégrité).
- [ ] Intégrité référentielle : `ON DELETE CASCADE` configuré sur les FK pointant vers `auth.users`.
- [ ] `search_path` sécurisé pour les fonctions `SECURITY DEFINER` (éviter le schéma `public`).
- [ ] Audit des fonctions `SECURITY DEFINER` : ne sont-elles pas dans un schéma exposé ?
- [ ] Filtres redondants ajoutés dans les requêtes client (`.eq('user_id', uid)`) pour l'optimiseur.
- [ ] Validation de la taille du JWT (inférieure à 4 KB).
- [ ] Remplacement de `getSession()` par `getClaims()` dans tout le code SSR.

## 9. Snippets prêts à l'emploi — bibliothèque de politiques SQL

### 1. Insertion avec validation d'identité
```sql
CREATE POLICY "User can insert own data" ON public.tasks
FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);
```

### 2. Mise à jour restrictive (immuabilité)
```sql
CREATE POLICY "Owner update only" ON public.posts
FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);
```

### 3. Accès MFA (aal2)
```sql
CREATE POLICY "MFA sensitive access" ON public.vault
FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'aal') = 'aal2');
```

### 4. Suppression par le propriétaire
```sql
CREATE POLICY "Owner delete" ON public.posts
FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);
```

### 5. Accès membre d'organisation (optimisé)
```sql
CREATE POLICY "Org member access" ON public.documents
FOR SELECT TO authenticated
USING (org_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid);
```

### 6. Lecture publique pour contenu publié
```sql
CREATE POLICY "Public published content" ON public.articles
FOR SELECT TO anon, authenticated
USING (status = 'published');
```

### 7. Accès via liste de rôles (utilisation de ANY)
```sql
CREATE POLICY "Editor access" ON public.content
FOR ALL TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = ANY (ARRAY['editor', 'admin']));
```

### 8. Service d'audit (lecture seule pour un rôle spécifique)
```sql
CREATE POLICY "Auditor read only" ON public.transactions
FOR SELECT TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'auditor');
```

## 10. Glossaire — précision terminologique pour l'audit

- **JWT** : jeton signé contenant l'identité et les claims (rôles) de l'utilisateur.
- **RLS** : système de filtrage granulaire natif à Postgres agissant au niveau de la ligne.
- **service_role** : clé bypassant les politiques RLS, réservée aux tâches administratives serveurs.
- **anon** : rôle Postgres assigné aux requêtes sans jeton d'authentification valide.
- **authenticated** : rôle Postgres pour les utilisateurs connectés (permanents ou anonymes).
- **security_invoker** : propriété forçant une vue à hériter des restrictions RLS de l'utilisateur.
- **app_metadata** : zone sécurisée du JWT pour les données d'autorisation immuables par l'utilisateur.
- **user_metadata** : zone du JWT modifiable par l'utilisateur via l'API (à proscrire pour le RLS).
- **auth.uid()** : fonction retournant l'UUID de l'utilisateur extrait du JWT vérifié.
- **PostgREST** : middleware traduisant les appels API en SQL respectant le contexte RLS.
