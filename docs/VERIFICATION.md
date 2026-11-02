# Vérification croisée de l’application — 1 novembre 2026

Cette vérification porte sur l’API Express réellement composée par `createApp()`, les sessions serveur et les interactions entre domaines. Elle complète les tests isolés des modules. Le contrôle visuel et les parcours dans le navigateur restent à la charge de l’intégration finale ; ce document ne remplace pas `design-qa.md`.

## État final intégré

`npm run check` passe avec **80 tests réussis**, TypeScript et build de production ; journal : `docs/qa/check-final.txt`. Les parcours navigateur finaux, les captures desktop/mobile et les comparaisons visuelles figurent dans `design-qa.md`. Les transitions circulaires, le préchargement au survol et les révélations masquant le contenu mentionnés dans les passes historiques ci-dessous ont été supprimés. Le fond actuel est statique, en CSS avec grain procédural ; les cartes approuvées conservent uniquement leur fondu rapide.

Le parcours final de conflit de textes a aussi été vérifié dans le navigateur : deux sessions modifient la même page, la seconde reçoit le conflit, son brouillon reste visible et le remplacement demande un choix explicite. Le chargement d’un projet inexistant affiche une erreur avec nouvel essai. Ces résultats portent sur la version locale, pas sur un hébergement public.

## Nouvelle passe — forfaits directs et services ponctuels/mensuels

La seconde passe accompagne les routes `/forfaits/:slug`, le configurateur direct à aperçu fixe et options à droite, les liens de cartes entières et les transitions de page. Elle vérifie surtout que cette refonte n’altère pas les sélections sauvegardées, les dossiers antérieurs ou la distinction entre création et maintenance.

### Preuves exécutées après la refonte

- `node --test tests/integration.test.mjs tests/draft.test.mjs tests/catalog.test.mjs tests/orders.test.mjs` : **27/27 tests réussis**.
- `node --test tests/integration.test.mjs` : **8/8 réussis** après ajout du contrôle API de maintenance à prix inconnu.
- `npm run typecheck` : réussi après le correctif du changement de forfait pendant une édition.

Les trois nouveaux tests intégrés utilisent toujours de vraies sessions sur `createApp()` et une base temporaire privée. Ils ne modifient ni les tarifs de développement ni un projet réel.

| Parcours ajouté | Résultat |
|---|---|
| Création et modification de projet avec `deployment`/`maintenance` | Booléens sauvegardés et conservés après reconnexion SQLite. Une mutation par un autre client reste refusée. Chaîne, nombre et null sont rejetés sans écraser une sélection valide. |
| Maintenance sélectionnée à prix inconnu | Le prix de création connu reste visible ; le montant mensuel est null et `checkoutReady` reste false. |
| Devis ponctuel/mensuel | Connecté + déploiement : 175 000 centimes ponctuels ; maintenance : 5 000 centimes mensuels séparés dans le scénario temporaire. Le CMS inclus n’est pas facturé deux fois. Ces montants sont exclusivement des données de test. |
| Instantanés et changement du tarif mensuel | Le dossier enregistré garde sa maintenance à 5 000 centimes ; le devis courant affiche 8 000. Réenregistrer crée un nouvel instantané sans réécrire les octets du précédent. |
| Désélection de la maintenance | Le devis courant passe à zéro mensuel, conserve le montant ponctuel et laisse l’ancien dossier inchangé tant que le client ne réenregistre pas. |
| Anciens tarifs et dossiers | Les options nouvelles manquantes sont interprétées comme inconnues/non sélectionnées. Un dossier historique sans `billing` par ligne ni total mensuel reste courant ; modifier seulement les coordonnées conserve son identifiant et les octets de son instantané. |
| Paiement | Les prix de test complets, les nouveaux services et les dossiers historiques ne permettent toujours pas de produire un achat ou un statut payé. |

### Défaut corrigé pendant cette passe

**Changer de forfait pendant l’édition rechargeait l’ancien projet.** Le composant de transition remonte la page lorsque son chemin change. Le sélecteur de forfait naviguait alors vers un nouveau chemin ; le chargement du projet sauvegardé écrasait les choix non enregistrés, y compris la langue et les options. En édition d’un projet existant, le sélecteur change désormais l’état local et ferme le dialogue sans naviguer. Le bouton d’enregistrement sauvegarde ensuite cette sélection. Pour un nouveau projet, la navigation vers l’URL du forfait choisi est conservée.

Ce correctif est vérifié par lecture du cycle de montage et TypeScript. Sa confirmation dans le navigateur appartient à la vérification finale de la racine.

### Relecture des interactions côté code

- Cartes : un seul lien natif couvre la carte, sans bouton interactif imbriqué. Les clics avec modificateurs gardent leurs comportements habituels ; le clavier dispose d’une origine de transition calculée depuis la carte.
- Transition circulaire : navigation normale si le navigateur ne fournit pas View Transitions ou si l’utilisateur demande moins de mouvement ; préparation des modules et garde contre une navigation asynchrone devenue obsolète.
- Entrées de contenu : visibilité immédiate avec réduction du mouvement ou absence d’IntersectionObserver ; révélation au focus pour les éléments interactifs.
- Navigation : liens directs vers les forfaits dans le menu ; le configurateur standard n’exige plus de passer par les onglets d’une fiche.

Cette relecture ne valide pas la fidélité visuelle, les performances de l’animation ni l’ergonomie effective du format mobile. Les captures et les parcours CUA de la racine restent nécessaires. La suite globale n’a pas été relancée pendant cette passe : l’intégration finale exécute `npm run check` après toutes les modifications.

## Preuves de la première passe

- `node --test tests/integration.test.mjs` : **5/5 tests réussis**.
- `npm test` : **59/59 tests réussis** lors de la première passe (incluant alors cinq tests intégrés). Ce nombre est historique ; les ajouts ultérieurs augmentent la suite.
- `npm run typecheck` : réussi, y compris après les corrections des états de validation.
- `node --test tests/files.test.mjs tests/integration.test.mjs` : **13/13 réussis** après le correctif des répertoires cachés.

Les tests utilisent un répertoire temporaire privé supprimé à la fin, deux comptes clients et un administrateur créés explicitement. Ils passent par les véritables cookies de session ; aucun en-tête d’identité de test n’est injecté. Aucune donnée, aucun e-mail et aucun paiement ne sont envoyés à un tiers.

## Parcours vérifiés sur l’application composée

| Surface | Contrôle et résultat |
|---|---|
| Avant connexion | Catalogue et calcul de prix accessibles, valeurs initiales inconnues, `paymentAvailable:false`, cache désactivé. |
| Demande de contact | Formulaire anonyme enregistré avant les routeurs protégés ; une origine étrangère est refusée avant écriture. La réponse ne prétend pas envoyer un e-mail. |
| Comptes | Inscription et connexion réelles ; rôle client imposé malgré un champ `role:'admin'` forgé ; cookie HttpOnly/SameSite ; accès administrateur refusé au client. |
| Projet et textes | Création, normalisation des capacités incluses, contenu sauvegardé ; le deuxième client reçoit 404 sur un contenu étranger. |
| Fichiers | Téléversement multipart via le vrai montage, aperçu et téléchargement privés identiques aux octets d’origine ; un autre client ne peut pas ouvrir l’aperçu. Le répertoire de données se trouve explicitement sous un dossier caché `.private-data`, comme `.data` en développement. Corbeille et restauration fonctionnent. |
| Administration | Accès explicite aux contenus et fichiers d’un projet ; la demande anonyme apparaît dans les demandes privées. |
| Messages | Auteur pris dans la session, pièce jointe privée associée au bon projet ; réponse du studio authentifiée. |
| Maquettes | Publication réservée au studio ; retour sans accord ; nouvelles versions attribuées côté serveur. Une ancienne version ne peut plus être validée. L’administrateur ne signe pas pour le client. |
| Accord | Confirmation explicite, accord client enregistré, répétition idempotente, état du projet `approved`. |
| Dossier | Coordonnées persistées avec instantané de configuration et de prix ; aucune commande payée créée lorsque les prix sont incomplets. |
| Changement de tarifs | Un dossier antérieur conserve son montant inconnu ; le nouveau calcul serveur devient disponible sans réécrire cet instantané. Un dossier périmé est refusé au checkout. |
| Paiement | Même avec des prix de test complets, le serveur renvoie `PAYMENT_UNAVAILABLE`. Le nombre de commandes `paid` reste zéro. |
| Persistance | Après fermeture/réouverture SQLite, session, dossier courant et ancien instantané restent disponibles. |
| Erreurs | Une route API inconnue renvoie JSON 404 à un utilisateur connecté, sans tomber dans le HTML de l’application. |

## Défauts d’état identifiés et traités

1. **Réponse d’un ancien compte dans `ProjectProvider`** : une requête tardive pouvait écraser les projets d’une nouvelle session et provoquer un chargement permanent. La racine a ajouté une garde sur l’identité et la séquence de requête. Relecture ciblée effectuée ; les réponses, erreurs et fins de chargement obsolètes sont ignorées.
2. **Accord sans actualisation du projet partagé** : l’écran Maquettes actualisait sa version, mais le tableau de bord pouvait encore proposer de relire celle-ci. Après l’accord persisté, la page demande maintenant l’actualisation du contexte partagé.
3. **Prochaine étape après accord** : le tableau de bord pouvait redemander des contenus malgré le statut `approved`. Ce statut affiche désormais « Votre site est validé. » et renvoie vers les messages, sans inventer une date de mise en ligne.
4. **Changement de dossier pendant une sauvegarde** : signalé au spécialiste commandes, qui a ajouté une clé de montage sur `OrderEditor` pour chaque projet. Les éléments `main` imbriqués ont aussi été remplacés par des sections. Vérification visuelle finale confiée à la racine.
5. **Aperçus privés sous `.data`** : la vérification navigateur de la racine a révélé que la politique `dotfiles` d’Express rejetait les fichiers dès qu’un dossier ancêtre était caché. Les envois de fichiers ciblés et authentifiés autorisent maintenant explicitement ces chemins. La régression intégrée utilise `temp/.private-data` et vérifie les statuts 200 et les octets de l’aperçu ainsi que du téléchargement ; l’autre client reste refusé avec 404. Le correctif était déjà appliqué au lancement de ce test enrichi.

Les deux corrections des écrans Maquettes/tableau de bord ont été vérifiées par TypeScript ; le navigateur final doit confirmer le parcours et la présentation.

## Limites connues

- Les tarifs, leur fiscalité, les conditions commerciales et l’identité légale ne sont pas approuvés. Les prix de test sont confinés à la base temporaire et ne fixent pas les prix du studio.
- Le paiement est volontairement indisponible ; aucun prestataire de paiement n’est raccordé.
- Aucun transport transactionnel externe d’e-mail n’est configuré. Le mécanisme de récupération local est testé séparément dans `auth.test.mjs`.
- La suite ne mesure pas la charge en production, la délivrabilité des e-mails ou les sauvegardes de l’hébergeur.
- L’accessibilité et la qualité visuelle nécessitent les contrôles navigateur desktop/mobile de l’intégration finale.

## Commandes de reproduction

```sh
node --test tests/integration.test.mjs
npm run typecheck
npm test
```

Les tests ne réutilisent pas la base de développement et ne touchent pas les fichiers clients du projet.
