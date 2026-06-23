# T22 — Traductions i18n complètes FR/EN/Darija

**Priorité** : P7 polish
**Agent responsable** : `redacteur-voix` (traduction) + `frontend-react` (intégration)
**Skills bootstrap** : `react-forms-i18n-a11y`, plugin `brand-voice`
**Modèle Claude** : `opus-4-6` — Qualité linguistique 3 langues, Darija/AR sensible
**Skills Cowork (Claude PC)** : brand-voice:enforce-voice, marketing:brand-review, design:ux-copy
**Effort estimé** : 6-8h

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

**Tâche T22** : compléter les traductions FR/EN/Darija dans `src/contexts/LanguageContext.tsx` pour TOUS les écrans closers.

**Mission** :
Ajoute clés de traduction pour :
- **Dashboard closer** : closer.pipeline, closer.leads, closer.calendar, closer.slack, closer.profile, closer.stats.* (4 KPIs)
- **Kanban** : kanban.new, kanban.qualified, kanban.in_progress, kanban.won, kanban.lost
- **Actions** : action.log_call, action.send_email, action.create_appointment, action.sync_hubspot, action.create_payment
- **Chatbot** : chatbot.title, chatbot.q1 → q5, chatbot.submit, chatbot.success, chatbot.error
- **Policies** : sections complètes RGPD/mentions/cookies (T21)
- **Admin** : admin.closers, admin.crm_stats, etc.

**Important** :
- **Darija** : tutoiement direct, expressions DZ authentiques (skill `react-forms-i18n-a11y` + consultation `redacteur-voix`)
- **Arabe (RTL)** : tester direction du layout
- **Coran-friendly** : éviter expressions vulgaires, conserver respect

**Délègue à redacteur-voix** (qualité linguistique) puis `frontend-react` (intégration).

**Critères d''acceptation** :
- [ ] Toutes les clés ajoutées dans 3 langues
- [ ] Aucun hardcoded string restant dans composants closers (grep `grep -r 'hardcoded'` zero match)
- [ ] RTL testé pour AR
- [ ] Darija validée native speaker

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
   - [ ] **Validation `redacteur-voix`** sur qualité linguistique 3 langues
   - [ ] Darija validée par native speaker (tutoiement DZ authentique)
   - [ ] RTL testé pour AR (direction layout correcte)
   - [ ] Aucun hardcoded string restant (grep zero match)
   - [ ] Toutes les clés ajoutées dans 3 langues (count vérifié)

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T22): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T22
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
