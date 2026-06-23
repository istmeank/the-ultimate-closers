# T07 — Edge Function score-lead avec Claude (remplace Lovable Gemini)

**Priorité** : P2 cœur métier
**Agent responsable** : `backend-supabase` + `ia-orchestration` (coordination)
**Skills bootstrap** : `supabase-edge-functions-deno`, `anthropic-prompt-engineering` (à créer), `valeurs-coran-bienveillance`
**Modèle Claude** : `opus-4-6` — Prompt engineering critique + filtre éthique
**Skills Cowork (Claude PC)** : brand-voice:enforce-voice, ai-seo
**Effort estimé** : 4-6h
**Dépend de** : T01 (clé Anthropic dans Vault)

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

**Tâche T07** : créer/refactorer l''Edge Function `score-lead` pour utiliser Claude (Haiku 4.5 par défaut) au lieu de Lovable Gemini.

**Contexte** : actuellement le scoring est hybride (manuel + appel Lovable Gemini). On veut basculer vers Anthropic Claude (notre stack officielle), avec choix de modèle selon contexte : Haiku pour classification simple/extraction, Sonnet pour analyse riche, Opus jamais en scoring (trop cher).

**Mission** :
1. Crée `supabase/functions/score-lead/index.ts` avec pattern canonique skill `supabase-edge-functions-deno` (global scope client init, AbortSignal.timeout 15s, exponential backoff, CORS, JSON structured logs sans PII).
2. Récupère ANTHROPIC_API_KEY depuis Vault (skill `secrets-vault-pgsodium`).
3. Construit prompt structuré XML tags (skill `anthropic-prompt-engineering`) :
   - System prompt cachable (90% économie) : doctrine éthique + format JSON strict
   - User prompt : données lead structurées (objective, timeline, budget, channels, source)
4. Modèle par défaut : `claude-haiku-4-5-20251001` (10x moins cher). Fallback Sonnet 4.6 si erreur structuration.
5. Logique scoring composite (skill `anthropic-prompt-engineering`) :
   - Intent (IA, 20 pts) + Sentiment (IA, 15 pts) + Budget (15 pts) + Délai (15 pts) + Source (15 pts) + Channels (10 pts) + WantsAudit (10 pts) → max 100
6. Filtre éthique post-réception : si Claude retourne un score gonflé ou un sentiment manipulateur → log warning gardien-valeurs.
7. Sauvegarde dans `lead_scores` avec champ `features` JSONB incluant l''analyse IA complète + modèle utilisé + cost estimé (tokens).
8. Trigger T04 déclenchera assignation automatique si score >= 75.

**Délègue à backend-supabase** (Edge Function) + coordination `ia-orchestration` (prompt design) + consultation `gardien-valeurs` (filtre éthique).

**Critères d''acceptation** :
- [ ] Edge Function déployée + testée avec 10 leads synthétiques
- [ ] Coût moyen par scoring : < 0.001 USD (Haiku)
- [ ] Format JSON parse 100% des fois (sinon retry avec Sonnet)
- [ ] Aucun PII dans les logs (ni email ni téléphone)
- [ ] Cache prompt système activé (header anthropic-beta)
- [ ] EVAL-006 ajouté : lift vs scoring manuel mesuré
- [ ] BLOCKER \"scoring IA basé sur Lovable\" résolu (LEARNING dans LEARNINGS.md)

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
   - [ ] **Filtre éthique `gardien-valeurs` obligatoire** AVANT 1ère production (5 prompts test validés)
   - [ ] EVAL-006 : lift vs scoring manuel mesuré sur 10 leads synthétiques
   - [ ] Coût moyen par scoring < 0.001 USD (Haiku)
   - [ ] Aucun PII dans logs (vérif `mcp__get_logs`)
   - [ ] Cache prompt système activé (header `anthropic-beta`)

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T07): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T07
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
