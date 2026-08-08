# DOMAIN 04 — Préparation Meet & Coaching

## Mission
Préparer le closer avant le meet (briefing), synchroniser calendrier, transcrire le meet, donner critique constructive, capitaliser dans l'historique.

## Entités principales
- `Meeting`
- `Briefing` (généré par IA à partir de l'historique prospect)
- `Transcript`
- `CoachingFeedback`
- `Appointment` (table `appointments` existe déjà)

## État actuel
- **Code existant** : `src/pages/BookCall.tsx`, `src/pages/GoogleCalendarSettings.tsx`, `src/pages/GoogleCalendarCallback.tsx`. Table `google_calendar_tokens` (migration `20251114132807`). Table `appointments`, `call_bookings`.
- **Manquant** : génération du briefing IA, transcription post-meet, analyse critique constructive, vue coaching closer.

## Backlog priorisé
1. **(V1)** Stabilisation RLS `appointments`, `call_bookings`, `google_calendar_tokens` dans baseline
2. **(V2)** Refonte UI `BookCall.tsx` (validation côté serveur via Edge Function, anti-spam)
3. **(V2)** Génération automatique briefing pré-meet (IA + données prospect) — affiché 15 min avant le meet
4. **(V3)** Intégration Fireflies / Whisper pour transcription post-meet
5. **(V3)** Analyse IA de la transcription : points forts / améliorations / prochaines actions
6. **(V3)** Vue coaching closer : historique meets, tendances, axes de travail
7. **(V4)** Détection IA de patterns d'échec récurrents → recommandations formation

## Risques spécifiques
- **Consentement enregistrement** : transcription = enregistrement = obligation de consentement explicite des 2 parties (closer + prospect). RGPD strict.
- **Coût transcription** : Whisper 0.006 $/min, pour 10 closers × 20 meets × 30 min = 36 $/mois. Acceptable mais à monitorer.
- **Critique mal calibrée** : un feedback trop dur démotive le closer. Mitigation : skill `feedback-constructif` qui définit le ton.

## Skills nécessaires
- `.claude/skills/google-calendar-api/` (à créer V2)
- `.claude/skills/whisper-transcription/` (à créer V3)
- `.claude/skills/coaching-feedback-constructif/` (à créer V3)

## Agents owner
- Lead : `integrations` (calendrier, transcription), `anthropic-gateway` (briefing, critique)
- Support : `frontend-react` (UI coaching), `gardien-valeurs` (calibration feedback)
