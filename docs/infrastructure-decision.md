# Infrastructure Decision — Matrice Managed Agents vs Local (P21)

> **Source squelette** : Silicate v0.6 — Pierre 21  
> **Référence externe** : @le_gouverneur_ia — *Matrice de Décision : Managed Agents vs Local* (2026-06-07)  
> **Appliqué à** : TUC tech (CRM)  
> **Date** : 2026-06-23 — Session 32  
> **ADR associé** : voir DECISIONS.md

---

## Principe

Managed Agents (cloud Anthropic) et Claude Code/local ne s'opposent pas — ils se **complètent**. Ce document fixe le verdict pour TUC tech, à réviser si les volumes ou les contraintes changent.

---

## Les 5 questions de gouvernance infrastructure

| # | Question | Réponse TUC tech | Verdict |
|---|---|---|---|
| **Q1 — Autonomie** | L'agent doit-il tourner sans supervision humaine ? | Partiellement — certaines tâches API (WhatsApp batch, scoring IA) pourraient tourner en arrière-plan | Managed **pertinent** pour ces cas |
| **Q2 — Accès local** *(bloquant si OUI)* | Besoin du filesystem / réseau privé / `.claude/` ? | **OUI** — hooks, mémoire Git, migrations SQL, `.env`, rules → tout est local | **Local obligatoire** pour la gouvernance |
| **Q3 — Maturité** | Tu as déjà CLAUDE.md + hooks + mémoire ? | **OUI** — structure complète installée (sessions 1-32) | Managed n'apporte rien de fondamental à la gouvernance |
| **Q4 — Coût** | Plus de 1 000 sessions/jour ? | Non — MVP < 50 sessions/jour | Coût Managed négligeable si choisi pour tâches autonomes |
| **Q5 — Compliance** *(bloquant si OUI)* | Données sensibles / prospects / RGPD ? | **OUI** — données prospects, transcriptions, scoring personnalité | **Local obligatoire** pour les données sensibles |

---

## Lecture de la matrice

- **Q2 = OUI (bloquant)** → Managed impossible pour la gouvernance et les données.
- **Q5 = OUI (bloquant)** → Managed impossible pour tout traitement de données prospects.
- **Q1 = partiellement OUI** → Managed pertinent uniquement pour les tâches autonomes **non sensibles** (ex : appels API publics, veille concurrentielle, notifications batch sans données prospects).

---

## Verdict TUC tech

```
LOCAL (principal) + Managed optionnel pour tâches API autonomes non sensibles
```

### Ce qui reste LOCAL (obligatoire)

| Domaine | Raison |
|---|---|
| Gouvernance (hooks, mémoire, rules) | Q2 bloquant — filesystem local requis |
| Auth / sécurité / RLS | Q5 bloquant — données sensibles |
| Données prospects (scoring, transcriptions) | Q5 bloquant — RGPD |
| Migrations SQL | Q2 bloquant — accès Supabase local |
| Matching IA prospect/closer | Q5 bloquant — personnalité = donnée sensible |

### Ce qui peut utiliser Managed (optionnel, futur)

| Tâche | Condition |
|---|---|
| Veille concurrentielle batch (agent veilleur) | Aucune donnée prospect — données publiques uniquement |
| Notifications de bienvenue génériques | Si contenu non personnalisé avec donnée sensible |
| Génération de scripts de closing génériques | Si input = persona anonymisée, pas prospect réel |

> **Règle** : avant tout déploiement Managed, reposer les 5 questions. Si Q2 ou Q5 → OUI → bloquer.

---

## Ce que Managed Agents n'a pas (à retenir)

- Pas de `CLAUDE.md` chargé automatiquement
- Pas de hooks déterministes (PreToolUse, Stop, etc.)
- Pas de `.claude/rules/` scoped
- Pas de `.claude/memory/` versionné par Git
- Pas d'accès au filesystem local ni au réseau privé Supabase

**Conséquence** : notre gouvernance Silicate (Pierres 1-23) est une infrastructure **locale**. Managed Agents ne la remplace pas.

---

## Checklist P21 (à reposer avant tout déploiement cloud)

- [ ] Les 5 questions posées pour le cas spécifique ?
- [ ] Q5 compliance vérifiée (données prospects / RGPD) ?
- [ ] Si Managed choisi : liste des fonctionnalités absentes documentée ?
- [ ] Coût estimé si > 50 sessions/jour ?
- [ ] ADR créé si décision structurante ?

---

## Références

- Squelette Silicate v0.6 — `skeleton-modules/05-performance.md` (Pierre 21)
- P14 (3 Paradigmes IA — TUC tech = Paradigme 3, local)
- P12 (test binaire Skill vs Agent)
- `docs/ARCHITECTURE.md` — domaines TUC tech
- `.claude/memory/DECISIONS.md` — ADR-032 (à créer si décision Managed adoptée)
