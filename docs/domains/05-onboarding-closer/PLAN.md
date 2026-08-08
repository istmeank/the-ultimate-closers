# DOMAIN 05 — Onboarding & Suivi Closers

## Mission
Intégrer un nouveau closer en moins d'une semaine. Suivre sa montée en compétence. Identifier les blocages. Faire vivre la communauté des closers TUC.

## Entités principales
- `Closer` (table `profiles` existe, étendue avec `specialty[]`, `bio`, etc.)
- `OnboardingPath` (parcours d'intégration)
- `OnboardingStep` (étapes franchies)
- `PerformanceSnapshot` (mesure hebdo/mensuelle)
- `Recommendation` (recos personnalisées)

## État actuel
- **Code existant** : `src/pages/CloserProfile.tsx`, `src/pages/CloserSettings.tsx`, `src/pages/DashboardCloser.tsx`. Table `profiles` étendue.
- **Manquant** : parcours d'onboarding formalisé, dashboard performance, recommandations personnalisées.

## Backlog priorisé
1. **(V1)** Stabilisation RLS profiles + roles (owner, admin, closer)
2. **(V2)** Refonte UI `DashboardCloser.tsx` : KPIs personnels (conversion, no-show, NPS, meets/semaine)
3. **(V3)** Parcours d'onboarding 7 jours (modules : valeurs TUC, prise en main outil, simulations, première vraie session)
4. **(V3)** Test de personnalité closer (alimente domain matching)
5. **(V3)** Système de niveaux/badges (gamification éthique, pas manipulatrice)
6. **(V4)** Détection IA des blocages récurrents par closer + reco formation
7. **(V4)** Communauté : forum interne / canal Slack closers TUC

## Risques spécifiques
- **Gamification toxique** : badges/levels peuvent dériver en pression psy. Mitigation : véto `gardien-valeurs`, focus sur progression, pas comparaison entre closers.
- **Onboarding trop long** : objectif < 1 semaine. Si on n'y arrive pas, on rate notre métrique nord.
- **Évaluation injuste** : les conditions de marché varient. Mitigation : KPIs relatifs à la baseline du closer, pas absolus.

## Skills nécessaires
- `.claude/skills/big-five-personality/` (partagé avec domain matching)
- `.claude/skills/learning-design-adult/` (à créer V3 — design pédagogique pour adultes)
- `.claude/skills/ethical-gamification/` (à créer V3)

## Agents owner
- Lead : `produit-spec`, `frontend-react`
- Support : `anthropic-gateway` (recos), `gardien-valeurs` (gamification éthique), `database-postgres`
