---
name: telegram-meta-graph-apis
description: Expertise complète Telegram Bot API + Meta Graph API (Messenger + Instagram) pour TUC. Utilise systématiquement ce skill dès qu'il est question de Telegram setup @BotFather + token + setWebhook vs polling (polling proscrit en prod), sendMessage avec parse_mode Markdown/HTML, inline keyboards, commands /start /help /stop (opt_out), Messenger Page Access Token (vs User), PSID recipient.id, message types text/attachment/quick_replies/templates, 24h window comme WhatsApp + Message Tags exceptions, Instagram Messaging API (extension Messenger, scopes instagram_basic + instagram_manage_messages + pages_messaging, prérequis Instagram Business lié FB Page), webhooks Meta X-Hub-Signature-256, opt-in tracking multi-canal opt_in_logs centralisé, architecture adapter par canal (interface MessageChannel commune send/receive/optIn/optOut). Rate limits (Telegram 30 msg/s, Meta ~200 calls/h/user). Anti-patterns incluant polling en prod, scopes over-privileged.
---


En tant qu'Architecte de Solutions Senior, je considère le choix des canaux non pas comme une simple interface, mais comme une infrastructure critique impactant la scalabilité et la conformité. Telegram demeure le laboratoire d'excellence pour le prototypage rapide, mais l'évolution vers **Bot API 10.0** (mai 2026\) avec l'introduction du **Guest Mode** transforme radicalement la portée de l'agent TUC, lui permettant d'interagir avec des chats dont il n'est pas membre. Cependant, la transition vers la production exige une rigueur absolue : le passage au mode **Webhook** n'est pas une option mais une nécessité pour éviter l'épuisement des ressources et garantir l'idempotence des traitements face au mode Polling, structurellement limité.

## **1\. Fondations de l'API Telegram Bot : Du Provisionnement à l'Interaction**

### **Configuration et Sécurité Architecturale**

Le provisionnement via `@BotFather` génère le Token d'API, clef de voûte de l'authentification. Pour une architecture résiliente :

* **Mécanisme de Réception :** Abandonnez `getUpdates` (polling) au profit de `setWebhook`. Ce dernier permet à Telegram de pousser des **JSON-serialized Update objects** vers votre infrastructure.  
* **Sécurité renforcée :** Outre le HTTPS, implémentez impérativement le paramètre `secret_token` lors du `setWebhook`. Cela génère le header `X-Telegram-Bot-Api-Secret-Token`, garantissant que les payloads proviennent exclusivement des serveurs de Telegram, assurant ainsi une parité de sécurité avec l'écosystème Meta.

### **UX et Flexibilité Native**

L'interaction est pilotée par `sendMessage`, exploitant le `parse_mode` (Markdown/HTML) pour la structure. L'engagement utilisateur est optimisé par les `inline keyboards` (via `callback_data`) et les commandes système (`/start`, `/help`). Notez qu'avec le **Guest Mode**, l'agent peut désormais répondre via `answerGuestQuery`, ouvrant de nouveaux flux d'acquisition hors des tunnels privés classiques.

## **2\. Gestion de l'État de Conversation Telegram (FSM)**

Dans une architecture sans état (stateless) côté API, la persistance est votre seule défense contre la perte de contexte.

### **Architecture FSM (Finite State Machine)**

Chaque interaction doit être mappée dans la table `conversations` de l'agent TUC, liant l'ID utilisateur unique à un état spécifique du workflow. **Attention :** Telegram ne conserve les mises à jour non consommées que pendant **24 heures**. Une panne prolongée de votre base de données sans file d'attente robuste (Message Queue) entraînera une perte irrémédiable de données transactionnelles.

### **Cycle de Vie et Opt-out**

La commande `/stop` est le mécanisme d'opt-out natif. Elle doit déclencher une mise à jour atomique de l'état en base de données pour suspendre immédiatement tout traitement sortant, protégeant ainsi la réputation de votre bot.

## **3\. Écosystème Meta : Messenger Send API et la Rupture de 24h**

Messenger impose une gouvernance stricte centrée sur le **Page-scoped ID (PSID)**. Contrairement à Telegram, l'identifiant est lié à la Page Facebook, interdisant toute portabilité directe des identifiants entre différentes applications.

### **Politique de Communication et Dépréciation Critique**

La "Fenêtre de 24 heures" régit l'envoi de contenu promotionnel.

* **Alerte Obsolescence :** Le Source Context est formel. À compter du **27 avril 2026**, l'utilisation des Message Tags `ACCOUNT_UPDATE`, `CONFIRMED_EVENT_UPDATE` et `POST_PURCHASE_UPDATE` retournera une **Erreur 100**.  
* **Stratégie de Migration :** Pour communiquer hors fenêtre, l'agent TUC doit pivoter dès maintenant vers les **Utility Messages** (templates pré-approuvés) ou les **One-Time Notifications (OTN)** pour rester opérationnel après cette date butoir.

## **4\. Extension Instagram Messaging : Synergies et Scopes**

Instagram utilise la "Conversations API", partageant les endpoints de Messenger. La complexité réside dans les prérequis : un compte Instagram Business lié à une Page Facebook est obligatoire.

### **Gouvernance des Autorisations**

L'agent IA doit disposer d'un token doté de scopes granulaires : `instagram_basic`, `instagram_manage_messages` et `pages_messaging`. Sans cette triade, l'accès aux payloads Instagram sera systématiquement rejeté par la passerelle Meta.

## **5\. Architecture des Webhooks Meta : Sécurité et Réception**

Les Webhooks Meta sont les points de terminaison critiques pour les événements `messages` et `postbacks`.

* **Validation de Signature :** L'intégrité est vérifiée par la signature `X-Hub-Signature-256`.  
* **Analyse du Payload :** Le système doit traiter les événements de cycle de vie : `delivery` (Messenger uniquement), `read` (Messenger) ou `messaging_seen` (Instagram), permettant d'ajuster la logique de relance de l'IA en fonction de l'engagement réel.

## **6\. Gouvernance Multi-Canal : Logique d'Opt-In Centralisée**

Pour garantir la conformité (RGPD/CCPA), l'agent TUC doit s'appuyer sur une table de log de consentement (`opt_in_logs`) centralisée.

* **Traçabilité :** Le champ `source_channel` est critique pour auditer l'origine du consentement (WhatsApp/Telegram/Messenger/Instagram).  
* **Propagation de l'Opt-Out :** Un retrait de consentement sur un canal doit, selon les règles de design TUC, interroger l'identité utilisateur globale pour suspendre les communications sur tous les points de contact liés, évitant ainsi un harcèlement multi-plateforme.

## **7\. Gestion des Rate Limits : Analyse Comparative**

Le respect des quotas est le garant de votre haute disponibilité.

| Canal | Limite de Débit (Indicative) | Limites de Médias (Download) |
| :---- | :---- | :---- |
| **Telegram** | 30 msg/s global / 20 msg/s par groupe | **20 MB** (Standard) / 2000 MB (Local Server) |
| **Meta** | Basé sur le tier de l'app et le volume d'utilisateurs | Spécifique par type (ex: 30 images max/envoi) |

**Note Architecturale :** Les limites Meta sont dynamiques. L'implémentation de files d'attente (Queues) avec backoff exponentiel est indispensable pour gérer les erreurs 429 et 613 (Rate limit exceeded).

## **8\. Architecture Unifiée TUC : Le Pattern Adapter**

Pour éviter le "code spaghetti", l'interface `MessageChannel` doit abstraire les spécificités des plateformes via des méthodes contractuelles : `send()`, `receive()`, `optIn()`, `optOut()`, `getStatus()`. Cette isolation permet à une instabilité sur Instagram d'être contenue, sans impacter la résilience du canal Telegram.

## **9\. Diagnostic de Performance : Les 8 Anti-Patterns de Production**

1. **Usage de Tags dépréciés (Meta) :** Continuer à utiliser `ACCOUNT_UPDATE` après avril 2026 (Erreur 100).  
2. **Polling en Production (Telegram) :** Latence élevée et consommation CPU inutile.  
3. **Indicateur "Typing" absent :** Dégrade l'UX en ne signalant pas l'activité de l'IA.  
4. **Scopes sur-privilégiés :** Augmente la surface d'attaque en cas de fuite de token.  
5. **Négliger la limite média de 20 MB :** Échec silencieux lors du téléchargement de fichiers lourds sur Telegram sans serveur local.  
6. **Hardcoding des Tokens :** Risque majeur de sécurité (utiliser des variables d'environnement).  
7. **Absence de Fallback :** Aucun canal de repli en cas de défaillance d'une API spécifique.  
8. **Ignorer la fenêtre de rétention de 24h (Telegram) :** Perte de messages non traités suite à une interruption de service prolongée.

## **10\. Checklist de Déploiement : 12 Points de Contrôle**

* \[ \] **Validation Signature :** `X-Hub-Signature-256` (Meta) et `X-Telegram-Bot-Api-Secret-Token` (Telegram) actifs.  
* \[ \] **SSL/TLS :** Webhooks configurés exclusivement sur HTTPS (Ports 443, 80, 88, 8443 supportés par Telegram).  
* \[ \] **Automated Disclosure :** Message explicite informant de l'interaction avec un bot (Obligatoire pour les marchés Californie/Allemagne).  
* \[ \] **Gestion 429/613 :** Logique de `retry_after` capturée et respectée.  
* \[ \] **Normalisation Payload :** Validation des limites de caractères (4096 pour Telegram).  
* \[ \] **Rotation des Tokens :** Processus automatisé pour les Page Access Tokens.  
* \[ \] **Logs de Consentement :** Archivage immuable des dates et sources d'Opt-in.  
* \[ \] **Erreurs 100/400 :** Monitoring spécifique pour détecter les formats de messages invalides.  
* \[ \] **Fallback Média :** Gestion des URLs d'images ou fichiers expirés.  
* \[ \] **Tests de Charge :** Validation de la capacité de traitement des files d'attente.  
* \[ \] **Mode Maintenance :** Capacité d'isoler/couper un canal via l'Adapter.  
* \[ \] **Chiffrement At-Rest :** Cryptage des données utilisateurs et PSIDs en base de données.

