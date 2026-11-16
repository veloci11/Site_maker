# Revue indépendante mobile et performances — 16 novembre 2026

## Périmètre et preuve

Lecture du code accueil, comparatif, configurateur, menu, formulaire court, rendu serveur, hydratation et mouvement réduit. Lecture des captures IAB fournies par le parent ; aucun contrôle du navigateur partagé, Chrome, serveur local, envoi de formulaire, commit ou publication par ce sous-agent. Les fichiers commerciaux parallèles sont conservés.

Fichiers fonctionnels attribués et modifiés par ce sous-agent, après autorisation explicite du parent : `src/pages/public/OfferComparison.tsx`, le bloc mobile du comparatif dans `src/pages/public.css`, le helper `src/lib/comparison-scroll.ts` et sa suite ciblée `tests/comparison-scroll.test.mjs`. Les autres changements restent la responsabilité de leurs auteurs.

## Défauts concrets

### Corrigé : calcul de clipping desktop exécuté au scroll mobile

Dans la version initiale, l'absence de timelines CSS provoquait l'abonnement de `OfferComparison` au scroll de fenêtre sur tous les formats. Même en mobile, chaque scroll de page lisait les rectangles de l'en-tête du tableau, du tableau et du header, puis réécrivait à zéro la variable de clipping des trois `tbody`. Les règles mobiles n'utilisent pas ce clipping : leur propre scrollport et leur en-tête opaque assurent le masquage.

Correction locale dans `OfferComparison.tsx:117` : arrêt avant toute lecture de géométrie en largeur ≤760 px. Les écouteurs `scroll` et `animationend` du fallback sont ajoutés uniquement au-dessus de 760 px et seulement sans support natif. Le changement de breakpoint les retire ou les rétablit, et le démontage les retire tous. Le calcul desktop et les règles de styles du tableau restent identiques.

Preuve : `npm run typecheck` réussi. Exécution isolée du vrai composant compilé, avec hooks, support CSS, géométrie et médias simulés : cas natif oui/non, mobile → desktop → mobile → desktop → démontage réussis. En mobile, zéro lecture de géométrie, zéro écriture de clipping et aucun écouteur de scroll ; le fallback desktop revient à chaque passage au-dessus de 760 px. Ce contrôle ne mesure pas les FPS et n'est pas un test de rendu navigateur.

### Corrigé par le lot shell : contenant temporaire de la barre fixe

L'entrée générale `.motion-page` animait un `transform` pendant 180 ms alors que la barre de prix mobile fixe est dans ce sous-arbre. Cet ancêtre transformé devient le contenant de la barre pendant l'animation, puis cesse de l'être à la fin : il existait donc une cause précise de déplacement initial sur une ouverture directe sans View Transition. Le diff shell remplace cette entrée par son seul fondu d'opacité et conserve la chorégraphie spécifique des forfaits. Diagnostic code confirmé ; aucune chronologie vidéo de ce défaut initial n'est disponible dans les deux premières captures.

### Corrigés après contre-revue : deux effets de bord navigation

1. **P1, dossier privé** : le premier diff de `getPlanBackHref` classait `/forfaits/vitrine?projet=ID` et `?projectId=ID` comme un forfait public. Depuis `/espace`, ouvrir un dossier puis revenir avec Retour remplaçait `/espace` par `/`. Reproduction directe avec le helper : les deux paramètres renvoyaient `/`. Exclure ces dossiers de la normalisation publique ; ne pas confondre leurs routes avec les configurations anonymes.
2. **P2, scroll hors forfaits** : le premier diff plaçait `history.scrollRestoration='manual'` pour toute la durée de l'application. Cela supprimait aussi la restauration native des parcours sans forfait, par exemple Exemples descendu → FAQ → Retour. `ScrollTop` force le sommet au changement de pathname et aucune position par clé n'était conservée pour ce parcours. Borner la restauration manuelle au parcours voulu ou préserver les autres positions.

Ces deux points ont été transmis au parent et corrigés dans le diff relu : les destinations et sources portant `projet` ou `projectId` sont exclues de la politique publique ; une mémoire de scroll par clé de route restaure les autres retours POP, avec une borne de 100 entrées et sans stockage navigateur. Les tests ajoutés couvrent galerie filtrée, retour du privé vers le portail, destination privée et départ privé vers l'accueil. Aucun dossier réel ni envoi n'a été utilisé.

Le contrôle IAB du parent a ensuite révélé une insuffisance réelle de la première mémoire : la galerie quittée à 740 px revenait à 367 px (`gallery-return.json`). Le cleanup lisait le scroll après que le DOM plus court l'avait déjà contraint. Le correctif relu échantillonne maintenant le scroll de la page encore active avant navigation ; il refuse d'écraser cet échantillon dès que la clé d'historique a changé, et le cleanup conserve cette dernière valeur. L'écouteur de scroll ajouté ne lit aucun rectangle et ne modifie aucun style. Un test simule explicitement 740 → 367 pendant le remplacement. Les deux suites de navigation ont été réexécutées par ce sous-agent : **29/29 tests réussis**, aucun ignoré. Le résultat IAB après ce dernier correctif doit être ajouté par le parent.

## Captures initiales effectivement examinées

| Fichier | Observation vérifiable | Limite |
|---|---|---|
| `01-home-before.jpg` | Le lien d'évitement n'est pas visible au repos. Le hero, ses actions, le début des forfaits et le header tiennent dans la largeur photographiée. | Le flash signalé par l'utilisateur n'est pas reproduit sur cette image stable. Une bande de scrollbar de l'émulation est visible à droite. |
| `02-menu-before.jpg` | Logo, fermeture, les cinq entrées du menu et l'action Contact sont visibles ; aucun texte n'est coupé. | L'image seule ne prouve ni le focus, ni la fermeture au choix, ni le comportement sur appareil iOS. |
| `03-home-after.jpg` | Pas de bande latérale distincte visible ; hero et header tiennent dans la largeur, skip link absent au repos et début de la carte Vitrine intact. | Capture stable fournie par le parent, pas une mesure de la fluidité ni du rebond iOS. |
| `04-business.jpg` | Grande carte Business, Changer et barre fixe Continuer lisibles dans le cadre. | Ne prouve pas leur état pendant les premières images d'une transition. |
| `05-return-business.jpg`, `06-faq-menu-return.jpg` | La carte Business revient immédiatement sous la navigation ; Premium suit dans le flux. | La capture 06 est prise pendant l'entrée du symbole du logo ; les bandes noires n'ont pas encore fini leur apparition. |
| `07-options-320.jpg`, `08-form-320.jpg` | Options, montant, Continuer, retour aux fonctionnalités et premiers champs du formulaire restent dans la largeur à 320 px. | Les états de saisie/validation et le clavier logiciel ne sont pas prouvés par ces images. |

Les captures après correction et les mesures interactives restent collectées par le parent dans ce dossier.

Le signalement supplémentaire du comparatif Premium est analysé dans `comparison-premium.md`. Les captures initiales 09/10 ne reproduisent pas de quatrième colonne. Sur demande du parent, le comparatif mobile affiche maintenant un forfait entier à côté des intitulés fixes, conserve onglets et swipe, borne explicitement le défilement au tableau et désactive le rebond horizontal. Huit tests du calcul et le typecheck passent ; les captures après adaptation sont à collecter. Ce lot distingue cette amélioration d'une résolution démontrée du blanc initial.

## Vérifications de structure et limites de performance

- `AmbientGrain` ne contient pas de boucle d'animation. Il peint une fois un canvas de 1180 px de haut, DPR plafonné à 1, puis uniquement après changement de largeur avec un délai de 120 ms. Une variation de hauteur seule ne le repeint pas. Il ne constitue donc pas une cause de repaint JavaScript continu au scroll.
- `Reveal` rend immédiatement son contenu visible, sans timer ni observateur de scroll. Les grands espaces vides ne doivent pas être attribués à un mécanisme de révélation absent de cette version.
- Les déplacements FLIP des options ont une fin, des annulations et un nettoyage. Les clones sortants sont `inert`, `aria-hidden` et hors du calcul de grille. La préférence de mouvement réduit annule ces animations, y compris si elle change pendant la session.
- Les transitions natives sont interrompues par une nouvelle action ou un scroll ; les écouteurs partagés ne sont pas installés une fois par carte. Le compteur global évite cette multiplication. Les animations géométriques et leurs masques durent toujours 760 ms conformément aux décisions conservées.
- Les textures HD approuvées restent lourdes : master environ 2,5 Mio, prolongement long environ 4,3 Mio. Les écrans ≥1,5 dppx peuvent charger le master dès les cartes. Cela peut peser sur une première visite ; les octets transférés, le temps de décodage et les images manquées ne sont pas mesurés ici. Aucun remplacement des matières n'est proposé dans ce lot.
- Le SSR ajoute les vrais CSS de route dans le `head` ; le client attend la résolution du premier module avant d'hydrater. Un brouillon local de forfait utilise volontairement un montage normal pour éviter de l'hydrater sur les choix anonymes du serveur. Aucune lecture de coordonnées du formulaire depuis le stockage navigateur n'a été trouvée.
- Le formulaire garde des contrôles de 16 px, les types e-mail/téléphone et l'autocomplétion. Les champs fermés d'options et de FAQ restent hors de la navigation clavier. Le formulaire attend le montage avant activation et affiche une explication sans JavaScript. Aucun envoi réel effectué.

## Relecture du logo inline et du shell

Le SVG inline reprend les groupes et tracés de l'export choisi ; le mot reste une image vectorielle distincte. Les identifiants de filtre et de dégradé sont préfixés par `useId`, évitant leur collision entre header, pied de page et chargement. Le symbole n'ajoute pas d'élément focalisable et reste décoratif dans le lien déjà nommé.

Les animations d'entrée du symbole sont finies et limitées au header. Seul le chargement boucle, avec `transform` sur les groupes du symbole ; la règle de mouvement réduit annule ces animations. Aucun effet JavaScript par frame n'a été ajouté. Le filtre de grain est statique, mais le coût de sa composition pendant le mouvement n'est pas mesuré sur téléphone réel.

Le lien d'évitement reste dans le SSR et atteint `main#main-content`. Le nouveau masquage associe translation et clip, et son apparition est réservée au focus visible. Les gradients du shell sont centralisés sans changement de couleur et appliqués également à la surface extérieure du document. Le rebond Safari et les barres d'adresse dynamiques restent à tester sur appareil ; une émulation de navigateur de bureau ne suffit pas à les certifier.

## État de livraison de cette revue

Correctif comparatif local, typecheck, contrôle isolé du fallback, **37/37 tests ciblés** (29 navigation et huit ciblage horizontal) et `git diff --check` vérifiés. Les deux effets de bord signalés sont levés dans le diff relu, avec un dernier contrôle IAB requis après la correction du scroll 740 → 367. Aucun autre défaut bloquant identifié dans ce périmètre. Le parent a annoncé un premier check intégré à 300/300 avant ces derniers tests de protection ; le check complet final et les parcours IAB sont à rattacher à la version assemblée. Pas de mesure de fluidité terrain ni de publication réalisée par le sous-agent.
