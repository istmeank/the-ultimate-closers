# DOMAIN 02 — Messagerie Multi-canaux

## Mission
Envoyer le bon message, sur le bon canal, au bon moment, avec personnalisation IA et respect du consentement.

## Entités principales
- `Conversation`
- `Message`
- `Script` (généré par IA)
- `ChannelConfig` (config par canal et par closer)
- `OptInLog` (trace de consentement RGPD)

## État actuel
- **Code existant** : aucun composant messagerie identifié. Présence de `DziriBERTSuggestions.tsx` (suggestions de texte en darija) et `useDziriBERT.tsx`.
- **Migrations existantes** : aucune table messagerie identifiée — tout est à créer.
- **Manquant** : intégrations WhatsApp Business, Telegram, Messenger, Instagram. Générateur de scripts IA. Pipeline d'envoi avec rate limiting et retry.

## Backlog priorisé
1. **(V1 cadrage)** ADR compliance multi-canaux : opt-in, RGPD, conformité Meta/WhatsApp Business policies
2. **(V2)** Modélisation entités + migration (`conversations`, `messages`, `channel_configs`, `opt_in_logs`)
3. **(V2)** RLS strictes : un closer ne voit que ses conversations
4. **(V3)** Intégration WhatsApp Business API (canal prioritaire DZ — > 90 % d'ouverture)
5. **(V3)** Générateur de scripts IA (Anthropic SDK + skill `closer-voice-coran`)
6. **(V3)** Intégration Telegram Bot
7. **(V4)** Intégrations Messenger + Instagram via Meta Graph API
8. **(V4)** Pipeline d'envoi avec retry, rate limiting, fallback canaux

## Risques spécifiques
- **Suspension API Meta/WhatsApp** : non-conformité opt-in = ban. Mitigation : opt-in tracé en DB, validation juridique avant prod.
- **Spam** : sans rate limit, on devient un spammer. Mitigation : cap par closer + par prospect.
- **Coût IA** : 1 script par message = potentiellement explosif. Mitigation : cache des scripts générés + monitoring coût.
- **Dark patterns** : tentation de scripts manipulateurs. Mitigation : véto `gardien-valeurs` obligatoire sur tout template de script.

## Skills nécessaires
- `.claude/skills/whatsapp-business-api/` (à créer V3)
- `.claude/skills/anthropic-prompt-engineering/` (à créer V3)
- `.claude/skills/closer-voice-coran/` (à créer V3 — voix éthique TUC)
- `.claude/skills/meta-graph-api/` (à créer V4)

## Agents owner
- Lead : `integrations`, `anthropic-gateway`
- Support : `gardien-valeurs` (véto éthique sur scripts), `redacteur-voix` (templates), `backend-supabase` (pipeline)
