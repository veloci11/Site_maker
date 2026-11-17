# Changer lisible sur téléphone

17 novembre2026. Contrôlé localement ; publication à consigner.

Le bouton avait du texte blanc sur un fond blanc à8 % ; la texture détermine alors sa lisibilité. Sur760 px maximum, fond opaque#111, texte blanc et apparence native retirée. État ouvert/survol#292929 ; contraste texte/fond supérieur à14:1 dans les deux états. Rayon, dimensions, transitions et chevron existants conservés. Le vrai bouton et son double décoratif partagent la même règle. Aucun changement JS.

## Vérifications

À430 px avec safe-area59/34, les trois forfaits montrent le même bouton88,875×44 px, blanc sur#111. Le menu s'ouvre en240 ms et le chevron tourne ; il se ferme sans déplacement. Vitrine/Business/Premium gardent exactement le même rectangle, y compris ouvert. Captures02–04 et `local-430.json`.

À320 px : même cible44 px, document320/viewport320 et mouvement réduit sans animation. À1280 px : ancien fond translucide et hauteur32 px conservés. `breakpoints.json`. Aucune alerte console. TypeScript, builds client/SSR/Sites et314 tests passent. Aucun test miroir ajouté pour cette retouche de style réversible ; aucun formulaire envoyé.

L'arrivée mobile400 ms précédemment publiée reste inchangée. Les vérifications émulent le contenu mobile ; elles ne constituent pas un essai sur iPhone matériel.
