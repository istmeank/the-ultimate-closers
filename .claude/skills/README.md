# SKILLS — Catalogue d'expertises injectables TUC

> Chaque skill = un dossier avec un `SKILL.md` à l'intérieur.
> Un skill est un **livre de connaissance** passif, partageable entre agents.
> 17 skills livrés à ce jour (Vague 1 + 2 + 3 préparée).

## Skills livrés ✅

### Vague 1 — Sécurité (3 skills)
- [x] `supabase-auth-rls/` — RLS + JWT + RBAC + auth.uid wrapped
- [x] `owasp-saas-supabase/` — OWASP 2025 + multi-tenant + secrets + rate limit
- [x] `postgresql-supabase/` — schéma + migrations + indexes + perf

### Vague 2 — Codeurs frontend (2 skills)
- [x] `react-shadcn-design-system/` — React 19 + Vite + TS strict + Tailwind + shadcn (production-grade)
- [x] `react-forms-i18n-a11y/` — RHF + Zod + i18next FR/AR/Darija + WCAG 2.1 AA + ARIA

### Vague 2 — Codeurs backend (4 skills)
- [x] `supabase-edge-functions-deno/` — patterns Edge Functions Deno + CORS + RLS propagation + scheduled cron
- [x] `supabase-realtime-storage/` — Channels Broadcast/Presence/Postgres Changes + buckets + signed URLs
- [x] `secrets-vault-pgsodium/` — résout BLOCKER-001 (tokens OAuth chiffrés via Vault + TCE pgsodium AEAD)
- [x] `upstash-rate-limiting/` — résout BLOCKER H8/H9 (sliding window + Turnstile + 4 endpoints)

### Vague 2 — Codeurs intégrations (5 skills)
- [x] `oauth-2-pkce-refresh/` — OAuth 2.0 Authorization Code + PKCE + refresh rotation
- [x] `webhook-security-idempotency/` — HMAC + anti-replay + idempotency + DLQ
- [x] `google-slack-apis/` — Google Calendar v3 + Slack Block Kit + signing secrets
- [x] `whatsapp-business-cloud-api/` — Cloud API + templates + opt-in tracé + 24h window
- [x] `telegram-meta-graph-apis/` — Telegram Bot + Messenger + Instagram via Meta Graph
- [x] `hubspot-via-mcp/` — usage du MCP HubSpot natif (13 tools) + sync via external_sync_log

### Doctrine TUC (skill unique custom)
- [x] `valeurs-coran-bienveillance/` — la DOCTRINE éthique unique de TUC (5 vétos + 25 principes + grille anti-dark-patterns)

### Vague 3 — IA cœur métier (1 skill préparé)
- [x] `workload-management-matching/` — matching prospect/closer (WLM IBM + Twilio TaskRouter)

## Skills à créer plus tard (Vague 3-4)

- [ ] `anthropic-prompt-engineering/` — pour anthropic-gateway
- [ ] `dziribert-nlp/` — détection darija + sentiment
- [ ] `whisper-transcription/` — post-meet transcription
- [ ] `big-five-personality/` — modélisation personnalité closer/prospect
- [ ] `coaching-feedback-constructif/` — critique post-meet non punitive
- [ ] `closer-voice-coran/` — voix éthique pour scripts (extension valeurs-coran-bienveillance)
- [ ] `sentry-monitoring/` — observabilité
- [ ] `vercel-deployment-strategies/` — CI/CD avancé

## Différence agent / skill (rappel)

- **Agent** = exécutant ACTIF. Lit, écrit, agit. Frontmatter avec `tools`, `model`, etc.
- **Skill** = livre PASSIF. Connaissance condensée. Pas de frontmatter `tools` (pas d'exécution).

## Convention nommage

- Skill : kebab-case, scope explicite (ex: `react-shadcn-design-system`, pas `react`)
- Description "pushy" pour bien trigger (mots-clés concrets, triggers explicites)
- < 250 lignes idéal (Progressive Disclosure Anthropic)
