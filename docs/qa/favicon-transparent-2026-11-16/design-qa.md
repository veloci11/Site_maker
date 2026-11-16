# Favicon transparent — 16 novembre 2026

Final result: passed (export et validation locale).

Le fond blanc venait de `flatten` et du remplissage blanc de `resize/extend` dans l'export Sharp. Ces étapes gardent maintenant le canal alpha. Les SVG de la marque, les formes et les couleurs sont inchangés ; les PNG 16/32/48/180/192/512 et les trois images du favicon ICO sont régénérés avec le seul symbole. Les liens du head et du manifeste utilisent une nouvelle version de cache.

Contrôle des neuf images : alpha nul aux coins, transparence autour et entre les trois bandes, aucun pixel blanc opaque. `alpha-checks.json` donne les nombres ; `transparency-preview.png` montre le résultat sur damier et sur fond coloré. Build client/SSR/Sites, TypeScript et 290 tests passent. Liens du head vérifiés dans l'IAB local. Aucun changement des composants de navigation ni de leur interaction.
