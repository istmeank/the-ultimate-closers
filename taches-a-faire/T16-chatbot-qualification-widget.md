# T16 — ChatbotQualif widget + ChatbotConversation 5 questions

**Priorité** : P5 acquisition
**Agent responsable** : `frontend-react` + `redacteur-voix` (microcopy)
**Skills bootstrap** : `react-shadcn-design-system`, `react-forms-i18n-a11y`, `valeurs-coran-bienveillance`
**Modèle Claude** : `sonnet-4-6` — UI + filtre éthique microcopy
**Skills Cowork (Claude PC)** : ui-ux-pro-max, design:ux-copy, brand-voice:enforce-voice, frontend-design, marketing:brand-review
**Effort estimé** : 4-5h

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

**Tâche T16** : créer le chatbot de qualification sur la homepage avec 5 questions séquentielles.

**Mission** :
1. Installe `framer-motion` pour animations.
2. `src/components/ChatbotQualif.tsx` : widget bubble bottom-right avec animation pulse-glow (couleurs brand) + modal expansion smooth.
3. `src/components/ChatbotConversation.tsx` : 5 questions séquentielles avec validation Zod (skill `react-forms-i18n-a11y`) :
   - Q1 \"Quel est votre objectif principal ?\" (textarea min 10 chars)
   - Q2 \"Dans quel délai souhaitez-vous agir ?\" (radio: cette semaine / 30j / >30j)
   - Q3 \"Budget estimé ?\" (select fourchettes)
   - Q4 \"Vos canaux de vente principaux ?\" (checkboxes multi)
   - Q5 \"Souhaitez-vous un audit rapide gratuit ?\" (yes/no)
4. **Microcopy non-manipulatrice** (skill `valeurs-coran-bienveillance`) : pas d''urgence factice, pas de FOMO, pas de \"plus que X places\". Consultation `redacteur-voix` pour le ton.
5. Progression visuelle (1/5, 2/5...) + boutons Retour/Suivant.
6. Submit : POST vers Edge Function `score-lead` (T07).
7. Redirect selon score : >= 75 → `/reserver-appel`, sinon → message remerciement.
8. i18n FR/EN/Darija (T22 ajoute traductions).
9. Mobile-first : full-screen sur 375px, modal sur desktop.

**Délègue à frontend-react** + consultation `redacteur-voix` + filtre `gardien-valeurs`.

**Critères d''acceptation** :
- [ ] 5 questions séquentielles avec validation
- [ ] Animation pulse + expansion smooth
- [ ] Microcopy 100% non-manipulatrice (validé gardien-valeurs)
- [ ] Aucun `any`
- [ ] WCAG 2.1 AA (focus, ARIA labels, navigation clavier)
- [ ] Mobile-first OK
- [ ] POST score-lead testé end-to-end

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
   - [ ] **Filtre éthique `gardien-valeurs` obligatoire** sur 5 questions + microcopy
   - [ ] WCAG 2.1 AA validé (focus, ARIA, navigation clavier)
   - [ ] Mobile-first : full-screen 375px, modal desktop
   - [ ] POST score-lead end-to-end testé
   - [ ] Animation pulse non-intrusive (pas d'auto-open)

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T16): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T16
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
