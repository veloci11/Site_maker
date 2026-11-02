# Revue de préparation — serveur et exploitation

Relecture du 1 novembre 2026. Périmètre : `server/app.mjs`, `auth.mjs`, `db.mjs`, `projects.mjs`, `files.mjs`, `collaboration.mjs`, `orders.mjs`, la sauvegarde et `docs/DEPLOYMENT.md`. Les essais utilisent uniquement des serveurs locaux et des bases temporaires. Aucun compte client réel, prestataire externe ou environnement de production n’a été utilisé.

## Conclusion

Le socle serveur est utilisable pour poursuivre les essais privés : les données sont enregistrées dans SQLite et dans des fichiers privés persistants, les accès clients sont contrôlés par le propriétaire et l’administration dispose d’accès explicites. Deux défauts de concurrence ont été corrigés et couverts par des régressions. Les **41 tests ciblés de cette passe passent** ; cette revue ne remplace pas la vérification globale et visuelle de la révision finale.

Cette conclusion ne signifie pas qu’une production a été déployée ou validée. Les pages légales sont encore provisoires ; l’identité du studio, les conditions du service, les tarifs et l’information sur les données restent des décisions opérateur. Le paiement et l’e-mail transactionnel de production sont volontairement désactivés. Leur absence n’est pas traitée comme un défaut caché ou comme une vente déjà possible.

## Défauts reproduits et corrigés

### Connexion concurrente avec un changement de mot de passe

Avant correction, `login` lisait le hash, attendait la vérification scrypt puis créait une session sans relire l’identité. Une réinitialisation validée pendant cette attente pouvait supprimer les sessions, puis la connexion avec l’ancien mot de passe en recréait une. Une reproduction locale a donné : réinitialisation validée, réponse de connexion `200`, ressource privée `200`, une nouvelle session après révocation.

La connexion relit maintenant le hash et l’e-mail dans une transaction avant d’émettre sa session. Les modifications du profil et du mot de passe recontrôlent également que la session existe toujours et n’a pas expiré après les attentes asynchrones. Le changement de mot de passe utilise une mise à jour conditionnelle sur le hash vérifié, et la révocation/rotation des sessions fait partie de la même transaction. Les erreurs de connexion restent génériques.

Les nouvelles régressions intercalent une opération concurrente après la lecture des identifiants et pendant le vrai calcul scrypt, sans dépendre d’un délai arbitraire. Elles vérifient le refus d’une connexion après changement du hash ou de l’e-mail, le refus d’une modification après révocation de session, et la conservation d’un mot de passe réinitialisé pendant une modification déjà en cours. Le parcours de réinitialisation consommait déjà son jeton par suppression conditionnelle dans la transaction ; il ne nécessitait pas cette correction.

### Textes ouverts dans plusieurs onglets

Le remplacement intégral d’une page pouvait écraser silencieusement un enregistrement plus récent. `PUT /api/projects/:projectId/contents/:pageKey` accepte maintenant `expectedUpdatedAt` : la valeur `updatedAt` lue par l’éditeur, ou `null` lors de la création d’une page absente.

La vérification et l’écriture sont atomiques. Une version périmée renvoie `409`, `code: CONTENT_CONFLICT` et `content` avec la page actuellement enregistrée, sans modifier celle-ci. Le jeton temporel progresse même si deux écritures surviennent dans la même milliseconde. La création conditionnelle empêche aussi deux onglets de réutiliser le même nom de page en remplaçant le premier contenu.

Le champ reste facultatif pour les anciens appels API : **un appel qui l’omet conserve le comportement historique de remplacement**. Le client doit l’envoyer pour bénéficier de la protection. L’intégration de l’éditeur et de son choix explicite de comparaison/rechargement relève de la vérification UI finale ; le serveur fournit la page courante sans supprimer le brouillon local.

## Contrôles de cohérence

| Surface relue | Résultat et limite pratique |
| --- | --- |
| Données | SQLite avec clés étrangères, contraintes JSON, transactions et WAL ; reconnexion testée. Les fichiers restent dans `DATA_DIR`. Le mode pris en charge est une instance Node 24 et un disque persistant. Aucun test de charge ou d’incident disque de l’hébergeur n’a été réalisé. |
| Comptes | Rôle imposé côté serveur, mots de passe hachés, sessions opaques persistées par empreinte, expiration et révocation côté serveur. Les mutations passent par le contrôle d’origine ; les comptes clients ne choisissent pas un rôle administrateur. |
| Projets et contenus | Liste, lecture et mutation client filtrées par propriétaire ; un projet étranger et un identifiant absent renvoient le même refus. Les prix, le statut et le propriétaire ne sont pas acceptés dans une modification de projet. |
| Fichiers | Téléchargement et aperçu authentifiés ; choix du fichier depuis la base, pas depuis un chemin client. Contrôles de types et tailles, corbeille récupérable. Les dossiers publics et les redirections symboliques vers ceux-ci sont refusés. Les fichiers SVG/documents sont téléchargés, pas incorporés comme du HTML actif. |
| Collaboration | Auteurs issus de la session ; pièces jointes du même projet ; publication de maquette réservée au studio. Seul le propriétaire peut approuver, avec confirmation et uniquement pour la dernière version disponible. L’administrateur ne valide pas à la place du client. |
| Dossiers et tarifs | Calcul serveur et instantanés conservés ; changement de tarifs/configuration détecté. Création et maintenance mensuelle restent séparées. Une sauvegarde de dossier ne produit ni paiement ni statut payé. |
| Contact et e-mail | Le contact enregistre une demande privée pour le studio. La récupération indique explicitement si l’e-mail n’est pas configuré ; l’outbox est réservée au développement. Aucun de ces parcours ne prétend envoyer une notification de production. |
| Sauvegarde | Instantané `VACUUM INTO`, vérifications d’intégrité et références, fichiers référencés incluant la corbeille, manifeste SHA-256. Les essais rouvrent la sauvegarde et vérifient l’indépendance vis-à-vis de modifications ultérieures de la source. L’automatisation et une restauration sur l’hébergement réel restent à mettre en place. |

## Décisions opérateur avant ouverture

Ces points décrivent les éléments encore non configurés ; ils ne sont pas présentés comme une conformité juridique déjà obtenue.

1. **Exploitation réelle** : choisir l’hébergement avec disque persistant, le domaine et HTTPS ; renseigner `NODE_ENV`, `APP_ORIGIN`, `PUBLIC_APP_URL` et un `DATA_DIR` privé. Vérifier les droits, la fermeture/redémarrage du processus et les parcours privés sur cet environnement. Le worker statique Sites ne fournit pas le serveur de comptes et de fichiers.
2. **Proxy et sauvegardes** : suivre `DEPLOYMENT.md`, garder les données et sauvegardes hors des chemins servis. Tester les limites d’envoi et les limites de requêtes derrière le proxy choisi : `trust proxy` est désactivé et plusieurs visiteurs peuvent sinon partager une même adresse de limitation. Planifier des sauvegardes privées et un véritable exercice de restauration, avec révocation des anciennes sessions/jetons restaurés.
3. **Identité et documents** : remplacer les textes provisoires de `/mentions-legales`, `/conditions` et `/confidentialite` par les informations validées du studio. Les formulaires recueillent des comptes, coordonnées et fichiers même lorsque les paiements sont désactivés : leur information et leur traitement doivent donc être décidés pour l’ouverture des inscriptions publiques, pas seulement pour le premier achat. Aucun nom légal, pays d’établissement, délai de conservation ou condition commerciale n’est inventé ici.
4. **Offres commerciales** : arrêter les prix, la devise, la présentation fiscale, les contenus et limites des forfaits, la portée de la mise en ligne et celle de la maintenance mensuelle. Les valeurs de test ne fixent pas les prix publics. La page Conditions actuelle est un texte provisoire, pas des CGV validées.
5. **Services externes** : si la récupération autonome de compte est ouverte, raccorder et vérifier le transport transactionnel prévu par `createAuthRouter({ resetTransport })`. Avant tout achat, intégrer et tester un prestataire de paiement avec les règles commerciales validées. Renseigner des tarifs dans l’administration ne suffit pas à activer un achat dans cette version.

## Preuves exécutées pendant cette passe

```sh
node --test tests/auth.test.mjs tests/projects.test.mjs tests/database.test.mjs
# 28 / 28 : authentification, concurrence, propriété, persistance et transactions

node --test tests/integration.test.mjs tests/backup.test.mjs tests/private-storage.test.mjs
# 13 / 13 : application composée avec vraies sessions, sauvegarde et stockage privé

node --check server/auth.mjs
node --check server/projects.mjs
# Syntaxe valide
```

La suite globale, le build final, les performances navigateur et les contrôles desktop/mobile appartiennent à l’intégration finale. Aucune délivrabilité e-mail, infrastructure publique, disponibilité de paiement, charge représentative ou restauration d’hébergeur n’est déduite de ces tests locaux.
