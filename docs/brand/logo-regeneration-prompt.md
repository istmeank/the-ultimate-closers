# Logo TUC — prompt de régénération (Nano Banana 2)

> Objet : corriger la géométrie de l'emblème hexagonal kintsugi et en obtenir un rendu UHD.
> À utiliser en **édition d'image** : fournir le logo détouré (fond transparent) en entrée, pas en génération
> depuis rien — le modèle doit corriger l'existant, pas réinventer la marque.

---

## Défaut à corriger

L'emblème est un hexagone éclaté : six facettes de marbre malachite veiné d'or, séparées par des gouttières
blanches, autour d'un hexagone central blanc portant le nom et la poignée de main.

La facette **en bas à droite** ne s'aligne pas sur celle qui la surmonte : son arête ne prolonge pas le même
axe, ce qui casse la symétrie de l'ensemble. Le défaut se voit d'autant plus que toutes les autres facettes,
elles, respectent la trame.

---

## Prompt (anglais — recommandé, les modèles d'image sont plus précis dans cette langue)

```
Edit this logo. Do NOT redesign it, do NOT change its colours, typography or symbolism —
correct its geometry and re-render it at maximum fidelity.

STRUCTURE TO PRESERVE EXACTLY
An exploded hexagonal emblem: six outer facets of deep malachite-green marble with gold
kintsugi veining, separated by clean white gutters, surrounding a central white hexagon
that contains the gold italic serif wordmark "The Ultimate Closers" and a dark
teal-green handshake icon beneath it. Thin gold outline on every facet edge.

GEOMETRY TO FIX — this is the point of the edit
1. Rebuild every facet on a strict regular-hexagon grid: all edges must run on the
   0° / 60° / 120° axes only. No edge may sit at an approximate or drifting angle.
2. The bottom-right facet is misaligned with the facet directly above it — its edge does
   not continue the same axis. Correct it so the two share a single continuous line.
3. Enforce mirror symmetry across the vertical centre axis: the left group of facets and
   the right group must be exact mirror images.
4. Make the white gutters a constant width throughout, and the gold outlines a constant
   stroke weight on every facet.
5. All facet corners must be sharp and mathematically exact — no rounding, no softening,
   no overlap, no gap where two edges should meet.

COLOUR — sample from the source, do not reinterpret
Malachite green marble, deep and saturated, with warm gold veining. Gold wordmark.
Dark teal-green handshake. Pure white gutters and central hexagon.

OUTPUT
UHD, 4096 x 4096 pixels, square, transparent background (alpha channel), the emblem
centred with even margins. Crisp vector-like edges, no JPEG artefacts, no blur, no
drop shadow, no background gradient, no added text, no watermark.
```

---

## Version française, si tu préfères

```
Modifie ce logo. Ne le redessine pas, ne change ni les couleurs, ni la typographie, ni les
symboles — corrige sa géométrie et restitue-le en très haute définition.

STRUCTURE À CONSERVER À L'IDENTIQUE
Un emblème hexagonal éclaté : six facettes de marbre vert malachite veiné d'or, séparées
par des gouttières blanches, autour d'un hexagone central blanc contenant le nom
« The Ultimate Closers » en serif italique doré et une poignée de main vert sapin en
dessous. Fin liseré doré sur chaque arête.

GÉOMÉTRIE À CORRIGER — c'est l'objet de la retouche
1. Reconstruis chaque facette sur une trame d'hexagone régulier strict : toutes les arêtes
   suivent uniquement les axes 0° / 60° / 120°, aucun angle approximatif.
2. La facette en bas à droite n'est pas alignée avec celle qui la surmonte : son arête ne
   prolonge pas le même axe. Corrige-la pour que les deux forment une ligne continue.
3. Impose une symétrie miroir parfaite par rapport à l'axe vertical central.
4. Gouttières blanches de largeur constante, liserés dorés d'épaisseur constante partout.
5. Angles nets et exacts : aucun arrondi, aucun chevauchement, aucun interstice là où deux
   arêtes doivent se rejoindre.

SORTIE
UHD, 4096 x 4096 pixels, carré, fond transparent, emblème centré avec des marges égales.
Arêtes nettes de qualité vectorielle, aucun artefact, aucun flou, aucune ombre portée,
aucun dégradé de fond, aucun texte ajouté, aucun filigrane.
```

---

## Ce qu'il faut savoir avant de lancer

**Un modèle d'image ne produira jamais une géométrie exacte.** Il approche, il ne calcule pas. Tu obtiendras
un résultat visuellement plus propre, mais si tu remesures les angles, ils seront encore à un demi-degré près.
Pour un logo — la marque la plus réutilisée de toutes tes ressources — la seule correction définitive est la
**revectorisation** : redessiner l'hexagone en SVG sur une vraie trame, où les 60° sont des 60°.

Fais donc le rendu UHD pour disposer d'une référence propre, puis fais-en tirer un SVG. Un SVG pèse quelques
kilo-octets, reste net à toutes les tailles, et se recolorise avec les jetons de la charte sans réexporter
quoi que ce soit.

**Après régénération**, régénérer aussi le fichier applicatif :

```
python -c "from PIL import Image; im=Image.open('logo-uhd.png').convert('RGBA'); im.resize((512,512), Image.LANCZOS).save('src/assets/logo.webp','WEBP',quality=90,method=6)"
```

Le logo n'est jamais affiché au-delà de 80 pixels dans l'application : 512 px couvre tous les écrans, y compris
en haute densité. C'est ce qui a fait passer le fichier de 1441 ko à 55 ko.
