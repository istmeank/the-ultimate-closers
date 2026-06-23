# T28 — Refactor : poser la couche d'abstraction services (PRIORITAIRE absolu, AVANT T01)

**Priorité** : 🔴 P-1 (avant P0) — pose les fondations pour toutes les tâches T01-T27 suivantes
**Agent responsable** : `frontend-react` (lead) + `backend-supabase` (audit cohérence)
**Skills bootstrap** : `react-shadcn-design-system` (architecture src/), `code-standards` (règle abstraction)
**Modèle Claude** : `opus-4-6` — Décision architecturale haute conséquence pour les 27 tâches suivantes
**Skills Cowork (Claude PC)** : design:design-system, frontend-design, operations:process-doc
**Effort estimé** : 4-8h selon état actuel du code existant
**Dépend de** : —
**Bloque** : T01, T06, T07, T09-T17, T18-T20 (toutes les tâches qui touchent à Supabase depuis composants)

---

## Pourquoi cette tâche est P-1 (avant tout P0)

Sans cette refacto :
- T01 (chiffrement Vault) crée un service couplé Supabase → migration future = code jetable
- T06 (useAuth multi-rôles) couple composants à `supabase.auth` → refonte UI massive lors migration
- T07-T20 toutes les tâches qui touchent à Supabase depuis React = couplage direct = dette technique massive

Avec cette refacto faite AVANT :
- Toutes les tâches T01-T27 produisent du code qui survit à la migration backend
- Économie projetée : **8-13 mois d'effort dev** (cf. `docs/architecture-evolution.md` section 3)

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
6. `D:\GitHub\the-ultimate-closers\.claude\rules\code-standards.md` ← contient la nouvelle règle d'abstraction stricte
7. `D:\GitHub\the-ultimate-closers\docs\architecture-evolution.md` ← stratégie 3 phases + ADR-025

**Règles non-négociables** :
- Règle d'or : ne JAMAIS déclarer terminé sans relire diff, vérifier domaines voisins, tester, tracer JOURNAL.
- Append-only sur `.claude/memory/`.
- Pas de dark pattern, pas d'envoi sans opt-in RGPD, pas de secret en clair, pas de matching discriminatoire.
- Français pour doc/mémoire, anglais pour code.

**Tâche T28** : poser la couche d'abstraction services entre les composants React et Supabase, pour préparer la migration future vers backend custom NestJS-like (cf. ADR-025).

**Contexte** : aujourd'hui le code TUC contient probablement des imports directs `supabase` depuis composants/pages. Avant d'exécuter T01-T27 du backlog, on pose les rails pour que chaque tâche suivante produise du code abstrait migrable.

**Mission séquentielle** :

### Étape 1 — Audit du code existant
1. Liste tous les imports `from '@/integrations/supabase'` depuis `src/components/`, `src/pages/`, `src/hooks/`
2. Liste tous les appels `supabase.from()`, `supabase.auth.*`, `supabase.functions.invoke()`, `supabase.storage.*` orphelins
3. Produis un rapport `audit-couplage-supabase.md` (peut être temporaire, à supprimer après refacto)

### Étape 2 — Créer la structure src/lib/services/ et src/lib/adapters/supabase/
Créer (vides ou stubs) :
- `src/lib/services/auth.service.ts` (interface : signIn, signUp, signOut, getUser, getRole, signOutAll)
- `src/lib/services/leads.service.ts` (interface : list, getById, create, update, delete, listForCloser)
- `src/lib/services/matching.service.ts` (interface : scoreLead, matchClosersToProspect, getMatchExplanation)
- `src/lib/services/messaging.service.ts` (interface : sendMessage, listConversation, markRead, byChannel)
- `src/lib/services/meet.service.ts` (interface : bookMeet, getCalendar, requestTranscription, getFeedback)
- `src/lib/services/storage.service.ts` (interface : upload, download, getSignedUrl, delete)
- `src/lib/services/realtime.service.ts` (interface : subscribeToTable, broadcastEvent, presence)
- `src/lib/services/integrations.service.ts` (interface : startOAuth, exchangeCallback, refreshToken, disconnect, callApi)
- `src/lib/services/secrets.service.ts` (interface : getDecryptedToken, storeToken, rotateToken)
- `src/lib/services/ai.service.ts` (interface : callClaude, generateScript, classifyLead, askANK)

Chaque service expose une **interface TypeScript stricte**, puis importe son adapter Supabase comme implémentation.

### Étape 3 — Implémenter les adapters Supabase
Créer `src/lib/adapters/supabase/*.supabase.ts` pour chaque service, en migrant le code existant vers ces adapters. Les imports `supabase` se concentrent ICI exclusivement.

### Étape 4 — Refactorer les composants/pages existants
Pour chaque fichier identifié dans Étape 1 :
- Remplacer `import { supabase }` par `import { xxxService } from '@/lib/services/xxx.service'`
- Remplacer les appels directs par des appels au service
- Vérifier que les types sont préservés (zero TS errors)

### Étape 5 — Ajouter script CI de détection
Créer `scripts/check-supabase-abstraction.sh` qui détecte les imports orphelins. Exécuté en pre-commit hook + CI.

### Étape 6 — Tests
- 1 test unitaire par service qui mock l'adapter (preuve d'abstraction)
- Tous les tests existants passent encore (zero régression)

### Étape 7 — Documentation
- Update `docs/REFERENCE.md` mentionnant la couche services
- Update `taches-a-faire/README.md` : tâches T01-T27 doivent désormais respecter la règle d'abstraction

**Délègue à** : `frontend-react` pour la majorité du travail (couche src/), avec audit final par `backend-supabase` pour les patterns Edge Functions.

**Critères d'acceptation** :
- [ ] Audit initial complet documenté
- [ ] Structure `src/lib/services/` + `src/lib/adapters/supabase/` créée
- [ ] 10 services créés avec interfaces TypeScript
- [ ] 10 adapters Supabase implémentés
- [ ] 0 import direct `supabase` depuis `src/components/`, `src/pages/`, `src/hooks/` (vérifié par grep)
- [ ] Script CI `check-supabase-abstraction.sh` créé et passe vert
- [ ] 10 tests unitaires services avec mock adapter passent
- [ ] Tous les tests existants passent encore
- [ ] TypeScript zero error (`tsc --noEmit` clean)
- [ ] Build prod réussi (`npm run build`)
- [ ] Site theultimateclosers.com toujours fonctionnel après déploiement (smoke test)
- [ ] LEARNING ajouté dans LEARNINGS.md sur les pièges rencontrés
- [ ] ADR-025 marqué accepté dans DECISIONS.md (via archiviste)

**Format de sortie** : section `## RÉSULTAT — T28` avec : services créés, adapters migrés, composants refactorés, tests ajoutés, métriques (couverture abstraction 100 %), commit hash.
```

---

## 🔍 Audit & Vérification (étape finale obligatoire)

> **Règle d'or TUC** (`.claude/rules/global.md`) : ne JAMAIS déclarer terminé sans (1) relire diff, (2) vérifier domaines voisins, (3) tester, (4) tracer dans JOURNAL.

### 1. Audit technique automatique
- [ ] **Relire diff Git complet** : `git diff` + `git diff --stat` — chercher tout import supabase oublié dans composants/pages
- [ ] **Invoquer `auditeur-qualite`** (read-only, sonnet-4-6) pour audit cross-domaines impactés
- [ ] **Vérifier `code-standards.md`** : règle d'abstraction stricte (section ADR-025) respectée à 100 %

### 2. Tests spécifiques à cette tâche
- [ ] Script `grep -rn "from '@/integrations/supabase" src/components/ src/pages/ src/hooks/ 2>/dev/null` retourne **vide**
- [ ] 10 services exposent des interfaces TypeScript documentées
- [ ] 10 adapters Supabase implémentent strictement leurs interfaces
- [ ] 10 tests unitaires services passent avec mocks (preuve d'abstraction)
- [ ] `tsc --noEmit` : zero TypeScript error
- [ ] `npm run build` : build prod réussi
- [ ] Site prod theultimateclosers.com fonctionne après déploiement (smoke test login + dashboard)
- [ ] Performance non dégradée (Lighthouse score >= baseline)

### 3. Filtre éthique
- [ ] N/A pour cette tâche (refactor technique, pas de microcopy ni IA)

### 4. Capitalisation mémoire (via `archiviste-memoire` exclusivement)
- [ ] **JOURNAL.md** : session datée + rituel 3 questions (Décidé / Appris / Dérivé)
- [ ] **LEARNINGS.md** : pièges rencontrés (composants oubliés, imports indirects, types complexes)
- [ ] **DECISIONS.md** : ADR-025 marqué accepté (était proposé en session 27)
- [ ] **BLOCKERS.md** : si découverte d'un cas non-abstractible → nouveau BLOCKER

### 5. Livraison
- [ ] **Update `taches-a-faire/README.md`** : statut T28 = ✅ completed + commit hash
- [ ] **Commit Git conventionnel** : `refactor(T28): introduce service abstraction layer for backend portability`
- [ ] **Push** uniquement après validation Nacer (jamais `--force`)

### 6. Validation Nacer (sortie)
Mini-rapport synthèse :
```
## RÉSULTAT — T28
- ✅ Implémenté : <10 services + 10 adapters + script CI + tests>
- ✅ Tests passés : <build prod + tsc zero error + grep abstraction clean + smoke test prod>
- ⚠️ Points d'attention : <cas particuliers Edge Functions ? composants legacy ?>
- 📊 Métriques : <% couverture abstraction = 100, lignes refactorées, tests ajoutés>
- 🔗 Suivants débloqués : T01 à T27 peuvent maintenant s'exécuter en respectant l'abstraction
- 💾 Commit : <hash>
```
