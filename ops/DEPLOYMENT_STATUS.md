# Déploiement de studio — gilmathis.com

Dernière livraison applicative : 03/11/2026 à 00:43, heure de Mexico (UTC−06), contrôlée dans l’IAB public sur ordinateur et mobile.

## Version active

- URL publique : https://gilmathis.com/
- Révision applicative : `2c9ba4612055e752926c4a7320dc9d3bef37bd17`, poussée sur `veloci11/Site_maker` / `main`.
- Release : `/home/mathis/site-maker/releases/20261103T064320Z-2c9ba4612055` ; lien `current` basculé atomiquement.
- Empreinte client publique : `index-DHpQH5oY.js`, identique au build prévu.
- Archive vérifiée avant extraction : SHA-256 `90cb19bbe5b858765fa7fb73527430599520437fe94a10ccec69ff523ebf5c8e`.
- Version précédente disponible : `releases/20261103T055310Z-8c497b4c5019`. Releases et sauvegardes précédentes conservées.

Le dépôt peut contenir un compte rendu plus récent ; la révision ci-dessus est le code applicatif effectivement en ligne. Les lots précédents ont été terminés et contrôlés avant les suivants. Le suivi est dans `docs/SUIVI_DEMANDES.md`.

## Interface livrée

Quatre forfaits de création : Vitrine, Connecté, Immersif 3D et Sur mesure. Évolution et Refonte concernent un site existant et conduisent à deux demandes contextualisées sur devis. Ces deux cartes utilisent maintenant le même composant `PricingCard`, les mêmes dimensions, la même matière, trois points et le même CTA que les quatre créations. Elles sont centrées en colonnes 2 et 3 sur grand écran, puis partagent les règles tablette/mobile. Les quatre identifiants techniques de création restent inchangés.

- Navigation : menu Forfaits avec six entrées, FAQ à droite avant le contact noir. Le déclencheur Forfaits reste neutre ; la texture apparaît sur chaque offre du sous-menu au survol ou au focus. Liste dépliable sur mobile, fermeture après navigation.
- Cartes : matière et effets approuvés des quatre créations conservés ; deux nouvelles variantes pour les services. Boutons noirs au repos, texture au survol/focus partagée avec le comparatif ; Configurer sans flèche. Flèches diagonales retirées du public.
- Dernière correction des cartes : halo extérieur et lumière mobile supprimés, y compris le span et leurs styles. Source et cadrage conservés ; reflet diagonal fixe et liseré intérieur pour le brillant, saturation 1,04 / luminosité 0,94. Carte sans transformation, simple fondu de couleur de 120 ms. Aucun effet lumineux derrière les cartes.
- Comparatif : « Afficher plus de détails » sous le tableau, puis « Masquer les détails », chevron et dépliage CSS de 280 ms ; aucune case à cocher. Tableau sémantique unique et réduction du mouvement respectée.
- Configuration : grande carte à gauche, options à droite, inclusions expliquées par forfait, coordonnées et demande au studio. Totaux ponctuels et mensuels séparés. Vitrine commence sur ordinateur, mobile facultatif ; Connecté comprend les comptes visiteurs et les contenus modifiables.
- Galerie : neuf références avec filtres et crédits. GeoBoss, Aéma Groupe, Satellite Story et Atlante 3D ajoutés depuis le portfolio de Raphaël. Trois aperçus capturés sur les vrais sites dans l’IAB ; Atlante reprend le poster original et porte le badge « Projet archivé », avec lien vers le README de l’auteur. DOMTEKNIKA, Lactel, Julie Thiam, Tiny Heaven et Addiction Agency conservés. Image, titre et action ouvrent directement la destination dans le même onglet ; anciennes fiches redirigées directement, aperçu en sous-fenêtre supprimé. Aucune scène externe chargée automatiquement.
- FAQ : dix questions concrètes. Les huit premières couvrent frais, contenus, autonomie, domaine, mobile, site existant, calendrier et référencement, avec provenance Reddit qualitative documentée. Deux questions supplémentaires demandées directement par Mathis rassurent sur le choix du forfait et la réorientation par nos développeurs avant démarrage ; ajoutées en fin de liste, elles préservent les trois questions de l’accueil. Aucun prix, avis client, rabais ou délai chiffré inventé.

Catalogue et JSX indentés ; textes partagés dans `shared/catalog.ts` et `src/content/`, guide manuel `docs/MODIFIER_LE_SITE.md`. Primitives shadcn/Radix, Geist et Lucide conservés ; aucune nouvelle dépendance de production. Les dernières vérifications navigateur utilisent exclusivement le navigateur intégré demandé par Mathis.

## Vérifications de cette livraison

- `npm run check` final après le CSS et le JSX définitifs : TypeScript, build et **113 tests passants**. `git diff --check` propre.
- Santé Ubuntu valide, quatre créations, **26 options**, bases de prix nulles et paiements désactivés. Sauvegarde privée avant bascule, autres projets inchangés.
- HTTPS public : santé et empreinte client identiques au build attendu.
- IAB public au survol Connecté : pseudo-élément extérieur absent (`content:none`), aucune ombre extérieure, zéro span de glow, transformation de carte `none`, texture visible à opacité 1. Reflet fixe inspecté sur la capture native PNG `public-retina.png`.
- Mobile public 390 × 844 CSS : document/client 375/375, six cartes et zéro glow. Focus clavier 3 px vérifié localement ; dix FAQ conservées, dont les deux réponses d’aide au choix. Aucune FAQ ni référence modifiée dans ce lot.
- Aucune erreur ni alerte applicative observée. Viewport temporaire réinitialisé, onglet de recherche fermé. Aucun formulaire soumis ni e-mail réel envoyé.
- Nouveau contrôle ElevenLabs après le correctif : couleurs Free dans un PNG 786 × 600 ouvert directement ; texture de bruit séparée AVIF/PNG superposée en overlay, fond de grain 128 px CSS dans ce contexte ; fondu d’opacité de 300 ms, aucune transformation. Source et relevé dans `docs/EFFET_CARTES_ELEVENLABS.md` et `docs/qa/cards-without-halo/elevenlabs-recheck.json`.
- Rapport et captures : `design-qa.md`, `docs/qa/cards-without-halo/public-retina.png`, `public-hover.json`, `mobile-public.jpg`. Les rapports de halo antérieurs sont historiques et leur effet est explicitement rejeté.
- Localhost arrêté : aucun processus à l’écoute sur **4173 ou 4174** après contrôle. Seul l’onglet public est conservé dans l’IAB.

## Isolement et sauvegardes

Application, runtime Node, tunnel, données et sauvegardes restent dédiés à `/home/mathis/site-maker/`. L’application écoute uniquement `127.0.0.1:3020`. Les services propres sont `site-maker.service`, `site-maker-tunnel.service` et `site-maker-backup.timer`, tous actifs. Le compte Unix reste partagé : séparation opérationnelle, pas une frontière de sécurité entre comptes système.

Une sauvegarde privée a précédé la bascule. Les données et secrets de `shared/` ne sont inclus ni dans Git ni dans les archives. États et PID de `gp-park.service`, `encar-dashboard.service` et `cloudflared-dashboard.service` identiques avant/après ; GP Park répond 200. Aucun de ces services n’a été redémarré.

## Grande carte et éléments reportés

Le master `grain-plasma-master.webp` reste l’export sans perte de la source originale 1536 × 1024, sans flou ni grain de remplacement. La source légère reste dessous et sert seule à DPR 1. Aucun changement du master ni de son recadrage pendant ce lot ; provenance dans `docs/ASSETS_REFERENCES.md`.

La configuration Resend existante est conservée : domaine d’envoi et expéditeur dédiés installés, destinataire **INQUIRY_TO reporté explicitement par Mathis**. Les demandes sont persistées, mais une réception réelle reste à vérifier après fourniture de l’adresse. Ne pas redemander cette adresse pendant les corrections visuelles.

Les prix et périmètres commerciaux précis, l’identité et les documents commerciaux définitifs restent à arrêter. Les pages provisoires ne sont pas validées par cette livraison d’interface. Aucun paiement n’est demandé à l’envoi d’une demande. Détails opérateur : `docs/EMAIL_REQUESTS.md`, `docs/RESEND_DNS.md` et `docs/AUDIT_SITE_2026-11-02.md`.
