# T11 — StatsCards KPIs closer (leads chauds, RDV, deals, taux)

**Priorité** : P3 UI core
**Agent responsable** : `frontend-react`
**Skills bootstrap** : `react-shadcn-design-system`
**Modèle Claude** : `sonnet-4-6` — KPIs + UI standard
**Skills Cowork (Claude PC)** : frontend-design, ui-ux-pro-max, design:design-system
**Effort estimé** : 2-3h
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

**Tâche T11** : créer le composant StatsCards qui affiche 4 KPIs en haut du dashboard closer.

**Mission** :
`src/components/closer/StatsCards.tsx` avec 4 cards :
1. **Leads chauds** : count `leads` où `owner_id = me` AND `score >= 75`
2. **RDV à venir** : count `appointments` où `assigned_to = me` AND `start_at >= now() AND start_at < now() + 7 days`
3. **Deals actifs** : count `deals` où `leads.owner_id = me` AND `stage IN ('qualified', 'proposal', 'negotiation')`
4. **Taux closing** : `deals_won / deals_total` sur 30 derniers jours

Détails :
- Requêtes parallèles via `Promise.all` + TanStack Query
- Skeleton loading
- Couleurs brand selon KPI (vert pour leads chauds, doré pour deals, etc.)
- Icons Lucide
- Trend indicator (↑ ↓ →) vs période précédente (calculer delta 30j)

**Délègue à frontend-react**.

**Critères d''acceptation** :
- [ ] 4 cards affichées avec données réelles
- [ ] Skeleton pendant chargement
- [ ] Responsive 375px (stack vertical)
- [ ] Aucun `any`
- [ ] Calcul taux closing correct (vérifier division par zéro)

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
   - [ ] 4 KPIs vérifiés manuellement via SQL direct
   - [ ] Skeleton loading visible pendant fetch
   - [ ] Test responsive 375px (stack vertical)
   - [ ] Division par zéro gérée (taux closing si 0 deals)

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T11): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T11
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
