# T15 — Edge Function create-google-event (avec Meet link)

**Priorité** : P4 intégrations
**Agent responsable** : `integrations` + `backend-supabase`
**Skills bootstrap** : `google-slack-apis`, `supabase-edge-functions-deno`
**Modèle Claude** : `sonnet-4-6` — Edge Function + Google API standard
**Skills Cowork (Claude PC)** : —
**Effort estimé** : 3-4h
**Dépend de** : T13

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

**Tâche T15** : créer Edge Function qui crée un event Google Calendar avec Meet link automatique.

**Mission** :
`supabase/functions/create-google-event/index.ts` :
1. Reçoit `{ leadId, closerId, startTime, duration }`
2. Récupère lead + tokens Google déchiffrés (skill `secrets-vault-pgsodium`)
3. POST `https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events?conferenceDataVersion=1` avec :
   - Summary \"Appel avec {lead.full_name}\"
   - Description avec lead.interest
   - Start/end dateTime ISO + timezone
   - Attendees: `[{ email: lead.email }]`
   - ConferenceData: createRequest avec hangoutsMeet (skill `google-slack-apis`)
4. Récupère `event.id` + `conferenceData.entryPoints[0].uri` (meet link)
5. INSERT `appointments` avec `gcal_event_id` + `auto_assigned` flag
6. Trigger T05 logguera automatiquement dans `interactions`
7. Envoie notification Slack au closer via T14 (`slack-notify`)

**Délègue à integrations** + coordination `backend-supabase`.

**Critères d''acceptation** :
- [ ] Event créé dans Google Calendar (vérifier visuellement)
- [ ] Meet link généré + cliquable
- [ ] Attendee email reçoit invitation
- [ ] Appointment inséré en DB avec `gcal_event_id`
- [ ] Notification Slack reçue par closer
- [ ] Refresh token automatique si expiré

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
   - [ ] Event créé visible dans Google Calendar UI
   - [ ] Meet link généré + testé (cliquable, ouvre meet.google.com)
   - [ ] Attendee reçoit email Google
   - [ ] Appointment inséré DB + trigger T05 a logué interaction
   - [ ] Notification Slack reçue par closer (T14)
   - [ ] Refresh token testé si expiré

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T15): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T15
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
