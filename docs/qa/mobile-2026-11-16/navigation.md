# Retours vers les forfaits — 16 novembre 2026

## Comportement attendu

Retour du navigateur et « Tous les forfaits » rejoignent les cartes de l’accueil, quel que soit le point d’entrée : carte Vitrine/Business/Premium, comparatif ou menu Forfaits, y compris le menu depuis FAQ. Sur ordinateur, le titre et la rangée des offres reviennent sous la navigation. Sur mobile, la carte du forfait courant revient sous la navigation. Après « Changer », le forfait courant est la cible du retour.

## Causes trouvées dans le code

- Le retour conservait la page d’entrée. Une entrée par `/forfaits` revenait au tableau ; une entrée depuis FAQ ne disposait d’aucune origine de type liste.
- Le recadrage visait toujours le début de `#forfaits`. Les cartes Business et Premium, empilées sous Vitrine sur mobile, restaient donc hors champ.
- Le navigateur gardait `history.scrollRestoration = 'auto'`, en concurrence avec le défilement effectué par `ScrollTop` dans son effet de layout.
- « Changer » ajoutait une entrée d’historique : un Retour pouvait réouvrir l’ancien forfait au lieu de quitter la configuration courante.

## Correction

Fichiers fonctionnels modifiés : `src/App.tsx`, `src/lib/plan-return.ts` et une option de navigation dans `src/pages/configurator/index.tsx`.

`ScrollTop` garde la maîtrise du défilement avec `scrollRestoration = 'manual'`. Le réglage précédent est restitué au démontage du composant. Un Retour accepté est reconnu par l’action `POP` et l’index d’historique décroissant ; les liens ordinaires et les Avance du navigateur ne sont pas redirigés.

Pour conserver le comportement des autres pages, leurs positions sont mémorisées par clé d’historique dans une `Map` en mémoire, bornée à 100 entrées. Les POP ordinaires retrouvent leur défilement précédent ; le recadrage public des offres reste prioritaire. Cette mémoire ne contient que des clés opaques et des coordonnées de défilement, sans contenu ni stockage navigateur. Les fiches portant `?projet=…` ou `?projectId=…` sont exclues du parcours public, à la source comme à la destination : `/espace → fiche privée → Retour` conserve `/espace` et sa position.

La position est échantillonnée pendant le défilement passif et au début des événements `pointerdown`/`click`, avant la navigation. Le nettoyage persiste cet échantillon sans relire `scrollY`, pour rester indépendant d’un éventuel bornage du défilement lors d’un changement de DOM. Le capteur vérifie également la clé de l’entrée active pour rejeter un événement tardif après un changement d’historique. Le test unitaire de bornage protège ce cas ; il ne correspond pas à un défaut reproduit en IAB.

Les premiers relevés IAB de la galerie (`gallery-return.json`, `gallery-return-fixed.json`) présentaient un retour de `740` à `367` ou de `844` à `419`. Le traçage temporaire a montré que l’outil de clic recentrait automatiquement le déclencheur du menu avant `pointerdown`, avec la galerie encore entièrement montée et le menu fermé. Le retour restaurait exactement cette position modifiée par le contrôle. Le parcours par interaction AX directe a conservé `740` avant ouverture du menu, après ouverture et après FAQ → Retour : `gallery-return-direct.json`. Les traces de diagnostic sont conservées dans `scroll-debug.json` ; toute instrumentation a été retirée du build final.

Quand un Retour sort d’un forfait vers une autre page que l’accueil sans fragment, la destination est remplacée par `/`. Le helper conserve le forfait de départ jusqu’au montage de l’accueil. Un ancien fragment, par exemple `#comparer`, est également retiré pour éviter un nouveau défilement vers le tableau. « Tous les forfaits » vise aussi `/`, y compris depuis une fiche ouverte directement.

Le helper mesure les cartes réellement rendues. Si elles sont sur plusieurs lignes, il aligne la carte du forfait courant sur la hauteur de navigation. Si elles partagent la même ligne, il aligne la section complète. Le sélecteur cible l’ancre principale `.pricing-card[href="/forfaits/{slug}"]` de `PricingCard` ; le libellé Configurer reste un `span` interne. Les cartes et le logo ne sont pas modifiés par cette correction.

« Changer » utilise `replace: true`, en conservant `preventScrollReset: true`. Un seul écran de configuration demeure dans l’historique du parcours ; le retour quitte le forfait courant. Le changement reste soumis au bloqueur de navigation existant.

Le chemin des View Transitions est conservé : la préparation continue seulement après acceptation du routeur, et le recadrage s’effectue dans l’effet de layout avant la capture entrante. Le helper fonctionne aussi quand il n’existe aucune préparation de transition. Le SSR n’exécute pas les effets de layout ; le rendu initial du contenu est conservé.

## Vérifications exécutées

- `node --test tests/plan-return.test.mjs tests/plan-transition-locations.test.mjs` : **29 tests réussis** après contre-revue et correction du bornage du défilement.
- `npm run typecheck` : réussi.
- `git diff --check` : réussi au contrôle initial du lot.
- Premier `npm run check` intégré, exécuté par le parent avant les protections des fiches privées et des POP ordinaires : **300/300 tests**, build client et SSR réussis. Le check complet doit être répété pour le dernier patch.

Les 21 tests du retour couvrent les trois forfaits sur rangée et cartes empilées, l’entrée par le comparatif, l’entrée par FAQ/menu, une fiche directement ouverte, le retour après Changer avec et sans préparation native, un ancien hash d’accueil, la distinction Retour/Avance/liens intentionnels, la restauration de la galerie filtrée et les fiches privées avec chacun des deux paramètres historiques. Le test de bornage reproduit `740 → 367` avant le nettoyage de l’ancien DOM et vérifie un Retour à `740`. Les huit tests de transition existants vérifient les véritables extrémités publiées par React Router pour PUSH/Retour/Avance.

Ces tests valident la politique de navigation et la géométrie du helper avec un environnement DOM contrôlé. Ils ne constituent pas une preuve du résultat visuel dans un navigateur.

## Parcours IAB à mesurer lors de l’intégration

Contrôle assuré par l’agent parent, avec le build client + SSR complet et sans Chrome :

1. À 390 px puis 320 px, ouvrir chacun des trois forfaits depuis une carte partiellement masquée et utiliser Retour. Relever la position finale de sa carte et le bas de la navigation après stabilisation.
2. Depuis le comparatif, ouvrir Business puis Premium et utiliser Retour : vérifier l’URL `/` et la carte correspondante, sans retour au tableau.
3. Depuis FAQ, ouvrir le menu mobile, choisir Business, puis Retour : vérifier le menu fermé et la carte Business sur l’accueil.
4. Depuis Vitrine, utiliser Changer vers Premium puis Retour ; répéter avec « Tous les forfaits » : vérifier la carte Premium, sans réouverture de Vitrine.
5. Répéter les cas essentiels avec View Transitions indisponible et avec mouvement réduit ; contrôler aussi une entrée d’accueil contenant `#comparer`.
6. Sur ordinateur, vérifier le titre et la rangée des offres sous la navigation, puis Avance du navigateur pour vérifier la réouverture du forfait.
7. Galerie filtrée et défilée → FAQ → Retour : vérifier le maintien du filtre et du défilement. Vérifier séparément espace privé → fiche de projet → Retour sans redirection publique.

Les preuves IAB restent à ajouter par l’intégration. Aucune publication, ouverture de localhost ou session Chrome n’a été effectuée par l’agent navigation.

Le parent a validé les parcours IAB Business, Premium, menu, Changer et mouvement réduit. Le parcours galerie a également été validé avec interaction AX directe : `740 → FAQ → Retour → 740`, menu fermé et galerie conservée. Les premiers relevés de galerie sont des diagnostics de l’automatisation, pas des échecs produit.
