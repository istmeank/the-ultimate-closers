# T25 — Stubs HubSpot/Stripe + MCP HubSpot natif

**Priorité** : P7 polish
**Agent responsable** : `integrations`
**Skills bootstrap** : `hubspot-via-mcp`, `webhook-security-idempotency`
**Modèle Claude** : `sonnet-4-6` — Intégration MCP HubSpot + stub Stripe
**Skills Cowork (Claude PC)** : operations:vendor-review, marketing:brand-review
**Effort estimé** : 3-4h

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

**Tâche T25** : implémenter sync HubSpot via MCP natif + stub Stripe (en attendant Chargily Pay DZ).

**Mission** :
1. **HubSpot via MCP natif** (skill `hubspot-via-mcp`) :
   - Edge Function `supabase/functions/hubspot-sync` : reçoit `{ leadId }` → utilise MCP HubSpot (`mcp__manage_crm_objects`) pour create/update contact + deal
   - Mapping propriétés HubSpot ↔ TUC (lead → contact, deal → deal)
   - Idempotence via table `external_sync_log` (skill `webhook-security-idempotency`)
   - Last-write-wins sur conflit
2. **Stripe stub** (Chargily Pay sera la vraie solution DZ-compatible) :
   - `supabase/functions/stripe-checkout/index.ts` retourne placeholder warning \"Paiements en cours d''intégration via Chargily Pay\"
   - Loguer dans console + table `payment_attempts` pour audit
3. **Boutons UI** dans `src/pages/LeadDetail.tsx` (T12) :
   - \"Sync HubSpot\" → toast info \"Sync en cours\" + résultat
   - \"Créer paiement\" → toast warning \"Bientôt disponible via Chargily Pay\"

**Note Algérie** : Stripe n''est PAS disponible en Algérie. Stratégie officielle = Chargily Pay (cf orchestrateur.md, stack). Document ADR-007 \"Choix Chargily Pay vs Stripe\".

**Délègue à integrations**.

**Critères d''acceptation** :
- [ ] Sync HubSpot fonctionnel (test avec compte sandbox)
- [ ] Idempotence vérifiée (sync 2× → pas de duplicate)
- [ ] Stub Stripe avec message clair
- [ ] ADR-007 créé

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
   - [ ] Test sync HubSpot avec compte sandbox (création + update + idempotence)
   - [ ] Sync 2× → pas de duplicate (vérif `external_sync_log`)
   - [ ] Stub Stripe avec message clair "Bientôt via Chargily Pay"
   - [ ] ADR-007 créé (Chargily Pay > Stripe pour Algérie)

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T25): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T25
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
