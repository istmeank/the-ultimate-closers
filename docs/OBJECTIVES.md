# OBJECTIVES — TUC

> Objectifs chiffrés. La source de vérité pour mesurer le succès.
> À enrichir avec le business plan que Nacer partagera.

## Métrique nord
**Nombre de closers actifs qui font ≥ 20 meets/mois grâce à TUC.**
C'est la métrique unique qui prouve que TUC livre sa promesse : libérer le closer de la friction et le faire excellence.

## Horizon 6 mois (cible décembre 2026)
- **Closers actifs** : 10 closers payants, chacun avec ≥ 20 meets/mois.
- **Leads gérés** dans le système : 2 000 (cumulés).
- **Taux conversion** prospect → meet (moyenne plateforme) : +20 % vs baseline closer hors TUC.
- **No-show meet** : < 15 % (vs 30 % en moyenne marché).
- **NPS closer** : ≥ 40.
- **MRR** : 3 000 € (à 99 €/closer/mois).
- **Disponibilité plateforme** : 99,5 %.

## Horizon 12 mois (cible juin 2027)
- **Closers actifs** : 50 closers payants.
- **Leads gérés** : 15 000 (cumulés).
- **Taux conversion** : +30 % vs baseline.
- **No-show** : < 10 %.
- **NPS closer** : ≥ 50.
- **MRR** : 15 000 € (avec un palier équipe à 299 €/agence).
- **Disponibilité** : 99,9 %.
- **Marché** : présence Algérie + diaspora francophone (FR, BE, CA, CH).

## Métriques d'apprentissage produit (mesurées en continu)
- Temps onboarding closer (cible : 1 semaine en H12, vs 4 semaines marché).
- Taux d'utilisation du briefing pré-meet (cible : > 80 % des meets).
- Taux d'adoption critique post-meet (cible : > 60 % des closers la consultent).
- Coût IA mensuel par closer actif (cible : < 5 €).

## Métriques éthiques (mesurées en continu)
- Zéro plainte RGPD.
- Zéro incident de sécurité (fuite, accès indu).
- Zéro signalement de dark pattern (interne ou externe).
- Taux d'opt-out prospect : < 5 % (signal que la voix TUC est respectueuse).

## Anti-objectifs (ce qu'on refuse même si rentable)
- Pas de croissance via spam, scraping non consenti, ou tactiques manipulatrices.
- Pas d'ouverture à des secteurs incompatibles avec les valeurs (jeux d'argent, scams pyramidaux).
- Pas de revente de données prospect à des tiers.

## Révision
Ce fichier est révisé tous les 3 mois (en équipe de cadrage avec Nacer). Toute modification = ADR.

---

## P13 — Critères de succès en 3 formes (Squelette Silicate v0.6)

> Un système de gouvernance IA se mesure en 3 formes complémentaires.

### Forme 1 — Production (ce qu'on livre)
- Nombre de tâches backlog complétées / sprint
- Nombre de migrations appliquées sans régression
- Nombre de features livrées sans bug critique (0 advisor sécurité post-migration)
- Délai moyen T01→T27 : cible < 3 mois MVP

### Forme 2 — Qualité (comment on le livre)
- 0 violation de véto éthique sur le trimestre
- Couverture RLS : 100 % des tables publiques (actuellement 17/17 ✅)
- Audit Lighthouse > 90 sur les pages principales
- BLOCKER ouverts < 3 à tout moment
- Suggestions SGT actives évaluées dans les 7 jours

### Forme 3 — Impact (pourquoi on le livre)
- Closers actifs utilisant TUC : cible 10 à 6 mois / 50 à 12 mois
- MRR : cible 3k€ à 6 mois / 15k€ à 12 mois
- Satisfaction closer (NPS cible > 50)
- LULG : système d'acquisition opérationnel via TUC à M9

---

## P14 — Les 3 Paradigmes de gouvernance IA (Squelette Silicate v0.6)

### Paradigme 1 — IA ponctuelle (outil à la demande)
Prompt unique sans mémoire. Résultat jetable. Aucune capitalisation.
*TUC n'est plus ici depuis la session 1.*

### Paradigme 2 — IA avec mémoire et règles (assistant structuré)
Mémoire + CLAUDE.md + rules. Pas encore d'agents autonomes.
*TUC a traversé ce paradigme en sessions 1-4.*

### Paradigme 3 — IA orchestrée avec agents et doctrine vivante (gouvernance)
Agents spécialisés, mémoire active, rituel de session, filtre éthique, hooks lifecycle.

**TUC est en Paradigme 3 depuis la session 5.** Score actuel : 20/24 pierres (post session 31).

### Chemin de progression
→ Paradigme 3 complet : appliquer P21 (Matrice Managed Agents) + intégrer ANK (Paradigme 3 avec LLM propriétaire)
