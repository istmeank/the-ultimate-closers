# DOMAINS — Dashboard des 5 domaines TUC

> Vue d'ensemble du statut de chaque domaine et de ses prochaines actions.
> Mise à jour à chaque cycle significatif (par l'orchestrateur via archiviste).

## Statut global

| # | Domaine | Statut | Vague | Owner agent | Prochaine action |
|---|---|---|---|---|---|
| 1 | [Acquisition & Qualification](./01-acquisition-qualification/PLAN.md) | 🟡 Squelette code Lovable existant, à refondre | V2 | `frontend-react` + `backend-supabase` | Refonte parcours lead après stabilisation sécurité |
| 2 | [Messagerie Multi-canaux](./02-messagerie-multicanaux/PLAN.md) | 🔴 Non implémenté | V2-V3 | `integrations` + `anthropic-gateway` | Cadrage WhatsApp Business API + ADR compliance |
| 3 | [Matching IA Prospects ↔ Closers](./03-matching-ia/PLAN.md) | 🔴 Non implémenté | V3 | `anthropic-gateway` + `database-postgres` | Modélisation `CloserProfile` et `ProspectProfile` |
| 4 | [Préparation Meet & Coaching](./04-meet-coaching/PLAN.md) | 🟡 Briefing/calendrier partiels | V2 | `integrations` + `anthropic-gateway` | Intégration Google Calendar (token table existe) + transcription |
| 5 | [Onboarding & Suivi Closers](./05-onboarding-closer/PLAN.md) | 🟡 Pages CloserProfile/Settings existent | V3-V4 | `produit-spec` + `frontend-react` | Cadrage parcours d'onboarding 30/60/90j |

**Légende statut** : 🟢 Stable / 🟡 Partiel / 🔴 Non implémenté / ⚫ En pause

## Priorité de travail (alignée Vague 1 sécurité)
**Aucun domaine ne progresse tant que la Vague 1 sécurité (auth-security-rls + database-postgres + baseline TUC-v2) n'est pas validée.**

Une fois la sécurité solide :
- V2 : Acquisition + Meet (les deux domaines avec du code existant à stabiliser)
- V3 : Messagerie + Matching (les deux différenciateurs métiers, demandent IA + intégrations)
- V4 : Onboarding (parcours produit complet, vient après que le cœur tourne)

## Format d'un PLAN.md de domaine
Chaque domaine a son `PLAN.md` qui contient :
1. Mission du domaine
2. Entités principales
3. État actuel (code existant / manquant)
4. Backlog priorisé
5. Risques spécifiques
6. Skills nécessaires
7. Agent(s) owner(s)
