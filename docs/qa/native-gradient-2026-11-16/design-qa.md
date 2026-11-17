# Fondu supérieur et retrait du rectangle de navigation

16 novembre 2026. État : vérifié localement ; publication à consigner.

## Demande retenue

Mathis corrige son signalement : la zone native est mauve unie, pas blanche. Il rejette le fond ajouté derrière la barre et accepte explicitement de faire disparaître le dégradé avant la zone de l'heure si son prolongement n'est pas possible.

Le rectangle est reproduit sur le site publié à430px, scroll2027,5 : le wrapper peint un dégradé permanent sur88px au-dessus des sections blanches. Capture `01-opaque-header-before.jpg`. Ce fond est supprimé ; aucune nouvelle bande n'est ajoutée.

## Réalisation et contrôles

1. **Fondu supérieur : réussi.** Un voile blanc partagé efface le dégradé en remontant : blanc dans la safe-area, puis transition de180px. Le grain suit la même plage. À430px, le fond body, le thème et le manifeste sont blancs ; premier pixel gauche JPEG254/254/254 et droit255/255/255. À260px, les couleurs du décor restent présentes. Avec safe-area59, toute la zone supérieure devient blanche avant le fondu. Captures `02-top-fade-430.jpg`, `04-top-fade-safearea.jpg` et mesures `fade-pixels.json`.
2. **Navigation au scroll : réussi.** Au même scroll2027,5, wrapper transparent et background-image:none, bas88px inchangé. La grosse rupture colorée ne reste plus derrière le menu ; seul le fond réel de la page passe sous la capsule. Capture `03-transparent-header-after.jpg`.
3. **Formats : réussi.** À320×740, document320px, fondu180px et header88px. Capture `05-top-fade-320.jpg`. À1280px avec pointeur fin, fondu0px/clear0px et header96px, donc présentation desktop conservée. Le rendu initial avec inset59 conserve un header147px. Aucune modification de géométrie, de défilement ou de logique de retour.

`npm run check` : TypeScript, builds client/SSR/Sites et **321 tests passent** après les modifications fonctionnelles. Source relue par un second agent, diff sans erreur. Aucune alerte console observée. Pas de nouveau test miroir des styles pour ce changement visuel réversible. Prix, copie commerciale, logo, menu compact, animations de forfaits, comparatif et formulaire inchangés.

## Recherche et limites

Le moteur WebKit distingue la peinture de page et une couleur d'extension calculée : `Page::updateFixedContainerEdges()` transmet une couleur à un calque de prolongement ; `LocalFrameView::fixedContainerEdges()` sélectionne les éléments proches des bords et leur couleur de fond, avec échantillonnage dans certains cas. Sources primaires consultées dans l'IAB : [Page.cpp](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/Page.cpp), [LocalFrameView.cpp](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/LocalFrameView.cpp). Cela ne fournit pas au site une API garantissant un dégradé arbitraire derrière l'heure sur chaque version de Safari.

La solution livrée suit le choix de Mathis : raccorder le décor au blanc avant la zone système, et supprimer la régression visuelle dans la page. Les captures contrôlent le contenu web et ses safe-areas ; elles ne simulent pas le chrome natif d'un iPhone matériel. Aucun prolongement dégradé dans cette zone système n'est revendiqué.
