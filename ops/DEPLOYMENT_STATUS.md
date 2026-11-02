# Déploiement de studio — gilmathis.com

Dernière vérification : 2 novembre 2026, après la bascule de 19:39 UTC.

## Version active

- URL publique : https://gilmathis.com/
- Révision de l’application : `f60622a6376652e0bb5d4997203073c26d70052d`, poussée sur `veloci11/Site_maker` / `main`.
- Release : `/home/mathis/site-maker/releases/20261102T193947Z-f60622a63766` ; lien `current` basculé atomiquement.
- Empreinte client publique : `index-9R-JJnLa.js`, identique au build de cette révision.
- Archive runtime vérifiée avant extraction : SHA-256 `be216d145ee3e20882bdff9a957208906a73d284b96b96819a843628847651c2`.
- Révision précédente disponible : `20261102T193327Z-a84fe2ac4841` ; première version publique conservée : `20261102T160947Z-d391f4d05a8f`.

Le dépôt peut contenir des comptes rendus plus récents ; la révision ci-dessus est celle du code applicatif effectivement déployé.

## Parcours livré et vérifications

Grande carte du forfait à gauche, choix d’options à droite et coordonnées sans compte. Le total suit la sélection lorsque les prix sont renseignés ; les montants mensuels restent séparés. Vitrine commence sur ordinateur seul, mobile facultatif. Connecté comprend les comptes utilisateurs du site livré et le CMS. Les quatre forfaits utilisent le même configurateur, Sur mesure reste sur devis.

Galerie distincte avec tags et filtres, références externes créditées, aucun aperçu Atelier / Artisanat. Comparatif simplifié avec coches, tirets et détails. La navigation publique propose Nous contacter ; les inscriptions de production sont fermées, les accès et données privés historiques sont conservés.

- `npm run check` : TypeScript, build et **113 tests passants** sur la révision finale.
- IAB local ordinateur et mobile : choix d’options, totaux avec tarifs temporaires, étapes/retour, enregistrement anonyme à données fictives, réouverture d’un forfait après confirmation, filtres de galerie et comparatif. Les tarifs temporaires ont été restaurés localement et ne sont pas dans l’archive runtime.
- Origine Ubuntu : santé et catalogue valides, quatre forfaits, **26 options**, paiements désactivés.
- HTTPS public via curl : 200, empreinte du client final identique, catalogue et calcul serveur vérifiés. Administration anonyme : 401 ; inscription en production : 403 REGISTRATION_CLOSED.
- IAB public : sélection de l’adaptation mobile, accès direct aux coordonnées sans inscription, retour sur Vitrine avec sélection conservée et formulaire réinitialisé. Aucun message réel soumis en production ; aucune erreur ou alerte applicative observée dans la console.
- Rapport visuel : `design-qa.md` ; capture publique : `docs/qa/deployment-gilmathis/configurator-anonymous-public.jpg`.
- Prévisualisation locale arrêtée : aucun processus à l’écoute sur 4173 ou 4174 après vérification.

## Isolement et sauvegarde

Les chemins, runtime Node, services et tunnel restent dédiés à `/home/mathis/site-maker/`. L’application écoute uniquement `127.0.0.1:3020`. Aucun runtime de GP Park n’est requis. Le compte Unix reste partagé : séparation opérationnelle, pas une frontière de sécurité entre comptes système.

Une sauvegarde privée a précédé chaque bascule. Trois sauvegardes sont présentes dans `shared/backups/`. Le timer quotidien reste actif ; aucune purge automatique ajoutée. Les répertoires de données et clés ne sont jamais inclus dans les archives déployées ou dans Git.

`site-maker.service`, `site-maker-tunnel.service` et `site-maker-backup.timer` actifs. Les états **et PID** de `gp-park.service`, `encar-dashboard.service` et `cloudflared-dashboard.service` sont restés identiques avant/après chaque bascule. GP Park répond 200 avant/après ; aucun de ces services n’a été redémarré par cette livraison.

## État exact des e-mails et tarifs

- Domaine Resend `notifications.gilmathis.com` vérifié ; quatre DNS publics configurés via le MCP Cloudflare, sans modifier les MX du domaine principal.
- Clé d’envoi restreinte à ce domaine et expéditeur dédiés installés dans `shared/production.env`, mode 0600. Détails opérateur : `docs/EMAIL_REQUESTS.md`, DNS : `docs/RESEND_DNS.md`.
- **`INQUIRY_TO` manque encore** : adresse de réception demandée à Mathis. Le site conserve les demandes et indique honnêtement une notification indisponible. La file reprendra après configuration du destinataire.
- Aucune notification réelle envoyée ni livraison en boîte confirmée. File de production vide au dernier contrôle. Les tests Resend utilisent un transport simulé ; ils ne prouvent pas une livraison réelle.
- Aucun prix commercial inventé : les bases restent `null`. Prix, périmètres détaillés, fiscalité, identité et documents commerciaux restent à arrêter avant engagement commercial. Aucun paiement n’est demandé à l’envoi d’une demande.
