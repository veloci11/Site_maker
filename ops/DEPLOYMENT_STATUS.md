# Déploiement de studio — gilmathis.com

Dernière livraison applicative : 03/11/2026 à 16:54, heure de Mexico (UTC−06), contrôlée dans l’IAB public sur ordinateur et mobile.

## Version active

- URL publique : https://gilmathis.com/
- Révision applicative : `099c1a131eef6129e67a979587871eda501a1b1f`, poussée sur `veloci11/Site_maker` / `main`.
- Release : `/home/mathis/site-maker/releases/20261103T225415Z-099c1a131eef` ; lien `current` basculé atomiquement.
- Empreinte client publique : `index-DZiCU2sY.js`, identique au build prévu.
- Archive vérifiée avant extraction : SHA-256 `ee0d149314a5301e6b6d81a9ea2b0ec05f6bfa63b7a28c3cf3a2900d1e6121b2`.
- Version précédente disponible : `releases/20261103T213957Z-770a271379ef`. Releases et sauvegardes précédentes conservées.

Le dépôt peut contenir un compte rendu plus récent ; la révision ci-dessus est le code applicatif effectivement en ligne. Les lots précédents ont été terminés et contrôlés avant les suivants. Le suivi est dans `docs/SUIVI_DEMANDES.md`.

## Interface livrée

Quatre forfaits de création : Vitrine, Connecté, Immersif 3D et Sur mesure. Évolution et Refonte concernent un site existant et conduisent à deux fiches sur devis, avec la même grande carte à gauche et leur formulaire contextualisé à droite. Le sujet est fixé par la fiche, sans sélecteur redondant. Ces deux cartes utilisent maintenant le même composant `PricingCard`, les mêmes dimensions, la même matière, trois points et le même CTA que les quatre créations. Elles sont centrées en colonnes 2 et 3 sur grand écran, puis partagent les règles tablette/mobile. Les quatre identifiants techniques de création restent inchangés.

- Navigation : menu Forfaits avec six entrées, FAQ à droite avant le contact noir. Le déclencheur Forfaits reste neutre ; la texture apparaît sur chaque offre du sous-menu au survol ou au focus. Liste dépliable sur mobile, fermeture après navigation. Liens actifs noirs et soulignés dans le burger ; Forfaits utilise un soulignement noir renforcé au focus clavier, sans contour violet.
- Cartes : matière et effets approuvés des quatre créations conservés ; deux nouvelles variantes pour les services. Boutons noirs au repos, texture au survol/focus partagée avec le comparatif ; Configurer sans flèche. Flèches diagonales retirées du public.
- Dernière clarification de Mathis : nos images restent exactement les mêmes. Reflet, liseré et halo retirés. Les couleurs apparaissent en 300 ms et le texte en 150 ms ; un grain indépendant précalculé (WebP 256 × 256, 107 058 octets, overlay 0,32) se déplace de quelques pixels pendant 360 ms à l’entrée du survol/focus, une seule fois, puis s’immobilise. Carte et image fixes, pas de filtre animé ni de bruit calculé à l’interaction. CTA et menu conservent 120 ms.
- Comparatif : « Afficher plus de détails » sous le tableau, puis « Masquer les détails », chevron et dépliage CSS de 280 ms ; aucune case à cocher. Tableau sémantique unique et réduction du mouvement respectée.
- Configuration : grande carte à gauche, options à droite, inclusions expliquées par forfait, coordonnées et demande au studio. Accordéon simple refermable : une rubrique ouverte à la fois, résumés des choix actifs dans les rubriques fermées, inclusions signalées et compteurs cohérents. Les six offres partagent la grande carte `SelectedPlanCard` et leurs styles dans `src/components/layout/project.css`. « Changer » est un menu translucide de 210 px attaché au bouton, avec six choix et coche sur le choix courant ; couleurs au survol/clavier, aucun dialogue ni contour de focus extérieur. Le doublon Continuer est retiré de la carte ; une action explicite reste après les options. Totaux ponctuels et mensuels séparés. Vitrine commence sur ordinateur, mobile facultatif ; Connecté comprend les comptes visiteurs et les contenus modifiables.
- Galerie : dix références externes avec filtres et crédits. Le bloc d’introduction est retiré, le H1 accessible conservé. Filtrage strict par offre sans saut de scroll : Lactel en Vitrine, GeoBoss en Connecté, Julie Thiam en Sur mesure ; Cal.com ajouté comme exemple avec connexion vérifiée. La remarque de l’ami sur les aplats est annulée. Un seul badge par site, avec la matière et la variante de sa carte forfait ; les filtres de catégorie restent blancs au repos et révèlent la matière au survol réel, au focus clavier ou à la sélection, avec fondu de 300 ms. Le filtre actif porte un contour. Les badges secondaires sont retirés ; Projet archivé reste dans la description. GeoBoss, Aéma Groupe, Satellite Story et Atlante 3D ajoutés depuis le portfolio de Raphaël. Trois aperçus capturés sur les vrais sites dans l’IAB ; Atlante reprend le poster original et porte la mention « Projet archivé » dans sa description, avec lien vers le README de l’auteur. DOMTEKNIKA, Lactel, Julie Thiam, Tiny Heaven et Addiction Agency conservés. Image, titre et action ouvrent directement la destination dans un nouvel onglet ; anciennes fiches redirigées directement, aperçu en sous-fenêtre supprimé. Aucune scène externe chargée automatiquement.
- FAQ : dix questions concrètes. Les huit premières couvrent frais, contenus, autonomie, domaine, mobile, site existant, calendrier et référencement, avec provenance Reddit qualitative documentée. Deux questions supplémentaires demandées directement par Mathis rassurent sur le choix du forfait et la réorientation par nos développeurs avant démarrage ; ajoutées en fin de liste, elles préservent les trois questions de l’accueil. Aucun prix, avis client, rabais ou délai chiffré inventé.

Catalogue et JSX indentés ; textes partagés dans `shared/catalog.ts` et `src/content/`, guide manuel `docs/MODIFIER_LE_SITE.md`. Primitives shadcn/Radix, Geist et Lucide conservés ; Sharp ajouté côté serveur pour le décodage réel des images ; aucun décodeur natif dans le client. Les dernières vérifications navigateur utilisent exclusivement le navigateur intégré demandé par Mathis.

## Dernier lot — galerie, parcours et SEO

Application `099c1a1` : cinq filtres testés en public avec scroll conservé, dix sites, un badge chacun et quarante liens externes target blank. Mobile 390 × 844 CSS sans débordement. Garde de sortie Contact réellement vérifié en production avec saisie fictive, conservée par Rester puis abandonnée explicitement ; aucun envoi. Contrôles locaux plus larges sur Vitrine, Retour, Changer et écran bas. Primitives, images et effet approuvés inchangés.

TypeScript, build et 202 tests passent. Après publication, robots texte, sitemap XML de douze URL, head FAQ/canonical, noindex privé, 301 et 404 vérifiés par HTTPS. Empreinte client SHA-256 `e5935505beb738db90db2506195c7329874126f630278abeaf724807833fd20a`, identique au build. Observations IAB initiales : CLS environ 0,00007 cache navigateur ignoré, 0 cache actif sur accueil/galerie/Vitrine ; LCP respectivement 616/608/820 ms sans cache et 592/568/584 ms avec cache. Un échantillon par condition, pas de mesure terrain ni d’INP. Formulaire absent du chargement accueil/galerie. Corps React toujours côté client.

Sauvegarde, décodeur PNG Sharp et santé vérifiés avant/après bascule ; autres projets/services/PID inchangés, GP Park HTTP 200. Informations légales et destinataire Resend restent à renseigner ultérieurement. Preuves et revue finale : `docs/qa/gallery-review/final-review.md`, avec captures natives ordinateur/mobile. Localhost arrêté (4173/4174 libres), onglets temporaires fermés, galerie publique conservée.

## Lot précédent — briefs V2 et images privées

- Recherche préalable et quinze spécialistes : `docs/BRIEF_RECHERCHE.md` et `docs/qa/brief-v2/team-review.md`. Questions, coordonnées et compatibilité des options centralisées dans trois modules partagés, formulaire unique et guide manuel mis à jour.
- Quatre coordonnées obligatoires, sept contextes comprenant le contact général. Six parcours locaux revus ; questions conditionnelles, résumés et retour aux options sans perdre le brief ni les images.
- Options publiques 12/12/12/10 ; inclusions expliquées, sans cases facturables répétées. Catalogue de 26 options et instantanés historiques conservés.
- Images privées BLOB SQLite, six au maximum, 5 Mio chacune, 20 Mio au total. Décodage effectif, limites de pixels/concurrence et quota cumulé 512 Mio par défaut ; configuration facultative `INQUIRY_UPLOAD_STORAGE_LIMIT_BYTES`. Sauvegarde/restauration des BLOB et anciens fichiers testée.
- TypeScript, build et 192 tests passent. Après la dernière modification de libellé, reconstruction finale sans changement de schéma. Aucun marqueur d’asset Vite non résolu dans le build produit. Matières approuvées identiques par SHA-256.
- Ubuntu : sauvegarde avant bascule, `npm ci --omit=dev --ignore-scripts`, import Sharp et décodage PNG vérifiés avant activation. Santé, quatre offres, 26 définitions, prix inchangés et autres projets/PID inchangés ; GP Park HTTP 200.
- HTTPS : client principal SHA-256 `f44e4664f5e24094c1e78faec7da34a714553891c9c353dcacefa939a79c3a8e`, identique au build. Refonte et Vitrine contrôlés dans l’IAB ; branches plateforme/SEO et références, quatre champs requis et une seule rubrique ouverte confirmés. Mobile 390 × 844 : largeur 390, zéro contrôle hors largeur. Aucune erreur applicative observée.
- Aucun formulaire soumis ni image téléversée en production. Parcours complet testé uniquement dans une base locale isolée avec des coordonnées fictives ; notification indisponible et zéro tentative. `INQUIRY_TO` reste à fournir plus tard par Mathis.
- Preuves : `docs/qa/brief-v2/`, dont `public-refonte-desktop.png`, `public-refonte-mobile.png`, `public-refonte-technical.txt`, `public-vitrine.txt` et `public-https.json`. Localhost arrêté, onglets temporaires fermés et onglet public actualisé conservé.

## Vérifications du lot précédent — cartes partagées et menu translucide

- TypeScript, build et 113 tests passent après les modifications finales. La carte et les styles sont réellement partagés ; aucune image source ni règle de prix modifiée.
- Refonte et Évolution : carte à gauche, un seul H1, prix Sur devis, formulaire à droite avec URL facultative et message propres au service. Sujet fixé dans le JSON de la demande, sans sélecteur redondant ; logique d’envoi existante conservée. Contact général et son choix de sujet contrôlés localement. Aucun formulaire envoyé.
- Cartes desktop : largeur 568,3 px et hauteur 530 px dans le viewport contrôlé, identiques entre les services et les créations. Les quatre créations et les services ont été parcourus dans l’IAB ; options compatibles conservées.
- Menu Changer : six choix, coche des services aussi, fond rgba(22,20,26,.64) et flou statique 12 px ; largeur 210 px, contenu/client 208/208 après correction des marges du séparateur. Texture au survol confirmée à opacité 1 ; contour du menu et du déclencheur absent. Focus clavier souligné, Échap conservé.
- Options : zéro bouton Continuer et zéro bouton d’action dans la carte à cette étape. Ajouter mes coordonnées ouvre bien la seconde étape ; retour aux options avec choix conservés. Sur mobile, seule l’action Mes coordonnées de la barre fixe est visible.
- Mobile public 390 × 844 CSS : document/client 390/390, carte de 350 px au-dessus du formulaire, menu de 210 px dans la largeur disponible. Émulation retirée, aucune alerte applicative observée.
- Santé et empreinte HTTPS identiques au build. Origine Ubuntu : sauvegarde avant bascule, quatre forfaits de création, 26 options et prix inchangés, autres projets/PID inchangés, GP Park HTTP 200.
- Preuves : `docs/qa/shared-project-cards/`, dont `public-refonte-glass.png`, `public-refonte-glass.json`, `public-evolution.json`, `public-actions-mobile.json` et `public-https.json`. Localhost fermé, ports 4173/4174 libres ; onglet de contrôle temporaire fermé, onglet public Refonte conservé.

## Vérifications des lots précédents — filtres, navigation et menu Changer

- TypeScript, build et 113 tests passent après les dernières modifications ; diff sans erreur d’espacement.
- Filtres : blancs au repos, texture révélée au survol/focus et maintenue sur la sélection ; retour au blanc après désélection. Un seul badge texturé par site conservé.
- Menu mobile : tous les liens ordinaires noirs, page courante soulignée ; contact noir à texte blanc. Accordéon du configurateur recontrôlé : une seule rubrique ouverte et choix visibles dans les rubriques fermées.
- Changer : six choix, coche sur la création courante, séparateur avant Évolution/Refonte. Menu de 224 px, positionné 6 px sous le bouton sur ordinateur ; zéro dialogue central. Les six destinations et la conservation des options compatibles passent localement ; Refonte et Évolution sont également vérifiées en production avec leur sujet correspondant. Aucun formulaire envoyé.
- Focus Forfaits : aucun contour violet après sélection ; soulignement noir de 2 px au clavier, ouverture par flèche bas et fermeture par Échap conservées. Les autres contrôles gardent leur règle de focus.
- Mobile public 390 × 844 CSS : six entrées dans le menu Changer, document/client 390/390, aucun débordement, zéro dialogue. Émulation temporaire retirée ; aucune alerte applicative observée.
- Santé HTTPS et client identiques au build par SHA-256. Origine Ubuntu : sauvegarde avant bascule, quatre forfaits de création, 26 options et prix inchangés, autres projets/PID inchangés, GP Park HTTP 200.
- Preuves : `docs/qa/filter-hover-mobile-menu/` et `docs/qa/inline-plan-chooser/`, notamment `public-menu.png`, `public-menu.json`, `public-refonte.json`, `public-evolution.json`, `public-header-focus.json`, `public-mobile.json` et `public-https.json`. Localhost arrêté, ports 4173/4174 libres ; seul l’onglet public est conservé.

## Vérifications du lot précédent — couleurs de la galerie

- TypeScript, build et 113 tests passent ; diff sans erreurs d’espacement.
- IAB public : neuf sites et neuf badges, variantes et texture des cartes partagées avec les badges et filtres. Les cinq filtres donnent 9/2/1/5/2 références ; aucun double badge, contour de sélection visible. Archive signalée dans le texte, 36 liens externes conservés.
- Formats desktop et mobile vérifiés. À 390 × 844 CSS, document/client 377/377 : pas de débordement. Aucune alerte applicative observée, viewport temporaire réinitialisé, onglet public conservé.
- HTTPS : santé et empreinte du client conformes au build. Origine Ubuntu : sauvegarde avant bascule, quatre forfaits, 26 options et prix inchangés, autres services/PID inchangés, GP Park HTTP 200.
- Preuves : `docs/qa/gallery-plan-colors/public-gallery.json`, `public-filters.json`, `public-mobile.json`, `public-https.json` et `public-final.png`. Aucun formulaire envoyé. Localhost fermé : ports 4173/4174 libres.

## Vérifications du lot précédent — accordéon et galerie

- TypeScript, build et 113 tests passent ; `git diff --check` propre.
- Accordéon exclusif, fermeture au clavier, réouverture avec choix conservés, retrait d’un choix et inclusions contrôlés dans l’IAB.
- Galerie : neuf références, 36 liens `target="_blank"` et `rel="noopener noreferrer"`, clic DOMTEKNIKA conservant la galerie et ouvrant un onglet distinct ; `window.opener === null` confirmé par CDP. Badges pastel avec contraste minimum 5,86:1.
- Contrôles publics desktop et mobile à 390 px CSS : aucune largeur excédentaire ; aucune erreur/alerte applicative observée. Ancien brouillon public rétabli ; aucun formulaire soumis.
- HTTPS : santé valide et client identique au build par SHA-256. Origine : quatre forfaits, 26 options, prix inchangés, paiements désactivés. Sauvegarde avant bascule, autres projets/PID inchangés et GP Park 200.
- Preuves : `docs/qa/accordion-gallery/`, dont `public-https.json`, `public-accordion.json`, `public-mobile-accordion.json`, `public-gallery.json`, `public-new-tab.json` et `public-gallery-final.png`. Localhost fermé et viewport temporaire réinitialisé.

## Vérifications du lot précédent — grain

- `npm run check` final : TypeScript, build et **113 tests passants**. `git diff --check` propre. Revue indépendante par lecture sans blocage.
- Origine Ubuntu : santé valide, quatre créations, **26 options**, bases de prix nulles et paiements désactivés. Sauvegarde privée avant bascule, autres projets/PID inchangés et GP Park HTTP 200.
- HTTPS : santé et empreinte client conformes. SHA-256 des trois textures colorées et du nouveau grain identiques aux fichiers locaux. Les trois textures colorées ont aussi été comparées octet pour octet à Git : aucune image d’origine changée.
- IAB public : neuf échantillons d’entrée, de 1 à 457 ms ; le grain change brièvement de position puis revient à transform:none, image révélée à opacité 1 en environ 300 ms. Carte toujours transform:none, zéro animation après stabilisation. Aucune ombre/lueur extérieure ni reflet diagonal.
- Contrôles locaux : pas de redémarrage entre les enfants de la carte ; sortie masquant le grain, réentrée rejouant une seule fois ; focus 3 px et réduction du mouvement (grain visible, immobile) respectés. Clic mobile vers le configurateur réel, dix FAQ conservées.
- Mobile public 390 × 844 CSS : document/client 375/375, six cartes et grain à opacité 0 au repos. Aucune erreur ni alerte applicative observée. Viewport et émulation temporaires réinitialisés.
- Preuves : `design-qa.md`, `docs/qa/grain-entry/public-timeline.json`, `public-retina.png`, `mobile-public.json`, `mobile-public.jpg`, `original-images.json` et `grain-asset.json`.
- Aucun formulaire soumis ni e-mail réel envoyé. Localhost arrêté : ports **4173/4174** libres ; seul l’onglet public conservé dans l’IAB.

## Isolement et sauvegardes

Application, runtime Node, tunnel, données et sauvegardes restent dédiés à `/home/mathis/site-maker/`. L’application écoute uniquement `127.0.0.1:3020`. Les services propres sont `site-maker.service`, `site-maker-tunnel.service` et `site-maker-backup.timer`, tous actifs. Le compte Unix reste partagé : séparation opérationnelle, pas une frontière de sécurité entre comptes système.

Une sauvegarde privée a précédé la bascule. Les données et secrets de `shared/` ne sont inclus ni dans Git ni dans les archives. États et PID de `gp-park.service`, `encar-dashboard.service` et `cloudflared-dashboard.service` identiques avant/après ; GP Park répond 200. Aucun de ces services n’a été redémarré.

## Grande carte et éléments reportés

Le master `grain-plasma-master.webp` reste l’export sans perte de la source originale 1536 × 1024, sans flou ni grain de remplacement. La source légère reste dessous et sert seule à DPR 1. Aucun changement du master ni de son recadrage pendant ce lot ; provenance dans `docs/ASSETS_REFERENCES.md`.

La configuration Resend existante est conservée : domaine d’envoi et expéditeur dédiés installés, destinataire **INQUIRY_TO reporté explicitement par Mathis**. Les demandes sont persistées, mais une réception réelle reste à vérifier après fourniture de l’adresse. Ne pas redemander cette adresse pendant les corrections visuelles.

Les prix et périmètres commerciaux précis, l’identité et les documents commerciaux définitifs restent à arrêter. Les pages provisoires ne sont pas validées par cette livraison d’interface. Aucun paiement n’est demandé à l’envoi d’une demande. Détails opérateur : `docs/EMAIL_REQUESTS.md`, `docs/RESEND_DNS.md` et `docs/AUDIT_SITE_2026-11-02.md`.
