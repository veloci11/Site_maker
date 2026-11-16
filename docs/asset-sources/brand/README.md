# Logo Pixelito sélectionné le 16 novembre 2026

Source : `pixelito-selected-2026-11-16.png`, capture explicitement choisie par Mathis.

Exports utilisés dans `public/assets/brand/` :

- `logo-pixelito.svg` : logo complet, groupes `pixelito-symbole` et `pixelito-typographie` indépendants.
- `logo-pixelito-symbole.svg` : les trois bandes seules ; chacune a son propre groupe.
- `logo-pixelito-typo.svg` : le mot seul, converti en tracés, sans dépendance à une police.
- `logo-pixelito-16.png`, `32`, `48`, `180`, `192` et `512` : icônes navigateur et mobiles, rendues depuis le symbole SVG sur fond transparent. Le favicon ICO reprend les PNG transparents 16/32/48 ; ne pas ajouter de fond blanc à l’export.

Les SVG ne contiennent aucun bitmap embarqué. Potrace vectorise les silhouettes de la source ; les couleurs du dégradé sont échantillonnées et le grain utilise un filtre SVG statique. Les deux images de l’ancien logo sont conservées ici comme archives ; elles ne sont plus importées ni livrées dans le client.

Pour régénérer les exports : installer Potrace, puis exécuter `node scripts/prepare-brand.mjs`. La commande de build normale utilise directement les exports versionnés et ne nécessite pas Potrace.

Le composant React charge le symbole et le mot séparément afin de pouvoir les faire évoluer indépendamment. Les noms accessibles sont portés par les liens et le titre du menu, pas par les images décoratives.
