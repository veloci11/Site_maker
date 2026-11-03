# Provenance des aperçus de référence

Ces deux fichiers sont des captures authentiques des sites externes ouverts dans le navigateur par l’agent principal. Ils ne sont pas générés par IA. Ils illustrent des formats de sites, sans revendiquer une réalisation ou une relation client du studio.

Les JPEG sources sont conservés dans `docs/qa/`. La seule transformation est l’encodage WebP avec `cwebp -q 93 -m 6` ; aucun recadrage, redimensionnement, ajout ou remplacement de contenu. Les exports ont été inspectés visuellement.

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

## Texture des grandes cartes de forfait

La grande carte conserve les couleurs de la texture studio approuvée. La source `public/assets/textures/grain-plasma-card.webp` (768 × 512, 162 744 octets) sert de composition colorée, en `cover` avec un lissage statique ; son grain bitmap n’est plus la matière finale de la grande carte. Un canvas indépendant ajoute un grain fin, procédural et déterministe à la densité réelle de l’écran, sans boucle d’animation. Aucun nouvel asset généré, aucun changement d’octets de la texture approuvée sur les petites cartes.

L’essai précédent avec `grain-plasma-detail.webp` (1536 × 1024, 879 898 octets, copie binaire de l’original archivé) améliorait la résolution de l’image mais son grain restait lié à son agrandissement. Il est remplacé par les deux couches séparées ci-dessus. Le fichier HD reste disponible pour les anciennes pages mises en cache, mais le nouveau configurateur ne le demande plus : une seule texture de 162 744 octets, déjà préchargée pour l’accueil.

Contrôle IAB : canvas 1137 × 1060 pour une carte 568,3 × 530 CSS à DPR 2 ; canvas 335 × 420 pour une carte 335 × 419,3 CSS à DPR 1. Les captures PNG natives avant/après et les planches de comparaison sont dans `docs/qa/card-grain-native/`. L’essai HD antérieur reste documenté dans `docs/qa/card-definition/`.
