# Architecture fonctionnelle — TUC

> Six domaines indépendants + un service transversal ANK.
> Découpage par **domaine métier**, pas par couche technique.
> Stack : React + Vite + Supabase + Vercel. Marché : Algérie + diaspora francophone.

---

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                     TUC PLATFORM (SaaS)                         │
│                                                                  │
│  [D1 Acquisition] → [D2 Messagerie] → [D3 Matching]            │
│                          ↓                                       │
│              [D4 Meet & Coaching] → [D5 Onboarding]             │
│                                                                  │
│  [D6 Template Système] ← modèle reproductible                   │
└─────────────────────────────────────────────────────────────────┘
                            ↑ appels API
            ┌───────────────────────────────┐
            │    ANK — LLM propriétaire     │
            │  (partagé TUC + LULG)         │
            └───────────────────────────────┘
```

---

## Domaine 1 — Acquisition & Qualification

**Responsabilité** : capter le prospect, l'enrichir, le scorer, le qualifier.

- Sources : formulaires, imports CSV, intégrations (Calendly, Tally, Typeform).
- Enrichissement : nom, entreprise, taille, intérêts, parcours déclaré.
- Scoring : règles métier + signaux IA via ANK (intention d'achat, ICP fit).
- Qualification : statut (cold / warm / hot / disqualified), motif documenté.
- Sortie : prospect prêt à entrer dans le pipeline messagerie.

**Entités clés** : `Prospect`, `Score`, `QualificationEvent`.

**Dossier** : `docs/domains/01-acquisition-qualification/`

---

## Domaine 2 — Messagerie Multi-canaux

**Responsabilité** : envoyer le bon message, sur le bon canal, au bon moment, avec personnalisation IA.

- Canaux : WhatsApp Business, Telegram, Messenger, Instagram DM, Email (fallback).
- Générateur de scripts : ANK produit un message adapté (ton, contexte, valeurs).
- Suivi engagement : ouverts, répondus, ignorés, opt-out.
- Compliance : anti-spam, consentement explicite, RGPD.

**Entités clés** : `Conversation`, `Message`, `Script`, `ChannelConfig`.

**Dossier** : `docs/domains/02-messagerie-multicanaux/`

---

## Domaine 3 — Matching IA Prospects ↔ Closers

**Responsabilité** : choisir le bon closer pour chaque prospect par analyse de personnalité.

- Profilage closer : test de personnalité, historique perf, préférences.
- Profilage prospect : signaux conversationnels, intérêts, ton.
- Algorithme : score d'affinité prospect ↔ closer via ANK.
- Attribution : règles (calendrier, charge, exclusivités).
- Principe : matching basé sur personnalité — jamais sur origine, religion, genre.

**Entités clés** : `CloserProfile`, `ProspectProfile`, `Match`, `Assignment`.

**Dossier** : `docs/domains/03-matching-ia/`

---

## Domaine 4 — Préparation Meet & Coaching

**Responsabilité** : préparer le closer avant le meet, transcrire, critiquer, capitaliser.

- Briefing pré-meet : fiche prospect + script + objections probables (ANK).
- Synchro calendrier : Google Calendar, Calendly.
- Transcription : Fireflies / Whisper / Gong.
- Critique post-meet IA : points forts, améliorations, prochaines actions (ANK).
- Historique des meets par closer (vue coaching).

**Entités clés** : `Meeting`, `Briefing`, `Transcript`, `CoachingFeedback`.

**Dossier** : `docs/domains/04-meet-coaching/`

---

## Domaine 5 — Onboarding & Suivi Closers

**Responsabilité** : intégrer un nouveau closer, suivre sa montée en compétence.

- Parcours d'onboarding : modules (théorie + pratique + simulations).
- Dashboard performance : taux conversion, no-show, NPS prospect.
- Identification des blocages : patterns d'échec via ANK.
- Boucle d'amélioration : recommandations personnalisées.

**Entités clés** : `Closer`, `OnboardingPath`, `PerformanceSnapshot`, `Recommendation`.

**Dossier** : `docs/domains/05-onboarding-closer/`

---

## Domaine 6 — Template Système d'Acquisition Reproductible

**Responsabilité** : fournir un modèle installable, clé-en-main, pour n'importe quelle entreprise.

C'est la couche **meta** du projet : TUC lui-même est la première instance de cette template.

- Structure `.claude` complète exportable (CLAUDE.md + agents + mémoire + règles).
- Prompt d'installation précis et paramétrable.
- Connexion native à l'API ANK + SaaS TUC.
- Conçue pour tourner **sans Nacer** une fois installée.
- Paramètres de personnalisation : secteur, taille équipe, canaux, langue.

**But** : un système reproductible qui se déploie, s'adapte, et performe de manière autonome.

**Entités clés** : `SystemTemplate`, `InstallConfig`, `DeploymentLog`.

---

## Service transversal — ANK (LLM propriétaire)

ANK n'est pas un domaine fonctionnel : c'est le **service IA transversal** appelé par tous les domaines.

```
Domaine 1 → ANK : scoring prospect, qualification
Domaine 2 → ANK : génération de scripts personnalisés
Domaine 3 → ANK : profiling personnalité, calcul d'affinité
Domaine 4 → ANK : analyse transcription, critique coaching
Domaine 5 → ANK : détection patterns d'échec, recommandations
Domaine 6 → ANK : personnalisation de la template
```

### Phases de maturation ANK

| Phase | Statut | Contenu |
|---|---|---|
| **Phase 1 — L'Âme** | À démarrer | Fine-tuning via programme PERCEPTION |
| **Phase 2 — La Psychologie** | Bloqué par Phase 1 | Psychologie humaine, profils, motivations |
| **Phase 3 — Le Closing** | Bloqué par Phase 2 | Méthode TUC, scripts, gestion objections |

**Contraintes** :
- Base open source (Mistral / LLaMA / Qwen — à choisir avec un dev).
- Cadrage technique requis avant démarrage (Nacer non-développeur).
- Coût IA cible : < 100 $/mois en MVP.

---

## Interfaces inter-domaines

```
Acquisition    →  Messagerie     : prospect qualifié entre dans le pipeline d'envoi
Messagerie    ↔  Matching        : prospect engagé déclenche le matching
Matching       →  Meet            : match validé crée un meeting planifié
Meet           →  Onboarding     : feedbacks alimentent le dashboard closer
Tout domaine   →  ANK             : appel API pour l'intelligence
Template D6    ←  Tout            : template agrège la config de tous les domaines
```

---

## Principes d'architecture

- **Bounded contexts** : un domaine ne lit pas la base de l'autre — il passe par API/événement.
- **Événements first** : chaque changement d'état est un événement (`ProspectQualified`, `MeetingScheduled`…).
- **ANK est un service** : chaque domaine appelle ANK via API dédiée, pas de spaghetti.
- **Aucun fichier > 300 lignes** : au-delà, on découpe.
- **Pas de secret en clair** : tout secret dans `.env` (local) ou Vercel env vars (prod).
- **Stack à figer avec un dev partenaire** — voir règle CLAUDE.md.
