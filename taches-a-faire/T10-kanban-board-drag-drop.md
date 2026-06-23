# T10 — KanbanBoard + KanbanColumn + LeadCard (drag & drop)

**Priorité** : P3 UI core
**Agent responsable** : `frontend-react`
**Skills bootstrap** : `react-shadcn-design-system`, `react-forms-i18n-a11y`
**Modèle Claude** : `sonnet-4-6` — UI riche drag & drop
**Skills Cowork (Claude PC)** : frontend-design, ui-ux-pro-max, design:design-critique, design:accessibility-review
**Effort estimé** : 5-6h
**Dépend de** : T09

---

## Prompt à copier-coller

```
Salut Claude. Je suis Nacer (Abdenacer Maredj), architecte identitaire du projet TUC (The Ultimate Closers). Cette conversation est dédiée à UNE tâche précise du backlog `taches-a-faire/`.

**Avant toute action**, lis dans cet ordre :
1. `D:\GitHub\the-ultimate-closers\CLAUDE.md`
2. `D:\GitHub\the-ultimate-closers\.claude\memory\MEMORY.md`
3. `D:\GitHub\the-ultimate-closers\.claude\agents\contracts.md`
4. `D:\GitHub\the-ultimate-closers\.claude\rules\global.md`
5. `D:\GitHub\the-ultimate-closers\.claude\rules\methodology-guard.md`
6. `D:\GitHub\the-ultimate-closers\.claude\rules\code-standards.md`

**Règles non-négociables** :
- Règle dor : ne JAMAIS déclarer terminé sans relire diff, vérifier domaines voisins, tester, tracer dans JOURNAL.
- Append-only sur `.claude/memory/`.
- Pas de dark pattern, pas denvoi sans opt-in RGPD, pas de secret en clair, pas de matching discriminatoire.
- Français pour doc/mémoire, anglais pour code.

À la fin : trace la session dans `JOURNAL.md` via archiviste-memoire + commit Git + mets à jour `taches-a-faire/README.md` (statut ✅).

**Tâche T10** : implémenter le Kanban Board drag & drop pour gérer les leads dans le pipeline.

**Mission** :
1. Installe `@hello-pangea/dnd` (fork maintenu de react-beautiful-dnd) — pas react-beautiful-dnd (abandonné).
2. Crée `src/components/closer/KanbanBoard.tsx` :
   - 5 colonnes : New (violet), Qualified (bleu), In Progress (orange), Won (vert), Lost (rouge)
   - Fetch `leads` filtrés par `owner_id = current closer` via TanStack Query
   - `onDragEnd` : UPDATE `leads.status` via supabase-js
   - Optimistic UI (`useOptimistic` React 19) pour transition instantanée
3. `src/components/closer/KanbanColumn.tsx` : reçoit `column` + `leads`, gère `Droppable`.
4. `src/components/closer/LeadCard.tsx` :
   - Badge score coloré : rouge <50, orange 50-74, vert >=75 (emoji ❄️ ⚡ 🔥)
   - Hover effect + shadow
   - Click → navigate `/dashboard-closer/lead/:id` (T12)
5. Performance : memoization (LeadCard en `memo`), lazy loading si > 100 leads.

**Délègue à frontend-react**.

**Critères d''acceptation** :
- [ ] Drag & drop fluide (feedback visuel < 200ms)
- [ ] UPDATE DB confirmé après drop (rollback optimistic si erreur)
- [ ] Test responsive : sur mobile → Tabs verticales au lieu de Kanban horizontal
- [ ] Aucun re-render orphelin (memo)
- [ ] Aucun `any`
- [ ] Lighthouse perf > 90

**Format de sortie** : section `## RÉSULTAT` + vidéo gif drag & drop.
```

---

## 🔍 Audit & Vérification (étape finale obligatoire)

> **Règle d'or TUC** (`.claude/rules/global.md`) : ne JAMAIS déclarer terminé sans (1) relire diff, (2) vérifier domaines voisins, (3) tester, (4) tracer dans JOURNAL.

### 1. Audit technique automatique
- [ ] **Relire diff Git complet** : `git diff` + `git diff --stat` — chercher PII, secrets, `console.log`, `any`, hardcoded strings
- [ ] **Invoquer `auditeur-qualite`** (read-only, sonnet-4-6) pour audit cross-domaines impactés
- [ ] **Vérifier `code-standards.md`** : aucun fichier > 300 lignes, pas de cycle d'imports, TS strict

### 2. Tests spécifiques à cette tâche
   - [ ] Test drag & drop sur 10 leads → UPDATE DB confirmé
   - [ ] Lighthouse perf > 90 (memoization vérifiée, aucun re-render orphelin)
   - [ ] Test responsive : 375px → Tabs verticales
   - [ ] Optimistic UI avec rollback testé (couper réseau pendant drag)
   - [ ] Bundle size : aucun chunk > 1MB

### 3. Filtre éthique (si applicable)
- [ ] **`gardien-valeurs`** consulté si la tâche touche : microcopy, IA générative, opt-in/opt-out, scripts envoyés, scoring, matching, banner cookies
- [ ] Aucun dark pattern, aucune urgence factice, aucun consent caché

### 4. Capitalisation mémoire (via `archiviste-memoire` exclusivement)
- [ ] **JOURNAL.md** : session datée + rituel 3 questions (Décidé / Appris / Dérivé)
- [ ] **LEARNINGS.md** : ajouter si leçon technique notable (pattern réutilisable, piège évité)
- [ ] **DECISIONS.md** : ADR si choix structurant impactant > 1 domaine
- [ ] **BLOCKERS.md** : marquer résolu si la tâche clôture un blocker, ouvrir nouveau si débloqué

### 5. Livraison
- [ ] **Update `taches-a-faire/README.md`** : passer statut ⏳ pending → ✅ completed + colonne Notes = `commit <hash>`
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T10): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T10
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
