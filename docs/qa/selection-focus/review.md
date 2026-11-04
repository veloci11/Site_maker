# Contour de sélection des options

Retour de Mathis reçu après la livraison questionnaires `82d3e3b` : l’encadrement à la sélection est trop présent. Le lot précédent a été clôturé et documenté avant cette correction.

## Cause et correction

Reproduction sur le configurateur public : `:focus-within` ajoutait un contour violet de 3 px, décalé de 3 px, autour de toute la ligne après un simple clic. La sélection ajoutait aussi une ombre intérieure qui épaississait la bordure. Les choix multiples du brief avaient le même contour de focus sur leur label.

Deux feuilles CSS modifiées : suppression du contour des lignes, sélection avec coche noire et bordure neutre de 1 px, sans ombre intérieure. Au clavier uniquement, le petit contrôle reçoit un contour sombre de 2 px, décalé de 3 px. Aucun changement de données, d’options, de prix, de cartes ou de textures.

## Vérification locale

IAB : sélectionner/désélectionner à la souris sur Vitrine, puis Tab et Espace sur Français + anglais. Coche et compteur suivent les choix ; contour de ligne `none`, ombre `none`, contrôle au clavier `2px solid rgb(33, 26, 39)`. Sélection et focus du questionnaire Refonte vérifiés de la même manière. Mobile 390 × 844 : document/client 375/375 avec scrollbar, pas de débordement, contour extérieur absent.

Configuration locale initiale restaurée ; choix fictifs du brief effacés, aucune soumission. Base locale dédiée, configuration d’e-mail vide. Onglet local fermé et localhost arrêté. TypeScript, build et **213 tests passent** ; aucune erreur applicative observée. Aucun nouveau test ne duplique cette modification CSS : les états sont contrôlés dans le navigateur réel.

Preuves : `before-public.jpg`, `after-local.jpg`, `after-local-mobile.jpg` et `local-browser.json`. Publication et contrôle public de cette correction consignés après déploiement.
