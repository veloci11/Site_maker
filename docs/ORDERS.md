# Dossiers, tarifs et administration

Le site permet de préparer et d’enregistrer un **dossier de projet**, sans présenter cette action comme un achat confirmé. Les tarifs initiaux sont `null`. Le paiement externe est désactivé dans cette version, même si un administrateur renseigne les montants. Aucun prestataire de paiement ni envoi de facture n’est simulé.

## Montage et interfaces

`createOrdersRouter({ requireAuth })`, depuis `server/orders.mjs`, se monte à `/api` après `optionalAuth`, le parseur JSON et `csrfProtection`. Les sous-routes `/admin` appliquent en plus `requireAdmin` ; la lecture générale des projets reste réservée au propriétaire. Les accès opérateur passent par des routes d’administration explicites.

Le catalogue public et le calculateur serveur doivent utiliser `getPricing()` et `quoteConfiguration(configuration, getPricing())`. `getPaymentAvailability()` renvoie `{ enabled:false, reason }`. Les tarifs sont stockés dans `studio_settings` au sein du même stockage privé SQLite que les comptes ; il n’y a pas de prix faisant autorité côté navigateur. La lecture fusionne les anciens tarifs avec les clés désormais disponibles : `deployment` et `maintenance-monthly` restent `null` si non configurés, et les montants existants sont préservés sans réécriture du document stocké.

| Route | Autorisation et résultat |
| --- | --- |
| `GET /api/projects/:projectId/order` | Propriétaire : `{order,quote,isCurrent,payment}`. `quote` est recalculé à partir de la configuration actuelle. |
| `PUT /api/projects/:projectId/order` | Propriétaire : `{billing}` seulement. Valide les coordonnées et enregistre un brouillon. Rejette les champs de prix, état ou identité du propriétaire. |
| `POST /api/projects/:projectId/checkout` | Propriétaire : `{orderId}`. Prix inconnus/Sur mesure → `409 PRICE_UNAVAILABLE`. Dossier absent/périmé → `409 ORDER_STALE`. Prix connus et dossier actuel → `503 PAYMENT_UNAVAILABLE`. Jamais de passage à `paid`. |
| `GET /api/admin/projects` | Administrateur : les 200 projets modifiés les plus récents, avec nom/e-mail du client. |
| `GET /api/admin/projects/:projectId` | Administrateur : projet, client (sans secret), activité, textes, fichiers actifs, dossier actuel et jusqu’à 30 dossiers historiques. |
| `GET/PUT /api/admin/pricing` | Administrateur : tarifs versionnés. PUT exige `currency`, `base`, `options`, pas de version fournie par le client. |
| `GET /api/admin/inquiries` | Administrateur : les 200 demandes les plus récentes, état `new` ou `reviewed`. |
| `PATCH /api/admin/inquiries/:id` | Administrateur : `{status:'new'|'reviewed'}`. Marquer une demande comme traitée n’envoie pas d’e-mail. |

`Order` contient `id`, `projectId`, `status`, `snapshot:{projectName,configuration,quote}`, `billing`, `totalCents`, `monthlyTotalCents`, `currency`, `createdAt`, `updatedAt`. Les montants sont des entiers en centimes, ou `null`. `totalCents` désigne la création ponctuelle uniquement ; `monthlyTotalCents` est dérivé du devis enregistré. `isCurrent` compare l’instantané au projet et à la version de tarifs actuels.

`billing` contient `fullName,email,address,postalCode,city,country` obligatoires et `company,vatNumber` facultatifs. Le pays est un code de deux lettres. Tous les champs sont du texte borné ; aucun HTML n’est exécuté.

## Instantanés et tarifs

Un brouillon conserve sa configuration, ses lignes, sa version de tarifs et ses montants ponctuels et mensuels. Sauvegarder uniquement de nouvelles coordonnées peut mettre à jour `billing` du même brouillon. Une modification du nom du projet, des options ou des tarifs crée un nouveau brouillon et marque l’ancien `superseded`, sans réécrire son instantané ni ses montants. Le contrôle et l’écriture sont synchrones et transactionnels. Un tarif inclus dans un forfait n’est jamais additionné une seconde fois. Les anciens instantanés sans les deux nouvelles sélections, ni cadence de ligne, ni total mensuel, sont comparés avec leurs valeurs implicites (false, once, 0) ; leur contenu stocké reste identique, même après une sauvegarde portant seulement sur les coordonnées.

Les tarifs administrables sont EUR ou CHF. Chaque montant doit être `null` ou un entier entre 0 et 1 000 000 000 centimes. Le forfait Sur mesure reste `null` et sur devis. Un champ vide dans l’écran des tarifs conserve un montant inconnu, et non zéro. La fiscalité, les conditions commerciales et les prix restent à valider avant l’ouverture des commandes ; la saisie d’un tarif ne valide aucun de ces points.

`Configuration.deployment` ajoute, si sélectionné, la ligne `deployment` avec `billing:'once'`. `Configuration.maintenance` ajoute `maintenance-monthly` avec `billing:'monthly'`. Les deux champs sont facultatifs à l’entrée, faux par défaut, et indépendants. `Quote.totalCents` exclut toutes les lignes mensuelles, même si leur montant est inconnu. `Quote.monthlyTotalCents` vaut 0 sans sélection mensuelle, null si un montant mensuel sélectionné manque. Un prix mensuel inconnu bloque `checkoutReady` tout en conservant l’affichage du prix ponctuel connu. L’interface présente la maintenance avec « / mois », séparément de la création et de la mise en ligne ponctuelles. Le périmètre commercial de la maintenance reste à arrêter avant sa vente ; sa sélection n’active aucun abonnement ou prélèvement.

## Créer le premier administrateur

Aucun compte administrateur par défaut et aucune route publique de création de rôle. Dans un terminal de l’opérateur, avec le même `DATA_DIR` privé que le serveur :

```sh
node scripts/create-admin.mjs --email votre-adresse@domaine.fr --name "Votre nom"
```

Le mot de passe est demandé deux fois avec saisie masquée, minimum 12 caractères. **Ne pas passer le mot de passe en argument de commande.** Le script refuse `--password`. Pour l’automatisation opérateur, `STUDIO_ADMIN_PASSWORD` peut être injecté par un gestionnaire de secrets dans l’environnement du processus ; cette valeur n’est jamais affichée et est retirée de `process.env` après lecture. Ne pas placer cette variable dans un fichier versionné ni dans une commande gardée dans l’historique. Un e-mail déjà existant est refusé, sans promouvoir ni remplacer le compte concerné.

## Écrans et actions

- `/commande/:projectId` et `/espace/commande` : sélection lisible, coordonnées et « Enregistrer le dossier ». La préparation des contenus reste accessible même quand le paiement est fermé.
- `/admin` : recherche d’un projet/client ; consultation activité/textes/fichiers/dossiers ; messages avec pièces jointes et réponse réelle dans le projet ; publication d’une version HTTPS ou d’un fichier privé, dont ajout direct d’une image/PDF ; suivi des retours et validations ; demandes de contact ; tarifs.
- La validation d’une maquette appartient au client, jamais à l’administrateur. L’écran utilise les routes sécurisées du module `collaboration.mjs`, et celles de `files.mjs` pour l’ajout privé.
- Les liens `mailto:` ouvrent l’application de messagerie de l’opérateur. Aucun message externe n’est automatiquement envoyé.

## Vérification

`node --test tests/catalog.test.mjs tests/orders.test.mjs` : contrôles HTTP propriétaire/second compte/admin, facturation et entrées falsifiées, persistance et compatibilité des tarifs, calcul serveur avec séparation ponctuel/mensuel, instantanés historiques inchangés, refus de paiement, demandes de contact, origine étrangère rejetée, création administrateur explicite et sans mot de passe exposé. Les tests utilisent des identités injectées uniquement dans leur application isolée ; l’application réelle utilise les sessions du module d’authentification. Les tests d’intégration globale couvrent ces sessions réelles.

## Limites explicites de cette version

Pas de connexion à un acquéreur, de webhook de paiement, d’abonnement, de remboursement, de calcul fiscal, de génération légale de facture ou d’e-mail transactionnel externe. Avant de les ajouter, garder le montant et l’identité de commande calculés sur le serveur, valider les événements du prestataire et l’idempotence, approuver les paramètres commerciaux et tester avec le mode bac à sable du prestataire. Un hébergement de fichiers statiques seul ne peut pas exécuter cette API ni conserver les dossiers.
