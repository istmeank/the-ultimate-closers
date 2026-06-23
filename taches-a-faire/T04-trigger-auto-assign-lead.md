# T04 — Trigger auto_assign_closer_to_lead (score >= 75)

**Priorité** : P1 fondations
**Agent responsable** : `database-postgres`
**Skill bootstrap** : `postgresql-supabase`
**Modèle Claude** : `sonnet-4-6` — PL/pgSQL standard avec CTE
**Skills Cowork (Claude PC)** : —
**Effort estimé** : 2h
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

**Tâche T04** : créer trigger DB qui auto-assigne un closer dès qu''un lead atteint score >= 75.

**Contexte** : actuellement l''auto-assignation se fait uniquement dans la edge function `score-lead`. Si lead créé/updated directement en DB, pas d''assignation. Solution : trigger BEFORE INSERT/UPDATE qui prend en compte (1) charge actuelle du closer (RDV 7j + leads actifs), (2) max_concurrent_leads, (3) round-robin sur last_assigned_at.

**Mission** :
Crée migration `[TS]_trigger_auto_assign_lead.sql` avec :
- Fonction `auto_assign_closer_to_lead()` PL/pgSQL SECURITY DEFINER (search_path = pg_temp obligatoire)
- Trigger BEFORE INSERT sur `leads` (WHEN score >= 75 AND owner_id IS NULL)
- Trigger BEFORE UPDATE OF score sur `leads` (WHEN passage en >= 75)
- Logique : CTE avec workload calculé + filtre max_concurrent_leads + tri par charge ASC puis last_assigned ASC
- Fallback : si aucun closer disponible, prendre le moins chargé quand même
- UPSERT `closer_assignments` après assignation

Code de référence dans `PLAN-IMPLEMENTATION-LOVABLE.md` Phase 1.1 (à corriger des typos type `a統一`, `мानуш`, `мбою`).

**Délègue à database-postgres**.

**Critères d''acceptation** :
- [ ] Migration appliquée
- [ ] Test 1 : insert lead score=80 sans owner → owner_id assigné automatiquement
- [ ] Test 2 : update lead de score 60 → 80 → assignation déclenchée
- [ ] Test 3 : si 3 closers actifs, 10 leads créés → distribution raisonnablement équitable (round-robin OK)
- [ ] Test 4 : closer avec workload = max_concurrent_leads est exclu
- [ ] `mcp__get_advisors` clean (no warning SECURITY DEFINER)
- [ ] EVAL-005 ajouté

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
   - [ ] `mcp__get_advisors` clean (no warning SECURITY DEFINER)
   - [ ] Test 1 : insert lead score=80 → owner_id assigné
   - [ ] Test 2 : update score 60→80 → assignation déclenchée
   - [ ] Test 3 : 10 leads → distribution équitable round-robin
   - [ ] Test 4 : closer saturé exclu
   - [ ] EVAL-005 ajouté

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T04): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T04
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
