---
paths:
  - "src/**/*.{ts,tsx,js,jsx}"
  - "supabase/**/*.sql"
  - "supabase/functions/**/*.ts"
---

# STANDARDS DE CODE — TUC

> Auto-chargés quand un agent touche du code (frontend, backend, migrations).

## TypeScript / React
- **Strict mode obligatoire** : `tsconfig.json` doit avoir `"strict": true`.
- **Pas de `any`** sauf justifié par un commentaire `// @ts-expect-error: <raison>`.
- **Composants fonctionnels uniquement** (pas de class components).
- **Hooks** : règles React strictes (pas de hook dans une condition, nommage `use*`).
- **Props typées** via interface ou type, jamais inline.
- **Pas d'import par défaut** sur les composants partagés (named exports préférés pour le refactor).
- **shadcn/ui** : on étend, on ne réécrit pas. Si besoin spécifique → fork local dans `src/components/custom/`.

## Naming
- Composants : `PascalCase.tsx` (ex. `LeadCard.tsx`).
- Hooks : `useCamelCase.ts` (ex. `useAuth.ts`).
- Utilitaires : `camelCase.ts` (ex. `darijaDetection.ts`).
- Constantes : `SCREAMING_SNAKE_CASE`.
- Fichiers de pages : nom du route en `PascalCase.tsx` (ex. `DashboardCloser.tsx`).

## Sécurité côté frontend
- **JAMAIS de `SUPABASE_SERVICE_ROLE_KEY` côté client.** Détection : `grep -r "service_role" src/` doit retourner 0.
- Toutes les requêtes Supabase passent par le client `anon` ou par une Edge Function.
- Sanitization de tout input avant affichage (XSS).
- Pas de `dangerouslySetInnerHTML` sauf cas justifié + sanitization explicite.

## Supabase / SQL
- **Toute table publique a RLS activée** (`ENABLE ROW LEVEL SECURITY`). Détection : si une migration crée une table sans `ENABLE RLS` → BLOCKER.
- Aucune policy `USING (true)` sans commentaire `-- justification: <raison>`.
- Préfixe des policies : `<table>_<action>_<scope>` (ex. `leads_select_closer_owner`).
- Indexes : sur toutes les FK (`*_id`) + sur les colonnes filtrées dans les `WHERE` fréquents.
- Soft delete par défaut sur les tables métier (`deleted_at TIMESTAMPTZ`).
- Timestamps : toutes les tables ont `created_at` + `updated_at` (trigger pour updated_at).
- Migrations : **append only**. Pour modifier une migration déjà appliquée → créer une nouvelle migration.

## Edge Functions Supabase
- Tout input utilisateur validé via un schéma (zod ou équivalent) avant exécution.
- Timeouts sur tous les appels HTTP externes (`fetch` avec `signal: AbortSignal.timeout(5000)`).
- Logs structurés JSON (pas de `console.log` libre), sans données sensibles.
- Retry avec backoff exponentiel sur les appels à WhatsApp / Telegram / HubSpot.

## Performance
- Pas de requête N+1. Détection : `for (...) await supabase.from(...)` → BLOCKER.
- `select` Supabase toujours avec colonnes explicites, jamais `*` en prod.
- Pagination obligatoire au-delà de 50 lignes.

## Tests minimum
- Toute Edge Function critique (paiement, auth, attribution) : test d'intégration.
- Tout hook custom : test unitaire avec Vitest.
- Toute migration : testée en local avec `supabase db reset` avant push.

## Commits
- Format Conventional Commits : `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`, `sec:`.
- Anglais.
- Message clair : `feat(auth): add OTP via WhatsApp Business`.

## Architecture imposée (doctrine Nacer)
- **Découpage par domaine** : tout fichier code ou SQL appartient à un des 5 domaines (`acquisition-qualification`, `messagerie-multicanaux`, `matching-ia`, `meet-coaching`, `onboarding-closer`) ou au transverse. Pas de fichier "fourre-tout".
- **Taille de fichier maximale : 300 lignes**. Au-delà → découper en sous-modules (composants React enfants, helpers, hooks). Justification : un fichier > 300 lignes devient impossible à raisonner correctement, et l'agent IA perd en pertinence.
- **Dépendances circulaires interdites** : aucun module ne peut importer un module qui l'importe en retour, même indirectement. À détecter via `madge` ou équivalent dans le CI.
- **Imports par domaine** : un fichier du domaine X ne peut importer d'un domaine Y que via les interfaces explicites (events, API typées), pas directement depuis l'implémentation interne. Bounded contexts strict.

## 🔴 Règle d'abstraction stricte (ADR-025, session 27)

> **Référence obligatoire** : `docs/architecture-evolution.md` — stratégie 3 phases Supabase MVP → Backend custom Twenty-like.

### Principe
TUC adopte une **couche d'abstraction service** entre les composants/pages React et le backend (Supabase aujourd'hui, NestJS-like demain). L'objectif : pouvoir migrer le backend sans toucher au code applicatif.

### Architecture obligatoire `src/`
```
src/
├── components/      ← ne connaît QUE les services et hooks
├── pages/           ← idem
├── hooks/           ← peuvent consommer services, jamais supabase directement
│
├── lib/
│   ├── services/    ← couche d'abstraction (interface stable)
│   │   ├── auth.service.ts
│   │   ├── leads.service.ts
│   │   ├── matching.service.ts
│   │   ├── messaging.service.ts
│   │   ├── meet.service.ts
│   │   ├── storage.service.ts
│   │   ├── realtime.service.ts
│   │   ├── integrations.service.ts
│   │   ├── secrets.service.ts
│   │   └── ai.service.ts
│   │
│   └── adapters/    ← implémentations spécifiques (changeables)
│       └── supabase/  ← MVP
│           └── *.supabase.ts
│
└── integrations/
    └── supabase/    ← exclusivement utilisé par les adapters Supabase
```

### Interdictions absolues
- ❌ `import { supabase }` dans `src/components/**` ou `src/pages/**` → **BLOCKER**
- ❌ `from('table_name')` directement appelé hors `src/lib/adapters/` → BLOCKER
- ❌ `supabase.auth.*` appelé hors `src/lib/adapters/supabase/auth.supabase.ts` → BLOCKER
- ❌ `supabase.functions.invoke` appelé hors `src/lib/adapters/` → BLOCKER
- ❌ Tout usage de `Vault` Supabase autrement qu'à travers `secrets.service.ts` → BLOCKER

### Obligations
- ✅ Tout composant React/page consomme uniquement les services depuis `@/lib/services/`
- ✅ Toute Edge Function appelée via `*.service.ts` (jamais `invoke` direct du composant)
- ✅ Tout nouveau service expose une **interface TypeScript** documentée avant l'implémentation
- ✅ Tout service a un test unitaire qui mock l'adapter (pas Supabase) — preuve d'abstraction

### Détection en CI
```bash
echo "🔍 Recherche d'imports Supabase orphelins..."
ORPHANS=$(grep -rn "from '@/integrations/supabase" src/components/ src/pages/ src/hooks/ 2>/dev/null)
if [ -n "$ORPHANS" ]; then
  echo "❌ BLOCKER : imports Supabase orphelins détectés :"
  echo "$ORPHANS"
  exit 1
fi
echo "✅ Aucune fuite d'abstraction Supabase."
```

### Conséquence sur les tâches T01-T27
Chaque tâche du backlog `taches-a-faire/` doit créer ou utiliser un service dédié, JAMAIS appeler Supabase directement depuis un composant ou une page. Voir tableau d'impact dans `docs/architecture-evolution.md` section 3.

### Pourquoi
Sans cette discipline :
- Migration future Supabase → backend custom = refonte massive (12-18 mois 1 dev)
- Avec cette discipline = simple changement d'adapter (4-5 mois 1 dev)
- Économie : **8-13 mois d'effort dev futur** (cf. `docs/architecture-evolution.md` section 3)

### Activation
- À partir de **T28** (refactor composants existants pour passer par services), **AVANT T01**.
- Vérifié par `auditeur-qualite` dans tous les audits post-tâche.
- Mention obligatoire dans le mini-rapport `## RÉSULTAT — Txx` de chaque tâche.
