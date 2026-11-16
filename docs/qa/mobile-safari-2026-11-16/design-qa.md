# Reprise Safari et téléphone — 16 novembre 2026

Final result: passed (local et HTTPS). Révision `169e3a8b65242916d0f3734aa51744ba89dfbeb8`, release `20261116T230338Z-169e3a8b6524`, publiée sur `https://gilmathis.com/`.

## Demande et réalisation

La capture fournie par Mathis montre 177 pixels physiques blancs au-dessus du contenu, soit 59 pixels CSS à une densité de 3. La correction ajoute `viewport-fit=cover`, un fond racine pastel, une surface publique transparente et des safe-areas pour les commandes. Le dégradé peut désormais peindre jusqu'au bord supérieur. La couleur du chrome natif de Safari reste gérée par WebKit : aucune émulation ne constitue une preuve de son rendu sur un vrai iPhone. Référence consultée : [Designing Websites for iPhone X, WebKit](https://webkit.org/blog/7929/designing-websites-for-iphone-x/).

Le menu burger est un panneau flottant, avec entrée de 260 ms et sortie de 220 ms. Sur un écran court, son contenu défile dans le panneau. L'ouverture des forfaits sur téléphone évite les captures multiples du raccord natif et utilise un fondu d'opacité de 140 ms sur la carte réelle. L'effet desktop reste conservé. Le comparatif mobile montre deux offres choisies, avec les intitulés sur toute la largeur et les deux valeurs juste en dessous.

## Contrôles intégrés locaux

1. **Safe-area : réussi.** IAB tactile 430 × 932, densité 3, insets haut 59 / bas 34. Le fond commence à y=0. Header haut de 147 px, padding supérieur de 75 px ; document et viewport de 430 px. Capture `02-safe-area-59.jpg`.
2. **Menu : réussi.** À 430 px, panneau de 360 × 410,35 px, de y=147 à 557,35. Fond extérieur à 18 %. Animation CSS d'ouverture 0,26 s ; état fermé conservé pendant l'animation de 0,22 s, puis nœud retiré. Escape rend le focus à Ouvrir le menu et garde le scroll à 0. Capture `03-menu-open.jpg`.
3. **Écran court : réussi.** À 320 × 568 avec les mêmes insets, panneau de 288 × 387 px, bas à 534 px, espace de 34 px conservé. Les liens du sous-menu restent accessibles ; sélectionner Business ferme le panneau. Barre de prix visible en bas, capture `10-short-mobile-config.jpg`.
4. **Comparaison simultanée : réussi.** À 430 px, Vitrine / Business visibles ensemble. À 320 px, Premium / 3D / Vitrine sans débordement : document 320 px, scrollport interne 278 px de contenu pour 278 px disponibles. Le nom Premium peut revenir à la ligne sans être tronqué ; sélecteurs 16 px. Captures `04-comparison-430.jpg` et `05-comparison-320.jpg`.
5. **Choix et scroll : réussi.** Choisir le troisième forfait remplace une colonne ; choisir le forfait déjà à côté échange les colonnes. CTA et tarifs suivent la sélection. À scrollTop=740, l'en-tête reste à 422,75 px dans le scrollport commençant à 421,75 px ; pageScroll=0. Capture `08-table-scroll.jpg`. Détails et associations de cellules partagent les données desktop.
6. **Ouverture mobile et retour : réussi.** Carte Premium à 320 px : animation réelle 0,14 s, aucune animation du conteneur de page ni nom de capture partagé. Retour depuis Business : carte à 147,09 px, juste sous le header de 147 px. Capture `07-return-business.jpg`. Entrée depuis le menu également vérifiée.
7. **Desktop : réussi.** À 1280 px avec survol/pointeur fin, les trois offres restent présentes dans le tableau existant, sans présentation mobile. Ouverture de Business et arrivée finale contrôlées. Capture `09-desktop-comparison.jpg` ; aucune alerte console observée.
8. **Mouvement réduit : réussi.** Animations de panneau et backdrop ramenées à 0,01 ms par la règle globale. La politique désactive les captures et le fondu de carte. Focus et fermeture restent fonctionnels.

`npm run check` : TypeScript, builds client/SSR/Sites et **318 tests réussis**. Les tests incluent un vrai routeur mémoire pour Retour/Avance après changement de politique, ainsi que toutes les sélections de paires. Journal local ignoré : `.data/deployment/safari-mobile-final-check.log`. Sources relues et `git diff --check` réussi.

## Limites et périmètre

Contrôles faits exclusivement dans le navigateur intégré ; pas de Google Chrome externe, d'iPhone matériel ni de mesure FPS. La suppression des captures coûteuses est vérifiée par la politique et le routeur, sans promettre un débit d'images matériel mesuré. Logo, textes commerciaux, prix, catalogue et questionnaires conservés. Rapports des trois spécialistes : `safari-menu.md`, `motion.md`, `comparison.md`.

## Contrôle après publication

Menu HTTPS à 430 px avec insets de 59/34 : dimensions et animation conformes au local, Escape ferme le panneau et restitue le focus. Capture `11-public-menu.jpg`. Comparatif HTTPS à 390 px : Vitrine et Premium côte à côte, largeur document 390 px et aucune surlargeur interne. Le bouton de détails dévoile les mêmes descriptions et l'ouverture de Premium utilise bien le fondu de 140 ms, sans animation du conteneur. Retour à l'accueil : Premium à 146,80 px pour un header de 147 px. Capture `12-public-comparison-390.jpg`. Aucune alerte console dans ces parcours.

`public-integrity.json` confirme le viewport, la santé et les empreintes du client/deux CSS publics. `deployment-origin.json` confirme la sauvegarde, le préflight runtime/SSR, la santé, les tarifs/catalogue inchangés, les 22 autres services/PID inchangés et GP Park inactif. L'archive inclut bien le module source `src/content/home-copy.ts` utilisé à l'exécution. Tailscale déjà actif laissé inchangé.

Localhost 4183 arrêté (PID 47639, port contrôlé fermé). Viewport et émulations restaurés, onglets temporaires locaux/de recherche fermés et prévisualisation publique conservée.
