# Déploiement de studio — gilmathis.com

Dernière livraison applicative : 03/11/2026 à 10:41, heure de Mexico (UTC−06), contrôlée dans l’IAB public sur ordinateur et mobile.

## Version active

- URL publique : https://gilmathis.com/
- Révision applicative : `0aeb90d5a7a81d2b447fdf37ccd3f5d196b7b28d`, poussée sur `veloci11/Site_maker` / `main`.
- Release : `/home/mathis/site-maker/releases/20261103T164107Z-0aeb90d5a7a8` ; lien `current` basculé atomiquement.
- Empreinte client publique : `index-Bdlv6znL.js`, identique au build prévu.
- Archive vérifiée avant extraction : SHA-256 `b4516ec892836535438192cc7863a1f6fa7c70891b12fef2604e678c560f9e95`.
- Version précédente disponible : `releases/20261103T163209Z-3e740d63a275`. Releases et sauvegardes précédentes conservées.

Le dépôt peut contenir un compte rendu plus récent ; la révision ci-dessus est le code applicatif effectivement en ligne. Les lots précédents ont été terminés et contrôlés avant les suivants. Le suivi est dans `docs/SUIVI_DEMANDES.md`.

## Interface livrée

Quatre forfaits de création : Vitrine, Connecté, Immersif 3D et Sur mesure. Évolution et Refonte concernent un site existant et conduisent à deux demandes contextualisées sur devis. Ces deux cartes utilisent maintenant le même composant `PricingCard`, les mêmes dimensions, la même matière, trois points et le même CTA que les quatre créations. Elles sont centrées en colonnes 2 et 3 sur grand écran, puis partagent les règles tablette/mobile. Les quatre identifiants techniques de création restent inchangés.

- Navigation : menu Forfaits avec six entrées, FAQ à droite avant le contact noir. Le déclencheur Forfaits reste neutre ; la texture apparaît sur chaque offre du sous-menu au survol ou au focus. Liste dépliable sur mobile, fermeture après navigation.
- Cartes : matière et effets approuvés des quatre créations conservés ; deux nouvelles variantes pour les services. Boutons noirs au repos, texture au survol/focus partagée avec le comparatif ; Configurer sans flèche. Flèches diagonales retirées du public.
- Dernière clarification de Mathis : nos images restent exactement les mêmes. Reflet, liseré et halo retirés. Les couleurs apparaissent en 300 ms et le texte en 150 ms ; un grain indépendant précalculé (WebP 256 × 256, 107 058 octets, overlay 0,32) se déplace de quelques pixels pendant 360 ms à l’entrée du survol/focus, une seule fois, puis s’immobilise. Carte et image fixes, pas de filtre animé ni de bruit calculé à l’interaction. CTA et menu conservent 120 ms.
- Comparatif : « Afficher plus de détails » sous le tableau, puis « Masquer les détails », chevron et dépliage CSS de 280 ms ; aucune case à cocher. Tableau sémantique unique et réduction du mouvement respectée.
- Configuration : grande carte à gauche, options à droite, inclusions expliquées par forfait, coordonnées et demande au studio. Accordéon simple refermable : une rubrique ouverte à la fois, résumés des choix actifs dans les rubriques fermées, inclusions signalées et compteurs cohérents. Totaux ponctuels et mensuels séparés. Vitrine commence sur ordinateur, mobile facultatif ; Connecté comprend les comptes visiteurs et les contenus modifiables.
- Galerie : neuf références avec filtres et crédits. Un seul badge par site, avec la matière et la variante de sa carte forfait ; les filtres de catégorie reprennent cette matière et le filtre actif porte un contour. Les badges secondaires sont retirés ; Projet archivé reste dans la description. GeoBoss, Aéma Groupe, Satellite Story et Atlante 3D ajoutés depuis le portfolio de Raphaël. Trois aperçus capturés sur les vrais sites dans l’IAB ; Atlante reprend le poster original et porte le badge « Projet archivé », avec lien vers le README de l’auteur. DOMTEKNIKA, Lactel, Julie Thiam, Tiny Heaven et Addiction Agency conservés. Image, titre et action ouvrent directement la destination dans un nouvel onglet ; anciennes fiches redirigées directement, aperçu en sous-fenêtre supprimé. Aucune scène externe chargée automatiquement.
- FAQ : dix questions concrètes. Les huit premières couvrent frais, contenus, autonomie, domaine, mobile, site existant, calendrier et référencement, avec provenance Reddit qualitative documentée. Deux questions supplémentaires demandées directement par Mathis rassurent sur le choix du forfait et la réorientation par nos développeurs avant démarrage ; ajoutées en fin de liste, elles préservent les trois questions de l’accueil. Aucun prix, avis client, rabais ou délai chiffré inventé.

Catalogue et JSX indentés ; textes partagés dans `shared/catalog.ts` et `src/content/`, guide manuel `docs/MODIFIER_LE_SITE.md`. Primitives shadcn/Radix, Geist et Lucide conservés ; aucune nouvelle dépendance de production. Les dernières vérifications navigateur utilisent exclusivement le navigateur intégré demandé par Mathis.

## Vérifications du lot couleurs de la galerie

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
