# BOOTSTRAP — Procédures auto-chargées à chaque session

> Ce fichier est lu par l'orchestrateur (et par tout agent invoqué) au démarrage de chaque mission.
> Garantit que rien ne démarre dans le flou.

## 1. Vérifications d'intégrité (en premier)

Avant toute action, vérifier que ces fichiers existent et sont lisibles :
- `CLAUDE.md` — constitution
- `docs/REFERENCE.md` — PRD source de vérité
- `docs/ARCHITECTURE.md` — 5 domaines
- `docs/OBJECTIVES.md` — objectifs chiffrés
- `docs/STRATEGY.md` — stratégie produit
- `.claude/agents/contracts.md` — contrat collectif
- `.claude/rules/global.md`, `methodology-guard.md`, `code-standards.md`
- `.claude/memory/DECISIONS.md`, `BLOCKERS.md`, `LEARNINGS.md`, `EVALS.md`, `EXPERIMENTS.md`, `JOURNAL.md`

Si un fichier manque → l'orchestrateur **arrête tout** et alerte Nacer.

## 2. Chargement contextuel obligatoire (Progressive Disclosure)

L'orchestrateur charge **systématiquement** au démarrage :
1. `CLAUDE.md`
2. `docs/REFERENCE.md` (juste les sections 1, 2, 3, 5)
3. `docs/ARCHITECTURE.md`
4. `.claude/agents/contracts.md`
5. `.claude/rules/global.md`
6. La dernière entrée de `.claude/memory/JOURNAL.md` (pour reprendre le fil)
7. Les ADR ouverts ou récents de `.claude/memory/DECISIONS.md`
8. Les BLOCKERS au statut "ouvert" dans `.claude/memory/BLOCKERS.md`

**Il ne charge PAS** automatiquement :
- Le code source `src/` (chargé à la demande par les spécialistes)
- Les skills `.claude/skills/*/SKILL.md` (chargés uniquement par les agents qui en ont besoin)
- Les rapports historiques `reports/experiments/*` (consultation ponctuelle)

## 3. Anti-blocage (loop guard)

Si un agent :
- Itère plus de **3 fois** sur la même action sans progrès → arrêter, escalader à l'orchestrateur avec `Statut : ESCALADE`.
- Bloque sur une question qui n'a pas de réponse dans le contexte chargé → escalader à Nacer (jamais deviner).
- Reçoit deux instructions contradictoires entre `CLAUDE.md` et un ADR → l'ADR le plus récent l'emporte. Si doute → escalader.

## 4. Procédures de sécurité (anti-incident)

- **JAMAIS** exécuter `rm -rf`, `DROP TABLE`, `DROP DATABASE` sans validation explicite Nacer.
- **JAMAIS** push directement sur `main` — toujours via branche + PR.
- **JAMAIS** commit de fichier contenant une clé API, un token, un mot de passe.
- **JAMAIS** activer une RLS sur une table en prod sans avoir testé en staging d'abord.
- Avant toute migration SQL : sauvegarder l'état actuel (`supabase db dump`) → fichier daté dans `~/.tuc-backups/`.

## 5. Procédures de vérification (sortie qualité)

Avant qu'un agent retourne `Statut : SUCCÈS`, il doit avoir :
- [ ] Vérifié que les fichiers modifiés sont syntaxiquement valides (compile / parse OK).
- [ ] Vérifié qu'aucun fichier protégé (cf. `methodology-guard.md`) n'a été touché sans autorisation.
- [ ] Rempli le bloc `## RÉSULTAT` selon le format de `contracts.md`.
- [ ] Suggéré une entrée mémoire si pertinent (BLOCKER/LEARNING/EVAL/ADR/EXP).

## 6. Comportement face à l'incertitude

Hiérarchie de réaction :
1. **Re-lire** le contexte chargé.
2. **Chercher** dans `.claude/memory/` (LEARNINGS, DECISIONS) si la question a déjà été tranchée.
3. **Demander** à l'orchestrateur (si sub-agent).
4. **Escalader** à Nacer (jamais deviner).

> Une question posée à temps coûte 30 secondes. Une mauvaise hypothèse coûte des heures.

## 7. Reprise de session

À chaque nouvelle session avec Nacer :
1. Lire `.claude/memory/JOURNAL.md` (dernière entrée).
2. Vérifier les `BLOCKERS` au statut "ouvert".
3. Saluer Nacer en récapitulant en 3 lignes max où on en était.
4. Demander si on continue le fil ou si on attaque un nouveau sujet.

## 8. Versionning de ce bootstrap

Toute modification = nouvel ADR. Version actuelle : **v1.0** (2026-06-07).
