# Vérification visuelle — configurateur sans compte, 2 novembre 2026

final result: passed

La source fournie sert de référence de structure pour la grande carte colorée. Les décisions explicites de Mathis priment : carte à gauche, options à droite façon Apple, texture studio déjà approuvée, Geist unique, aucun exemple de site dans le configurateur. Il ne s’agit pas de copier les couleurs, les fonctions audio ou les promotions d’ElevenLabs.

## Sources et comparaison normalisée

- Vérité visuelle : `docs/qa/anonymous-configurator/source-structure.png`, copie de la pièce jointe sélectionnée, 3000 × 1610 px. Son viewport CSS et sa densité ne sont pas connus.
- Implémentation : `vitrine-desktop.jpg`, IAB sur `http://127.0.0.1:4173/forfaits/vitrine?nouveau=1`, Vitrine avec adaptation mobile sélectionnée, sans compte.
- Viewport CSS ordinateur observé : 1280 × 720, DPR 2 ; capture de contenu renvoyée par IAB : 1265 × 712 px. Viewport mobile : 390 × 844, DPR 1, capture 375 × 812 px. Les captures sont conservées à leur taille reçue, sans inventer la taille CSS de la source.
- Comparaison plein cadre : `comparison-full.jpg`, source et capture réunies dans la même image à 1280 px de largeur. Les différences de navigation et l’inversion des colonnes sont intentionnelles.
- Comparaison ciblée : `comparison-card.jpg`, carte source recadrée et carte studio complète, normalisées à 560 px de large. La carte studio contient davantage de texte utile ; son prix est placé sous les inclusions comme dans la carte studio approuvée.
- Les deux planches combinées ont été ouvertes et évaluées, puis le recadrage de détail ajusté pour conserver les coins de la carte entière. Aucun asset source n’a été remplacé par du dessin HTML.

## Itérations et corrections

1. P2 constaté au changement d’étape : le focus automatique faisait passer le titre des coordonnées sous le header fixe. Correction : focus sans scroll automatique, retour en haut sur ordinateur et alignement explicite sous le header sur mobile. Preuves après correction : `contact-desktop.jpg` et `contact-mobile.jpg` ; titre entièrement visible.
2. P2 ergonomique mobile : première colonne du comparatif trop large, ne laissant qu’une partie du premier forfait visible. Correction : colonne de 156 px, tableau de 764 px, libellés figés et indication de défilement sur mobile. Preuves : `comparison-mobile.jpg` / `comparison-desktop.jpg`. Mesures réelles : première colonne 156 px et aucun débordement global.
3. Revenir au même forfait depuis le menu après une confirmation ouvrait encore l’état de confirmation. Correction : clé de navigation du configurateur, brouillon conservé et état de formulaire renouvelé. Essai local complet : demande enregistrée, clic Vitrine, titre « Configurez votre site » de nouveau visible.
4. Retour aux options mobile rendu visible à côté de l’étape 02 ; clic testé, adaptation mobile toujours sélectionnée. La barre de total mobile disparaît pendant la saisie des coordonnées.

## Cinq surfaces de fidélité

- **Typographie** : Geist Variable unique pour studio, graisses 400–600, hiérarchie nom du forfait/titre de configuration/options respectée. Libellés lisibles et retours à la ligne contrôlés sur mobile. Les petits prix restent secondaires. Les marques externes conservent leur identité dans la galerie.
- **Espacement et composition** : carte importante à gauche, choix à droite, bouton de carte large, marges communes. Carte fixe quand la colonne d’options défile. Empilement mobile, formulaire une colonne au petit format et total accessible en bas. Aucun onglet redondant.
- **Couleurs et états** : texture grained studio conservée ; recadrages/teintes différenciés par forfait. Texte blanc contrasté, choix sélectionné avec coche et bordure sombre, focus visible. Fond pastel CSS progressif, racine pastel et overscroll `none`, aucune animation d’ambiance.
- **Images et matière** : grain-plasma-card.webp déjà approuvé, sans nouveau fond bitmap. Aucun aperçu ou image fictive dans les quatre configurateurs (0 image DOM vérifiée). DOMTEKNIKA et Julie Thiam présents dans la galerie. Ancien Atelier retiré et archivé hors du build.
- **Contenus** : offre de création de sites explicite, termes « forfait » et « options », comptes utilisateurs du site livré distingués du parcours sans compte. Aucun faux nombre de clients, avis ou pourcentage. Vitrine ordinateur à la base ; adaptation mobile facultative. Prix non approuvés laissés en attente.

## Interactions et comportement vérifiés dans IAB

- Cartes d’accueil et effet de survol conservés : `cards-hover-desktop.jpg` ; carte entière ouvre le forfait.
- Quatre forfaits : Vitrine, Connecté, Immersif 3D et Sur mesure ouvrent le configurateur, sans aperçu de site. Captures `vitrine-desktop.jpg`, `immersif-desktop.jpg`, `custom-desktop.jpg`.
- Sélection/désélection d’options, sections dépliables, modification de forfait, capacités comprises non refacturées.
- Contrôle local de calcul avec tarifs strictement temporaires : base 800 €, mobile 150 €, bilingue 150 € → 1 100 € ; maintenance +49 €/mois séparément. Preuve `price-test-only.jpg`. Ces montants sont des données de test, pas des prix commerciaux. L’ancien catalogue local a été restauré ; aucune donnée locale ne part en production.
- Coordonnées sans compte, retour aux options, succès d’un envoi local à données fictives. Réponse `unavailable` présentée comme « enregistrée », sans prétendre à l’envoi d’un mail.
- Menu mobile sans connexion, filtres de galerie : 3D affiche Julie Thiam et Tiny Heaven ; `gallery-mobile.jpg`.
- Comparatif base/détails, coches/tirets, aucun « En option » répétitif ni note supprimée par Mathis.
- Journal navigateur : aucune erreur ni avertissement applicatif observé. Aucune animation permanente au repos. Mesure locale de peinture du grain : environ 0,1 ms sur cette machine, pas une garantie universelle de performance.
- `npm run check` : TypeScript, build et 113 tests passants. `git diff --check` propre.

## Limites factuelles

- Le contrôle visuel est passé. L’adresse destinataire demandée à Mathis manque encore ; le domaine Resend est vérifié et la clé d’envoi est installée, mais aucun envoi réel ni réception n’est affirmé.
- Prix, identité commerciale et conditions définitives restent à arrêter. Aucun paiement n’est demandé dans ce parcours.
- Captures publiques après déploiement et révision déployée consignées dans `ops/DEPLOYMENT_STATUS.md`.

Aucun P0/P1/P2 ouvert à l’issue de la comparaison. Aucun écart de marque d’ElevenLabs n’est traité comme une erreur : le rendu studio approuvé reste la référence de couleur et de police.

## Contrôle public après livraison

Révision `f60622a6376652e0bb5d4997203073c26d70052d` active sur https://gilmathis.com/. Empreinte HTTP du client final contrôlée. Dans IAB public : mobile sélectionné, passage aux coordonnées sans inscription, réouverture de Vitrine avec option conservée ; aucune erreur de console. Capture : `docs/qa/deployment-gilmathis/configurator-anonymous-public.jpg`. Aucun envoi réel soumis ; l’adresse destinataire Resend reste attendue. Le localhost a été arrêté après les essais.

## Correction après le retour de Mathis — définition des grandes cartes

Le retour utilisateur rouvre une erreur de fidélité que la précédente revue avait manquée : le grain de la grande carte Vitrine était trop grossi et flou. **P1 corrigé** : la texture de 768 × 512 était affichée à 155 % / 145 %, soit environ 1762 × 1537 pixels physiques sur une carte de 568 × 530 CSS à DPR 2. L’agrandissement était aussi différent sur chaque axe.

La source studio originale de 1536 × 1024 est maintenant utilisée en 2x avec `image-set` et un cadrage `cover` qui conserve le ratio. À DPR 1, la ressource légère reste suffisante sans le zoom excessif. Aucun changement des mini-cartes d’accueil, de leurs fichiers ou de leur effet. Aucune nouvelle animation, aucun changement du fond de page.

- Source visuelle et matière : `docs/asset-sources/textures/grain-plasma-v2.png`, original 1536 × 1024 ; copie WebP 2x identique au fichier source archivé.
- Avant public : `docs/qa/card-definition/before-public.jpg` ; après local : `after-desktop.jpg`.
- Même état : Vitrine, adaptation mobile choisie, étape options, viewport 1280 × 720 CSS, DPR 2. Deux captures de contenu 1265 × 712. Géométrie de la carte conservée.
- Comparaison plein cadre réunie : `comparison-full.jpg` ; comparaison ciblée du grain réunie : `comparison-grain.png`.
- Les détails du grain sont capturés dans le navigateur à résolution réelle, PNG 1137 × 1060 pour chaque carte (`before-card@2x.png`, `after-card@2x.png`), sans interpolation ni redimensionnement dans la planche ciblée. Les deux planches combinées ont été ouvertes et évaluées.
- Typographie, espacement et contenu : mêmes positions, tailles, textes, boutons et choix. La carte reste à gauche, les options à droite.
- Couleurs : même source, mêmes teintes par forfait ; le cadrage montre davantage de la composition originale, conséquence voulue de la suppression du zoom.
- Qualité : grain fin et distinct, sans les gros amas interpolés de l’avant. Source 2x effectivement chargée à DPR 2, confirmée par les ressources réseau du navigateur.
- Connecté, Immersif 3D et Sur mesure inspectés. Mobile 390 × 844 CSS / DPR 1 vérifié après stabilisation : source légère seule, aucun débordement, barre de total visible. Capture valide : `after-mobile.jpg`.
- Aucune erreur de console observée, aucune animation permanente au repos. Le viewport temporaire a été réinitialisé.

final result: passed

L’adresse de réception Resend est reportée à la demande explicite de Mathis ; aucune modification ni envoi d’e-mail pendant cette correction.

Vérification de première visite publique : la source 2x a mis environ 985 ms à charger sur cette connexion. La version légère préchargée est conservée sous la couche 2x pour éviter un aplat vide pendant ce chargement. Aucun délai n’est ajouté aux options ni aux boutons. Les captures publiques finales sont prises après la fin de chargement de la source 2x.

Contrôle public final de cette correction : révision `e2d7d435e98f48c1268d818263a1d4af410fecf0` sur gilmathis.com, ressource HD HTTP 200 et digest identique au fichier prévu. Le navigateur à DPR 2 charge bien la version HD et conserve la couche légère de repli. Preuves après chargement : `docs/qa/card-definition/after-public.jpg` et `after-public-card@2x.png`. Aucune erreur de console ; localhost fermé.

Capture de contexte finale sans compression destructive : `docs/qa/card-definition/after-public-retina.png`, 2560 × 1440 pixels pour le viewport 1280 × 720 CSS à DPR 2. Elle évite que la capture JPEG 1x du navigateur masque la finesse du rendu réel.

## Nouvelle amélioration demandée — grain indépendant de l’agrandissement

Le retour « on peut encore améliorer la qualité » prolonge la correction précédente. La résolution de la source HD ne suffisait pas à rendre sa matière assez fine dans une grande carte. Les couleurs et le grain sont maintenant deux couches indépendantes : composition studio légère lissée, puis grain procédural à la densité réelle de l’écran. Aucun changement de layout, de texte ou de mini-carte.

- Source de comparaison : état public déployé `e2d7d435e98f`, Vitrine avec adaptation mobile choisie. Avant et après local capturés au même viewport 1280 × 720 CSS, DPR 2, carte 568,3 × 530 CSS, étape options.
- Dossier : `docs/qa/card-grain-native/`. Cartes PNG natives 1137 × 1060 : `before-card@2x.png` et `after-card@2x.png`. Elles sont réunies, sans interpolation, dans `comparison-full.png` ; les extraits de grain à l’échelle 1:1 sont réunis dans `comparison-grain.png`. Les deux planches ont été ouvertes et évaluées ensemble.
- Contexte complet avant/après réuni et évalué dans `comparison-context.jpg`, à partir de deux captures Retina 2560 × 1440 normalisées à 1280 × 720 chacune : composition de page et contrôles identiques.
- **Typographie** : textes et contrôles toujours nets, hors du filtre et du grain ; aucune modification de police, taille, graisse ni alignement.
- **Composition et espacement** : mêmes dimensions, marges, rayons, position gauche/options droite, et empilement mobile. Aucun changement de contenu ni de navigation.
- **Couleurs et états** : palette, compositions et variantes préservées. Masses colorées plus douces ; pas d’aplat gris ni de voile sur le texte. Bouton, focus, sélection et boîte de changement de forfait fonctionnels.
- **Matière** : les amas de grain agrandi disparaissent ; le nouveau grain est fin et homogène à résolution native. Source légère 162 744 octets seule observée dans le réseau à DPR 2 ; la ressource HD de 879 898 octets n’est plus téléchargée par le configurateur.
- **Contenus** : offre, inclusions, prix en attente et options strictement conservés ; aucun aperçu de site ajouté au configurateur.
- Quatre variantes inspectées : `variants-desktop.jpg` et captures individuelles. Changement Sur mesure → Vitrine testé via la boîte de choix.
- Mobile 390 × 844 CSS, DPR 1 : `vitrine-mobile.png`, carte entière lisible, total fixe en bas, aucun débordement global. Canvas 335 × 420 pour une carte 335 × 419,3 CSS ; sélection mobile testée. Viewport réinitialisé après l’essai.
- Une seule peinture à l’ouverture puis au changement de taille/densité ; aucun écouteur de scroll, de pointeur ou boucle d’animation. Initialisation observée à environ 0,3 ms sur cette machine, sans garantie universelle. Aucune animation active au repos ni erreur/avertissement applicatif observé.
- `npm run check` : TypeScript, build et 113 tests passants ; `git diff --check` propre. La livraison publique sera contrôlée séparément.

final result: passed

Cette itération conserve les sources et captures de l’essai HD précédent. Aucun e-mail ni changement de catalogue pendant cette correction.

Contrôle public final de l’itération : révision `f768c46c96e56ec34e2a50aa27b935ab321681b9`, release `20261103T000640Z-f768c46c96e5`, client `index-D48NNVRJ.js` observés sur gilmathis.com. À DPR 2, le canvas est bien 1137 × 1060 ; seule la texture légère de 162 744 octets est chargée. Initialisation mesurée environ 1,1 ms en production sur cette machine ; aucune animation active au repos ni erreur/avertissement applicatif. `after-public-retina.png` est une capture PNG sans perte 2560 × 1440 du site réellement en ligne, ouverte et vérifiée. État de l’option mobile conservé au rechargement. Sauvegarde effectuée, autres projets inchangés, localhost et onglet local fermés.

## Correction de fidélité après rejet du lissage — 2 novembre 2026

**Constat P1 rouvert par Mathis.** La conclusion de l’itération précédente sur le lissage et le grain procédural est invalidée par son retour : « c’était mieux avant », « juste de meilleure qualité comme les petits ». La demande porte sur la qualité de la matière originale, pas sur un nouveau style. Le flou et le composant PlanGrain sont supprimés. La grande carte reprend la source originale en export sans perte ; teinte, luminosité, vignette et cadrage reviennent à ceux de l’état HD précédent.

### Vérité visuelle, échelle et comparaison

- Matière et couleurs : `docs/asset-sources/textures/grain-plasma-v2.png`, source studio originale 1536 × 1024 ; petite carte approuvée capturée au focus dans `docs/qa/card-texture-fidelity/reference-small-vitrine@2x.png`. La texture mini n’est pas modifiée.
- Référence supplémentaire inspectée en direct : https://elevenlabs.io/pricing, carte Creator du calculateur. Capture native `reference-elevenlabs@2x.png`, 1007 × 1007 pixels pour une carte 503,5 × 503,5 CSS à DPR 2. La référence montre une matière présente et contrastée, sans exiger les couleurs ou la composition exactes d’ElevenLabs. Aucun asset ElevenLabs n’est utilisé dans le site.
- Implémentation : `vitrine-desktop@2x.png`, 2560 × 1440 pour un viewport CSS 1280 × 720 / DPR 2 ; Vitrine, adaptation mobile choisie, étape options. Capture après fin de la transition, carte 568,3 × 530 CSS.
- Contexte complet : `comparison-context.jpg`, état rejeté et état corrigé réunis à 1280 × 720 chacun. Détail : `comparison-native.png`, ancien HD compressé et export sans perte, cartes PNG à l’échelle native 1137 × 1060 chacune.
- Grain à l’échelle physique : `comparison-grain-reference.png`, extraits de 450 × 300 pixels d’ElevenLabs, du précédent studio HD et du nouveau studio. Aucun agrandissement des détails. Ces planches ont été ouvertes et comparées dans le même résultat, puis les captures intermédiaires prises pendant une transition ont été remplacées par les captures stabilisées.

### Cinq surfaces et comportement

- **Typographie** : Geist, tailles, graisses, interlignages et textes identiques. Aucun flou, bruit ou image ne recouvre les glyphes ou les contrôles. Les retours à la ligne restent identiques au contexte de référence.
- **Espacement** : même carte, rayon, marges, grille gauche/droite et empilement mobile. Aucun onglet, bouton ou section ajouté.
- **Couleurs et états** : compositions, variantes, luminosité et vignette de l’état d’avant restaurées. Focus de la petite carte Vitrine testé ; l’effet est celui du code approuvé, sans changement des octets de sa texture.
- **Image et matière** : `grain-plasma-master.webp`, export WebP sans perte du PNG ; contrôle RGB décodé nul sur les trois canaux, dimensions identiques, preuve `lossless-verification.json`. Grain original conservé, aucune retouche de style, aucun grain artificiel ni interpolation de fichier. L’ancien WebP HD compressé présentait un écart moyen d’environ 4,16 / 2,26 / 3,56 niveaux sur les canaux RGB par rapport au PNG.
- **Contenus** : forfaits, inclusions, options et tarifs en attente conservés ; aucune modification fonctionnelle, aucun e-mail envoyé, aucun aperçu de site ajouté.
- Quatre variantes inspectées : `variants-desktop.jpg`, captures individuelles Connecté/Immersif/Sur mesure. Choix d’option et navigation carte/forfait fonctionnels.
- Mobile 390 × 844 CSS, DPR 1 : `vitrine-mobile.png`. Client et document 375 px de large, aucun débordement ; barre du total à y = 766, hauteur 78, visible jusqu’à 844. Seule la texture légère est demandée sur cette visite mobile.
- Le canvas de la grande carte est absent. Console après rechargement final : aucune erreur/alerte ; preuve `console-final.json`. Un message Vite pendant la suppression de l’ancien composant a disparu au rechargement, et ne constitue pas une erreur du build livré. Aucune animation permanente au repos ; viewport réinitialisé.
- `npm run check` : TypeScript, build et 113 tests passants. `git diff --check` contrôlé avant commit.

### Limites et livraison

La source conserve sa résolution réelle de 1536 × 1024 : ce n’est pas une image 4K ni une restauration de détails absents du PNG. L’export sans perte pèse 2 636 656 octets contre 879 898 pour l’ancien HD compressé. Ce poids supplémentaire est réservé à la grande carte à haute densité ; source légère dessous pendant son chargement, aucune attente imposée aux options ou à la navigation. Aucun fichier de texture ou effet des petites cartes ne change. La validation porte sur la fidélité retrouvée à la matière originale ; elle ne prétend pas garantir une préférence esthétique de Mathis.

P1 de dérive de matière corrigé ; aucun autre écart P0/P1/P2 constaté dans ce périmètre. Vérification publique consignée après déploiement.

final result: passed

Contrôle public final de la correction de fidélité : révision `e4d247a473821d2c5c16952fc34752dc34044789`, release `20261103T013839Z-e4d247a47382`, client `index-DOYv62n_.js`. Santé publique et digest du master sans perte identiques au build prévu. Le navigateur DPR 2 charge bien 2 636 656 octets pour le master et conserve la couche légère. Temps observé du master : environ 1 094 ms sur cette visite ; aucune attente ajoutée aux contrôles. Pas de flou ni de canvas de remplacement, aucune erreur/alerte de console. Capture finale native `docs/qa/card-texture-fidelity/after-public-retina.png` ouverte et inspectée après fin du téléchargement. Sauvegarde faite, autres projets inchangés, localhost fermé.

## Navigation et contenu — simplification après les corrections de Mathis

Périmètre de cette validation : navigation, textes et FAQ. Les points commerciaux et la réception e-mail déjà différés restent ouverts dans `docs/AUDIT_SITE_2026-11-02.md` ; cette validation visuelle ne déclare pas l’offre prête à être commercialisée.

- Vérité visuelle : site public au début de cette revue, `docs/qa/navigation-content-review/01-home-before.jpg` et `05-faq-before.jpg`, avec les modifications explicites de Mathis comme cible. Implémentation : `07-home-after.jpg`, `08-faq-after.jpg` et les captures mobiles 10 à 12.
- Même viewport ordinateur 1280 × 720 CSS / DPR 2 ; captures du navigateur 1265 × 712 reçues, sans présenter ces fichiers JPEG comme des captures Retina natives. Avant et après réunis sans changement d’échelle dans `comparison-home.jpg` et `comparison-faq.jpg`, ouverts et comparés.
- État FAQ : première question ouverte. Les captures prises pendant un chargement de route ou d’aperçu ont été rejetées et remplacées après stabilisation et contrôle du H1 de la route.
- **Typographie :** Geist, graisses, tailles, interlignages et styles de liens/accordéons conservés. Questions mobiles longues sur deux lignes, sans troncature. Les quatre destinations du menu mobile ont désormais une présentation homogène.
- **Espacement :** la suppression des badges réduit naturellement la hauteur de l’introduction ; aucune marge vide ajoutée à leur place. Navigation centrée, capsule et bouton de contact conservés. Grilles, cartes et formulaire restent aux mêmes dimensions.
- **Couleurs et états :** mêmes pastels, bordures, texte et matière. Le lien Forfaits reste actif sur un configurateur. Les liens mobiles ferment le panneau après navigation ; focus visible et états des accordéons conservés.
- **Images :** aucun changement d’asset public. Un essai de texture plus définie a été comparé par le spécialiste, inspecté par le parent et rejeté : sortie 1536 × 1024 malgré une demande 3072 × 2048, sans gain réel et avec dérive de grain. Original sans perte conservé.
- **Contenu :** suppression des trois badges, de toutes les mentions « Sans compte » et « Aucun compte à créer » dans les sources publiques, et des questions rejetées. FAQ entière remplacée par six questions concrètes ; trois reprises sur l’accueil. Pas de prix, délai, nombre de pages ou témoignage inventé.
- Interactions vérifiées : navigation vers Forfaits, choix Immersif 3D depuis son comparatif, passage aux coordonnées sans envoi ; FAQ ouverte/fermée ; menu mobile quatre destinations, fermeture après clic Accueil ; ancre Choisir mon forfait avec titre visible sous le header. Galerie publique filtre 3D : deux références chargées.
- Mobile 390 × 844 CSS / DPR 1 : zone client et document 375 px, aucun débordement. Captures `10-mobile-menu.jpg`, `11-mobile-home.jpg`, `12-mobile-faq.jpg`. Viewport réinitialisé.
- `npm run check` : TypeScript, build et 113 tests passent ; une dernière vérification TypeScript/build inclut les ultimes retouches de rédaction. Aucune erreur/alerte de console locale finale. `git diff --check` contrôlé avant commit.

Les changements intentionnels ci-dessus remplacent les anciens choix de navigation et de FAQ ; aucun écart P0/P1/P2 sur ce périmètre d’interface après comparaison. Les points de lancement du rapport d’audit ne sont pas présentés comme résolus.

final result: passed

Vérification publique finale de la navigation et de la FAQ : révision `d892e663fcb744d485f0e1621efaa560cf4dc738`, release `20261103T021319Z-d892e663fcb7`, empreinte client `index-DNlyX7rP.js`. Navigation observée Accueil / Forfaits / Exemples de sites, mentions retirées absentes de l’accueil et de la FAQ, six nouvelles questions, première réponse ouverte avec aria-expanded=true. Aucun message réel soumis ni erreur/alerte de console. Captures PNG natives publiques 2560 × 1440 ouvertes et inspectées : `docs/qa/navigation-content-review/after-public-home-retina.png` et `after-public-faq-retina.png`. Onglet public conservé ; prévisualisation et ports 4173/4174 fermés. Les points commerciaux ouverts du rapport d’audit restent explicitement hors de cette validation d’interface.
