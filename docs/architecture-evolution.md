# Architecture Evolution — Stratégie 3 phases : Supabase MVP → Backend custom Twenty-like

> **Auteur** : Nacer Maredj (avec orchestrateur TUC)
> **Date** : 2026-06-13 (session 27)
> **Statut** : doctrine architecturale opposable — informe TOUTES les décisions techniques TUC
> **ADR associé** : ADR-025 (en bas du document)
> **Lecture obligatoire** : par tous les agents codeurs (frontend-react, backend-supabase, integrations) AVANT chaque tâche du backlog

---

## 0. Le constat fondateur

Nacer (architecte identitaire, non-développeur) a posé en session 27 une question architecturale fondamentale :

> *« Quelle architecture est plus pertinente, TUC ou Twenty ? Surtout que plus tard j'aimerais avoir mon propre backend, car Supabase est limité et pour les bonnes options il faut payer. »*

Cette question révèle une **insatisfaction stratégique latente** avec Supabase à terme. L'orchestrateur la convertit en décision documentée.

**Verdict d'analyse comparative** : l'architecture inspirée de Twenty (NestJS + GraphQL + TypeORM + BullMQ + Postgres self-hosted) est **plus pertinente pour TUC mature** (M15-M24). L'architecture Supabase reste **plus pertinente pour TUC MVP** (M0-M12).

**Décision** : **stratégie d'évolution en 3 phases**, avec **discipline d'abstraction stricte dès aujourd'hui** pour rendre la transition future indolore.

---

## 1. Pourquoi Supabase reste le bon choix pour M0-M12

| Avantage | Description |
|---|---|
| **Time-to-MVP** | Auth + DB + Storage + Realtime + Edge Functions + RLS d'un coup |
| **Compatibilité Claude Code** | Supabase MCP natif = avance solo grâce à Claude + Nacer non-dev |
| **Coût bas** | Free tier suffit jusqu'à premier MRR (500 MB DB, 5 GB bandwidth, 50K MAU) |
| **Sécurité native** | RLS PostgreSQL puissant + Auth managée |
| **Patterns connus** | Edge Functions Deno + Realtime Channels + Storage buckets bien documentés |

**Cible idéale Supabase** : MVP rapide, équipe non-backend, charge < 10k users.

---

## 2. Pourquoi Supabase devient un goulot d'étranglement à M15+

| Problème | Description | Symptôme |
|---|---|---|
| **Vendor lock-in massif** | Auth, Vault, Realtime, Storage sont propriétaires Supabase | Migration = refonte de tout le code couplé |
| **Edge Functions limitées à 50s** | Impossible de traiter un meet 60 min en transcription | Timeout sur ANK Phase 2/3 fine-tuning, sur transcription Whisper batch |
| **Pas de workers GPU/Python lourds** | ANK fine-tuning nécessite GPU + Python — impossible sur Edge Deno | ANK Phase 2/3 bloqué |
| **Coût explosif au-delà Pro** | Pro $25 → Team $599 → Enterprise négocié | À ~10k users la facture explose 24× |
| **pgsodium déprécié** | Vault va migrer vers nouveau standard, mais l'écosystème actuel devient fragile | BLOCKER-001 chiffrement tokens repose sur cette dépendance |
| **Multi-tenant SaaS B2B faible** | RLS via JWT claims OK mais peu flexible vs. workspace-manager natif Twenty | Difficile de gérer 50+ agences closing avec isolation forte |
| **Réactivité temps réel plafonnée** | Realtime limites connexions + messages par plan | Difficile de scaler chats multi-canal et notifications |
| **Pas de jobs récurrents puissants** | pg_cron limité, pas d'orchestration BullMQ | Workflows complexes (sync HubSpot batch, re-scoring leads, archives) coûteux à coder |

**Cible idéale Twenty-like (NestJS)** : SaaS B2B mature, multi-tenant fort, ML/IA serveur, équipe technique solide, contrôle total.

---

## 3. La stratégie 3 phases

### Phase 1 — Supabase avec discipline d'abstraction (M0-M9)

**Objectif** : sortir le MVP TUC en 4-6 mois avec Supabase, **MAIS en respectant strictement la couche d'abstraction** qui prépare la migration.

#### Architecture src/ obligatoire

```
src/
├── components/      ← ne connaît QUE les services et hooks
├── pages/           ← idem
├── hooks/           ← peuvent consommer services, jamais supabase directement
│
├── lib/
│   ├── services/    ← couche d'abstraction (interface stable)
│   │   ├── auth.service.ts          ← signIn, signUp, signOut, getUser, getRole
│   │   ├── leads.service.ts         ← CRUD leads + filtres
│   │   ├── matching.service.ts      ← scoring + matching closer/prospect
│   │   ├── messaging.service.ts     ← multi-canal envoi + réception
│   │   ├── meet.service.ts          ← booking + transcription + feedback
│   │   ├── storage.service.ts       ← upload + download + signed URLs
│   │   ├── realtime.service.ts      ← subscriptions temps réel
│   │   ├── integrations.service.ts  ← OAuth Google/Slack/HubSpot
│   │   └── ai.service.ts            ← appels Claude + ANK
│   │
│   └── adapters/    ← implémentations spécifiques (changeables)
│       ├── supabase/                ← MVP M0-M12
│       │   ├── auth.supabase.ts
│       │   ├── leads.supabase.ts
│       │   └── ...
│       └── nestjs/                  ← cible M15-M24 (vide aujourd'hui)
│           └── (placeholder)
│
└── integrations/
    └── supabase/    ← exclusivement utilisé par les adapters Supabase
```

#### Règle d'abstraction non-négociable

**JAMAIS** :
```typescript
// ❌ INTERDIT dans src/components/ ou src/pages/
import { supabase } from '@/integrations/supabase/client'
const { data } = await supabase.from('leads').select('*')
```

**TOUJOURS** :
```typescript
// ✅ OBLIGATOIRE dans tout composant ou page
import { leadsService } from '@/lib/services/leads.service'
const leads = await leadsService.listForCloser(closerId)
```

#### Conséquences pratiques pour chaque tâche du backlog

| Tâche | Service à créer/utiliser | Risque migration sans abstraction |
|---|---|---|
| T01 chiffrement tokens | `secrets.service.ts` (interface : `getDecryptedToken(closerId, integrationType)`) | 🔴 CRITIQUE — Vault propriétaire |
| T06 useAuth multi-rôles | `auth.service.ts` avec `getRole()` | 🔴 MAJEUR — supabase.auth dans composant |
| T07 score-lead | `ai.service.ts` + `leads.service.ts` | 🔴 MAJEUR — Edge Function jetable |
| T09-T12 UI closer | `leads.service.ts` + `matching.service.ts` + `interactions.service.ts` | 🔴 MAJEUR si supabase direct dans composants |
| T13-T15 OAuth Google/Slack | `integrations.service.ts` (interface uniforme par provider) | 🔴 MAJEUR — Edge Function callbacks couplés |
| T16-T17 chatbot homepage | `ai.service.ts` + `leads.service.ts` | 🟡 MOYEN |
| T18-T20 admin | `closers.service.ts` + `analytics.service.ts` | 🔴 MAJEUR si queries direct supabase |
| T21 policies | (UI seul) | 🟢 NUL |
| T22 i18n | (UI seul) | 🟢 NUL |
| T26 env vars | `.env` standard | 🟡 MINEUR (adapter) |

#### Critères de fin de Phase 1 (= déclenchement transition)

La transition vers Phase 2 démarre quand **3 conditions sur 5 sont atteintes** :
- [ ] MRR mensuel > 5 000 € (revenu de quoi payer dev backend partenaire)
- [ ] Plus de 500 closers utilisateurs actifs sur la plateforme
- [ ] Au moins 1 fonctionnalité Supabase bloquante rencontrée (transcription > 50s, fine-tuning ANK, etc.)
- [ ] Coût mensuel Supabase > 200 €
- [ ] Dev backend senior recruté (CDI, freelance long terme, ou cofondateur tech)

---

### Phase 2 — Préparation transition (M9-M15)

**Objectif** : extraire progressivement les services Supabase vers backend custom, **service par service**, sans interruption du SaaS en prod.

#### Stack backend custom cible

| Composant | Choix | Raison |
|---|---|---|
| **Framework** | NestJS | Mature, modulaire, DI, similar Twenty, large communauté |
| **ORM** | Prisma | Migrations propres, type-safe, excellent DX (alternative TypeORM Twenty si on veut copier ses patterns) |
| **DB** | PostgreSQL self-hosted (Neon ou Hetzner) | Portable, performance, écosystème |
| **Queue / Workers** | BullMQ + Redis | Workers ML, transcription, fine-tuning, sync batch |
| **Realtime** | Socket.io (ou GraphQL subscriptions si on bascule API GraphQL) | Sur-mesure, illimité |
| **Storage** | Cloudflare R2 (compatible S3) | Coût bas, CDN intégré, free tier 10 GB |
| **Auth** | Passport.js + JWT custom + refresh rotation | Indépendant, compatible OAuth providers |
| **Secrets** | HashiCorp Vault OU AWS KMS OU env vars chiffrées | Plus de pgsodium Supabase |
| **Hébergement** | Hetzner VPS (5-20 €/mois) ou Railway ($5-50/mois) | Coût prévisible vs. Supabase |
| **Monitoring** | Sentry + Better Stack | Visibilité full-stack |

#### Plan de migration par étapes

| Étape | Service migré | Effort estimé | Effort sans abstraction |
|---|---|---|---|
| 1 | `auth.service.ts` (sortir de Supabase Auth) | 2-3 sem | 6-8 sem |
| 2 | `storage.service.ts` (vers R2/S3) | 1-2 sem | 4-6 sem |
| 3 | `secrets.service.ts` (vers Vault/KMS) | 1 sem | 4 sem |
| 4 | `ai.service.ts` (workers Python pour Whisper + ANK fine-tuning) | 3-4 sem | 8-12 sem |
| 5 | `realtime.service.ts` (Socket.io) | 2 sem | 6-8 sem |
| 6 | `integrations.service.ts` (OAuth callbacks NestJS) | 2-3 sem | 8-10 sem |
| 7 | `leads.service.ts` + autres CRUD (vers REST/GraphQL NestJS) | 4-6 sem | 16-24 sem |
| 8 | DB elle-même (Supabase Postgres → Postgres self-hosted) | 1 sem (dump+restore) | 1 sem |
| **TOTAL** | | **16-22 semaines** (4-5 mois 1 dev) | **53-72 semaines** (13-18 mois 1 dev) |

Le gain de la couche d'abstraction = **8-13 mois d'effort dev économisés** lors de la migration. C'est massif.

---

### Phase 3 — Backend TUC propre (M15-M24)

À ce stade : TUC tourne sur backend custom inspiré Twenty (sans être un fork). L'équipe technique est constituée. ANK Phase 2/3 est opérationnel.

**Architecture cible** :

```
backend/
├── src/
│   ├── modules/         ← inspiration directe Twenty
│   │   ├── auth/
│   │   ├── workspace/   ← multi-tenant agences closing
│   │   ├── lead/
│   │   ├── matching/
│   │   ├── meet/
│   │   ├── messaging/
│   │   ├── integrations/
│   │   ├── workflow/    ← automation engine
│   │   ├── timeline/    ← vue chronologique prospect
│   │   ├── analytics/
│   │   └── ank/         ← ML / fine-tuning workers
│   ├── workers/         ← BullMQ jobs longs
│   └── main.ts
├── prisma/
│   └── schema.prisma
└── docker-compose.yml
```

**Bénéfices à ce stade** :
- Vendor lock-in zéro
- Coût hébergement prévisible (50-200 €/mois pour 10-50k users)
- ANK Phase 2/3 (Psychologie + Closing) opérationnel sur workers GPU
- Multi-tenant SaaS B2B vrai (agences closing isolées par workspace)
- Capacité d'ouvrir l'écosystème (open source partiel, API publique, etc.)

---

## 4. Comparaison économique sur 24 mois

### Coût mensuel hébergement TUC

| Mois | Stack | Coût | Cumul cumulé 24 mois |
|---|---|---|---|
| M0-M3 | Supabase Free + Vercel Free | **0 €** | 0 € |
| M3-M9 | Supabase Pro ($25) + Vercel ($20) | **~42 €** | ~250 € |
| M9-M15 | Supabase Pro + Vercel Pro + Upstash + R2 progressifs | **~80 €** | ~730 € |
| M15-M18 | Migration en cours, double stack temporairement | **~200 €** | ~1330 € |
| M18-M24 | Backend custom (VPS Hetzner 32GB ~50€) + Vercel + R2 + Sentry | **~100 €** | ~1930 € |

vs. **Si on restait Supabase** à 10k users :
- M15+ : Supabase Team $599 + add-ons → ~700-1200 €/mois → **9 700 – 16 700 €** sur les 12 derniers mois seuls.

**Économie sur 24 mois en migrant** : 8 000 – 15 000 € + autonomie technique + capacité ANK.

---

## 5. Ce qu'il faut faire CETTE SEMAINE (avant T01)

### Action 1 — Renforcer `code-standards.md` (fait en session 27)

Voir mise à jour `.claude/rules/code-standards.md` : règle d'abstraction stricte, interdiction supabase direct dans composants/pages, obligation passage par services.

### Action 2 — Ajouter tâche T28 au backlog (fait en session 27)

T28 = « Refactorer composants existants pour passer par couche service ». À exécuter **AVANT T01** car T01 elle-même créera `secrets.service.ts`.

### Action 3 — Briefer les 3 agents codeurs

Les agents `frontend-react`, `backend-supabase`, `integrations` lisent automatiquement `code-standards.md` au bootstrap. Le nouveau standard sera donc appliqué dès leur prochaine invocation.

### Action 4 — Lecture obligatoire du présent document

Chaque ouverture d'une tâche T01-T27 commence désormais par lire `docs/architecture-evolution.md` (à ajouter au header de chaque prompt).

---

## 6. Réponses aux questions architecturales fréquentes

### Q: « Si je fais bien Phase 1 abstraction, est-ce que je peux choisir n'importe quel backend en Phase 3, ou seulement NestJS ? »

**Réponse** : tu peux choisir n'importe quel backend (NestJS, Express, Fastify, Encore.dev, Go avec Echo, Rust avec Actix). L'abstraction te libère du choix technique tardif. Recommandation actuelle = NestJS pour proximité Twenty + écosystème TypeScript + apprentissage Nacer/Claude facilité.

### Q: « Et si je veux rester sur Supabase à vie ? »

**Réponse** : la discipline d'abstraction ne te coûte que ~10 % d'effort supplémentaire en MVP. Si tu décides de rester Supabase, tu n'auras rien perdu, juste un code plus propre. Si tu décides de migrer, tu auras économisé 8-13 mois.

### Q: « Le code des agents (frontend-react, backend-supabase) doit-il être refondu ? »

**Réponse** : non. Les agents continuent à utiliser le skill `supabase-edge-functions-deno` etc. Ils respectent les standards : **le code qu'ils produisent** passe par la couche service. Les agents eux-mêmes restent inchangés.

### Q: « Et ANK dans tout ça ? »

**Réponse** : ANK Phase 1 (fine-tuning de base, modèle 7-8B + LoRA) peut se faire hors-Supabase dès aujourd'hui (RunPod, Vast.ai, Lambda Labs). ANK Phase 2 et 3 nécessitent workers GPU sur backend custom — autre raison forte de Phase 3.

### Q: « Quand exactement déclenche-t-on Phase 2 ? »

**Réponse** : voir critères en section 3 Phase 1 (3 sur 5 conditions). Pas avant. Pas après. Décision orchestrateur + Nacer formelle, tracée comme ADR-026.

---

## 7. Risques de cette stratégie

| Risque | Mitigation |
|---|---|
| Sur-engineering MVP | Couche services minimaliste, pas de Hexagonal/Clean Architecture lourde. Juste : interface stable, implémentation cachée. |
| Refactor T28 décourage Nacer | T28 reste petit (4-6h en mode discipliné) car codebase MVP est jeune |
| Découverte tardive de cas non-abstractibles | Audit qualité à chaque PR : `auditeur-qualite` cherche les imports supabase orphelins |
| Tentation de prendre un raccourci sous pression | Code-standards.md interdit. Les agents codeurs refusent de générer du code couplé. Audit final T27 vérifie. |
| Choix backend Phase 3 mauvais | Phase 2 inclut PoC backend custom sur 1-2 services AVANT migration full |

---

## 8. Conclusion — la sagesse du sage roi des nuages s'applique aussi en architecture

> *« Cohérence avant vitesse. »* — Doctrine TUC

L'architecture Supabase qui fait vivre TUC aujourd'hui n'est pas un mauvais choix. C'est le bon choix pour MVP.

Mais elle deviendra un fardeau si on n'anticipe pas la transition.

La discipline d'abstraction est le **prix éthique de la liberté future**. Ça coûte ~10 % d'effort aujourd'hui pour gagner 80 % de marge de manœuvre demain.

---

## ADR-025 — Stratégie Architecture Evolution Supabase MVP → Backend custom

### Contexte

Nacer, fondateur TUC, exprime en session 27 une insatisfaction stratégique avec Supabase pour le long terme (limitations + coûts croissants des bonnes options + verrouillage). En parallèle, le code Twenty CRM (NestJS + GraphQL + TypeORM) est mounted dans le workspace comme référence architecturale.

L'orchestrateur doit décider : continuer 100 % Supabase ? Migrer vers Twenty-like maintenant ? Stratégie hybride ?

### Décision

**Stratégie d'évolution en 3 phases avec discipline d'abstraction stricte dès maintenant.**

- **Phase 1** (M0-M9) : Supabase pour MVP, mais TOUT accès Supabase passe par une couche service abstraite (`src/lib/services/*.service.ts`). Aucun composant React ne consomme `supabase-js` directement.
- **Phase 2** (M9-M15) : préparation transition (recrutement dev backend, choix stack final, PoC sur 1-2 services).
- **Phase 3** (M15-M24) : migration progressive service par service vers backend custom NestJS-like (inspiré Twenty, sans fork). Postgres self-hosted, BullMQ workers, Cloudflare R2, JWT custom.

**Critères déclenchement Phase 2** : 3 sur 5 (MRR > 5k€, > 500 closers actifs, fonctionnalité Supabase bloquante, coût > 200€/mois, dev backend recruté).

### Conséquences

**Positives** :
- Vendor lock-in minimisé
- Migration future économisée : 8-13 mois d'effort dev
- ANK Phase 2/3 (workers GPU) deviendra possible
- Coût mensuel maîtrisé long terme (50-200€ vs 700-1200€)
- Capacité d'évoluer vers SaaS B2B vrai multi-tenant fort
- Architecture proche de Twenty (référence éprouvée open source)

**Négatives** :
- ~10 % d'effort supplémentaire en MVP (couche services)
- Nécessite tâche T28 de refactor avant T01 (sécurisation des fondations)
- Tentation de raccourcis sous pression à interdire (code-standards.md + auditeur-qualite)
- Dépendance à un dev backend senior pour Phase 2-3 (à anticiper)

### Alternatives écartées

1. **Tout migrer vers Twenty maintenant** : retarderait MVP de 4-6 mois, Nacer ne peut pas se permettre.
2. **Rester Supabase à vie** : coût explosif à scale + ANK Phase 2/3 impossible.
3. **Fork Twenty et l'adapter à Supabase** : incohérence architecturale, ne résout pas les limitations Supabase.
4. **Continuer sans abstraction et accepter la dette technique** : migration future = cauchemar 12+ mois.

### Tâches associées
- **T28** ajoutée au backlog : refactor composants existants pour passer par services (à exécuter AVANT T01)
- Mise à jour `.claude/rules/code-standards.md` avec règle d'abstraction stricte
- Lecture obligatoire de `docs/architecture-evolution.md` au bootstrap de chaque tâche T01-T27 + futures

### Reviewer
- Orchestrateur TUC (Claude) — proposeur
- Nacer Maredj — valide/refuse

### Statut
**Proposé en session 27 (2026-06-13). En attente de validation Nacer.**

Une fois validé → grave dans `.claude/memory/DECISIONS.md` via archiviste-memoire.
