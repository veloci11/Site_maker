# Shell public mobile — 16 novembre 2026

## Périmètre et état

Correctif local limité à `src/styles.css`, sans modification de copie, de prix, d'images, de composant React ou de règles `.pixelito*`. Aucun serveur local, Chrome, commit, push ou déploiement lancé par le sous-agent shell. Le parent réalise les vérifications interactives dans le navigateur intégré.

## Diagnostic vérifié

- Le lien « Aller au contenu » existe une fois dans le SSR de chacune des neuf routes publiques et cible le vrai `main#main-content`, avec `tabIndex={-1}`. Il reste utile avant l'hydratation.
- Le document de production généré par Vite charge le CSS d'entrée dans le `head`. `server/seo.mjs` conserve ce lien et ajoute les CSS de route au HTML rendu. Aucun manque systématique de CSS initial n'a été trouvé ; aucun ajout de CSS critique dupliqué dans `index.html` n'est nécessaire.
- Avant correction, le lien était caché uniquement avec `translateY(-150%)` et révélé par `:focus`, qui s'applique aussi aux focus non clavier. Les mesures IAB initiales fournies par le parent à 390 × 844 donnaient `top=-61`, `bottom=-12`, `focus=false`, `active=BODY` : le défaut d'affichage au repos n'était pas reproduit dans cette capture stable. Il ne faut donc pas présenter un décalage SSR permanent comme sa cause prouvée.
- Le début du SSR contient uniquement des préchargements d'images et un commentaire Suspense avant `.public-shell`, pas de bloc occupant de la hauteur. La mesure initiale du shell est `top=0` ; son pseudo-élément de fond commence aussi à `top:0`.
- Les plages du fond n'existaient que sur `.public-shell::before`. Le fond de `html` et de `body` était un aplat lavande. Une surface extérieure au shell, exposée notamment au rebond, pouvait donc changer de traitement visuel. La texture de grain est un canvas peint après montage et ne constitue pas le fond initial CSS.
- `scrollbar-gutter:stable` s'appliquait à tous les périphériques. Les captures mobiles existantes montrent une bande latérale distincte du dégradé quand l'émulation utilise une scrollbar de bureau.
- L'animation générale `page-in` appliquait `transform:translateY(4px)` sur `.motion-page` pendant 180 ms. Cette page contient la barre de prix mobile `position:fixed` : un ancêtre transformé change son contenant pendant l'animation. Le passage à `transform:none` peut donc la replacer brutalement à la fin de l'entrée. Diagnostic de structure/CSS ; la chronologie visuelle est contrôlée par le parent.
- `App.tsx` restaure le scroll aux changements de route mais ne déplace pas le focus sur le skip link. La seule restauration explicite du focus dans `PublicLayout.tsx` vise le bouton du menu, avec `preventScroll:true`.

## Changements appliqués

1. Le lien d'évitement est masqué au repos par `clip-path:inset(50%)` et une translation verticale. Seul `:focus-visible` le révèle ; il reste présent et accessible au clavier. Sa largeur maximale est bornée à la largeur disponible moins ses marges de 20 px.
2. Les cinq gradients validés sont déplacés tels quels dans `--public-atmosphere`. Le pseudo-élément du shell les réutilise avec le même masque. Le canvas racine reprend ces mêmes couleurs, au même ancrage et à la même hauteur de 1180 px ; un fondu blanc équivalent au masque termine le fond. Le `body` public devient transparent. Le fond ne dépend pas du JavaScript.
3. La réserve de scrollbar est conservée uniquement sous `(hover:hover) and (pointer:fine)`, pour garder le comportement desktop sans réserver une bande à l'émulation tactile.
4. `page-in` conserve sa durée de 180 ms et son fondu d'opacité `.92 → 1`, sans transformer l'ancêtre des éléments fixes. La chorégraphie spécifique de `plan-motion.css` reste intacte.

## Vérifications du sous-agent

- `git diff --check` : réussi.
- Build Vite isolé dans `/tmp/pixelito-shell-20261116` : réussi, sans modifier les sorties `dist` partagées ni ouvrir de port. Avertissement existant de chunk JavaScript supérieur à 500 kB ; aucun échec CSS.
- Comparaison littérale des cinq gradients avant/après avec `HEAD` : identiques.
- Rendu des neuf routes par `createSeoHandlers` en mémoire, avec le renderer SSR déjà disponible et le build CSS isolé : un seul skip link, bonne cible et CSS initial dans le `head` sur chaque route. Aucun listener HTTP utilisé. Résultats : `shell-static.json`.
- Le SSR de ces vérifications provient de `dist/ssr` présent au début du lot ; les changements du sous-agent sont exclusivement CSS. Le contrôle complet final du parent doit reconstruire les sorties courantes avec les modifications parallèles.

## Validation interactive à compléter par le parent

Émulation tactile à 320/375/390/430 px : largeur du document, menu, fond au sommet et scroll. Clavier : Tab révèle le lien, Entrée atteint le contenu, Tab suivant quitte le lien et le masque ; focus non clavier : pas de révélation. Navigation directe et changement de route : absence de flash du lien et de saut de barre mobile, y compris en mouvement réduit.

Le rebond et la barre d'adresse dynamique d'un vrai Safari iOS ne sont pas reproduits par la seule émulation desktop. Cette limite doit rester explicite jusqu'à un contrôle sur appareil. Le correctif rend le canvas du document cohérent dès le CSS initial ; il ne constitue pas une preuve de comportement de chaque version de Safari.
