# Sauvegarde et restauration des briefs publics

Le format de sauvegarde existant suffit aux briefs V2. `scripts/backup.mjs` produit un instantané autonome de `studio.sqlite` avec `VACUUM INTO` : demandes, coordonnées, réponses, instantanés de configuration/devis, images BLOB et outbox sont sauvegardés ensemble, y compris les écritures validées encore dans le WAL.

Les images des demandes sont dans `inquiry_attachments.bytes`. Elles ne correspondent à aucun fichier à copier dans `uploads/`. Les fichiers historiques des projets restent dans ce dossier, et sont copiés lorsqu'ils sont référencés par la table `files`, y compris ceux de la corbeille récupérable. `fileCount` et `manifest.files` comptent uniquement ces fichiers historiques ; l'empreinte `manifest.databaseSha256` couvre la base entière, dont les images BLOB.

## Restauration manuelle

Suivre la procédure générale de [DEPLOYMENT.md](DEPLOYMENT.md#restauration), avec ces points pour les briefs :

1. Arrêter l'application et conserver son dossier de données courant pour retour arrière. Choisir une sauvegarde terminée contenant `manifest.json`.
2. Vérifier le SHA-256 de `studio.sqlite` contre `databaseSha256`, puis les tailles et SHA-256 des fichiers de `manifest.files`.
3. Copier la base et le dossier `uploads/` de **cette même sauvegarde** dans un nouveau `DATA_DIR` privé. Le dossier `uploads/` peut être absent si aucun fichier historique n'était référencé. Aucun export séparé des images de brief n'est nécessaire. Ne pas reprendre les anciens `studio.sqlite-wal` et `studio.sqlite-shm` du dossier vivant.
4. Ouvrir la base restaurée avec Node 24. `PRAGMA integrity_check` doit renvoyer `ok` et `PRAGMA foreign_key_check` aucune ligne. Pour chaque image de `inquiry_attachments`, vérifier `length(bytes) = size` et recalculer le SHA-256 des octets contre `sha256`.
5. Révoquer les sessions et récupérations de mot de passe restaurées comme indiqué dans la procédure générale. Rétablir propriétaire et permissions privées : dossiers `0700`, fichiers `0600`.
6. Vérifier le détail de demandes anciennes et V2 dans une instance isolée, puis les aperçus et téléchargements privés. Chaque image doit rester liée à son `inquiry_id`. Vérifier aussi un téléchargement historique et une entrée de corbeille.
7. Contrôler les états et payloads de `inquiry_outbox` restaurés avant remise en service. Les tâches non terminées pourront reprendre avec le worker ; garder le worker arrêté pendant l'exercice isolé pour éviter des notifications réelles. Les images restent en administration et ne sont pas jointes à l'e-mail.
8. Pointer l'application vers ce nouveau dossier puis redémarrer la version compatible retenue. Conserver le dossier précédent jusqu'à la validation du fonctionnement.

## Compatibilité et preuve locale

`initializeInquiries(db)` ajoute `inquiry_briefs` et `inquiry_attachments` sans réécrire les tables historiques. Une sauvegarde antérieure sans ces deux tables reste restaurable. Après initialisation, les anciennes demandes gardent leurs noms indivisibles, messages, instantanés et notifications ; aucune réponse de brief ni image n'est inventée pour elles.

Les tests utilisent uniquement des répertoires temporaires et la connexion explicite de leur fixture ; ils n'ouvrent aucune base réelle dans `.data/` et n'envoient aucun message.

```sh
node --test tests/backup.test.mjs
```

Les six tests couvrent une restauration dans un nouveau dossier privé de briefs, deux images PNG/WebP avec octets, tailles, SHA-256 et rattachement intacts, l'outbox, les fichiers historiques et la corbeille. L'instantané reste identique après modification et suppression de données vivantes. Ils couvrent aussi une ancienne base sans les tables V2, les refus d'orphelin, de symlink, de destination publique, d'imbrication et de taille incohérente. Ce résultat est local ; aucun exercice de restauration sur l'hébergement réel n'a été réalisé pour ce lot.
