# T12 — LeadDetail + InteractionsTimeline

**Priorité** : P3 UI core
**Agent responsable** : `frontend-react`
**Skills bootstrap** : `react-shadcn-design-system`, `react-forms-i18n-a11y`
**Modèle Claude** : `sonnet-4-6` — Page composée + microcopy
**Skills Cowork (Claude PC)** : frontend-design, ui-ux-pro-max, design:ux-copy, design:accessibility-review
**Effort estimé** : 4-5h
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

**Tâche T12** : page détail lead avec timeline chronologique + actions rapides.

**Mission** :
1. `src/pages/LeadDetail.tsx` (route `/dashboard-closer/lead/:id`) :
   - **Header** : nom + score + sentiment + tags + 4 boutons (Log Call, Envoyer Email, Créer RDV, Ouvrir HubSpot)
   - **Section Timeline** : `InteractionsTimeline` (composant T12.2)
   - **Section Informations** : email, téléphone, source, date création, owner closer
   - **Section Deals associés** : table
   - **Section Resources** : documents partagés
2. `src/components/closer/InteractionsTimeline.tsx` :
   - Fetch `interactions` où `lead_id` ordered DESC
   - Affichage chronologique inversé (récent en haut)
   - Icon par type : call (Phone), msg (MessageSquare), email (Mail), meet (Calendar), note (FileText)
   - Date format relative (`formatDistanceToNow` date-fns FR)
3. Dialog \"Log Call\" : formulaire avec durée + résumé + outcome + sentiment (skill `react-forms-i18n-a11y`).

**Délègue à frontend-react**.

**Critères d''acceptation** :
- [ ] Page accessible via clic sur LeadCard (T10)
- [ ] Timeline triée DESC, dates relatives FR
- [ ] Dialog Log Call avec validation Zod
- [ ] Bouton \"Ouvrir HubSpot\" visible seulement si `external_sync_log.hubspot_id` existe
- [ ] RLS testée : closer A ne voit pas lead de closer B
- [ ] Responsive 375px

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
   - [ ] Test RLS : closer A ne voit pas lead closer B (curl avec JWT)
   - [ ] Dialog Log Call validation Zod testée (Zod safeParse + erreurs ARIA)
   - [ ] Timeline ordrée DESC + dates relatives FR
   - [ ] Test responsive 375px
   - [ ] Bouton HubSpot conditionnel (`external_sync_log.hubspot_id` existe)

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T12): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T12
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
