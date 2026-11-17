# Header mobile et transitions des cartes — 17 novembre 2026

- Header mobile de 88 à 68 px hors zone système. À 320 et 430 px, la capsule mesure 54 px, et la navigation et le contact gardent chacun une cible de 44 px. Avec une safe-area de 59 px en émulation, le header mesure 127 px et la carte Business se recentre à 126,80 px.
- Ouverture et retour à 560 ms. Le navigateur intégré a mesuré le raccord natif aller et retour à 1 280 px, ainsi que l'entrée CSS et le fondu de retour à 430 px en émulation tactile.
- L'option Liens de paiement est placée sous Boutique dans le configurateur public. Son bloc se replie et réapparaît en 560 ms. Mesures avec le pointeur, accordéon ouvert : hauteur 147,9 → 0 → 147,9 px à 430 px et 115,9 → 0 → 115,9 px à 1 280 px. Le haut de Boutique est resté à 630,55 px et 653,84 px, respectivement. Deux clics rapprochés ont rétabli le choix et la hauteur attendus.
- Le compteur de pages se déplie sous le choix, le sous-menu mobile Forfaits s'ouvre et se ferme progressivement, et le rappel de prix apparaît et disparaît en fondu sur ordinateur.
- Dans la galerie, le filtre Business passe de neuf références à deux et la première carte parcourt 12 px avant de se stabiliser. Le logo ne rejoue pas son introduction lorsque le filtre change.
- La réduction des animations et l'absence d'erreurs console ont été vérifiées dans l'aperçu final. Les essais à 320 et 430 px ont été faits en émulation dans le navigateur intégré. Aucun iPhone physique ni mesure de fréquence d'image.
- TypeScript, builds client/SSR/Sites et 314 tests validés avec `npm run check`.
