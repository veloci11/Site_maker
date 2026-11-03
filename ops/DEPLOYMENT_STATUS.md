# Déploiement de studio — gilmathis.com

Dernière livraison applicative : 02/11/2026 à 22:55, heure de Mexico (UTC−06), contrôlée ensuite dans le navigateur public sur ordinateur et mobile.

## Version active

- URL publique : https://gilmathis.com/
- Révision applicative : `6133f1e47ab998d59b4b1ecd3682e45fc9ce8020`, poussée sur `veloci11/Site_maker` / `main`.
- Release : `/home/mathis/site-maker/releases/20261103T045550Z-6133f1e47ab9` ; lien `current` basculé atomiquement.
- Empreinte client publique : `index-uoRXqwKE.js`, identique au build prévu.
- Archive vérifiée avant extraction : SHA-256 `e5c136e394d00e02fe9780c2d87ec37fca19b7802470d00563d79ba6f2e33348`.
- Version précédente disponible : `releases/20261103T040155Z-7c5550c67402`. Releases et sauvegardes précédentes conservées.

Le dépôt peut contenir un compte rendu plus récent ; la révision ci-dessus est le code applicatif effectivement en ligne. Les lots précédents ont été terminés et contrôlés avant les suivants. Le suivi est dans `docs/SUIVI_DEMANDES.md`.

## Interface livrée

Quatre forfaits de création : Vitrine, Connecté, Immersif 3D et Sur mesure. Évolution et Refonte concernent un site existant et conduisent à deux demandes contextualisées sur devis. Ces deux cartes utilisent maintenant le même composant `PricingCard`, les mêmes dimensions, la même matière, trois points et le même CTA que les quatre créations. Elles sont centrées en colonnes 2 et 3 sur grand écran, puis partagent les règles tablette/mobile. Les quatre identifiants techniques de création restent inchangés.

- Navigation : menu Forfaits avec six entrées, FAQ à droite avant le contact noir. Le déclencheur Forfaits reste neutre ; la texture apparaît sur chaque offre du sous-menu au survol ou au focus. Liste dépliable sur mobile, fermeture après navigation.
- Cartes : matière et effets approuvés des quatre créations conservés ; deux nouvelles variantes pour les services. Boutons noirs au repos, texture au survol/focus partagée avec le comparatif ; Configurer sans flèche. Flèches diagonales retirées du public.
- Halo préexistant : opacité de 180 ms et petit déplacement de 550 ms à l’interaction, sans boucle ni suivi de souris. Recherche ElevenLabs documentée dans `docs/EFFET_CARTES_ELEVENLABS.md` ; aucune de leurs textures copiée, aucun changement du fondu de 120 ms de studio.
- Comparatif : « Afficher plus de détails » sous le tableau, puis « Masquer les détails », chevron et dépliage CSS de 280 ms ; aucune case à cocher. Tableau sémantique unique et réduction du mouvement respectée.
- Configuration : grande carte à gauche, options à droite, inclusions expliquées par forfait, coordonnées et demande au studio. Totaux ponctuels et mensuels séparés. Vitrine commence sur ordinateur, mobile facultatif ; Connecté comprend les comptes visiteurs et les contenus modifiables.
- Galerie : neuf références avec filtres et crédits. GeoBoss, Aéma Groupe, Satellite Story et Atlante 3D ajoutés depuis le portfolio de Raphaël. Trois aperçus capturés sur les vrais sites dans l’IAB ; Atlante reprend le poster original et porte le badge « Projet archivé », avec lien vers le README de l’auteur. DOMTEKNIKA, Lactel, Julie Thiam, Tiny Heaven et Addiction Agency conservés. Image, titre et action ouvrent directement la destination dans le même onglet ; anciennes fiches redirigées directement, aperçu en sous-fenêtre supprimé. Aucune scène externe chargée automatiquement.
- FAQ : huit questions concrètes sur frais récurrents, contenus, autonomie, domaine, mobile, site existant, calendrier et référencement. Corpus qualitatif de dix discussions Reddit, liens et limites documentés. Aucune statistique de marché déduite de ces fils. Aucun prix, avis client, rabais ou délai chiffré inventé.

Catalogue et JSX indentés ; textes partagés dans `shared/catalog.ts` et `src/content/`, guide manuel `docs/MODIFIER_LE_SITE.md`. Primitives shadcn/Radix, Geist et Lucide conservés ; aucune nouvelle dépendance de production. Les dernières vérifications navigateur utilisent exclusivement le navigateur intégré demandé par Mathis.

## Vérifications de cette livraison

- `npm run check` final : TypeScript, build et **113 tests passants** après la dernière correction Atlante. `git diff --check` propre. Revue indépendante sans blocage.
- Origine Ubuntu : santé valide, quatre créations, **26 options**, bases de prix nulles, paiements désactivés.
- HTTPS public : santé et empreinte client exactes ; les quatre nouveaux WebP ont un SHA-256 identique à leur export local prévu.
- Navigateur public desktop : six cartes de 285,75 × 407,25 CSS ; Évolution et Refonte centrées aux mêmes colonnes que Connecté et Immersif. Matière de Refonte observée au survol et capture Retina native enregistrée.
- Sous-menu public : six liens, texture révélée sur Connecté, texte blanc, déclencheur neutre sans pseudo-image. Clavier, touche Fin, Échap et focus vérifiés localement. Contact noir et FAQ à droite conservés.
- Galerie publique : neuf références ; filtre 3D affichant cinq projets, dont GeoBoss ; badge et lien d’archive Atlante exacts. Filtre Vitrine avec deux exemples vérifié localement. Ancienne route Atlante arrivée directement sur le README dans le même onglet lors de l’essai local.
- FAQ publique : huit questions, première réponse ouverte et inspectée. À 390 × 844 CSS, largeur client/document 375/375 px, sans débordement.
- Menu public mobile : six offres et FAQ ; comparatif public mobile : `aria-expanded=true`, bouton Masquer les détails et zéro case à cocher. Les essais locaux couvrent aussi les contacts Évolution/Refonte, le centrage à 1024 px, le mobile et la réduction du mouvement.
- Aucune erreur ou alerte applicative observée dans la dernière visite publique. Viewport et émulation de mouvement temporaires réinitialisés.
- Rapport : `design-qa.md`. Captures : `docs/qa/card-alignment-faq-portfolio/services-public-retina.png`, `menu-public-retina.png`, `cards-public.jpg`, `faq-public.jpg`, `faq-mobile-public.jpg`, `menu-mobile-public.jpg`, `details-mobile-public.jpg`.
- Aucun formulaire soumis ni e-mail réel de test envoyé pendant ce lot.
- Localhost arrêté : aucun processus à l’écoute sur **4173 ou 4174** après contrôle. Onglet temporaire fermé ; seul l’onglet public est conservé dans l’IAB.

## Isolement et sauvegardes

Application, runtime Node, tunnel, données et sauvegardes restent dédiés à `/home/mathis/site-maker/`. L’application écoute uniquement `127.0.0.1:3020`. Les services propres sont `site-maker.service`, `site-maker-tunnel.service` et `site-maker-backup.timer`, tous actifs. Le compte Unix reste partagé : séparation opérationnelle, pas une frontière de sécurité entre comptes système.

Une sauvegarde privée a précédé la bascule. Les données et secrets de `shared/` ne sont inclus ni dans Git ni dans les archives. États et PID de `gp-park.service`, `encar-dashboard.service` et `cloudflared-dashboard.service` identiques avant/après ; GP Park répond 200. Aucun de ces services n’a été redémarré.

## Grande carte et éléments reportés

Le master `grain-plasma-master.webp` reste l’export sans perte de la source originale 1536 × 1024, sans flou ni grain de remplacement. La source légère reste dessous et sert seule à DPR 1. Aucun changement du master ni de son recadrage pendant ce lot ; provenance dans `docs/ASSETS_REFERENCES.md`.

La configuration Resend existante est conservée : domaine d’envoi et expéditeur dédiés installés, destinataire **INQUIRY_TO reporté explicitement par Mathis**. Les demandes sont persistées, mais une réception réelle reste à vérifier après fourniture de l’adresse. Ne pas redemander cette adresse pendant les corrections visuelles.

Les prix et périmètres commerciaux précis, l’identité et les documents commerciaux définitifs restent à arrêter. Les pages provisoires ne sont pas validées par cette livraison d’interface. Aucun paiement n’est demandé à l’envoi d’une demande. Détails opérateur : `docs/EMAIL_REQUESTS.md`, `docs/RESEND_DNS.md` et `docs/AUDIT_SITE_2026-11-02.md`.
