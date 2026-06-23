# T14 — OAuth Slack (callback + flow PKCE)

**Priorité** : P4 intégrations
**Agent responsable** : `integrations`
**Skills bootstrap** : `oauth-2-pkce-refresh`, `google-slack-apis`, `secrets-vault-pgsodium`
**Modèle Claude** : `sonnet-4-6` — Pattern OAuth standard
**Skills Cowork (Claude PC)** : operations:compliance-tracking
**Effort estimé** : 3-4h
**Dépend de** : T01

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

**Tâche T14** : implémenter le flow OAuth 2.0 Slack avec sélection workspace + channels.

**Mission** :
1. Page `src/pages/SlackSettings.tsx` : bouton \"Connecter Slack\" → redirige vers Slack OAuth v2.
2. Edge Function `supabase/functions/slack-oauth-callback/index.ts` :
   - Reçoit `code` + `state`
   - Échange via `https://slack.com/api/oauth.v2.access`
   - Fetch `team.info` + `conversations.list` (channels)
   - **Chiffre tokens via Vault** (AAD = closer_id)
   - UPSERT `closer_integrations` avec metadata (team_id, team_name, channels, channel_default, notify_new_lead, notify_appointment, notify_deal_won)
3. Edge Function `slack-notify` : reçoit `{ closerId, message, channel }` → POST `chat.postMessage` Slack API avec token déchiffré just-in-time.
4. Block Kit pour messages structurés (skill `google-slack-apis`).
5. Signing secret pour vérification webhooks Slack (skill `webhook-security-idempotency`).

**Délègue à integrations**.

**Critères d''acceptation** :
- [ ] OAuth flow Slack fonctionnel
- [ ] Sélection channel par défaut OK
- [ ] Notification test envoyée avec succès
- [ ] Block Kit utilisé pour formatting
- [ ] Tokens chiffrés via Vault
- [ ] Signing secret vérifié sur webhooks entrants

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
   - [ ] OAuth flow Slack testé end-to-end
   - [ ] Block Kit utilisé pour formatting (vérif visuel Slack)
   - [ ] Signing secret vérifié sur webhooks entrants
   - [ ] Tokens chiffrés via Vault
   - [ ] Sélection channel par défaut fonctionnelle

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T14): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T14
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
