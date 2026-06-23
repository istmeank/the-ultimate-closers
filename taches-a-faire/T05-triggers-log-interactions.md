# T05 — Triggers log_appointment + log_deal_interaction

**Priorité** : P1 fondations
**Agent responsable** : `database-postgres`
**Skill bootstrap** : `postgresql-supabase`
**Modèle Claude** : `haiku-4-5` — Triggers répétitifs simples
**Skills Cowork (Claude PC)** : —
**Effort estimé** : 1-2h
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

**Tâche T05** : créer 2 triggers DB pour logguer automatiquement appointments et deals dans la timeline interactions.

**Mission** :
Migration `[TS]_triggers_log_interactions.sql` avec :
1. Fonction `log_appointment_as_interaction()` AFTER INSERT sur `appointments` → insère dans `interactions` (type='meet', content='Rendez-vous programmé le {date} via {channel}').
2. Fonction `log_deal_as_interaction()` AFTER INSERT sur `deals` → insère dans `interactions` (type='note', content='Deal créé: {offer_name} - Montant: {amount}€ - Étape: {stage}').

Pattern : SECURITY DEFINER + search_path pg_temp. Récupérer `owner_id` du lead pour `by_user_id`.

Code de référence dans `PLAN-IMPLEMENTATION-LOVABLE.md` Phases 1.2 et 1.3 (corriger typos `REPL敏感`).

**Délègue à database-postgres**.

**Critères d''acceptation** :
- [ ] 2 triggers appliqués
- [ ] Test 1 : créer appointment → interaction `meet` apparaît
- [ ] Test 2 : créer deal → interaction `note` apparaît
- [ ] `mcp__get_advisors` clean

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
   - [ ] `mcp__get_advisors` clean
   - [ ] Test 1 : créer appointment → interaction `meet` apparaît automatiquement
   - [ ] Test 2 : créer deal → interaction `note` apparaît
   - [ ] `by_user_id` correctement renseigné (owner_id du lead)

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T05): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T05
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
