# Favicon transparent — 16 novembre 2026

Final result: passed (local et publication HTTPS).

Le fond blanc venait de `flatten` et du remplissage blanc de `resize/extend` dans l'export Sharp. Ces étapes gardent maintenant le canal alpha. Les SVG de la marque, les formes et les couleurs sont inchangés ; les PNG 16/32/48/180/192/512 et les trois images du favicon ICO sont régénérés avec le seul symbole. Les liens du head et du manifeste utilisent une nouvelle version de cache.

Contrôle des neuf images : alpha nul aux coins, transparence autour et entre les trois bandes, aucun pixel blanc opaque. `alpha-checks.json` donne les nombres ; `transparency-preview.png` montre le résultat sur damier et sur fond coloré. Build client/SSR/Sites, TypeScript et 290 tests passent. Liens du head vérifiés dans l'IAB local. Aucun changement des composants de navigation ni de leur interaction.

## Publication

Révision applicative `e113bf17cda5d970cfa444fd4b041c03f5096ba0`, release `20261116T210809Z-e113bf17cda5` sur gilmathis.com. Huit ressources publiques correspondent octet pour octet aux exports transparents ; les six PNG ont un canal alpha. Les trois images ICO ont été contrôlées séparément avant publication. Head public vérifié dans l'IAB : version `20261116-transparent` sur les icônes et le manifeste, page rendue et aucune alerte console observée. Le rendu serveur, les composants et les trois SVG sont conservés.

Sauvegarde privée, santé et catalogue identique avant/après. Les 22 autres services/PID sont inchangés et GP Park reste inactif. Serveur local de cette tâche fermé (4183), Tailscale remis arrêté, onglet local fermé. Les essais commerciaux préparés en parallèle sont exclus de la release.
