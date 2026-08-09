# TUC — prompts de génération d'un nouveau logo

> Trois directions, un brief commun. À utiliser en **génération** (pas en édition).
> Générer le **symbole seul, sans texte** — voir la note en fin de document, elle décide de la qualité du
> résultat plus que le prompt lui-même.

---

## Ce que le logo doit dire

L'archétype de TUC est **le renouveau** — « des opportunités perdues à une culture du closing ». Sa traduction
visuelle est le **kintsugi** : la fêlure réparée à l'or, la valeur née de la cassure. Pas une image de force,
une image de réparation précieuse.

La personnalité est *The Psychology Expert* : confiant, analytique, à l'écoute. Le client idéal « n'a pas
besoin d'élever la voix ». Le logo ne doit donc jamais crier.

Registre matériel : **minéral et taillé**. Marbre, malachite, or. Aucun ornement — ni amazigh, ni girih, ni
arabesque : ceux-là appartiennent à LULG, et les mélanger dissoudrait la distinction entre tes deux marques.

Palette, strictement :

| | Hex | Rôle |
|---|---|---|
| Malachite | `#0E4E40` | la pierre, l'encre |
| Or | `#E8C669` | la veine, la réparation |
| Crème | `#F6F4EE` | le fond |

---

## Direction A — L'hexagone fracturé *(la plus fidèle à ton identité actuelle)*

Un seul hexagone plein de malachite, traversé par une unique veine d'or qui suit une vraie ligne de fracture.
On garde ta forme, on retire l'éclatement en six facettes qui la rend illisible en petit.

```
A minimalist logo mark: a single solid hexagon carved from deep malachite-green stone
(#0E4E40), crossed by one continuous gold vein (#E8C669) running from the upper-left edge
to the lower-right edge. The vein follows a natural fracture line — irregular, never
straight, never symmetrical, branching only once. Kintsugi philosophy: a break repaired
with gold, worth more than the unbroken original.

Flat vector illustration. Sharp geometric edges, perfect regular hexagon, no bevel, no
3D, no gloss, no drop shadow. The stone reads as a flat solid colour with only the
faintest darker mineral mottling — restraint over texture. Gold vein stroke between 2%
and 4% of the hexagon width, tapering naturally at both ends.

No text, no letters, no wordmark. Transparent background. Centred, even margins.
4096 x 4096, UHD, crisp vector-quality edges.

Style reference: Massimo Vignelli's geometric rigour, Saul Bass's reduction to a single
idea. Corporate, quiet, expensive. Not decorative, not ornate, not glossy.
```

---

## Direction B — La jointure

La poignée de main réduite à son essence géométrique : deux formes de malachite qui se rejoignent, et la
jointure elle-même est la veine d'or. L'accord comme réparation.

```
A minimalist abstract logo mark: two interlocking geometric shapes in deep malachite
green (#0E4E40), meeting along a single seam. The seam is a thin gold line (#E8C669)
with the irregular quality of a kintsugi repair — the joint is the precious part.
The two shapes read simultaneously as a handshake reduced to pure geometry and as two
halves of one broken stone made whole.

Flat vector illustration, hard geometric edges, mirror-symmetrical composition on the
vertical axis. No gradient, no 3D, no bevel, no gloss, no shadow. Negative space is
active and deliberate: the silhouette must stay legible at 16 pixels.

No text, no letters. Transparent background. Centred, even margins.
4096 x 4096, UHD, crisp vector-quality edges.

Style reference: Saul Bass, Paul Rand. One idea, executed cleanly. Corporate and
restrained, never illustrative.
```

---

## Direction C — Le monogramme taillé

Les lettres T·U·C construites comme une seule forme minérale, fendue par une veine d'or. La plus sobre, la
plus reproductible, la plus solide en petit.

```
A minimalist monogram logo: the letters T, U and C fused into one continuous geometric
form, carved as a single block of deep malachite-green stone (#0E4E40). A single thin
gold vein (#E8C669) runs through the form along a natural fracture line, following the
kintsugi principle — repaired, not damaged.

Geometric sans-serif letterforms with sharp terminals and uniform stroke weight. Flat
vector illustration, no 3D, no bevel, no gloss, no shadow, no outline. The letters must
stay individually readable while reading as one object.

Transparent background, centred, even margins. 4096 x 4096, UHD, crisp vector-quality
edges. Nothing else in the frame — no container shape, no border, no tagline.

Style reference: Massimo Vignelli. Rigorous, timeless, unfashionable on purpose.
```

---

## La chose la plus importante de ce document

**Ne fais pas générer le texte par le modèle.** Aucun générateur d'images n'écrit correctement — tu obtiendras
« The Ultimante Clsoers » une fois sur deux, et tu ne t'en apercevras qu'après l'avoir imprimé.

Et ton logo actuel porte un défaut que la régénération ne corrigera pas : **le nom est enfermé dans le
symbole**. Dans ton application, il s'affiche entre 32 et 80 pixels. À cette taille, « The Ultimate Closers »
est un pâté illisible. Le texte est là sans jamais être lu.

La sortie est de séparer la marque en deux objets :

- **Le symbole seul** — l'hexagone, sans un mot. C'est lui que tu mets dans la barre de navigation, le favicon,
  l'avatar WhatsApp, la signature de mail.
- **Le logotype** — « The Ultimate Closers » composé en **Playfair Display**, ta police de titres, à côté ou
  sous le symbole. C'est lui que tu mets sur une page d'accueil, une couverture de proposition, une carte.

Les deux ensemble forment le verrou complet. Séparés, chacun fonctionne. C'est ainsi que fonctionnent les
marques qui durent, et ça ne coûte rien de plus que de le décider maintenant.

---

## Test de validation, avant de retenir une proposition

1. **Réduis à 16 pixels.** Si tu ne reconnais plus la forme, elle est morte — c'est la taille d'un favicon.
2. **Passe-la en noir et blanc.** Si elle disparaît, elle reposait sur la couleur seule.
3. **Imprime-la en noir sur blanc.** Le malachite doit tenir en aplat.
4. **Regarde-la à côté du logo LULG.** Si on peut les confondre, la distinction minéral / cosmique n'a pas
   été tenue.
5. **Dessine-la de mémoire après dix secondes.** Un logo qu'on ne peut pas redessiner ne se retient pas.

---

## Après avoir choisi

Fais vectoriser la proposition retenue en **SVG**. Un générateur d'images produit du pixel ; un logo doit être
une géométrie. Le SVG pèse quelques kilo-octets, reste net à toutes les tailles, et se recolorise avec les
jetons de ta charte sans réexport.

Puis régénère le fichier applicatif :

```
python -c "from PIL import Image; im=Image.open('logo-uhd.png').convert('RGBA'); im.resize((512,512), Image.LANCZOS).save('src/assets/logo.webp','WEBP',quality=90,method=6)"
```
