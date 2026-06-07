# Architecture fonctionnelle — TUC

> Cinq domaines indépendants, chacun avec son propre périmètre, ses entités, ses interfaces.
> Découpage par **domaine métier**, pas par couche technique.

---

## Domaine 1 — Acquisition & Qualification
**Responsabilité** : capter le prospect, l'enrichir, le scorer, le qualifier.

- Sources : formulaires, imports CSV, intégrations (Calendly, Tally, Typeform).
- Enrichissement : nom, entreprise, taille, intérêts, parcours déclaré.
- Scoring : règles métier + signaux IA (intention d'achat, ICP fit).
- Qualification : statut (cold/warm/hot/disqualified), motif documenté.
- Sortie : prospect prêt à entrer dans le pipeline messagerie.

**Entités clés** : `Prospect`, `Score`, `QualificationEvent`.

---

## Domaine 2 — Messagerie Multi-canaux
**Responsabilité** : envoyer le bon message, sur le bon canal, au bon moment, avec personnalisation IA.

- Canaux supportés : WhatsApp Business, Telegram, Messenger, Instagram DM, Email (fallback).
- Générateur de scripts : IA qui produit un message adapté au prospect (ton, contexte, valeurs).
- Suivi engagement : ouverts, répondus, ignorés, opt-out.
- Compliance : respect anti-spam, consentement, RGPD.

**Entités clés** : `Conversation`, `Message`, `Script`, `ChannelConfig`.

---

## Domaine 3 — Matching IA Prospects ↔ Closers
**Responsabilité** : choisir le bon closer pour chaque prospect en fonction de la personnalité.

- Profilage closer : test de personnalité, historique de perf, préférences.
- Profilage prospect : signaux conversationnels, intérêts, ton.
- Algorithme de matching : score d'affinité prospect ↔ closer.
- Attribution : règles (calendrier, charge, exclusivités).

**Entités clés** : `CloserProfile`, `ProspectProfile`, `Match`, `Assignment`.

---

## Domaine 4 — Préparation Meet & Coaching
**Responsabilité** : préparer le closer avant le meet, transcrire, critiquer, capitaliser.

- Briefing pré-meet : fiche prospect + script + objections probables.
- Synchro calendrier : Google Calendar, Calendly.
- Transcription : Fireflies / Whisper local / Gong.
- Critique post-meet IA : points forts, points d'amélioration, prochaines actions.
- Historique des meets par closer (vue coaching).

**Entités clés** : `Meeting`, `Briefing`, `Transcript`, `CoachingFeedback`.

---

## Domaine 5 — Onboarding & Suivi Closers
**Responsabilité** : intégrer un nouveau closer, suivre sa montée en compétence, identifier blocages.

- Parcours d'onboarding : modules (théorie + pratique + simulations).
- Dashboard performance : taux conversion, no-show, NPS prospect.
- Identification des blocages : détection IA de patterns d'échec.
- Boucle d'amélioration : recommandations personnalisées.

**Entités clés** : `Closer`, `OnboardingPath`, `PerformanceSnapshot`, `Recommendation`.

---

## Interfaces inter-domaines
- Acquisition → Messagerie : un prospect qualifié entre dans le pipeline d'envoi.
- Messagerie ↔ Matching : un prospect engagé déclenche le matching.
- Matching → Meet : un match validé crée un meeting planifié.
- Meet → Onboarding : les feedbacks alimentent le dashboard closer.

## Principes d'architecture
- **Bounded contexts** : un domaine ne lit pas la base de l'autre, il passe par une API/événement.
- **Événements first** : chaque changement d'état important est un événement (`ProspectQualified`, `MeetingScheduled`, etc.).
- **L'IA est un service** : chaque domaine appelle un service IA dédié, pas de spaghetti.
- **Stack à figer avec un dev partenaire** — voir règle CLAUDE.md.
