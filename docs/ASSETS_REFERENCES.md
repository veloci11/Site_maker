# Provenance des aperçus de référence

Les aperçus ci-dessous proviennent de captures des sites externes ouverts dans le navigateur ou, pour Atlante 3D hors ligne, d'un export original du portfolio. Ils ne sont pas générés par IA. Ils illustrent des formats de sites, sans revendiquer une réalisation ou une relation client du studio.

Les captures sources sont conservées dans `docs/qa/`, et les affiches originales de Raphaël dans `docs/asset-sources/examples/raphael/`. Julie Thiam et DOMTEKNIKA ont été encodés en WebP avec `cwebp -q 93 -m 6` ; aucun recadrage, redimensionnement, ajout ou remplacement de contenu. Les exports ont été inspectés visuellement. Les traitements d’Addiction Agency et des quatre références ajoutées sont décrits séparément ci-dessous.

## Julie Thiam

- Source : [Julie Thiam](https://juliethiam.art/).
- Capture : 2026-11-02T05:10:51Z (2026-11-01 23:10:51 UTC−06, heure de Mexico).
- Source conservée : `docs/qa/source-julie-thiam.jpg`.
- Export : `public/assets/examples/julie-thiam.webp` — 1280 × 720 pixels, 122 736 octets.
- Vue : Galerie 3D visible, navigation et œuvres dans l’espace.
- SHA-256 source : `b95efad890654efee37c833b269cd708cfda5b1a9c264a5ae30c2d52534f720c`.
- SHA-256 WebP : `befb9812b005a5f5ace00720ce107cffced6bfa87691aa307ea1f257481c02d4`.

## DOMTEKNIKA

- Source : [DOMTEKNIKA](https://domteknika.ch/fr).
- Capture : 2026-11-02T05:11:17Z (2026-11-01 23:11:17 UTC−06, heure de Mexico).
- Source conservée : `docs/qa/source-domteknika.jpg`.
- Export : `public/assets/examples/domteknika.webp` — 1265 × 712 pixels, 82 208 octets.
- Vue : Accueil réel, navigation, texte et vélo.
- SHA-256 source : `e7511ead406fa3d89083969d86a36795d99b721efddab8aa8d88b72b7ced9e9a`.
- SHA-256 WebP : `c095d1cfa05a6e6d0a4d22ba3b142d3ee848ac310b390326c07a623be5a5dbce`.

## Chargement et crédits

Le catalogue local contient neuf références dans la galerie séparée ; les configurateurs ne contiennent aucun aperçu de site. La galerie utilise des images statiques : un clic sur l'image, le nom ou « Voir le site » ouvre directement la destination externe dans le même onglet. Atlante 3D porte le badge « Projet archivé » et mène à sa présentation. Aucune scène 3D ni iframe externe n’est chargée automatiquement. Les créateurs sont crédités dans le catalogue et la galerie. Cette mise à jour décrit les fichiers locaux ; elle n'atteste pas encore leur publication en production.

## Addiction Agency — remplacement de l’aperçu

- Source réelle : [page Agence](https://addiction-agency.com/agence), crédit [Addiction Agency](https://addiction-agency.com/).
- Capture native du navigateur : 2026-11-03T02:28:06Z (2 novembre, 20:28 UTC−06), 2560 × 1440 pixels, viewport 1280 × 720 CSS à DPR 2.
- Vue : identité de l’agence, titre Agence et cubes 3D verts/bleus. Aucun ajout, recadrage ou agrandissement de la capture.
- Source conservée : `docs/qa/offers-menu-buttons/source-addiction-agency.png`, 872 001 octets ; SHA-256 `16b9780004f2c1a925cbe8f50ee198b90027b76594abd3615995e5555d704caa`.
- Export actif : `public/assets/examples/addiction-agency.webp`, 2560 × 1440, 180 580 octets ; commande `cwebp -q 94 -m 6 -sharp_yuv`.
- SHA-256 WebP : `24bb91e0625f67176bd360565e472e09ddc5d656da97697044a4927a653691bd`.
- Ancienne vignette inadaptée conservée dans `docs/asset-sources/examples/addiction-previous.jpg`, hors du build public. Le catalogue pointe désormais sur le site réel de l’agence, avec son crédit ; aucune attribution de réalisation au studio.

Le lien externe s’ouvre uniquement sur action du visiteur. Le site studio ne charge pas la vidéo ou la scène animée de l’agence.

## Portfolio de Raphaël — quatre ajouts locaux

Les sources primaires et leurs limites sont détaillées dans [REFERENCES_RAPHAEL_FERREIRA.md](REFERENCES_RAPHAEL_FERREIRA.md). Les sept projets Works sont maintenant couverts par le catalogue local, avec DOMTEKNIKA et Julie Thiam en complément : neuf exemples au total.

Quatre affiches originales sont conservées hors du build, en 1600 × 1000 pixels :

| Projet | URL originale déclarée par le portfolio | Copie conservée et format réel |
| --- | --- | --- |
| GeoBoss | [geoboss-big.jpg](https://raphael-ferreira.com/posters/geoboss-big.jpg) | `docs/asset-sources/examples/raphael/geoboss.jpg`, JPEG |
| Aéma Groupe | [aema-big.jpg](https://raphael-ferreira.com/posters/aema-big.jpg) | `docs/asset-sources/examples/raphael/aema.jpg`, JPEG |
| Satellite Story | [satellite-big.jpg](https://raphael-ferreira.com/posters/satellite-big.jpg) | `docs/asset-sources/examples/raphael/satellite.webp`, WebP |
| Atlante 3D | [atlante-big.jpg](https://raphael-ferreira.com/posters/atlante-big.jpg) | `docs/asset-sources/examples/raphael/atlante.webp`, WebP |

Le format constaté est celui du fichier reçu, indépendamment de l'extension `.jpg` de l'URL. Les affiches de GeoBoss, Aéma et Satellite restent des sources d'archive ; leurs images actives sont des captures réelles plus récentes.

Les trois sites vivants ont été ouverts par le parent dans le navigateur intégré. Leurs captures natives de 2560 × 1440 pixels sont réduites à **1600 × 900**, puis exportées en **WebP qualité 94, sans recadrage**. Il n'y a ni génération d'image, ni reconstruction, ni agrandissement. Atlante utilise directement son original WebP, à l'identique.

| Projet et destination vérifiée | Source locale conservée | Export actif | Taille export |
| --- | --- | --- | ---: |
| [GeoBoss](https://geoboss.onrender.com/) | `docs/qa/card-alignment-faq-portfolio/source-geoboss-retina.png` | `public/assets/examples/geoboss.webp`, 1600 × 900 | 709 578 octets |
| [Aéma Groupe](https://www.aemagroupe.fr/) | `docs/qa/card-alignment-faq-portfolio/source-aema-retina.png` | `public/assets/examples/aema.webp`, 1600 × 900 | 123 860 octets |
| [Satellite Story](https://satellite.raphael-ferreira.com/) | `docs/qa/card-alignment-faq-portfolio/source-satellite-retina.png` | `public/assets/examples/satellite.webp`, 1600 × 900 | 40 660 octets |
| [Atlante 3D — présentation archivée](https://github.com/rqphy/Atlante3d#readme) | `docs/asset-sources/examples/raphael/atlante.webp` | `public/assets/examples/atlante.webp`, 1600 × 1000 | 53 866 octets |

Le manifeste [portfolio-assets.json](qa/card-alignment-faq-portfolio/portfolio-assets.json) conserve dimensions, tailles, traitements et empreintes SHA-256 des sources et exports. Pour Atlante, source et export ont la même empreinte `0d1278a665a497958199d9eaf02c26ad97ba5a685133ef5bbb6502e2b69001ef` : aucune recompression ni modification des octets.

Les crédits du catalogue local distinguent Raphaël Ferreira, sa collaboration avec Wonderstudios pour Aéma/Lactel et le projet Atlante. GeoBoss porte le tag **3D**, tout en restant rattaché à **Sur mesure** : ses fonctions multijoueurs et ses données ne sont pas celles d'une simple vitrine 3D. Atlante porte `archived: true` et mène au README, avec une action de présentation ; aucun site vivant de remplacement n'est inventé.

## Texture des grandes cartes de forfait

La grande carte utilise `public/assets/textures/grain-plasma-master.webp` (1536 × 1024, 2 636 656 octets), nouvel export **sans perte** du PNG source `docs/asset-sources/textures/grain-plasma-v2.png`. Commande : `cwebp -lossless -exact -m 6`. Contrôle des pixels RGB décodés : différence nulle sur les trois canaux, mêmes dimensions. Aucune génération ni interpolation, aucun flou ou grain de remplacement. Cette conversion conserve les détails de la source ; elle n’invente pas une résolution supérieure.

`image-set` choisit cette source à DPR 2 et la source légère `grain-plasma-card.webp` (768 × 512, 162 744 octets) à DPR 1. La couche légère reste également dessous pendant le chargement de la source sans perte, qui est plus lourde que l’ancien export HD compressé de 879 898 octets. Les liens, boutons et options ne dépendent pas de ce téléchargement. La texture des petites cartes reste identique octet pour octet.

Référence étudiée : [cartes tarifaires ElevenLabs](https://elevenlabs.io/pricing), notamment le calculateur Creator ; capture native dans `docs/qa/card-texture-fidelity/reference-elevenlabs@2x.png`. Référence de matière et de finesse seulement : aucune image ou texture ElevenLabs n’est utilisée sur le site. La texture originale de studio et les petites cartes approuvées restent la vérité de couleur et de composition.

Contrôle IAB : source sans perte dans la grande carte 568,3 × 530 CSS à DPR 2 ; version légère seule sur mobile DPR 1. Aucun canvas de grain dans la grande carte. Les comparaisons de contexte et de détail sont dans `docs/qa/card-texture-fidelity/`. Les essais précédents restent documentés dans leurs dossiers QA.


Contrôle de publication du lot `6133f1e` : les quatre nouveaux exports GeoBoss, Aéma, Satellite et Atlante répondent en HTTPS sur gilmathis.com avec un SHA-256 identique au manifeste local. La galerie publique affiche neuf références ; Atlante est signalé comme projet archivé avec lien de présentation. Version et preuves publiques : `../ops/DEPLOYMENT_STATUS.md`.
