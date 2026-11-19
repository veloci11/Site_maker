# Logo Pixelito sélectionné le 16 novembre 2026

Source : `pixelito-selected-2026-11-16.png`, capture explicitement choisie par Mathis.

Exports utilisés dans `public/assets/brand/` :

- `logo-pixelito.svg` : logo complet, groupes `pixelito-symbole` et `pixelito-typographie` indépendants.
- `logo-pixelito-symbole.svg` : les trois bandes seules ; chacune a son propre groupe.
- `logo-pixelito-typo.svg` : le mot seul, converti en tracés, sans dépendance à une police.
- `logo-pixelito-16.png`, `32`, `48`, `180`, `192` et `512` : icônes navigateur et mobiles, rendues depuis le symbole SVG sur fond transparent. Le favicon ICO reprend les PNG transparents 16/32/48 ; ne pas ajouter de fond blanc à l’export.

Les SVG ne contiennent aucun bitmap embarqué. Potrace vectorise les silhouettes de la source et le grain utilise un filtre SVG statique. Depuis le 18 novembre 2026, la bande centrale reprend le cyan, le lilas et le rose du fond Miami, avec des couleurs légèrement plus vives sur le petit symbole. Les deux images de l’ancien logo restent des archives.

Pour régénérer les exports : installer Potrace, puis exécuter `node scripts/prepare-brand.mjs`. La commande de build normale utilise directement les exports versionnés et ne nécessite pas Potrace.

Le composant React charge le symbole et le mot séparément afin de pouvoir les faire évoluer indépendamment. Les noms accessibles sont portés par les liens et le titre du menu, pas par les images décoratives.

Le symbole utilisé dans React est une copie identique générée dans `src/assets/logo-pixelito-symbole.svg`, intégrée au HTML afin que l'introduction ne dépende pas de requêtes d'images supplémentaires. Ses trois groupes sont animés séparément ; les identifiants de dégradé et de filtre sont propres à chaque instance. Le mot reste l'export SVG séparé.

La navigation joue une introduction de 720 ms à son premier affichage. Le chargement réel fait tourner les deux bandes noires en 1,6 seconde autour de la bande colorée ; il n'ajoute aucun délai aux pages. Ces animations utilisent les transformations CSS des groupes du dessin original et sont désactivées avec `prefers-reduced-motion`.
