# studio

Création de sites avec quatre forfaits : Vitrine, Connecté, Immersif 3D et Sur mesure. Parcours public sans compte : grande carte du forfait choisi, options, coordonnées puis demande au studio. Les exemples externes sont réunis dans une galerie filtrable.

Les demandes et leur configuration sont conservées dans une base privée. Une file durable prépare la notification Resend, avec reprise et idempotence. Configuration de l’envoi : [docs/EMAIL_REQUESTS.md](docs/EMAIL_REQUESTS.md). Les prix initiaux restent à définir ; aucun paiement n’est demandé à l’envoi. L’ancien espace privé et ses données sont conservés, sans inscription publique en production.

## Développement

Prérequis : **Node.js 24**, npm et un dossier local accessible en écriture. Le projet utilise le module natif `node:sqlite`, encore signalé expérimental par la version Node 24 utilisée pour la validation.

```sh
npm ci
npm run dev
```

Le client est servi sur `http://127.0.0.1:4173`, avec proxy `/api` vers le serveur Node sur `127.0.0.1:4174`. Le script lance les deux processus. Les comptes, projets et fichiers de développement sont enregistrés dans `.data/`, ignoré par Git. Il n'existe aucun compte ou mot de passe par défaut.

Les variables sont lues dans l'environnement du processus. **Copier `.env.example` ne charge pas automatiquement le fichier.** Pour utiliser un fichier `.env` local avec Node 24 :

```sh
cp .env.example .env
node --env-file=.env scripts/dev.mjs
```

Conserver l'origine configurée en accord avec l'adresse ouverte dans le navigateur. Si le client tourne sur `127.0.0.1:4173`, utiliser cette origine dans `APP_ORIGIN`.

## Vérifications

```sh
npm run check
```

Cette commande vérifie TypeScript, construit le client et exécute les tests Node. Les suites API utilisent des données temporaires. Les tests du worker exigent les fichiers issus du build ; `npm run check` respecte cet ordre. La CI utilise le même parcours sur Node 24.

## Administration

Créer explicitement un administrateur dans le même `DATA_DIR` que le serveur :

```sh
node scripts/create-admin.mjs --email admin@example.com --name "Équipe studio"
```

Le mot de passe est demandé sans affichage puis confirmé. La commande accepte aussi `STUDIO_ADMIN_PASSWORD` fourni par un gestionnaire de secrets ; ne pas placer de mot de passe dans les arguments ou dans Git. Un e-mail existant n'est pas promu silencieusement. Se connecter ensuite au site et ouvrir `/admin`.

L'administration gère les tarifs, les demandes et les projets, et peut répondre et publier des maquettes. Seul le propriétaire du projet peut valider sa maquette. Les tarifs sont calculés côté serveur ; une option déjà incluse dans un forfait n'est pas facturée une seconde fois.

## Production

Le site est déployé sur **https://gilmathis.com/** dans son propre répertoire Ubuntu, avec stockage, services et tunnel Cloudflare dédiés. Organisation et contrôles : [ops/README.md](ops/README.md) et [ops/DEPLOYMENT_STATUS.md](ops/DEPLOYMENT_STATUS.md).

Le fonctionnement complet nécessite **un processus Node persistant, HTTPS et un volume privé persistant** pour SQLite et les fichiers. Servir uniquement `dist/client` ou utiliser `vite preview` ne fournit pas les comptes et les API. Le worker Sites conservé dans ce dépôt sert uniquement le client statique ; il ne remplace pas le serveur Express.

Les instructions d'exploitation, de sauvegarde et de restauration sont dans [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Le dépôt fournit le code ; il ne prouve pas une mise en production.

Avant une commande commerciale, les prix, leur régime fiscal, le périmètre des forfaits et options, les frais récurrents et les documents de l’éditeur restent à confirmer. L’état de l’envoi Resend est suivi dans le rapport de déploiement. Aucun de ces éléments n'est inventé dans la version livrée.

## Organisation du code

| Dossier | Rôle |
| --- | --- |
| `src/` | Interface React 19, TypeScript, React Router et composants shadcn/Radix |
| `shared/catalog.ts` | Offres, normalisation des options et calcul des montants |
| `server/` | API Express 5, comptes, SQLite, fichiers privés, collaboration et commandes |
| `scripts/` | Développement, création d'administrateur, build et sauvegarde |
| `tests/` | Tests Node des domaines et de l'intégration |
| `docs/` | Contrats techniques, direction graphique et vérifications |
| `.data/` | Données privées locales, jamais versionnées ni servies comme fichiers publics |

L'interface utilise Geist Sans et les icônes Lucide. Les références externes de la galerie servent d'inspiration ; elles ne sont pas annoncées comme des clients ou réalisations du studio. La charte d'interface reste un document interne.
