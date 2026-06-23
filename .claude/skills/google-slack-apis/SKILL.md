---
name: google-slack-apis
description: Expertise complète Google Calendar API v3 + Slack API pour TUC (intégrations existantes partielles à stabiliser). Utilise systématiquement ce skill dès qu'il est question de Google Calendar (events.insert RDV closer-prospect, freebusy.query disponibilité, watch push notifications, timezone Europe/Algiers, recurring events, attendees, Google Meet auto via conferenceData), Slack chat.postMessage pour notifs closer (lead assigné, hot lead, meeting booké), Block Kit pour messages riches avec boutons (Accepter/Refuser), signing secret verification webhooks entrants, scopes minimal (chat:write, channels:read), DM closer pour assignation, channel admin pour alertes système, interactive buttons. Rate limits (Google 1M req/jour 100/100s/user ; Slack 1 msg/s/channel tier 3 50+/min). Note : HubSpot géré via MCP HubSpot direct, voir skill hubspot-via-mcp.
---


Cette synthèse définit les standards techniques et architecturaux requis pour assurer la robustesse des intégrations de la plateforme TUC. En tant qu'Architecte de Solutions, j'impose ces directives pour garantir une synchronisation sans faille entre la capture de leads et l'exécution commerciale.

#### 1\. Architecture Google Calendar API V3 : Synchronisation et Planification

L'établissement d'une synchronisation bidirectionnelle fluide entre TUC et Google Calendar est le pilier central de la conversion des prospects. Chaque seconde de latence ou erreur de conflit représente une opportunité de vente perdue. L'automatisation doit garantir une intégrité totale des données d'agenda pour que les closers se concentrent exclusivement sur la vente.

* **Flux OAuth et Authentification :**  Implémentez le flux OAuth 2.0 en utilisant exclusivement les bibliothèques clientes officielles. Lors de l'échange initial du code d'autorisation, vous devez impérativement forcer le paramètre access\_type=offline pour obtenir un refresh\_token. Ce dernier est indispensable pour renouveler l' access\_token en arrière-plan sans intervention de l'utilisateur, assurant ainsi la persistance de la synchronisation.  
* **Gestion des Rendez-vous (RDV) :**  Utilisez la méthode events.insert pour la création des rencontres. Pour automatiser la visioconférence, intégrez l'objet conferenceData avec une createRequest appropriée (type hangoutsMeet). Cela génère nativement un lien Google Meet unique lors de la création de l'événement.  
* **Vérification des Disponibilités :**  Avant toute insertion, exécutez systématiquement une requête freebusy.query. Cette étape est non négociable pour interroger les créneaux libres en temps réel sur les calendriers des closers et éliminer les risques de "double-booking".  
* **Notifications Push et Temps Réel :**  Établissez un cycle de vie de notification via la méthode watch. Vous devez gérer l'expiration des canaux de notification en renouvelant les webhooks avant leur terme. En fin de cycle de vie ou lors d'une déconnexion, appelez explicitement channels.stop pour éviter les notifications "zombies" et la consommation inutile de ressources.  
* **Configurations Spécifiques :**  La précision temporelle repose sur l'application du fuseau horaire Europe/Algiers. Ce fuseau doit être spécifié explicitement dans le champ timeZone du corps de la requête API lors de la création de l'événement. Assurez la gestion des recurring events et maintenez la liste des attendees à jour pour synchroniser les invitations par email.**Transition :**  La validation d'un créneau dans l'agenda Google déclenche immédiatement l'orchestration des flux de communication dans Slack.

#### 2\. Infrastructure Slack API : Communication et Interactivité

Slack constitue le centre de commande opérationnel où les closers reçoivent et traitent les leads. L'interface doit être conçue pour minimiser la friction cognitive et maximiser la réactivité.

* **Méthodes de Messagerie :**  Utilisez chat.postMessage pour l'envoi de toutes les notifications critiques. Cette méthode est le vecteur principal pour l'assignation des leads "hot" et les confirmations de meetings.  
* **Interface Utilisateur avec Block Kit :**  Construisez des messages riches via le framework Block Kit. Le champ text de premier niveau doit être utilisé comme fallback obligatoire (affichage dans les notifications système) tandis que le tableau blocks définit l'UI interactive.  
* *Exemple de structure JSON pour l'interactivité :*  { "blocks": \[ { "type": "section", "text": { "type": "mrkdwn", "text": "*Nouveau Lead:* Jean Dupont" } }, { "type": "actions", "elements": { "type": "button", "text": { "type": "plain\_text", "text": "Accepter" }, "style": "primary", "value": "accept\_lead" }, { "type": "button", "text": { "type": "plain\_text", "text": "Refuser" }, "style": "danger", "value": "refuse\_lead" } } \] }  
* **Sécurité et Vérification :**  Sécurisez tous les webhooks entrants en vérifiant la signature Slack. Le processus exige la concaténation de la version, du timestamp et du corps brut de la requête (v0:timestamp:raw\_body). Calculez le HMAC SHA-256 en utilisant votre signing secret.  **Note critique :**  Rejetez systématiquement toute requête dont le timestamp diffère de l'heure locale de plus de cinq minutes pour prévenir les attaques par rejeu.  
* **Gestion des Permissions (Scopes) :**  Appliquez le principe du moindre privilège. Limitez les permissions de l'application aux scopes chat:write, channels:read et chat:write.public (ce dernier permettant de poster dans les canaux publics sans invitation préalable).**Transition :**  Une fois cette infrastructure sécurisée, le bot TUC peut orchestrer intelligemment les flux de travail.

#### 3\. Logique Opérationnelle du Bot Slack TUC

L'automatisation du bot Slack vise à supprimer les latences humaines en transformant les événements système en actions immédiates pour les équipes de vente.

* **Canaux de Communication Ciblés :**  Segmentez strictement les flux. Les messages directs (DM) sont réservés aux notifications de tâches individuelles (assignation directe), tandis que le canal "Admin" centralise les alertes de santé du système.  
* **Alertes de Santé Système :**  Programmez des déclencheurs automatiques pour notifier l'équipe technique en cas de saturation des files d'attente des closers ou d'échecs critiques d'exécution des Edge Functions Lovable.  
* **Interactivité et Réactivité :**  L'usage de boutons interactifs réduit radicalement le temps de prise en charge. Une action effectuée via Block Kit doit déclencher un retour visuel immédiat (mise à jour du message original via chat.update) pour confirmer que le lead est en cours de traitement.**Transition :**  L'efficacité de ces automatisations est strictement limitée par les quotas imposés par les fournisseurs de services.

#### 4\. Analyse Comparative des Quotas et Rate Limits

La haute disponibilité du service TUC exige une gestion proactive de la pression sur les API. Tout dépassement de quota entraîne une rupture de service immédiate.| Fournisseur | Limite de Requêtes | Spécificités Critiques || \------ | \------ | \------ || **Google Calendar** | 1 000 000 req/jour | 100 req / 100s / utilisateur || **HubSpot** | 100 req / 10s | 250 000 req / jour || **Slack** | 1 msg / s / canal | Tier 3 (50+ req / min) |  
**Stratégie de Consommation :**  Les boucles d'itération dans le code Lovable doivent intégrer une logique d' **exponential backoff** . En cas de réception d'une erreur HTTP 429 (Too Many Requests), le système doit impérativement lire la valeur du header Retry-After pour suspendre les appels avant de retenter l'opération.**Transition :**  Au-delà des limites quantitatives, la stabilité repose sur l'éradication des erreurs de conception structurelles.

#### 5\. Analyse des Anti-patterns d'Intégration à Proscrire

Pour maintenir l'intégrité de l'environnement Lovable, les pratiques suivantes sont formellement interdites :

* **Absence de Pagination :**  Le traitement de listes (leads, événements) sans pagination est une faute grave. Utilisez obligatoirement les paramètres pageToken (Google) ou cursor (Slack/HubSpot) pour traiter les données par segments.  
* **Abus du Batch Processing :**  Le regroupement massif de requêtes, bien que séduisant, provoque des pics de charge qui déclenchent les sécurités anti-flood. Préférez un lissage des appels dans le temps.  
* **Gestion des Secrets :**  Ne stockez jamais de credentials en dur. Utilisez l'isolation par variables d'environnement pour séparer strictement les clés de développement des clés de production.  
* **Résilience et Observabilité :**  L'absence de journalisation des payloads d'erreur et de logique de "Retry" automatique rend le système opaque et fragile. Chaque échec API doit être logué avec son contexte complet.  
* **Sur-privilège des Scopes :**  L'utilisation de tokens "admin" globaux est proscrite. Une compromission de jeton sur-privilégié exposerait l'intégralité de l'infrastructure TUC.**Transition :**  Ces principes de rigueur sont condensés dans la checklist finale de mise en production.

#### 6\. Checklist de Validation Finale (12 Points de Contrôle)

Ce protocole représente la barrière de sécurité ultime avant tout déploiement de l'agent IA TUC.

* **Sécurité & Authentification**  
*  Calcul de signature HMAC avec secret partagé et vérification du delta de 5 minutes.  
*  Variables d'environnement isolées (Clés API, Secrets Client).  
*  Flux de rafraîchissement OAuth testé avec access\_type=offline.  
* **Performance & Résilience**  
*  Limitation logicielle à 1 message/seconde par canal Slack.  
*  Gestion des erreurs 429 avec respect du header Retry-After et exponential backoff.  
*  Timeout des Edge Functions configuré pour éviter les processus pendants.  
* **Intégrité des Données Calendrier**  
*  Injection de Europe/Algiers dans le champ timeZone du corps des requêtes.  
*  Appel prioritaire à freebusy.query avant chaque events.insert.  
*  Nettoyage systématique des ressources via channels.stop lors de la fermeture des webhooks.  
* **Interface & Mapping**  
*  Présence systématique du champ text (fallback) dans les payloads Block Kit.  
*  Utilisation des paramètres pageToken ou cursor pour toutes les lectures de listes.  
*  Journalisation centralisée des payloads JSON en cas d'erreur API (4xx/5xx).

