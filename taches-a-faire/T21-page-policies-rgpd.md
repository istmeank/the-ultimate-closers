# T21 — Page /policies (RGPD + mentions légales + cookies)

**Priorité** : P7 polish & compliance
**Agent responsable** : `produit-spec` (contenu) + `redacteur-voix` (ton) + `frontend-react` (UI)
**Skills bootstrap** : `react-shadcn-design-system`, plugin `brand-voice`, plugin `operations:compliance-tracking`
**Modèle Claude** : `sonnet-4-6` — Contenu juridique + UI multi-onglets
**Skills Cowork (Claude PC)** : brand-voice:enforce-voice, operations:compliance-tracking, marketing:brand-review, docx, design:ux-copy
**Effort estimé** : 4-6h

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

**Tâche T21** : créer la page /policies conforme RGPD avec 3 sections.

**Mission** :
1. `src/pages/Policies.tsx` (route `/policies`) avec 3 onglets shadcn Tabs :
   - **Confidentialité** : RGPD complète (données collectées, finalités, base légale, droits utilisateur, durée conservation, DPO contact)
   - **Mentions légales** : éditeur (Nacer + société), hébergeur (Vercel + Supabase + AWS EU-west-3), directeur publication
   - **Cookies** : analytics, fonctionnels, gestion consentement
2. Rédaction par `redacteur-voix` + `produit-spec` : ton clair, valeurs Coran (transparence), pas de jargon juridique opaque.
3. Footer : ajoute lien `<Link to=\"/policies\">Mentions légales & RGPD</Link>`.
4. Banner cookie consent (Turnstile-compatible) au premier load.
5. i18n FR + AR (Coran-friendly) + EN.

**Délègue dans cet ordre** : produit-spec (squelette contenu) → redacteur-voix (ton) → frontend-react (UI).

**Critères d''acceptation** :
- [ ] 3 onglets complets et conformes RGPD
- [ ] Footer avec lien
- [ ] Banner cookies fonctionnel
- [ ] Validé `gardien-valeurs` (aucun dark pattern dans le consent)
- [ ] Responsive 375px
- [ ] i18n FR/AR/EN

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
   - [ ] **Validation `gardien-valeurs`** : aucun dark pattern dans banner cookies
   - [ ] Brand review (`marketing:brand-review`) : ton aligné Coran (transparence)
   - [ ] 3 onglets complets + i18n FR/AR/EN
   - [ ] Footer avec lien testé
   - [ ] Test responsive 375px
   - [ ] Conformité RGPD validée (droits utilisateur, DPO, finalités)

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T21): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T21
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
