# Suivi des demandes

Version actuelle vérifiée : `e8895ae` sur https://gilmathis.com/. Les anciens lots ci-dessous constituent l’historique ; les dernières décisions priment.

Traiter les demandes dans l’ordre : terminer le lot en cours, le vérifier, puis prendre le suivant. Une nouvelle instruction rejoint la file ; elle ne remplace pas silencieusement le travail déjà commencé. Les dernières décisions explicites remplacent les anciennes demandes contradictoires.

## Ouverture des forfaits et options visibles — 4 novembre 2026, implémenté localement

Demande suivante à l’audit : fluidifier le clic sur un forfait jusqu’à sa grande carte. Puis correction reçue pendant l’implémentation : afficher les options sélectionnées dans la carte, et supprimer le détail replié sous celle-ci.

Transition native de surface en 420 ms, apparition douce du contenu, navigation et contrôles laissés hors des captures pour conserver les clics rapides. Coordination synchrone via le routeur ; vraies ancres, clavier et clics modifiés conservés. Modules publics résolus avant capture de la page cible, y compris à froid. Animations réduites selon la préférence système ; fallback sans API native. Textures d’origine identiques octet pour octet.

Options choisies affichées dans la carte au-dessus du total, mises à jour à la sélection/désélection et visibles aussi au brief. Carte extensible, arrêt de sticky si sa hauteur dépasse l’espace disponible. Contrôles IAB ordinateur/mobile, douze options visibles, aucune largeur débordante, retour au brief et refus de quitter conservant la saisie. Prix, données et logique d’envoi inchangés ; aucune demande envoyée. Rapport : `qa/plan-transitions/design-qa.md`.

État de livraison : modifications locales, pas de commit/push ni de déploiement Ubuntu. TypeScript, build et 213 tests passent après la dernière modification. Build Express local, six destinations, clics rapides, clavier, Cmd+clic et reduced motion vérifiés ; console finale sans erreur/alerte observée. Sélection et réglages rétablis, saisies fictives effacées, onglets et serveurs temporaires fermés. Détails et limites dans le rapport du lot.

## Audit général et transparence des prix — 4 novembre 2026, audit terminé

Cinq avis indépendants, puis cinq relectures d’un corpus anonymisé et arbitrage du coordinateur. Sources actuelles relues et parcours publics contrôlés dans l’IAB sur ordinateur/mobile, sans soumission. Rapport : `qa/general-council-2026-11-04/rapport-general.md` ; parcours visuel numéroté : `qa/general-council-2026-11-04/design-qa.md`. Les avis initiaux sont conservés et scellés par SHA-256.

Objectif exprimé : connaître son budget avant contact, avec une estimation aussi proche que possible du prix final, et éviter les suppléments inattendus. Recommandation à arbitrer : prix forfaitaires et options en euros au premier plan ; heures surtout internes, éventuellement détail facultatif ou intervention réellement vendue au temps avec plafond convenu. Précision ±10–20 % non démontrée ; définir d’abord inclusions, unités et volumes, puis adopter les tarifs. Aucun prix de l’étude antérieure adopté ou publié.

Constats confirmés : montants publics en attente, options de volume sans quantités, textes légaux provisoires, Galerie retirée sans explication au passage Vitrine → Connecté et contraste local trop faible de petits textes. À améliorer ensuite : budget complet, récapitulatif conservable/versionné, confirmation et retours d’état du prix. Vrai passage mobile vers le brief fonctionnel ; aucune panne GeoBoss, e-mail ou indexation démontrée. Destination Resend toujours volontairement reportée, aucune relance pendant cet audit.

55 tests existants ciblés passent. Documentation uniquement ; aucun fichier produit modifié, aucun commit/push/déploiement, aucun serveur local lancé. Viewport réinitialisé et onglets temporaires fermés. Les recommandations restent à décider avant un lot d’implémentation.

## Questionnaires et conseil croisé — terminé et vérifié en ligne

Cinq conseillers indépendants puis cinq relectures des avis anonymisés, avec arbitrage final documenté. Questions allégées ou précisées selon le forfait, branches Réservation/Boutique liées aux options, Sur mesure créatif, incertitude exclusive et historique conservé. Lien HTTPS facultatif WeTransfer/SwissTransfer/dossier partagé, précision conditionnelle et récapitulatif privé ; limites des images inchangées, aucune récupération automatique.

Accueil : accompagnement et aide au choix, étapes du vrai parcours, revue de sécurité avant livraison et conception tenant compte du RGPD. Qualification d’ingénieur préparée mais pas publiée tant que l’intervention reste seulement « je pense ». Étude France sourcée et six fourchettes proposées dans `docs/ETUDE_MARCHE_PRIX_FRANCE_2026-11-03.md` ; aucun prix ni −50 % publiés.

Application `82d3e3b`, release `20261104T024657Z-82d3e3b9dad9`, client `index-BlgVzUM-.js` : TypeScript, build et 213 tests passent. Empreinte HTTPS identique, sauvegarde et décodeur avant bascule, autres projets inchangés. Accueil et Refonte vérifiés dans l’IAB public, dont lien, résumé replié et mobile ; aucune demande envoyée en production. Saisie fictive effacée, session QA locale déconnectée, réglages navigateur rétablis et localhost fermé. Preuves et limites dans `docs/qa/brief-council/final-review.md`.

## Contour de sélection des options — terminé et vérifié en ligne

Lot distinct, commencé après clôture des questionnaires : `:focus-within` dessinait un contour violet autour de toute la ligne au clic. Contour retiré dans configurateur et questionnaire ; coche noire, bordure neutre fine et focus clavier limité à la petite case. Ombre intérieure de sélection supprimée, cartes et grain conservés.

Application `e8895ae`, release `20261104T043052Z-e8895ae19aeb`, client `index-Biz5hM9-.js` : TypeScript, build et 213 tests passent. IAB local et public : souris, clavier, choix du brief et mobile ; configuration initiale et saisies fictives rétablies, aucune soumission. Client et deux CSS identiques au build par HTTPS, sauvegarde et Sharp avant bascule, autres projets inchangés. Localhost fermé. Preuves : `docs/qa/selection-focus/review.md`.

## Galerie et revue critique — terminé et vérifié en ligne

Remarque de l’ami annulée : badges et textures approuvés conservés, filtres blancs au repos puis colorés au survol/sélection. Grand bloc d’introduction retiré. Filtrage strict par offre : Julie Thiam en Sur mesure, GeoBoss en Connecté, Lactel en Vitrine ; GeoBoss ne remonte plus en 3D. Cal.com ajouté comme référence avec une vraie page de connexion vérifiée, aperçu natif et source créditée. Dix sites, un seul badge chacun ; tous les liens externes ouvrent un nouvel onglet. Cinq filtres contrôlés en production avec scroll à 18 px inchangé.

Trois spécialistes ont ensuite revu interface, performance et SEO. Perte du brief à la navigation corrigée par un garde de sortie ; Confidentialité ouvre un autre onglet. Annulation, Retour, refus de changer de forfait, reprise des options et écran bas testés localement ; garde Contact aussi testé en ligne sans envoi. Pied de page stabilisé, formulaire chargé à la demande et premières images de galerie immédiates. Métadonnées partagées serveur/SPA, sitemap XML de douze URL, robots texte et vraies 404 publiés ; dix réponses FAQ présentes dans le DOM.

Publication `099c1a1`, release `20261103T225415Z-099c1a131eef`, client `index-DZiCU2sY.js` : TypeScript, build, 202 tests, santé et empreinte HTTPS conformes au build, décodeur natif Ubuntu vérifié avant bascule et autres projets inchangés. Mesures initiales IAB à 1280 × 720 : CLS environ 0,00007 sans cache navigateur et 0 avec cache sur accueil/galerie/Vitrine ; aucun résultat terrain ou classement Google promis. Mobile 390 × 844 sans débordement. Textures inchangées, aucune demande envoyée. Informations légales réelles et destination Resend toujours à fournir ; corps des pages rendu côté client. Localhost fermé, onglet public conservé. Détails et preuves : `qa/gallery-review/final-review.md`.

## Briefs publics par forfait — terminé et vérifié en ligne

Recherche préalable Reddit et sources professionnelles documentée dans `BRIEF_RECHERCHE.md`, puis quinze spécialistes coordonnés par périmètres. Prénom, nom, e-mail et téléphone obligatoires côté navigateur et serveur. Questions propres aux quatre créations et à Évolution/Refonte ; Refonte couvre aussi identité/références, plateforme, accès disponibles, contenus, URL/redirections, référencement, données et continuité. Réponses conditionnelles et incertitude possibles. Les choix n’ajoutent aucune option silencieusement.

Options publiques ramenées à 12/12/12/10 selon le forfait, sans refacturer les inclusions ; Vitrine garde le mobile facultatif. Le retour aux options conserve le brief et les images. Le catalogue historique de 26 options reste lisible pour les dossiers privés. Les images JPEG/PNG/WebP sont bornées, décodées, enregistrées avec le dossier dans une transaction et consultables seulement par l’administration. Sauvegarde/restauration réelle, idempotence, erreurs et accès privés testés. Anciennes demandes conservées.

TypeScript, build et 192 tests réussis ; dernière reconstruction après un ajustement de texte. Parcours complet Refonte soumis uniquement à une base locale isolée, avec image de test puis lecture admin. Publication `770a271`, release `20261103T213957Z-770a271379ef`, client `index-CYUgPAPx.js` : santé et SHA-256 HTTPS conformes au build, décodeur Sharp vérifié sur Ubuntu avant bascule. Contrôles IAB publics Refonte/Vitrine et mobile 390 × 844 sans débordement, quatre coordonnées requises, branches techniques et références constatées ; aucune demande ni image envoyée en production. Les six parcours ont été revus localement. Autres projets Ubuntu inchangés, localhost fermé. L’adresse Resend reste à fournir plus tard par Mathis. Preuves et revues : `qa/brief-v2/`.

## Cartes Évolution/Refonte et menu translucide — terminé et vérifié en ligne

Contour supplémentaire autour de Changer retiré ; focus clavier souligné. Menu compact sombre translucide avec flou statique, six choix et textures au survol/clavier. Une même carte et un même menu servent aux quatre créations ainsi qu’à Évolution et Refonte ; styles partagés dans `src/components/layout/project.css`. Les deux prestations gardent leurs demandes sur devis et leur formulaire propre à droite ; le sélecteur de sujet redondant disparaît uniquement sur ces fiches.

Continuer servait à passer aux coordonnées et était affiché en double sur ordinateur. Le doublon de la carte est retiré ; une action explicite reste après les options, avec variante mobile dans la barre fixe. Retour aux options et sauvegarde des dossiers privés conservés.

Contrôles locaux IAB : six destinations, carte de même géométrie, menu sans débordement, hover coloré, un seul H1 par fiche, retour des coordonnées avec choix conservés, services sur mobile et contact général inchangé. Un débordement de 2 px du séparateur a été trouvé puis corrigé ; le menu est désormais à 208/208 px client/contenu. TypeScript, build et 113 tests passent. Aucun formulaire soumis. Preuves : `qa/shared-project-cards/`. Publication `8187d38`, release `20261103T173638Z-8187d38f889b`, client `index-ddtJu-_H.js` vérifiés : cartes Refonte/Évolution de mêmes dimensions que les créations, Sur devis et formulaires adaptés ; menu translucide de 210 px, six choix et hover coloré, zéro contour supplémentaire, aucun débordement. Action explicite vers les coordonnées testée sur ordinateur/mobile. Aucun formulaire envoyé. Santé et empreinte HTTPS conformes au build, autres projets Ubuntu inchangés, localhost fermé et onglet public conservé.

## Menu Changer et focus Forfaits — terminé et vérifié en ligne

Demande reçue pendant la clôture du lot précédent : remplacer la fenêtre centrale par un petit menu déroulant attaché au bouton. Afficher les quatre créations et les deux prestations Évolution/Refonte, en gardant leurs destinations et leurs périmètres existants. Petit DropdownMenu ancré au bouton, six choix, création courante cochée, aucune fenêtre centrale. Six destinations contrôlées, sujets Évolution/Refonte corrects et options compatibles conservées. Menu mobile de 224 px sans débordement, Échap ferme et rend le focus au bouton. Ensuite, contour violet Forfaits retiré : le clavier conserve un soulignement noir de 2 px. Preuves : `qa/inline-plan-chooser/`. Publication `db50490`, release `20261103T170055Z-db504905a1d5`, client `index-CPw93N-F.js` : menu de six entrées, zéro dialogue et position sous le bouton confirmés en ligne ; destinations Évolution/Refonte et sujets corrects, focus Forfaits sans contour violet. Contrôle mobile 390 × 844 CSS sans débordement. TypeScript, build et 113 tests passent. Les filtres blancs et le menu mobile du lot précédent restent en place. Aucun formulaire soumis. Localhost fermé, onglet public conservé, autres projets Ubuntu inchangés.

## Filtres au survol et menu mobile — terminé et vérifié en ligne

Ordre suivi : filtres blancs au repos, matière au survol/focus ou à la sélection vérifiée localement ; puis correction de l’ancien violet de la page active dans le menu mobile. La page courante garde un soulignement noir. L’accordéon exclusif et ses résumés, déjà publiés, sont recontrôlés à la demande de Mathis. Un seul badge texturé par site conservé. Retour au blanc après désélection, survol et sélection persistante validés dans l’IAB. Menu noir avec soulignement actif et accordéon recontrôlés. TypeScript, build et 113 tests passent. Preuves : `qa/filter-hover-mobile-menu/`. Publication `99f4eaf`, release `20261103T164953Z-99f4eafe49de` : filtres blancs au repos et colorés au survol/sélection, menu mobile noir avec page courante soulignée, accordéon exclusif et résumés confirmés en ligne. Client HTTPS identique au build, autre projets Ubuntu inchangés. Les choix temporaires de contrôle publics ont été retirés. Ce lot est clos avant de remplacer Changer.

## Couleurs des forfaits dans la galerie — terminé et vérifié en ligne

Un seul badge de catégorie par site. Badges et filtres réutilisent notre texture et les variables de couleur/cadrage de la carte forfait correspondante ; aucun nouveau visuel. « Tous » reste neutre et le filtre actif a un contour. Les tags secondaires restent disponibles pour le classement interne sans être affichés ; Projet archivé est conservé comme texte dans la description. Publié dans `0aeb90d`, release `20261103T164107Z-0aeb90d5a7a8`. Neuf sites et neuf badges, filtres Tous/Vitrine/Connecté/3D/Sur mesure contrôlés : 9/2/1/5/2 résultats, un seul badge par résultat. Contour actif visible ; variables de variantes identiques à celles des cartes. Les 36 liens externes gardent target/rel. HTTPS et client identiques au build, contrôles IAB desktop/mobile passés, 113 tests passants. Aucun formulaire soumis, aucune alerte applicative observée ; localhost fermé, autres projets Ubuntu inchangés. Preuves : `qa/gallery-plan-colors/`.

## Accordéon et galerie — terminé et vérifié en ligne

Demande limitée aux interactions et badges : une seule rubrique d’options ouverte à la fois, refermable au clavier ; les rubriques fermées montrent les choix actifs, dont les inclusions identifiées. Le résumé est dérivé de la configuration existante, sans changement de prix ou de persistance. Une option retirée disparaît du résumé, les choix restent cochés à la réouverture.

La galerie conserve ses neuf références, images, filtres et crédits. Image, titre et action ouvrent un nouvel onglet (`target="_blank"`, `rel="noopener noreferrer"`), remplaçant explicitement la précédente consigne. Badges pastel distincts pour les quatre catégories, Contenus et Projet archivé. Contrôles IAB locaux : ouverture d’un onglet DOMTEKNIKA distinct, conservation de la galerie, résumés, inclusions, clavier et mobile. TypeScript, build et 113 tests passent. Preuves : `qa/accordion-gallery/`. Publication vérifiée : `3e740d6`, release `20261103T163209Z-3e740d63a275`, client `index-DpDJqyK1.js`. Contrôles HTTPS et IAB publics passés : accordéon exclusif, résumés, clavier, mobile sans débordement à 390 px CSS, 36 liens externes avec target/rel et ouverture DOMTEKNIKA dans un onglet distinct. Ancien brouillon public rétabli après les sélections de contrôle ; aucune soumission. Localhost arrêté, ports 4173/4174 libres et autres projets Ubuntu inchangés.

## Images conservées, reflet retiré et entrée du grain — terminé et vérifié en ligne

Mathis rejette le reflet et demande de se rapprocher d’ElevenLabs avec un grain qui bouge brièvement au début. Sa clarification « nos images sont bien » impose de conserver exactement les images actuelles. Les trois fichiers colorés ont été comparés à la version précédente : identiques octet pour octet.

Reflet/liseré retirés, aucun halo. Fondu couleur 300 ms, texte 150 ms et grain indépendant de faible amplitude pendant 360 ms, une seule fois puis arrêt. Texture de grain WebP précalculée, sans filtre de bruit calculé à l’interaction. Revue indépendante par lecture sans blocage ; contrôles IAB d’entrée/sortie/réentrée, déplacement entre les enfants de la carte sans redémarrage, focus, réduction du mouvement et mobile passés. Dix FAQ conservées. TypeScript, build et 113 tests passent. Preuves : `qa/grain-entry/`. Publication vérifiée : `34aa797`, release `20261103T071117Z-34aa797bcb9a`, client `index-68FeVs8c.js`. Contrôles HTTPS et IAB public desktop/mobile passés ; les trois textures colorées servies sont identiques aux sources prévues, le grain bouge brièvement puis s’arrête. Aucun halo/reflet. Localhost fermé, ports 4173/4174 libres, autres projets Ubuntu inchangés.

## Retrait du halo et reflet intérieur — terminé et vérifié en ligne

Dernier retour de Mathis : halo et animation derrière les cartes rejetés, rendu du dégradé souhaité plus brillant. Les deux couches de halo sont retirées, y compris le span et son CSS ; aucune lumière ne se déplace. Un reflet diagonal fixe et un liseré limités à la zone colorée donnent le brillant ; source et cadrage conservés, saturation 1,04 / luminosité 0,94. Le fondu de couleur de 120 ms reste présent.

Contrôles locaux IAB : absence de halo/pseudo-élément extérieur et de `.pricing-card__glow`, texture au survol, carte sans transformation, focus 3 px conservé, six cartes et aucune largeur débordante sur mobile. Dix FAQ conservées, dont les deux réponses d’aide au choix. Preuves : `qa/cards-without-halo/`. TypeScript, build et 113 tests passent. Publication `2c9ba46`, release `20261103T064320Z-2c9ba4612055`, client `index-DHpQH5oY.js` vérifiés en HTTPS et IAB public, desktop/mobile. Zéro glow et aucune ombre extérieure observés ; localhost fermé. Après le correctif, ElevenLabs a été réinspecté : image PNG couleur, grain séparé et fondu CSS 300 ms confirmés, voir `EFFET_CARTES_ELEVENLABS.md`. Ce retour remplace les consignes des essais historiques ci-dessous.

## Halo visible, puis aide au choix du forfait — terminé et vérifié en ligne

Ordre suivi : halo rendu plus visible, contrôlé au survol, au clavier avec mouvement réduit et sur mobile ; puis ajout des deux FAQ demandées pendant ce travail. La présence du halo a été revue par un autre agent avant de passer aux réponses.

- Halo coloré autour des six cartes : fondu 220 ms et légère expansion 420 ms. Lumière intérieure plus visible (opacité 0,55) et déplacement 620 ms. Matière, cadrage, layout et fondu de texture 120 ms préservés.
- Zéro animation permanente après stabilisation ; aucune attente de chargement, boucle ou écouteur de souris. Focus visible et réduction du mouvement conservés.
- FAQ ajoutées en fin de liste : choix du forfait et correction d’un mauvais choix, avec accompagnement de l’équipe avant démarrage. Dix questions au total, trois de l’accueil inchangées.
- Le style de couleurs est décrit comme « grainy gradient » / dégradé granuleux ; source primaire lue dans l’IAB, lien dans `EFFET_CARTES_ELEVENLABS.md`.
- TypeScript, build et 113 tests passent ; deux revues indépendantes par lecture sans blocage. Captures et mesures : `qa/visible-halo/`, `../design-qa.md`. Aucun formulaire soumis ni e-mail réel envoyé. Publication terminée : révision `8c497b4`, release `20261103T055310Z-8c497b4c5019`, client `index-D32bwwWH.js`. Contrôles HTTPS et IAB public passés : halo, deux réponses de FAQ et mobile. Localhost arrêté (ports 4173/4174 libres), viewport réinitialisé, seul l’onglet public conservé. Les autres projets Ubuntu restent inchangés.

## Alignement des cartes, FAQ et portfolio — terminé et vérifié en ligne

Ce lot reprend les dernières corrections explicites de Mathis, qui remplacent les anciens motifs des cartes services et le survol du déclencheur Forfaits.

| Demande | Résultat vérifié |
| --- | --- |
| Évolution et Refonte comme les autres cartes | Composant `PricingCard` commun, même largeur et même hauteur, centrage sous les quatre créations ; matière d’origine, deux nouvelles variantes |
| Couleurs sur chaque offre du sous-menu | Six liens colorés au survol/focus ; déclencheur Forfaits neutre ; navigation clavier et Échap contrôlés |
| Libellé du dépliage | « Afficher plus de détails », puis « Masquer les détails » ; aucune case à cocher, réduction du mouvement respectée |
| FAQ rassurante issue de recherches Reddit | Huit questions sur frais, contenus, autonomie, domaine, mobile, site existant, calendrier et référencement ; sources et limites qualitatives documentées |
| Portfolio de Raphaël complété | GeoBoss, Aéma Groupe, Satellite Story et Atlante 3D ajoutés ; neuf références au total ; vrais aperçus, crédits et filtres |
| Atlante archivé | Badge « Projet archivé », lien « Voir la présentation » vers le README de l’auteur ; aucune fausse destination de site actif |
| Accès direct aux exemples | Liens dans le même onglet et anciennes routes de fiches redirigées directement ; ancien aperçu en sous-fenêtre et CSS associés supprimés |
| Comprendre ElevenLabs | Image, grain indépendant et fondu observés dans le navigateur intégré ; recherche distincte de l’implémentation, aucun asset copié |
| Navigateur demandé | Vérifications finales exclusivement dans le navigateur intégré, jamais Chrome après cette instruction |

TypeScript, build et 113 tests passent après la dernière correction Atlante. Revue indépendante sans blocage. Dimensions, mobile, filtres, clavier, liens et captures : `../design-qa.md` et `qa/card-alignment-faq-portfolio/`. Aucun formulaire soumis, aucun e-mail réel envoyé. Publication terminée : révision `6133f1e`, release `20261103T045550Z-6133f1e47ab9`, client `index-uoRXqwKE.js`. Santé HTTPS, empreinte du client, quatre nouveaux WebP et parcours publics desktop/mobile contrôlés. Localhost fermé, ports 4173/4174 libres, seul l’onglet public conservé. Les autres projets Ubuntu sont restés inchangés.

## Historique du premier lot terminé et vérifié en ligne

Révision applicative `6adfae1`, release `20261103T032149Z-6adfae1ad67f`, sur `https://gilmathis.com/`.

| Demande active | Résultat vérifié |
| --- | --- |
| Contact noir | Bouton noir sur ordinateur, dans l’en-tête mobile et le panneau mobile |
| Petit sous-menu Forfaits | Quatre forfaits + entrée Refonte séparée ; clavier, Échap et fermeture après navigation |
| Boutons Configurer | Vrais boutons noirs, matière du forfait au survol/focus |
| Inclusions compréhensibles | Explication propre à chaque forfait avant les options |
| Upgrade/refonte | Bloc Refonte & évolution, sur devis, sous les offres ; contact contextualisé avec URL facultative |
| Aperçu Addiction | Nouvelle capture du vrai site de l’agence, 2560 × 1440, source et crédit vérifiés |
| Code modifiable à la main | Catalogue et JSX indentés, textes partagés séparés, guide `MODIFIER_LE_SITE.md` |
| Vérification | TypeScript, build et 113 tests ; navigateur local et public ; largeur mobile sans débordement |

Preuves : `qa/offers-menu-buttons/`, `../design-qa.md`. Aucun message réel soumis sur le site public, aucun e-mail de test émis.

## Dépliage — terminé et vérifié en ligne

« Afficher les détails » sous le comparatif : bouton dépliant avec chevron et animation douce, à la place de la case à cocher. Révision `7d40317`, release `20261103T033748Z-7d40317f1498`, rechargée et contrôlée en ligne : zéro case à cocher, aria-expanded correct, lignes repliées de hauteur nulle puis ouverture à 420,5 px, aucune erreur de console. Contrôles locaux supplémentaires : fermeture au clavier, tableau unique, réduction du mouvement et largeur mobile. TypeScript, build et 113 tests passent.

## Navigation, cartes et galerie — terminés et vérifiés en ligne

1. Retirer les flèches des boutons Configurer.
2. Donner aux boutons des cartes de l’accueil le style et le survol des boutons du comparatif.
3. Ajouter un survol coloré à Forfaits dans la barre de navigation.
4. Séparer Évolution et Refonte en deux offres avec leurs propres cartes et motifs, au lieu d’un bloc commun.
5. Galerie : ouvrir directement le vrai site depuis l’image ou le nom, dans le même onglet.
6. FAQ à droite dans la navigation, avant Nous contacter ; aussi dans le panneau mobile.
7. Retirer les flèches diagonales des pages publiques, y compris Comment ça se passe.

Les sept demandes ont été traitées puis vérifiées ensemble sur ordinateur et mobile : six liens dans Forfaits, FAQ à droite, deux contacts distincts, CTA partagés, zéro flèche diagonale et clic DOMTEKNIKA arrivé directement sur le vrai site dans le même onglet. TypeScript, build et 113 tests passent. Revue indépendante sans blocage.

## Halo — traité après validation du lot précédent

Référence Free étudiée en parallèle ; léger effet lumineux original ajouté ensuite au haut des cartes, avec la matière approuvée conservée. Opacité de 180 ms et petit déplacement de 550 ms, sans boucle ni suivi de souris. Mouvement réel mesuré, zéro animation au repos ; au clavier avec réduction du mouvement : halo visible et zéro animation. TypeScript, build et 113 tests de la version finale passent. Publication finale contrôlée : révision `7c5550c`, release `20261103T040155Z-7c5550c67402`, client `index-DGJoTYdQ.js`. Les contrôles locaux ont été complétés par les parcours publics desktop/mobile. À la livraison de ce lot historique, aucune demande d’interface de sa file ne restait ouverte ; les éléments commerciaux reportés ci-dessous restent distincts.

## Décisions antérieures conservées et revues dans le code

- Quatre forfaits de création, titres directs, cartes entièrement cliquables, effet et texture approuvés conservés.
- Fond pastel et grain générés dans le code, statiques selon la dernière correction ; aucun aperçu en ouverture de l’accueil.
- Configuration avec grande carte à gauche et options à droite, sans onglets Présentation/Exemple. Totaux ponctuels et mensuels séparés ; mise en ligne et maintenance facultatives.
- Vitrine sur ordinateur à la base, mobile facultatif. Connecté comprend les comptes des visiteurs et la gestion des contenus. Immersif 3D comprend le modèle fourni et ses interactions ; création d’un modèle séparée.
- Galerie distincte, filtres et crédits, DOMTEKNIKA et Julie Thiam présents, exemple Artisanat retiré, aucune scène externe chargée automatiquement.
- Parcours public par demande de contact ; navigation de connexion et Mon projet retirée, données privées historiques conservées.
- Mentions inutiles et badges rejetés retirés ; FAQ sur contenus, délai, modifications, mobile, hébergement et maintenance.
- Ubuntu isolé par projet ; autres services inchangés lors de la bascule. Localhost à fermer à la fin du travail.

## Éléments volontairement ouverts

Les prix et périmètres commerciaux restent à arrêter ; aucun montant, délai ou chiffre client inventé. Le destinataire Resend sera fourni plus tard par Mathis : les demandes sont conservées, mais une réception e-mail réelle reste à vérifier après configuration. L’identité et les documents commerciaux définitifs restent à compléter. Ces éléments ne sont pas présentés comme terminés par la livraison de l’interface.

L’étude de marché antérieure est disponible dans le dossier de travail `recherche-marche/` à côté du dépôt : rapport complet, synthèse, benchmark et journal des sources datés du 1er novembre 2026. Sa présence a été vérifiée ; ses relevés n’ont pas été actualisés pendant cette correction d’interface et les décisions utilisateur ultérieures priment sur ses recommandations.
