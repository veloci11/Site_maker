# Instance Ubuntu — gilmathis.com

Cette application dispose de son propre périmètre sous `~/site-maker/` :

```text
site-maker/
  releases/<date>-<commit>/    code et build de chaque livraison
  current -> releases/...    version active, bascule réversible
  runtime/node/              copie Node 24 propre au projet
  runtime/cloudflared        connecteur propre au projet
  shared/production.env      configuration privée, mode 0600
  shared/cloudflared.token   jeton du tunnel dédié, mode 0600
  shared/data/               SQLite et fichiers clients, mode 0700
  shared/backups/            instantanés vérifiés privés
```

Le processus écoute uniquement `127.0.0.1:3020`. Le tunnel Cloudflare `studio-site-maker` dessert `gilmathis.com` ; ses métriques restent sur `127.0.0.1:20242`. Aucun port de l’application n’est ouvert sur le réseau public. Les services utilisateur et le timer portent exclusivement les noms `site-maker*` ; les services GP Park, Encar et trading ne sont pas redémarrés par ce déploiement.

Les unités limitent CPU, mémoire et nombre de tâches. Les dossiers, données, runtimes, configuration et tunnel sont indépendants des autres applications. Les processus restent dans le compte système `mathis` : il s’agit d’une séparation opérationnelle, pas d’une frontière de sécurité entre comptes Unix différents. Le compte dispose de `Linger=yes` pour démarrer les services sans connexion SSH ouverte.

Variables de l’instance : `NODE_ENV=production`, `HOST=127.0.0.1`, `PORT=3020`, `TRUST_PROXY=loopback`, `APP_ORIGIN=https://gilmathis.com`, `PUBLIC_APP_URL=https://gilmathis.com`, `DATA_DIR` pointant dans `shared/data`. Les jetons et données ne sont pas copiés depuis le poste de développement et ne sont jamais versionnés.

Les modèles d’unités sont dans `ops/systemd/`. Le serveur utilise les dépendances de production du lockfile ; le build client est préparé sur la révision testée. Les originaux, documents internes et données locales ne sont pas inclus dans l’archive déployée.

Contrôles utiles :

```sh
systemctl --user status site-maker.service site-maker-tunnel.service
journalctl --user -u site-maker.service -n 50
systemctl --user list-timers site-maker-backup.timer
curl http://127.0.0.1:3020/api/health
```

La sauvegarde quotidienne vérifie SQLite et les fichiers référencés. Aucun effacement automatique d’anciennes sauvegardes n’est configuré ; surveiller leur volume et décider d’une rétention adaptée. Une bascule de version utilise le lien `current` ; elle ne remplace jamais `shared/data`. Voir `docs/DEPLOYMENT.md` pour restaurer un instantané dans un nouveau dossier.

Paiement, envoi des e-mails et documents commerciaux conservent leurs limites actuelles. Aucun compte ni mot de passe d’administration par défaut n’est créé.
