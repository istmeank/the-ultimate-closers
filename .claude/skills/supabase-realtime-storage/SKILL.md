---
name: supabase-realtime-storage
description: Expertise complète Supabase Realtime + Storage pour TUC. Utilise systématiquement ce skill dès qu'il est question de Channels Broadcast/Presence/Postgres Changes, useSupabaseRealtime hook React, cleanup unsubscribe (anti memory leak), buckets site-images/formations/avatars, RLS storage.objects, Signed URLs courte expiration anti-exfiltration formations, image transformation /render/ pour avatars, 200 connexions simultanées Free / 1000 msg/sec limites, WAL pull pools (Subscription management/cleanup), Hot Lead via Postgres Changes vers admin dashboard, Lead Assigné via Broadcast vers closer, Presence pour matchmaking closers connectés, realtime.send pour notifications transactionnelles, dégradation gracieuse (couper Presence en cas saturation). Anti-patterns incluant abonnement table complète et signed URLs longues.
---


En tant qu'architecte solutions, l'évolution de l'infrastructure de l'agent TUC vers une architecture événementielle n'est pas une simple mise à jour technique, mais un impératif stratégique. L'abandon du "polling" (interrogation périodique) au profit du temps réel permet à l'agent TUC de réagir instantanément aux opportunités. Dans un modèle de responsabilité partagée, si Supabase gère l'infrastructure, la conception de la logique de Row Level Security (RLS) et l'optimisation des flux incombent à l'architecte pour garantir la scalabilité et la sécurité des données de l'écosystème.

## **1\. Fondations Techniques de Supabase Realtime**

La puissance de Supabase Realtime réside dans sa capacité à transformer une base de données statique en un flux dynamique d'événements. Contrairement au polling qui sature inutilement les ressources, l'architecture Realtime utilise des **Channels** (salons virtuels isolés par topic) pour distribuer l'information uniquement aux clients concernés.

### **Analyse Comparative des Piliers Realtime**

| Fonctionnalité | Latence | DB Impact | Cas d'usage TUC | Mécanisme technique |
| :---- | :---- | :---- | :---- | :---- |
| **Broadcast** | Ultra-faible | Négligeable | Notifications éphémères (Closers) | WebSockets (Client-to-Client) |
| **Presence** | Très faible | Faible | Statut en ligne des agents | Synchronisation d'état distribuée |
| **Postgres Changes** | Moyenne | Significatif | Sync des Dashboards Admin | Replication Slots (WAL Pull) |

L'impact sur la base de données est un critère de choix majeur : alors que le **Broadcast** transite par WebSocket avec une charge DB minimale, le mode **Postgres Changes** nécessite un "WAL Pull" via des slots de réplication, sollicitant davantage le processeur pour scruter les journaux de transaction (Write-Ahead Log).

### **Implémentation React : Le Pattern `useSupabaseRealtime`**

L'isolation des flux s'opère via l'initialisation de canaux dédiés. Un expert privilégiera une gestion rigoureuse du cycle de vie :

```javascript
const channel = supabase.channel('room_1')
  .on('broadcast', { event: 'user_action' }, (payload) => console.log(payload))
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') { /* Handler de succès */ }
  });
// Note : Le cleanup via unsubscribe() est obligatoire pour éviter les memory leaks.
```

## **2\. Architecture des Notifications TUC : Flux et Réception**

La conversion d'un "Hot Lead" se joue à la seconde près. L'architecture doit refléter cette urgence opérationnelle par une segmentation des flux de réception.

* **Flux "Lead Assigné" (Broadcast) :** Priorité à la vitesse. Une notification directe est envoyée au closer via Broadcast. Ce flux évite l'écriture immédiate en base pour une réactivité maximale.  
* **Flux "Hot Lead" (Postgres Changes) :** Lorsqu'un score de lead franchit un seuil de température dans la table `leads`, le changement est détecté par le WAL Pull et répercuté sur le dashboard de supervision admin.  
* **Flux "Meeting Booké" (Hybride) :** Utilisation de `realtime.send` côté SQL pour déclencher une notification Broadcast tout en persistant l'événement.

Le mécanisme de **Presence** devient ici un moteur de matchmaking : il identifie en temps réel quels closers sont connectés pour optimiser l'attribution automatique des leads entrants aux agents réellement disponibles.

## **3\. Gestion des Limites et Dégradation Gracieuse**

Anticiper les plafonds techniques est indispensable pour maintenir la haute disponibilité. Sur la version Free, nous sommes contraints par **200 connexions simultanées** et **1 000 messages par seconde**.

### **Infrastructure et Pools de Connexion**

L'utilisation de "Postgres Changes" active des pools de connexions spécifiques : *Subscription management*, *Subscription cleanup*, et *WAL pull*. La taille de ces pools varie selon le "Compute Add-on" (ex: 2 connections de management pour le tier Micro vs 9 pour le tier 8XL). Une surcharge de souscriptions peut saturer ces pools, d'où l'importance de limiter les écoutes aux colonnes et IDs strictement nécessaires.

### **Stratégie de Résilience**

En cas de saturation des quotas, l'agent TUC applique une dégradation gracieuse :

* **Priorisation logicielle :** Coupure automatique des flux Presence pour libérer des slots de connexion pour les notifications de vente.  
* **Utilisation de `realtime.send` :** Cette fonction Postgres insère les entrées dans `realtime.messages`. Elle capture les erreurs de manière isolée, garantissant que l'échec d'une notification n'entraîne pas un rollback de la transaction métier parente.

## **4\. Patterns d'Upload et Structure des Buckets TUC**

Une segmentation rigoureuse du stockage garantit la conformité et la performance de la distribution des ressources.

### **Configuration des Buckets**

1. **`site-images` (Public) :** Actifs statiques (logos, UI). Accès public direct via CDN.  
2. **`formations` (Authenticated) :** Documents PDF propriétaires. Accès restreint via RLS.  
3. **`avatars` (User-owned) :** Dossiers utilisateurs. RLS basé sur `auth.uid()`.

### **Workflow d'Upload et Sécurité RLS**

La sécurité repose sur la table `storage.objects`. Contrairement à une idée reçue, l'Edge Function n'est qu'un filtre de validation (MIME-type, taille max). Le véritable garde-fou est la **Row Level Security**.

* **Droits pour l'Upsert :** Pour écraser un fichier existant, l'utilisateur doit posséder les droits `INSERT`, `SELECT` et `UPDATE` sur le bucket concerné.  
* **Helper Functions :** L'utilisation de `storage.allow_only_operation('select')` est cruciale pour distinguer la lecture d'un objet spécifique du listing complet d'un dossier.

## **5\. Sécurité Avancée et Optimisation du Stockage**

Le "So What" de la sécurité réside dans la protection de la propriété intellectuelle (PDF de formation).

### **Signed URLs : La barrière contre l'exfiltration**

Pour le bucket `formations`, l'accès permanent est proscrit. Nous générons des **Signed URLs** à expiration courte (ex: 5 min). Cela empêche l'exfiltration de liens (sharing), garantit que les documents ne sont pas indexés par les moteurs de recherche et assure que l'accès expire dès que la session de consultation est terminée.

### **Optimisation de la Diffusion**

* **Image Transformation :** Utilisation du paramètre `/render/` pour redimensionner les avatars à la volée, économisant jusqu'à 80% de bande passante client.  
* **CDN Global :** Les actifs sont servis via un réseau de distribution de plus de 285 villes, réduisant la latence perçue par les closers en mobilité.

## **6\. Analyse des 5 Anti-patterns Critiques**

| Problème | Impact | Solution |
| :---- | :---- | :---- |
| **Abonnement à une table complète** | Surcharge WAL et latence accrue. | Utiliser des filtres précis (ex: `id=eq.X`). |
| **Oubli du cleanup des souscriptions** | Memory leak côté client (crash navigateur). | Implémenter `channel.unsubscribe()` dans le hook de démontage. |
| **Upload direct sans RLS strict** | Risque d'écrasement de données tierces. | Vérifier les permissions `INSERT/UPDATE` basées sur l'ID propriétaire. |
| **URLs signées à durée excessive** | Risque de fuite prolongée de données sensibles. | Limiter l'expiration au temps de consultation moyen (quelques minutes). |
| **Listing autorisé sur bucket public** | Exposition de l'arborescence et des fichiers. | Utiliser `storage.allow_only_operation('select')` pour interdire le listing. |

## **7\. Checklist d'Implémentation (8 Points)**

La rigueur de cette implémentation définit la fiabilité finale de l'agent IA.

* \[ \] **Publication Realtime :** Activer la publication `supabase_realtime` exclusivement pour les tables cibles (ex: `leads`, `notifications`).  
* \[ \] **Isolation des Topics :** Garantir l'unicité des noms de channels pour éviter les collisions entre flux publics et privés.  
* \[ \] **Monitoring Connection Pools :** Vérifier l'adéquation du "Compute Add-on" avec le nombre attendu de souscriptions Postgres Changes.  
* \[ \] **RLS Storage :** Configurer les droits granulaires sur `storage.objects` (distinction claire entre INSERT et SELECT).  
* \[ \] **Validation MIME :** Implémenter la whitelist de content-type via Edge Function ou RLS.  
* \[ \] **Cleanup de présence :** Configurer les écouteurs d'état (`sync`, `join`, `leave`) pour le suivi des closers.  
* \[ \] **Signed URLs :** Forcer l'expiration courte sur tous les documents du bucket `formations`.  
* \[ \] **Image Optimization :** Activer `/render/` pour tous les appels d'images dynamiques (avatars).

L'application stricte de ces standards assure une infrastructure robuste, sécurisée et capable de soutenir la croissance de l'écosystème TUC.

