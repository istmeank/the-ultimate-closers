# ITERATION_LOG — Journal de session

> Une ligne par session de travail significative. Ce qu'on a fait, ce qu'on a appris, où on s'est arrêté.
> But : reprendre une session sans perdre 20 minutes à se rappeler où on en était.

## Pourquoi ce registre
La mémoire de Claude est volatile entre sessions. Ce journal est le **fil rouge** qui relie les sessions entre elles. Il alimente la reprise et permet à un nouveau spécialiste de comprendre le contexte récent.

## Format d'une entrée

```
## YYYY-MM-DD — Session N — Titre
- Objectif initial : ce qu'on voulait faire
- Ce qui a été fait : actions concrètes
- Vérification règle d'or : ce qui a été contrôlé pour s'assurer que rien n'est cassé
- Décisions prises : référence ADR-XXX si applicable
- Blocages rencontrés : référence BLOCKER-XXX
- Apprentissages : référence LEARNING-XXX
- Prochaine étape : par où reprendre la prochaine fois
```

---

## 2026-06-07 — Session 1 — Mise en place de la gouvernance projet
- Objectif initial : poser la structure de gouvernance (constitution, doc, orchestrateur, mémoire) selon les conventions Claude Code officielles.
- Ce qui a été fait : création de CLAUDE.md, docs/REFERENCE.md, docs/ARCHITECTURE.md, .claude/agents/orchestrateur.md, et des 5 registres mémoire.
- Vérification règle d'or : structure conforme à la doc Anthropic (CLAUDE.md < 100 lignes, agents/, conventions respectées) ; aucun fichier existant écrasé ; arborescence saine.
- Décisions prises : 5 domaines fonctionnels figés (acquisition, messagerie, matching, meet, onboarding).
- Blocages rencontrés : aucun.
- Apprentissages : aucun.
- Prochaine étape : Nacer partage le business plan → enrichir PRD ; cadrer la stack technique avec un développeur partenaire avant tout code.

## 2026-06-07 — Session 2 — Fusion skill it-project-architect dans l'orchestrateur
- Objectif initial : adosser le skill it-project-architect à l'orchestrateur pour avoir un seul architecte unifié.
- Ce qui a été fait : refonte de `.claude/agents/orchestrateur.md` avec deux modes (Mode 1 Orchestration, Mode 2 Architecture IT). Description du frontmatter élargie aux triggers techniques (architecture, stack, cahier des charges, roadmap). Intégration des 4 phases C4 + cahier + stack + roadmap, règles anti-over-engineering, templates DZ-compatibles (Chargily, WhatsApp, Supabase), checklist validation code IA.
- Vérification règle d'or : frontmatter conforme à la doc sub-agents Anthropic ; aucun autre fichier touché ; règle d'or conservée ; cohérence avec CLAUDE.md (mêmes domaines, mêmes valeurs).
- Décisions prises : un seul agent architecte (pas deux entités) — à enregistrer comme ADR-001 si Nacer valide.
- Blocages rencontrés : aucun.
- Apprentissages : aucun.
- Prochaine étape : ouvrir ADR-001 pour acter "agent architecte unique" ; tester l'orchestrateur sur un premier cas concret (ex. cadrage du domaine Acquisition).

## 2026-06-07 — Session 3 — Pivot fresh start + création 2 agents gouvernance
- Objectif initial : créer les 2 agents de gouvernance V1 (archiviste-memoire, auditeur-qualite) en parallèle de la prépa NotebookLM par Nacer.
- Ce qui a été fait :
  1. Analyse des fichiers backup uploadés par Nacer : storage zip VIDE (22 octets), DB backup .gz limité au squelette Supabase de base (rôles + schémas système, sans tables métier — backup daté du 18/09/2025, antérieur aux tables créées dès le 23/10/2025).
  2. Inspection du repo : 26 migrations SQL (pas 8 comme initialement vu), avec contradictions multiples sur les mêmes tables (call_bookings, profiles, leads, user_roles) — signal de panique sécuritaire passée.
  3. Confirmation Nacer : aucune donnée prod à sauver, projet Supabase paused, essais MVP uniquement.
  4. Pivot stratégique : abandon du clone + PITR, fresh start sur nouveau projet Supabase TUC-v2, consolidation des 26 migrations en 1 baseline propre.
  5. Création de .claude/agents/archiviste-memoire.md (haiku, écriture limitée à .claude/memory/).
  6. Création de .claude/agents/auditeur-qualite.md (sonnet, 100% read-only, checklist code IA complète + checklist valeurs TUC).
- Vérification règle d'or : frontmatter conforme doc sub-agents Anthropic ; périmètre des outils strictement limité (haiku/read-only) ; cohérence avec CLAUDE.md (règle d'or, valeurs, boucle mémoire) ; aucune autre brique impactée.
- Décisions prises : fresh start TUC-v2 (à formaliser en ADR-001) ; abandon PITR Supabase ; baseline consolidée à produire par database-postgres + auth-security-rls.
- Blocages rencontrés : aucun.
- Apprentissages : le repo cache souvent plus que ce qu'on voit au premier coup d'œil — toujours faire un audit complet AVANT de planifier (ici 26 migrations au lieu de 8 estimées).
- Prochaine étape : Nacer crée TUC-v2 + prépare les 3 notebooks NotebookLM ; en parallèle, attendre les synthèses pour créer auth-security-rls et database-postgres.

## 2026-06-07 — Session 4 — Vague A système agentic complet
- Objectif initial : compléter le système agentic selon la convention prompt (contracts, rules, skills, bootstrap, domains, OBJECTIVES, STRATEGY, EXPERIMENTS) et matcher la nomenclature standard (JOURNAL au lieu d'ITERATION_LOG, REFERENCE au lieu de PRD).
- Ce qui a été fait :
  1. Renommages : `ITERATION_LOG.md` → `JOURNAL.md` ; `docs/PRD.md` → `docs/REFERENCE.md`. Toutes les références mises à jour (CLAUDE.md, agents, registres).
  2. Création `.claude/agents/contracts.md` (145 lignes) : chaîne de travail, autorités de domaine (15 agents cibles), format de sortie standard `## RÉSULTAT` obligatoire, règles de parallélisation (compatibles ✅ / exclusifs ❌), Progressive Disclosure, Isolate Context, Escalation > devinette.
  3. Création `.claude/rules/global.md` : identité projet, identité utilisateur, langue (FR doc / EN code), ton, valeurs non-négociables (5 vétos), budgets, capitalisation, vérif règle d'or, confidentialité.
  4. Création `.claude/rules/methodology-guard.md` : fichiers protégés (constitution, méthodologie, mémoire append-only, .env interdit, migrations append-only), procédure d'escalade en cas de modif protégée, anti-patterns.
  5. Création `.claude/rules/code-standards.md` (frontmatter `paths` ciblant src/ et supabase/) : TypeScript strict, naming, sécurité front (jamais service_role côté client), RLS obligatoire, indexes FK, soft delete, timestamps auto, Edge Functions sécurisées, performance (anti N+1), tests minimum, Conventional Commits.
  6. Création `.claude/bootstrap.md` : vérifications d'intégrité, chargement contextuel (Progressive Disclosure : 8 fichiers max), anti-blocage (loop guard 3 itérations), sécurités (jamais rm -rf, jamais push main direct), procédures vérif sortie, hiérarchie face à incertitude, reprise de session.
  7. Création `.claude/memory/EXPERIMENTS.md` : registre EXP-XXX avec template complet (hypothèse, méthode, métriques, résultat, conclusion, décision, liens LEARNING/ADR/rapport détaillé).
  8. Création `docs/OBJECTIVES.md` : métrique nord (closers actifs ≥ 20 meets/mois), cibles 6 mois (10 closers, 3k€ MRR) et 12 mois (50 closers, 15k€ MRR), métriques apprentissage produit, métriques éthiques, anti-objectifs (ce qu'on refuse même si rentable).
  9. Création `docs/STRATEGY.md` : positionnement (seul CRM closer+matching+coaching+éthique), 4 différenciateurs (matching personnalité, multi-canal natif, coaching IA intégré, éthique frontale), GTM en 3 phases (DZ → diaspora → multi-pays), jalons stratégiques, risques principaux + mitigation, ce qu'on ne fait PAS.
  10. Création `docs/domains/README.md` : dashboard 5 domaines avec statut (🟢🟡🔴), vague d'attaque, owner agent, prochaine action ; priorité = aucun domaine ne progresse tant que Vague 1 sécurité non validée.
  11. Création des 5 `docs/domains/0X-*/PLAN.md` (acquisition, messagerie, matching, meet, onboarding) : mission, entités, état actuel (audit code existant ! ex. table google_calendar_tokens, profiles étendues, DziriBERTSuggestions), backlog priorisé par vague, risques spécifiques, skills nécessaires, agents owner.
  12. Création `.claude/skills/README.md` + dossier `.claude/skills/` (catalogue + différence skill/agent + liste planifiée par vague).
  13. Création `reports/experiments/.gitkeep`.
- Vérification règle d'or : tous les fichiers créés respectent la convention prompt ; aucun fichier protégé modifié sans autorisation ; renommages propres sans résidu (grep retourné 0) ; CLAUDE.md a été linté par Nacer après renommage (vérifié, ligne 28 et 35 correctes).
- Décisions prises : matching convention prompt acté (JOURNAL.md + REFERENCE.md noms officiels) ; 15 agents cibles définis dans contracts.md ; règles `paths` scopées pour code-standards.md ; aucun domaine ne progresse avant Vague 1 sécurité (priorisation actée).
- Blocages rencontrés : aucun.
- Apprentissages : la convention "Knowledge ≠ Skills" est importante — les skills sont des livres injectables (dossier + SKILL.md), pas un dossier knowledge ad-hoc. Bien différencier agent (exécutant actif) de skill (livre passif).
- Prochaine étape : Nacer prépare les 3 notebooks NotebookLM (skills Vague 1 : supabase-auth-rls, owasp-security, postgresql-supabase) ; en parallèle Nacer crée TUC-v2 sur Supabase ; ensuite création agents codeurs Vague 1.

## 2026-06-07 — Session 5 — Création des 3 skills Vague 1
- Objectif initial : transformer les 3 synthèses NotebookLM uploadées par Nacer en SKILL.md conformes au standard Anthropic, en utilisant le skill skill-creator.
- Ce qui a été fait :
  1. Lecture des 3 synthèses uploadées (128 + 264 + 107 lignes, excellente qualité, format markdown propre).
  2. Invocation du skill `anthropic-skills:skill-creator` pour aligner sur les conventions.
  3. Choix méthodologique : mode flexible (skip benchmarks/évaluations), justifié par le fait qu'on a déjà des contenus de qualité, qu'il s'agit de knowledge bases passives et non d'agents exécutants, et que les tests d'usage seront faits via les agents codeurs eux-mêmes.
  4. Création de `.claude/skills/supabase-auth-rls/SKILL.md` (230 lignes) : frontmatter Anthropic conforme avec description "pushy" pour bien trigger sur RLS/auth.uid()/auth.jwt()/service_role/RBAC ; contenu = 10 concepts clés + 10 patterns canoniques avec SQL + 10 anti-patterns + RBAC admin/closer + JWT/sessions + Auth Hooks + pièges Supabase + checklist 15 points + 8 snippets prêts à l'emploi + glossaire.
  5. Création de `.claude/skills/owasp-saas-supabase/SKILL.md` (95 lignes) : description "pushy" sur OWASP/IDOR/BOLA/multi-tenant/secrets/rate limiting ; contenu = Top 10 OWASP 2025 + analyse risques multi-tenant Supabase + checklist 20 points (4 catégories : Supabase, React, Auth, Repo) + 8 pièges auth moderne + stratégie secrets management + rate limiting Upstash.
  6. Création de `.claude/skills/postgresql-supabase/SKILL.md` (116 lignes) : description "pushy" sur schéma SQL/migrations/indexes/EXPLAIN/JSONB/triggers/soft delete ; contenu = 10 principes schéma sain + workflow migration Supabase complet + stratégie indexation + arbitrage Postgres vs Edge Functions + patterns triggers + optimisation/VACUUM/EXPLAIN + types Postgres utiles + soft vs hard delete + audit timestamps + checklist 12 points avant merge.
  7. Mise à jour de `.claude/skills/README.md` pour marquer les 3 skills Vague 1 comme livrés (cases cochées).
  8. Renommage du skill prévu "owasp-security" en "owasp-saas-supabase" pour mieux refléter le scope élargi (OWASP + SaaS B2B + React + Supabase + rate limiting).
- Vérification règle d'or : 3 SKILL.md respectent le format Anthropic (frontmatter YAML name+description, corps markdown structuré) ; descriptions "pushy" avec triggers explicites pour bien matcher l'usage par les futurs agents codeurs ; contenu fidèle aux synthèses NotebookLM de Nacer sans dénaturation ; aucun autre fichier modifié sans autorisation.
- Décisions prises : skill 2 renommé en "owasp-saas-supabase" (scope élargi vs "owasp-security" initial) ; mode flexible pour skill-creator (skip benchmarks formels) justifié par la nature passive des knowledge bases.
- Blocages rencontrés : aucun.
- Apprentissages : LEARNING-002 — pour des skills de type knowledge base (livre passif), le mode flexible du skill-creator est plus efficace que le full loop benchmark/évaluation qui est conçu pour des skills exécutants ; LEARNING-003 — la description "pushy" du frontmatter avec triggers concrets (mots-clés, contextes) est critique pour que les agents codeurs invoquent bien le skill au bon moment.
- Prochaine étape : créer les 2 agents codeurs Vague 1 (auth-security-rls calé sur skills 1+2 ; database-postgres calé sur skill 3) — débloque les tâches #7 et #8.

## 2026-06-07 — Session 6 — Création des 2 agents codeurs Vague 1 + intégration fondations Nacer
- Objectif initial : créer auth-security-rls et database-postgres calés sur les 3 skills Vague 1 ; vérifier Notion + état Supabase ; aligner sur les fondations méthodologiques de Nacer.
- Ce qui a été fait :
  1. Vérification Supabase via MCP : projet "the-ultimate-closers" (id llxgyomevketvypusafl) DÉJÀ créé par Nacer aujourd'hui à 12h43, ACTIVE_HEALTHY, EU-west-3, Postgres 17, schéma public vide. Tâche #14 marquée completed.
  2. Vérification Notion via MCP : récupéré 3 fondations méthodologiques de Nacer (@le_gouverneur_ia) — (a) Skill ou Agent : test binaire + pattern Orchestrator-Workers (3 critères agent : mandat/décisions/escalade ; règle "un seul décideur par territoire") ; (b) Structurer la gouvernance AVANT déployer (framework 4 piliers : Mandat/Périmètre/Checkpoints/Escalade ; template contract.yaml) ; (c) Setup SaaS 10 briques (architecture imposée 300 lignes max, doctrine vs méthodologie, skills bootstrap vs à la demande).
  3. Création .claude/agents/auth-security-rls.md (119 lignes, model opus) — frontmatter avec skills bootstrap [supabase-auth-rls, owasp-saas-supabase] + 8 outils MCP Supabase (list_tables, list_migrations, execute_sql, apply_migration, get_advisors, search_docs, get_logs). Structure stricte template Nacer : Mission / Contexte / Input / Process (4 étapes : bootstrap, audit legacy, conception baseline, validation) / Output (format ## RÉSULTAT) / Décisions seul / Escalade / Contraintes / Checkpoints / Limites ressources / Outils.
  4. Création .claude/agents/database-postgres.md (121 lignes, model sonnet) — skills bootstrap [postgresql-supabase] + outils MCP Supabase incluant generate_typescript_types et list_extensions. Découpage par les 5 domaines TUC pour la baseline. Territoire exclusif schéma, collaboration avec auth-security-rls sur les policies (séparation claire).
  5. Renforcement .claude/rules/code-standards.md : ajout section "Architecture imposée (doctrine Nacer)" — découpage par domaine, max 300 lignes/fichier, détection cycles, imports inter-domaines via interfaces explicites.
- Vérification règle d'or : 2 agents respectent le template Nacer (test binaire OK : ils ARBITRENT, donc agents ; 3 critères présents : mandat écrit, décisions seul listées, escalade claire) + les 4 piliers (Mandat dans Mission/Contexte, Périmètre dans Outils/Contraintes, Checkpoints dans section dédiée, Escalade dans section dédiée) ; aucun fichier protégé modifié sans autorisation ; cohérence avec contracts.md (format ## RÉSULTAT) et skills Vague 1 (chargés en bootstrap).
- Décisions prises : ADR-001 (à formaliser) — pattern Orchestrator-Workers d'Anthropic adopté formellement pour TUC ; ADR-002 — code-standards.md inclut architecture imposée (300 lignes, anti-cycle, bounded contexts par domaine).
- Blocages rencontrés : aucun.
- Apprentissages : LEARNING-004 — les fondations Nacer (4 piliers, test binaire, 10 briques setup) doivent être intégrées DANS chaque agent et non simplement référencées — les checklists "Contraintes/Checkpoints/Limites ressources" sont la traduction opérationnelle des 4 piliers ; LEARNING-005 — un agent codeur avec accès apply_migration doit avoir un mécanisme de validation Nacer obligatoire (production = irréversible) ; LEARNING-006 — chaque agent doit explicitement nommer les fichiers/dossiers où il peut écrire (allowlist) et ceux où il NE PEUT PAS écrire (denylist) pour éviter les dérives.
- Prochaine étape : Nacer valide les 2 agents → ils peuvent attaquer l'audit des 26 migrations (tâche #9) et la production de la baseline (tâche #10). Tâche #15 (apply baseline sur TUC-v2) suit naturellement après.

## 2026-06-07 — Session 7 — Audit complet des 30 migrations Lovable
- Objectif initial : tâche #9 — auditer les migrations et SQL d'audit existants, produire la cartographie cible pour la baseline TUC-v2.
- Ce qui a été fait :
  1. Inventaire complet : 30 migrations versionnées (et non 26 comme estimé) + 7 SQL d'audit à la racine.
  2. Comptage par migration : 17 CREATE TABLE distincts, 1 CREATE TYPE (app_role), 168 CREATE POLICY cumulés, 119 ALTER TABLE, 110 DROP — signal massif de chaos sécuritaire.
  3. Lecture des 5 migrations structurantes (20251023161623, 20251026162800, 20251029123034, 20251031201031, 20251114132807) pour reconstituer le schéma cible.
  4. Production du rapport `docs/security-audit-baseline.md` (195 lignes) : inventaire sources + schéma final cumulé par domaine TUC + 6 anomalies critiques + 9 hautes + 6 moyennes + 3 basses + plan de baseline + conformité checklist 15 points (score cible 13/15).
  5. Ajout de 5 BLOCKERS dans `.claude/memory/BLOCKERS.md` (BLOCKER-001 tokens OAuth en clair, BLOCKER-002 enum app_role incohérent, BLOCKER-003 auth.uid() non wrappé, BLOCKER-004 has_role double signature, BLOCKER-005 search_path sans pg_temp).
  6. Vérification rapide `grep service_role src/` → 0 occurrence : conformité critique #2 du skill `supabase-auth-rls` validée.
- Vérification règle d'or : aucune migration touchée (audit read-only) ; rapport produit dans `docs/` (autorisé via délégation orchestrateur) ; BLOCKERS append-only respecté ; cohérence avec les 3 skills Vague 1 (chaque anomalie référencée à la section pertinente du skill).
- Décisions prises : la baseline n'inclura QUE les domaines utilisés par le frontend actuel (Domain 0 + 1 + 3 partiel + 4 partiel) ; domaines 2 (messagerie) et 5 (onboarding complet) seront créés en Vague 3-4 via migrations incrémentales ; tokens OAuth en clair (BLOCKER-001) peuvent être différés en Vague 2 si baseline appliquée en dev, MUST avant prod réelle.
- Blocages rencontrés : aucun — l'audit a tout révélé.
- Apprentissages : LEARNING-007 — chaos de 30 migrations sur 9 mois = symptôme de "vibe coding sans gouvernance" ; un projet IA sans architecte identitaire devient une dette dès la 5e migration ; LEARNING-008 — la valeur d'une baseline propre n'est pas le code SQL lui-même mais l'ENGAGEMENT de l'équipe à ne plus dévier de la doctrine Database-as-Code.
- Prochaine étape : tâche #10 — produire `supabase/migrations/00000000000001_baseline.sql` intégrant les 6 corrections critiques + soft delete + indexes + triggers + RLS optimisées. Estimation : 400-600 lignes SQL.

## 2026-06-07 — Session 8 — Production baseline TUC-v2 (879 lignes)
- Objectif initial : tâche #10 — produire `supabase/migrations/00000000000001_baseline.sql` consolidant les 30 migrations Lovable en une migration propre intégrant les 6 corrections critiques de l'audit.
- Ce qui a été fait :
  1. Structure 11 sections : Setup (lock_timeout + extensions), Types (enum complet 4 valeurs), Fonctions (4 utilitaires avec search_path sécurisé), Domain 0 (5 tables identité/CMS), Domain 1 (3 tables acquisition avec soft delete), Domain 3 (2 tables matching), Domain 4 (6 tables meet/deals/payments), Transverse (1 table sync log), Indexes (41 sur FK + RLS), Triggers (10 update_updated_at + handle_new_user), RLS Policies (41 toutes optimisées), Storage Buckets (3 buckets + policies).
  2. Création `supabase/seed.sql` minimal (CMS test, structure pour seed users après création manuelle).
  3. Autocritique appliquée (règle d'or) — métriques finales :
     - **17 tables** (toutes les tables utilisées par le frontend actuel)
     - **41 indexes** (B-Tree sur 100% des FK + colonnes filtrées par RLS, partial indexes WHERE deleted_at IS NULL)
     - **41 policies** RLS
     - **10 triggers** (update_updated_at sur 8 tables + handle_new_user + on_auth_user_created)
     - **122/122 (100%)** occurrences `auth.uid()` wrappées dans `(select auth.uid())` → anti-pattern C3 corrigé à 100%
     - **41/41 (100%)** policies avec clause `TO authenticated`/`TO anon` → anti-pattern H1 corrigé à 100%
     - **search_path sécurisé** avec `pg_temp` en dernière position sur les 4 fonctions DEFINER/INVOKER (correction C5)
     - **lock_timeout = '5s'** en tête de migration (correction H2)
     - **soft delete** sur leads/appointments/deals avec partial indexes (correction H3)
     - **1 seule fonction `has_role(UUID, app_role)`** typée strict (correction C4)
     - **Enum `app_role` complet** (`'owner'`, `'admin'`, `'closer'`, `'user'`) dès la baseline (correction C1)
  4. CHECK constraints ajoutées : email regex, longueurs TEXT, ranges score (0-100), durations >= 0, end_at > start_at sur appointments.
  5. ON DELETE CASCADE sur FK vers `auth.users` (skill `supabase-auth-rls` checklist #10).
  6. BLOCKERS résiduels documentés en TODO inline : BLOCKER-001 tokens OAuth en clair (à chiffrer Vague 2), BLOCKER H8/H9 INSERT publics (à durcir avec Edge Functions rate-limited Vague 2).
- Vérification règle d'or : autocritique passée à 100% sur les 6 anomalies critiques (C1-C6) et 3 anomalies hautes (H1, H2, H3) ; aucune autre migration touchée ; seed.sql créé sans données sensibles ; apply_migration NON LANCÉ (en attente de validation explicite Nacer selon contraintes auth-security-rls + database-postgres).
- Décisions prises : tables Domain 2 (messagerie) et Domain 5 (onboarding complet) volontairement absentes de la baseline (Vague 3-4) ; fonction `auto_assign_closer_to_lead` reportée en Vague 2 (feature matching) ; migration RBAC vers JWT app_metadata reportée Vague 3 (gros refactor).
- Blocages rencontrés : aucun.
- Apprentissages : LEARNING-009 — une baseline propre est ~3x plus courte (879 lignes) que la somme des 30 migrations Lovable bordéliques car elle ne contient QUE l'état final, pas l'historique des erreurs et corrections ; LEARNING-010 — l'autocritique grep automatisée (compter wrappings, clauses TO, fonctions DEFINER) doit devenir un script CI obligatoire avant tout apply_migration.
- Prochaine étape : présenter la baseline à Nacer pour validation explicite → si OK, tâche #15 (apply baseline sur TUC-v2 via mcp__supabase__apply_migration) + tâche #11 (tests non-régression via get_advisors + smoke tests RLS) + tâche #12 (ADR-001 sécurité dans DECISIONS.md).

## 2026-06-07 — Session 9 — Apply baseline TUC-v2 + tests non-régression + ADR-001
- Objectif initial : tâches #15 (apply baseline) + #11 (tests) + #12 (ADR-001) — finaliser la Vague 1 sécurité.
- Ce qui a été fait :
  1. Diagnostic état Supabase TUC-v2 (llxgyomevketvypusafl) : 0 migration appliquée, schéma public vide → terrain neuf pour la baseline.
  2. 1ère tentative apply_migration (baseline complète) → ÉCHEC : `has_role` créée avant `user_roles` (erreur d'ordre, validation SQL strict).
  3. Réorganisation : split en 3 migrations versionnées :
     - `tuc_v2_baseline` (20260607194643) : extensions + enum + update_updated_at_column + tables Domain 0/1/3/4 + transverse + triggers updated_at + handle_new_user → SUCCÈS
     - `tuc_v2_rls_policies_and_storage` (20260607194749) : 35 policies RLS public + 6 policies storage + 3 buckets → SUCCÈS
     - `tuc_v2_security_hardening` (20260607194841) : REVOKE EXECUTE sur SECURITY DEFINER handle_new_user et has_role + 3 indexes FK manquants (formations.created_by, site_analytics.user_id, site_content.updated_by) + restriction listing buckets publics → SUCCÈS
  4. Vérifications via get_advisors security + performance :
     - **AVANT hardening** : 10 warnings sécurité, 49 warnings performance
     - **APRÈS hardening** : 4 warnings sécurité résiduels (2 documentés BLOCKER H8/H9 = call_bookings et site_analytics INSERT public à durcir avec Edge Function rate-limited en Vague 2 ; 2 sur fonction `rls_auto_enable` qui est INTERNE Supabase, hors notre contrôle).
  5. Tests SQL via execute_sql (résultats) : **17 tables publiques, RLS activée à 100%, 35 policies RLS + 6 storage, 66 indexes B-Tree/GIN, 9 triggers, 4 valeurs enum, 3 buckets, 4 fonctions publiques**.
  6. Génération types TypeScript via generate_typescript_types → sauvé dans `src/lib/database.types.ts` + README explicatif pour le frontend.
  7. ADR-001 écrit dans `.claude/memory/DECISIONS.md` : modèle RBAC owner > admin > closer > user via table user_roles + has_role SECURITY DEFINER + RLS optimisée wrappée + tokens en clair acceptés en MVP (BLOCKER-001).
- Vérification règle d'or : 3 migrations toutes versionnées et idempotentes (vérifiables via supabase migration list) ; 17/17 tables RLS activée ; 0 SECURITY DEFINER exposé en RPC ; 0 USING true non justifié et non documenté (les 2 restants sont commentés BLOCKER H8/H9) ; types TS générés cohérents avec le schéma appliqué ; conformité 13/15 checklist supabase-auth-rls.
- Décisions prises : ADR-001 (architecture sécurité acceptée) ; tokens OAuth en clair = BLOCKER-001 ouvert pour Vague 2 ; INSERT publics call_bookings/site_analytics = BLOCKER H8/H9 ouverts pour Vague 2 (Edge Functions Upstash rate-limited).
- Blocages rencontrés : ordre de création fonctions vs tables (résolu par split migration) ; `rls_auto_enable` warning (faux positif, fonction Supabase interne).
- Apprentissages : LEARNING-011 — PostgreSQL valide les bodies SQL des fonctions LANGUAGE SQL strict au moment du CREATE FUNCTION → toujours créer les tables référencées AVANT les fonctions ; LEARNING-012 — `REVOKE EXECUTE FROM anon, authenticated, public` sur SECURITY DEFINER ne casse PAS les triggers ni les policies RLS (qui s'exécutent en SECURITY DEFINER implicit) — c'est la solution propre pour bloquer les RPC publics sans perdre la fonctionnalité ; LEARNING-013 — Supabase MCP apply_migration tracé automatiquement dans schema_migrations avec version YYYYMMDDHHMMSS, parfait pour le rollback.
- Prochaine étape : tâche #16 (Nacer update .env frontend pour pointer vers TUC-v2) + tâche #13 (déconnecter Lovable) → Vague 1 sécurité totalement bouclée.
