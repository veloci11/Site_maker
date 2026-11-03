# Suivi des demandes

Version actuelle vérifiée : `34aa797` sur https://gilmathis.com/. Les anciens lots ci-dessous constituent l’historique ; les dernières décisions priment.

Traiter les demandes dans l’ordre : terminer le lot en cours, le vérifier, puis prendre le suivant. Une nouvelle instruction rejoint la file ; elle ne remplace pas silencieusement le travail déjà commencé. Les dernières décisions explicites remplacent les anciennes demandes contradictoires.

## Accordéon et galerie — vérifiés localement, publication en cours

Demande limitée aux interactions et badges : une seule rubrique d’options ouverte à la fois, refermable au clavier ; les rubriques fermées montrent les choix actifs, dont les inclusions identifiées. Le résumé est dérivé de la configuration existante, sans changement de prix ou de persistance. Une option retirée disparaît du résumé, les choix restent cochés à la réouverture.

La galerie conserve ses neuf références, images, filtres et crédits. Image, titre et action ouvrent un nouvel onglet (`target="_blank"`, `rel="noopener noreferrer"`), remplaçant explicitement la précédente consigne. Badges pastel distincts pour les quatre catégories, Contenus et Projet archivé. Contrôles IAB locaux : ouverture d’un onglet DOMTEKNIKA distinct, conservation de la galerie, résumés, inclusions, clavier et mobile. TypeScript, build et 113 tests passent. Preuves : `qa/accordion-gallery/`.

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
