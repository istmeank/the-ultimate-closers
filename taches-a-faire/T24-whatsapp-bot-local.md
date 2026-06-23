# T24 — WhatsApp Bot local Node.js whatsapp-web.js (différé V3)

**Priorité** : ⏸️ deferred V3
**Agent responsable** : `integrations`
**Skills bootstrap** : `whatsapp-business-cloud-api`, `valeurs-coran-bienveillance`
**Modèle Claude** : `sonnet-4-6` — Différé V3, modèle indicatif
**Skills Cowork (Claude PC)** : operations:compliance-tracking
**Effort estimé** : 8-10h
**Statut** : différé

---

## Note

Cette tâche est **différée** pour deux raisons :

1. **Stratégie officielle TUC = WhatsApp Business Cloud API** (skill `whatsapp-business-cloud-api` officiel Meta), pas `whatsapp-web.js` (non-officiel, risque de ban Meta).
2. **Compliance Meta** : tout envoi sans opt-in tracé = ban du jour au lendemain. Le bot local sans pipeline opt-in propre est dangereux.

**Stratégie révisée** :
- V2 (après MVP) : WhatsApp Business Cloud API officielle + templates approuvés + opt-in tracé en DB (`whatsapp_optins` table)
- Compliance check par `gardien-valeurs` AVANT 1er envoi réel
- Bouton opt-out 1 clic dans chaque message

**Action immédiate** : aucune. Ouvrir nouveau ticket T24-bis quand prêt pour Business API officielle.

---

## 🔍 Audit & Vérification (étape finale obligatoire)

> **Règle d'or TUC** (`.claude/rules/global.md`) : ne JAMAIS déclarer terminé sans (1) relire diff, (2) vérifier domaines voisins, (3) tester, (4) tracer dans JOURNAL.

### 1. Audit technique automatique
- [ ] **Relire diff Git complet** : `git diff` + `git diff --stat` — chercher PII, secrets, `console.log`, `any`, hardcoded strings
- [ ] **Invoquer `auditeur-qualite`** (read-only, sonnet-4-6) pour audit cross-domaines impactés
- [ ] **Vérifier `code-standards.md`** : aucun fichier > 300 lignes, pas de cycle d'imports, TS strict

### 2. Tests spécifiques à cette tâche
   - [ ] Tâche différée — pas de vérification immédiate. Stratégie révisée vers WhatsApp Business Cloud API officielle.

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T24): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T24
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
