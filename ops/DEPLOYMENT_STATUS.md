# Déploiement de studio — gilmathis.com

Dernière livraison applicative : 02/11/2026 à 23:53, heure de Mexico (UTC−06), contrôlée ensuite dans le navigateur public sur ordinateur et mobile.

## Version active

- URL publique : https://gilmathis.com/
- Révision applicative : `8c497b4c5019f55f8c89b29adc256e0f5da437ee`, poussée sur `veloci11/Site_maker` / `main`.
- Release : `/home/mathis/site-maker/releases/20261103T055310Z-8c497b4c5019` ; lien `current` basculé atomiquement.
- Empreinte client publique : `index-D32bwwWH.js`, identique au build prévu.
- Archive vérifiée avant extraction : SHA-256 `42d1fcc31632a3e83b0a4e82ca3d726442a57e9740784bd74909e040fcfae3e7`.
- Version précédente disponible : `releases/20261103T045550Z-6133f1e47ab9`. Releases et sauvegardes précédentes conservées.

Le dépôt peut contenir un compte rendu plus récent ; la révision ci-dessus est le code applicatif effectivement en ligne. Les lots précédents ont été terminés et contrôlés avant les suivants. Le suivi est dans `docs/SUIVI_DEMANDES.md`.

## Interface livrée

Quatre forfaits de création : Vitrine, Connecté, Immersif 3D et Sur mesure. Évolution et Refonte concernent un site existant et conduisent à deux demandes contextualisées sur devis. Ces deux cartes utilisent maintenant le même composant `PricingCard`, les mêmes dimensions, la même matière, trois points et le même CTA que les quatre créations. Elles sont centrées en colonnes 2 et 3 sur grand écran, puis partagent les règles tablette/mobile. Les quatre identifiants techniques de création restent inchangés.

- Navigation : menu Forfaits avec six entrées, FAQ à droite avant le contact noir. Le déclencheur Forfaits reste neutre ; la texture apparaît sur chaque offre du sous-menu au survol ou au focus. Liste dépliable sur mobile, fermeture après navigation.
- Cartes : matière et effets approuvés des quatre créations conservés ; deux nouvelles variantes pour les services. Boutons noirs au repos, texture au survol/focus partagée avec le comparatif ; Configurer sans flèche. Flèches diagonales retirées du public.
- Halo renforcé à la demande de Mathis : lueur colorée visible autour des six cartes, opacité de 220 ms et expansion de 420 ms ; lumière intérieure à opacité 0,55 et déplacement de 620 ms. Ombres et teinte fixes, aucune boucle ni suivi du pointeur. Texture et fondu de 120 ms conservés. Le terme « grainy gradient » / dégradé granuleux est sourcé dans `docs/EFFET_CARTES_ELEVENLABS.md`.
- Comparatif : « Afficher plus de détails » sous le tableau, puis « Masquer les détails », chevron et dépliage CSS de 280 ms ; aucune case à cocher. Tableau sémantique unique et réduction du mouvement respectée.
- Configuration : grande carte à gauche, options à droite, inclusions expliquées par forfait, coordonnées et demande au studio. Totaux ponctuels et mensuels séparés. Vitrine commence sur ordinateur, mobile facultatif ; Connecté comprend les comptes visiteurs et les contenus modifiables.
- Galerie : neuf références avec filtres et crédits. GeoBoss, Aéma Groupe, Satellite Story et Atlante 3D ajoutés depuis le portfolio de Raphaël. Trois aperçus capturés sur les vrais sites dans l’IAB ; Atlante reprend le poster original et porte le badge « Projet archivé », avec lien vers le README de l’auteur. DOMTEKNIKA, Lactel, Julie Thiam, Tiny Heaven et Addiction Agency conservés. Image, titre et action ouvrent directement la destination dans le même onglet ; anciennes fiches redirigées directement, aperçu en sous-fenêtre supprimé. Aucune scène externe chargée automatiquement.
- FAQ : dix questions concrètes. Les huit premières couvrent frais, contenus, autonomie, domaine, mobile, site existant, calendrier et référencement, avec provenance Reddit qualitative documentée. Deux questions supplémentaires demandées directement par Mathis rassurent sur le choix du forfait et la réorientation par nos développeurs avant démarrage ; ajoutées en fin de liste, elles préservent les trois questions de l’accueil. Aucun prix, avis client, rabais ou délai chiffré inventé.

Catalogue et JSX indentés ; textes partagés dans `shared/catalog.ts` et `src/content/`, guide manuel `docs/MODIFIER_LE_SITE.md`. Primitives shadcn/Radix, Geist et Lucide conservés ; aucune nouvelle dépendance de production. Les dernières vérifications navigateur utilisent exclusivement le navigateur intégré demandé par Mathis.

## Vérifications de cette livraison

- `npm run check` final : TypeScript, build et **113 tests passants** après les deux FAQ et le CSS définitifs. `git diff --check` propre. Revue indépendante CSS puis texte sans blocage.
- Origine Ubuntu : santé valide, quatre créations, **26 options**, bases de prix nulles et paiements désactivés. Sauvegarde privée avant la bascule.
- HTTPS public : santé et empreinte client conformes au build ; code applicatif ci-dessus effectivement en ligne, distinct du commit documentaire ultérieur.
- Halo public Connecté : opacité extérieure 1 et intérieure 0,55 ; transitions calculées 220/420/620 ms conformes. Ombres colorées visibles dans la capture native PNG et zéro animation active après stabilisation. Les six cartes utilisent les mêmes règles.
- Contrôles locaux : dix échantillons de mouvement sur 629 ms ; retrait du pointeur = halo masqué, focus clavier = halo visible et contour 3 px, réduction des animations effective. Aucun suivi de souris, filtre animé ou animation permanente introduit.
- Mobile local : six cartes de 335 × 407,25 CSS, client/document 375/375 à viewport 390 × 844. Clic Vitrine arrivé au configurateur réel, inclusions et options visibles.
- FAQ publique : dix questions, les deux nouvelles réponses ouvertes et lues. Mobile public 390 × 844 CSS : client/document 375/375, réponse « mauvais forfait » lisible sans débordement. Les trois questions de l’accueil sont préservées.
- Aucune erreur ni alerte applicative observée dans la dernière visite publique. Viewport et émulation de mouvement temporaires réinitialisés. Aucune soumission de formulaire ni envoi réel d’e-mail.
- Preuves : `design-qa.md`, `docs/qa/visible-halo/after-public-retina.png`, `public-halo.json`, `faq-choice-public.jpg`, `faq-correction-mobile-public.jpg`. Les sources de texture et les neuf exemples sont inchangés ; les vérifications détaillées du lot précédent restent dans `docs/qa/card-alignment-faq-portfolio/` et l’historique de `design-qa.md`.
- Localhost arrêté : aucun processus à l’écoute sur **4173 ou 4174** après contrôle. Seul l’onglet public est conservé dans l’IAB.

## Isolement et sauvegardes

Application, runtime Node, tunnel, données et sauvegardes restent dédiés à `/home/mathis/site-maker/`. L’application écoute uniquement `127.0.0.1:3020`. Les services propres sont `site-maker.service`, `site-maker-tunnel.service` et `site-maker-backup.timer`, tous actifs. Le compte Unix reste partagé : séparation opérationnelle, pas une frontière de sécurité entre comptes système.

Une sauvegarde privée a précédé la bascule. Les données et secrets de `shared/` ne sont inclus ni dans Git ni dans les archives. États et PID de `gp-park.service`, `encar-dashboard.service` et `cloudflared-dashboard.service` identiques avant/après ; GP Park répond 200. Aucun de ces services n’a été redémarré.

## Grande carte et éléments reportés

Le master `grain-plasma-master.webp` reste l’export sans perte de la source originale 1536 × 1024, sans flou ni grain de remplacement. La source légère reste dessous et sert seule à DPR 1. Aucun changement du master ni de son recadrage pendant ce lot ; provenance dans `docs/ASSETS_REFERENCES.md`.

La configuration Resend existante est conservée : domaine d’envoi et expéditeur dédiés installés, destinataire **INQUIRY_TO reporté explicitement par Mathis**. Les demandes sont persistées, mais une réception réelle reste à vérifier après fourniture de l’adresse. Ne pas redemander cette adresse pendant les corrections visuelles.

Les prix et périmètres commerciaux précis, l’identité et les documents commerciaux définitifs restent à arrêter. Les pages provisoires ne sont pas validées par cette livraison d’interface. Aucun paiement n’est demandé à l’envoi d’une demande. Détails opérateur : `docs/EMAIL_REQUESTS.md`, `docs/RESEND_DNS.md` et `docs/AUDIT_SITE_2026-11-02.md`.
