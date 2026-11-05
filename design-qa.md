## Ordre des options fixé — 5 novembre 2026

Dernière précision : trois choix à gauche, trois à droite, puis droite/gauche. Grille explicite à la place du rééquilibrage CSS automatique. L’ordre de sélection est suivi dans la session, et la carte étroite utilise cette même séquence en une colonne. Les calculs, textures, défilement normal et protections du formulaire restent inchangés.

IAB local : douze sélections hors ordre du catalogue, vérification des douze états et des coordonnées CSS. Retrait/réajout, mobile 390 × 844, image fixe et absence de console/débordement contrôlés. Preuves : `docs/qa/option-order/`. Publié sur gilmathis.com : `9486538`. TypeScript/build et 213 tests passent. IAB public : douze étapes et séquence mobile correctes, sans barre interne ni erreur de console ; santé et neuf empreintes vérifiées, choix initiaux restaurés et localhost arrêté.

## Résumé des options sans défilement interne — 5 novembre 2026

Demande : retirer la barre intérieure lorsque beaucoup d’options sont choisies. Solution retenue : deux colonnes équilibrées avec une largeur minimale de 200 px, une seule sur carte étroite. La liste garde son ordre de lecture vertical dans chaque colonne et les animations de hauteur/fondu existantes. À partir de cinq choix, la présentation desktop se compacte en 620 ms.

La hauteur maximale et l’overflow interne ont été retirés. Un ResizeObserver mesure uniquement la hauteur de la carte et adapte son ancrage sticky, sans écouteur de scroll ; sur écran bas, le défilement normal de la page permet d’atteindre son bas. Les originales, la texture fixe et le prolongement existant restent intacts. Le focus artificiel de l’ancienne région défilable a été retiré.

IAB local : Vitrine et Connecté avec 12 choix : deux colonnes, carte de 672,56 px, total accessible, contenu client/scroll identiques et overflow visible. Sur mesure avec 10 choix : deux colonnes, aucun débordement. Écran 1366 × 700 : carte ancrée à 16 px après scroll, bas à 675,70 px et total visible ; retour vers le haut par la page. Mobile 390 × 844 : une colonne, hauteur naturelle 872,76 px, contenu client/scroll 825/825 et texture de 500 px. Entrée compacte : transitions de 620 ms, image constante de 580 px. Ouverture clavier depuis le comparatif : transition native observée. Console sans erreur/avertissement, choix locaux initiaux restaurés et émulation réinitialisée.

Preuves : `docs/qa/option-columns/`. TypeScript, build et 213 tests passent. Version `0cdbd93` publiée et vérifiée dans l’IAB public sur ordinateur/mobile, sans défilement interne ni erreur de console. Choix initiaux et viewport restaurés ; localhost arrêté. Empreintes et publication dans `ops/DEPLOYMENT_STATUS.md`.

# Vérification visuelle — forfaits et options, 4 novembre 2026

final result: passed

## Lot actuel : image fixe et fond prolongé — publié et vérifié

La précédente correction conservait le cadrage natif, mais le fond en `cover` pouvait encore zoomer avec la hauteur de carte. Après clarification de Mathis, image et lumière ont une hauteur fixe et la même texture se prolonge sous elles en miroir, sans nouvel export. Options ralenties à 620 ms, fondu de 420 ms et accélération douce. Ancien et nouvel instantanés de navigation à leur taille propre.

Application `3d1c08c` poussée, déployée et vérifiée. TypeScript, build et 213 tests passent. IAB local et public : carte de 580 à 973 px pour zéro à douze options, image toujours de 612,1 × 580 px et ancrée à 0. Mesures pendant l’ajout confirmées en public, retrait mesuré localement. Mobile public : carte de 873 px et image de 335 × 500 px. Aucun débordement, aucune erreur/alerte de console observée ; préférence de réduction du mouvement respectée localement, choix initiaux et réglages rétablis, aucun envoi. Client, CSS et textures publics identiques au build ; sauvegarde, Sharp et santé validés, autres services inchangés et localhost arrêté. [Rapport, mesures et captures publiques](docs/qa/fixed-texture/review.md).

## Lot précédent : fluidité après essai public — publié et vérifié

Retour utilisateur traité : texture entrante révélée sans redimensionnement, cadre et coins animés en 520 ms avec accélération progressive. Texte dans une couche distincte, à sa taille finale, dont le fondu reste visible au-dessus de la texture. Préchargement sur intention sans délai ajouté au clic. Les options se déplient et se replient en 360 ms ; premier/dernier choix, hauteur de carte, mensualité, compteurs, rubriques et passage au brief suivent le mouvement.

Application `7b50265` poussée, déployée et vérifiée sur gilmathis.com. TypeScript, build et 213 tests passent. IAB local : mesures d’ouverture et de hauteur à vitesse normale, inspection à mi-transition, six destinations, clics rapides, douze options, brief/retour et réduction dynamique des animations au clavier. IAB public : transition de 520 ms, texture entrante non redimensionnée, fondu du texte réellement visible, premier ajout et retrait progressifs, dernier retrait sans hauteur résiduelle. Options dans la carte sur ordinateur et mobile, aucun débordement. Les choix non actifs restent hors de l’arbre accessible. Textures d’origine inchangées ; client et CSS publics conformes au build. Sauvegarde, Sharp et santé vérifiés, catalogue et autres services inchangés. Sélection et réglages rétablis, aucune soumission, console sans erreur/alerte observée et localhost arrêté. [Rapport et captures publiques](docs/qa/plan-motion-refinement/review.md).

## Lot précédent : ouverture des forfaits et options visibles — publié et vérifié

Petite surface de carte reliée à la grande carte du forfait en 420 ms, contenu en fondu ; surface décorative seule capturée pour garder les contrôles et la navigation cliquables. Six destinations et clics rapides vérifiés. Les modules sont prêts avant la capture, y compris à froid. Les options choisies sont visibles dans la carte au-dessus du total ; ancien résumé replié retiré. La carte s’allonge et cesse d’être sticky si nécessaire.

Application `3e8bd12` poussée, déployée et vérifiée sur gilmathis.com. TypeScript, build et 213 tests passent. IAB et vrai build Express local : ordinateur/mobile, douze options sans débordement, clavier, Cmd+clic, reduced motion et garde du brief. IAB public : transition native de 420 ms effectivement observée ; deux options dans la carte sur ordinateur et mobile, aucun volet replié ni débordement. Images approuvées inchangées octet pour octet ; client, CSS et textures publics identiques au build. Sauvegarde, Sharp et santé vérifiés, catalogue et autres services inchangés. Aucun envoi, console sans erreur/alerte observée. Sélection et viewport rétablis, localhost arrêté, accueil public conservé. Preuves : [revue publique et captures](docs/qa/plan-transitions/public-review.md), [validation locale détaillée](docs/qa/plan-transitions/design-qa.md).

## Lot précédent : contour de sélection des options

Application `e8895ae`, poussée, déployée et vérifiée. Le contour violet de `:focus-within` entourait toute la ligne au clic ; supprimé dans options et choix du brief. Sélection : coche noire, bordure fine et aucune ombre intérieure. Au clavier uniquement, un repère sombre de 2 px entoure la petite case.

213 tests, TypeScript et build passent. IAB local/public : souris, Tab/Espace, compteurs, choix du questionnaire et mobile ; choix initiaux rétablis, aucune soumission. Capture mobile native 780 × 1688 pour viewport 390 × 844/DPR 2 ; document/client 375/375 avec scrollbar, aucun débordement. Aucun changement des cartes, matières ou animations approuvées. Aucune erreur applicative observée.

Client et deux CSS publics identiques au build par HTTPS. Sauvegarde, décodeur et santé contrôlés ; autres services inchangés. Preuves : `docs/qa/selection-focus/review.md`, `after-public.jpg` et `after-public-mobile.png`. Réglages navigateur rétablis, accueil public conservé et localhost fermé.

## Lot précédent : questionnaires et accueil

Application `82d3e3b`, poussée, déployée et contrôlée sur gilmathis.com. Cinq analyses indépendantes puis cinq relectures anonymisées et arbitrage final. Questionnaires adaptés, lien de partage facultatif, conditions partagées client/serveur et historique admin conservé ; accompagnement et engagements sécurité/RGPD ajoutés à l’accueil, sans qualification d’ingénieur non confirmée. Images, cartes, badges, prix et effets approuvés conservés.

213 tests passent avec TypeScript et build. IAB local : soumission fictive et relecture admin dans une base dédiée, zéro tentative e-mail. IAB public : nouvel accueil, six cartes, un H1, Refonte, accordéon exclusif, lien sans image, précision conditionnelle, résumé fermé et mobile. Aucune soumission ni image envoyée en production. Document/client mobile 375/375 dans un viewport 390 × 844 avec scrollbar ; aucun débordement. Aucune erreur applicative observée. Réglages temporaires réinitialisés et localhost fermé.

Client HTTPS identique au build, sauvegarde et Sharp vérifiés avant bascule ; autres services inchangés. Captures natives correctes : `docs/qa/brief-council/public-trust.jpg` et `public-refonte-mobile.jpg` ; la capture mobile déformée par le mélange des modes de viewport a été écartée. Compte rendu et limites : `docs/qa/brief-council/final-review.md`. Le retour ultérieur sur le contour à la sélection a été traité dans le lot `e8895ae` ci-dessus.

## Lot précédent : galerie et revue critique

Version applicative `099c1a1`, publiée et vérifiée sur gilmathis.com. Remarque de l’ami écartée : badges, filtres et images approuvés conservés. Galerie compacte, dix références, classement corrigé, Cal.com ajouté et scroll stable sur les cinq filtres. Trois spécialistes ont ensuite revu les parcours, les performances et le SEO. Leur revue et les corrections effectivement vérifiées sont rassemblées dans `docs/qa/gallery-review/final-review.md`.

202 tests réussis, santé et empreinte HTTPS conformes au build. Les trois textures colorées restent identiques octet pour octet. Galerie contrôlée en production sur ordinateur et mobile ; Contact protège la saisie avant navigation, sans soumission. Titres/canoniques, robots, sitemap et vraies 404 vérifiés ; corps des pages toujours rendu côté client. Le CLS initial mesuré ne reproduit plus le déplacement du footer : environ 0,00007 cache ignoré et 0 avec cache sur les trois routes. Ces échantillons ne sont pas des données terrain.

Captures natives publiques : `docs/qa/gallery-review/public-gallery-desktop.png`, 2560 × 1440 pour viewport 1280 × 720 CSS/DPR 2 ; `public-gallery-mobile.png`, 390 × 844 CSS/pixels, DPR 1. Largeur mobile document/client 390/390, zéro débordement. Aucune erreur applicative observée. Aucun formulaire ni image envoyés en production. Localhost fermé ; diagnostic cache/émulation rétabli, galerie publique conservée. Les informations légales réelles et l’adresse de réception restent à fournir, sans promesse de conformité ou de réception.

## Lot précédent : briefs V2

Version applicative `770a271`, publiée et vérifiée sur gilmathis.com. Quinze spécialistes ont contribué, sans modifier les images et effets approuvés. Six parcours revus localement ; Vitrine et Refonte également contrôlés en production, sur ordinateur et mobile. Questions conditionnelles, coordonnées distinctes obligatoires, options ciblées et pièces jointes intégrées à la même composition carte à gauche / formulaire à droite.

Le parent a soumis une demande Refonte avec PNG uniquement dans une base locale isolée, puis ouvert son dossier admin : réponses et miniature retrouvées. Pas d’envoi réel ni de demande de production. 192 tests réussis ; restauration des images et de l’historique incluse. Vérification du module natif sur Ubuntu avant bascule, santé et empreinte HTTPS identiques au build. Refonte mobile : 390 × 844 CSS, document 390, zéro champ hors largeur. Aucune erreur applicative observée ; localhost arrêté.

Preuves actuelles : `docs/qa/brief-v2/`. Capture de coordonnées publiée : `public-refonte-desktop.png` ; viewport observé 1280 × 960 CSS, DPR 2, capture native 2560 × 1920. Capture mobile : 390 × 844 CSS/DPR 1, PNG 390 × 844. Les revues détaillent leurs limites et distinguent local/production. Les sections suivantes conservent l’historique de la direction visuelle et des itérations antérieures.

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


## Menu Forfaits, boutons et refonte — 2 novembre 2026

Périmètre demandé : petit sous-menu Forfaits, contact noir, boutons Configurer avec survol coloré, inclusions expliquées, prestation de refonte séparée et nouvel aperçu Addiction Agency. Les trois agents ont traité navigation, lisibilité des pages et revue indépendante. Le catalogue et les JSX concernés sont indentés ; les textes réutilisés sont dans `shared/catalog.ts` et `src/content/`. Le guide `docs/MODIFIER_LE_SITE.md` indique précisément quoi modifier.

Référence d’effet : `https://elevenlabs.io/pricing`, observée dans le navigateur. La couleur se révèle par opacité (0,3 s), le texte change en 0,15 s et le grain reste statique en overlay. Preuves : `docs/qa/offers-menu-buttons/elevenlabs-effect.json` et `reference-elevenlabs-hover.jpg`. Studio conserve sa matière originale et son fondu de 120 ms approuvé ; aucun asset ElevenLabs ni suivi du pointeur ajouté.

Comparaison au même viewport : `before-public-comparison.jpg` est l’ancienne version publique ; `comparison-buttons-hover.jpg` est la nouvelle version locale. Vue juxtaposée `comparison-context.jpg`, détails `comparison-detail-before.png` et `comparison-detail-after.png`, dans `docs/qa/offers-menu-buttons/`.

- Composition : une seule entrée Forfaits, quatre offres et une entrée Refonte séparée ; contact noir. Les quatre cartes principales et le fond restent identiques. Refonte figure sous les cartes sur l’accueil et après le comparatif.
- Typographie : Geist et tailles conservées, pas de nouvelle police. Les inclusions sont expliquées avant les options, sans panneau supplémentaire.
- Espacements : sous-menu compact ; boutons du comparatif de 44 px minimum. Mobile 390 × 844 CSS : aucun débordement de page ; bouton observé 119 × 44 px, largeur de contenu identique. Tableau défilant conservé.
- Couleurs et états : Configurer noir au repos, texture de son forfait au survol/focus, durée observée 0,12 s. Focus visible, Échap ferme le menu et rend le focus au déclencheur ; navigation ferme menu et panneau mobile. Réduction des animations conservée.
- Images : véritable capture Addiction Agency 2560 × 1440 exportée en WebP ; provenance et crédit consignés dans `docs/ASSETS_REFERENCES.md`. L’ancien aperçu est archivé hors du public. Textures des cartes approuvées inchangées.

Parcours Refonte local : sujet prérempli, URL facultative distincte du honeypot, message trop long refusé ; une demande fictive enregistrée une seule fois avec son URL dans SQLite. Envoi explicitement désactivé, aucun e-mail émis. Preuve synthétique `refit-verification.json`. Les quatre forfaits et 26 options restent inchangés ; aucun nouveau prix ni inclusion commerciale arbitraire.

Vérification intégrée : `npm run check` passe (TypeScript, build, 113 tests), `git diff --check` passe. Revue indépendante : aucun blocage sur ce périmètre ; noms accessibles spécifiques ajoutés aux boutons. Contrôle navigateur après mise en forme du code : menu, boutons, explication Vitrine et contact Refonte conformes, aucune erreur/alerte applicative observée.

Statut de ce compte rendu : vérifications locales ; preuve de publication ajoutée après bascule de la release.


Publication du lot menu/inclusions/refonte : révision `6adfae1ad67f19dee184120fa9eaf87889c36534`, release `20261103T032149Z-6adfae1ad67f`, client `index-D7l4zL1X.js`. Santé HTTPS et empreinte publique confirmées. Dans le navigateur public : contact noir (RGB 17/17/17, texte blanc), cinq entrées du menu, sujet Refonte prérempli, URL facultative, capture Addiction chargée en 2560 × 1440. Mobile 390 × 844 CSS : cinq sous-liens, contact noir, fermeture après choix Vitrine, largeur 375/375 px. Captures `after-public-menu-retina.png`, `after-public-mobile-menu.jpg`, `after-public-agency.jpg`. Aucun formulaire soumis en production. Le lot précédent est terminé et vérifié ; la nouvelle demande de dépliage reste séparée jusqu’à sa validation.


## Dépliage sous le comparatif — lot suivant

La case à cocher du haut est remplacée par un bouton pleine largeur sous le tableau, avec chevron. Le tableau reste natif et unique ; les lignes complémentaires et les aides se déplient en CSS (grille 0fr/1fr, 280 ms), sans mesure JavaScript. La préférence de réduction des animations supprime la transition.

Contrôle local : aucun checkbox dans le comparatif ; 6 lignes accessibles replié, hauteur du tbody détaillé 0 ; ouverture à 420,5 px, aria-hidden=false ; fermeture avec Entrée, retour à 0 et focus conservé. Des transitions de 280 ms ont été observées pendant l’ouverture ; avec réduction du mouvement, aucune animation active. Viewport mobile 390 × 844 CSS : largeur client/document 375/375, bouton 335 × 52, fermeture complète sans lignes vides. Captures locales `details-collapsed-local.jpg` et `details-expanded-local.jpg`.

TypeScript, build et 113 tests passent après ce lot. Les cartes, boutons Configurer, menu et offres précédemment livrés sont conservés. Publication et contrôle public suivis séparément.


Publication du dépliage : révision `7d40317f149868db1606e956a4fcded6d1c0b930`, release `20261103T033748Z-7d40317f1498`, rechargée et contrôlée dans le navigateur public. Zéro case à cocher, bouton sous le tableau, aria-expanded=true et hauteur 420,5 px à l’ouverture, aucune erreur/alerte de console. Capture native `after-public-disclosure-retina.png`. Une session déjà ouverte affichait encore l’ancien client ; le rechargement a bien chargé le nouveau bouton. Aucun formulaire soumis.

## Six cartes, liens directs et léger halo — lots suivants contrôlés dans l’ordre

Navigation/cartes/galerie terminées et vérifiées localement avant l’ajout du halo :

- Quatre créations conservées ; Évolution et Refonte sont deux cartes distinctes et entièrement cliquables, avec motifs CSS propres, sujets et textes de contact différents. Aucune base de prix ni inclusion commerciale ajoutée. Les quatre OfferId restent stables.
- CTA partagés `.plan-cta` sur cartes/comparatif, sans flèche dans Configurer. Vrai survol observé sur le CTA Vitrine : opacité de matière 1, même filtre hue/saturation/luminosité que le comparatif. Aucun ArrowUpRight dans le public.
- Menu Forfaits coloré à l’interaction, six entrées. FAQ à droite avant Nous contacter ; FAQ aussi dans le panneau mobile. Contacts Évolution puis Refonte contrôlés : bons sujets, textes différents, URL facultative, formulaire renouvelé en changeant de service.
- Galerie : dix liens image/nom pointent directement vers leurs cinq sites réels, sans target ; clic effectif DOMTEKNIKA arrivé sur https://domteknika.ch/fr dans le même onglet, puis retour à la galerie. Crédits conservés.
- Mobile 390 × 844 CSS : client/document 375/375 px, menu six entrées et FAQ ; navigation Refonte ferme le panneau. Cartes largeur utile 333 px, aucune largeur excédentaire ; CTA mesurés 175 et 154 px sans texte dépassant. Captures `six-offers-mobile-local.jpg`, `two-services-mobile-local.jpg` et `two-services-local.jpg`.

Comparaison ElevenLabs supplémentaire par l’agent dédié : https://elevenlabs.io/pricing/agents, carte Free réellement observée. Image colorée et grain statiques, révélation 300 ms, texte 150 ms ; aucun déplacement de matière, canvas ou filtre animé constaté, aucune animation vers 500 et 1 000 ms. Mesures `elevenlabs-free-observation.json`. Aucun asset de cette référence n’est copié.

Le halo original studio est ensuite ajouté dans le haut des cartes de création : élément décoratif aria-hidden, opacité 0 vers 0,24 et petit déplacement de 550 ms, texture et recadrage conservés. Échantillons réels `studio-hover-glow.json` : variation de transform pendant le survol, état stabilisé vers 581 ms et zéro animation au repos. Capture `glow-local.jpg`. Pas de boucle, de filtre animé, de suivi de souris ni de nouvelle image.

Revue indépendante : aucun blocage du formulaire, de l’API, du tableau, du focus ou des liens détecté. JSX et catalogue lisibles, textes partagés dans src/content/, guide manuel mis à jour. Vérification intégrée finale : TypeScript, build et 113 tests passants, diff whitespace propre. La préférence de réduction des animations et le fond statique restent en place. Publication finale et contrôle public consignés ci-après après bascule.


## Publication finale vérifiée

Révision applicative `7c5550c67402246a656c534a54d0954fbc2afd9a`, release `20261103T040155Z-7c5550c67402`, client public `index-DGJoTYdQ.js` et archive SHA-256 `7c49eb1894f2c035b7d96431a46d7294c305721a5bf50b55dd6f3b5f776e591d` confirmés. Sauvegarde avant bascule ; états et PID des autres projets identiques, GP Park 200.

Contrôles du navigateur public après chargement complet : quatre créations et deux services distincts ; six entrées de menu avec déclencheur coloré, contact noir et FAQ à droite ; zéro flèche diagonale ou icône dans Configurer ; sujets Évolution/Refonte différents, URL facultative ; liens d’images et titres directement externes dans le même onglet ; filtre 3D montrant Julie Thiam et Tiny Heaven ; six questions pertinentes. Aucun message soumis.

Comparatif ouvert puis fermé au clavier : hauteur complémentaire 420,5 px puis 0, bouton sous le tableau, sans case à cocher. Mobile : largeur client/document 375/375, bouton 335 × 52, menu six entrées avec FAQ et fermeture à la navigation. Halo réel public à opacité 0,24 et transform stable, zéro animation au repos. Aucune erreur/alerte applicative dans les journaux de la visite finale.

Captures publiques réelles, après chargement complet : `final-public-menu-retina.png`, `final-public-cards-retina.png`, `final-public-services-retina.png` (PNG natives 2560 × 1440) ; `final-public-mobile-menu.jpg` et `final-public-mobile-details.jpg`. Le rendu des cartes distinctes a été ouvert et inspecté. Matière, typographie, espacements et états restent cohérents ; les modifications intentionnelles correspondent aux dernières demandes. Aucun écart bloquant constaté sur ce périmètre.

Localhost et onglet local fermés, ports 4173/4174 sans écoute, onglet public conservé. Le code est sur GitHub ; les comptes rendus peuvent être plus récents que la révision applicative en ligne. Prix, destinataire Resend et documents commerciaux restent explicitement reportés. Le présent contrôle ne revendique pas une réception d’e-mail réelle.

final result: passed


## Dernier lot — cartes alignées, sous-menu, FAQ et références

Vérification locale terminée après les corrections explicites de Mathis. Les sections antérieures décrivent leurs versions historiques ; les motifs CSS particuliers d’Évolution/Refonte et le survol coloré du déclencheur sont remplacés par les choix ci-dessous.

- **Source visuelle** : cartes studio déjà approuvées, pas une nouvelle proposition. Avant public : `docs/qa/card-alignment-faq-portfolio/before-public.jpg`. Après local : `aligned-cards-local.jpg`. Les services utilisent maintenant le même composant et la même matière que les quatre créations.
- **Géométrie desktop** : six cartes de 285,75 × 407,25 CSS ; Évolution et Refonte commencent aux colonnes 2 et 3 de la même grille à quatre colonnes. À 1024 px, six cartes de 454,5 × 407,25 CSS sur deux colonnes. À 390 px, six cartes de 335 × 407,25 CSS sur une colonne. Aucun agrandissement artificiel des deux dernières cartes.
- **Typographie et contenu** : Geist/Lucide et trois inclusions par carte conservés. Deux prestations distinctes sur devis, URL facultative et sujet propre dans les contacts. Aucun prix, délai, nombre de clients ou promesse inventé.
- **Matière et animation** : texture source d’origine et halo préexistants conservés sur les quatre créations. Deux variantes colorées pour les services, mêmes CTA et mêmes états de focus. Fond pastel statique inchangé.
- **Menu** : déclencheur neutre (`::before` absent), texture sur chacun des six liens. Survol réel de Connecté : texte blanc, opacité de texture 1 ; focus clavier Vitrine : mêmes états. Touche Fin vers Refonte, Échap ferme et restitue le focus. Captures `menu-offer-hover-local.jpg`, `keyboard-menu-local.jpg`, `mobile-menu-local.jpg`.
- **Comparatif** : libellé « Afficher plus de détails », `aria-expanded=true` à l’ouverture ; « Masquer les détails » à la fermeture. Tableau unique, aucune case à cocher. Réduction du mouvement vérifiée : durée effective 0,00001 s, imposée par la règle globale. Capture `comparison-details-local.jpg`.
- **FAQ** : huit questions et réponses, sources qualitatives Reddit documentées dans `docs/FAQ_RECHERCHE_REDDIT.md`. Frais récurrents, préparation des contenus, autonomie, domaine/hébergement, mobile, site existant, calendrier et référencement. Première réponse dépliée et inspectée ; `faq-local.jpg`.
- **Galerie** : neuf références, filtre 3D = cinq (Julie Thiam, Tiny Heaven, GeoBoss, Satellite Story, Atlante), Vitrine = deux (DOMTEKNIKA, Aéma). Images vérifiées chargées avec leurs dimensions natives. Aperçus GeoBoss/Aéma/Satellite capturés dans l’IAB depuis les vrais sites ; Atlante reprend le poster original. Provenance, SHA et dimensions dans `portfolio-assets.json`.
- **Liens** : image, titre et action des exemples restent de vrais liens dans le même onglet. Atlante porte le badge d’archive et pointe vers la présentation de l’auteur, pas vers un site actif fictif. Ancienne route `/exemples/atlante-3d` testée : arrivée au README GitHub exact dans le même onglet ; `atlante-archive-redirect.jpg`. Suppression du composant d’aperçu/dialogue et de ses styles sans usage.
- **Mobile** : menu déplié avec six offres et FAQ, clic Refonte arrivé au contact contextualisé et fermeture du panneau. Vue galerie et filtres à 390 × 844 CSS, document 375 px sans débordement ; à 1024 × 768, document 1009 px sans débordement. Captures `mobile-home-local.jpg`, `mobile-gallery-local.jpg`, `mobile-refonte-local.jpg`, `tablet-home-local.jpg`. Viewport et émulation de mouvement réinitialisés après contrôle.
- **ElevenLabs** : référence Free examinée dans l’IAB sur `/pricing`, opacité de l’image mesurée jusqu’à 1 avec transition CSS de 300 ms, `transform:none`, `filter:none`. Grain séparé et maintien de la dernière carte survolée observés ; le JSON de chronométrage documente uniquement l’entrée et ses styles, pas tous ces constats. Aucune texture ElevenLabs copiée dans studio. Voir `docs/EFFET_CARTES_ELEVENLABS.md` et `elevenlabs-iab-timeline.json`.
- **Code et validation** : données de service dans `src/content/existing-site.ts`, références/FAQ dans `shared/catalog.ts`, réutilisation du composant de carte, zéro nouvelle dépendance. Revue indépendante ayant repéré puis validé les deux corrections Atlante. `npm run check` final : TypeScript, build et 113 tests passent ; `git diff --check` propre. Aucun formulaire soumis ni e-mail réel émis.

Résultat final : passé. Révision applicative `6133f1e47ab998d59b4b1ecd3682e45fc9ce8020` publiée dans la release `20261103T045550Z-6133f1e47ab9`, client HTTPS `index-uoRXqwKE.js` exactement conforme au build. Santé publique et digest des quatre nouveaux WebP identiques aux fichiers locaux.

Contrôles publics IAB : six cartes de mêmes dimensions et centrage confirmé, survol Refonte, texture sur Connecté dans le sous-menu et déclencheur neutre, neuf références, filtre 3D avec cinq projets et lien d’archive exact, huit FAQ et première réponse dépliée. Mobile 390 × 844 CSS : document/client 375/375 px, six entrées du menu, bouton de détails ouvert et zéro case à cocher. Aucune erreur ni alerte applicative observée. Captures finales : `services-public-retina.png`, `menu-public-retina.png`, `cards-public.jpg`, `faq-public.jpg`, `faq-mobile-public.jpg`, `menu-mobile-public.jpg`, `details-mobile-public.jpg` dans le même dossier de preuves.

Les captures Retina natives PNG conservent 2560 × 1440 pixels pour le viewport desktop habituel de 1280 × 720 CSS ; aucun redimensionnement du navigateur pour améliorer artificiellement le rendu. Le PNG des services a été ouvert et inspecté. Les overrides temporaires ont été réinitialisés, l’onglet local fermé et les ports 4173/4174 vérifiés libres. Seul l’onglet public reste dans l’IAB. Sauvegarde privée avant bascule ; états/PID des autres projets Ubuntu inchangés, GP Park HTTP 200. Aucun formulaire soumis ni e-mail réel envoyé. Les prix et le destinataire Resend restent reportés conformément aux décisions utilisateur.


## Dernière correction — halo visible et deux réponses d’aide au choix

Retour de Mathis : le halo précédent n’était pas suffisamment visible. Le nouveau lot a été terminé et vérifié avant l’ajout des deux FAQ demandé pendant le travail.

- **Avant/après** : `docs/qa/visible-halo/before-public-retina.png` puis `after-local-retina.png`, même carte Connecté, même viewport desktop 1280 × 720 CSS à DPR 2 et même zone de la page. Captures natives PNG 2560 × 1440, sans interpolation. Une différence de quelques pixels de position verticale liée à l’arrivée sur l’ancre ne modifie pas les dimensions des cartes.
- **Aspect** : lueur colorée visible autour du contour ; source et cadrage de la texture conservés, mêmes titres, prix, boutons et inclusions. Halo interne augmenté de 0,24 à 0,55, placé plus à droite pour garder la lecture. Aucune translation de la carte elle-même ni changement des voisins.
- **Animation mesurée** : ombres et filtre de teinte fixes. Opacité extérieure 0→1 en 220 ms, expansion 420 ms ; lumière intérieure en déplacement 620 ms. `hover-timeline.json` contient dix échantillons réels de transformation entre 4 et 629 ms, puis zéro animation active après stabilisation. C’est une mesure de cette visite, pas une garantie universelle de performance.
- **Clavier/mouvement réduit** : focus-visible Connecté confirmé, lueur extérieure 1/intérieure 0,55 et contour de focus de 3 px préservé ; durée réduite effective 0,00001 s. Preuves `focus-reduced-motion.json`, `focus-local.jpg`. Émulation remise à zéro après l’essai.
- **Mobile** : six cartes 335 × 407,25 CSS, document/client 375/375 à viewport 390 px ; aucun débordement. Clic carte Vitrine arrivé au configurateur réel (titre Vitrine, options visibles). `mobile-layout.json`, `mobile-local.jpg`. Viewport temporaire réinitialisé.
- **FAQ** : deux entrées ajoutées en positions 9 et 10, les trois de l’accueil préservées. Questions « Comment savoir quel forfait choisir ? » et « Et si je choisis le mauvais forfait ? ». Panneaux ouverts et réponses inspectées sur ordinateur, puis mauvais choix sur mobile. Aide au choix et réorientation avec le client avant démarrage, sans nouveau tarif, délai ou remboursement promis. Captures `faq-choice-local.jpg`, `faq-correction-local.jpg`, `faq-correction-mobile-local.jpg`. Origine : demande directe de Mathis, distincte de l’étude Reddit.
- **Qualité** : revue CSS puis revue de copie par un agent, aucune anomalie bloquante constatée. `npm run check` : TypeScript, build et 113 tests passent. `git diff --check` propre. Aucune erreur ni alerte applicative observée dans l’IAB.
- **Nom du style** : grainy gradient / dégradé granuleux, source primaire CSS-Tricks consultée et liée dans `docs/EFFET_CARTES_ELEVENLABS.md`. Aucun asset supplémentaire ni dépendance de production.

Résultat final : passé. Révision applicative `8c497b4c5019f55f8c89b29adc256e0f5da437ee`, release `20261103T055310Z-8c497b4c5019` et client HTTPS `index-D32bwwWH.js` conformes au build. Santé publique valide. Dans l’IAB public, halo Connecté à opacités 1/0,55 avec transitions 220/420/620 ms et zéro animation après stabilisation. Capture native PNG 2560 × 1440 `after-public-retina.png` ouverte et inspectée ; métriques dans `public-halo.json`.

Dix FAQ publiques observées ; les deux réponses demandées ont été ouvertes et lues. Captures `faq-choice-public.jpg` et `faq-correction-mobile-public.jpg`. À 390 × 844 CSS, document/client 375/375 sans débordement. Aucune erreur ni alerte applicative observée. Viewport et émulation temporaires réinitialisés ; localhost arrêté, ports 4173/4174 libres. Seul l’onglet public est conservé dans l’IAB. Sauvegarde privée préalable, autres services Ubuntu/PID inchangés et GP Park HTTP 200. Aucun formulaire soumis ni e-mail réel envoyé.


## Dernier correctif — retrait du halo, reflet fixe dans le dégradé

Les essais de halo documentés ci-dessus sont rejetés par Mathis. Le pseudo-élément extérieur et le span `.pricing-card__glow` sont supprimés avec leurs styles. Les six cartes gardent leur géométrie et leur source, le survol de couleur et le focus. Le brillant demandé ensuite est un reflet diagonal fixe dans `.pricing-card__top::after`, avec un fin liseré intérieur ; saturation 1,04 et luminosité 0,94. Aucun déplacement de carte ni de lumière, aucun halo extérieur.

IAB local : `local-hover.json` confirme `halo:none`, `shadow:none`, zéro élément de glow, `cardTransform:none` et texture visible à opacité 1. Capture native 2560 × 1440 `local-retina.png`, inspectée. Au clavier : focus-visible et contour 3 px conservés. Mobile 390 × 844 CSS : document/client 375/375, six cartes et zéro glow ; `mobile-local.jpg`. Dix questions de FAQ restent présentes. Aucune erreur ni alerte applicative observée. Viewport temporaire réinitialisé.

Preuves dans `docs/qa/cards-without-halo/`. Résultat final : passé. `npm run check` après la version finale : TypeScript, build et 113 tests passent ; `git diff --check` propre. Révision `2c9ba4612055e752926c4a7320dc9d3bef37bd17`, release `20261103T064320Z-2c9ba4612055`, client `index-DHpQH5oY.js`, santé HTTPS conformes.

Contrôle public IAB : mêmes valeurs sans halo dans `public-hover.json` ; capture native PNG 2560 × 1440 `public-retina.png` ouverte et inspectée. Mobile public : document/client 375/375, six cartes et zéro glow ; `mobile-public.jpg`. Aucune erreur ni alerte applicative. Viewport réinitialisé et onglet de recherche temporaire fermé. Localhost arrêté, ports 4173/4174 libres. Sauvegarde privée et isolement des autres projets contrôlés par le déploiement. Aucun formulaire soumis ni e-mail réel envoyé.

Après ce correctif, nouvelle inspection ElevenLabs `/pricing` : `elevenlabs-recheck.json` consigne le PNG de couleur, l’image de bruit séparée en overlay et le fondu de 300 ms. Le fichier source Free a été ouvert directement, avec titre confirmant 786 × 600 ; `elevenlabs-source-image.jpg`. Le reflet diagonal STUDIO est notre traitement fixe, distinct de ce mécanisme observé.


## Dernier lot — images inchangées, reflet retiré, bref mouvement du grain

Clarification prioritaire : « nos images sont bien ». Les trois textures colorées sont comparées octet pour octet à Git et conservées, avec sources/cadrages/filtres inchangés. `original-images.json` garde les empreintes. Le reflet diagonal et son liseré sont retirés ; aucun halo extérieur. Le grain ajouté est une couche indépendante, limitée au bloc supérieur et précalculée en WebP pour éviter un filtre SVG à l’interaction.

IAB local : `local-timeline.json` montre dix échantillons réels de 0 à 443 ms. Couleur de 0 à 1 en 300 ms ; grain de 0 à 0,32, quelques changements de translation jusqu’à 350 ms puis transform:none. Matrices de carte et d’image constantes ; aucune animation active après stabilisation. Le fondu s’appuie sur la durée mesurée sur ElevenLabs ; le mouvement du grain est notre implémentation de la demande utilisateur, pas une reproduction revendiquée de leur code.

`interaction-checks.json` confirme l’absence de redémarrage en passant du haut au CTA, la disparition à la sortie et une nouvelle entrée après sortie réelle. Avec mouvement réduit : durée 0,00001 s, grain visible mais immobile et contour de focus 3 px. Mobile 390 × 844 : six cartes de 335 × 407,25, document/client 375/375 sans débordement, grain au repos invisible ; clic Vitrine arrivé au configurateur réel. Dix FAQ conservées. Aucune erreur ni alerte applicative observée. Viewport et émulation réinitialisés.

Capture native PNG 2560 × 1440 `local-retina.png` et mobile `mobile-local.jpg` dans `docs/qa/grain-entry/`. Revue indépendante par lecture sans blocage. `npm run check` final : TypeScript, build et 113 tests passent. `git diff --check` propre. Résultat final : passé. Révision applicative `34aa797bcb9a41004c598808049b675b4c2c789a`, release `20261103T071117Z-34aa797bcb9a` et client `index-68FeVs8c.js` contrôlés en HTTPS. Santé valide ; digest exact des trois textures colorées et du grain. Les trois textures d’origine restent identiques octet pour octet à la version précédente.

IAB public : `public-timeline.json` contient neuf relevés entre 1 et 457 ms. Grain en translation de faible amplitude jusqu’à 352 ms, transform:none à 404 ms puis zéro animation ; image révélée en environ 300 ms, carte immobile. Reflet diagonal et liseré absents, aucun halo. Capture native 2560 × 1440 `public-retina.png` ouverte et inspectée. Mobile : `mobile-public.json`, document/client 375/375 et six cartes, grain invisible au repos après stabilisation ; `mobile-public.jpg`. Aucune erreur ni alerte applicative. Viewport et émulation temporaires réinitialisés ; onglet de rasterisation fermé, seul le site public conservé. Localhost arrêté, ports 4173/4174 libres, autres projets Ubuntu/PID inchangés après sauvegarde préalable. Aucun formulaire soumis ni e-mail réel envoyé.

## Accordéon exclusif et galerie — 3 novembre, publié

Révision `3e740d6`, release `20261103T163209Z-3e740d63a275`. Une seule rubrique d’options ouverte, fermeture possible, choix résumés sous les titres fermés. Les inclusions sont identifiées et comptées ; réouverture et retrait d’une option contrôlés. Galerie conservée, liens externes dans un nouvel onglet avec noopener/noreferrer ; clic DOMTEKNIKA public vérifié, galerie toujours présente et opener nul confirmé par CDP. Six teintes de badges pastel, contraste minimal 5,86:1.

TypeScript/build/113 tests passants. Contrôles IAB publics desktop et 390 × 844 CSS : document/client égaux sur mobile (377/377, scrollbar exclue). Le navigateur possède un zoom de 120 % ; la taille de test a été ajustée pour vérifier la largeur CSS réelle. Les premières captures émises pendant le redimensionnement sont exploratoires ; `public-gallery-final.png` est la capture native finale après rechargement, sans redimensionnement. Aucun formulaire soumis, choix de contrôle publics retirés, ancien brouillon préservé, aucune alerte applicative. Localhost fermé. Preuves dans `docs/qa/accordion-gallery/`.

## Couleurs des forfaits et badge unique — 3 novembre, publié

Dernière clarification appliquée après clôture du lot précédent : un seul badge par référence, texture et variantes identiques aux cartes de forfait, reprises aussi dans les filtres. Les pastels spécifiques sont remplacés. Le filtre actif porte un contour indépendant de sa couleur ; « Tous » reste neutre. Aucun nouveau visuel ni mouvement supplémentaire. « Projet archivé » est conservé dans la description.

Révision `0aeb90d`, release `20261103T164107Z-0aeb90d5a7a8`, client `index-Bdlv6znL.js`. TypeScript/build/113 tests passent. HTTPS et IAB public : neuf références et neuf badges ; filtres 9/2/1/5/2, 36 liens externes conservés. Aucun débordement à 390 × 844 CSS (document/client 377/377), aucune alerte applicative observée. Preuve native finale : `docs/qa/gallery-plan-colors/public-final.png` ; mesures dans le même dossier. Les captures locales faites pendant l’émulation sont exploratoires. Viewport réinitialisé, localhost fermé, autres projets Ubuntu inchangés.

## Filtres, menu mobile et changement de forfait — 3 novembre, publiés

Ordre de la file respecté : filtres blancs avec texture au survol/focus/sélection puis menu mobile noir et accordéon recontrôlé, publication `99f4eaf` vérifiée ; ensuite menu Changer à six entrées et retrait du contour violet Forfaits, publication `db50490` (release `20261103T170055Z-db504905a1d5`, client `index-CPw93N-F.js`). Aucun nouveau prix ou périmètre, aucune image modifiée.

Changer réutilise le DropdownMenu du site : menu de 224 px attaché au bouton, zéro dialogue, quatre créations et deux demandes contextualisées Évolution/Refonte. Les six parcours sont vérifiés localement et les deux sujets de demande en ligne. Options compatibles conservées, Échap rend le focus au bouton. Le focus du header est un trait noir de 2 px ; aucun contour violet. Mobile public 390 × 844 CSS : menu de six entrées dans la largeur du document, 390/390 ; pas de débordement.

TypeScript/build/113 tests passent. HTTPS et client identiques au build, aucune alerte applicative observée, aucun formulaire soumis. Émulation retirée, onglet de contrôle temporaire fermé, onglet public conservé, localhost arrêté et autres projets Ubuntu inchangés. Preuves : `docs/qa/filter-hover-mobile-menu/` et `docs/qa/inline-plan-chooser/`. Capture native finale du menu : `docs/qa/inline-plan-chooser/public-menu.png`. Les contrôles finaux utilisent un onglet intégré séparé pour laisser Mathis tester dans son onglet.

## Carte commune et menu translucide — 3 novembre, publiés

Dernière correction de Mathis : suppression du contour supplémentaire autour de Changer, menu dans la matière du bouton avec transparence et textures au survol ; Évolution/Refonte dans le même dessin de fiche. Les six offres partagent maintenant `SelectedPlanCard` et `project.css`. Sur devis et formulaire contextualisé pour les deux services, un seul H1, aucun sélecteur de sujet redondant. Les images et filtres de la grande carte restent exactement ceux déjà approuvés.

Continuer servait à ouvrir les coordonnées et était affiché en double. Le bouton de la carte est supprimé ; Ajouter mes coordonnées reste après les options sur ordinateur, Mes coordonnées dans la barre mobile. Le parcours et le retour aux options ont été testés avec sélection conservée.

Un débordement du séparateur du menu a été constaté lors du premier contrôle puis corrigé : contenu/client 208/208 dans un menu de 210 px, sans barre horizontale. Fond translucide rgba(22,20,26,.64), flou statique de 12 px limité à la petite surface du menu ouvert ; aucune animation permanente ajoutée. Hover de l’item Évolution vérifié à opacité 1 et focus du déclencheur sans contour, avec soulignement. La capture locale antérieure à la correction est conservée hors de Git dans `.data/qa/`.

Publication `8187d38`, release `20261103T173638Z-8187d38f889b`, client `index-ddtJu-_H.js`. TypeScript/build/113 tests passent. IAB public desktop et mobile 390 × 844 CSS : carte de 350 px au-dessus du formulaire, document/client 390/390 et menu dans la largeur ; aucune alerte applicative observée. HTTPS et client identiques au build, aucun formulaire soumis, localhost fermé, autres projets Ubuntu inchangés. Preuve native finale : `docs/qa/shared-project-cards/public-refonte-glass.png` ; mesures et autres captures dans le même dossier. Onglet temporaire de contrôle fermé, Refonte publique laissée ouverte.
