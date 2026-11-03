# Provenance des aperçus de référence

Les captures ci-dessous proviennent des sites externes ouverts dans le navigateur par l’agent principal. Elles ne sont pas générées par IA. Elles illustrent des formats de sites, sans revendiquer une réalisation ou une relation client du studio.

Les sources sont conservées dans `docs/qa/`. Julie Thiam et DOMTEKNIKA ont été encodés en WebP avec `cwebp -q 93 -m 6` ; aucun recadrage, redimensionnement, ajout ou remplacement de contenu. Les exports ont été inspectés visuellement. La capture Retina d’Addiction Agency est décrite séparément ci-dessous.

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

Julie Thiam, Tiny Heaven et DOMTEKNIKA sont présentés dans la galerie séparée ; les configurateurs ne contiennent aucun aperçu de site. Les galeries utilisent une image statique : le lien « Explorer le site » ouvre la source externe sur action de l’utilisateur. Aucune scène 3D ni iframe Julie Thiam n’est chargée automatiquement. Les créateurs sont crédités dans le catalogue et la galerie.

## Addiction Agency — remplacement de l’aperçu

- Source réelle : [page Agence](https://addiction-agency.com/agence), crédit [Addiction Agency](https://addiction-agency.com/).
- Capture native du navigateur : 2026-11-03T02:28:06Z (2 novembre, 20:28 UTC−06), 2560 × 1440 pixels, viewport 1280 × 720 CSS à DPR 2.
- Vue : identité de l’agence, titre Agence et cubes 3D verts/bleus. Aucun ajout, recadrage ou agrandissement de la capture.
- Source conservée : `docs/qa/offers-menu-buttons/source-addiction-agency.png`, 872 001 octets ; SHA-256 `16b9780004f2c1a925cbe8f50ee198b90027b76594abd3615995e5555d704caa`.
- Export actif : `public/assets/examples/addiction-agency.webp`, 2560 × 1440, 180 580 octets ; commande `cwebp -q 94 -m 6 -sharp_yuv`.
- SHA-256 WebP : `24bb91e0625f67176bd360565e472e09ddc5d656da97697044a4927a653691bd`.
- Ancienne vignette inadaptée conservée dans `docs/asset-sources/examples/addiction-previous.jpg`, hors du build public. Le catalogue pointe désormais sur le site réel de l’agence, avec son crédit ; aucune attribution de réalisation au studio.

Le lien externe s’ouvre uniquement sur action du visiteur. Le site studio ne charge pas la vidéo ou la scène animée de l’agence.

## Texture des grandes cartes de forfait

La grande carte utilise `public/assets/textures/grain-plasma-master.webp` (1536 × 1024, 2 636 656 octets), nouvel export **sans perte** du PNG source `docs/asset-sources/textures/grain-plasma-v2.png`. Commande : `cwebp -lossless -exact -m 6`. Contrôle des pixels RGB décodés : différence nulle sur les trois canaux, mêmes dimensions. Aucune génération ni interpolation, aucun flou ou grain de remplacement. Cette conversion conserve les détails de la source ; elle n’invente pas une résolution supérieure.

`image-set` choisit cette source à DPR 2 et la source légère `grain-plasma-card.webp` (768 × 512, 162 744 octets) à DPR 1. La couche légère reste également dessous pendant le chargement de la source sans perte, qui est plus lourde que l’ancien export HD compressé de 879 898 octets. Les liens, boutons et options ne dépendent pas de ce téléchargement. La texture des petites cartes reste identique octet pour octet.

Référence étudiée : [cartes tarifaires ElevenLabs](https://elevenlabs.io/pricing), notamment le calculateur Creator ; capture native dans `docs/qa/card-texture-fidelity/reference-elevenlabs@2x.png`. Référence de matière et de finesse seulement : aucune image ou texture ElevenLabs n’est utilisée sur le site. La texture originale de studio et les petites cartes approuvées restent la vérité de couleur et de composition.

Contrôle IAB : source sans perte dans la grande carte 568,3 × 530 CSS à DPR 2 ; version légère seule sur mobile DPR 1. Aucun canvas de grain dans la grande carte. Les comparaisons de contexte et de détail sont dans `docs/qa/card-texture-fidelity/`. Les essais précédents restent documentés dans leurs dossiers QA.
