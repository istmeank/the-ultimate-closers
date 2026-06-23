# T06 — Hook useAuth multi-rôles + ProtectedRoute requireRole

**Priorité** : P1 fondations
**Agent responsable** : `frontend-react`
**Skill bootstrap** : `react-shadcn-design-system` + `react-forms-i18n-a11y`
**Modèle Claude** : `sonnet-4-6` — Code React standard + a11y
**Skills Cowork (Claude PC)** : frontend-design, design:accessibility-review
**Effort estimé** : 2-3h
**Dépend de** : T03

---

## Prompt à copier-coller dans une nouvelle conversation Cowork

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

**Tâche T06** : étendre le hook `useAuth` et le composant `ProtectedRoute` pour supporter les nouveaux rôles closer/owner/client.

**Contexte** : actuellement `useAuth.tsx` expose juste `isAdmin`. Besoin : exposer `role` (état du rôle exact) + `isCloser`, `isOwner` + `ProtectedRoute` avec prop `requireRole='closer' | 'admin' | 'owner'`.

**Mission** :
1. Modifie `src/hooks/useAuth.tsx` :
   - Ajoute state `role: 'admin' | 'closer' | 'owner' | 'user' | 'client' | null`
   - Ajoute `isCloser`, `isOwner`
   - `checkRole` fetch depuis `user_roles`
   - Expose tout dans le retour
2. Modifie `src/components/ProtectedRoute.tsx` :
   - Props : `requireAdmin?: boolean`, `requireRole?: 'admin' | 'closer' | 'owner'`
   - Loading spinner si `loading`
   - Navigate `/` si rôle manquant
3. Ajoute route protégée `/dashboard-closer` dans `src/App.tsx` (placeholder pour T09).
4. Aucun hardcoded string (i18n via LanguageContext).

**Délègue à frontend-react** (skill `react-shadcn-design-system` + `valeurs-coran-bienveillance` pour microcopy).

**Critères d''acceptation** :
- [ ] `useAuth` retourne `{ user, session, role, isAdmin, isCloser, isOwner, loading, ... }`
- [ ] `ProtectedRoute requireRole=\"closer\"` bloque les non-closers
- [ ] Aucun `any` dans le code (TypeScript strict)
- [ ] Aucun hardcoded string
- [ ] Test responsive 375px
- [ ] Dark mode validé

**Format de sortie** : section `## RÉSULTAT` + diff Git.
```

---

## 🔍 Audit & Vérification (étape finale obligatoire)

> **Règle d'or TUC** (`.claude/rules/global.md`) : ne JAMAIS déclarer terminé sans (1) relire diff, (2) vérifier domaines voisins, (3) tester, (4) tracer dans JOURNAL.

### 1. Audit technique automatique
- [ ] **Relire diff Git complet** : `git diff` + `git diff --stat` — chercher PII, secrets, `console.log`, `any`, hardcoded strings
- [ ] **Invoquer `auditeur-qualite`** (read-only, sonnet-4-6) pour audit cross-domaines impactés
- [ ] **Vérifier `code-standards.md`** : aucun fichier > 300 lignes, pas de cycle d'imports, TS strict

### 2. Tests spécifiques à cette tâche
   - [ ] Lighthouse a11y > 95
   - [ ] Test responsive 375px + 768 + 1280
   - [ ] Dark mode validé
   - [ ] `useAuth` retourne tous les nouveaux états (role, isCloser, isOwner)
   - [ ] `ProtectedRoute requireRole="closer"` bloque les non-closers (test 2 comptes)

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T06): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T06
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
