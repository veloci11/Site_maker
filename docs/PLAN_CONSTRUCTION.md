# Plan de construction après les maquettes

Projet : studio, nom provisoire. Dépôt prévu : https://github.com/veloci11/Site_maker.

Ce document prépare la phase suivante. La phase actuelle reste la conception en images. Aucun site fonctionnel, compte, dépôt de fichier réel, paiement ou déploiement n'est créé par les maquettes.

## Parcours retenu

Découverte des formules et des exemples → configuration du site et des options → sauvegarde dans un compte → vérification de la commande → paiement → préparation des contenus dans l’espace client → échanges → examen de la maquette et retours → validation → mise en ligne.

Le client peut consulter et configurer avant de créer un compte. Les choix doivent survivre à l’inscription et à la connexion. Il peut reprendre un projet enregistré, compléter ses contenus et envoyer des fichiers en plusieurs fois.

Sur mesure suit une demande de projet et un devis, avec reprise du dossier dans l’espace client. Aucun prix automatique ne doit faire croire que des fonctions particulières sont comprises dans une formule standard.

## Écrans et fonctions

Public : accueil avec quatre cartes sans vignettes, menus Formules/Exemples, comparaison, fiches Vitrine/Connecté/Immersif 3D/Sur mesure, exemples dans les fiches, méthode, FAQ et contact. La charte n’apparaît jamais dans le site.

Configuration : aperçu de rendu, formule, langues, gestion du site après mise en ligne et élément 3D ; prix ajouté visible pour chaque option et total calculé. Les montants restent à décider. Un catalogue partagé doit alimenter les fiches, le configurateur et la commande pour éviter des prix ou inclusions divergents.

Compte : inscription, connexion, récupération du mot de passe, informations du compte et déconnexion. Vérifier l'identité de session et les droits côté serveur, pas seulement masquer les liens.

Espace client : vue d’ensemble, activité, textes par page, photos/logo/documents, messages et pièces jointes, versions de maquettes, retours et validation, commande/documents. Distinguer l’espace client inclus du système de gestion des textes et images du site livré, qui dépend de la formule/options.

## Charte et composants

Appliquer [CHARTE_INTERFACE.md](./CHARTE_INTERFACE.md) : Geist Sans unique, tailles et tokens partagés, mêmes composants publics et privés, shadcn/ui quand adapté, Lucide pour les icônes. Les styles de sites montrés en exemple restent limités aux aperçus.

Les cartes de prix reprennent le survol validé par Mathis : grain, composition colorée propre à chaque carte et texte lisible. Les couleurs évoluent doucement dans toute la carte sans déplacer le contenu ; texte et coches blancs, bouton noir. Les cartes n’affichent aucune description sous le nom ni « Selon les options choisies ». Prévoir les variantes clavier, tactile et réduction des animations. Les images ne constituent pas une implémentation de l’effet.

## Données et accès

Objets : utilisateur, projet, version de configuration, catalogue de formules/options, informations du projet, contenus par page, fichier, message, version de maquette, retour, validation et commande. Les choix et prix d’une commande doivent être figés dans leur version pour que les changements ultérieurs du catalogue ne modifient pas une commande existante.

Chaque projet appartient à un client ; les lectures et modifications sont filtrées et autorisées côté serveur. Les fichiers client sont privés, rattachés au projet et servis par accès temporaire contrôlé. Les fichiers ne sont pas publiés dans Git. Les exemples publics sont distincts des maquettes privées.

Le traitement des commandes et les échanges demandent aussi une vue d’administration interne. Elle devra permettre de consulter les contenus autorisés, répondre, déposer une version de maquette et suivre les demandes, sans donner au client accès aux autres dossiers.

## Dix rôles spécialisés demandés

Lancement pendant la phase de construction, après finalisation du plan et des maquettes. Les rôles sont exécutés par vagues selon la capacité des outils ; ne pas annoncer dix agents simultanés si cette capacité n’existe pas.

| Rôle | Responsabilité principale |
|---|---|
| 1. Architecture | Structure du projet, modèle de données, contrats et intégration générale |
| 2. Design system | Geist, tokens, shadcn/ui, composants partagés et survols animés |
| 3. Pages publiques | Accueil, offres, menus, exemples, méthode, FAQ et responsive |
| 4. Configurateur | Catalogue de choix, dépendances, calcul, sauvegarde et reprise |
| 5. Authentification | Comptes, sessions, récupération et permissions de projet |
| 6. Contenus et fichiers | Activité, textes, bibliothèque, dépôt et accès aux fichiers privés |
| 7. Échanges et validation | Messages, pièces jointes, versions, commentaires et validation |
| 8. Commandes et administration | Récapitulatif, facturation, raccord de paiement et suivi interne |
| 9. Vérification | Parcours de débutant, clavier, mobile, erreurs, droits et tests utiles |
| 10. Intégration et livraison | Cohérence des branches, performances, build, configuration et documentation |

Séquence : établir les contrats et composants communs ; développer des blocs indépendants ; intégrer progressivement ; vérifier les parcours complets ; préparer la livraison. Un agent supervise la cohérence, les dépendances, la charte et les modifications concurrentes.

## Décisions à arrêter pour une commande réelle

Les prix de base/options, monnaie, taxes applicables, contenu exact des formules, conditions commerciales, hébergement/maintenance, prestataire de paiement et prestataires de données/fichiers ne sont pas validés. Ils devront être concrètement configurés avant l’ouverture de commandes payantes. Les maquettes utilisent des espaces réservés et ne simulent pas une vente réelle.

## Vérification de la future version

Vérifier notamment : parcours public sans connexion ; inscription sans perte des options ; reprise d'un brouillon ; dépôt et suppression récupérable d'un fichier ; séparation de deux comptes clients ; messages et pièces jointes privés ; consultation d’une maquette sur ordinateur et mobile ; demande de retour distincte d’une validation ; cohérence prix/commande ; erreurs de paiement sans fausse confirmation ; focus et contrastes ; absence de police ou de variante de composant ajoutée sans raison.
