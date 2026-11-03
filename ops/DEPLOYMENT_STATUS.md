# Déploiement de studio — gilmathis.com

Dernière livraison : 2 novembre 2026 à 21:21, heure de Mexico (UTC−06), contrôlée en ligne.

## Version active

- URL publique : https://gilmathis.com/
- Révision de l’application : `6adfae1ad67f19dee184120fa9eaf87889c36534`, poussée sur `veloci11/Site_maker` / `main`.
- Release : `/home/mathis/site-maker/releases/20261103T032149Z-6adfae1ad67f` ; lien `current` basculé atomiquement.
- Empreinte client publique : `index-D7l4zL1X.js`, identique au build de cette révision.
- Archive runtime vérifiée avant extraction : SHA-256 `07e9cc85ee3250b78f6c993dcccc5c89789d5e93e625e99eff7c21ef446274bc`.
- Révision précédente disponible : `20261103T021319Z-d892e663fcb7` ; première version publique conservée : `20261102T160947Z-d391f4d05a8f`.

Le dépôt peut contenir des comptes rendus plus récents ; la révision ci-dessus est celle du code applicatif effectivement déployé.

## Parcours livré et vérifications

Grande carte du forfait à gauche, choix d’options à droite et coordonnées sans compte. Le total suit la sélection lorsque les prix sont renseignés ; les montants mensuels restent séparés. Vitrine commence sur ordinateur seul, mobile facultatif. Connecté comprend les comptes utilisateurs du site livré et le CMS. Les quatre forfaits utilisent le même configurateur, Sur mesure reste sur devis.

Galerie distincte avec tags et filtres, références externes créditées, aucun aperçu Atelier / Artisanat. Comparatif simplifié avec coches, tirets et détails. La navigation publique propose Nous contacter ; les inscriptions de production sont fermées, les accès et données privés historiques sont conservés.

- `npm run check` : TypeScript, build et **113 tests passants** sur la révision finale.
- IAB local ordinateur et mobile : choix d’options, totaux avec tarifs temporaires, étapes/retour, enregistrement anonyme à données fictives, réouverture d’un forfait après confirmation, filtres de galerie et comparatif. Les tarifs temporaires ont été restaurés localement et ne sont pas dans l’archive runtime.
- Origine Ubuntu : santé et catalogue valides, quatre forfaits, **26 options**, paiements désactivés.
- HTTPS public via curl : 200, empreinte du client final identique, catalogue et calcul serveur vérifiés. Administration anonyme : 401 ; inscription en production : 403 REGISTRATION_CLOSED.
- IAB public : sélection de l’adaptation mobile, accès direct aux coordonnées sans inscription, retour sur Vitrine avec sélection conservée et formulaire réinitialisé. Aucun message réel soumis en production ; aucune erreur ou alerte applicative observée dans la console.
- Rapport visuel : `design-qa.md` ; captures publiques Retina actuelles : `docs/qa/navigation-content-review/after-public-home-retina.png` et `after-public-faq-retina.png`. La revue du site et ses points de lancement ouverts figurent dans `docs/AUDIT_SITE_2026-11-02.md`.
- Prévisualisation locale arrêtée : aucun processus à l’écoute sur 4173 ou 4174 après vérification.

## Isolement et sauvegarde

Les chemins, runtime Node, services et tunnel restent dédiés à `/home/mathis/site-maker/`. L’application écoute uniquement `127.0.0.1:3020`. Aucun runtime de GP Park n’est requis. Le compte Unix reste partagé : séparation opérationnelle, pas une frontière de sécurité entre comptes système.

Une sauvegarde privée a précédé chaque bascule. Les sauvegardes restent conservées dans `shared/backups/`. Le timer quotidien reste actif ; aucune purge automatique ajoutée. Les répertoires de données et clés ne sont jamais inclus dans les archives déployées ou dans Git.

`site-maker.service`, `site-maker-tunnel.service` et `site-maker-backup.timer` actifs. Les états **et PID** de `gp-park.service`, `encar-dashboard.service` et `cloudflared-dashboard.service` sont restés identiques avant/après chaque bascule. GP Park répond 200 avant/après ; aucun de ces services n’a été redémarré par cette livraison.

## État exact des e-mails et tarifs

- Domaine Resend `notifications.gilmathis.com` vérifié ; quatre DNS publics configurés via le MCP Cloudflare, sans modifier les MX du domaine principal.
- Clé d’envoi restreinte à ce domaine et expéditeur dédiés installés dans `shared/production.env`, mode 0600. Détails opérateur : `docs/EMAIL_REQUESTS.md`, DNS : `docs/RESEND_DNS.md`.
- **`INQUIRY_TO` manque encore** : Mathis a explicitement reporté la fourniture de cette adresse. Ne pas la redemander pendant les corrections visuelles. Le site conserve les demandes et indique honnêtement une notification indisponible. La file reprendra après configuration du destinataire.
- Aucun e-mail réel de test émis pendant cette correction ; la réception reste à vérifier lorsque l’adresse destinataire sera fournie. Les tests Resend utilisent un transport simulé ; ils ne prouvent pas une livraison réelle.
- Aucun prix commercial inventé : les bases restent `null`. Prix, périmètres détaillés, fiscalité, identité et documents commerciaux restent à arrêter avant engagement commercial. Aucun paiement n’est demandé à l’envoi d’une demande.

## Qualité des grandes cartes

Mathis a rejeté le lissage et le remplacement du grain : la grande carte reprend la matière originale, sans flou ni canvas ajouté. La nouvelle source haute densité `grain-plasma-master.webp` est un export WebP sans perte du PNG original 1536 × 1024. Le contrôle des pixels RGB confirme une différence nulle avec le PNG. Aucun changement d’effet, de source ou de CSS des petites cartes approuvées. ElevenLabs a été inspecté comme référence de matière ; aucun de ses assets n’est intégré au site.

Contrôle public à DPR 2 : source sans perte effectivement chargée, 2 636 656 octets, empreinte SHA-256 `f7dc38f6e2309482bb66a2089e884d4f22f6d92f03f7f15fd323658630d00b76` identique au fichier prévu. Elle est plus lourde que l’ancien export compressé ; la source légère préchargée reste dessous pendant le chargement, et reste seule à DPR 1. La première visite publique observée a chargé le master en environ 1,1 seconde sur cette connexion, sans garantie universelle. Les options et liens ne bloquent pas sur ce chargement. Aucun flou ni canvas de grain dans la grande carte ; aucune erreur ou alerte dans la console publique.

Capture publique PNG réelle 2560 × 1440 : `docs/qa/card-texture-fidelity/after-public-retina.png`, prise après fin du téléchargement et de la transition. Quatre variantes, focus des petites cartes et version mobile vérifiés localement. TypeScript, build et 113 tests passent. Sauvegarde privée avant bascule ; santé et empreinte du client public contrôlées ; mêmes états et PID pour les services des autres projets, GP Park 200. Localhost 4173 / 4174 fermé après validation.

## Navigation et FAQ — dernière correction livrée

Menu public et mobile : Accueil, Forfaits, Exemples de sites, Nous contacter. Plus de lien séparé par forfait dans la barre. Les cartes et le comparatif gardent l’accès aux quatre configurateurs. Les badges génériques et les mentions sur l’absence de compte ont été retirés des textes publics.

Six nouvelles questions : contenus, délai, modifications, mobile, domaine/hébergement, maintenance. Les trois premières sont aussi sur l’accueil. Contrôle public : six questions exactes, première réponse ouverte, aucune des formulations rejetées, pas d’erreur ou d’alerte dans la console. Le lien Forfaits, son état actif, le menu mobile et le passage aux coordonnées ont été vérifiés localement. Aucun message ni e-mail réel envoyé.

La révision livrée passe TypeScript, build et 113 tests ; les dernières retouches de rédaction sont incluses dans la vérification finale TypeScript/build. Santé et empreinte du client public confirmées après déploiement. Sauvegarde avant bascule ; autres projets avec états et PID inchangés, GP Park 200. Localhost fermé après validation.

L’essai d’image en définition supérieure n’a produit que 1536 × 1024 avec une dérive de grain : il est archivé hors du public et n’est pas livré comme texture. Le master sans perte reste actif. Les prix, le périmètre commercial précis, les pages d’informations définitives et le destinataire e-mail restent à compléter ; la simplification d’interface ne les fait pas passer pour terminés.


## Sous-menu, inclusions et refonte — contrôle public

Forfaits ouvre désormais un petit sous-menu avec les quatre offres et une entrée Refonte & évolution séparée. Nous contacter est noir sur ordinateur et mobile. Vérification publique : cinq entrées, navigation vers Vitrine fermant le panneau, largeur document/client 375/375 px à viewport 390 × 844 CSS. Les boutons Configurer révèlent la texture du forfait au survol et au focus. Les inclusions sont expliquées avant les options.

Refonte reste une prestation sur devis : sujet prérempli et URL facultative du site actuel observés publiquement, sans soumission. La capture Addiction Agency 2560 × 1440 est chargée dans la galerie ; son SHA-256 public est identique à l’export prévu. TypeScript, build et 113 tests passent ; santé et empreinte du client public confirmées. Sauvegarde avant bascule, autres projets avec états et PID inchangés, GP Park 200.

Le code du catalogue et des pages concernées a été mis en forme pour être lisible ; les textes partagés sont dans src/content/. Guide : docs/MODIFIER_LE_SITE.md. Suivi par lot : docs/SUIVI_DEMANDES.md. La nouvelle demande de dépliage animé reste locale à ce stade, distincte de cette version publiée.
