# TUC — The Ultimate Closers

CRM dopé à l'IA pour closers haut de gamme. SaaS B2B, marché Algérie et diaspora francophone.

## Le quoi

TUC automatise le cycle de vie commercial de bout en bout : capture prospect → qualification → scripts personnalisés → messages multi-canaux (WhatsApp, Telegram, Messenger, Instagram) → matching IA prospect/closer → briefing avant meet → transcription → critique constructive → suivi closer.

## Le pourquoi

Faire passer les closers à un niveau d'excellence rare en supprimant la friction opérationnelle, en alignant chaque prospect au bon closer par analyse de personnalité, et en transformant chaque meet en cycle d'apprentissage.

Pour : agences de closing, équipes commerciales premium, formateurs indépendants.

## Le comment

- **Valeurs d'abord** — éthique du Coran, bienveillance, respect du prospect. Aucun dark pattern, aucun envoi sans consentement RGPD tracé.
- **Cohérence avant vitesse** — on ne livre pas vite, on livre juste.
- **L'IA est l'assistant, le closer reste le décideur.**
- **Architecture identitaire** — chaque domaine est un espace clair, séparé, documenté.

## Domaines

| Domaine | Périmètre |
|---|---|
| `acquisition-qualification` | Capture, scoring, qualification des prospects |
| `messagerie-multicanaux` | WhatsApp, Telegram, Messenger, Instagram + personnalisation IA |
| `matching-ia` | Analyse de personnalité prospect ↔ closer, attribution |
| `meet-coaching` | Briefing, calendrier, transcription, feedback post-meet |
| `onboarding-closer` | Formation, montée en compétence, suivi de performance |

Détail dans [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Stack

| Couche | Choix |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Base de données | PostgreSQL via Supabase |
| Auth | Supabase Auth (RBAC 7 rôles cumulables, RLS) |
| Backend | Supabase Edge Functions |
| Hébergement | Vercel |
| Tests | Vitest |

Le code accède à Supabase exclusivement via la couche d'abstraction `src/lib/services/` → `src/lib/adapters/` (ADR-025), pour rendre la migration vers un backend custom possible sans réécriture. Un garde-fou CI interdit les appels directs.

## Démarrer

Prérequis : Node.js et npm ([installer via nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
git clone https://github.com/istmeank/the-ultimate-closers.git
cd the-ultimate-closers
npm install
npm run dev
```

Variables d'environnement : copier les clés Supabase dans un fichier `.env` local. **Aucun secret ne doit être committé** — `.env` est dans `.gitignore`, les secrets de production vivent dans les variables d'environnement Vercel.

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run test` | Tests unitaires en mode watch |
| `npm run test:run` | Tests unitaires en une passe |
| `npm run lint` | ESLint |
| `npm run check:abstraction` | Garde-fou : aucun appel Supabase hors adapters |
| `npm run verify` | Chaîne complète — abstraction, typage, tests, build |

`npm run verify` doit passer avant toute déclaration de tâche terminée.

## Base de données

Les migrations vivent dans `supabase/migrations/`, au format `YYYYMMDDHHMMSS_tuc_v2_<slug>.sql`. Une migration déjà appliquée ne se modifie jamais : on en crée une nouvelle.

## Documentation

| Fichier | Rôle |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Constitution du projet, règles non-négociables |
| [`PLANIFICATION.md`](PLANIFICATION.md) | Tableau de bord courant, point de reprise |
| [`docs/REFERENCE.md`](docs/REFERENCE.md) | PRD — source de vérité fonctionnelle |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Architecture et domaines |
| [`docs/GLOSSAIRE.md`](docs/GLOSSAIRE.md) | Vocabulaire propre à TUC |
| [`docs/STRATEGY.md`](docs/STRATEGY.md) | Stratégie |
| [`docs/OBJECTIVES.md`](docs/OBJECTIVES.md) | Objectifs chiffrés |
| `taches-a-faire/` | Backlog technique détaillé |
| `.claude/memory/` | Registres append-only : décisions (ADR), leçons, blocages, journal |

## Contribuer

- **Français** pour la documentation produit, **anglais** pour le code et les messages de commit.
- Toute décision structurante donne lieu à un ADR dans `.claude/memory/DECISIONS.md`.
- Règle d'or : ne jamais déclarer une tâche terminée sans avoir vérifié que rien d'autre n'est cassé — relire le diff, vérifier les domaines voisins, tester, tracer.

---

Projet porté par Abdenacer Maredj, au sein du réseau SILICATE.
