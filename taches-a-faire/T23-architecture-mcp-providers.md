# T23 — Architecture MCP providers (futur, différé V3)

**Priorité** : ⏸️ deferred V3
**Agent responsable** : `integrations`
**Skill bootstrap** : `hubspot-via-mcp`
**Modèle Claude** : `sonnet-4-6` — Différé V3, modèle indicatif
**Skills Cowork (Claude PC)** : —
**Effort estimé** : 6-8h
**Statut** : différé après MVP opérationnel

---

## Note

Cette tâche est **différée**. Le pattern MCP custom dans `src/lib/mcp/` (interface `MCPProvider` + Registry + Hook `useMCP`) décrit dans le plan Lovable n''est **pas indispensable pour MVP**.

Notre stratégie actuelle (cf ADR-005 à venir) : utiliser les **MCP natifs Claude** côté agents (HubSpot MCP, Vercel MCP, Supabase MCP), pas un système maison côté app.

À reconsidérer en V3 si besoin réel d''abstraction côté code applicatif (multi-tenant SaaS B2B vendu à des agences closer qui ont leurs propres CRM).

**Action immédiate** : aucune. Garder pour roadmap H3 (16+ semaines).

---

## 🔍 Audit & Vérification (étape finale obligatoire)

> **Règle d'or TUC** (`.claude/rules/global.md`) : ne JAMAIS déclarer terminé sans (1) relire diff, (2) vérifier domaines voisins, (3) tester, (4) tracer dans JOURNAL.

### 1. Audit technique automatique
- [ ] **Relire diff Git complet** : `git diff` + `git diff --stat` — chercher PII, secrets, `console.log`, `any`, hardcoded strings
- [ ] **Invoquer `auditeur-qualite`** (read-only, sonnet-4-6) pour audit cross-domaines impactés
- [ ] **Vérifier `code-standards.md`** : aucun fichier > 300 lignes, pas de cycle d'imports, TS strict

### 2. Tests spécifiques à cette tâche
   - [ ] Tâche différée — pas de vérification immédiate. À reconsidérer V3 (16+ semaines).

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T23): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T23
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
