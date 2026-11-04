# Relecture croisée — phase 2

Les cinq avis A–E ont été lus. Anonymisation des contributions, pas aveugle total puisque chacun peut reconnaître son texte. Aucun avis initial modifié, aucun patch ou nouveau contrôle navigateur.

## Meilleure objection à ma proposition

Les comptages de C montrent déjà 14 à 17 questions sur plusieurs parcours, avec huit à dix textes longs. Cumuler toutes les questions proposées dans A ferait payer au visiteur le travail de cadrage du développeur. La pertinence ne se mesure pas au nombre de champs. La répétition réservations/droits/données devient également probable si l’on ajoute mes questions générales sans examiner le scénario existant.

Je retire donc du lot prioritaire mes ajouts distincts sur les coordonnées de contact, les restrictions d’accès et la sauvegarde. Les premiers sont recouvrables par activité/pages ; les restrictions sont déjà demandées ; la sauvegarde peut être précisée lors de la reprise. Ils restent des sujets d’entretien, pas des obligations supplémentaires.

## Ce que je conserve et adopte

**Lien :** convergence justifiée des cinq avis. Lien facultatif immédiatement disponible dans « Vos fichiers », aussi utile pour un petit PDF que pour un transfert dépassant 20 Mio. Description/expiration connue facultatives, sans mot de passe ni téléchargement automatique. Conserver les protections des images. Le lien est une référence privée, pas une pièce jointe dont le studio garantit déjà la réception ou la validité. Tests JSON/multipart, idempotence, administration et restauration indispensables (A, E).

**Questions :** adopter la reformulation métier de `dataFields` de B/E, le volume estimé et les références visuelles Connecté. Adopter C/D pour rendre les précisions du modèle 3D et les détails SEO facultatifs ; conserver le besoin, l’objet et la disponibilité du modèle. Quantité d’objets/scènes facultative. Pour Évolution, préférer enrichir `requestedChanges` avec situation actuelle/résultat attendu (C), plutôt qu’ajouter simultanément mon sélecteur de défaut et une seconde rédaction. Budget facultatif limité aux prestations sur devis (B/C), sans fourchettes de prix fabriquées dans le formulaire.

**Sur mesure :** D relève une meilleure objection fonctionnelle : l’offre n’est pas nécessairement une application métier. Accepter la branche « Le site doit-il enregistrer ou gérer des informations ? » puis des détails facultatifs si Oui ; garder scénario, acteurs et priorité de lancement. Ne pas imposer une modélisation de données à un site créatif.

## Compromis historique et validation

Changer `dataFields` en champ conditionnel ne nécessite pas de nouvelle version SQLite ni de réécriture des snapshots. En revanche, le résumé historique ne doit plus dépendre de `validateBrief` courant et de ses conditions : une ancienne réponse `dataFields` doit rester affichée même sans le nouveau parent. Lire les réponses stockées, conserver les identifiants/libellés historiques et rendre leurs valeurs comme texte échappé ; les nouvelles soumissions seules suivent les nouvelles conditions. Le message archivé fournit aussi un repli vérifiable.

Même séparation pour l’incertitude exclusive : corriger l’UI et rejeter les combinaisons contradictoires dans les nouveaux POST, mais afficher intégralement une ancienne combinaison. « Accès à récupérer » peut coexister avec certains accès disponibles (C) ; ne pas l’assimiler à « Je ne sais pas ». Aucun nettoyage silencieux d’anciens dossiers.

## Confiance et priorités finales

Priorité : lien complet → blocages techniques → historique → questions ciblées → accueil. Corriger l’étape nom/e-mail devenue inexacte (B/C/D), annoncer l’aide au choix déjà validée en FAQ et un besoin examiné avant démarrage. Je rejette faux avis, rabais moyen national, livraison d’e-mail garantie et accumulation de badges génériques. L’e-mail reste non configuré ; le corps des demandes est effectivement enregistré.

L’arbitrage suit les preuves, le coût des questions et les scénarios réels, pas un vote des cinq contributions. Pas de vérification d’exécution pendant cette relecture.
