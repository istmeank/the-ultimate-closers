# Capacités différées de la couche services

> Registre unique des méthodes déclarées dans `src/lib/services/` mais pas encore
> implémentées. Créé en session 34 (clôture T28).
> Garanti par `src/lib/services/__tests__/deferred.test.ts`.

## Pourquoi ce registre existe

Une interface de service décrit la cible, pas l'état d'avancement. Dix méthodes
sont aujourd'hui déclarées sans implémentation — non par négligence, mais parce
qu'elles dépendent d'une tâche du backlog qui n'est pas encore passée.

Le risque, sans registre, n'est pas l'oubli : c'est la découverte tardive. Un
développeur lit l'interface, suppose que la méthode fonctionne, l'appelle depuis
un écran, et l'échec se manifeste chez un closer en pleine conversation avec un
prospect. Trois protections répondent à ce risque :

1. **Échec bruyant** — chaque méthode différée lève une erreur nommant sa tâche.
   Jamais de `undefined` silencieux.
2. **Test de garantie** — `deferred.test.ts` vérifie que ces méthodes échouent
   bien. Le jour où l'une est implémentée, le test rouge force la mise à jour de
   ce tableau.
3. **Ce registre** — un seul endroit à lire avant de brancher un écran.

## Registre

| Service | Méthode | Débloquée par | Domaine |
|---|---|---|---|
| `ai` | `generateScript` | Phase ANK | Transverse IA |
| `ai` | `classifyLead` | Phase ANK | Transverse IA |
| `ai` | `askANK` | Phase ANK | Transverse IA |
| `matching` | `scoreAffinity` | T08 — auto-assignation closers | 3 · Matching |
| `matching` | `matchClosersToProspect` | T08 — auto-assignation closers | 3 · Matching |
| `matching` | `getMatchExplanation` | T08 — auto-assignation closers | 3 · Matching |
| `messaging` | `sendMessage` | Domain 2 — messagerie multicanaux | 2 · Messagerie |
| `messaging` | `listConversation` | Domain 2 — messagerie multicanaux | 2 · Messagerie |
| `messaging` | `markRead` / `byChannel` | Domain 2 — messagerie multicanaux | 2 · Messagerie |
| `realtime` | `subscribeToTable` / `broadcastEvent` / `presence` | Réservé — aucun appelant | Transverse |
| `secrets` | `getDecryptedToken` / `storeToken` / `rotateToken` | T01 — Vault + pgsodium | Sécurité |

`ai.scoreLead` est **implémentée** (Edge Function `score-lead`) et ne figure donc
pas dans ce registre.

## Procédure quand une capacité est livrée

1. Implémenter la méthode dans l'adapter concerné.
2. Retirer la ligne correspondante du registre `DEFERRED` dans `deferred.test.ts`.
3. Écrire un vrai test de comportement à la place.
4. Retirer la ligne de ce tableau.
5. Tracer dans `JOURNAL.md` via l'archiviste.

L'étape 2 n'est pas optionnelle : sans elle, la suite de tests reste rouge, ce
qui est précisément le mécanisme de rappel voulu.

## Dette connexe

`src/pages/LeadDetailWithProtonANK.example.tsx` importe le client Supabase
directement. Ce fichier n'est routé nulle part dans `App.tsx` : c'est un exemple
mort. Il figure dans l'allowlist de `scripts/check-supabase-abstraction.mjs` avec
sa justification. À supprimer ou à porter sur la couche services lors d'une
prochaine passe.
