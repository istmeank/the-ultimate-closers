# DECISIONS — Architecture Decision Records (ADR)

> Chaque décision structurante du projet TUC est consignée ici.
> Format : ADR léger. On ne supprime jamais une décision, on l'annote "superseded by ADR-XXX" si elle change.

## Pourquoi ce registre
Pour qu'aucune décision importante ne soit perdue, contredite par accident, ou refaite sans raison. La cohérence du projet en dépend.

## Format d'une entrée

```
## ADR-001 — Titre court de la décision
- Date : YYYY-MM-DD
- Statut : proposée | acceptée | refusée | superseded by ADR-XXX
- Contexte : pourquoi la question se pose
- Décision : ce qu'on choisit, en une phrase
- Conséquences : ce que ça change, ce qu'on accepte de perdre
- Alternatives écartées : ce qu'on a regardé et pourquoi on n'a pas pris
```

---

<!-- Première décision à ajouter ici quand elle arrive -->

## ADR-001 — Architecture RBAC + RLS pour TUC-v2
- Date : 2026-06-07
- Statut : acceptée
- Contexte : TUC-v2 (Supabase llxgyomevketvypusafl) doit garantir une isolation stricte des données entre owners, admins, closers et leurs leads, sans aucune faille RLS et conformément OWASP 2025. Le legacy Lovable contenait 30 migrations chaotiques avec 6 anomalies critiques (enum incohérent, has_role doublé, auth.uid() non wrappé, search_path non sécurisé, USING true non justifiés, tokens en clair).
- Décision : adopter le modèle RBAC hiérarchique `owner > admin > closer > user` (enum app_role 4 valeurs) + table `user_roles` source de vérité + fonction `has_role(uuid, app_role)` SECURITY DEFINER avec search_path restreint (pg_catalog, public, pg_temp). RLS optimisée : `(select auth.uid())` wrappée systématiquement (perf +99%), clause `TO authenticated/anon` partout, `USING` + `WITH CHECK` séparés sur UPDATE/INSERT, soft delete (`deleted_at`) sur leads/appointments/deals avec partial indexes. SECURITY DEFINER REVOKE EXECUTE FROM anon/authenticated (utilisable uniquement par triggers/policies). Stockage : 3 buckets (avatars public read URL-only, formations admin-only, site-images public). 17 tables, 41 policies RLS, 66 indexes, 3 migrations versionnées appliquées sur TUC-v2 (tuc_v2_baseline, tuc_v2_rls_policies_and_storage, tuc_v2_security_hardening).
- Conséquences : modèle stable et performant pour MVP. RBAC stocké en table → 1 JOIN par requête RLS (acceptable jusqu'à ~10k users actifs). Migration vers `app_metadata` JWT reportée Vague 3 (gros refactor Auth Hook + frontend). Tokens OAuth en clair acceptés en MVP avec BLOCKER-001 ouvert (à chiffrer via pgsodium/Vault avant prod réelle).
- Alternatives écartées : (a) RBAC via JWT app_metadata dès baseline → rejeté car nécessite Auth Hook custom + refactor frontend (trop coûteux pour Vague 1) ; (b) un seul rôle `admin` sans hiérarchie → rejeté car ne permet pas la distinction owner/closer/user requise par le produit ; (c) RLS sans wrapping `(select auth.uid())` → rejeté car perte de perf 99% sur grosses tables documentée par le skill `supabase-auth-rls`.
- Conformité skill `supabase-auth-rls` : 13/15 checklist (items manquants : RBAC JWT app_metadata et getClaims SSR — N/A pour Vite SPA).
- Lien rapport audit : `docs/security-audit-baseline.md`
- Lien BLOCKERS ouverts : BLOCKER-001 (tokens), H8/H9 (rate limit INSERT public)

## ADR-026 — Silicate = holding ET incubateur en période de maturation
- Date : 2026-06-23
- Statut : acceptée (réactivé — remplace la version abandonnée en session 29)
- Contexte : session 29 avait abandonné ADR-026 en interprétant Silicate comme "architecte de gouvernance uniquement, pas holding". Nacer corrige en session 31 : Silicate est les deux — **holding ET incubateur**, en période de maturation active.
- Décision : Silicate = structure qui (1) chapeaute LULG + TUC + ANK sur le plan identitaire et de gouvernance ET (2) incube des entités selon une méthodologie reproductible (le squelette). La forme juridique est en maturation — pas encore constituée. La gouvernance est en bêta et se prouve par les sessions elles-mêmes.
- Conséquences : le squelette Silicate (v0.6 et suivants) est à la fois l'outil de gouvernance interne ET le produit d'incubation exportable vers d'autres entreprises plus tard. TUC construit le système d'acquisition de LULG. LULG est prioritaire (Nacer). ANK est le LLM commun.
- Alternatives écartées : "Silicate = simple architecte sans dimension holding" (trop limitatif, ne reflète pas la vision fondatrice).
- Lien JOURNAL : session 31 — 2026-06-23

## ADR-031 — P17 (forme juridique + couches MBA) = N/A pour les repos et projets techniques
- Date : 2026-06-23
- Statut : acceptée
- Contexte : lors de l'application du squelette Silicate v0.6 sur TUC tech (repo GitHub), la pierre P17 (forme juridique + architecture management 5 couches) ne s'applique pas. Un repo n'est pas une entreprise — il n'a pas de forme juridique, pas de couches managériales au sens MBA.
- Décision : le squelette Silicate est **contextuel** — il s'adapte selon le type d'instance cible : (1) Entreprise / entité juridique → toutes les pierres dont P17 ; (2) Repo / projet technique → P17 remplacée par "architecture technique + agents codeurs + couche services" ; (3) Communauté / programme → P17 adaptée selon les besoins. L'INDEX du squelette doit mentionner cette adaptabilité (suggestion à remonter à Nacer pour skeleton-modules/00-INDEX.md).
- Conséquences : TUC tech score 20/24 pierres (P17 = N/A, non comptée dans le score repo tech). Score effectif : 20/23 pierres applicables.
- Lien JOURNAL : session 31 — 2026-06-23

---

## ADR-032 — P21 : Managed Agents = LOCAL par défaut pour TUC tech

**Date** : 2026-06-23  
**Session** : 32  
**Statut** : Actif  
**Décideur** : Nacer (approbation via "continue les Pierres restantes")

### Contexte
Pierre 21 du squelette Silicate v0.6 exige l'application de la matrice Managed vs Local avant tout déploiement cloud.

### Décision
TUC tech reste **LOCAL (principal)** pour toute la gouvernance et les données sensibles.  
Managed Agents = optionnel uniquement pour tâches API autonomes **non sensibles** (veille, scripts génériques).  
Q2 et Q5 sont **bloquants** : filesystem local requis + données prospects RGPD.

### Conséquences
- Aucun agent de gouvernance ne migre en cloud sans nouvelle décision explicite
- Toute tâche Managed candidate doit repasser les 5 questions P21
- Détail dans `docs/infrastructure-decision.md`

---

## ADR-033 — Score squelette Silicate v0.6 : 23/23

**Date** : 2026-06-23  
**Session** : 32  
**Statut** : Actif  
**Décideur** : Nacer

### Contexte
Session 31 avait atteint 20/23. 4 pierres restantes (P16, P16-B, P18, P21) implémentées en session 32.

### Décision
TUC tech est **conforme à 100% du squelette Silicate v0.6** (23/23 pierres applicables).  
P17 reste N/A (ADR-031 — repos/projets n'ont pas de forme juridique).

### Conséquences
- Prochaine évolution : v0.7 du squelette (P17 adaptabilité à remonter à SILICATE)
- T28 (couche d'abstraction services) = prochaine priorité technique absolue
