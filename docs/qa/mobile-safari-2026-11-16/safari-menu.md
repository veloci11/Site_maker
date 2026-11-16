# Zone supérieure Safari et menu mobile — 16 novembre 2026

État : corrections locales. Aucun commit, push ni déploiement effectué par ce lot.

## Constat et portée

La capture réelle fournie, `/Users/mathis/Downloads/IMG_5893.PNG`, montre une bande blanche contenant l'heure et les indicateurs iOS au-dessus du dégradé. Elle n'est pas une marge du hero : la navigation et son retrait supérieur commencent sous cette zone. Le viewport HTML ne contenait pas `viewport-fit=cover`. La couleur de secours de la racine publique et le fond opaque de `.public-shell` étaient blancs, malgré le dégradé décoratif sur son pseudo-élément.

Le diagnostic est cohérent avec une zone sûre et/ou une teinte native Safari. La capture seule ne permet pas de déduire la version précise d'iOS, ses réglages Safari ni son algorithme de teinte.

## Modification

- `index.html` : ajout de `viewport-fit=cover`, avec zoom utilisateur conservé. La balise `theme-color` existante reste `#e8def4`.
- `src/styles.css` : couleur de secours de la racine publique `#e8def4`, identique à cette balise ; couche blanche sous le dégradé de secours pour conserver son rendu initial. La peinture blanche de `.public-shell` passe sur `::after`, au niveau `-3` de son contexte isolé, sous le dégradé `::before` (`-2`) et le grain (`-1`). Le shell et le body publics restent transparents pour que le repli de teinte ne rencontre pas un ancêtre blanc derrière l'en-tête transparent. Les champs colorés, leur opacité et le grain sont conservés.
- Hauteur de navigation = hauteur existante + `env(safe-area-inset-top, 0px)` ; même ajout au retrait supérieur. Les insets latéraux protègent le contenu public en paysage. Sur ordinateur sans inset, les dimensions restent celles du site existant. La navigation reste relative dans le configurateur.
- Menu : le `Sheet` Radix existant reste modal. Le panneau se place sous la navigation, à droite avec au moins 16 px de retrait, largeur maximale 360 px, hauteur déterminée par ses liens et bornée à l'espace visible avec `100dvh` et l'inset inférieur. Le reste de la page reste visible autour du panneau ; le sous-menu des forfaits peut défiler dans le panneau si nécessaire.
- Ouverture : translation verticale de 12 px et fondu sur 260 ms. Fermeture : translation de 10 px et fondu sur 220 ms. Le voile suit le même cycle. Les noms d'animations distincts selon `data-state` permettent à `Presence` de Radix de conserver les nœuds pendant leur sortie, sans temporisation de navigation ni montage forcé. La préférence de mouvement réduit existante ramène ces animations à 0,01 ms.
- Les liens mobiles ferment explicitement le menu. Escape, clic extérieur, verrouillage du défilement et gestion du focus restent ceux de Radix ; la restitution du focus avec `preventScroll: true` est conservée pour ne pas interrompre le retour en haut.

Le composant générique `src/components/ui/sheet.tsx`, les prix, textes commerciaux, fichiers du logo et mécanismes de retour des forfaits n'ont pas été modifiés par ce lot.

## Vérifications effectuées par le lot Safari/menu

- Inspection de la capture réelle fournie.
- Lecture de l'implémentation locale de `Dialog` et `Presence` Radix : ses portails rendent le voile puis le contenu dans `body`, les animations CSS de sortie sont attendues avant démontage, le voile porte le verrouillage de défilement.
- `npm run typecheck` : réussi après les corrections.
- `git diff --check` : réussi.
- Recherche des usages de `.public-shell::after` : aucun usage antérieur trouvé dans les feuilles de styles source.

Le parent coordonne les contrôles visuels IAB, la vérification complète du projet et leurs preuves. Aucun navigateur externe ni serveur local n'a été démarré par ce lot. Aucun test sur un iPhone physique n'a été exécuté par l'agent ; l'inspection du PNG fourni n'en constitue pas un.

## Contrôles à couvrir dans la validation intégrée

À 320 et 430 px : panneau plus petit que le viewport, liens lisibles, sous-menu des trois forfaits, défilement interne quand la hauteur manque, animation visible d'ouverture et de fermeture. Vérifier le sélecteur du voile `.sheet-overlay:has(~ .mobile-navigation)` dans le DOM réel, Escape, focus restitué au déclencheur sans saut de page, clic extérieur, retour en haut depuis Accueil, choix de forfait puis retour, mouvement réduit, navigation relative du configurateur et absence de déplacement desktop. Une simulation CSS d'inset supérieur de 59 px contrôle les calculs de disposition ; elle ne reproduit pas la teinte native de Safari.

## Limites Safari

WebKit documente [`viewport-fit=cover` et les insets de zone sûre](https://webkit.org/blog/7929/designing-websites-for-iphone-x/) comme les mécanismes permettant une peinture jusqu'aux bords tout en protégeant les contrôles. La [précision de WebKit sur la teinte des éléments fixes/adhérents](https://bugs.webkit.org/show_bug.cgi?format=multiple&id=301756#c2) et le [signalement Safari 26.2 lors des navigations internes](https://bugs.webkit.org/show_bug.cgi?id=305546) montrent que la couleur de l'interface native ne se réduit pas à la balise `theme-color`. Ce correctif couvre le viewport, les espacements et la couleur de secours ; la continuité exacte du dégradé sous les éléments iOS demeure à confirmer dans Safari sur l'appareil concerné après publication.
