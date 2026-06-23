# T03 — Migration extension rôles closer/owner/client + profiles fields

**Priorité** : P1 fondations
**Agent responsable** : `database-postgres`
**Skill bootstrap** : `postgresql-supabase` + `supabase-auth-rls`
**Modèle Claude** : `sonnet-4-6` — Migration DB standard
**Skills Cowork (Claude PC)** : —
**Effort estimé** : 2-3h

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

**Tâche T03** : étendre l''enum `app_role` et enrichir la table `profiles` pour supporter le rôle closer.

**Contexte** : actuellement enum `app_role` = {admin, user}. Besoin métier : distinguer closer (vue restreinte à ses leads), owner (gérant), client (futur portal).

**Mission** :
1. Crée migration `[TS]_extend_roles_closer_owner.sql` :
```sql
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'closer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialty TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_concurrent_leads INTEGER DEFAULT 10;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS public.closer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closer_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_assigned_at TIMESTAMPTZ DEFAULT now(),
  total_assigned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_closer_assignments_closer ON closer_assignments(closer_id);
CREATE INDEX IF NOT EXISTS idx_closer_assignments_last_assigned ON closer_assignments(last_assigned_at);
```
2. Met à jour RLS policies sur `leads`, `interactions`, `deals`, `appointments` pour supporter rôle closer (closer ne voit que ses leads via `owner_id = auth.uid()`).
3. Regénère types TypeScript via `mcp__generate_typescript_types` → `src/lib/database.types.ts`.

**Délègue à database-postgres** (migration) + `auth-security-rls` (revue RLS).

**Critères d''acceptation** :
- [ ] Migration appliquée + visible dans `mcp__list_migrations`
- [ ] Enum `app_role` contient 5 valeurs (admin, user, closer, owner, client)
- [ ] Table `closer_assignments` créée avec UNIQUE sur closer_id
- [ ] RLS testées : closer A ne voit pas leads de closer B
- [ ] Types TS regénérés et committés
- [ ] `mcp__get_advisors` clean

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
   - [ ] `mcp__get_advisors` clean
   - [ ] Migration appliquée + visible `mcp__list_migrations`
   - [ ] Test RLS : closer A ne voit pas leads closer B (2 comptes test)
   - [ ] Types TypeScript regénérés + committés

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
- [ ] **Commit Git conventionnel** : `<type>(<scope>): <résumé>` (ex: `feat(T03): <résumé concis>`)
- [ ] **Push** uniquement après validation Nacer (jamais `git push --force`)

### 6. Validation Nacer (sortie)
Produire en sortie un mini-rapport synthèse :
```
## RÉSULTAT — T03
- ✅ Implémenté : <liste fichiers créés/modifiés>
- ✅ Tests passés : <tests OK>
- ⚠️ Points d'attention : <si applicable>
- 📊 Métriques : <coût IA, latence, score audit, etc.>
- 🔗 Suivants débloqués : <T<x>, T<y>>
- 💾 Commit : <hash>
```
