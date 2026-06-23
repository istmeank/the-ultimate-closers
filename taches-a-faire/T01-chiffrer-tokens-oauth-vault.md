# T01 — Chiffrer tokens OAuth via Vault + pgsodium (résout BLOCKER-001)

**Priorité** : P0 critique sécurité
**Agent responsable** : `backend-supabase`
**Skill bootstrap** : `secrets-vault-pgsodium` (déjà créé, 122 lignes)
**Modèle Claude** : `opus-4-6` — Haute conséquence sécurité, migration prod chiffrement
**Skills Cowork (Claude PC)** : operations:compliance-tracking, operations:risk-assessment
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

**Tâche T01** : résoudre BLOCKER-001 — chiffrement des tokens OAuth.

**Contexte** : les tables `closer_integrations` et `google_calendar_tokens` du projet Supabase `llxgyomevketvypusafl` stockent `access_token` et `refresh_token` en TEXT clair. C''est une vulnérabilité critique : compromission DB = vol d''identité des intégrations Google/Slack/HubSpot des closers.

**Mission** :
1. Active les extensions `vault` et `pgsodium` sur le projet Supabase (`mcp__list_extensions` puis migration).
2. Crée une migration `supabase/migrations/[TS]_encrypt_oauth_tokens.sql` qui :
   - Ajoute colonnes chiffrées via TCE pgsodium (AAD = closer_id)
   - Migre les données existantes (peu de données réelles, MVP)
   - Crée vue `decrypted_closer_integrations` dans schéma privé
   - Supprime colonnes en clair APRÈS validation
   - `REVOKE ALL` sur vue déchiffrée pour rôles `anon` et `authenticated`
3. Modifie Edge Functions consommatrices (`google-oauth-callback`, `hubspot-sync`, etc.) pour utiliser `service_role` + vue déchiffrée en just-in-time.
4. Stocke ANTHROPIC_API_KEY / HUBSPOT_API_KEY / GOOGLE_CLIENT_SECRET / SLACK_CLIENT_SECRET dans `vault.secrets` (statiques).

**Délègue à l''agent backend-supabase** qui charge en bootstrap le skill `secrets-vault-pgsodium`.

**Critères d''acceptation** :
- [ ] Extensions vault + pgsodium activées et confirmées via `mcp__list_extensions`
- [ ] Aucune colonne TEXT clair pour access_token/refresh_token en prod
- [ ] AAD (closer_id) systématique sur chaque token chiffré
- [ ] Vue `decrypted_*` invisible des rôles `anon` et `authenticated`
- [ ] Edge Functions adaptées avec test fonctionnel (un appel Google Calendar par closer test)
- [ ] `mcp__get_advisors` clean (no critical security warning)
- [ ] EVAL-003 ajouté dans EVALS.md
- [ ] BLOCKER-001 marqué résolu dans BLOCKERS.md (via archiviste)

**Format de sortie attendu** : section `## RÉSULTAT` avec migrations appliquées, Edge Functions modifiées, get_advisors result, EVAL.

**Confirmation Nacer obligatoire** avant chaque `mcp__apply_migration` (méthodologie-guard.md).
```

---

## 🔍 Audit & Vérification (étape finale obligatoire)

> **Règle d'or TUC** (`.claude/rules/global.md`) : ne JAMAIS déclarer terminé sans (1) relire diff, (2) vérifier domaines voisins, (3) tester, (4) tracer dans JOURNAL.

### 1. Audit technique automatique
- [ ] **Relire diff Git complet** : `git diff` + `git diff --stat` — chercher PII, secrets, `console.log`, `any`, hardcoded strings
- [ ] **Invoquer `auditeur-qualite`** (read-only, sonnet-4-6) pour audit cross-domaines impactés
- [ ] **Vérifier `code-standards.md`** : aucun fichier > 300 lignes, pas de cycle d'imports, TS strict

### 2. Tests spécifiques à cette tâche
   - [ ] `mcp__get_advisors` security + performance — **zéro critical**
   - [ ] Aucune colonne `access_token`/`refresh_token` en clair (vérification via `mcp__execute_sql information_schema.columns`)
   - [ ] Vue `decrypted_*` invisible des rôles `anon` et `authenticated`
   - [ ] Test fonctionnel : un appel Google Calendar par closer test (déchiffrement just-in-time OK)
   - [ ] EVAL-003 ajouté + BLOCKER-001 marqué résolu via archiviste

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T01): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T01
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
