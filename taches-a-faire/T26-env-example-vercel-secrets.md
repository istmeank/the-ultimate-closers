# T26 — Variables d'environnement (.env.example + Vercel secrets)

**Priorité** : P8 DevOps
**Agent responsable** : `devops-vercel`
**Skill bootstrap** : `vercel-deployment-strategies` (à créer), `owasp-saas-supabase`
**Modèle Claude** : `haiku-4-5` — Config secrets simple
**Skills Cowork (Claude PC)** : operations:runbook
**Effort estimé** : 1-2h

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

**Tâche T26** : créer `.env.example` complet et synchroniser secrets Vercel prod.

**Mission** :
1. Crée `/.env.example` à la racine du repo avec TOUTES les variables nécessaires :
   - Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY)
   - Anthropic (ANTHROPIC_API_KEY)
   - Turnstile (VITE_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY)
   - Upstash (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)
   - Google OAuth (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)
   - Slack OAuth (SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_REDIRECT_URI)
   - HubSpot (HUBSPOT_API_KEY) — mais on utilise MCP natif (cf T25)
   - App (APP_URL, NODE_ENV)
2. Aucune vraie valeur dans le fichier — uniquement `placeholder` ou `xxx`.
3. Mets à jour `.gitignore` pour confirmer que `.env` est ignoré (déjà fait normalement).
4. Synchronise les variables sur Vercel via `mcp__get_project` puis dashboard (jamais log les valeurs).
5. Vérifie qu''aucun secret n''est commit dans Git :
   - `git log --all --oneline | head -20`
   - `grep -r \"sk-ant-\" .` (Anthropic key)
   - `grep -r \"GOCSPX-\" .` (Google client secret)

**Délègue à devops-vercel**.

**Critères d''acceptation** :
- [ ] `.env.example` complet et committé
- [ ] `.env` toujours ignoré
- [ ] Vercel env vars validées (count = count .env.example)
- [ ] Aucun secret historique dans Git
- [ ] LEARNING-X ajouté si trouvé

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
   - [ ] **`.env` toujours dans `.gitignore`** (vérif `git check-ignore .env`)
   - [ ] **Aucun secret historique dans Git** : `git log --all -p | grep -E 'sk-ant-|GOCSPX-|whsec_'` → zero match
   - [ ] `.env.example` count = Vercel env vars count
   - [ ] LEARNING ajouté si secret historique trouvé

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T26): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T26
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
