# T08 — Auto-assignation closers (charge + Big Five + round-robin)

**Priorité** : P2 USP différenciant
**Agent responsable** : `matching-engine` (lead) + `backend-supabase` (impl)
**Skills bootstrap** : `workload-management-matching`, `big-five-personality` (à créer), `valeurs-coran-bienveillance`
**Modèle Claude** : `opus-4-6` — USP central + audit non-discrimination
**Skills Cowork (Claude PC)** : operations:risk-assessment
**Effort estimé** : 6-8h
**Dépend de** : T03, T07

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

**Tâche T08** : implémenter l''algorithme de matching prospect ↔ closer — USP central de TUC.

**Contexte** : actuellement assignation = round-robin sur charge. Vision TUC : matching personnalisé sur Big Five (prospect ET closer) → distance euclidienne 5D → score affinité × score dispo × score priorité.

**Mission** :
1. **Modélisation** : ajoute colonnes Big Five sur `profiles` (closers) et `leads` (prospects via analyse Claude) :
   - `openness`, `conscientiousness`, `extraversion`, `agreeableness`, `neuroticism` (FLOAT 0-1)
2. Crée RPC PL/pgSQL `match_prospect_to_closer(lead_id uuid)` retournant `{ closer_id, score_breakdown jsonb }` :
   - Calcul distance euclidienne Big Five (skill `big-five-personality`)
   - Score composite `= 0.5 × affinity + 0.3 × availability + 0.2 × priority`
   - Tie-breaking : Hungarian algorithm si batch (skill `workload-management-matching`)
   - **JAMAIS** filtre sur origine/religion/genre (véto pilier #5)
3. Modifie trigger T04 pour appeler cette RPC au lieu de l''algo simple.
4. Edge Function `analyze-personality` (séparée) : appel Claude Sonnet pour extraire Big Five depuis réponses chatbot du lead + entretien initial.
5. Audit non-discrimination : query mensuelle `mcp__execute_sql` qui mesure distribution genre/origine par closer.

**Délègue à matching-engine** (algorithme + EVAL) + `backend-supabase` (RPC + Edge Function) + `gardien-valeurs` (audit non-discrimination trimestriel).

**Critères d''acceptation** :
- [ ] Migration colonnes Big Five appliquée
- [ ] RPC `match_prospect_to_closer` déployée + testée
- [ ] EVAL-007 : lift > 30% vs assignation aléatoire sur 50 cas synthétiques
- [ ] Latence RPC p95 < 500ms
- [ ] score_breakdown JSONB tracé sur 100% des assignations
- [ ] Audit non-discrimination passé (distribution genre/origine équilibrée)
- [ ] ADR-006 créé : choix Hungarian vs greedy, justification

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
   - [ ] **Audit non-discrimination `gardien-valeurs`** (distribution genre/origine équilibrée)
   - [ ] EVAL-007 : lift > 30 % vs assignation aléatoire (50 cas synthétiques)
   - [ ] Latence RPC p95 < 500ms (mesure `mcp__execute_sql EXPLAIN ANALYZE`)
   - [ ] `score_breakdown` JSONB tracé sur 100 % des assignations
   - [ ] ADR-006 créé (Hungarian vs greedy)

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T08): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T08
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
