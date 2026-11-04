# Analyse indépendante — phase 1

Relecture indépendante du 3 novembre 2026 ; trois sources primaires lues dans l’IAB. Aucune soumission ou modification applicative.

## Constats et arbitrage proposé

1. **Immersif : détail technique bloquant.** `shared/brief.ts:202` rend obligatoires format, poids, textures et animations dès qu’un modèle existe ou est en préparation. Le client peut connaître son besoin sans disposer de ces informations. Rendre `modelDetails` facultatif, conserver la question sur la disponibilité du modèle et accepter une référence visuelle. Le développeur vérifiera ensuite le fichier ; le questionnaire ne doit pas demander au client de certifier sa compatibilité.
2. **Sur mesure suppose une application métier.** `shared/brief.ts:252` impose `dataFields`, alors que l’offre peut aussi concerner une expérience créative. Ajouter une petite branche « informations à gérer » ; garder les détails seulement si la réponse le justifie. Appliquer cette logique au Connecté sans supprimer ses questions sur les utilisateurs et leurs actions.
3. **Refonte déjà substantielle.** Les problèmes, éléments à conserver, accès, contenus, URL, SEO, reprises de données et continuité existent (`shared/brief.ts:288–350`). Il faut préciser les transformations et les priorités, sans refaire ces questions avec d’autres mots. Le changement éventuel d’adresse principale et le responsable de validation restent absents.
4. **Évolution : le changement est demandé, sa priorité moins bien.** `requestedChanges` existe à la ligne 269, mais ne distingue pas réparation urgente et amélioration future. Ajouter un résultat prioritaire et une contrainte de disponibilité, facultatifs. Ne pas imposer toute la partie migration d’une Refonte à une simple modification.
5. **Fichiers : les usages dépassent les images.** `ProjectBriefForm.tsx:472–508` ne permet que six images et 20 Mio. Un modèle 3D, une vidéo ou un dossier de contenus ne peut pas y entrer. Conserver cette limite ; proposer un lien facultatif dans une rubrique « Vos fichiers », visible même sans image. Afficher le lien sans attendre une erreur de taille.

## Questions précises à retenir

| Contexte | Question et aide | Type / obligation / condition |
|---|---|---|
| Tous | **« Un dossier ou des fichiers à partager ? »** Aide : « Collez un lien WeTransfer, SwissTransfer ou un lien de téléchargement, notamment pour une vidéo, un modèle 3D ou des fichiers dépassant 20 Mio. » | URL facultative, jamais requise en plus des images. |
| Tous | **« Une précision sur ces fichiers ? »** Aide : « Contenu du dossier, fichier à regarder en premier, date d’expiration connue. N’indiquez aucun mot de passe. » | Texte facultatif, si lien renseigné ; ne pas créer une date obligatoire. |
| Immersif | **« Combien d’objets ou de scènes souhaitez-vous présenter ? »** Aide : « Une estimation suffit, ou indiquez ce qui reste à définir. » | Texte facultatif. Important pour distinguer une intégration simple d’un univers complet. |
| Immersif | **« Quel résultat visuel vous plaît ? »** Aide : « Un lien et ce que vous appréciez : rendu réaliste, style illustré, mouvement… » | Réutiliser `references`, déjà facultatif, près de l’expérience souhaitée ; ne pas dupliquer. |
| Sur mesure | **« Le site doit-il enregistrer ou gérer des informations ? »** | Choix facultatif : Oui / Non / À définir ensemble. `dataFields` visible si Oui ; facultatif dans un premier contact. |
| Sur mesure | **« Quel résultat doit absolument être possible au lancement ? »** | Reformulation du `priorities` existant, requis, réponse courte acceptée ; éviter une deuxième liste équivalente. |
| Refonte | **« Souhaitez-vous conserver l’adresse principale du site ? »** | Choix facultatif : Oui / Non / À définir ensemble. Si Non, texte facultatif « Quelle nouvelle adresse envisagez-vous ? ». |
| Refonte / Évolution | **« Quel changement est prioritaire pour vous ? »** | Texte facultatif, en complément de la description détaillée ; ne pas rendre une priorité artificielle obligatoire. |
| Évolution | **« Y a-t-il une période ou une fonction à ne pas interrompre ? »** | Texte facultatif, exemples : réservation, commandes, campagne en cours. Refonte possède déjà `continuity`. |
| Projets hors contact général | **« Qui validera les choix et les contenus du site ? »** | Texte facultatif : une personne ou une équipe suffit, sans nouvelles coordonnées de tiers. |

Ne pas imposer polygones, moteur 3D, base de données ou architecture. Les accès restent des disponibilités déclarées ; aucun secret. Un modèle à créer ne sélectionne jamais silencieusement l’option de modélisation.

## Accueil : une confiance démontrée par le parcours

Le texte actuel décrit bien le service (`public/index.tsx:153–160`). Son étape 2 ne correspond plus au formulaire : elle annonce seulement nom et e-mail, alors que quatre coordonnées sont requises (213–214). Remplacer par **« Décrivez votre projet »** / **« Partagez votre besoin, vos contenus disponibles et vos coordonnées. »**

Proposition courte sous le hero : **« Vous choisissez les fonctions utiles. Nous vous aidons à préciser le projet avant de commencer. »**

Deux preuves sobres à proximité des étapes : **« Le bon forfait pour votre besoin »** — « Notre équipe vérifie votre demande et vous réoriente si nécessaire. » ; **« Des choix expliqués »** — « Vous voyez ce que comprend le forfait et choisissez les fonctions à ajouter. » Pas de faux témoignages, de délai, de certification ou de livraison incluse inventés.

## Sources et limites

- [model-viewer, documentation](https://modelviewer.dev/docs/) : formats glTF/GLB, image d’attente, descriptions accessibles, gestion des erreurs et adaptation de résolution. Justifie de recueillir le résultat et les supports, puis de laisser la vérification technique à l’équipe ; n’impose pas cette bibliothèque.
- [Google, migration des sites](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes?hl=fr) : cartographie des anciennes/nouvelles URL, redirections et planification des changements. Justifie les questions sur l’adresse et la continuité, sans promettre de classement.
- [Infomaniak, SwissTransfer](https://www.infomaniak.com/fr/swisstransfer) : liens temporaires et plusieurs offres/durées existent. Ne pas figer leur capacité ni leur durée dans notre formulaire ; demander un lien encore disponible. Aucun transfert créé.

Priorité : lien externe, blocages techniques, reprise, accompagnement. Aucune étude quantitative ni recommandation tarifaire ici.
