# T13 — OAuth Google Calendar (callback + flow PKCE)

**Priorité** : P4 intégrations
**Agent responsable** : `integrations`
**Skills bootstrap** : `oauth-2-pkce-refresh`, `google-slack-apis`, `secrets-vault-pgsodium`
**Modèle Claude** : `sonnet-4-6` — Pattern OAuth standard
**Skills Cowork (Claude PC)** : operations:compliance-tracking
**Effort estimé** : 4-5h
**Dépend de** : T01 (Vault)

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

**Tâche T13** : implémenter le flow OAuth 2.0 Google Calendar avec PKCE + refresh token rotation, tokens chiffrés via Vault.

**Mission** :
1. Page `src/pages/CalendarSettings.tsx` : bouton \"Connecter Google Calendar\" → redirige vers Google OAuth avec state CSRF + PKCE code_verifier en localStorage.
2. Edge Function `supabase/functions/google-oauth-callback/index.ts` (skill `oauth-2-pkce-refresh`) :
   - Reçoit `code` + `state`
   - Vérifie state CSRF
   - Échange code+verifier contre access_token + refresh_token via `https://oauth2.googleapis.com/token`
   - Récupère userinfo + calendar list
   - **Chiffre tokens via Vault** (skill `secrets-vault-pgsodium`, AAD = closer_id)
   - UPSERT `closer_integrations` avec metadata (email, calendars, calendar_id default)
   - Redirect dashboard avec `?connected=true`
3. Scopes minimum : `calendar`, `calendar.events`, `userinfo.email`.
4. Refresh token rotation : Edge Function `refresh-google-token` qui détecte `expires_at` proche et renouvelle.
5. Secrets dans Vault : GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI.

**Délègue à integrations**.

**Critères d''acceptation** :
- [ ] OAuth flow fonctionnel end-to-end (test réel avec compte Google perso)
- [ ] state CSRF vérifié
- [ ] PKCE code_verifier respecté
- [ ] Tokens chiffrés (skill `secrets-vault-pgsodium`)
- [ ] Refresh token rotation testée
- [ ] Scopes minimum respectés
- [ ] EVAL-008 ajouté

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
   - [ ] OAuth flow end-to-end testé (compte Google perso)
   - [ ] state CSRF vérifié + PKCE code_verifier testé
   - [ ] Tokens chiffrés via Vault (vérif via T01)
   - [ ] Refresh token rotation testée (expirer manuellement le token)
   - [ ] Scopes minimum (calendar + calendar.events + userinfo.email) — pas plus
   - [ ] EVAL-008 ajouté

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T13): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T13
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
