# T18 — ClosersManager admin (liste, charge, réassign manuelle)

**Priorité** : P6 admin
**Agent responsable** : `frontend-react`
**Skills bootstrap** : `react-shadcn-design-system`, `react-forms-i18n-a11y`
**Modèle Claude** : `sonnet-4-6` — UI admin riche
**Skills Cowork (Claude PC)** : frontend-design, ui-ux-pro-max, design:design-system
**Effort estimé** : 4-5h
**Dépend de** : T03

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

**Tâche T18** : créer le composant admin pour gérer les closers (liste + charge + activation + réassignation).

**Mission** :
`src/components/admin/ClosersManager.tsx` :
- Table avec colonnes : Avatar+Nom, Email, Spécialités (badges), Leads actifs, RDV 7j, Charge totale (workload), Max concurrent, Statut (Switch is_active), Actions (Edit, Réassigner)
- Fetch via supabase-js avec joins profiles + user_roles + leads(count) + appointments(count)
- Edit Dialog : modifier specialty[] + max_concurrent_leads
- Bouton \"Réassigner\" : ouvre Dialog pour transférer leads vers autre closer (multi-select leads + select destination)
- Filtres : Actifs / Inactifs / Spécialité
- Skill `react-forms-i18n-a11y` pour formulaires Zod

**Délègue à frontend-react**.

**Critères d''acceptation** :
- [ ] Liste closers fonctionnelle
- [ ] Toggle is_active OK (avec confirmation)
- [ ] Edit specialty/max_leads sauvegarde DB
- [ ] Réassignation batch testée (au moins 5 leads)
- [ ] RLS : seul admin/owner accès
- [ ] Test responsive

**Format de sortie** : section `## RÉSULTAT`.
```

---

## 🔍 Audit & Vérification (étape finale obligatoire)

> **Règle d'or TUC** (`.claude/rules/global.md`) : ne JAMAIS déclarer terminé sans (1) relire diff, (2) vérifier domaines voisins, (3) tester, (4) tracer dans JOURNAL.

### 1. Audit technique automatique
- [ ] **Relire diff Git complet** : `git diff` + `git diff --stat` — chercher PII, secrets, `console.log`, `any`, hardcoded strings
- [ ] **Invoquer `auditeur-qualite`** (read-only, sonnet-4-6) pour audit cross-domaines impactés
- [ ] **Vérifier `code-standards.md`** : aucun fichier > 300 lignes, pas de cycle d'imports, TS strict

### 2. Tests spécifiques à cette tâche
   - [ ] Toggle is_active OK + confirmation modal
   - [ ] Edit specialty/max_leads sauvegarde DB (vérif via `mcp__execute_sql`)
   - [ ] Réassignation batch testée (5 leads vers autre closer)
   - [ ] RLS : admin/owner uniquement
   - [ ] Test responsive 375px

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T18): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T18
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
