---
name: supabase-edge-functions-deno
description: Expertise complète pour coder Edge Functions Deno sur Supabase TUC (projet llxgyomevketvypusafl EU-west-3, 17 tables, 41 RLS). Utilise systématiquement ce skill dès qu'il est question de Edge Function index.ts, cycle de vie Deno Isolate (warm starts, global scope), CORS preflight OPTIONS, Deno.env.get pour secrets, AbortSignal.timeout 5s, crypto.subtle HMAC, structured JSON logging sans PII, propagation header Authorization vers supabase-js client (RLS), arbitrage RPC vs SQL, mapping Postgres errors → HTTP codes, exponential backoff 2^n avec jitter, supabase functions deploy, supabase secrets set, pg_cron + pg_net pour scheduled (ré-assignation 24h, downgrade hot→warm 48h, sync HubSpot, hygiène data). Anti-patterns critiques incluant service_role_key exposé et top-level await réseau.
---


# **Guide de Référence Stratégique : Ingénierie des Edge Functions pour le Projet TUC**

## **Executive Summary**

Ce document définit les standards d'ingénierie obligatoires pour le développement des Edge Functions au sein de l'instance `llxgyomevketvypusafl`. Dans un écosystème complexe de 17 tables et 41 politiques RLS, la cohérence technique n'est pas une option mais une condition de survie opérationnelle. Ce guide impose des patterns d'isolation, de sécurité et de résilience réseau pour garantir une latence minimale en zone `EU-west-3`.

\--------------------------------------------------------------------------------

## **1\. Anatomie d'une Edge Function Canonique**

La standardisation de la structure `index.ts` est l'unique rempart contre la dérive technique d'un projet à forte granularité de sécurité (41 RLS). L'architecture "edge-first" sur Deno permet de déporter l'intelligence au plus proche de l'utilisateur, mais impose une maîtrise totale du cycle de vie des Isolates.

### **Cycle de vie Deno : Initialisation vs Exécution**

**Exigence Architecturale :** Les dépendances et l'instanciation des clients (ex: `createClient`) doivent impérativement être déclarées dans le **global scope**. Cela permet de bénéficier des "warm starts" en réutilisant les ressources entre les invocations, réduisant ainsi les délais de démarrage à froid (cold starts). Le handler ne doit contenir que la logique métier pure.

### **Gestion des interfaces Request/Response**

Toute fonction doit implémenter une gestion rigoureuse des objets `Request` et `Response`. L'inclusion des en-têtes **CORS** est obligatoire pour tout point de terminaison invoqué depuis le client.

```ts
const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
// Validation systématique de la méthode OPTIONS pour le preflight
if (req.method === 'OPTIONS') return new Response('ok', { headers });
```

### **Accès sécurisé via Deno.env**

L'accès aux secrets s'effectue exclusivement via `Deno.env.get()`. Pour assurer la traçabilité, utilisez `SB_EXECUTION_ID` dans vos logs pour lier une exécution spécifique à un incident. Cette rigueur garantit l'étanchéité des accès à la base `llxgyomevketvypusafl`.

\--------------------------------------------------------------------------------

## **2\. Patterns Deno Essentiels et Utilitaires Natifs**

L'usage des API standards de Deno est une directive ferme pour garantir la portabilité et la performance sans dépendances npm lourdes.

### **Gestion du flux et timeouts**

L'implémentation de `AbortSignal.timeout()` est obligatoire pour chaque appel asynchrone sortant. Ce signal doit être passé à la propriété `signal` de l'objet `fetch` pour interrompre l'exécution si le service tiers ne répond pas dans les délais impartis.

### **Sécurité et Cryptographie**

Toute signature ou vérification (ex: Webhooks) doit utiliser `crypto.subtle` (Web Crypto API) pour les opérations HMAC. L'usage de bibliothèques tierces pour des fonctions natives Deno est proscrit.

### **Observabilité et Data Handling**

* **Logging :** Le formatage JSON (`console.log(JSON.stringify({...}))`) est le standard. Chaque log doit inclure le niveau de sévérité et le contexte métier.  
* **Formats :** Les dates doivent être manipulées via les objets `Date` ISO natifs. L'encodage doit privilégier les utilitaires `TextEncoder`/`TextDecoder`.

\--------------------------------------------------------------------------------

## **3\. Protocole de Communication avec les API Externes**

Le risque d'appels API non bridés en serverless est une saturation des ressources. La résilience réseau doit être programmée explicitement.

### **Directives Techniques Impératives**

1. **Timeout Global :** Fixé à **5 secondes** maximum par appel.  
2. **Algorithme de Retry :** Utilisation obligatoire de l'**Exponential Backoff**. La séquence doit suivre 2^n avec jitter (1s, 2s, 4s, 8s, 16s) pour un maximum de 5 tentatives.  
3. **Isolation des Erreurs :** Chaque domaine d'appel doit être encapsulé dans un `try/catch` granulaire pour éviter qu'une panne tierce ne fasse s'effondrer l'ensemble du workflow.  
4. **Secrets Management :** Interdiction stricte des credentials en clair. Usage exclusif des secrets injectés via la CLI Supabase.

Ce protocole garantit la stabilité du projet en zone `EU-west-3`, neutralisant les instabilités des services inter-régionaux.

\--------------------------------------------------------------------------------

## **4\. Intégration PostgreSQL et Stratégies d'Accès aux Données**

L'arbitrage entre SQL direct et `supabase-js` est dicté par les 41 politiques RLS existantes.

### **Respect du contexte utilisateur**

**Standard de Sécurité :** Pour toute fonction privée, l'Edge Function **doit** propager le header `Authorization` de l'utilisateur vers le client Supabase. Cela garantit que la passerelle utilise `SUPABASE_JWKS` pour valider l'identité et que les politiques RLS sont appliquées. L'usage de la `service_role_key` est réservé exclusivement aux opérations de maintenance de bas niveau.

### **Arbitrage RPC vs SQL**

* **RPC :** Privilégier pour les transactions complexes impliquant plusieurs tables afin de garantir l'atomicité côté base de données.  
* **Postgres Errors :** Les codes d'erreur SQL (ex: `23505` pour l'unicité) doivent être mappés vers des codes HTTP intelligibles (ex: `409 Conflict`) avant d'être renvoyés au client.

\--------------------------------------------------------------------------------

## **5\. Déploiement et Cycle de Vie DevOps**

### **Procédures Opérationnelles (SOP)**

* **Déploiement :** `supabase functions deploy [function_name]` pour chaque itération.  
* **Secrets :** `supabase secrets set KEY=VALUE`. Notez qu'une mise à jour de secret est effective immédiatement sans redéploiement de la fonction.  
* **Environnements :** Les fichiers `.env` locaux doivent impérativement être listés dans le `.gitignore`. La distinction entre secrets de Preview et de Production est gérée via les différents projets Supabase.

\--------------------------------------------------------------------------------

## **6\. Automatisation Stratégique : Scheduled Cron pour TUC**

L'orchestration repose sur le couple `pg_cron` (ordonnanceur) et `pg_net` (invocateur HTTP). Utiliser les Edge Functions pour ces tâches est crucial : cela évite que des procédures PL/pgSQL prolongées ne verrouillent des lignes dans les 17 tables centrales, ce qui ferait exploser la latence des 41 requêtes vérifiées par RLS.

| Mission | Fréquence | Logique Métier (Instance `llxgyomevketvypusafl`) |
| :---- | :---- | :---- |
| **Ré-assignation 24h** | Quotidien | Transfert automatique de propriété des tâches (BLOCKER). |
| **Température (48h)** | 2 jours | Downgrade automatique du statut `hot` vers `warm`. |
| **Sync HubSpot** | Hebdo | Alignement bidirectionnel avec le CRM, intégrité des leads. |
| **Hygiène Data** | Mensuel | Purge des logs d'analytics obsolètes et maintenance du schéma. |

\--------------------------------------------------------------------------------

## **7\. Analyse des 10 Anti-patterns à Proscrire**

Tout code présentant l'un de ces patterns sera rejeté lors de la revue de code :

1. **PII dans les logs :** Fuite de données personnelles via `console.log`.  
2. **Exposition service\_role\_key :** Utilisation de la clé admin là où les RLS devraient s'appliquer.  
3. **Absence de timeout fetch :** Fonctions "zombies" attendant indéfiniment un tiers.  
4. **Retry sans backoff :** Bombardement d'une API en panne (effet "thundering herd").  
5. **Écritures multiples non atomiques :** Risque d'état incohérent entre les 17 tables.  
6. **Top-level await sur réseau :** Retarder le cold start de chaque utilisateur par un appel réseau bloquant lors de l'initialisation de l'Isolate.  
7. **Dépendances non-Deno :** Importation de modules `node:` non supportés.  
8. **Secrets en clair :** Hard-coding de clés API dans le repository.  
9. **Bypass de validation JWT :** Accès libre sur des fonctions censées être privées.  
10. **Payloads non typés :** Usage de `any` sur les données entrantes, menant à des crashs silencieux.

\--------------------------------------------------------------------------------

## **8\. Checklist Pré-déploiement (12 Points de Contrôle)**

### **Sécurité**

* \[ \] Le JWT est-il validé et le header `Authorization` est-il propagé au client Supabase ?  
* \[ \] La `service_role_key` est-elle strictement absente du code et des logs ?  
* \[ \] Les secrets sont-ils exclusivement appelés via `Deno.env.get()` ?  
* \[ \] Les en-têtes CORS restreignent-ils l'accès aux domaines autorisés ?

  ### **Performance**

* \[ \] Chaque `fetch` possède-t-il un `AbortSignal.timeout(5000)` ?  
* \[ \] Les clients et constantes sont-ils initialisés hors du handler (Global Scope) ?  
* \[ \] L'algorithme de Retry avec Exponential Backoff est-il implémenté ?  
* \[ \] Aucun `await` bloquant n'est présent dans le top-level scope (hors config simple).

  ### **Robustesse et Ops**

* \[ \] Le fichier `.env` est-il bien présent dans le `.gitignore` ?  
* \[ \] Les logs sont-ils structurés en JSON et exempts de PII ?  
* \[ \] Les erreurs SQL sont-elles capturées et mappées sur des codes HTTP standards ?  
* \[ \] **Validation Régionale :** La fonction vérifie-t-elle `SB_REGION === 'eu-west-3'` si une exécution locale est proscrite ?  
* 

