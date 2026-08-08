# RÈGLE DE PROTECTION MÉTHODOLOGIQUE — TUC

> Auto-chargée à chaque session. Protège les fichiers structurants contre les modifications accidentelles.

## Fichiers protégés (modification nécessite escalade explicite à Nacer)

### Constitution et méthodologie
- `CLAUDE.md` — modification = approbation explicite Nacer + ADR
- `.claude/agents/contracts.md` — modification = approbation explicite Nacer + ADR
- `.claude/bootstrap.md` — modification = approbation explicite Nacer
- `.claude/rules/*.md` — modification = approbation explicite Nacer

### Sources de vérité produit
- `docs/REFERENCE.md` — modification = `produit-spec` uniquement, après validation Nacer
- `docs/ARCHITECTURE.md` — modification = `orchestrateur` uniquement, après ADR
- `docs/OBJECTIVES.md` — modification = approbation explicite Nacer (chiffres engageants)
- `docs/STRATEGY.md` — modification = approbation explicite Nacer

### Mémoire (intégrité historique)
- `.claude/memory/DECISIONS.md` — **append-only**. On ne réécrit pas un ADR, on en ajoute un nouveau "superseded by".
- `.claude/memory/LEARNINGS.md` — append-only.
- `.claude/memory/EVALS.md` — append-only.
- `.claude/memory/EXPERIMENTS.md` — append-only.
- `.claude/memory/JOURNAL.md` — append-only.
- `.claude/memory/BLOCKERS.md` — append + mise à jour de statut (`ouvert` → `résolu`).

**Seul l'agent `archiviste-memoire` écrit dans `.claude/memory/`.** Tout autre agent doit lui déléguer.

### Configuration critique
- `.env` — **JAMAIS modifié par un agent**. Lecture interdite si possible. Si nécessaire, demander à Nacer de fournir une variable explicite.
- `supabase/migrations/*.sql` — modification = `database-postgres` ou `auth-security-rls` uniquement, jamais d'édition d'une migration déjà appliquée (créer une nouvelle migration à la place).
- `package.json` / `bun.lockb` — modification = explicite, jamais en passant.
- `vercel.json` / `vite.config.ts` / `tsconfig*.json` — modification = `devops-vercel` ou `frontend-react` uniquement, avec justification.

## Procédure d'escalade en cas de modif protégée
1. L'agent identifie qu'il doit toucher un fichier protégé.
2. Il **arrête** son exécution.
3. Il retourne `Statut : ESCALADE` à l'orchestrateur.
4. L'orchestrateur demande à Nacer une approbation explicite.
5. Si Nacer valide → l'agent procède + un ADR est créé.
6. Si Nacer refuse → l'agent trouve une voie alternative ou clôt en `Statut : ÉCHEC`.

## Anti-pattern à proscrire
- Modifier un fichier protégé "parce que c'était plus simple".
- Réécrire une entrée de mémoire passée (au lieu d'append).
- Éditer une migration SQL déjà appliquée (au lieu d'en créer une nouvelle).
- Toucher `.env` sans demander.
