# PLANIFICATION — TUC tech (tableau de bord courant)

> **Fichier ΔP3-bis** (squelette Silicate v1.5, module `02-memoire.md`). Mutable, contrairement aux registres
> `.claude/memory/` qui sont append-only. Lu au bootstrap **en dernier**, après `CLAUDE.md` → `JOURNAL.md` →
> `DECISIONS.md` → `LEARNINGS.md` — c'est lui qui donne le point de reprise exact, pas le JOURNAL entier.
> Purge : tous les ~5 sessions, "Récemment complété" est archivé dans `JOURNAL.md` et vidé ici.
> Le détail technique des tâches vit dans `taches-a-faire/README.md` et `docs/domains/*/PLAN.md` — ce fichier
> n'est PAS un troisième registre de tâches (P27), il pointe vers eux.

---

## Tâche en cours

**Refonte visuelle TUC — session 39 clôturée, refonte toujours non terminée.** Sessions 38 (2026-08-09/10)
et 39 (2026-08-10), menées depuis Cowork. La session 39 a consolidé tout le travail visuel des deux
sessions dans une **charte graphique unique**, enregistrée hors du dépôt technique :

> `D:\Startup LABEL\Startup The Ultimate Closers Agency Closing\Branding The Ultimate Closers\`
> `TUC — Charte Graphique (session 39, 2026-08-10).md`

Elle statue chaque point en ACTÉ / RÉSERVE / PROPOSITION — c'est elle qu'il faut lire en premier à la
prochaine session de design, avant de rouvrir les aperçus HTML. **Rien n'est en ligne** : 7 commits sont
désormais locaux (voir « Première action »), et une tâche dédiée (**T29**, `taches-a-faire/`) porte
maintenant le rebranding complet du site — bloquée tant que les réserves de la charte ne sont pas
tranchées.

---

## 🔴 Première action de la prochaine session

### 1. Pousser les 6 commits locaux — c'est le seul vrai blocage

**Session 39 (2026-08-10)** : le bac à sable Linux est revenu, `git` refonctionne. Les deux aperçus HTML ont
été commités (`291bb21`). Mais **le push échoue depuis Cowork** — le bac à sable n'a aucune identité GitHub
(`could not read Username for 'https://github.com'`). Le push doit se faire **depuis le poste de Nacer** :

```
cd /d "D:\GitHub\the-ultimate-closers" && git push origin main
```

Tant que ce push n'est pas fait, **toute la refonte visuelle reste invisible en ligne** : Vercel n'a jamais
vu ces commits.

| Commit | Poussé ? | Contenu |
|---|---|---|
| `1c5ff3c` | ✅ | Design system sur charte ADR-012, pipeline grammaire Linear, double thème |
| `c974cab` | ✅ | Merge de la suppression `.claude` faite depuis GitHub |
| `79f4dd1` | ✅ | Application du référentiel `ux-ui-nacer` : sombre malachite saturé, violet IA, Playfair |
| `8bcb6d1` | ❌ | Charte passée sur tout le site (25 fichiers), deux bugs structurels corrigés |
| `530c60c` | ❌ | Brief Gemini pour un canevas alternatif |
| `b2dd40e` | ❌ | Violet promu accent structurel — le pilier technologique |
| `dfa6e3e` | ❌ | Atmosphère marbre/nuage + rampe vert→violet→vin |
| `a184000` | ❌ | Aperçu HTML autonome du thème |
| `291bb21` | ❌ | Aperçus matières + relevé de l'or PERCEPTION |
| *(à committer)* | ❌ | Suite de session 39 : bouton PERCEPTION exact, `--or-sombre`, cartes claires en
  thème sombre, marbre réel (vert + crème filtré), `taches-a-faire/T29-*`, `README.md` mis à jour |

**Rien de nouveau à documenter côté aperçus** : le contenu de la suite de session 39 vit dans
`docs/brand/apercu-velours.html` (déjà comptabilisé dans `291bb21`... non — voir note ci-dessous) et dans
la charte du dossier Branding. Le prochain commit doit inclure : `docs/brand/apercu-velours.html`,
`docs/brand/marbre-vert.webp`, `docs/brand/marbre-creme.webp`, `docs/brand/velours-violet.webp`,
`docs/brand/velours-nacre.webp`, `docs/brand/velours-fond.webp`, `docs/brand/velours-fond-167.webp`,
`docs/brand/apercu-hero-handshake.webp`, `taches-a-faire/T29-rebranding-site-nouvelle-charte.md`,
`taches-a-faire/README.md`, `taches-a-faire/registres-a-consigner-sessions-38-39.md`.

### 2. L'alias de production — apparemment résolu, à reconfirmer après le push

Contrairement au diagnostic de la session 38, **le domaine ne sert plus le déploiement de juin**.
`theultimateclosers.com` renvoie aujourd'hui le bloc JSON-LD/AEO, marqueur du build récent. Le dernier
déploiement `dpl_Cud6uxvYy1fgkUTQyQwJJ8K7NTno` (redéploiement du commit `79f4dd1`) porte un `updatedAt`
projet 29 s après sa création — signature d'une attribution d'alias. La promotion a donc eu lieu.

Le projet porte toujours `"live": false`, ce qui n'empêche pas le service du domaine. **Confirmation
définitive à faire après le push** : si le commit `291bb21` se retrouve en ligne sans intervention manuelle,
l'alias suit bien `main` et le sujet est clos.

> ⚠️ **Piège de diagnostic conservé** (LEARNING) : `latestDeployment` en état `READY` ne prouve pas que la
> production est à jour. « Latest » et « Current » sont deux choses distinctes. Le contrôle fiable est la
> comparaison du contenu réellement servi par le domaine, pas l'état du déploiement.

---

## Décisions attendues de Nacer

### Cinq réserves de la charte graphique — session 39, à trancher avant T29

Le détail complet de chaque réserve (avec valeurs mesurées) est dans la charte
(`TUC — Charte Graphique (session 39, 2026-08-10).md`, section 5). Résumé ici pour le point de reprise :

1. **Typographie — nouvelle direction demandée, aucun aperçu produit.** Nacer a demandé cette session une
   typo « classe, élégante, pro, comme PERCEPTION » : **Cormorant Garamond · Lora · Inter** — une 4ᵉ
   option (D), distincte des trois déjà proposées en session 38 dans `docs/brand/apercu-matieres.html` :
   - **A** Fraunces · Inter · JetBrains Mono
   - **B** Instrument Serif · IBM Plex Sans · IBM Plex Mono (couvre l'arabe, produit trilingue FR/EN/DZ)
   - **C** Playfair Display · Inter (l'actuelle)
   - **D** Cormorant Garamond · Lora · Inter ← **la demande de cette session, à produire dans l'aperçu
     avant de pouvoir comparer**
   ⚠️ Le référentiel `ux-ui-nacer` classe Playfair en « marqueur d'identité obligatoire ». Si Nacer choisit
   A, B ou D, **le skill doit être amendé**.

2. **Cartes en thème sombre — vert-doré ou crème-violet.** Les deux habillages sont prêts et permutables
   dans `docs/brand/apercu-velours.html`. Plus de carte violette sombre (rejetée à l'écran) : une carte est
   désormais toujours une surface claire, dans les deux thèmes.

3. **Teinte du velours violet — recaler sur 268-271° ou garder le natif ~245°.** Même question que le teal
   (tranché : natif à 175°, non recalé), jamais posée pour sa jumelle violette.

4. **Confirmation finale du marbre crème.** Un filtre anti-rose a été appliqué (hue-shift + désaturation
   sélective, teinte ramenée de 20° à 29°, hors zone rose). Une trace rose subsiste dans les creux profonds
   — suffisant, ou pousser plus loin ?

5. **Texture de la pierre — close par la fourniture des photos réelles.** Ancien point ouvert de la
   session 38 : Nacer a fourni la vidéo de malachite, puis les images de velours, puis les photos de
   marbre. Le velours et le marbre sont adoptés ; seule la question de teinte du violet (point 3) reste
   dérivée de ce sujet.

**Une fois ces quatre premières réserves tranchées** (la 5ᵉ est déjà résolue en pratique), amender
`ux-ui-nacer` sur les points déjà identifiés :
   - il dit « violet atmosphérique dans TUC = faute », or le violet est maintenant **l'atmosphère du thème
     sombre ET le champ des cartes claires** ;
   - le rayon TUC y est à 12 px, or l'échelle proposée est **2 / 6 / 10 px** — validée une première fois
     par le bouton PERCEPTION exact (2 px), reste à valider sur cartes et surfaces (ADR-046, réserve).

### Anciennes — toujours ouvertes

6. **BLOCKER-015 — définition d'« affaire active ».** Appliquée par défaut dans le code :
   `stage IN ('opportunite','programme','a_reprogrammer','a_relancer','close')`, et une affaire n'est comptée
   gagnée qu'au stade `paye`, pas `close`. À confirmer ou corriger.
7. **BLOCKER-011 — protection contre les mots de passe compromis.** Un clic dans Supabase → Authentication →
   Policies. Seule alerte de sécurité restante sur le projet.
8. **BLOCKER-013 — suppression logique non garantie par la base.** Déclencheur en base, ou garantie par la
   couche services ?
9. **`src/assets/logo.png`** (1,4 Mo, plus importé) — conserver comme source haute définition ou archiver ?

**BLOCKER-018 est clos** : Nacer a supprimé `.claude` de GitHub, le dépôt est repassé public, l'intégration
Git fonctionne. Le blocage restant est l'alias épinglé, pas le plan Vercel.

---

## Gouvernance — `.claude` hors de Git

`.claude/` est désormais **non suivi et ignoré** (`.gitignore`), conformément au commit `8e3a8fe` poussé par
Nacer. Les 53 fichiers restent sur le disque. Deux sauvegardes hors dépôt, faites avant toute manipulation :

- `D:\Startup LABEL\sauvegardes\tuc-tech-claude-2026-08-09\` — dossier lisible
- `D:\Startup LABEL\sauvegardes\tuc-tech-claude-memoire-2026-08-09.tar.gz` — archive

Sans le retrait du suivi, le prochain push aurait remis `.claude` en ligne.

---

## Ce qui a été construit en session 38

**Système de design** (`src/index.css`, `tailwind.config.ts`)
- Jetons refondus depuis la palette réellement employée dans le pitch deck Prix Président v9.
- Trois rôles chromatiques : l'or est l'action et **n'écrit jamais sur le crème** (1,50:1) ; le malachite est
  l'institution ; **le violet est le volet technologique — un pilier, pas une exception**, avec son échelle
  complète `--tech` / `-strong` / `-soft` / `-line` / `-foreground`.
- **Rampe continue vert → violet → vin** : `#0E4E40 · #2F7569 · #2C1654 · #7C3AAD · #7A2F73 · #86304F · #7B2D26`.
  Le bordeaux n'est plus isolé, c'est le violet réchauffé. Les 7 stades du pipeline la parcourent ; seul
  « payé » en sort, pour l'or.
- **Atmosphère** (`src/components/AtmosphereBackground.tsx`) : marbre malachite veiné d'or en clair, nuage
  violet sur socle malachite en sombre. Couche fixe, `aria-hidden`, intensité au tiers derrière `/admin`,
  `/closer`, `/dashboard`, `/leads`. `html` porte le fond, `body` est transparent.
- Thème sombre en **malachite profond saturé** (`167 69% 6%`), plus jamais un gris neutre.
- Contrastes recalculés et corrigés à chaque étape ; tous les couples passent AA dans les deux thèmes.

**Deux bugs structurels trouvés en regardant l'écran, pas le code**
- `bg-gradient-cosmic` ne produisait **aucun CSS** : les dégradés étaient définis en variables mais jamais
  déclarés dans `tailwind.config`. La section d'appel à l'action était donc transparente.
- Le pied de page tournait au **registre cosmique de LULG** — fond violet-noir, treize étoiles animées,
  constellation SVG. Remplacé par malachite → noir + veine kintsugi.

**Aperçus HTML autonomes** — `docs/brand/`
- `apercu-theme.html` — thème complet, bascule clair/sombre et pleine/atténuée
- `apercu-matieres.html` — matières et les trois typographies
- `apercu-or-perception.html` — relevé exact de l'or PERCEPTION, ratios calculés en direct dans la page

---

## Leçons de la session — à consigner en `LEARNINGS.md`

1. **« Latest » ≠ « Current » sur Vercel.** Un déploiement `READY` ne prouve pas que le domaine le sert.
   Vérifier l'alias, ou comparer les empreintes de bundle servies par le domaine.
2. **Ne jamais inverser un jeton employé des centaines de fois.** L'inversion `--primary`/`--secondary` a
   repeint ~600 usages en aveugle : noms en or illisible, avatars violets, cartes gris-lavande. Un défaut de
   lisibilité se corrige **au jeton**, pas en échangeant les rôles.
3. **Regarder le rendu, pas le diff.** Trois propositions successives ont été jugées « moche » par Nacer.
   Une classe morte, un aplat délavé ou un faux métal ne se voient qu'à l'écran.
4. **Concevoir depuis les références validées, pas depuis son goût.** L'or « métallique » à neuf arrêts était
   une invention : les deux sources réelles de Nacer (pitch deck, bouton PERCEPTION) utilisent un aplat ou un
   dégradé à **deux** arrêts.
5. **Livrer un fichier HTML autonome à chaque changement visuel.** Demande explicite de Nacer, et c'est la
   boucle de validation la plus courte.

---

## Tâches à venir — par pôle

### Gouvernance / squelette (prio 0)
- **Faire traiter `taches-a-faire/registres-a-consigner-sessions-38-39.md` par `archiviste-memoire`.**
  Le fichier contient déjà tout, rédigé et vérifié : l'entrée JOURNAL des deux sessions (38 et sa suite en
  39), LEARNING-098 à 110, ADR-043 à 049. L'archiviste n'a qu'à recopier dans les registres et supprimer
  le fichier une fois fait — Cowork ne charge pas cet agent, donc rien ne peut être écrit directement dans
  `.claude/memory/` depuis cette session.
- Premier audit P25 complet à planifier — seuil largement dépassé (39 sessions, 49 ADR en attente).

### Sécurité / infrastructure (prio 0)
- **BLOCKER-011** — protection mots de passe compromis — ouvert, un clic.
- **BLOCKER-013** — suppression logique non garantie — ouvert, différé.
- **BLOCKER-H10** — `rls_auto_enable` en SECURITY DEFINER — ouvert, différé M4.
- **19 vulnérabilités npm dont une critique**. Session dédiée `devops-vercel`.
  **Ne pas lancer `npm audit fix --force`** : casse des versions majeures.

### Domaine 1 — Acquisition & Qualification (prio 1)
- **T04 à réconcilier** : la fiche est marquée ✅ en citant la migration `20251029123034`, introuvable dans le
  dépôt, tout comme la fonction `auto_assign_closer_to_lead`. Vérifier si le déclencheur existe en base.
- T07 — le scoring `score-lead` reste 100 % déterministe, aucun appel à Claude. La température des cartes en
  dérive désormais, et le violet la signale à l'écran : la qualité du barème est devenue visible.

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
- `src/lib/database.types.ts` — fichier de types mort, arbitrage Nacer.
- `src/pages/LeadDetailWithProtonANK.example.tsx` — dette tolérée par l'allowlist : à supprimer ou à porter.
- `LeadDetail.tsx` garde son ancien badge de score sans afficher qualification ni température.

---

## Récemment complété

- **2026-08-10 (session 39)** — Suite et clôture de la refonte visuelle. Bouton PERCEPTION repris à
  l'identique (rayon, dégradé, typo, ombre). Nouveau jeton `--or-sombre`. Cartes en thème sombre passées de
  « violet assombri » à « surface claire », deux habillages permutables non tranchés. Marbre réel (vert +
  crème filtré) remplace le SVG à turbulence. **Charte graphique consolidée rédigée et enregistrée** dans
  TUC business/Branding, statuts ACTÉ/RÉSERVE/PROPOSITION. **T29 créée** (rebranding complet du site,
  aligné sur `TUC_BP2026_v7_FINAL.docx`). Proposition de personnalité de marque « Psychologue de la vente »,
  fondée sur la Barrière #1 déjà écrite dans le business plan (cinq valeurs coraniques + ACT), non encore
  maquettée. **Rien n'est en production** — 7 commits locaux, voir « Première action ».
- 2026-08-09/10 (session 38) — Refonte visuelle : système de design sur charte, rampe chromatique,
  atmosphère marbre/nuage, violet promu pilier technologique. Deux bugs structurels corrigés. Trois aperçus
  HTML autonomes. Référentiel `ux-ui-nacer` mis à jour une première fois. `.claude` sorti de Git avec
  sauvegardes.
- 2026-08-09 (session 37) — Refonte du kanban en pipeline d'affaires. ADR-040/041/042. Deux migrations
  appliquées et vérifiées. T05 livrée. BLOCKER-014 et 017 clos.
- 2026-08-08 (session 36) — Relais squelette Silicate v1.5 (ADR-039) + `docs/GLOSSAIRE.md`.
- 2026-08-08 (session 35) — ADR-037 (meet-coaching) + ADR-038 (WhatsApp).

---

## Environnement — à savoir au redémarrage

Le bac à sable Linux de Cowork est tombé en fin de session (`useradd failed: input/output error`) : plus de
`git`, plus de scripts, plus de build depuis Cowork. Les outils fichiers continuaient de fonctionner. Si le
symptôme réapparaît, travailler en ligne de commande depuis le poste plutôt que d'insister.

Rappel `LEARNING-099` : ne jamais lancer `npm install` depuis le bac à sable sur un montage Windows — la
corruption est silencieuse. Construire côté machine native.
