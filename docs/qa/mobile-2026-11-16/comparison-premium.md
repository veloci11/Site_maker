# Comparatif mobile : signalement de zone blanche après Premium

Signalement lu dans `docs/SUIVI_DEMANDES.md` après la livraison commerciale de l'accueil. Cette revue conserve la nouvelle copie commerciale et analyse uniquement le comparatif. Le terme « platinum » du signalement est interprété comme le bouton « Premium / 3D », seule troisième offre publique.

## Analyse du code

`OfferComparison` rend quatre cellules par ligne : une colonne Fonctions et exactement trois colonnes de forfaits. Aucune quatrième colonne de forfait ni cellule vide supplémentaire n'est générée.

À ≤760 px, `.comparison-table` mesure au minimum 486 px, en disposition fixe. La première colonne mesure 108 px ; les trois colonnes d'offre se partagent les 378 px restants, soit 126 px chacune. Le scroll horizontal appartient à `.comparison-scroll` ; le document ne doit pas gagner la largeur du tableau.

`showOfferColumn` mesure le bord gauche de la colonne choisie et le bord droit de Fonctions, qui est sticky, puis demande leur différence par `scrollBy`. Pour Premium au repos, cela demande 252 px. Lorsque la zone fait 348 px de large, la limite native vaut seulement `486 - 348 = 138 px` : le navigateur bride donc cette demande. Cette géométrie ne crée pas, à elle seule, une zone supplémentaire de 126 px à droite.

Une première vérification du code ne trouve ni padding droit correspondant à une offre ni largeur supplémentaire imposée par le sélecteur. Les textures sont rognées dans leurs propres conteneurs.

## Preuve IAB fournie par le parent

À 390 px, tactile, DPR 3, après choix Premium : `clientWidth=348`, `scrollWidth=486`, `scrollLeft=136.5`, tableau de 486 px, label de 108 px et trois offres de 126 px. Le bord de la dernière colonne reste dans la zone. `09-comparison-premium-before.jpg` montre Business et Premium, sans quatrième colonne ni zone blanche après Premium.

`10-comparison-320.jpg` montre également Premium dans le cadre après défilement. Cette image seule ne fournit pas les mesures de scroll ni la preuve d'un swipe en butée.

Le signalement de blanc n'est donc **pas reproduit** dans ces captures de navigateur de bureau émulant le tactile. Elles ne couvrent pas le rebond d'un vrai Safari iOS.

## Mesures utiles si le blanc réapparaît

Sur la page où il apparaît, relever avant le clic, après stabilisation, puis après un second clic Premium : `scrollLeft`, `clientWidth`, `scrollWidth`, rectangle du scrollport, rectangle du tableau, rectangles des quatre `thead th` et du dernier `td`. Répéter avec détails fermés/ouverts et après un swipe horizontal en butée, en gardant la capture du blanc.

- Si `scrollLeft > scrollWidth - clientWidth`, la zone est un dépassement élastique plutôt qu'une colonne du tableau.
- Si `scrollWidth` dépasse la largeur du tableau, rechercher l'élément débordant ; une simple borne sur `scrollWidth` ne supprimerait pas ce contenu.
- Si le bord droit du tableau reste loin du bord du scrollport à une position pourtant légale, comparer sa largeur avec les cellules et la réserve de scrollbar.

## Adaptation locale après analyse

Le parent a demandé une amélioration explicite d'ergonomie et de robustesse, sans qualifier le blanc de reproduit : afficher un forfait entier à côté de Fonctions, conserver les onglets et le glissement, borner la cible au tableau et désactiver son seul rebond horizontal.

- À ≤760 px, le tableau mesure maintenant `calc(300% - 2 * 108px)`, avec un minimum de 486 px. La première colonne reste à 108 px ; les trois colonnes d'offre égales occupent chacune la largeur visible moins ces 108 px. L'en-tête et les intitulés restent sticky dans le scrollport natif. Les onglets utilisent désormais le même breakpoint mobile de 760 px.
- `showOfferColumn` utilise une cible absolue `scrollTo`, calculée à partir du bord interne du scrollport et de la largeur du label. Elle ne dépend plus du déplacement du label sticky. La cible est bornée à la fois par la limite native et par le vrai bord droit du tableau, pour ne pas viser une éventuelle zone de débordement indépendante.
- `.comparison-scroll` reçoit `overscroll-behavior-x:none`. La politique verticale reste inchangée.

Le calcul est dans `src/lib/comparison-scroll.ts` et couvre les positions intermédiaires d'un défilement, les valeurs hors limites et les bords fractionnaires. `tests/comparison-scroll.test.mjs` comprend huit tests utiles : les trois offres à 320/375/390/430/760 px depuis plusieurs positions, un scrollWidth augmenté par du contenu indépendant, un bord de tableau fractionnaire et un tableau sans débordement. **8/8 tests, typecheck et diff-check réussis.** Les valeurs hors limites sont simulées ; il ne s'agit pas d'un essai Safari.

Mesures attendues avec la géométrie actuelle :

| Viewport | Largeur interne du scrollport | Tableau | Label | Chaque offre | Cibles Vitrine / Business / Premium |
|---|---:|---:|---:|---:|---|
| 390 px | 348 px | 828 px | 108 px | 240 px | 0 / 240 / 480 px |
| 320 px | 278 px | 618 px | 108 px | 170 px | 0 / 170 / 340 px |

Le parent doit relever ces dimensions après rebuild, cliquer successivement les trois onglets puis les recliquer dans l'ordre inverse, tester un glissement en butée et ouvrir les détails. À chaque destination stabilisée, l'offre choisie commence au bord droit des intitulés et se termine au bord droit interne du scrollport. Vérifier aussi les intitulés ancrés pendant le scroll vertical et le maintien du tableau desktop.

## État

Pas de reproduction d'une quatrième colonne et pas de cause Safari affirmée. L'adaptation locale est une amélioration demandée de lisibilité et de bornage, à distinguer d'une résolution démontrée du signalement initial. Vérifications IAB après adaptation et publication à réaliser par le parent.
