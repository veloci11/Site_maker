# Logo animé et reprise mobile — 16 novembre 2026

Final result: passed (local et HTTPS, version finale publiée).

## Parcours et résultat

1. **Accueil et navigation — contrôlé.** Introduction de 720 ms sur le symbole choisi, mot fixe. Les deux bandes noires émergent du dégradé, léger gonflement puis forme finale. Trois phases réellement capturées (`logo-intro-0.jpg`, `logo-intro-5.jpg`, `logo-intro-13.jpg`) et matrices CSS relevées. Aucun délai ni écran de blocage ajouté. Le symbole exact est intégré au HTML depuis le SVG généré, sans requêtes séparées pour les bandes. Les SVG publics et le favicon transparent restent identiques.
2. **Chargement — contrôlé.** Sur la vraie route Connexion avec réseau temporairement ralenti de 1400 ms, la fonction partagée PixelitoLoading tourne les bandes autour du dégradé. Matrices de rotation évolutives dans `loader-frames.json`, captures `loader-0.jpg` et `loader-7.jpg`. La simulation réseau est retirée après contrôle. Mouvement réduit : aucune animation ni transformation de groupe ; le texte de statut reste présent.
3. **Shell et menu mobiles — contrôlé.** Fond statique partagé avec la racine, rendu initial CSS, plus de réserve artificielle de scrollbar sur pointeur tactile. Le lien Aller au contenu reste masqué au repos ; Tab le révèle à 12 px du haut et Entrée place le focus sur main-content. Il est ensuite masqué. Fondu général de page sans transform pour ne pas déplacer le contenant de la barre fixe. Défilement tactile natif conservé ; menu borné avec safe areas et overscroll vertical contenu.
4. **Forfaits et Retour — contrôlé.** À 390 et 320 px, la carte Business/Premium revient sous la navigation (top≈88 px, bas navigation 88 px). Entrées cartes, menu depuis FAQ et comparatif vérifiées ; Changer Business→Premium remplace la configuration et Retour cible Premium. Même résultat avec mouvement réduit. Les fiches privées projet/projectId sont exclues de la réorientation publique et couvertes par les tests, sans connexion à un compte client.
5. **Comparatif — contrôlé.** Sur téléphone, une colonne entière de forfait à côté des intitulés fixes, boutons et glissement gardés. Mesures390 : labels 108, offre 240, tableau 828, cible Premium 480 ; mesures320 : labels 108, offre 170, tableau 618, cible Premium 340. Bord droit de Premium à 299 px dans le scrollport se terminant à 300 px ; aucun débordement du document (320/320). Les coordonnées de Business de la première lecture320 sont prises avant stabilisation du clic et ne sont pas utilisées comme preuve d'alignement. Le signalement d'une quatrième zone blanche stable n'a pas été reproduit ; bornage explicite au bord du tableau et suppression du rebond horizontal ajoutés, sans affirmer une reproduction sur Safari réel.
6. **Fonctionnalités et formulaire — contrôlé.** À 320 px, sélection Blog sur Premium, total Environ 2640 €, barre fixe alignée au bas du viewport logique (740 px). Une rubrique ouverte ; ouverture de la suivante ferme la précédente. Continuer ouvre les coordonnées, champs 280 px dans viewport 320, aucun débordement. Aucun formulaire envoyé.
7. **Autres retours — contrôlé.** Galerie défilée 740→menuFAQ→Retour740 avec toucher AX direct sur le déclencheur visible. Les premiers essais donnaient367/419 car le locator de test centrait le déclencheur sticky avant de le cliquer ; les traces ont permis de distinguer cet effet du produit. Instrumentation retirée. La mémoire de position est éphémère, bornée à 100 clés, prise avant mutation et sans lecture de rectangles pendant le scroll.

## Vérification technique et contre-revue

TypeScript, build client/SSR/Sites et **316 tests** passent sur l'export isolé du staging. Le code de la release est comparé à cet export ; aucune instrumentation [plan-scroll] n'est conservée. Trois agents : shell/accessibilité, navigation et contre-revue mobile/performance. Ils ont permis de protéger les fiches privées et les retours ordinaires avant publication.

Le fallback de clipping du comparatif n'effectue plus de mesures géométriques ni d'écritures de style pendant le scroll mobile ; abonnement desktop rétabli au changement de breakpoint. Les animations du logo utilisent seulement les transformations des groupes, sans boucle JavaScript ni filtre animé. Les FPS n'ont pas été mesurés : cette revue ne constitue pas un benchmark sur téléphone physique.

## Captures et limites

Les captures avant sont 01/02 ; les captures de la dernière intégration incluent11/12/13. Des changements de copie approuvés ont été livrés en parallèle dans un autre lot ; les différences de texte marketing ne sont pas une décision de cette reprise mobile. Les contrôles IAB utilisent les largeurs logiques 320/390, pointeur tactile et, pour certains passages, DPR3. Certaines captures320 ont une hauteur de capture inférieure au viewport logique de l'émulation ; elles ne servent pas à conclure sur un clavier ou une barre Safari réels. Aucune certification iOS/Safari, accessibilité ou performances physiques n'est revendiquée. Rapports spécialisés : shell.md, navigation.md, comparison-premium.md et review.md.

La publication et les contrôles HTTPS sont consignés après la bascule.

## Livraison HTTPS finale

- Révision applicative `84f34bc96601ef7065a30de9a7e1a3d4abc49f33`, release `20261116T222847Z-84f34bc96601` sur `https://gilmathis.com/`.
- Le client, les SVG de marque et le favicon transparent correspondent au build revu par SHA-256 (`public-assets.json`).
- Parcours public Accueil→Comparer→Premium→Retour : URL `/` sans fragment résiduel, carte Premium à 87,80 px sous une navigation se terminant à 88 px, document 390/viewport 390. Aucune erreur ni alerte console dans le nouvel onglet de validation (`public-final.json`). Capture finale après stabilisation native : `public-return-final.jpg`.
- Les trois ancres internes de l'accueil utilisent maintenant Link : une alerte du routeur observée lors du premier contrôle HTTPS a révélé des entrées de hash natives parallèles à son historique. Le correctif est revérifié localement et sur le public.
- Préflight avec Node24 de production : import serveur et rendu SSR réel avant bascule, décodeur d'images, santé et catalogue valide. Trois offres publiques, 28 définitions, prix et paiements identiques. Sauvegarde privée réussie, 22 autres services/PID inchangés, GP Park reste inactif.

Une première archive a omis le module source src/content/home-copy.ts désormais importé par le SEO serveur ; le contrôle de santé a provoqué un retour automatique à la version précédente. L'archive corrigée inclut ce module et la vérification d'import/rendu précède désormais la bascule. Cette correction de paquet n'a changé aucun texte commercial.

Le localhost de cette tâche est arrêté (4183). Les émulations temporaires et les onglets de contrôle sont retirés, onglet public conservé. Tailscale était déjà actif au moment de la publication, activé par une autre livraison parallèle ; ce lot n'a pas changé son état. Les limites de validation physique et de FPS restent celles indiquées ci-dessus.
