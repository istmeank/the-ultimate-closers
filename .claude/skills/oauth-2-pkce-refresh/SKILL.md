---
name: oauth-2-pkce-refresh
description: Expertise complète pour implémenter les flows OAuth 2.0 dans TUC (Google Calendar + HubSpot + Slack actuellement + futurs providers). Utilise systématiquement ce skill dès qu'il est question de Authorization Code Flow + PKCE (code_verifier S256), state CSRF protection, refresh token rotation (T-5min avant expiry, rotation à chaque refresh), redirect URI whitelist (vs wildcards), Edge Function /oauth/callback universel (verify state → exchange code → encrypt via Vault → store closer_integrations), scopes minimal (Google calendar.events, HubSpot contacts/deals, Slack chat:write/bot), Implicit Flow proscrit, gestion révocation/refresh-token-rejected, providers TUC actuels (Google/HubSpot/Slack) + futurs (WhatsApp/Telegram/Meta). Anti-patterns incluant pas de state CSRF, implicit flow, refresh sans rotation, tokens en clair, redirect URI wildcards, scopes over-privileged.
---


En tant qu'Architecte Senior en Identité et Accès, je considère le choix du flux d'autorisation comme la décision structurelle la plus critique de l'écosystème TUC. Pour un agent d'intelligence artificielle manipulant des données sensibles via des API tierces, la sécurité ne peut être une surcouche : elle doit être encodée dans le protocole même. Une compromission ici ne signifie pas seulement une fuite de données, mais l'usurpation totale des capacités d'action de l'agent au nom de l'utilisateur.

1\. Fondamentaux des Flux OAuth 2.0 dans l'Écosystème TUC

Le choix d'un flux moderne est un impératif stratégique pour réduire la surface d'attaque. L'architecture TUC repose sur une approche "Security-by-Design" où chaque flux est sélectionné pour sa robustesse face aux menaces actuelles.

\* Authorization Code Flow (Server-side) : Ce flux est le standard non-négociable pour les échanges via le backend TUC. Il garantit que les tokens d'accès ne transitent jamais par l'agent utilisateur (navigateur), restant confinés dans notre environnement sécurisé.  
\* PKCE (Proof Key for Code Exchange \- RFC 7636\) : Bien qu'initialement conçu pour les clients publics, l'implémentation du PKCE est obligatoire pour TUC, même en tant que client confidentiel. Il ajoute une couche de défense contre l'injection de code d'autorisation, une menace que le secret client seul ne peut totalement neutraliser.  
\* Client Credentials : Utilisé strictement pour les interactions machine-to-machine (M2M) sans contexte utilisateur (ex: monitoring système, logs d'infrastructure).  
\* Implicit Flow (Proscrit) : Ce flux est formellement banni. Son absence de secret et l'exposition des tokens dans les fragments d'URL — susceptibles de fuiter via les headers Referer ou l'historique du navigateur — représentent une vulnérabilité fatale.

Cette sélection rigoureuse minimise les risques d'interception et de rejeu, créant une isolation étanche entre les credentials de l'utilisateur et l'environnement d'exécution de l'IA.

2\. Mécanique Précise du Protocole PKCE

Le PKCE sécurise le canal de retour (callback) en liant la phase d'autorisation à la phase d'échange de tokens par un secret éphémère. Cela rend tout code d'autorisation intercepté parfaitement inutile pour un attaquant.

1\. Génération du code\_verifier : Le client doit générer une chaîne aléatoire cryptographique à haute entropie, d'une longueur comprise entre 43 et 128 caractères, utilisant exclusivement les caractères non-réservés (A-Z, a-z, 0-9, et \-.\_\~).

2\. Transformation code\_challenge (S256) : On applique un hachage SHA256 au code\_verifier. Le résultat binaire est ensuite transformé via un encodage Base64-URL. Cette étape est cruciale : elle nécessite de remplacer \+ par \-, / par \_, et de supprimer tout rembourrage (padding) \=. Cette transformation garantit que le challenge est compatible avec le transport URL sans altération par les couches de routage Edge.

3\. Protection CSRF via 'state' : L'usage d'un paramètre state unique et imprévisible est obligatoire. Il permet de corréler de manière déterministe la réponse du serveur d'autorisation avec la requête initiale, bloquant ainsi toute tentative de fixation de session.

4\. Validation des Redirect URIs : Le serveur d'autorisation doit valider la requête contre une liste blanche (whitelist) exacte. Toute utilisation de wildcards est une faille permettant l'exfiltration de codes via des "Open Redirectors".

Si un client omet ces paramètres, le serveur d'autorisation doit rejeter la requête avec l'erreur standard invalid\_request, assurant ainsi une conformité stricte au protocole.

3\. Architecture de Stockage et Chiffrement des Tokens

Le stockage de tokens "en clair" constitue un point de défaillance unique inacceptable. Une fuite de base de données ne doit jamais se traduire par une compromission des accès tiers.

\* Référentiel closer\_integrations : Cette table centralise les accès, mais ne contient aucune donnée sensible lisible.  
\* Chiffrement via secrets-vault-pgsodium : TUC délègue le chiffrement au niveau de la couche base de données (Hardware Security Module ou vault logiciel intégré). Contrairement au chiffrement applicatif classique, cette approche réduit le "blast radius" : même si l'instance Deno ou les variables d'environnement du serveur sont compromises, les tokens restent chiffrés et inexploitables sans les clés du vault.  
\* Métadonnées et Horodatage : Nous stockons systématiquement les timestamps d'expiration. Cela permet à l'agent IA de déclencher une logique de renouvellement proactive, évitant les échecs d'appels API en cours de tâche complexe.

4\. Rotation Dynamique et Cycle de Vie des Refresh Tokens

L'agent IA TUC nécessite une session persistante pour exécuter des tâches asynchrones sans intervention humaine répétée. Pour sécuriser cette persistance, nous implémentons la Refresh Token Rotation.

\* Anticipation (T-5 min) : L'agent initie le rafraîchissement 5 minutes avant l'expiration du token d'accès pour garantir une continuité de service.  
\* Concept de "Token Family" : Chaque usage d'un refresh token invalide celui-ci et génère un nouveau couple (Access/Refresh). Tous les tokens issus d'un même consentement initial appartiennent à la même famille.  
\* Détection de Réutilisation : Si un ancien refresh token déjà utilisé est présenté au serveur (indice de vol), la "Token Family" entière est immédiatement révoquée. Ce mécanisme de sécurité force une ré-authentification manuelle de l'utilisateur, neutralisant instantanément l'accès de l'attaquant.

Cette rotation dynamique limite la durée de vie de toute fuite potentielle à une fenêtre temporelle extrêmement réduite.

5\. Pattern Universel : Edge Function Deno pour /oauth/callback

L'utilisation de Deno au sein d'une infrastructure Edge permet un déploiement global et une latence minimale. Toutefois, ces fonctions sont par nature stateless (sans état).

1\. Vérification Stateless du 'state' : Puisque la fonction Edge ne conserve pas de mémoire locale, le paramètre state doit être vérifié contre un cookie sécurisé (HttpOnly, SameSite=Lax) ou une entrée éphémère dans une base de données rapide (type Redis/Supabase) créée lors de l'initiation du flux.  
2\. Échange Sécurisé (Exchange Flow) : La fonction Edge transmet le code d'autorisation, le client\_id, le client\_secret et le code\_verifier original au fournisseur.  
3\. Persistance Cryptographique : Après réception, les tokens sont immédiatement envoyés vers le secrets-vault pour chiffrement avant insertion dans closer\_integrations.  
4\. Gestion des Erreurs RFC : En cas d'échec (ex: invalid\_grant), la fonction doit logger l'événement de sécurité et rediriger l'utilisateur vers une interface d'erreur explicite sans exposer de détails techniques internes.

6\. Cartographie des Intégrations : Google, HubSpot et Slack

L'application rigoureuse du principe du moindre privilège (Least Privilege) est la défense ultime contre l'escalade de privilèges par l'IA.

Fournisseur	Scopes Recommandés	Finalité pour l'Agent IA	Risque de Sécurité Spécifique  
Google Calendar	calendar.events	Gestion d'agenda et planification.	Accès aux données de réunions privées.  
HubSpot	contacts, deals	Mise à jour du CRM et suivi.	Exfiltration de la base client.  
Slack	chat:write, bot	Notifications et interactions.	Usurpation d'identité sur les canaux.

Limiter les scopes réduit drastiquement l'impact potentiel d'une compromission de l'agent TUC, protégeant l'intégrité globale du compte utilisateur.

7\. Analyse des Anti-patterns et Failles de Sécurité

La conformité aux RFC n'est pas optionnelle. Voici les dérives architecturales que TUC rejette formellement :

1\. Omission du 'state' : Absence de protection contre le CSRF, permettant à un attaquant de lier son propre compte au profil TUC de la victime.  
2\. Usage de l'Implicit Flow : Exposition fatale des tokens. Risque majeur de fuite via le header Referer vers des domaines tiers.  
3\. Stockage des tokens en clair : Violation de conformité majeure. Une simple lecture de table permettrait une compromission totale de tous les utilisateurs.  
4\. Absence de rotation des Refresh Tokens : Permet une persistence infinie pour un token volé, sans aucun moyen de détection automatique.  
5\. Wildcards dans les Redirect URIs : Vulnérabilité aux "Open Redirectors" (Section 10.15 de la RFC 6749), permettant le détournement du code d'autorisation vers un serveur tiers malveillant.  
6\. Scopes sur-privilégiés : Violation du Least Privilege. Un agent IA ayant accès à admin ou full\_access transforme une erreur de prompt en catastrophe sécuritaire.

8\. Checklist de Validation pour le Déploiement

Tout déploiement d'une nouvelle intégration doit valider ces 10 points de contrôle impératifs :

1\. \[ \] PKCE S256 : Utilisation systématique du code\_challenge avec hachage SHA256.  
2\. \[ \] Base64-URL Encoding : Validation de la suppression du padding \= et du remplacement de \+/ pour la compatibilité Edge.  
3\. \[ \] Vault Chiffrement : Confirmation que les tokens ne touchent jamais le disque en clair (via pgsodium).  
4\. \[ \] Rotation Active : Mécanisme de rotation des refresh tokens testé et validé.  
5\. \[ \] Reuse Detection : Test de révocation immédiate de la "Token Family" lors d'une tentative de rejeu.  
6\. \[ \] Scopes Minimaux : Audit de sécurité pour confirmer que seuls les scopes nécessaires sont demandés.  
7\. \[ \] Whitelist Stricte : URLs de redirection figées, sans wildcards, obligatoirement en HTTPS.  
8\. \[ \] State Validation : Vérification du state via cookie sécurisé ou stockage éphémère côté serveur.  
9\. \[ \] RFC Error Codes : Implémentation correcte des réponses d'erreur (ex: invalid\_request, access\_denied).  
10\. \[ \] Stateless Execution : Architecture Deno Edge confirmée comme étant sans état pour garantir la scalabilité et l'isolation.

La confiance de l'utilisateur final est l'actif le plus précieux de TUC. Cette architecture OAuth 2.0 est le rempart technique indispensable qui protège cet actif contre les menaces modernes du Cloud et de l'IA.

