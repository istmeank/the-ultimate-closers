---
name: workload-management-matching
description: Expertise complète pour concevoir et coder le moteur d'auto-assignation prospect ↔ closer de TUC, inspiré IBM WLM mainframe et Twilio TaskRouter. Utilise systématiquement ce skill dès qu'il est question de matching prospect/closer, auto-assignment, lead routing, priority queues, load balancing closers, Algorithme Hongrois, cosine similarity Big Five, scoring IA, capacité dynamique, ré-assignation 24h, downgrade hot→warm, fonction PL/pgSQL auto_assign_closer_to_lead, Edge Function Deno enrichissement Clearbit, ou tout calcul de Score_Final pondéré (affinité×0.5 + charge×0.3 + priority×0.2). Inclut ontologie WLM/TaskRouter→TUC, architecture flux 6 étapes, 3 priority queues (HOT/WARM/COLD avec SLA), algorithme multicritère + Skill Relaxation + tie-breaking Hungarian, gestion capacité, ré-assignation, patterns SQL avec locking stratégique, observabilité 4 KPIs, 4 anti-patterns critiques, checklist 12 points avant prod.
---

# Synthèse Stratégique : Moteur d'Auto-assignation Intelligent (TUC)

## 1. Concepts clés et ontologie du système

En ingénierie de systèmes distribués, l'absence d'une nomenclature unifiée entre les services d'intelligence artificielle (scoring) et la couche de persistance (PostgreSQL) génère des dérives transactionnelles critiques. Pour assurer l'intégrité du flux TUC, il est impératif de mapper les concepts de gestion de charge hérités (IBM WLM) et les modèles de routage cloud (Twilio TaskRouter) sur un schéma relationnel strict.

| Concept Source (WLM/TaskRouter) | Entité TUC (PostgreSQL) | Définition Technique |
|---|---|---|
| **Worker** | Closer (table `profiles`) | Ressource active avec attributs Big Five et vecteurs de compétences. |
| **Task** | Lead (table `leads`) | Unité de travail atomique avec `score_ia` et `tenant_id`. |
| **Activity** | État (`is_active`) | Flag booléen pilotant l'inclusion dans le pool de matching. |
| **TaskQueue** | Priority Queue | Segmentation par `Importance Levels` (1-5) basée sur le score. |
| **Skills** | `specialties` (JSONB) | Vecteur multidimensionnel pour calcul de similarité cosinus. |
| **Workload Management** | `max_concurrent_leads` | Quota transactionnel limitant la charge par profil. |

Cette ontologie sert de fondation au moteur de matching en garantissant que chaque appel SQL manipule des entités métier parfaitement alignées avec les métadonnées issues du scoring IA.

## 2. Architecture globale du flux d'assignation

Le système opère dans un contexte multi-tenant strict. Chaque transaction doit propager le `tenant_id` pour garantir l'isolation des données et la conformité des règles métier spécifiques à chaque organisation. L'architecture sépare radicalement l'enrichissement asynchrone (Edge) du matching atomique (Database).

**Workflow transactionnel :**

1. **Insertion Lead (Trigger)** : capture initiale avec injection du `tenant_id`.
2. **Enrichissement (Edge Function)** : appel aux API tierces (Clearbit/Lusha) via Deno pour hydratation du profil prospect.
3. **Scoring IA** : génération d'une probabilité de conversion et classification par niveau d'importance.
4. **Entrée en Priority Queue** : positionnement du lead dans une file d'attente segmentée.
5. **Matching Algorithm** : calcul du `Score_Final` et résolution des égalités via la formulation matricielle de l'Algorithme Hongrois.
6. **Finalisation** : mise à jour atomique de `closer_assignments` et verrouillage de l'`owner_id`.

## 3. Segmentation par Priority Queues (Importance Levels)

L'efficacité du moteur repose sur l'alignement des délais de réponse (SLA) avec les "Importance Levels" issus de la logique IBM WLM. Un lead "HOT" subit une dépréciation de valeur exponentielle (churn) si le premier contact dépasse 15 minutes.

### Queue HOT (Importance 1 — Score ≥ 75)
- **SLA** : assignation < 5s, contact < 15 min.
- **Logique** : préemption des ressources. Ces leads interrompent les tâches de fond.

### Queue WARM (Importance 2-3 — Score 40-74)
- **SLA** : premier contact < 60 min.
- **Logique** : traitement séquentiel prioritaire sur le backlog.

### Queue COLD (Importance 4-5 — Score < 40)
- **SLA** : traitement sous 24 h.
- **Logique** : remplissage de capacité pour stabiliser la productivité des closers.

## 4. Algorithme de matching multicritères

Le moteur **MUST** rejeter le Round-Robin pur au profit d'une approche pondérée par l'affinité. Le calcul final repose sur une fonction PL/pgSQL optimisée utilisant l'extension `pgvector` ou un calcul de produit scalaire sur les clés JSONB `specialties`.

### Formule du Score de Matching

```
Score_Final = (Affinité * 0.5) + ((1 - current_leads / max_concurrent_leads) * 0.3) + (Priority_Boost * 0.2)
```

1. **Composante A (Affinité)** : similarité cosinus entre le vecteur `specialties` du lead et celui du closer.
2. **Composante B (Charge)** : ratio normalisé `current_leads / max_concurrent_leads`. Une charge de 1.0 réduit le score de 0.3.
3. **Composante C (Boost)** : bonus fixe selon l'Importance Level (HOT = 0.2, WARM = 0.1, COLD = 0).

### Logique de Relaxation des Compétences (Skill Relaxation)

Si aucun closer ne présente une `Affinité > 0`, le moteur doit appliquer une logique de dégradation : il ignore itérativement les clés JSONB les moins critiques (définies dans une table de priorité des skills) jusqu'à trouver un match secondaire.

### Résolution des égalités (Tie-breaking)

En cas d'égalité parfaite du `Score_Final` sur plusieurs closers, l'agent IA doit invoquer l'**Algorithme Hongrois** (formulation matricielle). Le système construit une matrice de coût locale et résout le problème d'affectation pour minimiser le coût global de l'équipe sur les n derniers leads en attente.

## 5. Gestion dynamique de la capacité

L'équilibre entre rendement et qualité de service (QoS) est maintenu par des contraintes d'état strictes :

- **Saturation** : un closer est automatiquement exclu du pool de matching si `current_leads >= max_concurrent_leads`.
- **Alerte de seuil** : à 95 % de capacité, un événement de monitoring est émis vers le superviseur via le Command Center.
- **Disponibilité** : le passage de `is_active` à `false` déclenche l'exclusion immédiate, mais ne provoque pas de ré-assignation automatique du backlog existant (sauf si configuré explicitement).

## 6. Stratégies de ré-assignation et escalade

Le "circuit-breaker" temporel évite la stagnation des opportunités à haute valeur.

- **Trigger inactivité (24 h)** : si `last_contact_date` est nul, l'`owner_id` est réinitialisé à `NULL` et le lead est ré-injecté dans la Priority Queue avec un flag `is_reassigned`.
- **Trigger absence** : en cas de congé déclaré, le backlog actif est migré par bloc vers le closer possédant la plus forte affinité résiduelle.
- **Obsolescence de score** : un lead HOT sans interaction pendant 48 h subit un downgrade vers WARM pour libérer la file prioritaire.

## 7. Architecture de persistance et logique SQL (PL/pgSQL)

Pour garantir l'atomicité dans un contexte concurrentiel, l'assignation doit être exécutée dans une seule transaction SQL.

- **Locking stratégique** : utiliser `SELECT ... FOR UPDATE` uniquement sur les lignes de la table `profiles` filtrées préalablement par `is_active = true` et `current_leads < max_concurrent_leads`. Cela évite les verrous de table massifs et les goulots d'étranglement de performance.
- **Indexation critique** :
  - Index **B-tree** sur `leads(score_ia, tenant_id)`.
  - Index **GIN** sur `profiles(specialties)` pour les requêtes JSONB.
  - **Partial Index** sur `profiles(id) WHERE is_active = true`.

## 8. Orchestration via Supabase Edge Functions (Deno)

Les opérations non déterministes (appels API, enrichissement Clearbit) **MUST** résider dans les Edge Functions pour protéger le moteur SQL des latences réseau.

- **Pattern Deno** : propagation systématique du `tenant_id` et des variables d'environnement sécurisées.
- **Résilience** : implémentation d'une politique de "retry" avec exponential backoff pour les appels de scoring IA.
- **Isolation** : l'Edge Function pré-calcule le vecteur de similarité avant d'appeler la fonction stockée PostgreSQL, réduisant ainsi la charge CPU de la base de données.

## 9. Métriques de performance et observabilité

| Métrique | Indicateur (KPI) | Cible (SLA) |
|---|---|---|
| **Latency** | Lead insertion → Assignment | < 5.0 s |
| **Balance** | Écart-type de la charge (équité) | < 15 % de variance |
| **Churn** | Taux de ré-assignation auto | < 10 % |
| **Accuracy** | Corrélation Affinité / Closing | R > 0.7 |

## 10. Anti-patterns et limites du système

1. **L'Effet "Star-Closer"** : risque de saturer les agents les plus performants, entraînant une chute de la QoS globale. Solution : pondération dynamique du `max_concurrent_leads`.
2. **La Boucle Infinie de Saturation** : blocage système si 100 % des closers sont à capacité. Solution : implémenter une queue de débordement (Overflow Queue) avec alerte supervisor.
3. **Complexité algorithmique** : l'usage de l'algorithme Hongrois sur des matrices trop larges peut atteindre une complexité O(n³). L'agent IA doit limiter la taille de la matrice de résolution aux n = 50 derniers éléments pour préserver la réactivité.
4. **Ghosting de file** : leads HOT stagnants sans `owner_id`. Solution : trigger d'alerte si un lead HOT reste en file > 60 s.

## 11. Checklist de mise en production (12 points)

- [ ] **Validation du schéma** : intégrité des 17 tables et des contraintes de clés étrangères.
- [ ] **Multi-tenancy** : vérification de la clause `WHERE tenant_id = ...` dans tous les triggers d'assignation.
- [ ] **Détection de deadlock** : tests de charge avec appels concurrents `FOR UPDATE` sur les mêmes profils.
- [ ] **Intégrité JSONB** : schéma de validation des dimensions du vecteur Big Five dans `specialties`.
- [ ] **Sécurité RLS** : politiques Row Level Security actives pour isoler les closers par tenant.
- [ ] **SECURITY DEFINER** : fonctions PL/pgSQL d'assignation configurées avec `SECURITY DEFINER` pour outrepasser les RLS lors du matching.
- [ ] **Index GIN** : validation de l'utilisation de l'index lors des recherches par compétences.
- [ ] **Fallback "Zero-Active"** : test du comportement système quand aucun closer n'est `is_active`.
- [ ] **Monitoring Edge** : configuration des logs d'erreurs et des seuils de timeout sur Deno.
- [ ] **Math check** : validation de la formule `Charge_Normalisée` contre les divisions par zéro.
- [ ] **Circuit-breaker** : test de la ré-assignation après 24 h avec `owner_id` mis à `NULL`.
- [ ] **Optimisation O(n³)** : limitation de la taille des matrices pour les résolutions par Algorithme Hongrois.
