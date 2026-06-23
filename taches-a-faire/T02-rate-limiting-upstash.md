# T02 — Rate limiting Upstash sur 4 endpoints (résout BLOCKER H8/H9)

**Priorité** : P0 critique coûts IA + sécurité
**Agent responsable** : `backend-supabase`
**Skill bootstrap** : `upstash-rate-limiting` (déjà créé, 148 lignes)
**Modèle Claude** : `sonnet-4-6` — Pattern multi-endpoint connu, qualité/coût optimal
**Skills Cowork (Claude PC)** : operations:runbook, operations:risk-assessment
**Effort estimé** : 3-4h

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

**Tâche T02** : résoudre BLOCKERS H8 et H9 — protection des endpoints publics par rate limiting Upstash + Turnstile.

**Contexte** : les tables `call_bookings` et `site_analytics` ont des policies RLS `WITH CHECK (true)` pour permettre les insertions publiques (chatbot, analytics). Risque : bots peuvent saturer la DB et faire exploser les coûts IA (BLOCKER H8/H9).

**Mission** :
1. Crée un compte Upstash Redis (free tier 10k cmd/jour) et stocke URL + TOKEN dans Vault (`secrets-vault-pgsodium`).
2. Crée 4 Edge Functions wrapper avec rate limiting Sliding Window (skill `upstash-rate-limiting`) :
   - `call_bookings` : 3 req/min par IP + 1 req/min par email (double cle)
   - `site_analytics` : 100 req/min IP + 1000 req/h global
   - `signup` : 5 req/h IP
   - `password_reset` : 3 req/h email
3. Hiérarchie obligatoire : (1) Turnstile vérifié AVANT Upstash (économie quota), (2) Upstash vérifié AVANT DB.
4. Réponses HTTP 429 avec header `Retry-After` en delta-seconds.
5. Microcopy d''erreur professionnelle non-révélatrice (cf skill checklist).
6. Resserre les RLS policies : `call_bookings` et `site_analytics` ne sont plus accessibles directement depuis le client — seulement via les Edge Functions wrapper.

**Délègue à backend-supabase**.

**Critères d''acceptation** :
- [ ] 4 Edge Functions déployées + testées avec curl spam (vérif HTTP 429)
- [ ] Turnstile validé EN PREMIER dans chaque function
- [ ] Header Retry-After présent
- [ ] Aucun nom \"Upstash\" ou \"Redis\" exposé dans les messages d''erreur
- [ ] RLS `WITH CHECK (true)` remplacé par interdiction directe (forcer passage par Edge Function)
- [ ] `mcp__get_advisors` clean
- [ ] BLOCKERS H8 + H9 marqués résolus dans BLOCKERS.md (via archiviste)
- [ ] EVAL-004 ajouté dans EVALS.md

**Format de sortie** : section `## RÉSULTAT` avec Edge Functions déployées + tests curl + advisors.
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
   - [ ] Test curl spam 10 req/min sur `call_bookings` → HTTP 429 dès la 4ème + header `Retry-After`
   - [ ] Turnstile vérifié AVANT Upstash (économie quota)
   - [ ] Aucun nom "Upstash"/"Redis" dans messages d'erreur
   - [ ] BLOCKERS H8 + H9 marqués résolus + EVAL-004

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T02): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T02
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
