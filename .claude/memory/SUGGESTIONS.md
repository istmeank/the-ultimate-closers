# SUGGESTIONS.md — TUC tech (append-only)

> Registre des suggestions remontées par les agents vers l'orchestrateur.
> **Seul l'archiviste-memoire écrit ici.** L'auditeur-qualite récolte ce registre périodiquement et produit une synthèse. L'orchestrateur ne lit pas ce fichier directement — il reçoit la synthèse de l'auditeur.
>
> Pierre 19 du Squelette Silicate v0.6 — Agent souverain : droit de suggérer.

## Format d'une suggestion

```markdown
## SGT-XXX — [nom-agent] → [destinataire] — [date]
**Domaine concerné** : [mon pôle | autre pôle — lequel]
**Observation** : [ce que j'ai constaté dans mon travail]
**Suggestion** : [ce que je propose]
**Justification** : [pourquoi cela améliorerait la situation]
**Urgence** : [haute | normale | basse]
**Je n'applique pas** : cette suggestion attend validation de [orchestrateur | Nacer].
**Statut** : [en attente | évalué | adopté | écarté]
```

---

<!-- Première suggestion à ajouter ici -->

## SUGGESTION — 2026-07-25 — Mécanisme de propagation des leçons entre entités sœurs

**Émetteur** : archiviste-memoire (session 33)

**Constat** : LULG tech a résolu le problème des diffs CRLF massifs et l'a capitalisé en `LEARNING-004`. TUC tech a le même problème, non résolu, et 265 fichiers pollués (cf. BLOCKER-009). Les deux dépôts sont gouvernés par le même squelette Silicate, mais rien ne fait circuler une leçon de l'un vers l'autre.

**Suggestion** : ajouter au squelette Silicate un registre partagé au niveau de l'incubateur — par exemple `SILICATE INCUBATEUR/docs/LEARNINGS-RESEAU.md` — où remontent les leçons transverses, celles qui ne dépendent ni du langage ni du domaine (outillage Git, conventions de fins de ligne, pièges de gabarit shadcn, pratiques AEO). Chaque entité y puiserait à son bootstrap.

**Non appliquée** — relève d'une décision de Nacer sur le squelette Silicate, hors périmètre d'un dépôt.

---

## SUGGESTION — 2026-08-08 — Poids du bundle et de l'image de logo

**Émetteur** : session 34 (clôture T28), à partir de la sortie de `vite build`.

**Constat** :
- `dist/assets/index-*.js` — **1 466 Ko** (415 Ko compressés) en un seul fragment.
  Vite émet l'avertissement au-delà de 500 Ko.
- `dist/assets/logo-*.png` — **1 476 Ko**. Le logo pèse plus lourd que la totalité
  du code de l'application.

**Pourquoi cela compte ici plus qu'ailleurs** : le marché visé est l'Algérie et la
diaspora, souvent sur réseau mobile. Trois mégaoctets avant le premier affichage,
c'est plusieurs secondes d'écran blanc. Cela pèse aussi sur les Core Web Vitals,
donc sur le référencement — y compris sur le travail AEO de la session 33.

**Suggestion** :
1. Convertir le logo en WebP ou SVG, et le redimensionner à son usage réel. Un
   logo d'en-tête n'a aucune raison d'être servi en 1,5 Mo — gain attendu de plus
   de 95 % pour un rendu identique.
2. Découper le bundle : `manualChunks` pour isoler les dépendances lourdes
   (`recharts`, `@supabase/supabase-js`, Radix), et importer dynamiquement les
   routes d'administration et de tableau de bord, que les visiteurs publics ne
   chargent jamais.
3. Mesurer avant/après au Lighthouse pour disposer d'un point de comparaison.

**Le point 1 seul justifie déjà le déplacement** : c'est une compression d'image,
sans risque de régression.

**Urgence** : normale — aucune panne, mais dégradation directe de l'expérience et
du référencement.

**Non appliquée** — relève d'une tâche de backlog dédiée (candidate P7 Polish),
avec `frontend-react` en responsable.
**Statut** : en attente

---

## SUGGESTION — 2026-08-08 — Deux fichiers de types Supabase, un seul utilisé

**Émetteur** : session 34, lors de la mise à jour de l'enum `app_role`.

**Constat** : le dépôt contient deux fichiers de types générés —
`src/integrations/supabase/types.ts` (importé par le client, source de vérité) et
`src/lib/database.types.ts` (importé par **aucun** fichier). Le second contenait
encore l'enum à quatre valeurs, périmé depuis l'extension d'aujourd'hui.

**Pourquoi cela compte** : un fichier de types mort n'est pas neutre. Il est
plausible, il ressemble à la vérité, et rien n'indique qu'il ne l'est plus.
Quelqu'un finira par l'importer — c'est exactement le mécanisme qui a produit
BLOCKER-010.

**Suggestion** : supprimer `src/lib/database.types.ts` et son
`README.database-types.md`, ou, s'ils doivent rester, faire du second un simple
ré-export du premier afin qu'une seule définition existe.

**Non appliquée** — suppression de fichier, relève d'un arbitrage de Nacer.
Le fichier a été aligné dans l'intervalle pour qu'il ne mente plus.
**Statut** : en attente

---

## SUGGESTION — 2026-08-08 — Il manque un agent relais Silicate dans les entités incubées

**Émetteur** : session 34, à la demande de Nacer.
**Origine** : intuition de Nacer — « un agent Silicate est toujours sur chaque
dossier non ? il sert à mettre à jour la gouvernance de l'entité incubée pour
accueillir la prochaine mise à jour du squelette, car Silicate a besoin de
remontées pour améliorer la structure ».

**Constat** : cet agent n'existe pas. Les 17 fichiers de `.claude/agents/` sont
tous des agents métier ou techniques — aucun ne porte le relais vers SILICATE.

Le relais P16-B est **documenté** dans `orchestrateur.md` : sept étapes, six
marquées complètes, une cadence d'audit trimestriel annoncée pour Q3 2026. Mais un
tableau dans un fichier n'exécute rien, et personne ne le porte.

**Ce que le manque a déjà produit** :
- `FRICTIONS.md` et `SUGGESTIONS.md` accumulent des retours depuis la session 31.
  **Aucun n'a jamais été remonté vers SILICATE.** La suggestion de propagation des
  leçons entre entités sœurs (session 33) est toujours là, sans destinataire.
- Le squelette est passé de **v0.6 à v1.5** sans que TUC ne rende rien. L'incubée
  consomme les mises à jour, ne nourrit pas la matrice — alors que la boucle de
  retour est précisément ce qui doit faire progresser le squelette.
- LEARNING-087 avait déjà nommé le problème sous un autre angle : LULG avait résolu
  le blocage CRLF et capitalisé la leçon ; TUC l'a subi pendant des semaines sans
  en bénéficier. Deux dépôts, le même squelette, aucun canal entre eux.

**Suggestion** : un agent `relais-silicate`, présent dans chaque entité incubée,
avec deux missions symétriques :
1. **Descendante** — appliquer une nouvelle version du squelette : diagnostiquer
   l'écart entre la version en vigueur et la version courante publiée par
   SILICATE, proposer le plan de mise à niveau, l'exécuter après validation.
2. **Montante** — à cadence fixe, agréger `FRICTIONS.md` et `SUGGESTIONS.md` en un
   rapport destiné à SILICATE, en distinguant ce qui relève de l'entité de ce qui
   relève du squelette lui-même. C'est cette seconde mission qui manque le plus :
   sans elle, le squelette évolue à l'aveugle.

Cet agent serait aussi le seul habilité à toucher aux fichiers de gouvernance
d'une entité incubée — ce qui donnerait sa forme exécutable à la règle posée par
Nacer : « ce qui est à TUC est écrit par TUC au niveau technique, Silicate ne
touche que la gouvernance ».

**Non appliquée** — la création d'un agent relève de la gouvernance, donc du
périmètre SILICATE. Signalée ici pour remontée, conformément à la règle.
**Urgence** : normale — mais la boucle de retour est rompue depuis la session 31,
et chaque session qui passe l'allonge.
**Statut** : en attente
