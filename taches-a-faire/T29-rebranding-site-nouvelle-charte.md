# T29 — Rebranding complet du site sur la nouvelle charte graphique

**Priorité** : 🟡 P7 (Polish & Compliance) — dépend des réserves listées ci-dessous, pas bloquant pour le
reste du backlog technique (T01-T28)
**Agent responsable** : `frontend-react` (implémentation) + `produit-spec` (alignement messaging business
plan) + `redacteur-voix` (microcopy « marge du psychologue »)
**Skills bootstrap TUC** : `react-shadcn-design-system`, `valeurs-coran-bienveillance`
**Skills Cowork** : `ux-ui-nacer` (référentiel à amender en parallèle), `design:design-system`,
`design:accessibility-review`, `frontend-design`
**Modèle Claude** : `sonnet` pour l'implémentation, `opus` pour l'alignement messaging (haute conséquence
sur le positionnement commercial)
**Effort estimé** : 12-18h (dépend du nombre de pages — le site complet, pas seulement le CRM)
**Dépend de** : les 4 réserves de la charte (section 5) doivent être tranchées avant le début de
l'implémentation — voir « Blocages avant de démarrer »
**Bloque** : rien dans le backlog technique T01-T28 ; bloque la mise en production finale de la refonte
visuelle des sessions 38-39

---

## Pourquoi cette tâche existe

Les sessions 38 et 39 (2026-08-09/10) ont produit un système de design complet — validé écran par écran
avec Nacer via quatre aperçus HTML autonomes — mais **appliqué uniquement sur des fragments d'interface**,
pas sur le site en production. La charte consolidée vit désormais dans :

> `D:\Startup LABEL\Startup The Ultimate Closers Agency Closing\Branding The Ultimate Closers\`
> `TUC — Charte Graphique (session 39, 2026-08-10).md`

Cette tâche est le pont entre cette charte et le code réel de `src/`.

**Deuxième raison, tout aussi importante** : le business plan a évolué depuis la dernière refonte de
copie du site (`TUC_BP2026_v7_FINAL.docx`, juin 2026 — le document le plus récent et le plus complet du
dossier). Il documente des éléments qui ne sont probablement pas encore sur le site :
- Les **3 offres nommées** : *The Ultimate Closers Sales System™*, *The Ultimate Closers Academy™*,
  *TUC Sales Recruitment & Onboarding Framework™*
- Les **3 segments clients priorisés** : Formateurs & Infopreneurs (priorité An 1), Startups & PME
  (ticket élevé), Bootcamps & Écoles Numériques (récurrence)
- La **signature de positionnement officielle** : *« La vente n'est pas un rapport de force. C'est un
  alignement. »*
- La **barrière éthique/psychologique** (§3.5) qui fonde la proposition de personnalité de marque en
  section 7 de la charte

Refaire le visuel sans reprendre ces éléments de fond serait une refonte esthétique seule — cette tâche
doit faire les deux ensemble.

---

## Blocages avant de démarrer

Ne pas commencer l'implémentation avant que ces quatre points soient tranchés par Nacer (charte, section 5) :

1. **Typographie** — aucune option validée à ce jour, y compris la nouvelle direction demandée
   (Cormorant Garamond / Lora / Inter, « comme PERCEPTION »). Produire d'abord la planche comparative D
   dans `docs/brand/apercu-matieres.html`.
2. **Cartes en thème sombre** — vert-doré ou crème-violet, les deux prêtes dans `apercu-velours.html`.
3. **Teinte du velours violet** — recaler sur 268-271° ou garder le natif ~245°, comme pour le teal.
4. **Confirmation finale du marbre crème** — le filtre anti-rose suffit-il, ou faut-il pousser plus loin ?

Sans ces quatre réponses, T29 ne peut produire que du code qu'il faudra retoucher — attendre est moins
coûteux que refaire.

---

## Mission séquentielle

### Étape 1 — Auditer l'écart charte ↔ code actuel
1. Lister tous les usages de couleurs codées en dur (`bg-`, `text-`, `border-` Tailwind ou hex direct) hors
   des jetons `src/index.css` / `tailwind.config.ts`
2. Repérer chaque bouton du site et vérifier s'il suit déjà la spec exacte PERCEPTION (section 4 de la
   charte) — probable que non, puisque cette spec a été corrigée en session 39, après le dernier commit
   poussé
3. Repérer les usages actuels de `AtmosphereBackground.tsx` et préparer le remplacement du SVG à
   turbulence par les photos réelles (`docs/brand/marbre-vert.webp`, `marbre-creme.webp`)
4. Produire un rapport `audit-ecart-charte.md` (temporaire, supprimé après la tâche)

### Étape 2 — Appliquer les jetons de couleur
- Ajouter `--or-sombre` (`#7A6119`) à `src/index.css`, l'utiliser partout où de l'or écrit sur un fond
  clair (remplace tout usage de `--or` ou `--or-clair` en texte sur fond clair)
- Ajouter `--ramp-wine` au stade « closé » du pipeline si pas déjà fait (vérifier vs. session 37/38)
- Implémenter les jetons de carte constants (`--card-ink`, `--card-muted`, `--card-or`, `--card-tech`,
  section 2.6 de la charte) indépendants du thème
- Implémenter l'habillage de carte sombre choisi à l'étape « Blocages »

### Étape 3 — Le bouton, une seule fois, partout
- Créer un composant `ButtonOr` (ou équivalent shadcn) qui applique exactement la spec de la section 4 de
  la charte — rayon 2px, dégradé 140°, Inter 500 à .22em, l'ombre et sa transition
- Remplacer tous les boutons d'action primaire du site par ce composant unique
- Vérifier qu'aucune variante locale ne réinvente un bouton doré différent

### Étape 4 — Les matières
- Remplacer le SVG à turbulence de `AtmosphereBackground.tsx` par les deux photos de marbre (vert en
  thème clair, la question de l'équivalent sombre — nuage violet ADR-045 — reste à trancher séparément)
- Intégrer le velours (teal + violet) sur les bandes/cartes/tuiles concernées, jamais sur le hero
- Vérifier qu'aucun texte long ne passe sans voile sur une surface de velours ou de marbre (règle de
  contraste actée en session 39)

### Étape 5 — Le contenu, aligné sur le business plan v7
- Vérifier que les 3 offres nommées apparaissent avec leur nom exact (™ inclus) quelque part sur le site
- Vérifier que le ciblage (Formateurs & Infopreneurs en priorité) transparaît dans la hiérarchie des
  sections, pas seulement dans un paragraphe perdu
- Ajouter la signature *« La vente n'est pas un rapport de force. C'est un alignement. »* comme élément
  visuel récurrent (hero, footer, ou les deux — à trancher avec `produit-spec`)
- Ne PAS implémenter la « marge du psychologue » (section 7.2 de la charte) sans un aperçu HTML validé au
  préalable — c'est une proposition, pas une décision actée

### Étape 6 — Amender le référentiel `ux-ui-nacer`
Une fois la typographie tranchée, si l'option retenue n'est pas Playfair Display (option C), amender le
skill : il classe aujourd'hui Playfair comme « marqueur d'identité obligatoire ». Amender aussi si
l'échelle d'angles 2/6/10 (ADR-046) est validée : le skill fixe aujourd'hui un rayon uniforme de 12px.

### Étape 7 — Tests et vérification
- `npm run verify` (garde-fou abstraction + types + tests + build, cf. T28)
- Contrôle de contraste AA sur chaque nouvelle combinaison texte/fond (script ou vérification manuelle
  via les calculs déjà présents dans `apercu-velours.html`)
- Vérification visuelle sur les deux thèmes, pas seulement sur le diff de code (LEARNING-105)

---

## Critères d'acceptation

- [ ] Les 4 blocages de la section « Blocages avant de démarrer » sont levés avant le premier commit
- [ ] `--or-sombre` présent dans `src/index.css`, utilisé partout où de l'or écrit sur fond clair
- [ ] Un seul composant bouton dans tout le site, conforme à la spec PERCEPTION section 4
- [ ] `AtmosphereBackground.tsx` utilise les photos réelles, plus de SVG à turbulence pour le marbre
- [ ] Les 3 offres nommées (™ inclus) et la signature de positionnement apparaissent sur le site
- [ ] Aucun texte de velours/marbre sans voile suffisant pour tenir le contraste AA
- [ ] `npm run verify` passe sans régression
- [ ] Référentiel `ux-ui-nacer` amendé si la typographie ou l'échelle d'angles change
- [ ] LEARNING ajouté si un piège de migration de jetons est rencontré (cf. LEARNING-104, ne pas répéter
  l'inversion de jeton de la session 38)
- [ ] ADR consigné pour tout choix structurant fait pendant cette tâche (via `archiviste-memoire`)

---

## 🔍 Audit & Vérification (étape finale obligatoire)

> **Règle d'or TUC** : ne jamais déclarer terminé sans (1) relire le diff, (2) vérifier les domaines
> voisins, (3) tester, (4) tracer dans JOURNAL.

### 1. Audit technique
- [ ] `git diff --stat` relu en entier — chercher les couleurs codées en dur oubliées
- [ ] `auditeur-qualite` invoqué pour l'audit cross-domaines (le rebranding touche potentiellement toutes
  les pages)

### 2. Tests spécifiques
- [ ] Contrôle de contraste AA sur chaque nouvelle combinaison (voir script de calcul dans
  `docs/brand/apercu-velours.html`, réutilisable)
- [ ] Vérification visuelle des deux thèmes sur au moins 5 écrans représentatifs (accueil, une page
  produit, le dashboard, une fiche prospect, le footer)
- [ ] `npm run build` + Lighthouse (le poids des photos de marbre/velours doit rester raisonnable —
  vérifier le format WebP et la compression)

### 3. Filtre éthique
- [ ] `gardien-valeurs` consulté si la « marge du psychologue » (section 7.2 de la charte) est implémentée
  — vérifier qu'aucune phrase ne bascule de l'insight empathique vers la manipulation déguisée

### 4. Capitalisation mémoire (via `archiviste-memoire` exclusivement)
- [ ] JOURNAL.md : session datée, rituel Décidé/Appris/Dérivé
- [ ] LEARNINGS.md : tout piège de migration rencontré
- [ ] DECISIONS.md : ADR pour chaque réserve tranchée pendant cette tâche

### 5. Livraison
- [ ] Statut de ce fichier passé à ✅ dans `taches-a-faire/README.md` + commit hash
- [ ] Commit conventionnel (`feat(brand): apply TUC visual system across the site`)
- [ ] Push uniquement après validation Nacer

### 6. Validation Nacer (sortie obligatoire)
```
## RÉSULTAT — T29
- ✅ Implémenté : <composants/pages touchés>
- ✅ Tests passés : <verify, contraste, visuel deux thèmes>
- ⚠️ Points d'attention : <réserves restées ouvertes, si applicable>
- 📊 Métriques : <poids images, score Lighthouse avant/après>
- 🔗 Suivants débloqués : <mise en production de la refonte 38-39>
- 💾 Commit : <hash>
```
