# DOMAIN 03 — Matching IA Prospects ↔ Closers

## Mission
Choisir le bon closer pour chaque prospect en fonction de la personnalité, de l'historique de perf, et de la disponibilité.

## Entités principales
- `CloserProfile` (test de personnalité + perf + préférences)
- `ProspectProfile` (signaux conversationnels + intérêts)
- `Match` (score d'affinité)
- `Assignment` (attribution effective)

## État actuel
- **Code existant** : `src/pages/CloserProfile.tsx`, table `profiles` avec `specialty[]`, `specialties` (jsonb), `bio`, `max_concurrent_leads`, `is_active`. Table `closer_assignments` créée.
- **Migrations existantes** : `closer_assignments`, `closer_integrations` (migration `20251029123034`)
- **Manquant** : modèle de personnalité (Big Five ? DISC ? MBTI ?), algorithme de matching, calcul d'affinité, intégration avec le pipeline lead → meet.

## Backlog priorisé
1. **(V1 cadrage)** ADR : choix du modèle de personnalité (Big Five recommandé par défaut, scientifiquement validé)
2. **(V2)** Test de personnalité closer (formulaire onboarding) — alimente `CloserProfile`
3. **(V3)** Extraction signaux personnalité prospect depuis conversations (IA, DziriBERT pour darija)
4. **(V3)** Algorithme de matching v1 (cosine similarity sur vecteur personnalité, pondéré par charge closer)
5. **(V4)** Algorithme v2 avec apprentissage continu (feedback boucle : score d'affinité prédite vs résultat meet)
6. **(V4)** UI admin pour ajuster manuellement attribution + voir explications IA

## Risques spécifiques
- **Biais discriminatoires** : matching personnalité peut camoufler discrimination si mal codé. Mitigation : audit `gardien-valeurs`, jamais d'attribut origine/religion/genre dans le matching.
- **Boîte noire** : closer ne comprend pas pourquoi un lead lui est attribué. Mitigation : explication IA accessible.
- **Sur-spécialisation** : risque d'enfermer les closers dans des typologies. Mitigation : rotation forcée + lots d'exploration.

## Skills nécessaires
- `.claude/skills/big-five-personality/` (à créer V2)
- `.claude/skills/embedding-matching-algorithms/` (à créer V3)
- `.claude/skills/dziribert-nlp/` (à créer V3 — exploite l'existant `lib/dziribert.ts`)
- `.claude/skills/ml-bias-detection/` (à créer V4)

## Agents owner
- Lead : `anthropic-gateway`, `database-postgres`
- Support : `gardien-valeurs` (audit anti-biais), `frontend-react` (UI résultats matching)
