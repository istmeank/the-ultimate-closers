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
| T01 | Chiffrer tokens OAuth via Vault + pgsodium (BLOCKER-001) | backend-supabase | **opus** | ⏳ pending | Critique sécurité |
| T02 | Rate limiting Upstash sur 4 endpoints (BLOCKER H8/H9) | backend-supabase | **sonnet** | ⏳ pending | Critique coûts IA |

### P1 — Fondations DB & Auth

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T03 | Migration extension rôles closer/owner/client + profiles fields | database-postgres | ⏳ pending | **BLOCKER-010** : le front utilise `developer` et `client`, absents de l'enum `app_role`. Trancher d'abord : rôles de sécurité ou vues d'interface ? |
| T04 | Trigger auto_assign_closer_to_lead | database-postgres | **sonnet** | ⏳ pending | Dépend T03 |
| T05 | Triggers log_appointment + log_deal_interaction | database-postgres | **haiku** | ⏳ pending | Dépend T03 |
| T06 | Hook useAuth multi-rôles + ProtectedRoute requireRole | frontend-react | ⏳ pending | |

### P2 — Score Lead IA (cœur métier différenciant)

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T07 | Edge Function score-lead avec Claude (remplace Gemini Lovable) | backend-supabase + ia-orchestration | **opus** | ⏳ pending | Dépend T01 |
| T08 | Auto-assignation closers (charge + Big Five + round-robin) | matching-engine + backend-supabase | **opus** | ⏳ pending | Dépend T03, T07 |

### P3 — Dashboard Closer (UI core)

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T09 | CloserLayout + sidebar navigation | frontend-react | ⏳ pending | |
| T10 | KanbanBoard + KanbanColumn + LeadCard (drag & drop) | frontend-react | **sonnet** | ⏳ pending | Dépend T09 |
| T11 | StatsCards KPIs (leads chauds, RDV, deals, taux closing) | frontend-react | **sonnet** | ⏳ pending | Dépend T09 |
| T12 | LeadDetail + InteractionsTimeline | frontend-react | **sonnet** | ⏳ pending | Dépend T09 |

### P4 — Intégrations OAuth tierces

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T13 | OAuth Google Calendar (callback + flow PKCE) | integrations | **sonnet** | ⏳ pending | Dépend T01 |
| T14 | OAuth Slack (callback + flow PKCE) | integrations | **sonnet** | ⏳ pending | Dépend T01 |
| T15 | Edge Function create-google-event (avec Meet link) | integrations | **sonnet** | ⏳ pending | Dépend T13 |

### P5 — Chatbot qualification homepage

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T16 | ChatbotQualif widget + ChatbotConversation 5 questions | frontend-react | ⏳ pending | |
| T17 | Intégration chatbot sur homepage Index.tsx | frontend-react | **haiku** | ⏳ pending | Dépend T16 |

### P6 — Admin gestion closers

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T18 | ClosersManager admin (liste, charge, réassign) | frontend-react | **sonnet** | ⏳ pending | Dépend T03 |
| T19 | Onglet Closers dans Admin.tsx | frontend-react | **haiku** | ⏳ pending | Dépend T18 |
| T20 | Dashboard admin stats CRM globales | frontend-react | ⏳ pending | |

### P7 — Polish & Compliance

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T21 | Page /policies (RGPD + mentions légales + cookies) | produit-spec + redacteur-voix + frontend-react | ⏳ pending | |
| T22 | Traductions i18n complètes FR/EN/Darija | redacteur-voix + frontend-react | ⏳ pending | |
| T23 | Architecture MCP providers (futur) | integrations | **sonnet** | ⏳ pending | Différé V3 |
| T24 | WhatsApp Bot local Node.js whatsapp-web.js | integrations | **sonnet** | ⏳ pending | Différé V3 |
| T25 | Stubs HubSpot/Stripe (avec MCP HubSpot natif) | integrations | ⏳ pending | |

### P8 — DevOps & Validation

| # | Tâche | Agent | Modèle | Statut | Notes |
|---|---|---|---|---|---|
| T26 | Variables d'environnement (.env.example + Vercel secrets) | devops-vercel | ⏳ pending | |
| T27 | Tests E2E manuels + checklist validation | auditeur-qualite | **opus** | ⏳ pending | Dépend tout le reste |

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
