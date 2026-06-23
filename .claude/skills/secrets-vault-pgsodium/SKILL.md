---
name: secrets-vault-pgsodium
description: Expertise complète pour chiffrer les tokens OAuth en clair de TUC (BLOCKER-001 critique). Utilise systématiquement ce skill dès qu'il est question de Supabase Vault (vault.create_secret/update_secret, table vault.secrets, vue vault.decrypted_secrets), pgsodium TCE chiffrement column-level, AEAD Authenticated Encryption with Associated Data (user_id comme AAD pour bloquer permutation tokens entre comptes), migration SQL 4 phases (préparation colonne chiffrée, chiffrement données, bascule suppression clair, nettoyage triggers), pattern just-in-time decrypt dans Edge Function (service_role + vue decrypted_, jamais en cache ni log), rotation clés maître annuelle, key_id stocké en base, modèle hybride Vault (secrets statiques infra) + pgsodium TCE (colonnes dynamiques closer_integrations + google_calendar_tokens). Anti-patterns incluant exposition decrypted_ via PostgREST et déchiffrement frontend. Résout BLOCKER-001.
---


L'intégrité de l'infrastructure TUC (The Ultimate Closer) dépend de la sécurisation des accès tiers. Le stockage de jetons OAuth (Access/Refresh tokens) en format `TEXT` clair est une vulnérabilité critique qui expose l'agent IA à des détournements d'identité. Ce document définit le protocole de transition vers une architecture de chiffrement authentifié.

## **1\. Fondamentaux de Supabase Vault**

L'extension **Supabase Vault** centralise la gestion des secrets en les isolant du stockage applicatif standard.

### **Analyse du Concept**

L'importance stratégique de Vault réside dans l'utilisation du chiffrement authentifié sur disque. Contrairement à une table standard, les données de Vault sont "signées" : la fonction de déchiffrement vérifie l'intégrité de la signature **avant** de libérer la donnée. Cela garantit que les secrets ne peuvent être ni lus ni falsifiés, même si un attaquant accède aux fichiers physiques de la base de données ou aux flux de réplication.

### **Mécanismes de Stockage**

Les secrets sont gérés via la table `vault.secrets`. L'utilisation des fonctions `vault.create_secret()` et `vault.update_secret()` permet d'insérer des valeurs sans jamais exposer la clé de chiffrement brute au sein du moteur SQL.

### **Accès et Visibilité**

La couche d'abstraction repose sur la vue `vault.decrypted_secrets`. Cette vue déchiffre les données à la volée (just-in-time) lors de la requête. Comme les vues ne sont pas stockées sur disque, le secret reste chiffré dans les sauvegardes (dumps). L'accès à cette vue doit être strictement restreint via des privilèges SQL (RBAC) pour éviter toute fuite.

\--------------------------------------------------------------------------------

## **2\. Chiffrement de Colonne via pgsodium (TCE)**

**⚠️ Note de l'Architecte : Avertissement de Dépréciation** Supabase a annoncé la dépréciation future de l'extension `pgsodium`. Toutefois, l'interface **Vault** restera stable : son implémentation interne migrera de `pgsodium` vers un nouveau standard sans modifier les APIs SQL. Pour TUC Wave 2, nous utilisons les mécanismes TCE (Transparent Column Encryption) en privilégiant les wrappers de Vault pour garantir la pérennité du code.

### **Analyse de la Granularité et AAD**

Le TCE permet de chiffrer des colonnes spécifiques dans les tables métiers. Un aspect crucial est l'**Authenticated Encryption with Associated Data (AEAD)**. En associant une colonne unique (comme `user_id`) au chiffrement du token, on empêche un attaquant de copier un token chiffré d'une ligne à une autre : la signature serait rejetée car les "données associées" (l'ID utilisateur) ne correspondraient plus.

### **Composants Techniques et Abstraction**

Le système utilise un `key_id` stocké en base, lequel référence une clé maître gérée par le backend sécurisé de Supabase. C'est l'analogie du verrou : "Verrouiller votre porte mais laisser la clé dans la serrure est inutile ; stocker uniquement l'ID du verrou en base et garder la clé à l'extérieur est la seule pratique sûre." La vue automatique `decrypted_<table_name>` (ex: `decrypted_closer_integrations`) expose une colonne `decrypted_access_token` pour simplifier le développement.

\--------------------------------------------------------------------------------

## **3\. Architecture Recommandée pour TUC**

Une approche hybride est impérative pour équilibrer l'isolation des secrets et la performance des agents.

### **Répartition des Responsabilités**

* **Supabase Vault :** Stockage des secrets "Grupaux/Statiques".  
  * Clés API Anthropic / OpenAI.  
  * Identifiants de l'application Slack (Client ID/Secret).  
  * API Keys HubSpot globales.  
* **pgsodium / TCE (via Vault Interface) :** Chiffrement des colonnes dynamiques.  
  * `access_token` et `refresh_token` dans `closer_integrations`.  
  * Tokens de calendrier dans `google_calendar_tokens`.

### **Avantages du Modèle**

Cette séparation limite le "blast radius". Une compromission d'un token utilisateur n'expose pas les clés d'infrastructure, et l'utilisation de l'AAD lie chaque secret à son propriétaire légitime, interdisant toute permutation de jetons entre comptes.

\--------------------------------------------------------------------------------

## **4\. Protocole de Migration SQL**

La migration doit être effectuée sans interrompre les opérations de l'agent IA.

### **Séquence d'Exécution**

1. **Phase de Préparation :** Ajout de la colonne chiffrée.  
2. **Phase de Migration :** Chiffrement des données existantes. Utiliser `vault.create_secret` pour chaque token existant, ou l'appel direct pour le TCE :  
3. **Phase de Bascule :** Suppression des colonnes en clair et création de la vue de déchiffrement sécurisée.  
4. **Phase de Nettoyage :** Mise à jour des triggers pour automatiser le chiffrement lors des `INSERT/UPDATE`.

\--------------------------------------------------------------------------------

## **5\. Pattern de Déchiffrement "Just-In-Time" via Edge Functions**

Le déchiffrement ne doit jamais persister en dehors d'un contexte d'exécution immédiat.

### **Philosophie de Sécurité**

Les tokens ne sont déchiffrés qu'au moment précis de l'appel API tiers (Slack, HubSpot). L'Edge Function agit comme un environnement sécurisé éphémère.

### **Implémentation Technique**

L'Edge Function doit se connecter à la base de données en utilisant une chaîne de connexion Postgres privée ou le `service_role`. Cela permet de contourner les restrictions PostgREST et d'interroger les vues `decrypted_` qui sont invisibles pour l'API publique. Une fois le token récupéré en mémoire et l'appel API effectué, l'objet est détruit par le Garbage Collector de la fonction. **Interdiction formelle** de loguer le token déchiffré ou de le stocker dans un cache global (ex: Redis) sans re-chiffrement.

\--------------------------------------------------------------------------------

## **6\. Gestion et Rotation des Clés Maîtres**

La sécurité repose sur la racine de confiance située dans le backend Supabase.

* **Rotation des Clés :** La rotation de la clé maître pgsodium doit être planifiée annuellement. Ce processus dérive de nouvelles clés sans exposer la racine.  
* **Impact :** Une rotation nécessite une ré-encryption des données. Un script de rollback doit être validé en staging, car la perte de la clé maître rend les données définitivement irrécupérables.  
* **Isolation :** Les clés ne résident jamais dans l'espace SQL accessible par l'application ; seul leur `key_id` est manipulé.

\--------------------------------------------------------------------------------

## **7\. Les 5 Anti-Patterns à Proscrire**

1. **Exposition via PostgREST :** Inclure les vues `decrypted_` dans le schéma `public` ou le `search_path` de l'API. Les vues déchiffrées doivent rester dans un schéma privé ou être protégées par RLS strict.  
2. **Déchiffrement côté Frontend :** Envoyer un token déchiffré vers le client (navigateur). Le déchiffrement est une opération exclusivement Backend/Edge.  
3. **Secrets en clair dans la CI/CD :** Stocker les clés de test ou de production dans des fichiers `.env` non chiffrés ou des logs de pipeline.  
4. **Absence d'AAD :** Chiffrer sans "Associated Data", permettant à un utilisateur d'injecter son propre token chiffré dans la ligne d'un autre utilisateur.  
5. **Privilèges Excessifs :** Accorder le rôle `authenticated` sur la vue `vault.decrypted_secrets`. Seul le `service_role` ou un rôle de maintenance dédié doit y avoir accès.

\--------------------------------------------------------------------------------

## **8\. Checklist de Migration Sécurisée (10 Points)**

1. \[ \] **Validation Extensions :** Vault et pgsodium activés via le dashboard Supabase.  
2. \[ \] **Migration Vault :** Toutes les clés API d'infrastructure sont créées via `vault.create_secret()`.  
3. \[ \] **Schéma Privé :** Les vues `decrypted_` sont isolées du schéma `public`.  
4. \[ \] **Implémentation AAD :** L'ID utilisateur est utilisé comme donnée associée pour chaque token TCE.  
5. \[ \] **Audit RBAC :** `REVOKE ALL` sur `vault.decrypted_secrets` pour le rôle `anon` et `authenticated`.  
6. \[ \] **Vérification Logs :** Confirmation qu'aucun token déchiffré n'apparaît dans `pg_stat_statements` ou les logs Edge Functions.  
7. \[ \] **Secret Purge :** Les colonnes en clair (`TEXT`) sont supprimées de la production après validation.  
8. \[ \] **Edge Function Auth :** Utilisation systématique du `service_role` pour l'accès aux secrets via SQL direct (non via API).  
9. \[ \] **Tests de Rotation :** Procédure de rotation de clé testée avec succès sur l'environnement de staging.  
10. \[ \] **Plan de Rollback :** Procédure documentée pour restaurer les tokens en cas d'échec de la clé de dérivation.

**Conclusion :** L'application de cette stratégie clôture le ticket **BLOCKER-001**. L'architecture hybride ainsi mise en place garantit un niveau de sécurité conforme aux exigences de la Vague 2 tout en anticipant les évolutions futures de la plateforme Supabase.

