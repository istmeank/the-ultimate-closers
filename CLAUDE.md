# TUC — The Ultimate Closers

## Le quoi
TUC est un **CRM dopé à l'IA** (inspiré HubSpot + Odoo) qui automatise tout le cycle de vie commercial : capture prospect → qualification → scripts personnalisés → messages multi-canaux (WhatsApp, Telegram, Messenger, Instagram) → matching IA prospect/closer → briefing avant meet → transcription → critique constructive → suivi closer.

## Le pourquoi
Faire passer les closers à un niveau d'excellence rare en supprimant la friction opérationnelle, en alignant chaque prospect au bon closer par analyse de personnalité, et en transformant chaque meet en cycle d'apprentissage. Pour : agences de closing, équipes commerciales premium, formateurs indépendants.

## Le comment (philosophie)
- **Valeurs d'abord** : éthique du Coran, bienveillance, respect du prospect — pas de manipulation. Le sage roi des nuages ne triche pas.
- **Cohérence > vitesse** : on ne livre pas vite, on livre juste.
- **L'IA est l'assistant, le closer reste le décideur.**
- **Architecture identitaire** : chaque domaine = un espace clair, séparé, documenté.

## Domaines du projet
1. `acquisition-qualification/` — capture, scoring, qualification prospects
2. `messagerie-multicanaux/` — WhatsApp, Telegram, Messenger, Instagram + personnalisation IA
3. `matching-ia/` — analyse personnalité prospect ↔ closer, attribution
4. `meet-coaching/` — briefing, calendrier, transcription, feedback post-meet
5. `onboarding-closer/` — formation, montée en compétence, suivi performance

Détails dans `docs/ARCHITECTURE.md`.

## Règles de travail (non-négociables)

### 🔴 RÈGLE D'OR
**Ne jamais déclarer une tâche terminée sans avoir vérifié que rien d'autre n'est cassé.**
Avant de dire "fait" : (1) relis ton diff, (2) vérifie les domaines impactés, (3) teste manuellement ou via script, (4) documente la vérification dans `.claude/memory/JOURNAL.md`.

### Autres règles
- **Boucle mémoire** : tout bug → `.claude/memory/BLOCKERS.md`. Toute solution → `.claude/memory/LEARNINGS.md`. Toute décision d'architecture → `.claude/memory/DECISIONS.md`.
- **Avant code, plan** : pour toute tâche > 30 min, l'orchestrateur (`.claude/agents/orchestrateur.md`) produit un plan validé avant exécution.
- **Pas de tâche complexe sans cadrage technique** : Nacer est architecte identitaire, pas développeur — toute brique technique (auth, paiement, API messageries) demande validation par un dev partenaire avant implémentation.
- **Langue** : français pour la doc produit, anglais pour le code et les commits.
- **PRD à jour** : `docs/REFERENCE.md` est la source de vérité fonctionnelle. Toute évolution majeure y est répercutée.

## Ressources
- PRD produit : `docs/REFERENCE.md`
- Architecture : `docs/ARCHITECTURE.md`
- Orchestrateur : `.claude/agents/orchestrateur.md`
- Registres mémoire : `.claude/memory/`

## Documentation officielle Claude Code
- Mémoire projet : https://docs.claude.com/en/docs/claude-code/memory
- Sub-agents : https://code.claude.com/docs/en/sub-agents
- Hooks : https://code.claude.com/docs/en/hooks
- MCP : https://code.claude.com/docs/en/mcp
