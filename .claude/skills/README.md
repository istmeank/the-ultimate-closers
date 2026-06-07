# SKILLS — Catalogue d'expertises injectables

> Chaque skill = un dossier avec un `SKILL.md` à l'intérieur.
> Un skill est un **livre de connaissance** (passif, partageable), pas un exécutant.
> Les agents (`/.claude/agents/*.md`) consultent les skills pertinents au démarrage d'une mission.

## Convention de structure

```
.claude/skills/
├── README.md                            (ce fichier)
├── supabase-auth-rls/
│   └── SKILL.md                         (synthèse NotebookLM — Supabase Auth + RLS)
├── owasp-security/
│   └── SKILL.md                         (synthèse NotebookLM — OWASP Top 10 2024)
├── postgresql-supabase/
│   └── SKILL.md                         (synthèse NotebookLM — Postgres + Supabase DB)
└── ...
```

## Skills planifiés (par vague)

### Vague 1 — Sécurité (sources NotebookLM en attente de Nacer)
- [x] `supabase-auth-rls/SKILL.md`
- [x] `owasp-saas-supabase/SKILL.md` (renommé pour couvrir OWASP + SaaS B2B + React)
- [x] `postgresql-supabase/SKILL.md`

### Vague 2 — Continuité produit
- [ ] `react-shadcn-patterns/SKILL.md`
- [ ] `supabase-edge-functions/SKILL.md`
- [ ] `google-calendar-api/SKILL.md`

### Vague 3 — IA cœur métier
- [ ] `anthropic-prompt-engineering/SKILL.md`
- [ ] `whatsapp-business-api/SKILL.md`
- [ ] `closer-voice-coran/SKILL.md` (spécifique TUC — voix éthique)
- [ ] `big-five-personality/SKILL.md`
- [ ] `dziribert-nlp/SKILL.md`
- [ ] `whisper-transcription/SKILL.md`
- [ ] `coaching-feedback-constructif/SKILL.md`

### Vague 4 — Scale & qualité
- [ ] `sentry-monitoring/SKILL.md`
- [ ] `upstash-redis-cache/SKILL.md`
- [ ] `vercel-deployment-strategies/SKILL.md`
- [ ] `meta-graph-api/SKILL.md`

## Différence avec un agent
- **Agent** = exécutant actif. Lit, écrit, agit. Frontmatter avec `tools`, `model`, etc.
- **Skill** = livre passif. Connaissance condensée. Pas de frontmatter `tools` (pas d'exécution).
