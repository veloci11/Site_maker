# Revue critique des textes et du parcours

Périmètre : pages publiques et configurateur, après la demande de réduire les textes décoratifs. Relecture du code actuel et des captures partagées `docs/qa/home-v2-desktop.jpg` et `docs/qa/configurator-v2-options-full.jpg`. Ces captures précèdent cette passe ; elles expliquent les répétitions constatées, mais ne valident pas le rendu final. La racine conserve le navigateur, les nouvelles captures et la vérification visuelle.

## Corrections appliquées

| Problème | Changement |
|---|---|
| Accroches sans information supplémentaire | Suppression de « À chaque projet, son point de départ », « Ce qui change d’un forfait à l’autre », « Votre site. Vos choix. » et de l’eyebrow qui répétait le titre de l’accueil. |
| Hero trop explicatif | Un titre, une phrase qui dit ce que vend le studio et les deux actions utiles. La réassurance répétée sur l’espace client a été retirée du hero. Le showcase supprimé par la racine n’a pas été réintroduit. |
| Titres vagues | « Comparer les forfaits », « Questions fréquentes », « Exemples de sites », « Options du site », « Contacter le studio ». Les titres des produits sont désormais « Site Vitrine », « Site Connecté » et « Site Immersif 3D ». |
| Intro, kicker et sous-titre répétaient le forfait | Suppression des lignes « Le forfait… » et « Pour… » autour du nom du produit ; une description courte précède les inclusions. |
| Trop de texte avant chaque choix | Groupes nommés directement : Langues, Gestion des contenus, Élément 3D, Mise en ligne, Maintenance. Suppression des introductions répétant les labels et des descriptions évidentes « Une version française » / « Deux langues… ». |
| Fonction incluse annoncée plusieurs fois | Conservation du choix coché/désactivé et du prix « Inclus ». Retrait de la deuxième note « Compris dans votre forfait… » sous ce même choix. |
| Accordéon sans information nouvelle sur le CMS | Supprimé. Le label indique toujours que l’édition concerne le site livré ; un seul bloc distinct explique l’espace client inclus pour préparer le projet. |
| Explications techniques dispersées | Les détails conservés répondent à une question d’achat : périmètre de la 3D, domaine/hébergement, limites du suivi technique. Ils restent repliables. |
| Prix ponctuel et mensuel | Le montant de création et la maintenance « / mois » restent séparés. Aucun tarif, frais, délai ou engagement n’a été ajouté. |
| Crédits répétés sur une fiche d’exemple | Un crédit externe cliquable sous l’aperçu ; le crédit répété dans le pied de fiche a été retiré. Les informations propres à la fenêtre d’agrandissement restent accessibles lorsqu’elle est ouverte. |
| Confirmation de contact maladroite | Le message de réussite dit simplement « Votre demande est enregistrée. » sans faire croire à un e-mail envoyé ni à une réponse déjà préparée. |

Les cartes approuvées n’ont pas été modifiées : composant, styles, fonctions commerciales et trois inclusions conservés. Les données de références, les montants et les mutations de configuration sont conservés. Après coordination, la racine a autorisé les deux corrections de chargement et de devise décrites ci-dessous.

## Boutons, ancres et états relus dans le code

- **Accueil** : `Choisir mon forfait` vise l’unique section `#forfaits`. Les cartes ouvrent leurs routes de forfait. La méthode et le comparatif ont des destinations existantes.
- **Sur mesure** : l’action du hero vise `#projet`, où se trouve le vrai formulaire. Son envoi appelle `/api/inquiries` avec états d’attente, réussite et erreur.
- **Exemples** : agrandissement, lien externe, filtres et navigation vers le forfait sont reliés à des actions. La consultation d’un site de référence reste explicite.
- **FAQ** : recherche et filtres fonctionnels côté code ; l’état vide offre une remise à zéro. Le contact est accessible depuis cet état général.
- **Configurateur** : choix liés à l’état ; les options incluses restent verrouillées ; le détail du récapitulatif est repliable. Enregistrement vers création de compte puis dossier, ou mise à jour du projet existant.
- **Ancres et identifiants** : `#forfaits`, `#projet` et les identifiants du comparatif sont distincts ; aucun `href="#"` sans cible ni bouton décoratif mort n’a été trouvé dans le périmètre.
- **États absents** : les exemples et forfaits inconnus ont un retour vers la liste. Les erreurs de formulaire conservent la saisie. Aucun paiement fictif n’est présenté comme effectué.

Il s’agit d’une vérification des liaisons et handlers dans le code. Le parcours final dans le navigateur doit confirmer le focus, le défilement, les retours visuels et les transitions.

## Corrections coordonnées avec l’intégration

1. **Chargement d’un projet à modifier — corrigé.** Un échec de `/api/projects/:id` laissait une configuration par défaut grisée avec l’erreur en bas. Une garde affiche maintenant le chargement avant tout configurateur, puis une erreur visible et les actions Réessayer / Mes projets / Choisir un forfait. Le chargement réussi est indexé par utilisateur et projet afin d’éviter l’affichage d’un ancien projet au changement d’identifiant. Un compteur `loadAttempt` relance explicitement le GET sans boucle.
2. **Devise du prix encore inconnu — corrigé.** Le configurateur et son dialogue utilisaient littéralement « … € ». Les deux libellés passent désormais par `formatMoney` avec la devise du catalogue, y compris lorsque le prix est inconnu.

Ces deux corrections ont été autorisées explicitement par la racine et passent TypeScript. La confirmation navigateur reste à l’intégration.

## Contrôles visuels restants

- **Après retrait de textes** : contrôler les espacements laissés par les éléments retirés, le début des groupes d’options et les retours à la ligne sur mobile. Aucun style n’a été retouché par cette passe.
- **Visuels de référence actuels** : les données Vitrine/Julie Thiam proviennent du travail de l’autre spécialiste ; les captures réelles et leur cadrage sont vérifiés par la racine. Les captures anciennes mentionnées en tête ne constituent pas une preuve du résultat actuel.
- **Projet inexistant ou inaccessible** : connecté, ouvrir `/configurateur?projet=inexistant`. La page doit présenter l’erreur et les trois actions, sans aperçu ni options d’un autre projet. Réessayer doit relancer une seule requête.

## Limites commerciales conservées

Les cartes restent volontairement épurées. Avant d’ouvrir les commandes payantes, les fiches et le récapitulatif devront refléter un périmètre approuvé : pages, contenus à fournir, retours, prestation 3D, domaine/hébergement et suivi. Cette revue n’a pas inventé ces éléments pour combler des inconnus. Les prix restent à valider et le paiement reste désactivé.

## Validation exécutée

`npm run typecheck` : réussi après les modifications, puis après les corrections coordonnées de chargement et de devise. Aucune nouvelle suite globale ni test de paiement/e-mail externe n’a été lancé. La vérification finale de la racine reste requise pour le rendu et les interactions décrites.
