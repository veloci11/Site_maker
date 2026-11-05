# Avis indépendant 2 — interface, animation et accessibilité

Date : 4 novembre 2026. Revue initiale scellée à partir des sources actuelles, sans lecture des autres avis. Aucun fichier produit changé, aucun navigateur lancé par cet agent, aucune demande envoyée. Les captures IAB du parent doivent compléter les constats visuels ; ce rapport ne prétend pas avoir observé le rendu en production.

## Verdict

L'interface dispose déjà d'animations courtes et cohérentes. La principale amélioration utile est de rendre le budget et ses conditions compréhensibles au moment du choix. Ajouter des animations partout donnerait moins de valeur que préciser les unités, le périmètre et le coût complet.

## Constats prioritaires

1. **P1 — Le parcours n'a pas encore les données qui permettent sa promesse de prix. État de préparation confirmé dans le code ; valeur de production à vérifier.** `shared/catalog.ts:519–548` conserve les prix de base/options à `null` ; `src/pages/configurator/index.tsx:113–117` affiche alors « À partir de… ». Sur l'accueil, `src/pages/public/index.tsx:57–60` fait de même. C'est une décision précommerciale explicitement approuvée, pas un bug de calcul. Il faut approuver un catalogue avant de faire du configurateur un estimateur fiable. Ne pas inventer des chiffres pour combler ce manque.

2. **P1 — Certaines options ne sont pas des unités chiffrables bornées. Limite produit confirmée.** `shared/catalog.ts:420–425` : « Pages supplémentaires », nombre à préciser ensemble ; `shared/catalog.ts:440–452` : volume des contenus et complexité 3D à définir. Or `Configuration` n'enregistre qu'un choix booléen/extra, sans quantité (`shared/catalog.ts:26–35`). Un prix unique par coche ne peut pas rendre fiables à ±10–20 % cinq pages ou cinquante pages. Ajouter des quantités et paliers approuvés, ou indiquer clairement les éléments qui demandent étude, avant toute promesse de précision.

3. **P2 — Le total indique le coût ponctuel et le mensuel, sans coût de première année ni frais externes explicités près du budget. Opportunité produit.** La séparation existe et doit rester (`src/pages/configurator/index.tsx:289–301`, barre mobile `:520–526`). Ajouter un récapitulatif simple : création, options ponctuelles, mensualités choisies, prestataires externes/domaine éventuels, estimation première année sous hypothèses explicites. Ne pas traiter la maintenance comme obligatoire : elle est facultative selon AGENTS.md.

4. **P2 — Le récapitulatif des choix est secondaire au moment d'envoyer. Opportunité de confiance.** Les lignes sont dans un `<details>` fermé dans la colonne de gauche (`src/pages/configurator/index.tsx:330–350`), alors que le formulaire envoie depuis sa colonne (`ProjectBriefForm.tsx:532–535`). Une synthèse courte des prestations et du budget juste avant « Envoyer ma demande », avec « Modifier mes options », réduirait l'incertitude sans créer une étape supplémentaire. Conserver les réponses en revenant aux options, ce que le montage actuel permet.

5. **P2 — Petit texte trop clair : défaut CSS mesurable.** `src/components/inquiries/brief-form.css:10,22` et `src/components/layout/project.css:79` utilisent `#81758c` à 11 px. Contraste calculé avec la formule WCAG sur blanc : **4,32:1**, sous les 4,5:1 requis pour un petit texte normal. Le libellé « Facultatif » est utile à la compréhension ; foncer ce texte est préférable à ajouter un pictogramme. Le reste de l'accessibilité nécessite une vérification clavier/rendu, aucune conformité globale revendiquée.

6. **P2 — La confirmation expose l'état du transport e-mail au client sans lui dire clairement la suite. Texte confirmé, envoi non testé.** `src/pages/configurator/index.tsx:493–499` et `src/components/inquiries/ProjectBriefForm.tsx:382–386` affichent « acceptée par le service d'e-mail » et « livraison non confirmée ». C'est exact mais difficile à interpréter. Garder la distinction entre demande enregistrée et notification, en donnant d'abord la conséquence pratique et l'action éventuelle. Ajouter un délai de réponse seulement après validation opérationnelle ; ne pas le promettre par défaut.

7. **P3 — Il manque surtout un retour visuel local lors du changement de budget, pas une animation d'ambiance. Opportunité à tester.** Les choix mettent à jour le total directement ; la sélection a une transition de bord/fond de 120 ms (`project.css:82–85`), le total dispose de `aria-live` (`configurator/index.tsx:289`). Une brève transition d'opacité sur le montant actualisé et/ou un indicateur textuel discret « + option » suffirait si les tests montrent que le changement passe inaperçu. Ne pas faire défiler les chiffres, bouger les cartes ou retarder les clics. Respecter `prefers-reduced-motion`.

8. **P3 — Les cibles secondaires peuvent être plus confortables sur téléphone. Opportunité ergonomique, pas un échec WCAG établi.** « Changer » a 6 px de marge intérieure verticale et 12 px de texte (`project.css:19`) ; « Mes options » mobile n'a aucune marge intérieure (`project.css:169`). Agrandir leur zone cliquable sans grossir le texte. Confirmer sur capture/toucher avant de présenter cela comme un problème gênant. Vérifier aussi les écrans tablettes bas et la liste de sélection dépliée : le sticky ne se désactive que sous 680 px de haut (`project.css:110–112`) ; masquage non démontré dans cet avis.

## Animations : conserver, améliorer, éviter

- **Conserver** : navigation immédiate et contenu toujours visible (`motion.tsx:11–19`), entrée de page 180 ms (`styles.css:396–398`), accordéons 160 ms (`styles.css:179–183`), comparatif animé 280 ms (`public.css:71–84`), cartes et filtres 300 ms, grain à l'entrée 360 ms (`styles.css:353–376`). Les règles de réduction des animations sont déjà globales (`styles.css:521–524`).
- **Améliorer seulement si utile** : feedback du prix/choix ; transition très courte entre étapes du configurateur pour montrer le changement, sans cacher le contenu ni supprimer la mise au focus du titre (`configurator/index.tsx:190–198`).
- **Éviter/retirer si introduit** : boucles d'ambiance, révélation au scroll avec contenu caché, préchargement bloquant les liens, compteurs de prix qui ralentissent la lecture. Ces effets contrediraient des décisions explicites.

## Ajouter, garder, simplifier

- **Ajouter** : prix de catalogue validés, unités de quantité, fourchette de projet explicite avec inclusions/exclusions, récap budget avant envoi, scénarios réalistes illustrant les forfaits à coût connu.
- **Garder** : textures originales, large carte sélectionnée, total ponctuel/mensuel séparé, accordéons refermables avec résumés, retour aux options qui conserve le brief, liens et champs sémantiques, focus clavier existants.
- **Simplifier** : texte technique de confirmation ; éviter de doubler visuellement l'interface avec un compteur horaire permanent.

## Prix et heures

Conseil : **prix par prestation en premier, heures de travail comme détail explicatif facultatif**. Le client cherche son budget, pas à arbitrer la vitesse d'un développeur. Une estimation « 20 h » ne doit pas être comprise comme « livré en 20 h » ; durée de travail et calendrier diffèrent.

En interne : heures estimées × taux de vente adapté + coûts directs + marge de risque dans le forfait. Pour le client : budget affiché, périmètre, prix des options, éléments hors périmètre, puis confirmation écrite avant démarrage et accord explicite pour toute extension. Une fourchette ±10–20 % est un objectif à calibrer sur des projets réels de même type ; l'annoncer comme garantie universelle avant cette validation serait fragile.

Si Mathis veut montrer les heures, proposer un volet « Comment ce budget est estimé » avec une **fourchette de charge indicative**, sans facturation automatique des dépassements. Les éléments flous doivent recevoir un palier/une quantité ou une fourchette plus large, pas une fausse précision.

## Limites

Sources locales uniquement pour cet avis initial : pas de capture autonome, test téléphone réel, audit lecteur d'écran, mesure des performances de production ou soumission réelle. Les risques tablette/sticky et confort mobile restent à vérifier visuellement. Les prix proposés dans les études existantes ne sont pas des montants approuvés.

## Complément visuel avant revue croisée

Captures de production IAB du parent ouvertes et inspectées par cet agent : `captures/03-configurateur-desktop.jpg`, `05-brief-desktop.jpg`, `06-brief-mobile.jpg`, `07-champs-mobile.jpg`, `08-configurateur-mobile.jpg`. Desktop 1440 × 900, mobile 390 × 844.

- **Le constat 1 est confirmé visuellement sur production** : total « À partir de… », options « + … € ». Aucun budget exploitable n'est affiché sur ces captures.
- Configurateur desktop : hiérarchie nette, carte et options bien séparées, aucun débordement observé dans le viewport capturé.
- Configurateur mobile : la barre fixe de budget et progression existe déjà et reste visible dans la capture 08. Il ne faut pas proposer de l'ajouter à nouveau. Les options passent correctement sous leur descriptif, sans débordement visible à 390 px.
- Brief mobile : champs et sections refluents dans la capture 07, pas de défaut grossier observé. La capture 06 montre une grande carte en tête qui occupe presque tout l'écran avant le titre de l'étape 2. **Opportunité P2** : compacter la carte à l'étape de saisie ou assurer l'arrivée sur le titre/formulaire, en gardant le budget accessible. Cela demande une reproduction de la transition pour distinguer le positionnement au redimensionnement du positionnement après clic mobile : `revealSection` est déjà censé faire défiler le titre (`configurator/index.tsx:69–73`). Ne pas classer l'autoscroll comme cassé à partir de cette seule capture.
- Aucun verdict tablette, clavier complet ou contraste sur texture ne découle de ces captures.

Avis initial et complément visuel désormais scellés. Toute relecture collective doit être ajoutée dans un fichier séparé.
