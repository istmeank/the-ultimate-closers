# PLANIFICATION — TUC tech (tableau de bord courant)

> **Fichier ΔP3-bis** (squelette Silicate v1.5, module `02-memoire.md`). Mutable, contrairement aux 6 registres
> `.claude/memory/` qui sont append-only. Lu au bootstrap **en dernier**, après `CLAUDE.md` → `JOURNAL.md` →
> `DECISIONS.md` → `LEARNINGS.md` — c'est lui qui donne le point de reprise exact, pas le JOURNAL entier.
> Purge : tous les ~5 sessions, "Récemment complété" est archivé dans `JOURNAL.md` et vidé ici.
> Le détail technique complet des tâches reste dans `taches-a-faire/README.md` (27 tâches) et
> `docs/domains/*/PLAN.md` — ce fichier n'est PAS un troisième registre de tâches (P27), il pointe vers eux.

---

## Tâche en cours

**T05 — Triggers log_appointment + log_deal_interaction**
- Migration `20260809000001_tuc_v2_triggers_log_interactions.sql` créée (session 37, 2026-08-09)
- Statut : vérifié, sécurisé, en attente de relecture Nacer + application prod
- Découverte : CHECK `interactions.type` n'acceptait pas `'note'` — élargissement critique ajouté

---

## Tâches à venir — par pôle

### Gouvernance / squelette (prio 0)
- Invoquer le premier audit P25 complet (celui de cette session est une version légère, à date de session) au prochain seuil (10 sessions significatives ou 20 ADR) — actuellement 35 sessions JOURNAL / 38 ADR : **seuil déjà dépassé, à planifier prochaine session**.
- Vérifier ¶P1 (sobriété `CLAUDE.md` < 200 lignes) à chaque ajout de section.

### Sécurité / infrastructure technique (prio 0)
- **BLOCKER-012** — `supabase/migrations/` du repo Git désynchronisé de la base live (4 migrations de sécurité
  appliquées en prod, session 18-19, jamais rapatriées dans le repo). Prod non affectée, mais tout rebuild depuis
  le repo Git recréerait le schéma non sécurisé. À traiter par `database-postgres` (`supabase db pull` ou
  migration de rattrapage).
- BLOCKER-011 — protection mots de passe compromis désactivée (Supabase Auth) — ouvert
- BLOCKER-013 — suppression logique non garantie par la base (fonction `soft_delete()` jamais déployée) — ouvert

### Domaine 1 — Acquisition & Qualification (prio 1)
- Refonte parcours lead après stabilisation sécurité (T03 → T04, T05, T06)
- **T04 réconciliation** : fiche ✅ completed cite migration `20251029123034` (introuvable dans le repo), même symptôme que BLOCKER-012. À vérifier : fonction `auto_assign_closer_to_lead` vraiment appliquée en prod ou juste dans la fiche ?

### Domaine 4 — Meet & Coaching (prio 1)
- Intégration Google Calendar (T13-T15) — table tokens existe
- Skill `whisper-transcription` + agent `meet-coaching` à activer (ADR-037, réutilisation sélective meetily)

### Domaine 2 — Messagerie multi-canaux (prio 2)
- Cadrage WhatsApp Business API officielle (T24, ADR-038 : prototypage interne Baileys OK, envoi réel = API officielle uniquement)

### Domaine 3 — Matching IA (prio 2)
- Modélisation `CloserProfile` / `ProspectProfile` (T07 → T08)

### Domaine 5 — Onboarding closer (prio 2)
- Cadrage parcours 30/60/90j (dépend stabilisation domaines 1 et 4)

### Polish / dette (backlog, non bloquant)
- SUGGESTION 2026-08-08 — poids bundle + logo (frontend-react)
- SUGGESTION 2026-08-08 — fichier de types Supabase mort (`src/lib/database.types.ts`) — arbitrage Nacer
- SUGGESTION 2026-08-09 — `src/components/closer/InteractionsTimeline.tsx` mappe type `meeting`, base écrit `meet` — cosmétique, pas bloquant

---

## Récemment complété

- 2026-08-09 (session 37) — T05 migration écrite et vérifiée (`20260809000001_tuc_v2_triggers_log_interactions.sql`) en attente application prod. BLOCKER-014 confirmé non fermé (dépôt toujours public). LEARNING-095 et -096 capitalisées.
- 2026-08-08 (session 36) — Glossaire TUC tech créé (`docs/GLOSSAIRE.md`, zone d'ombre #1 de EVAL-002 traitée)
- 2026-08-08 (session 35) — ADR-037 (meet-coaching, réutilisation meetily) + ADR-038 (WhatsApp Baileys interne / API officielle réel)
- 2026-08-08 (session 34) — T28 couche d'abstraction services actée (ADR-025) + modèle de rôles à 7 valeurs (ADR-036) + BLOCKER-009 et BLOCKER-010 résolus

---

## Bookmark de reprise

**Point exact** (session 37, 2026-08-09, correction 2026-08-09) : T05 migration écrite et vérifiée, en attente de relecture Nacer + application prod. BLOCKER-014 RÉSOLU (dépôt privé confirmé par vue authentifiée ; cache CDN HTTP avait servi version périmée). T04 réconciliation identifiée comme nécessaire (migration 20251029123034 citée dans fiche, absente du repo — même pattern que BLOCKER-012).

**Prochaine étape** : Nacer relecture T05 + décision application prod. En parallèle : `database-postgres` traite BLOCKER-012 + T04 réconciliation. Dépôt privé depuis session 34, 13 commits locaux + modifications session 37 restent non commités en attente suppression `.git/index.lock` (présent depuis session parallèle) — Nacer nettoie en local Windows puis push.
