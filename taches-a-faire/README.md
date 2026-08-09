# Tâches à faire — TUC (orchestrées par l'agent orchestrateur)

> **Date de génération** : 2026-06-09 (session 18)
> **Source** : analyse des 3 plans Lovable uploadés + état actuel TUC (16 agents, 17 skills, 2 BLOCKERS)
> **Doctrine** : `.claude/agents/orchestrateur.md` (Architecte d'exécution Mode 1 — Orchestration)

## Comment utiliser ce dossier

Chaque fichier `Txx-nom.md` contient un **prompt complet copier-coller** à utiliser pour démarrer une **nouvelle conversation Cowork**. Le prompt :
- Pointe vers les fichiers bootstrap à lire (CLAUDE.md + MEMORY.md + contracts.md + skill bootstrap de l'agent ciblé)
- Décrit la mission précise
- Liste les critères d'acceptation
- Définit le format `## RÉSULTAT` attendu

**Workflow** : ouvre une nouvelle conversation → colle le contenu d'un fichier `Txx` → laisse Claude faire le travail → marque la tâche `completed` dans le tableau ci-dessous + ajoute le commit hash.

---

## Vue d'ensemble (27 tâches → CRM opérationnel)

### P-1 — Fondations architecture (PRIORITAIRE ABSOLU, AVANT P0)

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T28 | Refactor : poser couche d'abstraction services (Supabase MVP → backend custom Twenty-like) | frontend-react + backend-supabase | **opus** | ✅ completed | `0331f5a` — 13 services + 13 adapters, garde-fou CI, 83 tests. ADR-025 actée. Reste à valider par `npm run verify` sur le poste de Nacer. |

### P0 — Bloquants sécurité (FAIRE EN PREMIER)

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T01 | Chiffrer tokens OAuth via Vault + pgsodium (BLOCKER-001) | backend-supabase | **opus** | ✅ résolu en DB live / ⚠️ repo désync | Vérifié 2026-08-08 (session 36) : Vault appliqué en prod (session 18), mais 4 migrations manquantes du repo Git — voir BLOCKER-012 |
| T02 | Rate limiting Upstash sur 4 endpoints (BLOCKER H8/H9) | backend-supabase | **sonnet** | ✅ résolu en DB live / ⚠️ repo désync | Vérifié 2026-08-08 : Upstash actif en prod sur call_bookings + site_analytics (session 19) ; policies permissives encore dans le repo Git — BLOCKER-012 |

### P1 — Fondations DB & Auth

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T03 | Migration extension rôles closer/owner/client + profiles fields | database-postgres | ⏳ pending | **BLOCKER-010** : le front utilise `developer` et `client`, absents de l'enum `app_role`. Trancher d'abord : rôles de sécurité ou vues d'interface ? — **✅ completed (session 34)** : enum étendu à 7 valeurs, ADR-036. Statut ⏳ ci-dessus obsolète. |
| T04 | Trigger auto_assign_closer_to_lead | database-postgres | **sonnet** | ✅ completed | Vérifié 2026-08-08 : `auto_assign_closer_to_lead()` + triggers présents (migration 20251029123034) |
| T05 | Triggers log_appointment + log_deal_interaction | database-postgres | **haiku** | 🔄 migration écrite, non appliquée (2026-08-09) | Fichier `20260809000001_tuc_v2_triggers_log_interactions.sql` créé et vérifié. Élargissement CHECK `interactions.type` (ajout `'note'`), triggers `log_appointment_as_interaction` / `log_deal_as_interaction`. En attente de relecture et d'application prod par Nacer. |
| T06 | Hook useAuth multi-rôles + ProtectedRoute requireRole | frontend-react | ✅ completed | Vérifié 2026-08-08 : `src/hooks/useAuth.tsx` + `src/components/ProtectedRoute.tsx` présents |

### P2 — Score Lead IA (cœur métier différenciant)

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T07 | Edge Function score-lead avec Claude (remplace Gemini Lovable) | backend-supabase + ia-orchestration | **opus** | 🔄 partiel | Vérifié 2026-08-08 : `score-lead` existe mais scoring 100% déterministe par barème, aucun appel Claude/Anthropic |
| T08 | Auto-assignation closers (charge + Big Five + round-robin) | matching-engine + backend-supabase | **opus** | ⏳ pending | Confirmé différé (Vague 3) : `matching.supabase.ts` lève explicitement "not implemented yet" |

### P3 — Dashboard Closer (UI core)

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T09 | CloserLayout + sidebar navigation | frontend-react | ✅ completed | Vérifié 2026-08-08 : `CloserLayout.tsx`, routé dans `App.tsx` |
| T10 | KanbanBoard + KanbanColumn + LeadCard (drag & drop) | frontend-react | **sonnet** | ✅ completed | Vérifié 2026-08-08 : drag & drop réel via `@hello-pangea/dnd` |
| T11 | StatsCards KPIs (leads chauds, RDV, deals, taux closing) | frontend-react | **sonnet** | ✅ completed | Vérifié 2026-08-08 : `StatsCards.tsx` présent |
| T12 | LeadDetail + InteractionsTimeline | frontend-react | **sonnet** | ✅ completed | Vérifié 2026-08-08 : `LeadDetail.tsx` + `InteractionsTimeline.tsx` présents |

### P4 — Intégrations OAuth tierces

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T13 | OAuth Google Calendar (callback + flow PKCE) | integrations | **sonnet** | ✅ completed | Vérifié 2026-08-08 : flow OAuth + Edge Function `google-calendar-auth` + tokens Vault (BLOCKER-001) |
| T14 | OAuth Slack (callback + flow PKCE) | integrations | **sonnet** | 🔄 partiel | Vérifié 2026-08-08 : UI `SlackSettings.tsx` présente, bouton connexion = TODO explicite, aucune Edge Function Slack |
| T15 | Edge Function create-google-event (avec Meet link) | integrations | **sonnet** | ⏳ pending | Confirmé absent du repo (2026-08-08) |

### P5 — Chatbot qualification homepage

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T16 | ChatbotQualif widget + ChatbotConversation 5 questions | frontend-react | ✅ completed | Vérifié 2026-08-08 : `ChatbotQualif.tsx` + `ChatbotConversation.tsx` présents |
| T17 | Intégration chatbot sur homepage Index.tsx | frontend-react | **haiku** | ✅ completed | Vérifié 2026-08-08 : `Index.tsx` importe et rend `ChatbotQualif` |

### P6 — Admin gestion closers

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T18 | ClosersManager admin (liste, charge, réassign) | frontend-react | **sonnet** | ✅ completed | Vérifié 2026-08-08 : `ClosersManager.tsx` présent |
| T19 | Onglet Closers dans Admin.tsx | frontend-react | **haiku** | ✅ completed | Vérifié 2026-08-08 : livré via route `/admin/closers` + sidebar, pas dans `Admin.tsx` littéral |
| T20 | Dashboard admin stats CRM globales | frontend-react | ✅ completed | Vérifié 2026-08-08 : `Dashboard.tsx` avec KPIs (leads, deals, CA, formations) |

### P7 — Polish & Compliance

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T21 | Page /policies (RGPD + mentions légales + cookies) | produit-spec + redacteur-voix + frontend-react | 🔄 partiel | Vérifié 2026-08-08 : contenu RGPD substantiel existe sous `/legal` (`Legal.tsx`, Loi 18-07), pas à l'URL `/policies` attendue |
| T22 | Traductions i18n complètes FR/EN/Darija | redacteur-voix + frontend-react | ✅ completed | Vérifié 2026-08-08 : système maison `LanguageContext.tsx` (fr/en/dar), pas react-i18next mais fonctionnellement complet |
| T23 | Architecture MCP providers (futur) | integrations | **sonnet** | ⏸️ deferred | Confirmé absent, conforme à la note "Différé V3" |
| T24 | WhatsApp Bot local Node.js whatsapp-web.js | integrations | **sonnet** | ⏳ pending | Confirmé absent (2026-08-08) ; interne/test OK (ADR-038), réel = API officielle |
| T25 | Stubs HubSpot/Stripe (avec MCP HubSpot natif) | integrations | 🔄 partiel | Vérifié 2026-08-08 : HubSpot réellement implémenté (`hubspot-sync`), Stripe reste un stub explicite (TODO) |

### P8 — DevOps & Validation

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T26 | Variables d'environnement (.env.example + Vercel secrets) | devops-vercel | ⏳ pending | Confirmé absent (2026-08-08) : `.env` réel présent (secrets en clair localement), pas de `.env.example` |
| T27 | Tests E2E manuels + checklist validation | auditeur-qualite | **opus** | ⏳ pending | Confirmé absent (2026-08-08) : seul `vitest.config.ts` (tests unitaires), pas de Playwright/Cypress |

---

## Légende des statuts

| Symbole | Signification |
|---|---|
| ⏳ pending | À faire — non démarré |
| 🔄 in_progress | En cours d'implémentation |
| ✅ completed | Terminé + tracé dans JOURNAL + commit Git |
| ⚠️ blocked | Bloqué (voir BLOCKERS.md) |
| ⏸️ deferred | Reporté à une vague ultérieure |

## Règle d'abstraction — applicable à toutes les tâches depuis T28

Depuis la clôture de T28 (session 34), toute tâche touchant aux données passe par
`src/lib/services/`. Aucun composant, aucune page, aucun hook n'importe le client
Supabase. Si le service nécessaire n'existe pas, on l'ajoute — on ne contourne pas.

Avant de déclarer une tâche terminée :

```
npm run verify
```

Cette commande enchaîne les quatre contrôles : garde-fou d'abstraction, types,
tests, build. Elle échoue si l'un d'eux échoue — c'est le point.

Voir `ADR-025` et `ADR-035` dans `.claude/memory/DECISIONS.md`, et
`docs/deferred-capabilities.md` pour les capacités déclarées mais non implémentées.

## Ordre d'exécution recommandé

```
P0 (T01, T02) — sécurité d'abord, toujours
   ↓
P1 (T03 → T04, T05) + (T06 en parallèle)
   ↓
P2 (T07 → T08)
   ↓
P3 (T09 → T10, T11, T12 en parallèle après T09)
   ↓
P4 (T13, T14 en parallèle, puis T15 dépend T13)
   ↓
P5 (T16 → T17)
   ↓
P6 (T18 → T19, T20 en parallèle)
   ↓
P7 (T21, T22 en parallèle, T23/T24/T25 différés V3)
   ↓
P8 (T26 en continu, T27 en fin)
```

## Mise à jour du dossier

Après chaque tâche terminée :
1. Édite ce README pour passer le statut à ✅ completed
2. Ajoute le commit hash dans la colonne Notes
3. Trace la session dans `.claude/memory/JOURNAL.md` via archiviste-memoire
4. Si nouveau LEARNING → `.claude/memory/LEARNINGS.md`
5. Si nouvelle décision structurante → ADR dans `.claude/memory/DECISIONS.md`

## Estimation d'effort total

- P0 : 4-6h (critique, à faire vite)
- P1 : 8-12h
- P2 : 6-10h
- P3 : 12-16h
- P4 : 10-14h
- P5 : 4-6h
- P6 : 6-8h
- P7 : 8-12h
- P8 : 4-6h
- **Total MVP opérationnel** : ~60-90h de travail (sessions Cowork espacées + revue commits)

---

## Choix des modèles Claude par tâche — Politique de coût

Pour chaque tâche, le modèle Claude est choisi selon le principe **« le moins cher capable »** (cf skill `anthropic-prompt-engineering` à venir + skill `ia-orchestration`).

| Modèle | Quand l'utiliser | Coût relatif | Tâches concernées |
|---|---|---|---|
| **Haiku 4.5** (`claude-haiku-4-5-20251001`) | Classification, extraction, modifs simples, ajouts ponctuels, config | 1× | T05, T17, T19, T26 |
| **Sonnet 4.6** (`claude-sonnet-4-6`) | **Default** dev — UI complexe, Edge Functions, migrations standard, OAuth, charts | 3× | T02, T03, T04, T06, T09 → T16, T18, T20, T21, T23, T24, T25 |
| **Opus 4.6** (`claude-opus-4-6`) | Décisions haute-conséquence : sécurité prod, USP différenciant, audit, qualité linguistique multi-langues | 15× | T01, T07, T08, T22, T27 |

### Budget mensuel IA prévisionnel

Estimation grossière sur les 27 tâches (60-90h de session) :
- **Haiku** (T05, T17, T19, T26) : ~5 $
- **Sonnet** (18 tâches du dev courant) : ~50 $
- **Opus** (T01, T07, T08, T22, T27 — sécurité, USP, audit) : ~30 $
- **Total MVP estimé** : ~85 $ (cible globale TUC < 100 $/mois respectée)

Si dépassement → escalade Nacer + ADR obligatoire (cf `.claude/rules/global.md`).

---

## Skills disponibles — vue d'ensemble

### Skills custom TUC (bootstrappés dans `.claude/skills/`) — 17 skills

**Sécurité** : `supabase-auth-rls`, `owasp-saas-supabase`, `postgresql-supabase`, `secrets-vault-pgsodium`, `upstash-rate-limiting`, `webhook-security-idempotency`, `oauth-2-pkce-refresh`

**Backend** : `supabase-edge-functions-deno`, `supabase-realtime-storage`

**Frontend** : `react-shadcn-design-system`, `react-forms-i18n-a11y`

**Intégrations** : `google-slack-apis`, `whatsapp-business-cloud-api`, `telegram-meta-graph-apis`, `hubspot-via-mcp`

**Doctrine TUC** : `valeurs-coran-bienveillance` (5 vétos éthiques)

**Vague 3 préparée** : `workload-management-matching` (matching IBM WLM)

### Skills Cowork (Claude PC) — disponibles via skill manager

**Design / UI** : `ui-ux-pro-max` (50+ styles, shadcn MCP), `frontend-design`, `design:design-system`, `design:design-handoff`, `design:design-critique`, `design:accessibility-review`, `design:ux-copy`, `design:user-research`, `design:research-synthesis`

**Brand / Marketing** : `brand-voice:enforce-voice`, `brand-voice:guideline-generation`, `brand-voice:discover-brand`, `marketing:brand-review`, `marketing:campaign-plan`, `marketing:content-creation`, `marketing:email-sequence`, `marketing:seo-audit`, `ai-seo`

**Operations** : `operations:compliance-tracking`, `operations:risk-assessment`, `operations:runbook`, `operations:vendor-review`, `operations:status-report`, `operations:process-doc`, `operations:change-request`

**Product** : `product-management:write-spec`, `product-management:brainstorm`, `product-management:roadmap-update`, `product-management:metrics-review`, `product-management:competitive-brief`

**Format docs** : `anthropic-skills:docx`, `anthropic-skills:pptx`, `anthropic-skills:pdf`, `anthropic-skills:xlsx`

**Recherche / sales** : `sales:account-research`, `apollo:enrich-lead`, `common-room:account-research` (selon connecteurs disponibles)

Chaque tâche `Txx-*.md` liste explicitement les skills Cowork pertinents à charger en plus des skills bootstrap TUC.

---

## 🔍 Audit & Vérification de fin de tâche — doctrine commune

**Chaque fichier `Txx-*.md` contient désormais une section finale `## 🔍 Audit & Vérification` obligatoire.**

Cette section impose 6 étapes avant qu'une tâche soit déclarée ✅ completed :

### 1. Audit technique automatique
- Relire diff Git complet (chercher PII, secrets, console.log, `any`, hardcoded strings)
- Invoquer **`auditeur-qualite`** (read-only) pour audit cross-domaines impactés
- Vérifier `code-standards.md` (fichiers < 300 lignes, pas de cycle d'imports, TS strict)

### 2. Tests spécifiques à la tâche
Liste contextuelle dans chaque fichier (3-6 tests par tâche selon nature : sécurité / DB / UI / IA / OAuth / etc.)

### 3. Filtre éthique
**`gardien-valeurs`** consulté **obligatoirement** si la tâche touche : microcopy, IA générative, opt-in/opt-out, scripts envoyés, scoring, matching, banner cookies.

### 4. Capitalisation mémoire (via `archiviste-memoire` exclusivement)
- JOURNAL.md : session datée + rituel 3 questions Décidé/Appris/Dérivé
- LEARNINGS.md : si leçon technique notable
- DECISIONS.md : ADR si choix structurant
- BLOCKERS.md : marquer résolu ou ouvrir nouveau

### 5. Livraison
- Update statut README.md (⏳ pending → ✅ completed + commit hash)
- Commit Git conventionnel (`<type>(<scope>): <résumé>`)
- Push uniquement après validation Nacer (jamais `--force`)

### 6. Validation Nacer (sortie obligatoire)
Mini-rapport synthèse format `## RÉSULTAT — Txx` avec : fichiers créés, tests passés, points d'attention, métriques (coût IA + latence + score audit), tâches suivantes débloquées, commit hash.

### Pourquoi cette rigueur

La règle d'or TUC (`.claude/rules/global.md`) est non-négociable :
> **« Ne jamais déclarer une tâche terminée sans avoir vérifié que rien d'autre n'est cassé. »**

Chaque tâche passe 4 portes : (1) diff relu, (2) domaines voisins vérifiés, (3) testée, (4) tracée. Sans ces 4 portes, la tâche reste 🔄 in_progress même si le code est écrit.

### Allocation modèle pour l'audit final

Tâche audit (T27) est en **Opus 4.6** car méta-audit MVP haute conséquence.
`auditeur-qualite` invoqué dans chaque tâche reste en **Sonnet 4.6** (suffisant pour audit cross-domaines).
