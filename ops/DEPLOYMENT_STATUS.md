# Déploiement de studio — gilmathis.com

Dernière livraison : 2 novembre 2026 à 22:01, heure de Mexico (UTC−06), contrôlée ensuite dans le navigateur public sur ordinateur et mobile.

## Version active

- URL publique : https://gilmathis.com/
- Révision applicative : `7c5550c67402246a656c534a54d0954fbc2afd9a`, poussée sur `veloci11/Site_maker` / `main`.
- Release : `/home/mathis/site-maker/releases/20261103T040155Z-7c5550c67402` ; lien `current` basculé atomiquement.
- Empreinte client publique : `index-DGJoTYdQ.js`, identique au build prévu.
- Archive vérifiée avant extraction : SHA-256 `7c49eb1894f2c035b7d96431a46d7294c305721a5bf50b55dd6f3b5f776e591d`.
- Version précédente disponible : `20261103T033748Z-7d40317f1498`. Les releases antérieures et sauvegardes sont conservées.

Le dépôt peut contenir un compte rendu plus récent ; la révision ci-dessus est le code applicatif effectivement en ligne. Les lots précédents ont été terminés et contrôlés avant les suivants. Le suivi est dans `docs/SUIVI_DEMANDES.md`.

## Interface livrée

Quatre forfaits de création : Vitrine, Connecté, Immersif 3D et Sur mesure. Deux cartes supplémentaires distinctes, Évolution et Refonte, concernent un site existant et conduisent à deux demandes contextualisées sur devis. Les quatre identifiants techniques de création restent inchangés.

- Navigation : un menu Forfaits contenant les six entrées, FAQ à droite avant le contact noir. Liste dépliable sur mobile ; fermeture après navigation. Le déclencheur révèle une matière colorée au survol, au focus et à l’ouverture.
- Cartes : matière d’origine et inclusions conservées. Boutons noirs au repos, texture du forfait au survol/focus partagée avec le comparatif ; Configurer sans flèche. Flèches diagonales retirées du public.
- Léger halo original dans le haut des cartes de création : opacité et déplacement de 550 ms à l’interaction, sans boucle ni suivi de souris. Zéro animation observée au repos, préférence de réduction des animations respectée.
- Comparatif : bouton sous le tableau, chevron et dépliage CSS de 280 ms ; aucune case à cocher. Un seul tableau sémantique, lignes repliées de hauteur nulle et masquées aux lecteurs d’écran.
- Configuration : grande carte à gauche, options à droite, inclusions expliquées par forfait, coordonnées et demande au studio. Totaux ponctuels et mensuels séparés. Vitrine commence sur ordinateur, mobile facultatif ; Connecté comprend les comptes visiteurs et les contenus modifiables.
- Galerie : filtres et crédits, DOMTEKNIKA et Julie Thiam présents, Artisanat retiré. Image, nom et Voir le site ouvrent directement le vrai site dans le même onglet. Capture Addiction Agency remplacée par le vrai site, en 2560 × 1440 ; aucune scène externe chargée automatiquement.
- Textes : pas de mentions rejetées sur l’absence de compte ni de badges génériques. FAQ en six questions concrètes. Aucun prix, avis client, rabais ou délai chiffré inventé.

Le catalogue et les pages concernés sont indentés et les contenus partagés sont dans `shared/catalog.ts` et `src/content/`. Guide manuel : `docs/MODIFIER_LE_SITE.md`. Primitives shadcn/Radix, Geist et Lucide conservés ; aucune nouvelle dépendance de production.

## Vérifications

- `npm run check` final : TypeScript, build et **113 tests passants**. `git diff --check` passe. Revue indépendante du code sans blocage sur ce périmètre.
- Origine Ubuntu : santé valide, quatre créations et **26 options**, bases de prix nulles, paiements désactivés.
- HTTPS public : santé et empreinte client exactes. Le nouvel aperçu Addiction a également été contrôlé par digest pendant ces lots.
- Navigateur public : contact noir RGB 17/17/17, six entrées de menu, FAQ à droite, zéro flèche diagonale et zéro icône dans Configurer. Sujets Évolution et Refonte distincts et URL facultative observés sans soumission.
- Dix liens image/nom de galerie directement vers les cinq sites ; filtre 3D affichant Julie Thiam et Tiny Heaven. Clic réel DOMTEKNIKA et retour testés localement, dans le même onglet.
- Dépliage public : aria-expanded et hauteur de 420,5 px à l’ouverture, puis retour à 0. Mobile 390 × 844 CSS : client/document 375/375 px, bouton 335 × 52 px, menu six entrées et FAQ.
- Halo public : opacité 0,24 et petit déplacement observés, zéro animation au repos. Aucune erreur/alerte applicative dans les journaux de la visite publique finale.
- Rapport et captures : `design-qa.md`, `docs/qa/offers-menu-buttons/final-public-menu-retina.png`, `final-public-cards-retina.png`, `final-public-services-retina.png`, `final-public-mobile-menu.jpg` et `final-public-mobile-details.jpg`.
- Aucun formulaire soumis en production, aucun e-mail réel de test envoyé. Un essai local fictif avec transport e-mail désactivé a vérifié la conservation de l’URL, la limite de longueur et l’absence de doublon.
- Localhost et onglet de prévisualisation fermés ; aucun processus à l’écoute sur **4173 ou 4174** après contrôle. Seul l’onglet public est conservé dans l’IAB.

## Isolement et sauvegardes

Application, runtime Node, tunnel, données et sauvegardes restent dédiés à `/home/mathis/site-maker/`. L’application écoute uniquement `127.0.0.1:3020`. Les services propres sont `site-maker.service`, `site-maker-tunnel.service` et `site-maker-backup.timer`, tous actifs. Le compte Unix reste partagé : séparation opérationnelle, pas une frontière de sécurité entre comptes système.

Une sauvegarde privée a précédé chaque bascule. Les données et secrets de `shared/` ne sont inclus ni dans Git ni dans les archives. États et PID de `gp-park.service`, `encar-dashboard.service` et `cloudflared-dashboard.service` identiques avant/après ; GP Park répond 200. Aucun de ces services n’a été redémarré.

## Grande carte et éléments reportés

Le master `grain-plasma-master.webp` reste l’export sans perte de la source originale 1536 × 1024, sans flou ni grain de remplacement. La source légère reste dessous et sert seule à DPR 1. Aucun changement du master ni de son recadrage pendant ces lots ; provenance et mesures dans `docs/ASSETS_REFERENCES.md`.

La configuration Resend existante est conservée : domaine d’envoi et expéditeur dédiés installés, destinataire **INQUIRY_TO reporté explicitement par Mathis**. Les demandes sont persistées, mais une réception réelle reste à vérifier après fourniture de l’adresse. Ne pas redemander cette adresse pendant les corrections visuelles.

Les prix et périmètres commerciaux précis, l’identité et les documents commerciaux définitifs restent à arrêter. Les pages provisoires ne sont pas validées par cette livraison d’interface. Aucun paiement n’est demandé à l’envoi d’une demande. Détails opérateur : `docs/EMAIL_REQUESTS.md`, `docs/RESEND_DNS.md` et `docs/AUDIT_SITE_2026-11-02.md`.
