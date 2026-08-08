---
name: owasp-saas-supabase
description: Expertise complète sur la sécurisation d'un SaaS B2B React + Supabase selon OWASP Top 10 2025. Utilise systématiquement ce skill dès qu'il est question d'audit sécurité, OWASP, IDOR, BOLA, BFLA, broken access control, multi-tenant, secrets management, rate limiting, anti-abus, sécurité frontend React, CSP, validation zod, content security policy, rotation de clés, GitHooks, Vault, Vercel env vars, ou de toute analyse de risques sur une architecture React + Supabase + Vercel. Inclut Top 10 OWASP 2025, analyse risques multi-tenant, checklist 20 points (4 catégories), 8 pièges authentification moderne, stratégie secrets management, patterns rate limiting avec Upstash.
---

# Synthèse Stratégique : Sécurisation de l'Écosystème SaaS B2B (React + Supabase)

L'alignement sur les standards **OWASP 2025** n'est plus une option technique, mais un impératif de crédibilité commerciale pour toute solution SaaS B2B. Dans une architecture multi-tenant, une faille de contrôle d'accès (A01) constitue un "Extinction Level Event" : l'isolation logique des données est le contrat de confiance primaire entre le fournisseur et le client. En tant qu'architectes, on doit traiter la sécurité comme un processus de défense en profondeur, intégrant la protection contre les vulnérabilités applicatives et la maîtrise des coûts d'infrastructure face aux abus.

## 1. Panorama critique — Top 10 OWASP 2025

L'évolution des menaces souligne une transition vers des attaques sur la logique d'autorisation et l'intégrité de la supply chain. Synthèse des vecteurs critiques :

1. **A01:2025 — Broken Access Control** : échec des restrictions d'accès aux ressources. *Ex* : accès aux données d'un autre tenant via IDOR. *Prév* : "Deny by Default", validation systématique des droits côté serveur.
2. **A02:2025 — Security Misconfiguration** : paramètres de sécurité par défaut ou trop permissifs. *Ex* : clés API exposant des droits administratifs. *Prév* : durcissement des configurations et audit automatisé des permissions cloud.
3. **A03:2025 — Software Supply Chain Failures** : risques liés aux dépendances et pipelines CI/CD. *Ex* : package NPM compromis. *Prév* : utilisation de SBOM (Software Bill of Materials) et scan systématique des vulnérabilités.
4. **A04:2025 — Cryptographic Failures** : exposition de données par manque de chiffrement robuste. *Ex* : secrets en clair dans les logs ou le code. *Prév* : TLS 1.3 obligatoire et chiffrement AES-256 pour les données sensibles au repos.
5. **A05:2025 — Injection** : entrées malveillantes interprétées comme du code. *Ex* : SQL Injection via concaténation de chaînes. *Prév* : utilisation impérative de **Bind Variables (requêtes paramétrées)** ou d'un ORM/Query Builder.
6. **A06:2025 — Insecure Design** : absence de modélisation des menaces dès la conception. *Ex* : flux métier sans vérification d'état. *Prév* : cycle SDLC sécurisé et implémentation de patterns d'architecture éprouvés.
7. **A07:2025 — Authentication Failures** : faiblesses dans l'identification des entités. *Ex* : brute-force sur des mots de passe faibles. *Prév* : politiques de complexité stricte (15 chars min sans MFA) et généralisation du MFA.
8. **A08:2025 — Software and Data Integrity Failures** : flux de données ou mises à jour non vérifiés. *Ex* : désérialisation de données non signées. *Prév* : vérification systématique des signatures numériques et de l'intégrité des payloads.
9. **A09:2025 — Security Logging and Alerting Failures** : incapacité à détecter une intrusion. *Ex* : logs insuffisants pour reconstruire une attaque. *Prév* : journalisation centralisée (SIEM) et alertes en temps réel sur les anomalies.
10. **A10:2025 — Mishandling of Exceptional Conditions** : fuite d'informations via les erreurs. *Ex* : stack trace révélant le schéma DB. *Prév* : gestion générique des erreurs côté client et logs détaillés restreints au serveur.

## 2. Analyse de risques — spécificités SaaS B2B avec Supabase

Dans un environnement Backend-as-a-Service, la responsabilité est partagée : Supabase sécurise l'infrastructure, mais on est responsable de l'isolation logique des tenants. Le risque majeur réside dans la porosité de la base de données partagée.

- **Vecteur d'exposition multi-tenant (IDOR/BOLA)** : PostgREST expose directement les tables via une API REST. Une Row Level Security (RLS) mal définie permettrait à un utilisateur d'accéder aux "Leads" d'une autre organisation. On doit utiliser les fonctions `auth.uid()` et `auth.jwt()` pour lier chaque requête au `tenant_id` de l'utilisateur de manière immuable.
- **Élévation de privilèges (BFLA)** : un profil "Closer" peut tenter d'appeler des fonctions `rpc` (Remote Procedure Call) réservées aux administrateurs. L'autorisation doit être appliquée au niveau de la base de données (PostgreSQL) et non uniquement dans l'interface React.
- **Fuite de données de schéma** : par défaut, la clé `anon` permet une introspection du schéma via le point de terminaison `/rest/v1/`. Il est impératif de limiter les droits du rôle `anon` et de restreindre l'exposition des tables aux seuls schémas nécessaires.

## 3. Checklist audit express — 20 points de contrôle (React + Supabase)

L'audit doit être systématique avant chaque mise en production pour garantir une défense en profondeur.

### Catégorie 1 — Configuration Supabase et base de données
- [ ] **Deny by Default** : RLS activée sur TOUTES les tables ; aucune donnée accessible sans politique explicite.
- [ ] **Isolation stricte** : politiques `USING` et `WITH CHECK` basées sur `auth.jwt() -> 'tenant_id'`.
- [ ] **Privilège minimum** : aucun `GRANT` sur le `service_role` accordé aux rôles publics ou authentifiés.
- [ ] **Granularité** : politiques `ALL` interdites ; privilégier des politiques distinctes pour `SELECT`, `INSERT`, `UPDATE`.
- [ ] **Vues sécurisées** : utilisation de vues SQL pour restreindre l'accès aux colonnes sensibles (ex. marges, metadata).

### Catégorie 2 — Sécurité frontend React
- [ ] **Validation de schéma** : utilisation de `zod` ou `yup` pour valider TOUTES les réponses API et les entrées de formulaires.
- [ ] **Autorisation backend** : aucune logique de décision de sécurité exécutée uniquement en JavaScript côté client.
- [ ] **Sanitization** : nettoyage systématique des rendus dynamiques pour prévenir les XSS (ex. `DOMPurify`).
- [ ] **Sécurisation des headers** : implémentation d'une Content Security Policy (CSP) via Vercel.
- [ ] **Hygiène des états** : nettoyage des données sensibles dans le state management (Redux/Zustand) lors de la déconnexion.

### Catégorie 3 — Authentification et JWT
- [ ] **Validation d'audience** : vérifier que le claim `aud` du JWT correspond strictement au Supabase Project ID.
- [ ] **Intégrité des sessions** : validation systématique de l'expiration (`exp`) et de la signature des tokens.
- [ ] **Double confirmation** : processus de changement d'email via nonces envoyés à l'ancienne ET à la nouvelle adresse.
- [ ] **Re-authentification** : mot de passe requis pour les actions critiques (changement de mot de passe, suppression de compte).
- [ ] **Claims personnalisés** : rôles (Admin/Closer) injectés dans le JWT pour éviter les requêtes de jointure coûteuses en RLS.

### Catégorie 4 — Hygiène du repo et workflow
- [ ] **Analyse SCA** : scan automatique des dépendances vulnérables via le pipeline CI/CD.
- [ ] **Zéro Secret** : blocage des commits contenant des secrets via GitHooks (ex. `leaks-detector`).
- [ ] **Isolation des clés** : clé `service_role` strictement réservée au côté serveur (Node.js / Edge Functions).
- [ ] **Variables chiffrées** : utilisation de Vercel Environment Variables ou Vault pour les secrets de production.
- [ ] **Logs d'audit** : activation du monitoring sur les modifications de configuration de la base de données.

## 4. Les 8 pièges de l'authentification moderne

1. **Gestion des sessions persistantes** : l'absence de révocation de session côté serveur rend les comptes vulnérables en cas de vol de jeton.
2. **Confiance aveugle dans le JWT côté client** : le frontend ne doit jamais décider des droits. La RLS Supabase est l'unique source de vérité pour l'autorisation.
3. **Messages d'erreur verbeux** : éviter "Email non trouvé" ; utiliser "Identifiants invalides" pour empêcher l'énumération de comptes.
4. **Absence de re-authentification** : permettre de changer des informations de facturation sans re-demander le mot de passe est une faille critique.
5. **Logique de changement d'email simpliste** : un attaquant ayant accès à une session peut détourner le compte. On exige une confirmation par nonce sur les deux adresses (actuelle et nouvelle).
6. **Faiblesse des mots de passe** : sans MFA, la longueur minimale doit être de 15 caractères pour résister aux attaques par dictionnaire modernes.
7. **Flux de Reset Password prévisibles** : les jetons de réinitialisation doivent être à usage unique, non prévisibles et expirer sous 15 minutes.
8. **Manque de MFA** : dans un contexte B2B, l'absence de second facteur est une négligence majeure. Son activation doit être le standard pour les profils "Admin".

## 5. Stratégie de secrets management

La clé `anon` est publique ; la clé `service_role` est une clé "root". Leur confusion est l'erreur la plus fréquente.

- **Initialisation sécurisée** : ne jamais instancier le client Supabase avec la `service_role` dans le code exécuté par le navigateur.
- **Stockage et injection** : utiliser **Vercel Edge Config** ou un **Vault** pour stocker les clés privées. Elles ne doivent jamais figurer dans le dépôt Git, même en `.env`.
- **Protocole de rotation** : rotation trimestrielle des secrets de signature JWT. Chaque rotation doit être suivie d'un **Vercel Redeploy** pour mettre à jour les variables d'environnement actives.
- **GitHooks** : implémenter des contrôles pré-commit pour rejeter toute tentative d'ajout de fichiers `.env` ou de patterns ressemblant à des clés secrètes.

## 6. Rate limiting et protection contre les abus (Vercel / Upstash)

La protection contre l'abus est une nécessité économique. L'attaque par "Unrestricted Resource Consumption" (API4:2023) peut générer des pics de facturation massifs sur l'infrastructure.

- **Throttling à l'Edge** : utiliser les **Vercel Edge Functions** pour intercepter et bloquer les requêtes malveillantes avant qu'elles n'atteignent Supabase, économisant ainsi des cycles CPU et des entrées/sorties DB.
- **Pattern Upstash (Redis)** : implémenter une "Sliding Window" pour limiter les tentatives de connexion par IP ou par utilisateur. Upstash est privilégié pour sa nature stateless, idéale pour les fonctions Edge.
- **Protection des flux métier** : appliquer des quotas drastiques sur les endpoints coûteux : création de compte (`/signup`), réinitialisation de mot de passe et exports de données massifs.

## Conclusion

La sécurité d'une plateforme SaaS B2B n'est jamais acquise. Elle repose sur une **défense en profondeur** où chaque couche (React, Vercel, Supabase, PostgreSQL) valide l'intégrité de la précédente. En appliquant rigoureusement le principe du "Deny by Default" et en automatisant les contrôles, on transforme la sécurité en un actif stratégique qui protège à la fois les données des clients et la rentabilité de l'infrastructure.
