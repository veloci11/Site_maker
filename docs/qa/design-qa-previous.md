# Archive — vérification avant le retour du 2 novembre

La révision actuelle est décrite dans le `design-qa.md` à la racine. Le fond et le menu de cette ancienne passe ont ensuite été rejetés par Mathis.

# Vérification visuelle finale — studio

**final result: passed**

Aucun écart P0/P1/P2 restant dans le périmètre visuel et les parcours locaux contrôlés. Ce résultat concerne la version locale ; il ne valide pas une ouverture commerciale, une infrastructure publique ou une conformité juridique.

## Source visuelle et arbitrages

- Source initiale : `docs/reference-cartes-validee.png` (1247 × 1261 px), maquette fournie et validée par Mathis.
- Référence de matière/anatomie : capture réelle ElevenLabs `docs/qa/elevenlabs-reference.jpg` (1265 × 712 px), https://elevenlabs.io/pricing. Ce site est une inspiration, pas une cible à copier à l’identique.
- Les instructions ultérieures priment : couleur uniquement en haut des cartes, aucun aperçu sur l’accueil, quatre liens directs et Accueil, configurateur sans onglets, fond CSS statique avec grain, textes concis. Le changement de titre, de composition du hero et la section comparative sont intentionnels.
- Implémentation ouverte et contrôlée : http://127.0.0.1:4173/ ; build React servi par Express avec API persistante.

## Captures, normalisation et états

Les captures proviennent du navigateur, pas de rendus déduits du code. Le viewport desktop était de 1280 × 720 CSS px, DPR signalé 2. L’API native restitue des images normalisées de 1265 × 712 px, sans barre de défilement. Nous comparons donc les images à la même largeur raster ; aucune mesure au pixel près n’est déduite d’une densité différente. La maquette initiale n’a pas de densité CSS connue.

| Preuve | Dimensions raster / état |
| --- | --- |
| `docs/qa/final-opening.jpg` | 1265 × 712 ; accueil anonyme, titre et CTA, sans aperçu |
| `docs/qa/final-home-full.jpg` | 1265 × 2472 ; page entière, cartes au repos, comparatif fermé et FAQ fermée |
| `docs/qa/final-cards.jpg` | 1265 × 712 ; focus clavier Connecté, pointeur Immersif, états stabilisés |
| `docs/qa/final-immersif.jpg` | 1265 × 712 ; première référence Julie Thiam |
| `docs/qa/final-vitrine.jpg` | 1265 × 712 ; première référence DOMTEKNIKA |
| `docs/qa/final-mobile.jpg` | 375 × 3850 ; viewport 390 × 844 CSS px, capture normalisée hors scrollbar, page entière |

Comparaisons composées et ouvertes dans le même support :

- **Vue complète** : `docs/qa/comparison-home-final.jpg` (1240 × 1212). Maquette à gauche et implémentation à droite, chacune ramenée à 620 px de large, alignées en haut. La page actuelle est plus longue car elle comprend le comparatif demandé après la maquette. Cette différence n’est pas assimilée à une dérive de proportions.
- **Cartes et contexte** : `docs/qa/comparison-cards-final.jpg` (2530 × 712), référence ElevenLabs à gauche, studio à droite, largeur égale.
- **Détail lisible** : `docs/qa/comparison-card-detail-final.jpg`, référence en haut et studio en bas. Recadrage des cartes aux mêmes largeurs : source 1125 × 343 depuis (64,369) ; implémentation 1190 × 393 depuis (40,310), normalisée à 1125 px. Les titres, prix, CTA et inclusions restent vérifiables. Aucun jugement sur les écarts de copy d’ElevenLabs : les produits vendus diffèrent.

## Cinq surfaces de fidélité

| Surface | Constat final |
| --- | --- |
| Typographie | Geist Sans chargée pour l’interface, hiérarchie noire lisible, graisses et espacements cohérents. Titres, cartes et CTA sans troncature dans les captures desktop/mobile. Les marques dans les captures de sites conservent leur graphisme propre. Les différences de famille avec ElevenLabs sont voulues. |
| Espacement et structure | Quatre colonnes régulières sur desktop et une colonne mobile, zones cliquables larges, CTA alignés, inclusions neutres. Configurateur à deux colonnes sur desktop et empilé sur mobile ; barre d’action persistante. Pas de débordement horizontal de page observé. Le tableau comparatif défile dans son propre cadre sur mobile. |
| Couleurs et tokens | Fond pastel bleu/céladon/corail continu, grain visible et fondu progressif vers le blanc. Texture des cartes originale, bicolore, limitée en haut au survol/focus. Texte et bouton contrastés dans l’état stabilisé. Focus clavier visible. Aucune image de fond d’ambiance ni animation de couleur. |
| Qualité des images | Captures authentiques DOMTEKNIKA/Julie Thiam, encodées en WebP sans réécriture du contenu ; sources et empreintes dans `docs/ASSETS_REFERENCES.md`. Texture de carte approuvée, export léger. Aucun logo remplacé par une approximation CSS/SVG. Icônes Lucide cohérentes. Les références externes sont créditées. |
| Textes et contenus | Activité claire dès le titre, forfaits et CTA directs. Phrases décoratives, descriptions sous les noms et répétitions retirées. Espace de préparation distinct du CMS livré. Déploiement ponctuel et maintenance mensuelle séparés. Prix inconnus affichés comme tels, aucun paiement ni e-mail fictif annoncé. |

## Historique des écarts et corrections

| Passe | Écarts constatés | Correction et preuve après correction |
| --- | --- | --- |
| Initiale, bloquée | P1 hiérarchie trop faible et cartes différentes de la matière attendue ; P2 texte trop abondant | Révision de l’échelle, texture originale grannée et cartes cliquables. Comparaisons historiques `comparison-home-initial.jpg` puis `comparison-home-revised.jpg`. La dernière validation explicite de Mathis porte sur les cartes actuelles. |
| Révision après essai, bloquée | P1 fiches avec onglets redondants au lieu du configurateur ; P2 navigation peu explicite | Configurateur direct, aperçu gauche/options droite, liens des quatre forfaits et Accueil. Preuves finales `final-vitrine.jpg`, `final-immersif.jpg` et menu mobile contrôlé. |
| Performance, bloquée | P1 fond bitmap et mouvement mal perçus, attentes sur les cartes ; P2 coupure de fond et contenu masqué | Fond CSS statique, grain procédural, suppression du suivi du pointeur, transition circulaire, attente de préchargement et observateur masquant le contenu. Cartes conservées avec fondu 120 ms. `final-opening.jpg`, `final-cards.jpg` et comparaison finale. |
| Contenus et sources, bloquée | P1 aperçu non authentique Vitrine et référence 3D insuffisante ; P2 exemple d’accueil non souhaité, phrases décoratives | Captures réelles DTK/Julie, suppression complète du showcase d’accueil, nettoyage des titres et répétitions. `final-vitrine.jpg`, `final-immersif.jpg`, `final-home-full.jpg`. |
| États fonctionnels, bloquée | P1 édition d’un projet pouvant rétablir les anciens choix ; P2 erreur de chargement peu exploitable ; P1 conflit de textes silencieux | Changement de forfait local pendant l’édition, écran d’erreur avec nouvel essai, conflit atomique côté serveur et dialogue conservant le brouillon. Parcours testés dans le navigateur sur la version finale ; 80 tests globaux réussis. |
| Finale, passée | Aucune différence P0/P1/P2 restant parmi les surfaces et états inspectés | Nouvelle capture au repos, capture focus/survol stabilisée, comparaison complète et détaillée, desktop/mobile, console et parcours réels. |

Les préférences successives (carte entière colorée puis haut uniquement ; fond animé puis statique) sont des arbitrages explicites, pas des défauts à réintroduire pour suivre l’ancienne maquette.

## Interactions et contrôles exécutés

- Clic sur une inclusion hors bouton : navigation de la carte entière vers le bon forfait.
- Accueil, liens directs, menu mobile, comparaison détaillée avec case à cocher et FAQ.
- Options du configurateur, aperçu authentique, changement de forfait en édition conservant langue et maintenance, sauvegarde et récapitulatif ponctuel/mensuel.
- Projet inexistant : erreur, nouvel essai et sortie claire, pas de formulaire désactivé indéfiniment.
- Inscription locale de test, création de projet, textes, dépôt privé, messages, publication administrative de maquette, retour et validation explicite côté client.
- Deux éditeurs : conflit 409, brouillon conservé, comparaison et enregistrement explicite de la version choisie.
- Contrôle mobile 390 × 844, menu avec Accueil, aucun débordement de page. Les tableaux restent défilables localement.
- Journaux navigateur de l’onglet final : aucun avertissement ni erreur recueilli lors du contrôle final. La réduction des animations et les labels/focus ont été relus.
- `npm run check` : TypeScript, build et **80/80 tests réussis** ; `docs/qa/check-final.txt`.
- Dépendances : audit à zéro vulnérabilité au moment de la validation. Peinture JS du grain mesurée localement à 0,4 ms ; ce chiffre ne mesure ni FPS, ni coût GPU, ni INP.

## Limites et suite

Aucun test sur appareils physiques, charge représentative ou hébergement public n’a été effectué. La visualisation comparée ne constitue pas une garantie de perfection sur tous les appareils. Prix/périmètres, identité et documents commerciaux, transport e-mail, prestataire de paiement et exploitation publique restent à finaliser avant ouverture. Voir `docs/READINESS_REVIEW.md` et `docs/DEPLOYMENT.md`.

Checklist de livraison locale : captures et comparaisons enregistrées ; cartes approuvées conservées ; textes nettoyés ; parcours principaux vérifiés ; build et tests réussis ; aperçu laissé ouvert. Aucune publication publique annoncée.
