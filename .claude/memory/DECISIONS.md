# DECISIONS — Architecture Decision Records (ADR)

> Chaque décision structurante du projet TUC est consignée ici.
> Format : ADR léger. On ne supprime jamais une décision, on l'annote "superseded by ADR-XXX" si elle change.

## Pourquoi ce registre
Pour qu'aucune décision importante ne soit perdue, contredite par accident, ou refaite sans raison. La cohérence du projet en dépend.

## Format d'une entrée

```
## ADR-001 — Titre court de la décision
- Date : YYYY-MM-DD
- Statut : proposée | acceptée | refusée | superseded by ADR-XXX
- Contexte : pourquoi la question se pose
- Décision : ce qu'on choisit, en une phrase
- Conséquences : ce que ça change, ce qu'on accepte de perdre
- Alternatives écartées : ce qu'on a regardé et pourquoi on n'a pas pris
```

---

<!-- Première décision à ajouter ici quand elle arrive -->

## ADR-001 — Architecture RBAC + RLS pour TUC-v2
- Date : 2026-06-07
- Statut : acceptée
- Contexte : TUC-v2 (Supabase llxgyomevketvypusafl) doit garantir une isolation stricte des données entre owners, admins, closers et leurs leads, sans aucune faille RLS et conformément OWASP 2025. Le legacy Lovable contenait 30 migrations chaotiques avec 6 anomalies critiques (enum incohérent, has_role doublé, auth.uid() non wrappé, search_path non sécurisé, USING true non justifiés, tokens en clair).
- Décision : adopter le modèle RBAC hiérarchique `owner > admin > closer > user` (enum app_role 4 valeurs) + table `user_roles` source de vérité + fonction `has_role(uuid, app_role)` SECURITY DEFINER avec search_path restreint (pg_catalog, public, pg_temp). RLS optimisée : `(select auth.uid())` wrappée systématiquement (perf +99%), clause `TO authenticated/anon` partout, `USING` + `WITH CHECK` séparés sur UPDATE/INSERT, soft delete (`deleted_at`) sur leads/appointments/deals avec partial indexes. SECURITY DEFINER REVOKE EXECUTE FROM anon/authenticated (utilisable uniquement par triggers/policies). Stockage : 3 buckets (avatars public read URL-only, formations admin-only, site-images public). 17 tables, 41 policies RLS, 66 indexes, 3 migrations versionnées appliquées sur TUC-v2 (tuc_v2_baseline, tuc_v2_rls_policies_and_storage, tuc_v2_security_hardening).
- Conséquences : modèle stable et performant pour MVP. RBAC stocké en table → 1 JOIN par requête RLS (acceptable jusqu'à ~10k users actifs). Migration vers `app_metadata` JWT reportée Vague 3 (gros refactor Auth Hook + frontend). Tokens OAuth en clair acceptés en MVP avec BLOCKER-001 ouvert (à chiffrer via pgsodium/Vault avant prod réelle).
- Alternatives écartées : (a) RBAC via JWT app_metadata dès baseline → rejeté car nécessite Auth Hook custom + refactor frontend (trop coûteux pour Vague 1) ; (b) un seul rôle `admin` sans hiérarchie → rejeté car ne permet pas la distinction owner/closer/user requise par le produit ; (c) RLS sans wrapping `(select auth.uid())` → rejeté car perte de perf 99% sur grosses tables documentée par le skill `supabase-auth-rls`.
- Conformité skill `supabase-auth-rls` : 13/15 checklist (items manquants : RBAC JWT app_metadata et getClaims SSR — N/A pour Vite SPA).
- Lien rapport audit : `docs/security-audit-baseline.md`
- Lien BLOCKERS ouverts : BLOCKER-001 (tokens), H8/H9 (rate limit INSERT public)

## ADR-026 — Silicate = holding ET incubateur en période de maturation
- Date : 2026-06-23
- Statut : acceptée (réactivé — remplace la version abandonnée en session 29)
- Contexte : session 29 avait abandonné ADR-026 en interprétant Silicate comme "architecte de gouvernance uniquement, pas holding". Nacer corrige en session 31 : Silicate est les deux — **holding ET incubateur**, en période de maturation active.
- Décision : Silicate = structure qui (1) chapeaute LULG + TUC + ANK sur le plan identitaire et de gouvernance ET (2) incube des entités selon une méthodologie reproductible (le squelette). La forme juridique est en maturation — pas encore constituée. La gouvernance est en bêta et se prouve par les sessions elles-mêmes.
- Conséquences : le squelette Silicate (v0.6 et suivants) est à la fois l'outil de gouvernance interne ET le produit d'incubation exportable vers d'autres entreprises plus tard. TUC construit le système d'acquisition de LULG. LULG est prioritaire (Nacer). ANK est le LLM commun.
- Alternatives écartées : "Silicate = simple architecte sans dimension holding" (trop limitatif, ne reflète pas la vision fondatrice).
- Lien JOURNAL : session 31 — 2026-06-23

## ADR-031 — P17 (forme juridique + couches MBA) = N/A pour les repos et projets techniques
- Date : 2026-06-23
- Statut : acceptée
- Contexte : lors de l'application du squelette Silicate v0.6 sur TUC tech (repo GitHub), la pierre P17 (forme juridique + architecture management 5 couches) ne s'applique pas. Un repo n'est pas une entreprise — il n'a pas de forme juridique, pas de couches managériales au sens MBA.
- Décision : le squelette Silicate est **contextuel** — il s'adapte selon le type d'instance cible : (1) Entreprise / entité juridique → toutes les pierres dont P17 ; (2) Repo / projet technique → P17 remplacée par "architecture technique + agents codeurs + couche services" ; (3) Communauté / programme → P17 adaptée selon les besoins. L'INDEX du squelette doit mentionner cette adaptabilité (suggestion à remonter à Nacer pour skeleton-modules/00-INDEX.md).
- Conséquences : TUC tech score 20/24 pierres (P17 = N/A, non comptée dans le score repo tech). Score effectif : 20/23 pierres applicables.
- Lien JOURNAL : session 31 — 2026-06-23

---

## ADR-032 — P21 : Managed Agents = LOCAL par défaut pour TUC tech

**Date** : 2026-06-23  
**Session** : 32  
**Statut** : Actif  
**Décideur** : Nacer (approbation via "continue les Pierres restantes")

### Contexte
Pierre 21 du squelette Silicate v0.6 exige l'application de la matrice Managed vs Local avant tout déploiement cloud.

### Décision
TUC tech reste **LOCAL (principal)** pour toute la gouvernance et les données sensibles.  
Managed Agents = optionnel uniquement pour tâches API autonomes **non sensibles** (veille, scripts génériques).  
Q2 et Q5 sont **bloquants** : filesystem local requis + données prospects RGPD.

### Conséquences
- Aucun agent de gouvernance ne migre en cloud sans nouvelle décision explicite
- Toute tâche Managed candidate doit repasser les 5 questions P21
- Détail dans `docs/infrastructure-decision.md`

---

## ADR-033 — Score squelette Silicate v0.6 : 23/23

**Date** : 2026-06-23  
**Session** : 32  
**Statut** : Actif  
**Décideur** : Nacer

### Contexte
Session 31 avait atteint 20/23. 4 pierres restantes (P16, P16-B, P18, P21) implémentées en session 32.

### Décision
TUC tech est **conforme à 100% du squelette Silicate v0.6** (23/23 pierres applicables).  
P17 reste N/A (ADR-031 — repos/projets n'ont pas de forme juridique).

### Conséquences
- Prochaine évolution : v0.7 du squelette (P17 adaptabilité à remonter à SILICATE)
- T28 (couche d'abstraction services) = prochaine priorité technique absolue

---

## ADR-034 — Stratégie AEO : rendre TUC citable par les moteurs de réponse IA

**Date** : 2026-07-25
**Session** : 33
**Statut** : Actif
**Décideur** : Nacer

### Contexte
Le site theultimateclosers.com est une SPA React rendue intégralement côté client. Une récupération HTTP de la page d'accueil ne renvoie que les métadonnées : aucun titre de section, aucun paragraphe, aucun contenu de service. Les moteurs de recherche classiques exécutent JavaScript ; les moteurs de réponse IA (ChatGPT Search, Perplexity, Claude, Google AI Overviews) le font mal ou pas du tout et sélectionnent leurs sources sur la structure et l'extractibilité du contenu.

Constat aggravant : le marché de TUC — « closing éthique en Algérie », « IA en darija » — est précisément le type de requête de niche où un moteur de réponse cite volontiers une source spécialisée, même mal classée en SEO traditionnel. L'opportunité est réelle et actuellement inexploitée.

Aucune donnée structurée (`schema.org`) n'existait, ni `sitemap.xml`, ni `llms.txt`. Le `robots.txt` n'interdisait rien (`User-agent: * Allow: /`) mais ne nommait aucun robot IA.

### Décision
Mise en place d'une couche AEO statique, sans modifier l'application React :

1. **`robots.txt`** — autorisation explicite des 16 robots IA nommés (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Claude-SearchBot, Google-Extended, Applebot-Extended, meta-externalagent, Amazonbot, MistralAI-User, etc.), interdiction des routes authentifiées (`/auth`, `/access-denied`, `/google-calendar/`, `/dziribert-demo`), déclaration du sitemap.
2. **`llms.txt`** — résumé structuré destiné aux agents IA : positionnement, périmètre, définitions du closing éthique et de l'IA en darija, charte relationnelle, et surtout une section « ce que nous ne faisons pas ».
3. **`sitemap.xml`** — pages publiques uniquement, avec alternances hreflang FR / EN / ar-DZ.
4. **JSON-LD dans `index.html`** — graphe `Organization`, `WebSite`, `ProfessionalService` (catalogue des trois offres IA) et `FAQPage` (quatre questions rédigées en langage naturel).
5. **Bloc `<noscript>`** — contenu de repli sémantique (H1, définitions, services, charte relationnelle) servi aux robots qui n'exécutent pas JavaScript, remplacé par React à l'hydratation et donc invisible pour un visiteur humain.
6. **Canonique, `og:locale`, directive `robots` avec `max-snippet:-1`.**

Aucun chiffre, aucun témoignage, aucune référence client n'a été inventé pour nourrir ces fichiers. Tout le contenu dérive du brand framework TUC et du site existant.

### Conséquences
**Positives** : la page d'accueil devient lisible par un agent qui n'exécute pas JavaScript. Le `FAQPage` structuré est le format le plus directement cité par les moteurs de réponse. Le `llms.txt` donne une définition contrôlée de l'organisation, ce qui réduit le risque qu'un modèle décrive TUC de travers.
**Négatives** : le bloc `<noscript>` et le JSON-LD dupliquent le contenu de l'application React. Toute évolution du discours produit doit être répercutée aux deux endroits sous peine de divergence. Point de vigilance à intégrer au rituel de fin de tâche produit.

### Limite assumée
Cette couche traite la page d'accueil. Elle ne remplace pas un pré-rendu statique, qui reste la solution de fond pour l'ensemble des routes. Le pré-rendu est une décision d'architecture à part entière — dépendances, pipeline de build, hébergement — et relève d'une tâche du backlog, pas de cette session.

### Alternatives écartées
- **Migration vers Next.js / rendu serveur** — écarté pour cette session : refonte de l'architecture, incompatible avec la contrainte « pas de tâche complexe sans cadrage technique » (CLAUDE.md) et avec la priorité T28 en cours.
- **Pré-rendu au build via un greffon Vite** — écarté pour l'instant : ajoute une dépendance de build et un risque de régression de déploiement, à cadrer dans une tâche dédiée.
- **Ne rien faire en attendant le pré-rendu** — écarté : les fichiers statiques apportent l'essentiel du gain immédiat pour un risque de régression nul.

### Tâches associées
- [x] `public/robots.txt` — robots IA nommés + exclusions + sitemap
- [x] `public/llms.txt`
- [x] `public/sitemap.xml`
- [x] JSON-LD `Organization` / `WebSite` / `ProfessionalService` / `FAQPage`
- [x] Bloc `<noscript>` de repli
- [ ] **À créer au backlog** : tâche de pré-rendu statique de toutes les routes publiques
- [ ] **À créer au backlog** : contrôle de non-divergence entre le `<noscript>`, le JSON-LD et le contenu React

### Statut
Accepté — 2026-07-25. Demandé explicitement par Nacer (« modifications nécessaires par rapport au moteur de recherche IA gpt, perplexity donc l'AEO »).

---

## ADR-025 — Couche d'abstraction services entre React et le backend

**Date** : 2026-06-13 (proposée, session 27) — **actée le 2026-08-08 (session 34)**
**Statut** : Acceptée
**Décideur** : Nacer

### Contexte
ADR-025 était référencée par `code-standards.md`, par la tâche T28 et par
`docs/architecture-evolution.md`, mais n'avait jamais été écrite dans ce registre.
Une décision citée partout et consignée nulle part n'est pas opposable : elle ne
survit pas au changement de session. Cette entrée comble la lacune et acte
l'implémentation.

L'intuition d'origine de Nacer : « Supabase est limité et pour les bonnes options
il faut payer. » La question n'est pas de quitter Supabase aujourd'hui, mais de ne
pas rendre ce départ impossible demain.

### Décision
La couche présentation (`src/components`, `src/pages`, `src/hooks`, `src/contexts`)
ne communique jamais directement avec Supabase. Elle passe par `src/lib/services/`,
qui expose des interfaces TypeScript stables. Chaque service délègue à un adapter
`src/lib/adapters/supabase/`, seul endroit du dépôt autorisé à importer le client.

Migrer de backend revient alors à réécrire les adapters, sans toucher un seul écran.

### État au 2026-08-08
13 services, 13 adapters, 0 accès direct depuis la couche présentation
(une exception en allowlist : un fichier d'exemple non routé).
Trois mécanismes rendent la règle exécutoire plutôt que déclarative :

1. `scripts/check-supabase-abstraction.mjs` — échoue sur toute violation, testé
   dans les deux sens (détection confirmée sur sonde, retour au vert après retrait).
2. `contracts.test.ts` — 64 assertions vérifiant que chaque adapter honore son
   interface à l'exécution, là où TypeScript ne dit plus rien.
3. `substitution.test.ts` — remplace les adapters par des doubles et constate que
   les services fonctionnent : la démonstration que la bascule de backend est possible.

### Conséquences
**Positives** : les tâches T01 à T27 produisent désormais du code qui survit à la
migration. Le dépôt dispose enfin d'un harnais de test — il n'en avait aucun.
**Négatives** : une indirection supplémentaire à chaque appel, et l'obligation de
créer un service avant de brancher un écran. C'est le coût assumé : le contournement
est précisément ce que le garde-fou empêche.

### Alternatives écartées
- **Accès direct à Supabase, migration le jour venu** — écarté : chiffré à 12-15
  tâches à refondre contre 3-5 à ajuster (`docs/architecture-evolution.md`).
- **Migration immédiate vers un backend custom** — écarté : le MVP n'a pas de
  clients, l'effort n'est pas justifié aujourd'hui.
- **Convention documentée sans garde-fou automatisé** — écarté : une convention
  que rien ne vérifie tient jusqu'à la première urgence.

### Lien
`docs/architecture-evolution.md` · `taches-a-faire/T28-*.md` · `docs/deferred-capabilities.md`

---

## ADR-035 — Le script de vérification d'abstraction est écrit en Node, pas en shell

**Date** : 2026-08-08
**Session** : 34
**Statut** : Actif

### Contexte
La tâche T28 spécifiait `scripts/check-supabase-abstraction.sh`. Le poste de
travail de Nacer est sous Windows : un `.sh` n'y est pas exécutable nativement
hors Git Bash. Un garde-fou qu'on ne peut pas lancer sur la machine où l'on
développe ne protège rien.

### Décision
Script unique en Node (`scripts/check-supabase-abstraction.mjs`), exposé via
`npm run check:abstraction`. Node est déjà une dépendance du projet ; le script
tourne à l'identique sous Windows, Linux et en CI.

Un script `npm run verify` enchaîne les quatre contrôles de la règle d'or :
abstraction, types, tests, build.

### Conséquences
Écart assumé avec la lettre du ticket T28, au bénéfice de son intention.
Les hooks existants de `.claude/hooks/` restent en shell : ils s'exécutent
côté agent, pas côté poste de travail.
