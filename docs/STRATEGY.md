# STRATEGY — TUC

> Comment on gagne. 3-4 pages max.

## 1. Positionnement
**TUC est le seul CRM qui transforme chaque meet en cycle d'apprentissage du closer, en respectant le prospect comme une personne, pas comme un numéro.**

- Vs HubSpot/Pipedrive : CRM générique, pas de coaching closer intégré.
- Vs Gong/Chorus : outils de conversation intelligence, mais pas de pipeline ni de matching.
- Vs Calendly/Cal.com : juste planification, pas d'IA, pas de coaching.
- Vs agences de closing : on outille les agences, on ne les remplace pas.

**Notre unique slot** : CRM + Conversation Intelligence + Matching personnalité + Coaching IA, avec une éthique frontale.

## 2. Différenciateurs (les 4 piliers)

### Pilier 1 — Matching IA par personnalité
Ce qu'aucun concurrent ne fait. On profile le prospect (signaux conversationnels, ton, intérêts) ET le closer (test personnalité, historique de perf). On match par affinité, pas par round-robin.

### Pilier 2 — Multi-canal natif avec personnalisation
WhatsApp + Telegram + Messenger + Instagram + Email, gérés en un endroit, avec génération IA de scripts adaptés au prospect et au canal. Crucial sur le marché DZ où WhatsApp domine.

### Pilier 3 — Coaching IA intégré au CRM
Briefing pré-meet, transcription, critique constructive post-meet. Pas un outil externe à brancher : tout est dans la même expérience, le closer monte en compétence sans changer d'app.

### Pilier 4 — Éthique frontale (signature TUC)
Refus des dark patterns. Respect du prospect. Conformité Coran + RGPD. C'est notre marque, pas une option. Nacer = "le sage roi des nuages" — l'éthique est dans l'ADN, pas dans le marketing.

## 3. Go-To-Market (GTM)

### Phase 1 (M0-M6) — Marché test : Algérie + closers francophones DZ/diaspora
- Pourquoi : marché peu équipé en CRM intégré, fort usage WhatsApp, Nacer y a son réseau et ses valeurs y résonnent.
- Cible : closers indépendants haut de gamme (formateurs, coachs, agences premium).
- Acquisition : LinkedIn organique (Nacer), recommandations, content marketing (témoignages closers, études de cas).
- Pricing : 99 €/mois/closer (early adopters : 49 €/mois 6 mois).

### Phase 2 (M6-M12) — Élargissement diaspora francophone
- France, Belgique, Canada, Suisse.
- Ajout du palier "Équipe" (299 €/agence, jusqu'à 5 closers).
- Acquisition : partenariats formateurs, programme ambassadeurs.

### Phase 3 (M12+) — Multi-pays
- Internationalisation (anglais, espagnol).
- Adaptation aux régulations locales (RGPD-like).
- Acquisition : SEO, paid ads ciblés.

## 4. Stack et architecture (résumé)
- Frontend : React + Vite + TS + Tailwind + shadcn/ui (déjà en place).
- Backend : Supabase (PostgreSQL + Auth + Edge Functions + RLS).
- Hébergement : Vercel.
- IA : Anthropic API (Claude) + DziriBERT (NLP arabe/darija) + Proton ANK + Whisper (transcription).
- Messageries : WhatsApp Business API, Telegram Bot, Meta Graph (Messenger/Instagram).
- Détails techniques : `docs/ARCHITECTURE.md`.

## 5. Jalons stratégiques (les seuils qui débloquent la suite)

| Jalon | Critère de passage | Débloque |
|---|---|---|
| **MVP fonctionnel** | 5 closers utilisent activement TUC pendant 1 mois | Phase early adopters payants |
| **Product-market fit** | NPS ≥ 40 + 80 % rétention M2 | Acquisition agressive |
| **Scale-ready** | > 5k users actifs OU > 3 devs | Migration architecture modulaire |

## 6. Risques principaux et mitigation

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| **Compliance WhatsApp/Meta** (suspension API) | Élevée | Critique | Conformité stricte opt-in + diversification canaux (Telegram, Email) |
| **Coût IA explose** | Moyenne | Élevé | Plafond mensuel + monitoring par closer + cache des prompts |
| **Concurrent qui copie** (HubSpot ajoute du matching IA) | Moyenne | Moyen | Profondeur de la stack DZ + signature éthique non copiable |
| **Bug sécurité majeur** (fuite RLS) | Moyenne | Critique | Vague 1 sécurité prioritaire + audits réguliers + bug bounty futur |
| **Burn-out fondateur** (Nacer seul) | Élevée | Critique | Cadrage par dev partenaire + agents IA pour démultiplier |

## 7. Ce qu'on ne fait PAS (positionnement par soustraction)
- Pas de CRM généraliste (on reste closer-centric).
- Pas de marketplace de closers (on outille, on ne désintermédie pas).
- Pas de SaaS gratuit freemium (modèle pro premium).
- Pas d'expansion en marketing automation B2C (on reste sur le closing B2B haut de gamme).
