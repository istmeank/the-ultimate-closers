# MEMORY.md — Sommaire de la mémoire TUC

> **Lu en PREMIER à chaque session** (doc Anthropic : 200 premières lignes chargées auto).
> Sert d'INDEX pour naviguer vers les 6 registres détaillés sans tout charger.
> Principe : Progressive Disclosure (charger le sommaire, aller chercher le détail à la demande).

## Identité projet (rappel ultra-court)

**TUC — The Ultimate Closers** : CRM SaaS B2B closer-centric inspiré HubSpot + Odoo, augmenté par IA, marché DZ + diaspora francophone. 5 domaines : Acquisition, Messagerie, Matching, Meet, Onboarding. Valeurs non-négociables : Coran, bienveillance, anti-dark-patterns, RGPD strict. Pilote : Nacer (Abdenacer Maredj), "sage roi des nuages".

## État actuel (au 2026-06-08)

- **Vague 1 sécurité** : ✅ bouclée (TUC-v2 Supabase live, 17 tables, 41 policies RLS, baseline propre, domaine theultimateclosers.com en prod sur Vercel)
- **Vague 2 gouvernance** : ✅ bouclée (4 agents + 1 skill custom valeurs-coran-bienveillance)
- **Vague 2 codeurs** : 🟡 en cours (11 skills à créer par phases, notebooks NotebookLM en préparation)
- **Vague 3 IA cœur** : 🔜 préparée (skill `workload-management-matching` créé, agent `matching-engine` à créer)

## Index des 6 registres

| Registre | Rôle | Dernière entrée | Statut |
|---|---|---|---|
| `DECISIONS.md` | ADR — choix structurants, alternatives refusées | ADR-001 (RBAC sécurité) | append-only |
| `BLOCKERS.md` | Bugs/blocages en cours et résolus | 5 BLOCKERS (001 tokens, H8/H9 INSERT publics, etc.) | mixte |
| `LEARNINGS.md` | Patterns capitalisés | LEARNING-001+ (24 leçons sur 13 sessions) | append-only |
| `EVALS.md` | Qualité cognitive IA (hallucinations, biais, dérives) | (à initialiser — EVAL-001 vient) | append-only |
| `EXPERIMENTS.md` | Tests produit (A/B, hypothèses mesurées) | (vide — première EXP attendue Vague 3) | append-only |
| `JOURNAL.md` | Trace continue par session | Session 13 (Vague 2 gouvernance complétée) | append-only |

## Décisions structurantes actives (ADR ouverts)

| ID | Décision | Date | Voir |
|---|---|---|---|
| ADR-001 | RBAC owner > admin > closer > user via table `user_roles` + has_role SECURITY DEFINER + RLS optimisée wrappée `(select auth.uid())` | 2026-06-07 | DECISIONS.md §ADR-001 |
| ADR-002 (à formaliser) | Pattern Orchestrator-Workers strict (orchestrateur ne code jamais) | 2026-06-07 | JOURNAL §Session 6 |
| ADR-003 (à formaliser) | Matching TUC = WLM IBM + Twilio TaskRouter (priority queues × affinité × charge) | 2026-06-08 | JOURNAL §Session 11 |
| ADR-004 (à formaliser) | gardien-valeurs a VÉTO immédiat avec court-circuit orchestrateur | 2026-06-08 | JOURNAL §Session 13 |

## BLOCKERS ouverts (à traiter en Vague 2-3)

| ID | Sujet | Priorité | Pour |
|---|---|---|---|
| BLOCKER-001 | Tokens OAuth en clair | ✅ RÉSOLU session 18 | M1+M2+2 Edge Functions |
| BLOCKER H8 | RLS `site_analytics_insert_anyone` USING true | 🟠 haute | Vague 2 — skill `upstash-rate-limiting` |
| BLOCKER H9 | RLS `call_bookings_insert_public` USING true | 🟠 haute | Vague 2 — skill `upstash-rate-limiting` + Turnstile |

## Architecture agentic (9 agents + 5 skills custom)

### Agents
1. `orchestrateur` (sonnet) — coordination + architecte IT (modes Coord/Archi)
2. `archiviste-memoire` (haiku) — tient les 6 registres
3. `auditeur-qualite` (sonnet) — règle d'or, read-only
4. `auth-security-rls` (opus) — RLS + Auth Supabase + OWASP
5. `database-postgres` (sonnet) — schéma + migrations + indexes
6. `produit-spec` (sonnet) — PRD + user stories + roadmap
7. `redacteur-voix` (sonnet) — copy multi-canal + voix TUC
8. `veilleur` (sonnet) — marché + compliance + risque
9. `gardien-valeurs` (opus) — éthique + véto + RGPD

### Skills custom TUC (17 livrés)
1-3 Vague 1 sécurité: `supabase-auth-rls`, `owasp-saas-supabase`, `postgresql-supabase`
4-5 Vague 2 frontend: `react-shadcn-design-system`, `react-forms-i18n-a11y`
6-9 Vague 2 backend: `supabase-edge-functions-deno`, `supabase-realtime-storage`, `secrets-vault-pgsodium` (résout BLOCKER-001), `upstash-rate-limiting` (résout H8/H9)
10-14 Vague 2 intégrations: `oauth-2-pkce-refresh`, `webhook-security-idempotency`, `google-slack-apis`, `whatsapp-business-cloud-api`, `telegram-meta-graph-apis`, `hubspot-via-mcp` (via MCP natif)
15 Doctrine: `valeurs-coran-bienveillance` (5 vétos + 25 principes)
16 Vague 3 préparé: `workload-management-matching` (WLM IBM)

## Rituel de fermeture en 3 questions

À chaque fin de session significative, l'agent (ou Nacer) répond :

1. **Décidé** : ai-je pris un choix qui aura du poids dans 1 mois ?
   → si oui : ADR-XXX dans DECISIONS.md (via archiviste-memoire)
2. **Appris** : ai-je observé un pattern qui change ma façon de faire ?
   → si oui : LEARNING-XXX dans LEARNINGS.md
3. **Dérivé** : ai-je produit (ou subi) un output cognitivement faux (hallucination, biais, info désuète) ?
   → si oui : EVAL-XXX dans EVALS.md

**Règle d'or** : répondre "rien" aux 3 est OK. Ce qui est obligatoire = POSER les 3 questions.

## Doctrine portable (à lire si nouveau venu)

- `CLAUDE.md` — constitution
- `docs/REFERENCE.md` — PRD source de vérité
- `docs/ARCHITECTURE.md` — 5 domaines
- `docs/STRATEGY.md` — 4 différenciateurs
- `docs/OBJECTIVES.md` — chiffres + anti-objectifs
- `.claude/agents/contracts.md` — chaîne de travail agents
- `.claude/bootstrap.md` — procédures auto-chargées
- `.claude/rules/global.md` + `methodology-guard.md` + `code-standards.md`
- `.claude/skills/valeurs-coran-bienveillance/SKILL.md` — doctrine éthique unique TUC

## Procédure de consultation (Progressive Disclosure)

1. **Au démarrage** : ce MEMORY.md est chargé automatiquement (< 200 lignes).
2. **Sur demande** : l'agent va chercher le détail dans le registre ciblé via Read.
3. **Mise à jour** : seul `archiviste-memoire` écrit dans `.claude/memory/`. Tout autre agent délègue.
4. **Cohérence** : si un ADR contredit la mémoire, l'ADR le plus récent l'emporte.
