# Stabilité de la carte et transitions — 5 novembre 2026

Demande : empêcher le rétrécissement à la sélection et améliorer les six parcours accueil/fiche, dans les deux sens. Contrôles exclusivement dans l’IAB, sans envoi de formulaire.

## Causes et correction

- Quatre à cinq choix activait sept règles compactes : carte de 679,55 à 580 px et H1 de 64 à 50 px. Ces règles et leurs transitions sont retirées. Après correction : 679,03 à 679,03 px, H1 constamment à 64 px. Le premier choix agrandit normalement le résumé : 580 à 620,03 px, sans passer sous sa hauteur initiale. Viewport à l’échelle 1 ; gutter stable réservant la place de la scrollbar publique.
- L’écouteur global de mouvement de souris terminait la capture native dès que le pointeur bougeait. Il ne réagit maintenant qu’aux actions : pression, clavier, molette ou déplacement tactile. Changer et le retour restent utilisables pendant l’arrivée.
- La disparition du contexte natif relançait le fondu ordinaire de page et des animations imbriquées. L’arrivée reste marquée pour la clé de navigation courante ; aucun second mouvement après la fin native.
- La surface sortante disparaissait trop tôt au retour et laissait un rectangle presque vide. Son fondu intervient en fin de déplacement ; l’état coloré de la petite carte correspond à la capture puis rejoint son survol ordinaire.

Transition partagée de 760 ms, accélération/décélération coordonnées, titre aligné sur son ancre réelle, copie à sa résolution finale, page entrante vivante et séquencement du panneau d’options, du titre et du total. Aucun filtre animé, aucune mise à l’échelle d’image ou nouvelle source.

## Vérification locale finale

`final-desktop-journeys.json` et `final-mobile-journeys.json` couvrent Vitrine, Connecté, Immersif 3D, Sur mesure, Évolution et Refonte dans les deux sens. Les 24 trajets ont une animation native de 760 ms, une racine stable après arrivée (opacité 1, aucune transformation/animation tardive), aucun débordement et une différence de scroll de retour de zéro. Texture fixe de 580 px sur ordinateur, 500 px sur mobile.

`final-interactions.json` couvre le pointeur, Changer, un changement vers Refonte, un aller-retour rapide au clavier et la réduction du mouvement activée après rendu du lien. Aucun état de navigation périmé ; réduction prioritaire. `after-late-entrance.json` confirme la disparition du second effet après 1,1 s.

`all-options-stable-size.json` vérifie la fin du remplissage jusqu’à douze choix : largeur et titre constants, hauteur constante ou croissante. `option-reflow-regression.json` observe les glissements de 620 ms et la sortie de 420 ms, puis zéro copie/animation après stabilisation. Choix locaux initiaux (anglais, réservation, maintenance) restaurés. Console sans erreur/alerte ; viewport réinitialisé et onglet local fermé.

## Preuves visuelles et limites

Les JPEG `live-open-frame-301ms.jpg`, `live-open-frame-551ms.jpg`, `live-close-frame-296ms.jpg` et `live-close-frame-554ms.jpg` viennent des frames réellement peintes du screencast CDP, acquittées pendant l’interaction. Surface remplie pendant le retour, header fixe et apparition progressive inspectés. Un dernier ajustement a ensuite avancé et prolongé le fondu du titre de la petite carte ; les matrices finales portent sur cette dernière version.

Les captures exploratoires demandées à un instant « pausé » avaient été stabilisées par l’outil. Elles ne prouvent pas un milieu d’animation et sont conservées hors dépôt dans `/tmp/studio-stable-motion-exploratory/`. Les premiers fichiers `desktop-*`, intermédiaires, sont conservés dans ce même répertoire temporaire ; seuls `final-*` établissent la matrice finale. Les mesures et frames documentent le fonctionnement, sans promettre un débit d’images identique sur tout appareil.

## Revue React et guide de transition

Guide `vercel-react-view-transitions` utilisé pour les six ouvertures, retours, changements de fiche et le header persistant. Adaptation au propriétaire existant du cycle natif : React Router sur React 19.2 stable. Aucun passage à Canary ni dépendance ajoutée ; flou des recettes écarté pour préserver les images approuvées. Les chargements différés sont résolus avant capture par le mécanisme existant.

Revue `vercel:react-best-practices` : hooks inconditionnels, effet de layout lié à la clé de navigation, garde de contexte avant mesure, état minimal d’arrivée, géométrie lue par lot, nettoyage des écouteurs conservé. Menu et contrôles hors de la copie capturée. Aucun changement de prix, calcul serveur, stockage, données privées ou garde de brouillon. Moteur de replacement et sources d’images inchangés. Tests métier existants et matrice navigateur pertinents ; aucun test recopiant les règles CSS ajouté.

`npm run check` final : TypeScript, build et 213 tests passent (`check.log`). `git diff --check` propre. Les trois textures originales sont identiques octet pour octet à la révision précédente (`original-images.json`). Serveur local arrêté. Publication consignée après exécution dans le suivi et `ops/DEPLOYMENT_STATUS.md`.
