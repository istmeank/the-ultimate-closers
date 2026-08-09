# PLANIFICATION — TUC tech (tableau de bord courant)

> **Fichier ΔP3-bis** (squelette Silicate v1.5, module `02-memoire.md`). Mutable, contrairement aux registres
> `.claude/memory/` qui sont append-only. Lu au bootstrap **en dernier**, après `CLAUDE.md` → `JOURNAL.md` →
> `DECISIONS.md` → `LEARNINGS.md` — c'est lui qui donne le point de reprise exact, pas le JOURNAL entier.
> Purge : tous les ~5 sessions, "Récemment complété" est archivé dans `JOURNAL.md` et vidé ici.
> Le détail technique des tâches vit dans `taches-a-faire/README.md` et `docs/domains/*/PLAN.md` — ce fichier
> n'est PAS un troisième registre de tâches (P27), il pointe vers eux.

---

## Tâche en cours

*Aucune — session 37 clôturée le 2026-08-09.*

Deux modifications de code sont postérieures à la dernière chaîne `npm run verify` verte (correction de
`getCloserPipelineStats` et bascule du logo en WebP). **Relancer `npm run verify` avant tout commit.**

---

## Décisions attendues de Nacer

1. **BLOCKER-015 — définition d'« affaire active ».** Appliquée par défaut dans le code :
   `stage IN ('opportunite','programme','a_reprogrammer','a_relancer','close')`, et une affaire n'est comptée
   gagnée qu'au stade `paye`, pas `close`. À confirmer ou corriger.
2. **BLOCKER-011 — protection contre les mots de passe compromis.** Un clic dans Supabase → Authentication →
   Policies. C'est la seule alerte de sécurité qui subsiste sur le projet.
3. **BLOCKER-013 — suppression logique non garantie par la base.** Déclencheur en base, ou garantie par la
   couche services ?
4. **`src/assets/logo.png`** (1,4 Mo, plus importé) — conserver comme source haute définition ou archiver ?
   Et supprimer le fichier orphelin `src/assets/logo-512.png`, que le sandbox n'a pas pu effacer.

---

## Tâches à venir — par pôle

### Gouvernance / squelette (prio 0)
- Premier audit P25 complet à planifier — seuil largement dépassé (37 sessions, 42 ADR).
- Vérifier ¶P1 (sobriété `CLAUDE.md` < 200 lignes) à chaque ajout de section.

### Sécurité / infrastructure (prio 0)
- **BLOCKER-011** — protection mots de passe compromis désactivée — ouvert, un clic.
- **BLOCKER-013** — suppression logique non garantie — ouvert, différé.
- **BLOCKER-H10** — `rls_auto_enable` en SECURITY DEFINER — ouvert, différé M4.
- **19 vulnérabilités npm dont une critique** (relevées par `npm ci`, 2026-08-09). Session dédiée
  `devops-vercel`. **Ne pas lancer `npm audit fix --force`** : casse des versions majeures.

### Domaine 1 — Acquisition & Qualification (prio 1)
- **T04 à réconcilier** : la fiche est marquée ✅ en citant la migration `20251029123034`, introuvable dans le
  dépôt, tout comme la fonction `auto_assign_closer_to_lead`. Même symptôme que BLOCKER-012. Vérifier si le
  déclencheur existe réellement en base.
- T07 — le scoring `score-lead` reste 100 % déterministe, aucun appel à Claude. Or la température des cartes
  dérive désormais de `leads.score` : la qualité du barème devient visible à l'écran.

### Domaine 4 — Meet & Coaching (prio 1)
- T15 — Edge Function `create-google-event` (OAuth T13 fait, rien ne crée d'événement).
- T14 — OAuth Slack, partiel (UI présente, bouton non câblé).
- Skill `whisper-transcription` + agent `meet-coaching` (ADR-037).

### Domaine 2 — Messagerie multi-canaux (prio 2)
- Cadrage WhatsApp Business API officielle (T24, ADR-038).

### Domaine 3 — Matching IA (prio 2)
- Modélisation `CloserProfile` / `ProspectProfile` (T07 → T08).

### Domaine 5 — Onboarding closer (prio 2)
- Cadrage parcours 30/60/90 j.

### Polish / dette (non bloquant)
- Bundle JS à 1,47 Mo (417 ko gzip), au-dessus du seuil Vite de 500 ko. Moins urgent que le logo : il ne bloque
  pas le premier affichage.
- `src/lib/database.types.ts` — fichier de types mort, arbitrage Nacer.
- `src/pages/LeadDetailWithProtonANK.example.tsx` — dette tolérée par l'allowlist du garde-fou d'abstraction :
  à supprimer ou à porter.
- `LeadDetail.tsx` garde son ancien badge de score sans afficher qualification ni température, contrairement à
  `LeadCard.tsx`.

---

## Récemment complété

- **2026-08-09 (session 37)** — Refonte du kanban en **pipeline d'affaires**. ADR-040 (7 stades sur
  `deals.stage`), ADR-041 (`interactions.metadata`, le front formate selon le fuseau du lecteur), ADR-042
  (qualification humaine et température dérivée du score, portées par le prospect). Deux migrations
  **appliquées et vérifiées** sur `llxgyomevketvypusafl`. Dix fichiers front refondus. T05 livrée.
  `supabase/config.toml` corrigé — il pointait l'ancien projet Lovable. README débarrassé de tout l'héritage
  Lovable. Logo passé de 1441 ko à 55 ko en WebP. BLOCKER-014 clos (dépôt privé, vérifié dans Chrome).
- 2026-08-08 (session 36) — Relais squelette Silicate v1.5 (ADR-039) + `docs/GLOSSAIRE.md`.
- 2026-08-08 (session 35) — ADR-037 (meet-coaching) + ADR-038 (WhatsApp).
- 2026-08-08 (session 34) — T28 couche d'abstraction (ADR-025), modèle de rôles à 7 valeurs (ADR-036),
  BLOCKER-009, 010 et 012 résolus.

---

## Bookmark de reprise

**État vérifié au 2026-08-09 :**

| Objet | État |
|---|---|
| `deals.stage` | 7 valeurs en base — vérifié par lecture de la contrainte |
| `deals.previous_stage`, `amount_cents` nullable | en place — vérifié |
| `leads.qualification`, `leads.temperature_override` | en place — vérifié |
| `interactions.metadata` (jsonb, défaut `{}`) et type `note` | en place — vérifié |
| Triggers `trg_appointments_log_interaction`, `trg_deals_log_interaction` | présents — vérifié |
| `get_advisors` sécurité après migration | une seule alerte, `auth_leaked_password_protection` = BLOCKER-011. Aucune régression introduite |
| `npm run verify` | vert (85 tests) **avant** la correction de `getCloserPipelineStats` et la bascule du logo — à relancer |
| Git | 14 commits locaux + le travail de cette session, non poussés. Dépôt privé, la voie est libre |

**Prochaine étape** : relancer `npm run verify`, committer, pousser. Puis confirmer BLOCKER-015, et enchaîner
sur T15 (création d'événement Google Calendar) ou T07 (scoring par Claude — devenu visible à l'écran puisque
la température des cartes en dérive).
