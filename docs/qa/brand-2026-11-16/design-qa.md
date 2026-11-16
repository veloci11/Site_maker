# Logo Pixelito — contrôle du 16 novembre 2026

Final result: passed (version SVG locale et publication HTTPS).

## Référence et périmètre

Source sélectionnée : `docs/asset-sources/brand/pixelito-selected-2026-11-16.png`. Trois bandes décalées noir/lavande/bleu et lettres noires grasses. Dernière demande : SVG réel, symbole et mot dissociables, fichiers nommés `logo-pixelito`. Les essais de compagnon orange sont remplacés ; les autres travaux en cours sur les pages légales et le rendu SEO ne font pas partie de cette livraison.

## Vérifications

- Typographie : silhouettes de la capture vectorisées en tracés par Potrace, sans substitution de police ni texte SVG dépendant d'une police installée. La police Geist du contenu du site reste inchangée.
- Composition : proportions du logo complet conservées ; symbole et mot chargés dans deux fichiers SVG indépendants. Le logo complet contient aussi deux groupes identifiés. Trois groupes de bandes dans le symbole.
- Couleur : noir #080808, dégradé lavande/bleu échantillonné sur la référence, grain statique SVG. Aucun bitmap intégré. Comparaison visuelle de la référence avec le vrai rendu IAB dans `comparison-svg.png` : forme, mot et direction de couleur conformes ; les pixels visibles dans l'agrandissement du screenshot proviennent de la capture à DPR 1, pas du fichier SVG.
- Interface : barre publique, menu mobile et pied de page contrôlés visuellement. Logo 168 × 36,16 px dans la barre de bureau ; 92 px de large au viewport 320 px, sans débordement (document 305 px avec barre de défilement). Menu mobile : logo entier et nom accessible « pixelito ».
- Interaction : le clic sur le logo du pied de page ramène à scrollY=0 ; fermeture du menu par Échap conservée. Aucun changement des actions Forfaits ou Contact.
- Espace privé : composant commun utilisé dans son en-tête et son chargement ; code revu, aucune connexion à un compte client effectuée.
- Chargements : symbole seul avec pulsation d'opacité discrète ; règle prefers-reduced-motion désactivant l'animation conservée. Aucune promenade de personnage, couleur aléatoire ou ancien masque de logo dans le CSS livré.
- Icônes : PNG 16/32/48/180/192/512 rendus depuis le symbole SVG, favicon.ico multi-tailles et manifeste reliés au head. Les onze fichiers servis localement correspondent octet pour octet aux exports (`local-assets.json`).
- Validation : TypeScript, build et 284 tests passent sur un export du staging isolé. Rebuild après retrait d'une ligne CSS appartenant à une autre tâche. Aucune erreur ou alerte console observée dans l'IAB.

## Preuves

`local-svg-desktop.jpg`, `local-svg-mobile.jpg`, `local-svg-menu.jpg`, `local-svg-footer.jpg`, `local-svg-logo.jpg`, `comparison-svg.png`, `local-assets.json`. La publication et les contrôles HTTPS seront consignés dans le rapport de déploiement.

## Publication vérifiée

Révision applicative `ca178280eed0026379524620a6fa016ed07d08ea`, release `20261116T204453Z-ca178280eed0` sur `https://gilmathis.com/`. Les seize contrôles HTTPS confirment les quatre pages et les douze ressources livrées : tous les SVG, icônes, manifeste et client correspondent au build revu par SHA-256. Le head référence le nouveau favicon sur les pages publiques et la connexion.

Rendu IAB public contrôlé à 1280 × 800 et 320 × 740 : logo entier dans la barre et le menu, aucune largeur excédentaire, même signe dans le pied de page. Le clic du logo du pied de page ramène bien à scrollY=0. Aucune erreur ni alerte console observée dans l'onglet public. Captures `public-svg-desktop.jpg`, `public-svg-mobile.jpg`, `public-svg-menu.jpg`, `public-svg-footer.jpg` et `public-svg-header.jpg`.

Sauvegarde privée faite avant la bascule. Santé valide ; catalogue inchangé (trois offres publiques, 28 définitions de fonctionnalités dont les anciennes conservées), paiements désactivés et prix identiques. Les 22 autres services actifs gardent leur état et leur PID. GP Park, arrêté avant cette tâche, reste inactif. Le contrôle de livraison historique attendait des valeurs devenues anciennes (quatre offres et 26 fonctions) et a provoqué un retour automatique à la version précédente ; la comparaison utilise désormais les vraies valeurs du catalogue avant/après, sans changement métier.

Notre serveur local (port 4183) est fermé ; aucun processus appartenant à une autre tâche n'a été arrêté. Viewport restauré, onglet local fermé, onglet public conservé. Tailscale remis à son état arrêté initial. Les modifications légales et SEO concurrentes restent hors de cette release.
