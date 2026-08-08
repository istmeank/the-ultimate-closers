# EVALS — Évaluations qualité

> Chaque fois qu'on teste la qualité d'une brique (IA, script, parcours, prompt, agent), on note ici le protocole et le résultat.
> But : ne jamais juger "à l'œil", toujours avoir une trace mesurable.

## Pourquoi ce registre
Sans évaluation, on ne sait pas si une nouvelle version est meilleure que l'ancienne. On régresse sans s'en rendre compte.

## Format d'une entrée

```
## EVAL-001 — Titre court
- Date : YYYY-MM-DD
- Composant testé : (ex. "générateur de script WhatsApp v2")
- Question posée : ce qu'on veut savoir
- Méthode : protocole d'évaluation (cas testés, critères, baseline)
- Résultat : chiffres, observations
- Décision : on adopte / on rejette / on itère
- Lien vers ADR : si la décision est structurante
```

---

<!-- Première évaluation à ajouter ici quand elle arrive -->

## EVAL-001 — Auto-évaluation de l'arborescence agentique TUC après Vague 2
- Date : 2026-06-08
- Output évalué : la structure `.claude/agents/` (9 agents) + `.claude/skills/` (5 skills custom) + `.claude/memory/` (6 registres + MEMORY.md sommaire) après création de la Vague 2 gouvernance.
- Méthode eval : **Cross-check humain** (relecture chacun des 9 agents pour vérifier conformité 3 critères Nacer + 4 piliers gouvernance) + **Confrontation réalité** (les agents ont-ils des skills bootstrap valides et chargeables ?) + **Test cohérence doctrine** (chaque agent respecte-t-il `contracts.md` et `valeurs-coran-bienveillance` ?).
- Anomalies détectées :
  1. **Faible — Skills bootstrap non encore validés en runtime** : on a référencé 27+ skills installés (Apollo, brand-voice, common-room, design, etc.) dans les frontmatter agents Vague 2, mais aucun agent n'a encore été invoqué en réel. Les références sont syntaxiquement correctes (vérifiées via list_skills), mais le comportement runtime reste à valider à la 1ère invocation.
  2. **Faible — Le rituel de fermeture n'était pas encore en place** : 13 sessions JOURNAL antérieures ont été tracées sans la 3e question "Dérivé". Ce gap est comblé à partir de cette session (la 14e).
  3. **Information — Aucune fausse promesse détectée** : les agents ne promettent rien qu'ils ne peuvent tenir (read-only pour gardien-valeurs + auditeur-qualite, escalades documentées partout).
- Cause probable : l'architecture a été construite progressivement en 13 sessions, avec des skills externes (plugins Anthropic) qui sont arrivés tard dans le process. Pas de drift temporel — tout reflète l'état au 2026-06-08.
- Action : 
  - [x] Keep — l'architecture est solide, conforme à la doctrine
  - [ ] Re-évaluer après les 3 premières invocations RÉELLES d'agents Vague 2 (frontend-react, redacteur-voix, gardien-valeurs)
  - [ ] EVAL-002 prévue : audit du comportement runtime des agents lors d'une vraie tâche produit
- Learning associé : LEARNING-024 déjà existant (rituel fermeture critique pour intégrité niveau 3).
