# Matériau prêt à consigner — sessions 38 et 39

> **À faire par `archiviste-memoire`, pas par un autre agent.** Les registres `.claude/memory/` sont
> append-only et lui sont réservés. Cowork ne charge pas les agents projet, donc ce fichier tient lieu de
> brouillon vérifié : l'archiviste n'a qu'à le recopier dans les bons registres, puis à supprimer ce fichier.
>
> Cibles : `JOURNAL.md` (une entrée), `LEARNINGS.md` (LEARNING-103 à 107), `DECISIONS.md` (ADR-043 à 046).

---

## 1 — Entrée pour `JOURNAL.md`

## 2026-08-09/10 — Sessions 38 et 39 — Refonte du système de design TUC, atmosphère, violet promu pilier

- **Objectif initial** : refondre le système visuel de TUC sur la charte réelle de la marque, corriger les
  contrastes, et livrer un thème double clair/sombre cohérent avec le référentiel `ux-ui-nacer`.

- **Ce qui a été fait** :
  1. **Jetons refondus** (`src/index.css`, `tailwind.config.ts`) depuis la palette réellement employée dans
     le pitch deck Prix Président v9 — et non depuis une palette inventée.
  2. **Trois rôles chromatiques établis** : l'or est l'action et **n'écrit jamais sur le crème** (1,50:1) ;
     le malachite est l'institution ; **le violet est le volet technologique**, avec son échelle complète
     `--tech` / `-strong` / `-soft` / `-line` / `-foreground`.
  3. **Rampe continue vert → violet → vin** : `#0E4E40 · #2F7569 · #2C1654 · #7C3AAD · #7A2F73 · #86304F ·
     #7B2D26`. Le bordeaux n'est plus isolé, c'est le violet réchauffé. Les 7 stades du pipeline la
     parcourent ; seul « payé » en sort, pour l'or.
  4. **Atmosphère** (`src/components/AtmosphereBackground.tsx`) : marbre malachite veiné d'or en clair,
     nuage violet sur socle malachite en sombre. Couche fixe, `aria-hidden`, intensité au tiers derrière
     `/admin`, `/closer`, `/dashboard`, `/leads`. `html` porte le fond, `body` est transparent.
  5. **Thème sombre en malachite profond saturé** (`167 69% 6%`), plus jamais un gris neutre.
  6. **Deux bugs structurels trouvés à l'écran, pas dans le code** : `bg-gradient-cosmic` ne produisait aucun
     CSS (dégradés déclarés en variables mais absents de `tailwind.config`) — la section d'appel à l'action
     était donc transparente ; et le pied de page tournait au registre cosmique de LULG (fond violet-noir,
     treize étoiles animées, constellation SVG), remplacé par malachite → noir + veine kintsugi.
  7. **Trois aperçus HTML autonomes** dans `docs/brand/` : `apercu-theme.html`, `apercu-matieres.html`
     (trois typographies permutables), `apercu-or-perception.html` (ratios calculés en direct dans la page).
  8. **`.claude` sorti de Git** (commit `8e3a8fe` poussé par Nacer), deux sauvegardes hors dépôt préalables.
  9. **Session 39** : bac à sable rétabli, aperçus commités (`291bb21`), diagnostic Vercel repris et corrigé.

- **Vérification règle d'or** :
  - Contrastes recalculés et corrigés à chaque étape ; tous les couples passent AA dans les deux thèmes.
  - Rendu vérifié à l'écran, pas seulement au diff — c'est ce qui a révélé les deux bugs structurels.
  - ⚠️ **`npm run verify` n'a pas été passé** : le bac à sable Linux est tombé en session 38, et
    `npm install` y est proscrit (LEARNING-099). À passer côté poste avant toute mise en ligne.

- **Blocages rencontrés** :
  - **Push impossible depuis Cowork** : le bac à sable n'a aucune identité GitHub. 6 commits restent locaux.
    Le push doit être fait depuis le poste de Nacer.
  - **Diagnostic Vercel erroné en session 38** : l'alias avait été déclaré épinglé sur juin. Vérification en
    session 39 : le domaine sert bien le build récent. Voir LEARNING-103.
  - **Deux décisions de Nacer restent ouvertes** : typographie (A/B/C) et texture de la pierre.

- **Apprentissages** : LEARNING-103 à 107 (voir plus bas).

- **Décisions actées** : ADR-043 à 046 (voir plus bas).

- **Rituel de fermeture (3 questions)** :
  - **Décidé** : le violet devient un pilier structurel et non une exception ; la couleur du pipeline suit une
    rampe continue plutôt que sept teintes indépendantes ; l'atmosphère devient une couche à part entière.
  - **Appris** : trois propositions successives jugées « moche » par Nacer, toutes issues de la même faute —
    concevoir depuis mon goût plutôt que depuis ses références validées.
  - **Dérivé** : la boucle de validation la plus courte est un fichier HTML autonome, pas une description.

- **Prochaine étape** : push depuis le poste, `npm run verify`, puis décisions typographie et texture.

---

## 2 — Entrées pour `LEARNINGS.md`

## LEARNING-103 — « Latest » et « Current » sont deux choses distinctes sur Vercel
- Date : 2026-08-09
- Domaine : transverse (déploiement, diagnostic)
- Issu de : faux diagnostic d'alias épinglé, sessions 38 et 39
- **Observation** : un déploiement en état `READY` ne prouve pas que le domaine le sert. En session 38 j'ai
  d'abord conclu que le nouveau Kanban était en ligne parce que `latestDeployment` était `READY` — c'est
  Nacer qui a repéré l'erreur en regardant le tableau Vercel. Puis j'ai conclu l'inverse, que l'alias était
  figé sur juin, alors qu'une promotion avait eu lieu entre-temps. Deux erreurs opposées, même cause : avoir
  lu l'état du déploiement au lieu du contenu servi.
- **Règle à appliquer** : ne jamais conclure sur l'état de la production depuis l'API des déploiements.
  Le seul contrôle fiable est de **récupérer ce que le domaine renvoie réellement** et de comparer un
  marqueur discriminant — empreinte de bundle, bloc JSON-LD, chaîne présente uniquement dans le nouveau build.
- **Corollaire** : `"live": false` sur un projet Vercel n'implique pas que le domaine ne sert rien.

## LEARNING-104 — Ne jamais inverser un jeton employé des centaines de fois
- Date : 2026-08-09
- Domaine : frontend (design system, refactoring)
- Issu de : inversion `--primary` / `--secondary`, session 38
- **Observation** : l'inversion des deux jetons a repeint environ 600 usages en aveugle — noms en or
  illisible, avatars violets, cartes gris-lavande. Le but recherché était de corriger un défaut de
  lisibilité sur quelques surfaces.
- **Règle à appliquer** : un défaut de lisibilité se corrige **au jeton concerné**, en ajustant sa valeur, et
  jamais en échangeant les rôles de deux jetons. Un jeton est un contrat sémantique : `--primary` désigne
  l'action principale, pas une couleur. Changer sa couleur est local ; changer son sens est global.
- **Signal d'alerte** : si un changement d'une ligne touche plus de cent usages, ce n'est pas un ajustement,
  c'est une migration — elle demande un inventaire préalable.

## LEARNING-105 — Regarder le rendu, pas le diff
- Date : 2026-08-09
- Domaine : frontend (revue visuelle)
- Issu de : deux bugs structurels trouvés à l'écran, session 38
- **Observation** : `bg-gradient-cosmic` ne produisait aucun CSS — les dégradés étaient définis en variables
  mais jamais déclarés dans `tailwind.config`. La section d'appel à l'action était donc simplement
  transparente. Le diff, lui, était impeccable. De même, le pied de page servait le registre visuel de LULG
  depuis un temps indéterminé sans qu'aucune relecture de code ne le signale.
- **Règle à appliquer** : toute modification visuelle se valide à l'écran. Une classe morte, un aplat délavé
  ou un faux métal ne se voient pas dans un diff. Ajouter une capture ou un aperçu autonome à la revue.
- **Corollaire** : rejoint LEARNING-098 — l'observation directe bat le raisonnement sur le code.

## LEARNING-106 — Concevoir depuis les références validées, pas depuis son goût
- Date : 2026-08-10
- Domaine : design (méthode)
- Issu de : trois propositions successives rejetées par Nacer, session 38
- **Observation** : l'or « métallique » à neuf arrêts imitant du métal poli était une invention pure. Les deux
  sources réelles de Nacer — le pitch deck Prix Président et le bouton « Candidater » de PERCEPTION —
  utilisent un aplat ou un dégradé à **deux** arrêts. Relecture ligne à ligne de `sanctuaire.css` : sur toute
  la page, l'or n'existe que sous trois formes — un filet dilué, du texte, un seul bouton. Le fond des cartes
  est du blanc à 4,5 %, pas de l'or.
- **Règle à appliquer** : avant toute proposition visuelle, relever la règle **dans les sources validées** et
  la citer. Si aucune source ne couvre le cas, le dire et demander une référence plutôt que d'inventer.
- **Corollaire** : une règle relevée sur un fond ne se copie pas, elle se transpose. Les trois ors de
  PERCEPTION se lisent sur nuit profond `#041914` ; sur le crème de TUC ils tombent tous sous le seuil, et
  c'est le malachite qui doit écrire.

## LEARNING-107 — Livrer un fichier HTML autonome à chaque changement visuel
- Date : 2026-08-10
- Domaine : design (boucle de validation)
- Issu de : demande explicite de Nacer, session 38
- **Observation** : décrire une intention visuelle en prose produit des allers-retours coûteux. Un fichier
  HTML autonome — sans build, sans dépendance, ouvrable d'un double-clic — permet à Nacer de trancher en
  quelques secondes, et de permuter les variantes lui-même.
- **Règle à appliquer** : tout changement visuel s'accompagne d'un aperçu autonome dans `docs/brand/`, avec
  les variantes permutables par bouton quand une décision est attendue.

---

## 3 — Entrées pour `DECISIONS.md`

### ADR-043 — Le violet est le pilier technologique, pas une exception
- **Statut** : acceptée — 2026-08-09
- **Contexte** : le violet n'existait que sous forme d'accent ponctuel, sans échelle, et le référentiel
  `ux-ui-nacer` allait jusqu'à qualifier le violet atmosphérique de faute dans TUC. Or TUC est une agence de
  closing **augmentée par IA** : le volet technologique est constitutif de l'offre, pas décoratif.
- **Décision** : le violet devient le troisième rôle chromatique, à parité avec l'or (l'action) et le
  malachite (l'institution). Il reçoit une échelle complète — `--tech`, `--tech-strong`, `--tech-soft`,
  `--tech-line`, `--tech-foreground` — et signale partout ce qui relève de l'IA.
- **Conséquences** : `#A855F7` tombe à 2,43:1 sur malachite et est donc inutilisable tel quel — éclairci à
  `#C79BFA` (268 88% 80%) sur surfaces sombres, assombri à 271 70% 42% sur crème. Le référentiel
  `ux-ui-nacer` doit être amendé sur le point « violet atmosphérique = faute ».

### ADR-044 — Le pipeline suit une rampe chromatique continue, pas sept teintes indépendantes
- **Statut** : acceptée — 2026-08-09
- **Contexte** : les sept stades du pipeline portaient des couleurs choisies une à une, dont un bordeaux
  isolé sans parenté avec le reste. Rien ne disait visuellement qu'un stade en précède un autre.
- **Décision** : une rampe continue vert → violet → vin traverse les sept stades :
  `#0E4E40 · #2F7569 · #2C1654 · #7C3AAD · #7A2F73 · #86304F · #7B2D26`. Le bordeaux n'est plus un cas à
  part, c'est le violet réchauffé. Seul le stade « payé » sort de la rampe, pour l'or.
- **Conséquences** : la progression d'une affaire devient lisible d'un coup d'œil. L'or retrouve sa fonction
  exclusive — l'aboutissement — et cesse d'être une couleur parmi d'autres.

### ADR-045 — L'atmosphère est une couche à part entière
- **Statut** : acceptée — 2026-08-09
- **Contexte** : le fond était un aplat, et les tentatives d'y mettre de la matière passaient par des
  dégradés posés sur des composants — donc dupliqués, incohérents et coûteux à maintenir.
- **Décision** : un composant dédié `AtmosphereBackground.tsx` porte une couche fixe et `aria-hidden` :
  marbre malachite veiné d'or en clair, nuage violet sur socle malachite en sombre. Son intensité tombe au
  tiers derrière les surfaces de travail — `/admin`, `/closer`, `/dashboard`, `/leads`. `html` porte le fond,
  `body` reste transparent.
- **Conséquences** : la matière est définie en un seul endroit. Contrepartie assumée : une couche fixe de
  plus au rendu, et l'obligation de vérifier les contrastes **au-dessus de l'atmosphère**, pas sur l'aplat.

### ADR-046 — Échelle d'angles 2 / 6 / 10 px
- **Statut** : proposée — en attente de validation à l'écran par Nacer
- **Contexte** : le référentiel `ux-ui-nacer` fixe le rayon TUC à 12 px, valeur héritée et jamais interrogée.
  L'arête taillée du bouton « Candidater » de PERCEPTION est nettement plus franche.
- **Décision proposée** : trois valeurs seulement — 2 px pour les éléments denses, 6 px pour les contrôles,
  10 px pour les cartes et surfaces.
- **Conséquences** : le référentiel `ux-ui-nacer` doit être amendé si la proposition est retenue. À trancher
  en même temps que la typographie, sur l'aperçu autonome.

---

## 4 — Décisions de Nacer encore ouvertes au moment d'écrire

1. **Typographie** — A (Fraunces · Inter · JetBrains Mono), B (Instrument Serif · IBM Plex Sans · IBM Plex
   Mono, recommandée pour sa couverture de l'arabe), ou C (Playfair Display · Inter, l'actuelle).
   Permutables dans `docs/brand/apercu-matieres.html`. Si A ou B est retenue, `ux-ui-nacer` doit être amendé :
   il classe aujourd'hui Playfair en marqueur d'identité obligatoire.
2. **Texture de la pierre** — Nacer a demandé à montrer d'abord une référence qui lui plaît. Ne rien
   reproposer sans elle (LEARNING-106).

> **Mise à jour, suite de session 39 (même journée, 2026-08-10, deuxième moitié)** — Nacer a fourni ses
> références (vidéo de malachite fibreuse, puis deux images de velours texture, puis deux photos réelles
> de marbre veiné d'or). Le point 2 ci-dessus est donc désormais couvert, mais a fait émerger de nouvelles
> réserves. Voir sections 5 à 8 plus bas pour tout le matériau de cette suite de session, à consigner par
> le même archiviste dans les mêmes registres.

---

## 5 — Entrée pour `JOURNAL.md` — suite de session 39, même journée

### 2026-08-10 (suite) — Session 39 (2e moitié) — Vraie matière, bouton PERCEPTION exact, charte consolidée

- **Objectif initial** : Nacer avait demandé une référence de matière avant toute nouvelle proposition
  (LEARNING-106). Cette suite de session couvre sa réponse, jusqu'à la consolidation d'une charte graphique
  complète et la création de la tâche de rebranding du site.

- **Ce qui a été fait** :
  1. **Vidéo de malachite fibreuse mesurée** — 14 449 pixels échantillonnés sur 8 images extraites,
     teinte bornée à 138-180°. Deux écarts trouvés avec la proposition CSS initiale : la structure réelle
     est une gerbe de faisceaux radiants (pas une bande à 135°), et la saturation s'effondre dans les
     hautes lumières (16 % sur le lustre contre 84 % proposé) — la chatoyance d'une pierre fibreuse est une
     soie, pas un néon.
  2. **Nacer a fourni une image alternative** (velours teal, un flux plutôt qu'un minéral) en disant que la
     proposition précédente était « moche » — la vidéo mesurée a donc été abandonnée au profit de l'image
     réelle. Rappel LEARNING-105/106 : le rendu prime, la mesure prime sur l'invention, mais les deux
     s'effacent devant une préférence explicite de Nacer.
  3. **Jumelle violette fournie** — même geste que le teal (même remous, même poussière, même fond noir).
     Adoptée comme matière du pilier technologique, à parité avec le teal pour le métier.
  4. **Bouton PERCEPTION corrigé à l'identique** — le bouton précédemment proposé (pilule à 99px, Inter 600,
     sans ombre) ne correspondait à aucune valeur de `sanctuaire.css`. Corrigé : rayon 2px, dégradé 140°
     `or-vif → or`, texte `--nuit`, Inter 500 à `.22em` en majuscules, ombre dorée avec transition à 0,9s.
     Un seul bouton, partout, dans les deux thèmes et sur toutes les matières — règle explicitement reconduite
     depuis PERCEPTION.
  5. **Nouveau jeton `--or-sombre` (`#7A6119`)** — l'or qui écrit change de teinte selon le fond (clair ou
     sombre), jamais de rôle. Corrige un oubli : la règle existait déjà dans `apercu-or-perception.html`
     mais n'était pas encore appliquée partout dans les nouveaux aperçus.
  6. **Cartes rééquilibrées, puis reprises une deuxième fois** — première passe : carte violette assombrie
     en clair (94→89 %), carte violette teintée mais plus sombre en thème sombre. Nacer a demandé mieux :
     en thème sombre, la carte doit être une **surface claire** (vert très clair à bordure dorée, ou crème
     à bordure violette), jamais une variante sombre du violet. Les deux habillages sont livrés en bascule,
     non tranchés.
  7. **Fêlure kintsugi retirée** — remplacée par un filet droit et dilué, repris à l'identique de `.rule`
     dans `sanctuaire.css` (`height:1px; background:rgba(201,157,53,.22)`).
  8. **Deux vraies photos de marbre intégrées** — remplacent le SVG à turbulence de l'ADR-045, jamais
     satisfaisant. Le vert mesure 156° de teinte (onze degrés du malachite de la marque, un écart plus
     serré que celui déjà accepté sur le velours) et n'a besoin d'aucune retouche. Le crème sortait à 20°,
     en zone rose hors charte — un filtre sélectif (hue-shift des pixels roses vers l'or, désaturation
     partielle, sans toucher au vert ni au dessin des veines) l'a ramené à 29°, hors zone rose.
  9. **Charte graphique consolidée rédigée et enregistrée** dans
     `D:\Startup LABEL\Startup The Ultimate Closers Agency Closing\Branding The Ultimate Closers\`
     (`TUC — Charte Graphique (session 39, 2026-08-10).md`). Trois statuts utilisés partout : ACTÉ / RÉSERVE
     / PROPOSITION.
  10. **Proposition de personnalité de marque** — « Psychologue de la vente » — construite non pas comme
      une invention, mais comme la formalisation visuelle d'un élément déjà présent dans
      `TUC_BP2026_v7_FINAL.docx` (§3.5, Barrière #1) : la charte de closing éthique fondée sur cinq valeurs
      coraniques (Rahma, Ikhlass, Adab, Sabr, Tawakkul), mises en regard de la thérapie d'acceptation et
      d'engagement (ACT) que Nacer pratique réellement. La signature officielle du business plan
      (*« La vente n'est pas un rapport de force. C'est un alignement. »*, §3.6) est proposée comme
      équivalent TUC de la signature « Wisdom in sales, light in growth » de PERCEPTION.
  11. **Tâche T29 créée** dans `taches-a-faire/` — rebranding complet du site sur la nouvelle charte,
      avec quatre blocages explicites à lever avant de démarrer (typographie, cartes sombres, teinte du
      velours violet, confirmation finale du marbre crème).

- **Vérification règle d'or** :
  - Chaque valeur de couleur du bouton et des ors vérifiée ligne à ligne contre `sanctuaire.css`, pas
    approximée.
  - Chaque affirmation sur les images fournies (teintes, saturations, clartés) calculée par script Python
    sur les pixels réels, jamais estimée à l'œil.
  - ⚠️ Aucun test `npm run verify` — cette suite de session reste entièrement au niveau des aperçus HTML et
    de la documentation, aucun code de production touché. Le bac à sable est resté fonctionnel tout du long
    (contrairement à la première moitié de la session).

- **Blocages rencontrés** : aucun technique. Trois décisions de Nacer restent ouvertes (typographie —
  nouvelle direction demandée mais aucun aperçu produit ; cartes sombres ; teinte du velours violet) plus
  une confirmation en attente (le filtre du marbre crème suffit-il).

- **Apprentissages** : LEARNING-108 à 110 (voir plus bas).

- **Décisions actées** : ADR-047 à 049 (voir plus bas). Pas d'ADR pour la proposition de personnalité de
  marque — elle reste une proposition, pas une décision, tant qu'aucun aperçu n'a été validé à l'écran.

- **Rituel de fermeture (3 questions)** :
  - **Décidé** : le bouton PERCEPTION est la référence unique et non négociable de toute action primaire
    sur le site ; l'or qui écrit change de teinte selon le fond, jamais de rôle ; l'atmosphère utilise de
    vraies photographies, plus de texture procédurale.
  - **Appris** : une mesure précise (la vidéo de malachite) peut être juste et quand même écartée — la
    préférence explicite de la personne prime sur l'exactitude de la mesure, qui ne sert qu'à objectiver le
    choix une fois qu'il est fait.
  - **Dérivé** : consolider en un seul document, à intervalles réguliers, évite que les décisions actées
    se diluent entre plusieurs aperçus HTML successifs — la charte de cette session en est le premier
    exemple, et devrait devenir une pratique récurrente plutôt qu'un one-off.

- **Prochaine étape** : trancher les quatre réserves de la charte (section 5), produire la planche
  typographique D (Cormorant Garamond · Lora · Inter), puis démarrer T29.

---

## 6 — Entrées pour `LEARNINGS.md` — suite

## LEARNING-108 — Une mesure exacte peut être écartée par une préférence explicite, et c'est normal
- Date : 2026-08-10
- Domaine : design (méthode)
- Issu de : la vidéo de malachite mesurée avec précision, puis abandonnée au profit d'une image différente
- **Observation** : 14 449 pixels échantillonnés, teinte et saturation calculées avec rigueur, une
  proposition CSS corrigée en conséquence — puis Nacer a préféré une matière entièrement différente (un
  velours-flux plutôt qu'un minéral fibreux), sans que la mesure précédente ait eu tort sur quoi que ce
  soit.
- **Règle à appliquer** : la mesure sert à objectiver une matière une fois choisie, pas à imposer un choix.
  Quand la personne exprime une préférence explicite qui contredit la référence mesurée, la préférence
  gagne — ce n'est pas un échec de la mesure, c'est son rôle qui change : elle passe de « quelle est la
  bonne matière » à « comment appliquer correctement celle qui a été choisie ».
- **Corollaire** : ne pas défendre une proposition mesurée face à un rejet explicite. Remesurer la nouvelle
  référence avec la même rigueur, sans commentaire sur la précédente.

## LEARNING-109 — Un jeton corrigé dans un aperçu doit être vérifié dans tous les aperçus suivants
- Date : 2026-08-10
- Domaine : frontend (design system, cohérence multi-fichiers)
- Issu de : `--or-sombre` défini dans `apercu-or-perception.html` mais absent des premières versions de
  `apercu-velours.html`
- **Observation** : la règle « l'or qui écrit s'assombrit sur fond clair » existait déjà et avait été
  validée dans un aperçu antérieur. Elle n'a pourtant pas été reportée automatiquement dans le nouvel
  aperçu construit ensuite — Nacer a dû la signaler une deuxième fois.
- **Règle à appliquer** : quand plusieurs aperçus HTML autonomes coexistent pour la même charte, une règle
  validée dans l'un doit être auditée contre tous les autres avant de les présenter, pas seulement
  appliquée au fichier en cours d'édition. Un aperçu autonome n'est autonome que dans son rendu, pas dans
  sa cohérence avec les fichiers voisins.

## LEARNING-110 — Une demande de personnalité de marque doit d'abord être cherchée dans les documents
  business existants avant d'être inventée
- Date : 2026-08-10
- Domaine : marque (positionnement, méthode)
- Issu de : la demande de Nacer d'ajouter « une touche unique avec la personnalité du Psychologue de la
  vente »
- **Observation** : une première intuition aurait consisté à inventer une bibliothèque de principes de
  vente générique. La lecture de `TUC_BP2026_v7_FINAL.docx` a révélé que ce positionnement — « expertise
  psychologique rare », charte fondée sur cinq valeurs coraniques nommées, signature officielle « la vente
  n'est pas un rapport de force, c'est un alignement » — existait déjà, documenté et validé au niveau
  business, jamais traduit visuellement.
- **Règle à appliquer** : avant de créer un élément de personnalité de marque, chercher d'abord s'il existe
  déjà dans les documents de fond de l'entité (business plan, chartes de valeurs, études de marché). La
  meilleure « touche unique » n'est souvent pas une invention mais une traduction visuelle de ce qui est
  déjà vrai et déjà écrit ailleurs.

---

## 7 — Entrées pour `DECISIONS.md` — suite

### ADR-047 — Le bouton PERCEPTION est la référence exacte et unique de toute action primaire
- **Statut** : acceptée — 2026-08-10
- **Contexte** : une première tentative de bouton doré (pilule à 99px, Inter 600 sans petites capitales,
  sans ombre) ne correspondait à aucune valeur du fichier source `sanctuaire.css` de PERCEPTION — une
  approximation, pas une reprise.
- **Décision** : le bouton `.btn-or` reprend `sanctuaire.css` à l'identique — rayon 2px, dégradé 140°
  `or-vif → or`, texte `--nuit` (`#062720`), Inter 500 à `.22em` en majuscules, ombre
  `0 8px 44px rgba(201,157,53,.22)`, transition `.9s cubic-bezier(.22,.61,.36,1)`. Un seul composant, pour
  toute action primaire, dans les deux thèmes et sur toutes les matières (velours, marbre).
- **Conséquences** : tout bouton doré existant ailleurs dans le code (s'il y en a) doit être audité et
  remplacé par ce composant unique lors de T29. Le rayon de 2px valide au passage le premier palier de
  l'échelle d'angles ADR-046 (encore en réserve pour les autres paliers).

### ADR-048 — L'or qui écrit change de teinte selon le fond, jamais de rôle
- **Statut** : acceptée — 2026-08-10
- **Contexte** : `--or-clair` (`#E3C477`), l'or qui écrit chez PERCEPTION, échoue le contraste sur fond
  clair. La règle de transposition existait déjà en principe (documentée dans
  `apercu-or-perception.html`) mais n'avait pas de jeton dédié ni d'application systématique.
- **Décision** : nouveau jeton `--or-sombre` (`#7A6119`). Partout où de l'or doit écrire : `--or-clair` sur
  fond sombre, `--or-sombre` sur fond clair. `--or` brut (`#C99D35`) ne sert jamais de texte, sur aucun
  fond — seulement des filets dilués, jamais un aplat de texte.
- **Conséquences** : tout texte doré actuellement en `--or` ou `--or-clair` sur un fond clair (crème,
  carte claire) doit migrer vers `--or-sombre` lors de T29.

### ADR-049 — L'atmosphère utilise des photographies réelles, plus de texture procédurale
- **Statut** : acceptée pour le vert — 2026-08-10 · en attente de confirmation finale pour le crème
- **Contexte** : l'ADR-045 (session 38) demandait un marbre malachite veiné d'or en thème clair. Le SVG à
  turbulence qui l'approximait n'a jamais été jugé satisfaisant (LEARNING-105 : une classe morte ou un
  dessin approximatif ne se voient qu'à l'écran).
- **Décision** : deux photographies réelles fournies par Nacer remplacent le SVG. Le vert (teinte mesurée
  156°, veines dorées à `#BCA77F`) est utilisable tel quel. Le crème, sorti à 20° de teinte en zone rose
  hors charte, a reçu un filtre sélectif (hue-shift des pixels roses vers l'or, désaturation partielle,
  sans toucher au vert ni au dessin des veines) — teinte finale mesurée à 29°.
- **Conséquences** : `AtmosphereBackground.tsx` doit être modifié lors de T29 pour utiliser ces fichiers
  (`docs/brand/marbre-vert.webp`, `marbre-creme.webp`) plutôt que le filtre SVG `feTurbulence` existant.
  Confirmation finale de Nacer encore attendue sur la version filtrée du crème — ne pas fermer cet ADR
  tant que cette confirmation n'est pas obtenue.

---

## 8 — Nouvelles décisions de Nacer encore ouvertes (état final de la session 39)

1. **Typographie** — nouvelle direction demandée : « classe, élégante, pro, comme PERCEPTION »
   (Cormorant Garamond · Lora · Inter). Aucun aperçu produit pour cette option. Les options A/B/C de la
   première moitié de session restent également non tranchées.
2. **Cartes en thème sombre** — vert très clair à bordure dorée, ou crème à bordure violette. Les deux
   habillages sont prêts et permutables dans `apercu-velours.html`, aucun choix fait.
3. **Teinte du velours violet** — recaler sur 268-271° (la marque) ou garder le natif ~245°, la même
   question que le teal (tranchée en faveur du natif à 175°) mais jamais posée pour le violet.
4. **Confirmation finale du marbre crème** — le filtre anti-rose appliqué suffit-il, ou faut-il pousser
   la correction plus loin ?
5. **Proposition de personnalité « Psychologue de la vente »** (section 7 de la charte) — jamais vue à
   l'écran, à maquetter avant toute implémentation.
