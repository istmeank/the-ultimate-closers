# T09 — CloserLayout + sidebar navigation

**Priorité** : P3 UI core
**Agent responsable** : `frontend-react`
**Skills bootstrap** : `react-shadcn-design-system`, `react-forms-i18n-a11y`
**Modèle Claude** : `sonnet-4-6` — UI shadcn standard
**Skills Cowork (Claude PC)** : frontend-design, ui-ux-pro-max, design:design-system, design:design-handoff
**Effort estimé** : 3-4h
**Dépend de** : T06

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

**Tâche T09** : créer le layout closer avec sidebar navigation.

**Mission** :
1. Crée `src/components/closer/CloserLayout.tsx` :
   - Sidebar gauche (shadcn Sidebar component) avec items : Pipeline, Mes Leads, Agenda Google, Slack, Profil
   - Background gradient subtil (skill `react-shadcn-design-system` couleurs brand)
   - Responsive : Drawer mobile (375px)
   - Dark mode validé
2. Crée page placeholder `src/pages/DashboardCloser.tsx` :
   - Wrap dans `CloserLayout`
   - Titre \"Pipeline Closers\" + placeholder pour StatsCards (T11) + KanbanBoard (T10)
3. Ajoute route `/dashboard-closer` protégée `requireRole=\"closer\"` dans `src/App.tsx`.
4. Aucun hardcoded string (i18n via LanguageContext, voir T22).

**Délègue à frontend-react**.

**Critères d''acceptation** :
- [ ] CloserLayout responsive 375px → desktop
- [ ] Sidebar collapsible mobile (Drawer)
- [ ] Tous icons Lucide React
- [ ] Aucun `any`
- [ ] Dark mode parfait
- [ ] Lighthouse a11y > 95
- [ ] Checklist 12 points skill `react-shadcn-design-system` validée

**Format de sortie** : section `## RÉSULTAT` + screenshots desktop + mobile.
```

---

## 🔍 Audit & Vérification (étape finale obligatoire)

> **Règle d'or TUC** (`.claude/rules/global.md`) : ne JAMAIS déclarer terminé sans (1) relire diff, (2) vérifier domaines voisins, (3) tester, (4) tracer dans JOURNAL.

### 1. Audit technique automatique
- [ ] **Relire diff Git complet** : `git diff` + `git diff --stat` — chercher PII, secrets, `console.log`, `any`, hardcoded strings
- [ ] **Invoquer `auditeur-qualite`** (read-only, sonnet-4-6) pour audit cross-domaines impactés
- [ ] **Vérifier `code-standards.md`** : aucun fichier > 300 lignes, pas de cycle d'imports, TS strict

### 2. Tests spécifiques à cette tâche
   - [ ] Lighthouse a11y > 95 + perf > 90
   - [ ] Test responsive 375px (Drawer mobile) + 768 + 1280
   - [ ] Dark mode validé
   - [ ] Checklist 12 points skill `react-shadcn-design-system`

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T09): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T09
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
