# CONTRACTS — Le contrat collectif de l'équipe d'agents TUC

> Fichier auto-chargé par l'orchestrateur au démarrage de toute mission multi-agents.
> Tous les agents doivent respecter ces contrats. Aucune exception sans ADR.

---

## 1. La chaîne de travail standard

```
Toi (Nacer)
  ↓ [demande]
orchestrateur (planifie, découpe, distribue)
  ↓ [délègue avec brief structuré]
spécialiste(s) (exécute en isolation, retourne RÉSULTAT)
  ↓ [livre les artefacts]
auditeur-qualite (revue read-only, applique règle d'or)
  ↓ [verdict : OK / ALERTES / BLOCAGE]
archiviste-memoire (trace ADR/BLOCKER/LEARNING/EVAL/JOURNAL)
  ↓ [confirme l'archivage à l'orchestrateur]
orchestrateur → Toi (récap + livrables + prochaine étape)
```

**Exceptions autorisées** :
- Question simple sans modification de code → orchestrateur peut répondre directement.
- Tâche < 15 min sans impact transverse → un spécialiste peut être appelé sans audit (mais l'archivage reste obligatoire).
- Urgence sécurité critique (faille active) → `auth-security-rls` peut shortcircuiter et alerter Nacer directement.

---

## 2. Autorités de domaine (qui valide quoi)

| Domaine technique | Autorité agent | Autorité finale humaine | Validation requise |
|---|---|---|---|
| Sécurité / RLS / Auth Supabase | `auth-security-rls` | Toi | Avant tout merge en `main` |
| Schéma DB / migrations / indexes | `database-postgres` | Toi | Avant tout `supabase db push` |
| Composants UI / pages React | `frontend-react` | Toi | Avant tout merge |
| Edge Functions / RPC Supabase | `backend-supabase` | Toi | Avant déploiement Edge Function |
| Intégrations tierces (HubSpot, GCal, WhatsApp…) | `integrations` | Toi + Dev partenaire si nouvelle API critique | Avant clé API en prod |
| Pipelines IA (Anthropic, DziriBERT, Proton ANK) | `anthropic-gateway` | Toi | Avant tout coût IA > 10 $/jour |
| Hébergement / CI/CD / DNS | `devops-vercel` | Toi | Avant toute modif DNS ou env var prod |
| Monitoring / logs / cache | `observabilite` | (autonome) | Audit hebdo |
| Spec produit / personas / user stories | `produit-spec` | Toi | Avant modif `docs/REFERENCE.md` |
| Contenu / scripts multi-canaux | `redacteur-voix` | Toi | Avant envoi à un prospect réel |
| Veille marché / concurrence | `veilleur` | (autonome — propose, ne décide pas) | — |
| Éthique / valeurs / anti-manipulation | `gardien-valeurs` | Toi (mais véto sur dark patterns) | Avant tout script ou flow user-facing |
| Décision architecturale structurante | `orchestrateur` | Toi (via ADR signé) | Avant implémentation |
| Cohérence registres mémoire | `archiviste-memoire` | (autonome) | — |
| Règle d'or / régression | `auditeur-qualite` | (autonome — BLOQUANT) | Avant clôture de chaîne |

**Règle d'or hiérarchique** : si un agent reçoit une instruction contraire à un ADR existant, il **doit refuser** et remonter à l'orchestrateur.

---

## 3. Format de sortie standard (obligatoire, jamais texte libre)

Chaque agent termine **systématiquement** sa réponse par ce bloc :

```
## RÉSULTAT
- Statut : SUCCÈS | ÉCHEC | PARTIEL | ESCALADE
- Livrable : [liste précise : fichiers créés/modifiés, décisions, verdict, données extraites]
- Vérification règle d'or : FAITE (détails) | NON-APPLICABLE | À FAIRE PAR auditeur-qualite
- Suggéré pour mémoire : [BLOCKER-XXX | LEARNING-XXX | EVAL-XXX | ADR-XXX | aucun]
- Prochain agent recommandé : [nom | "fin de chaîne" | "Toi (Nacer)"]
- Incertitudes : [liste de doutes ou "aucune"]
- Temps estimé restant : [si statut PARTIEL ou ESCALADE]
```

**Pourquoi ce format** : l'orchestrateur lit toujours le même format → pas d'ambiguïté, pas de re-parse, déléguer/chaîner devient mécanique.

---

## 4. Conditions de parallélisation

### Compatibles (peuvent travailler en même temps) ✅
- `frontend-react` + `database-postgres` (couches différentes, fichiers disjoints)
- `frontend-react` + `backend-supabase` (front vs Edge Functions)
- `veilleur` + n'importe quel agent (recherche pure, pas d'écriture sur le code)
- `auditeur-qualite` + `archiviste-memoire` (read sur src vs écriture mémoire — disjoint)
- `produit-spec` + `redacteur-voix` (PRD vs scripts — fichiers différents)
- `anthropic-gateway` + `frontend-react` (services IA vs UI)
- N'importe quel agent + `gardien-valeurs` (revue éthique = read-only)

### Mutuellement exclusifs (jamais en même temps) ❌
- `auth-security-rls` + `database-postgres` (touchent tous deux les migrations SQL)
- 2 agents codeurs sur le même fichier
- N'importe quel agent + `auditeur-qualite` **sur la même zone** auditée (l'audit doit se faire après stabilisation)
- 2 agents sur les fichiers `.claude/memory/*` simultanément (un seul archiviste)
- `orchestrateur` parallèle à lui-même (un seul plan à la fois)

### Règle de mutex
Avant de paralléliser, l'orchestrateur **liste les fichiers cibles de chaque agent**. Si intersection → séquentiel. Si disjoint → parallèle autorisé.

---

## 5. Principe de Progressive Disclosure (contexte minimal)

Chaque agent ne charge que :
1. Son propre `.md` (system prompt)
2. Les skills explicitement listés dans son frontmatter ou dans la mission
3. Les 3 docs obligatoires : `CLAUDE.md`, `docs/REFERENCE.md`, `docs/ARCHITECTURE.md`
4. Les registres mémoire pertinents pour sa mission (pas tous systématiquement)

**Interdit** : charger tout `.claude/` ou tout `docs/` "au cas où". Ça pollue le contexte et augmente les hallucinations.

---

## 6. Principe d'Isolate Context (pas de contamination)

- Chaque sub-agent tourne dans son propre contexte window (garanti par Claude Code).
- Un agent ne lit JAMAIS le contexte d'un autre agent en cours d'exécution.
- La seule communication inter-agents passe par : (a) les fichiers `.md` créés/modifiés, (b) le format `## RÉSULTAT`, (c) l'orchestrateur qui réinjecte ce qui est nécessaire.

---

## 7. Principe d'Escalation > Devinette

Chaque agent suit cette règle : **en cas d'incertitude > 30 %, ne pas deviner — escalader à l'orchestrateur** via Statut = `ESCALADE` + bloc `Incertitudes` rempli.

Exemples d'escalade obligatoire :
- Une instruction contredit un ADR.
- Une instruction touche un fichier hors du périmètre de l'agent.
- L'agent rencontre un fichier qu'il ne sait pas interpréter avec confiance.
- L'agent doit modifier `.env`, des secrets, ou un fichier dans `supabase/migrations/` sans avoir l'autorité (cf. §2).

---

## 8. Boucle mémoire (rappel)

À chaque fin de mission significative :
- Bug rencontré → `archiviste-memoire` écrit dans `BLOCKERS.md`
- Solution trouvée → `archiviste-memoire` écrit dans `LEARNINGS.md` + marque le BLOCKER résolu
- Décision structurelle → `archiviste-memoire` écrit dans `DECISIONS.md` (format ADR)
- Évaluation qualité → `archiviste-memoire` écrit dans `EVALS.md`
- Expérimentation produit → `archiviste-memoire` écrit dans `EXPERIMENTS.md` (et `reports/experiments/EXP-XXX.md` pour le détail)
- Fin de session → `archiviste-memoire` écrit dans `JOURNAL.md`

---

## 9. Versionning de ce contrat

Toute modification de ce fichier = nouvel ADR dans `DECISIONS.md`. On ne touche pas au contrat sans trace.

Version actuelle : **v1.0** (2026-06-07 — création initiale).
