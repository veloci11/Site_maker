# Suivi des demandes

Version actuelle vérifiée : `7c5550c` sur https://gilmathis.com/. Les anciens lots ci-dessous constituent l’historique ; les dernières décisions priment.

Traiter les demandes dans l’ordre : terminer le lot en cours, le vérifier, puis prendre le suivant. Une nouvelle instruction rejoint la file ; elle ne remplace pas silencieusement le travail déjà commencé. Les dernières décisions explicites remplacent les anciennes demandes contradictoires.

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

Référence Free étudiée en parallèle ; léger effet lumineux original ajouté ensuite au haut des cartes, avec la matière approuvée conservée. Opacité et petit déplacement de 550 ms, sans boucle ni suivi de souris. Mouvement réel mesuré, zéro animation au repos ; au clavier avec réduction du mouvement : halo visible et zéro animation. TypeScript, build et 113 tests de la version finale passent. Publication finale contrôlée : révision `7c5550c`, release `20261103T040155Z-7c5550c67402`, client `index-DGJoTYdQ.js`. Les contrôles locaux ont été complétés par les parcours publics desktop/mobile. Aucune demande d’interface de la file ne reste ouverte ; les éléments commerciaux reportés ci-dessous restent distincts.

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
