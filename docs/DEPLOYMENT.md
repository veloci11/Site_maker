# Exploitation du serveur studio

## Architecture à héberger

Le serveur `server/index.mjs` sert les API et, après le build, les fichiers de `dist/client`. React utilise les API de la même origine. SQLite et les dépôts clients sont conservés dans `DATA_DIR`. Cette version vise **une instance Node 24 avec disque local persistant**. Un hébergement statique, un disque éphémère ou plusieurs instances écrivant sur un volume réseau n'ont pas été validés.

Le worker `worker/index.js`, `.openai/hosting.json` et les fichiers de packaging Sites sont conservés pour la partie visuelle statique. Ils n'implémentent ni l'API Express, ni les sessions, ni le stockage privé.

## Configuration

| Variable | Usage |
| --- | --- |
| `NODE_ENV=production` | Cookies Secure et politique CSP de production |
| `HOST` | Adresse d'écoute ; `127.0.0.1` derrière un reverse proxy local, interface privée adaptée en conteneur |
| `PORT` | Port Node ; défaut `4174` (`API_PORT` est une alternative de développement) |
| `APP_ORIGIN` | Origine HTTPS publique autorisée pour les mutations, sans chemin |
| `PUBLIC_APP_URL` | Origine utilisée pour construire les liens de récupération ; HTTPS en production |
| `DATA_DIR` | Chemin absolu privé et persistant, hors de `public/`, `dist/client` et des chemins servis par le proxy |
| `TRUST_PROXY=loopback` | Uniquement derrière un proxy local, avec Node lié à `127.0.0.1`. Permet des limites par visiteur ; absent, les en-têtes de proxy ne sont pas approuvés. Toute autre valeur est refusée. |

Les scripts npm ne chargent pas `.env` implicitement. Fournir ces variables par le gestionnaire de processus, le conteneur ou `node --env-file=/chemin/prive/studio.env server/index.mjs`. Le fichier d'environnement reste privé et hors de Git. Ne jamais exposer un secret avec un préfixe `VITE_` : ces variables peuvent être incorporées au client.

Exemple de valeurs opérateur, à adapter à l'hébergement réel :

```dotenv
NODE_ENV=production
HOST=127.0.0.1
PORT=4174
APP_ORIGIN=https://studio.example
PUBLIC_APP_URL=https://studio.example
DATA_DIR=/var/lib/studio
```

## Construction et lancement

Sur la révision à livrer, installer avec le lockfile et exécuter les vérifications :

```sh
npm ci
npm run check
```

Le serveur importe également `shared/catalog.ts` avec le support natif TypeScript de Node 24. Déployer `server/`, `shared/`, `dist/client/`, `package.json`, le lockfile et les dépendances de production, ou le dépôt applicatif complet avec accès privé aux documents internes. Ne pas publier la racine du dépôt comme un dossier statique.

```sh
node --env-file=/chemin/prive/studio.env server/index.mjs
```

Le gestionnaire de processus doit redémarrer le serveur en cas d'échec et transmettre `SIGTERM` lors d'un arrêt. Le serveur ferme alors son écoute et sa connexion SQLite. La route `GET /api/health` indique que l'API répond ; elle ne constitue pas une preuve d'intégrité des fichiers ni de disponibilité d'un prestataire externe.

Le reverse proxy termine HTTPS, transmet `/api` et les pages vers Node, et laisse le serveur attribuer les en-têtes des fichiers privés. Il ne doit pas servir `DATA_DIR`, `.env`, `server/`, les sauvegardes ou l'outbox. Prévoir une limite de corps cohérente avec dix fichiers de 10 Mo et les métadonnées multipart. Préserver le domaine public ou configurer `APP_ORIGIN` explicitement. Pour un tunnel Cloudflare qui rejoint Node sur `127.0.0.1`, activer `TRUST_PROXY=loopback` et garder l'écoute exclusivement locale. Les en-têtes venant au-delà du dernier proxy de confiance ne sont pas approuvés ; ne pas élargir cette confiance à toutes les adresses.

Créer le dossier de données avec un compte système dédié et des permissions privées. Le code crée ses nouveaux dossiers en `0700` et ses fichiers privés en `0600` ; il ne remplace pas une bonne configuration de permissions d'un dossier déjà existant. SQLite utilise WAL. Éviter les copies manuelles de `studio.sqlite` pendant l'activité.

## Premier administrateur et services externes

Dans le même environnement de données que le serveur :

```sh
node --env-file=/chemin/prive/studio.env scripts/create-admin.mjs --email admin@example.com --name "Équipe studio"
```

La saisie du mot de passe est masquée. Aucun compte n'est précréé. La commande refuse un e-mail déjà utilisé et ne transforme pas un client en administrateur.

Les tarifs initiaux sont `null`. L'administrateur peut les renseigner ; cela **n'active pas les paiements**. Aucun adaptateur de paiement n'est actif dans cette version. Le bouton de préparation enregistre un dossier et son récapitulatif ; il ne crée pas un paiement ni une facture commerciale. Les conditions, la fiscalité, les tarifs et un prestataire devront être validés et intégrés avant l'ouverture des commandes.

La récupération de mot de passe n'envoie pas d'e-mail en production sans transport transactionnel. L'extension prévue est `createAuthRouter({ resetTransport })` ; le montage du serveur doit être adapté pour utiliser le transport retenu et ses secrets côté serveur. Le parcours ne prétend pas qu'un message externe a été envoyé. En développement seulement, l'outbox privée permet les essais locaux ; ne jamais la servir, la commiter ni recopier ses liens dans un ticket public. Voir [AUTH.md](AUTH.md).

Les formulaires de contact enregistrent une demande privée pour l'administration. Ils n'envoient pas actuellement de notification externe. Le propriétaire valide sa maquette ; l'administrateur ne signe pas à sa place. Voir [COLLABORATION.md](COLLABORATION.md).

## Sauvegarde vérifiée

Le script produit une base autonome avec `VACUUM INTO`, vérifie `integrity_check` et les références étrangères, copie les fichiers référencés (y compris la corbeille), contrôle leurs tailles et écrit un manifeste SHA-256. La sortie privée est créée dans un nouveau sous-dossier ; une erreur supprime seulement cette sortie incomplète. Les chemins publics, les destinations imbriquées dans les données et les fichiers sources symboliques sont refusés.

```sh
node --env-file=/chemin/prive/studio.env scripts/backup.mjs --to /var/backups/studio
```

La base sauvegardée est un instantané cohérent, y compris des écritures validées encore dans le WAL. Ce comportement repose sur [la garantie SQLite de `VACUUM INTO`](https://www.sqlite.org/lang_vacuum.html). Les fichiers de cette version sont immuables et leur suppression est récupérable : ils restent disponibles après l'instantané. **Si une purge physique est ajoutée plus tard, elle devra être coordonnée avec les sauvegardes.** En attendant, un arrêt contrôlé pendant la sauvegarde reste possible et réduit l'activité concurrente.

Le manifeste ne chiffre pas les données. Conserver les sauvegardes sur un stockage privé chiffré, avec une copie indépendante, une rétention définie et des essais de restauration. La fréquence dépend de la perte de travail acceptable. Aucun ordonnanceur, stockage distant ou politique de rétention n'est configuré par ce dépôt.

L'outbox de développement et les fichiers d'upload temporaires sont exclus. Les comptes, sessions et jetons hachés présents dans SQLite sont inclus ; une restauration d'une sauvegarde ancienne doit révoquer les sessions et les demandes de réinitialisation pour ne pas réintroduire un accès révoqué depuis.

## Restauration

1. Arrêter le service Node et conserver le dossier de données courant à part pour retour arrière.
2. Choisir une sauvegarde terminée avec `manifest.json`. Vérifier son origine, l'empreinte SHA-256 de `studio.sqlite` et les empreintes/taille des fichiers du manifeste avant de l'utiliser.
3. Restaurer `studio.sqlite` et le dossier `uploads/` dans un **nouveau** `DATA_DIR` privé. Ne pas mélanger un instantané avec d'anciens fichiers `studio.sqlite-wal` ou `studio.sqlite-shm`.
4. Avec Node 24, ouvrir cette base et vérifier `PRAGMA integrity_check` puis `PRAGMA foreign_key_check`. Révoquer ses sessions et récupérations par `DELETE FROM sessions; DELETE FROM password_resets;` dans une transaction, avant sa remise en service.
5. Rétablir propriétaire et permissions (`0700` dossiers, `0600` fichiers), pointer `DATA_DIR` vers ce dossier et redémarrer la même version applicative ou une migration testée.
6. Vérifier connexion, projet, contenu, téléchargement privé, messages et maquette sur un environnement isolé avant bascule. Garder le dossier précédent jusqu'à confirmation du bon fonctionnement.

Les tests `tests/backup.test.mjs` rouvrent effectivement l'instantané produit, contrôlent les données encore dans un WAL actif et les fichiers récupérables, puis vérifient qu'une modification ultérieure de la source ne change pas la sauvegarde. Ils couvrent aussi les refus de chemins publics, de symlinks et d'incohérences de taille. Ils ne remplacent pas un exercice de restauration sur l'hébergement retenu.

## Contrôle avant ouverture commerciale

Le déploiement public n'est pas effectué par la livraison de ce dépôt. L'hébergeur, le domaine, les sauvegardes automatisées, l'identité commerciale, les conditions, les limites précises d'offres et les services externes restent des décisions opérateur. Les tests locaux et la CI ne prouvent pas leur bon fonctionnement en production.
