# Déploiement de studio — gilmathis.com

Dernière livraison : 2 novembre 2026 à 18:07, heure de Mexico (UTC−06), contrôlée en ligne.

## Version active

- URL publique : https://gilmathis.com/
- Révision de l’application : `f768c46c96e56ec34e2a50aa27b935ab321681b9`, poussée sur `veloci11/Site_maker` / `main`.
- Release : `/home/mathis/site-maker/releases/20261103T000640Z-f768c46c96e5` ; lien `current` basculé atomiquement.
- Empreinte client publique : `index-D48NNVRJ.js`, identique au build de cette révision.
- Archive runtime vérifiée avant extraction : SHA-256 `19eb57fc7a3bde877f33a34e087ac9a420c452c9b582ef18beab95b2c3491432`.
- Révision précédente disponible : `20261102T234735Z-e2d7d435e98f` ; première version publique conservée : `20261102T160947Z-d391f4d05a8f`.

Le dépôt peut contenir des comptes rendus plus récents ; la révision ci-dessus est celle du code applicatif effectivement déployé.

## Parcours livré et vérifications

Grande carte du forfait à gauche, choix d’options à droite et coordonnées sans compte. Le total suit la sélection lorsque les prix sont renseignés ; les montants mensuels restent séparés. Vitrine commence sur ordinateur seul, mobile facultatif. Connecté comprend les comptes utilisateurs du site livré et le CMS. Les quatre forfaits utilisent le même configurateur, Sur mesure reste sur devis.

Galerie distincte avec tags et filtres, références externes créditées, aucun aperçu Atelier / Artisanat. Comparatif simplifié avec coches, tirets et détails. La navigation publique propose Nous contacter ; les inscriptions de production sont fermées, les accès et données privés historiques sont conservés.

- `npm run check` : TypeScript, build et **113 tests passants** sur la révision finale.
- IAB local ordinateur et mobile : choix d’options, totaux avec tarifs temporaires, étapes/retour, enregistrement anonyme à données fictives, réouverture d’un forfait après confirmation, filtres de galerie et comparatif. Les tarifs temporaires ont été restaurés localement et ne sont pas dans l’archive runtime.
- Origine Ubuntu : santé et catalogue valides, quatre forfaits, **26 options**, paiements désactivés.
- HTTPS public via curl : 200, empreinte du client final identique, catalogue et calcul serveur vérifiés. Administration anonyme : 401 ; inscription en production : 403 REGISTRATION_CLOSED.
- IAB public : sélection de l’adaptation mobile, accès direct aux coordonnées sans inscription, retour sur Vitrine avec sélection conservée et formulaire réinitialisé. Aucun message réel soumis en production ; aucune erreur ou alerte applicative observée dans la console.
- Rapport visuel : `design-qa.md` ; capture publique Retina actuelle : `docs/qa/card-grain-native/after-public-retina.png` ; comparaison du grain : `docs/qa/card-grain-native/comparison-grain.png`.
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

Les couleurs et la matière de la grande carte sont désormais séparées. La texture légère studio est lissée statiquement ; un canvas dessine un grain fin à la densité réelle de l’écran, avec un budget borné. Le texte et les contrôles ne subissent pas le filtre. L’image HD agrandie de l’essai précédent ne se télécharge plus. Les petites cartes et leur effet approuvé, ainsi que le fond pastel global, restent inchangés.

Contrôle public à DPR 2 : carte 568,3 × 530 CSS, canvas 1137 × 1060 ; seule la ressource de 162 744 octets est observée, contre la couche HD de 879 898 octets auparavant. Initialisation mesurée à environ 1,1 ms sur cette machine, aucune animation active au repos ni erreur/avertissement applicatif. Ce constat local n’est pas une garantie universelle de performance. Capture PNG réelle 2560 × 1440 : `docs/qa/card-grain-native/after-public-retina.png`.

Les quatre variantes et le format mobile ont été vérifiés localement ; TypeScript, build et 113 tests passent. La santé et l’empreinte du client public sont confirmées après bascule. Sauvegarde privée avant déploiement, services des autres projets avec les mêmes états et PID avant/après ; GP Park 200. Prévisualisation locale fermée après vérification des ports.
