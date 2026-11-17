# Téléphone : fond supérieur, raccord et ergonomie

16 novembre 2026. État : contrôles locaux réussis, publication à consigner. Limite matérielle : le tint natif derrière l'heure/la batterie n'est pas reproduit par le navigateur intégré.

## Retour utilisateur et diagnostic

Mathis constate encore une bande blanche sur son iPhone malgré le lot précédent. La version publique avait déjà viewport-fit=cover, theme-color pastel et des marges safe-area ; les considérer comme une preuve de résolution était insuffisant. Le contrôle actuel constate que body et le wrapper sticky étaient transparents. Ils dépendaient de surfaces de fond internes masquées/isolées.

Le commentaire d'un ingénieur WebKit explique le rôle des éléments fixes/sticky proches des bords dans l'extension de couleur native ([301756, commentaire 2](https://bugs.webkit.org/show_bug.cgi?id=301756#c2)). Des problèmes distincts de filtre et de navigation douce sont également documentés ([319479](https://bugs.webkit.org/show_bug.cgi?id=319479), [305546](https://bugs.webkit.org/show_bug.cgi?id=305546)). Aucun backdrop-filter ne touchait notre barre. La piste retenue est donc un vrai calque fixed opaque, sans filtre ni masque, au bord supérieur ; c'est un choix d'implémentation, pas un diagnostic matériel confirmé de l'iPhone de Mathis.

Le calque utilise le dégradé existant, à 100% × 1180 px. Sa hauteur est max(16px,safe-area-top), sans listener de scroll, mouvement, backdrop-filter ou interception tactile. Il reste dans le même contexte que header50/skip1500, à49, pour éviter de masquer le lien clavier. body peint aussi le fond dès le HTML initial. Le manifeste reprend le fond pastel et son URL change de version.

## Parcours et contrôles

1. **Haut de page : rendu web vérifié, rendu natif iPhone non confirmé.** À430×932 avec insets59/34, calque de0 à59, largeur430, positionfixed, fond opaque, aria-hidden et pointer-events:none. Avec inset0, hauteur16. Le lien clavier se révèle à71px, au-dessus du calque et sous la zone système. Avant : `01-before-home.jpg` ; après : `02-edge-paint-430.jpg`.
2. **Menu : réussi.** Logo retiré, titre Menu et croix44px conservés. La liste défile seule. À320×568, panneau288×387 de147 à534 ; scroll interne174px, croix toujours à164–208. Animation260/220 conservée, Escape et choix du forfait ferment le menu. Captures `03-menu-no-logo.jpg`, `07-short-menu-scrolled.jpg`.
3. **Choix de carte : réussi en émulation.** Depuis une vraie carte Business visible, exactement deux noms de capture : plan-connecte et plan-connecte-content, profilcompact, durée420ms, racine sans nom. Captures intermédiaires `04-expansion-frame.jpg`, `04b-expansion-frame.jpg`. Aucun texte de la ligne Votre forfait/Changer ne flotte avant l'image ; cette ligne apparaît en140ms à la fin. Depuis le menu de l'accueil, aucune fausse paire : zéro couche nommée et animation de la carte réelle360ms. Les contrôles restent stables à la fin.
4. **Personnalisation : réussi.** À320×740, barre de99px, bas à740, bouton134,80×44. Personnaliser est proposé lorsque les rubriques sont sous la fenêtre. Le clic focus le titre et déroule vers elles ; après arrivée à la première rubrique, Continuer ouvre le formulaire. Aucun envoi. Retour Mes fonctionnalités testé. La première version de l'observer surveillait seulement le titre et devenait prématurément Continuer : le contrôle intégré a conduit à observer un ref dédié sur la première rubrique. Captures `05-plan-and-personalise.jpg`, `08-small-personalise.jpg`, `06-features-entry.jpg`.
5. **Retour et régressions : réussi.** Retour Premium vers l'accueil à147,09px pour un header147. Changer réel et copie décorative44px, mêmes88,875px de largeur ; choix du menu44px. Sur desktop1280, calque supérieur masqué, durée760ms et Changer32px conservés. Mouvement réduit : animations ramenées à0,01ms, pas de raccord natif. Aucune alerte console observée sur les parcours contrôlés.

TypeScript, builds client/SSR/Sites et **321 tests passent**, après les derniers changements fonctionnels. Les tests couvrent le profil compact, les sources visibles/non visibles et leur durée de vie dans le routeur, les retours et le fond présent dans le HTML initial. Journal local ignoré : `.data/deployment/mobile-polish-final-check.log`.

## Équipe et périmètre

Trois spécialistes ont livré le raccord, le menu et l'audit de parcours, puis le parent a intégré, relu, corrigé les défauts observés et vérifié dans l'IAB uniquement. Prix, catalogue, visuels approuvés, questionnaires et comparaison simultanée conservés. Pas de mesure FPS, de téléphone physique ni de validation du chrome natif Safari. Ne pas annoncer la bande système résolue sur l'appareil sans retour matériel.
