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

---

## ADR-036 — Modèle de rôles TUC : sept rôles cumulables, sans hiérarchie implicite

**Date** : 2026-08-08
**Session** : 34
**Statut** : Actif
**Décideur** : Nacer (arbitrage explicite sur quatre questions)

### Contexte
Le front utilisait `developer` et `client`, absents de l'enum `app_role` qui n'en
comptait que quatre — toute écriture de ces rôles échouait en 22P02 (BLOCKER-010).
Nacer a par ailleurs confirmé un rôle `manager`, absent des deux côtés.

`docs/REFERENCE.md` ne spécifiait aucun modèle de rôles : il n'existait pas de
source de vérité produit sur ce point. Les quatre questions ont donc été posées
plutôt que tranchées par déduction.

Point relevé au cadrage : `user` n'était pas dans la liste des quatre rôles
énoncés par Nacer, alors que `handle_new_user()` l'attribue à chaque inscription.
Le retirer aurait fait échouer toute création de compte.

### Décision
Sept rôles : `owner` · `admin` · `manager` · `closer` · `developer` · `client` · `user`.

1. **Cumulables, sans hiérarchie implicite.** Une personne porte plusieurs rôles
   (`user_roles`, UNIQUE (user_id, role)). `owner` ne confère pas `admin` : les
   deux se posent explicitement. C'est ce que la base et le front faisaient déjà.
2. **`user` conservé comme socle technique.** Attribué à toute inscription, il ne
   donne accès à rien de sensible. Les rôles métier se posent par-dessus.
3. **`developer` sans accès aux données prospects.** Diagnostic, configuration,
   contenu — jamais `leads`, `appointments`, `deals`, `lead_interactions`.
4. **`client` retenu** — prospect converti disposant d'un espace personnel.
5. **Rôle apprenant écarté pour l'instant** — TUC Academy aura son propre site.
   Critère de réouverture consigné ci-dessous.

### Conséquences
**Refus par défaut** : cette extension n'accorde aucun droit. Les 93 politiques RLS
existantes ne mentionnent aucun des trois nouveaux rôles — un `manager` n'a donc
accès à rien de plus qu'un `user` tant que les politiques ne sont pas écrites.
C'est délibéré : un rôle qui existe sans droits est inoffensif, l'inverse ne l'est pas.
Les droits relèvent d'une migration distincte, sous `auth-security-rls`.

**Irréversibilité** : PostgreSQL ne sait pas retirer une valeur d'un enum. Défaire
exigerait de recréer le type et de réécrire chaque colonne et chaque politique qui
s'y réfèrent. D'où la retenue sur l'ajout d'un rôle « au cas où ».

**Sur `developer`** : restreindre l'accès aux données prospects a un coût réel —
déboguer un problème qu'on ne peut pas observer sur les données concernées est plus
difficile. Le coût est accepté : il découle du véto n°3 des valeurs TUC et de la
minimisation RGPD. Un prestataire technique n'a pas à devenir détenteur de données
personnelles pour faire son travail. Si le besoin se présente, la réponse sera une
procédure d'accès tracée et temporaire, pas un rôle permanent.

### Critère de réouverture — rôle apprenant
TUC Academy disposant de son propre site, le rôle n'est pas créé. Il le deviendra
si l'Academy **partage l'authentification du CRM** — compte unique, un apprenant
devenant closer sans se réinscrire. Si l'Academy a son propre système de comptes,
le rôle n'a pas lieu d'être ici, et l'ajouter alourdirait chaque politique de
sécurité sans contrepartie.

### Alternatives écartées
- **Rôles hiérarchiques** (`owner` > `admin` > `manager` > `closer`) — écarté :
  interdirait d'être manager sans être closer, et contredirait le schéma existant.
- **Suppression de `user`** — écarté : casse `handle_new_user()` et toute inscription.
- **`developer` avec accès complet** — écarté pour les motifs éthiques ci-dessus.

### Migrations
`20260808160000_tuc_v2_extend_app_role_enum.sql` — ajout des trois valeurs.
`20260808160100_tuc_v2_grant_founder_roles.sql` — `owner` + `admin` au fondateur.

### Lien
BLOCKER-010 · ADR-001 (RBAC initial, complétée et non contredite) · T03

---

## ADR-037 — meet-coaching : réutilisation sélective du pipeline meetily (Zackriya Solutions)

**Date** : 2026-08-08
**Session** : 35 (Cowork)
**Statut** : Actif
**Décideur** : Nacer (« on prend ce qui est bon et on laisse ce qui ne l'est pas »)

### Contexte
Repo externe `meetily` (github.com/Zackriya-Solutions/meeting-minutes, MIT) inspecté
dans `D:\Hp\Telechargement\REPO Github\`. C'est une app desktop (Tauri/Rust, macOS/
Windows) qui capture et résume des réunions en local via Whisper. `JOURNAL.md`
(session Vague 3, ligne ~293) prévoyait déjà l'agent `meet-coaching` avec un skill
`whisper-transcription` à créer — meetily ne contredit rien, il documente une
implémentation concrète de la même idée.

### Décision
On retient de meetily **le pipeline de traitement**, pas l'application :

**À garder (référence pour le futur skill `whisper-transcription` /
agent `meet-coaching`)** :
- Découpage d'un long transcript en chunks avec chevauchement
  (`backend/app/transcript_processor.py` : chunk_size ~5000 car., overlap ~1000)
  pour tenir dans le contexte du modèle sans perdre la continuité aux frontières.
- Sortie structurée validée par schéma (Pydantic `SummaryResponse`) plutôt que du
  texte libre — directement transposable en schéma Zod côté TUC pour la critique
  post-meet (3 forts + 2 axes + 1 réf éthique, format déjà fixé en Vague 3-4).
- Le principe *privacy-first* : transcription qui peut tourner sans envoyer les
  conversations prospect à un tiers non maîtrisé — aligné avec le véto n°3 des
  valeurs TUC (pas de stockage sensible non maîtrisé).

**À laisser** :
- L'app desktop Tauri/Rust et toute son UI — TUC est une SPA web (React/Vite/
  Supabase/Vercel), un client desktop séparé ajouterait une stack entière à
  maintenir pour rien.
- La compilation locale de whisper.cpp (scripts GPU/CPU par OS) — hors sujet pour
  un backend hébergé ; si le besoin de coût/latence se pose, arbitrage futur entre
  Whisper API (cloud, simple) et un service Whisper self-hosted (économique à
  volume, plus de maintenance).
- Le schéma SQLite et la couche offre commerciale « PRO » — non pertinentes.

### Conséquences
Aucun code copié à ce stade. Cette entrée sert de référence quand le skill
`whisper-transcription` et l'agent `meet-coaching` seront réellement implémentés
(toujours en attente, cf. LEARNING-036). Le choix concret Whisper API vs self-hosted
reste ouvert et devra faire l'objet de son propre arbitrage le moment venu.

### Alternatives écartées
- Faire tourner meetily tel quel en service séparé appelé par TUC — écarté : stack
  Rust/Tauri hors du périmètre technique de TUC, coût de maintenance disproportionné
  pour un besoin qui se résume à « transcrire + résumer en JSON structuré ».

### Lien
JOURNAL.md (Vague 3, agent meet-coaching + LEARNING-036) · agent `meet-coaching`
(à activer) · skill `whisper-transcription` (à créer)

---

## ADR-038 — WhatsApp : Baileys/whatsapp-web.js autorisé en interne/test, API Business officielle obligatoire pour tout envoi réel

**Date** : 2026-08-08
**Session** : 35 (Cowork)
**Statut** : Actif — amende T24 (ne le supersede pas entièrement)
**Décideur** : Nacer (arbitrage sur conflit signalé avec T24)

### Contexte
Repo externe `OpenWA` (github.com/rmyndharis/OpenWA, MIT) inspecté dans
`D:\Hp\Telechargement\REPO Github\` : gateway WhatsApp self-hosted en NestJS +
TypeORM/Postgres, moteurs Baileys et whatsapp-web.js (non officiels, simulent un
client WhatsApp Web — risque de ban Meta à volume commercial).

Nacer a d'abord proposé d'utiliser cette voie pour le MVP puis de migrer vers l'API
officielle. Ceci contredisait T24 (`taches-a-faire/T24-whatsapp-bot-local.md`), qui
différait tout bot WhatsApp non-officiel à V3 et imposait l'API Business Cloud dès
le premier envoi, précisément pour éviter ce risque de ban. Le conflit a été signalé
avant toute action ; Nacer a tranché entre trois options (garder T24 tel quel,
réviser T24 pour le MVP, ou nuancer) via question à choix.

### Décision
**Nuance retenue** : Baileys/whatsapp-web.js (via OpenWA ou équivalent) est
**autorisé pour prototyper en interne uniquement** — flux de test, numéros internes,
jamais un prospect réel. **L'API WhatsApp Business Cloud officielle reste
obligatoire avant tout envoi à un vrai prospect**, avec opt-in tracé
(`whatsapp_optins`) et validation `gardien-valeurs`. T24 n'est donc pas remplacé :
son exigence centrale (pas d'envoi réel sans API officielle) est confirmée, seule
la possibilité de prototyper en amont avec une lib non-officielle est ajoutée.

### Conséquences
- Le prototype interne peut démarrer sans attendre l'onboarding Meta Business
  (souvent lent : vérification d'entreprise, templates à faire approuver).
- Aucun numéro de prospect réel ne doit transiter par le moteur Baileys/
  whatsapp-web.js — à faire respecter par `gardien-valeurs` et par une variable de
  configuration explicite (ex. `WHATSAPP_ENGINE=test` vs `official`) plutôt qu'une
  simple convention non vérifiable.
- T24 passe de « différé V3 » à « prototype interne possible dès maintenant, envoi
  réel toujours bloqué sur l'API officielle ». Mise à jour reflétée dans
  `taches-a-faire/T24-whatsapp-bot-local.md` et `taches-a-faire/README.md`.
- Le ticket T24-bis (migration API Business officielle pour la prod) reste à ouvrir
  quand on s'en approche.

### Alternatives écartées
- Utiliser Baileys/whatsapp-web.js pour le MVP en production (proposition initiale
  de Nacer) — écarté : risque de ban du canal WhatsApp d'un closer en pleine
  activité commerciale, contradiction directe avec T24 et avec le véto compliance
  déjà posé.
- Garder T24 strictement inchangé, sans possibilité de prototyper — écarté : bloque
  tout travail d'intégration avant l'onboarding Meta, qui peut prendre des semaines.

### Lien
T24 (`taches-a-faire/T24-whatsapp-bot-local.md`) · skill `whatsapp-business-cloud-api`
· agent `gardien-valeurs` · agent `integrations`

### ADR-036 — complément du 2026-08-08 : rôle apprenant définitivement écarté

Le critère de réouverture posé plus haut est tranché. Nacer : « pour le CRM et
l'Académie ça sera deux sites différents avec chacune son auth ».

Authentifications séparées ⇒ un apprenant de l'Academy n'existe pas dans
`auth.users` du CRM. Un rôle `student` y serait inutilisable par construction.
**Décision : pas de rôle apprenant dans `app_role`.** L'enum reste à sept valeurs.

Conséquence à anticiper : le jour où un apprenant certifié devient closer, il
créera un second compte sur le CRM. Aucun lien automatique entre les deux
identités. Si ce lien devient nécessaire — reprendre l'historique de formation
dans le profil du closer — il se fera par une correspondance explicite (adresse
courriel ou identifiant de certification), pas par un rôle partagé.

### ADR-036 — complément du 2026-08-08 : périmètre du rôle `manager`

Décidé par Nacer : **une seule équipe de closers pour l'instant**, manager en
**lecture globale + réassignation de leads**.

Fait déterminant relevé au cadrage : il n'existe aucune notion d'équipe en base —
ni table `teams`, ni colonne `manager_id` sur `profiles`. « Les leads de son
équipe » était donc inexprimable en RLS. Avec une équipe unique, « son équipe »
et « tout le monde » se confondent : la lecture globale n'est pas un raccourci,
c'est la traduction exacte du besoin.

**Périmètre** : lecture de `leads`, `interactions`, `appointments`, `deals`,
`profiles` ; modification de `leads` limitée à la réassignation (un lead
supprimé ne peut être ni restauré ni créé par ce biais). Aucun accès à
`user_roles` — un manager ne se promeut pas lui-même. Aucun accès aux jetons
d'intégration.

**Déclencheur de révision, écrit pour ne pas être oublié** : à la **seconde
équipe**, cette lecture globale expose des données personnelles au-delà du
nécessaire et contredit le principe de minimisation (véto n°3). Le remède est
identifié : ajouter `manager_id` sur `profiles` et filtrer les politiques dessus.
Le report est assumé, pas ignoré.

**Méthode** : les politiques existantes ne sont pas modifiées. De nouvelles
politiques sont ajoutées — PostgreSQL les combine par OU logique, les droits des
closers, admins et owners restent intacts. Une migration qui n'altère rien se
relit et s'annule plus facilement qu'une migration qui réécrit.

Migration : `20260808170000_tuc_v2_manager_read_and_reassign.sql`.

## ADR-039 — Relais du squelette Silicate v0.6 → v1.5 sur TUC tech

**Date** : 2026-08-08
**Session** : 36 (Cowork, orchestrateur-silicate)
**Statut** : Actif
**Décideur** : Nacer (validation explicite du périmètre « relais complet maintenant »)

### Contexte
TUC tech avait reçu le squelette Silicate v0.6 (23/23 pierres applicables, sessions 31-32,
ADR-031/032/033). Le squelette source a évolué vers **v1.5** : restructuré en 8 modules
thématiques (`docs/skeleton-modules/`, ex-fichier unique `skeleton-gouvernance-v0.md`,
qui n'existe plus à ce chemin), passé de 23 à 28 pierres. La Pierre 16-B (relay SILICATE →
entité incubée) prévoit explicitement cette situation à son étape 7 : *« Si évolution du
squelette → orchestrateur-silicate notifie tous les orchestrateurs-entité »*.

### Décision
Application du delta v0.6 → v1.5 sur TUC tech, à l'exclusion des pierres non pertinentes
pour un repo technique (P16-B protocole d'incubation initiale déjà exécuté, P18-bis
triptyque BP réservé à TUC business) :

1. **ΔP3-bis** — création de `PLANIFICATION.md` à la racine : tableau de bord mutable,
   structuré par pôle, lu au bootstrap en dernier (après CLAUDE → JOURNAL → DECISIONS →
   LEARNINGS). Renvoie vers `taches-a-faire/README.md` et `docs/domains/*/PLAN.md` pour le
   détail — pas de troisième registre de tâches (interdiction explicite P27).
2. **P27** — section "État d'avancement par pôle" ajoutée à `CLAUDE.md` : une ligne de
   maturité par domaine + gouvernance/squelette + sécurité-infra, séparée des tâches
   (qui vivent dans `PLANIFICATION.md`).
3. **P0** — la référence au squelette dans `CLAUDE.md` portait une affirmation d'état
   absolu non datée (« ce repo honore... Silicate v0 » sans date ni moyen de vérifier).
   Corrigée : version + date de relay + rappel que le squelette évolue, à vérifier à la
   source avant de s'y fier.
4. **Frontmatter des 16 agents** (`silicate_skeleton_version`, `silicate_relay_date`) —
   mis à jour v0.6 → v1.5, 2026-06-23 → 2026-08-08.
5. **P25** — premier audit des 3 dettes invisibles réalisé (EVAL-002) : score 8/30
   (entité gouvernée), dette dominante cognitive (absence de glossaire TUC tech).
6. **P24, P26, P22-bis** — doctrine reconnue mais **non invoquée** à ce stade : P24 (rite
   d'archivage annuel) n'a pas lieu d'être avant un an d'existence du repo ; P26
   (arbitrage du harnais) n'a de valeur que si le runtime Claude Code est remis en
   question, ce qui n'est pas le cas ; P22-bis (5 types de handlers de hooks) reste un
   backlog technique, pas un relais immédiat — implémenter des hooks supplémentaires est
   une brique technique qui suit la règle « cadrage dev partenaire avant implémentation »
   (`CLAUDE.md`).
7. **¶P1** — vérifié après ajouts : `CLAUDE.md` passe de 89 à 105 lignes, sous le seuil
   de 200.
8. **¶P3** (format à 7 champs des Learning Records) — non rétrofité sur les 91 entrées
   existantes (LEARNINGS.md est append-only, on ne réécrit pas l'historique) ; à appliquer
   aux **nouvelles** entrées à partir de cette session.

### Conséquences
**Positives** : TUC tech aligné sur la version courante de la doctrine de gouvernance
réseau ; point de reprise de session net (`PLANIFICATION.md`) ; première mesure
quantifiée de la dette de l'entité.
**Négatives** : deux dettes restent ouvertes et assumées — glossaire TUC tech à créer
(pas inventé dans cette session, matière insuffisante pour l'écrire sans risque
d'invention) ; incohérence apparente entre `taches-a-faire/T01-T02` et les BLOCKERS déjà
résolus, à trancher en session dédiée plutôt que devinée ici.

### Alternatives écartées
- **Tout relayer y compris P24/P26/P22-bis en un seul geste** — écarté : P24 est
  prématuré (rite annuel sur un repo de 2 mois), P26 n'a pas d'objet sans remise en
  question du harnais, P22-bis est une brique technique qui doit suivre la règle de
  cadrage dev partenaire, pas être improvisée dans une session de relais doctrinal.
- **Réécrire les 91 LEARNINGS au format ¶P3** — écarté : violerait l'append-only (P3).
- **Créer un glossaire de mémoire** — écarté : discipline anti-invention (P7) ; un
  glossaire inventé plutôt qu'extrait fidèlement du corpus existant serait pire que son
  absence.

### Vérification d'application (P0 — preuve d'application)
- `wc -l CLAUDE.md` → 105 lignes (< 200, ¶P1 respecté), vérifié 2026-08-08.
- `grep -c silicate_skeleton_version .claude/agents/*.md` → 16/16 fichiers à `v1.5`,
  vérifié 2026-08-08.
- `PLANIFICATION.md` présent à la racine, vérifié 2026-08-08.

### Lien
`docs/skeleton-modules/00-INDEX.md` (SILICATE) · P16-B étape 7 · ADR-031/032/033
(relay initial v0.6) · EVAL-002 (audit P25) · `PLANIFICATION.md`
