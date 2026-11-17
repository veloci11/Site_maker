# Fluidité des forfaits, trois offres sur mobile et logo

16 novembre 2026. État : publié et contrôlé sur `https://gilmathis.com/`, révision `c128e4213fa8a117d55908c17a922abb6ad019e9`, release `20261117T043244Z-c128e4213fa8`.

## Demandes et réalisation

- **Animation des forfaits : corrigée localement.** Le chemin mobile capture une seule texture. Un canevas fixe se déplace avec une échelle uniforme et un recadrage, sur 360 ms ; les dimensions ne sont plus interpolées et les glyphes restent dans le DOM réel. Leur fondu de 140 ms se joue après le retrait de la surface native, pour être visible ; le changement entre forfaits garde ses fondus de texture dans les 360 ms du raccord. L'animation d'arrivée sans paire est courte, sans zoom du texte. Le desktop conserve ses trois calques et 760 ms. Le ResizeObserver sticky ne mesure plus la carte mobile pendant les sélections.
- **Logo : corrigé localement.** Son payload innerHTML et son composant sont mémorisés ; la clé dépend de pathname+search, sans hash. Le SVG choisi reste identique : ses trois bandes sont placées dans des calques HTML séparés pour animer leurs transformations sans recalculer la géométrie SVG. Même animation de 720 ms et mouvement réduit conservé. Aucun changement aux SVG exportés et favicons.
- **Comparatif mobile : trois offres simultanées.** Trois colonnes d'égale largeur, critères et détails sur toute la ligne, vrais liens Configurer de 44 px minimum. Noms, prix et boutons restent fixes dans le scrollport vertical. Le helper, les tests et les styles de l'ancien choix de paire ont été retirés. Données, montants et comparatif desktop conservés.

## Vérification

1. **430 px, trois offres et scroll interne : réussi.** Trois noms, trois prix, trois CTA et trois valeurs par critère ; aucun sélecteur. Le scroll interne passe de 0 à 838,5 tandis que le thead garde sa position et que le scroll de page reste 2714,5. Captures `01-three-offers-430.jpg`, `02-three-offers-sticky.jpg`.
2. **320 px avec safe-area 59/34 : réussi.** Document 320 px, scrollport 278 px sans débordement horizontal ; les trois CTA font 44 px de haut. Nom Premium sur deux lignes et prix complets. Les 15 détails se dévoilent et se replient. Capture `05-three-offers-320.jpg`, mesures `small-details-reduced.json`.
3. **Raccord : réussi.** Depuis le vrai bouton Business du comparatif : un seul nom `plan-connecte`, animation `plan-mobile-surface`, échelle uniforme. Depuis Vitrine à 320 px : cinq observations du canevas 280 × 533,766 px constant pendant que transformation et recadrage évoluent. Fichiers `03-mobile-surface-frame.jpg`, `fixed-canvas-samples.json`. Le fondu réel est observé après disparition de la phase native, opacité 0 puis 0,190 (`visible-copy-fade.json`). Changer Vitrine vers Business : groupe .36 s, feuilles .14/.22 s, zéro capture après stabilisation et bouton toujours 44 px (`switch-cleanup.json`).
4. **Logo : réussi.** À 1280 px, matrice identité et identifiant de gradient conservés en ouvrant/fermant Forfaits et en allant à #forfaits. FAQ déclenche un nouvel identifiant et la matrice de l'introduction. Burger à 320 px : logo au repos, panneau borné 288 × 398 px. `logo-desktop.json`, `logo-mobile.json`.
5. **Retours et fonctionnalités : réussi.** Retour navigateur en mouvement réduit depuis Premium : carte à 147,094 px pour un header de 147 px, sans capture ni animation. Sélection/retrait Langue : Environ 990 € puis base 890 €, aucune copie de sortie restante, aucune mesure sticky ni débordement. `selection-removal.json`.
6. **Ordinateur : réussi.** À 1280 px, profil full, durée .76 s, noms plan-connecte / heading / content. `desktop-motion.json`. Aucun changement au masquage du tableau au scroll.

`npm run check` : TypeScript, builds client/SSR/Sites et **321 tests passent**. Quatre tests de géométrie vérifient ouverture/retour réversibles, bouton étroit sans étirement, coordonnées négatives/carte longue et rejet des nombres invalides. Deux relectures indépendantes ont validé géométrie, retour, SVG/SSR, logo et accessibilité du comparatif ; la relecture a corrigé le fondu masqué du texte et les anciennes durées de changement entre forfaits. Aucune alerte console observée sur les parcours locaux. Aucun formulaire envoyé.

## Mesures de performance et limites

`performance-before-after.json` compare la version publiée précédente avec la correction locale, mêmes dimensions 430 × 932 et DPR 3, parcours Vitrine préchauffés et fenêtre de stabilisation 550 ms. Les compteurs Performance de Chromium donnent :

| Action | Layouts avant | Layouts après | Durée layout avant | Durée layout après |
| --- | ---: | ---: | ---: | ---: |
| Tous les forfaits | 85 | 16 | 9,607 ms | 3,043 ms |
| Ouvrir Vitrine | 80 | 14 | 7,854 ms | 3,004 ms |
| Retour navigateur | 80 | 14 | 8,991 ms | 3,150 ms |

La première optimisation de surface seule ne suffisait pas : une navigation FAQ sans carte produisait elle aussi 85 layouts, ce qui a conduit à composer séparément les bandes du logo. Les durées totales de tâche ne baissent pas uniformément ; les compteurs montrent surtout une réduction du travail de layout, pas une garantie de fréquence d'affichage. Ce contrôle utilise l'IAB en émulation et ne constitue pas une mesure FPS sur un iPhone physique.

## Contrôle public et fermeture

IAB HTTPS : à 1280 px, ouvrir Forfaits garde le logo à sa matrice identité, avec ses trois calques. À 430 px avec safe-area 59/34, les trois offres et les quinze rangées de trois valeurs sont présentes ; document 430 px sans débordement, fondu supérieur 180 px et wrapper transparent conservés. Capture `06-public-three-offers.jpg`. Le premier clic froid du comparatif charge encore son module à 100 ms ; le contrôle préchauffé depuis la carte Business observe ensuite une seule capture, profil compact, animation plan-mobile-surface de .36 s, canevas 390 × 465,523 px. Retour : carte Business à 147,211 px pour un header de 147 px. Aucune alerte console mobile ou desktop. Preuve `public-browser.json`.

Le client et les deux CSS HTTPS correspondent au build par SHA-256, santé et thème/manifeste blancs valides (`public-integrity.json`). Sauvegarde privée et préflight Node24/SSR réussis avant bascule atomique. Les trois offres, les 28 définitions, prix et identifiants historiques restent identiques. Seul site-maker.service redémarré ; 22 autres services/PID inchangés et GP Park inactif (`deployment-origin.json`). Tailscale déjà actif laissé inchangé.

Serveur de cette tâche arrêté : PID 75792, port 4183 vérifié fermé. Compteurs de performance désactivés, émulations et viewport retirés, quatre onglets de contrôle fermés ; seule la nouvelle prévisualisation publique est conservée.
