# T27 — Tests E2E manuels + checklist validation MVP

**Priorité** : P8 validation finale
**Agent responsable** : `auditeur-qualite` (read-only audit)
**Skill bootstrap** : `owasp-saas-supabase`, plugin `design:accessibility-review`
**Modèle Claude** : `opus-4-6` — Audit critique multi-axes haute conséquence
**Skills Cowork (Claude PC)** : design:accessibility-review, operations:compliance-tracking, operations:risk-assessment, operations:status-report
**Effort estimé** : 4-6h
**Dépend de** : T01 → T26 (tout terminé)

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

**Tâche T27** : audit complet MVP TUC avant déclaration \"opérationnel\".

**Mission** :
Délègue à `auditeur-qualite` (100% read-only) qui exécute :

1. **Sécurité** (skill `owasp-saas-supabase`) :
   - `mcp__get_advisors` security + performance — zero critical
   - Vérifier RLS sur 17 tables — closer ne voit que ses leads
   - Tokens chiffrés Vault confirmés (T01)
   - Rate limiting confirmé sur 4 endpoints (T02)
   - Aucun secret commit Git
2. **Tests E2E manuels** :
   - Création lead chatbot → scoring Claude → assignation auto closer → notification Slack
   - Drag & drop Kanban → UPDATE DB confirmé
   - OAuth Google + création RDV avec Meet → email reçu
   - OAuth Slack + notification reçue
   - Admin réassign batch → DB cohérente
   - RLS : closer A connecté ne voit pas lead de closer B
3. **Accessibilité** (plugin `design:accessibility-review`) :
   - Lighthouse a11y > 95 sur toutes pages
   - Navigation clavier fonctionnelle
   - Contraste validé
4. **Performance** :
   - LCP < 2s sur 4G (Algérie)
   - Bundle size : aucun chunk > 1MB
   - Latence Edge Functions p95 < 1s
5. **i18n** : FR/EN/Darija/AR (RTL) testés
6. **Compliance** :
   - Page /policies complète
   - Banner cookies fonctionnel
   - Opt-in RGPD tracé
   - Audit `gardien-valeurs` : zéro dark pattern détecté
7. **Mémoire & gouvernance** :
   - JOURNAL.md à jour avec toutes sessions
   - LEARNINGS.md riche
   - DECISIONS.md avec ADR pour chaque choix structurant
   - BLOCKERS.md : tous BLOCKERS marqués résolus

**Output** : EVAL-MVP-001 dans `.claude/memory/EVALS.md` avec score sur 100.

**Critères d''acceptation MVP opérationnel** :
- [ ] Score audit > 85/100
- [ ] Zero BLOCKER critique restant
- [ ] Tous tests E2E passent
- [ ] Lighthouse > 90 sur 4 axes (perf, a11y, best practices, SEO)
- [ ] Compliance RGPD OK
- [ ] Gardien-valeurs : zéro violation

**Format de sortie** : section `## RÉSULTAT` avec scorecard détaillée + recommandations.
```

---

## 🔍 Audit & Vérification (étape finale obligatoire)

> **Règle d'or TUC** (`.claude/rules/global.md`) : ne JAMAIS déclarer terminé sans (1) relire diff, (2) vérifier domaines voisins, (3) tester, (4) tracer dans JOURNAL.

### 1. Audit technique automatique
- [ ] **Relire diff Git complet** : `git diff` + `git diff --stat` — chercher PII, secrets, `console.log`, `any`, hardcoded strings
- [ ] **Invoquer `auditeur-qualite`** (read-only, sonnet-4-6) pour audit cross-domaines impactés
- [ ] **Vérifier `code-standards.md`** : aucun fichier > 300 lignes, pas de cycle d'imports, TS strict

### 2. Tests spécifiques à cette tâche
   - [ ] Cette tâche EST l'audit final. Méta-audit : EVAL-MVP-001 sauvegardé dans EVALS.md
   - [ ] Scorecard détaillée publiée + recommandations
   - [ ] Si score > 85/100 → MVP déclaré opérationnel + ADR-008 (MVP livré)
   - [ ] Si score < 85/100 → backlog complémentaire généré dans `taches-a-faire/`

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T27): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T27
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
