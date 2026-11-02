# Déploiement Ubuntu — gilmathis.com

Vérifié le 2 novembre 2026. Application publiée sur https://gilmathis.com/.

- Révision applicative : `d391f4d05a8f05fc973d88d8d94a36bc7cba3eb3`.
- Livraison : `20261102T160947Z-d391f4d05a8f`.
- Racine propre au projet : `/home/mathis/site-maker/`.
- Service web : `site-maker.service`, écoute `127.0.0.1:3020`.
- Connecteur dédié : `site-maker-tunnel.service`, tunnel Cloudflare `studio-site-maker`, quatre connexions et statut healthy au contrôle.
- Runtimes Node 24.22.1 et cloudflared propres au projet ; aucune dépendance de chemin vers GP Park.
- Données et fichiers privés dans `shared/data`, configuration et jeton en mode 0600, répertoires privés 0700.
- Sauvegarde initiale vérifiée ; timer `site-maker-backup.timer` activé, services activés pour le démarrage utilisateur avec linger déjà actif.
- Mémoire web limitée à 768 Mio, CPU à un cœur ; connecteur à 256 Mio et 50 % d’un cœur.

Le MCP Cloudflare a créé le tunnel séparé et le DNS de la racine. Une règle HTTP → HTTPS ne vise que `gilmathis.com`, conserve les chemins et requêtes, et laisse intacte la règle existante de `parking.gilmathis.com`. Aucun autre enregistrement DNS ni tunnel n’a été remplacé.

## Vérification

`npm run check` : TypeScript, build et **81 tests passants**, incluant la séparation des limites par client derrière le proxy loopback et le rejet de faux hops antérieurs.

Contrôles effectués sur l’URL publique avec validation TLS :

| Route | HTTP |
| --- | --- |
| `/` | 200 |
| `/api/health` | 200 |
| `/api/catalogue` | 200 |
| `/api/auth/me` | 200 |
| `/api/projects` | 401 |
| `/forfaits/immersif-3d` | 200 |
| `/api/quote` — Origin `https://gilmathis.com` | 200 |
| `/api/quote` — Origin `https://foreign.invalid` | 403 |

`http://gilmathis.com/forfaits/vitrine?lang=fr` renvoie 301 vers `https://gilmathis.com/forfaits/vitrine?lang=fr`. Le DNS autoritatif et le résolveur public 1.1.1.1 répondent. Ubuntu ouvre l’URL publique avec son DNS normal et reçoit 200 ; la santé publique renvoie `{"ok":true}`.

Au moment du contrôle, le Mac et son navigateur conservaient encore une réponse DNS négative antérieure. La vérification locale a donc joint l’edge Cloudflare en fixant l’adresse résolue, tout en gardant le domaine et la validation TLS normale. Le rendu visuel public dans ce navigateur reste à recontrôler après expiration de ce cache ; le rendu du même build avait été vérifié localement dans `design-qa.md`.

GP Park répondait 200 avant et après. `gp-park.service`, `encar-dashboard.service` et `cloudflared-dashboard.service` sont restés actifs ; aucun de ces services n’a été redémarré par cette livraison. La séparation décrite est opérationnelle, sous le même compte Unix, comme précisé dans `ops/README.md`.

Les paiements, e-mails transactionnels, identité commerciale et textes légaux conservent leurs limites de préparation. Aucun administrateur ni mot de passe par défaut n’a été créé. Les anciens comptes et données de test du Mac n’ont pas été transférés.
