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

---

## Position dans le réseau SILICATE (ajouté session 31 — 2026-06-13)

Ce repo est positionné comme **extension du pôle tech TUC business** = **Branches code** du réseau SILICATE.

```
              ☁️ Sage Roi des Nuages

            🌳 TUC business — Branches corporate (D:\Startup LABEL\Startup The Ultimate Closers Agency Closing\)
       →    🌳 TUC tech (CRM) — Branches code    ←  CE REPO
            🪵 ANK — Tronc (à créer, sera intégré dans TUC en An 2)
            🌱 LULG — Racines (D:\Startup LABEL\Startup LEVEL UP for Ladies & Gentlemen\)
            🟫 SILICATE — Argile (D:\Startup LABEL\SILICATE INCUBATEUR\)
```

**Position hiérarchique** : l'orchestrateur de ce repo est un **sous-directeur du pôle tech** sous gouvernance corporate TUC. Il n'est PAS au-dessus des autres entités du réseau — il est un pair méthodologique parmi un réseau coordonné.

**Architecture évolution** : ce repo applique l'architecture Supabase MVP → Backend custom Twenty-like (ADR-025, cf. `docs/architecture-evolution.md`). T28 du backlog `taches-a-faire/` pose la couche d'abstraction services AVANT toute autre tâche, pour préparer la transition future sans douleur.

**Squelette commun** : ce repo honore les 8 pierres angulaires du squelette de gouvernance reproductible Silicate v0 → `D:\Startup LABEL\SILICATE INCUBATEUR\docs\skeleton-gouvernance-v0.md` (constitution / `.claude/` standardisée / mémoire append-only / règle d'or 4 portes / rituel fermeture 3 questions / filtre éthique 5 vétos / anti-invention / protection méthodologique).

**Lien stratégique** : TUC construit le **système d'acquisition complet de LULG**. Ce CRM est l'un des outils de cette mission. Plus tard, ANK sera intégré dans ce CRM pour devenir l'intelligence vivante du closing.

## Bootstrap de session — lire en priorité absolue

> *Approuvé session 4 par Abdenacer Maredj. Raison : Claude n'a pas de mémoire inter-session. Sans ce bootstrap, chaque session repart de zéro et risque de contredire les décisions passées, refaire ce qui a été fait, ou inventer ce qui a été sourcé.*

**À chaque nouvelle session dans ce dossier, Claude lit dans cet ordre avant toute action :**

1. **Ce fichier (`CLAUDE.md`)** — constitution TUC tech, périmètre, règles non-négociables
2. **`.claude/memory/JOURNAL.md`** — dernière session, état courant, prochaine étape
3. **`.claude/memory/DECISIONS.md`** — ADR actifs (décisions architecturales en vigueur)
4. **`.claude/memory/LEARNINGS.md`** — leçons capitalisées (garde-fou anti-invention)

**Signal de confirmation** : après relecture, Claude confirme en début de réponse :
> *"Bootstrap effectué — dernière session : [date et titre] — dernier ADR : [numéro] — prêt."*

**Temps estimé** : 5-10 min. Non-négociable avant toute action sur TUC tech.

---

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
