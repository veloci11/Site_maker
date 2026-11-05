# Avis initial indépendant 1 — Parcours, clarté et budget

Date : 4 novembre 2026, heure utilisateur. Avis scellé avant lecture des quatre autres avis. Aucune modification du produit, aucun envoi de formulaire, aucun déploiement.

## Périmètre et limites

Lecture du code et du contenu actuels : accueil, forfaits, options, brief, sélection, confirmation, galerie et contact. Ce rapport établit des constats de source ; les états en production, les tarifs servis par l’API, les rendus mobile et les animations doivent être rapprochés des captures IAB du coordinateur. Aucun défaut visuel ou taux d’abandon n’est affirmé sans ces preuves. Les choix explicitement approuvés dans `AGENTS.md` sont conservés.

But client : comprendre ce qu’il achète et son budget avant de donner ses coordonnées, puis transmettre une demande sans découvrir un supplément non expliqué.

## Ce qui fonctionne et doit être conservé

- Parcours public sans inscription ni paiement obligatoire ; options puis brief adapté au forfait.
- Distinction entre dépenses ponctuelles et mensuelles ; calcul centralisé, absence de double facturation catalogue/paiement quand la boutique est sélectionnée (`shared/catalog.ts:553`, `shared/catalog.ts:633`).
- Inclusions expliquées avant les options, formulation « À définir ensemble » dans les questions qui le nécessitent, aucune option facturée automatiquement à partir d’une réponse.
- Le retour « Mes options » conserve le formulaire monté (`src/pages/configurator/index.tsx:453`) ; une vraie garde protège les réponses avant navigation (`src/components/inquiries/BriefNavigationGuard.tsx:7`).
- Galerie externe créditée, sans prétendre que tous les sites montrés sont des réalisations du studio. Textures, structure, Vitrine ordinateur avec mobile facultatif : décisions explicites à préserver.

## Constats et améliorations

### 1. P1 — Le prix ne peut pas être fiable sans une quantité et un périmètre bornés

**Confirmé dans le modèle.** `Configuration` ne contient que des booléens et une liste d’options (`shared/catalog.ts:26`). « Pages supplémentaires » est une seule case, avec « Nombre à préciser ensemble » (`shared/catalog.ts:421`). La boutique laisse produits/livraison à préciser (`shared/catalog.ts:393`), le modèle 3D laisse sa complexité à préciser (`shared/catalog.ts:449`), la connexion à un service laisse l’intégration à préciser (`shared/catalog.ts:477`). Le calcul additionne un montant unique par case (`shared/catalog.ts:649`).

**Effet :** deux projets très différents peuvent recevoir exactement le même total. Afficher des heures à la place ne résout pas ce manque.

**Ajouter :** quantité/paliers pour les tâches répétables et une définition concrète des inclusions. Pour l’intégration ou la 3D, un scénario standard borné ou une fourchette avec hypothèses ; basculer les cas hors limites vers une estimation spécifique. Ne pas inventer dès cet audit un nombre de pages incluses.

### 2. P1 — Le catalogue de repli ne donne actuellement aucun ordre de grandeur

**Confirmé dans la source, production à vérifier.** Tous les prix par défaut sont `null` (`shared/catalog.ts:519`). L’accueil affiche alors « À partir de… » (`src/pages/public/index.tsx:57`), les options « + … € » (`src/pages/configurator/index.tsx:237`). L’API peut fournir des valeurs différentes ; ce point ne prouve donc pas à lui seul l’état public.

**Effet :** dans cet état, on doit toujours écrire au studio pour connaître le budget, ce qui rate précisément la proposition de valeur souhaitée.

**Ajouter avant lancement commercial :** les vrais prix validés et une distinction explicite entre « estimation immédiate disponible » et « périmètre à étudier ». Retirer les ellipses en tant qu’état commercial durable ; conserver un état honnête d’indisponibilité lors d’une panne.

### 3. P1 — Le total doit dire ce qu’il couvre et ce qui reste à payer

**Confirmé dans le contenu.** La carte affiche « Création du site », un nombre, puis éventuellement un montant mensuel (`src/pages/configurator/index.tsx:289`). Mise en ligne et hébergement ne sont pas cochés par défaut (`shared/catalog.ts:564`) ; domaine et abonnements externes sont mentionnés surtout en FAQ (`shared/catalog.ts:255`). Aucun statut fiscal n’accompagne ce total dans ce composant.

**Effet :** une somme peut sembler être le coût pour avoir un site en ligne alors qu’elle correspond à la seule création et aux options retenues.

**Ajouter près du budget :** « Création », « Mise en ligne », « Mensuel choisi », puis « Autres coûts à prévoir » (domaine/prestataires selon le projet), avec statut fiscal réel une fois établi. Si la mise en ligne reste non sélectionnée, le dire dans le récapitulatif. C’est compatible avec le choix approuvé de la laisser facultative.

### 4. P2 — L’accueil n’explique pas encore l’avantage principal imaginé par Mathis

**Confirmé.** Le titre promet un site clé en main, et l’explication porte sur la présentation de l’activité, l’espace client et la 3D (`src/pages/public/index.tsx:153`). Aucun passage de ce bloc ne promet d’obtenir une estimation avant de prendre contact.

**Effet :** le visiteur peut lire une offre de studio classique et ne pas comprendre pourquoi il devrait configurer lui-même.

**Ajouter après disponibilité de vrais prix :** une phrase simple du type « Choisissez vos fonctions et visualisez votre budget avant de nous contacter ». Le CTA pourrait expliciter l’estimation ; aucune promesse de précision à ±10–20 % tant que le modèle ne la soutient pas.

### 5. P2 — Les réponses du brief ne font pas évoluer le budget, même lorsqu’elles révèlent une ampleur différente

**Confirmé et volontaire.** Les réponses sont indépendantes de `Configuration` (`src/components/inquiries/ProjectBriefForm.tsx:317`). Le brief demande les pages, les utilisateurs/actions, les volumes et les intégrations (`shared/brief.ts:45`, `shared/brief.ts:178`, `shared/brief.ts:203`). Le prix dépend uniquement de la configuration.

**Effet :** une demande de plateforme complexe peut garder le prix du Connecté standard jusqu’à l’étude humaine.

**Ajouter :** un retour explicite « Cette demande comporte un point à confirmer » quand le besoin sort du scénario choisi, sans ajouter de prestation ou frais à l’insu du client. Idéalement poser les questions qui déterminent le prix avant l’écran de coordonnées, et réserver les précisions de production au brief. Conserver la règle approuvée : une réponse ne facture jamais automatiquement une option.

### 6. P2 — Il manque une lecture d’ensemble avant « Envoyer ma demande »

**Confirmé dans l’arbre de rendu.** Les réponses sont réparties dans un accordéon à une seule section ouverte, avec résumés concaténés (`src/components/inquiries/ProjectBriefForm.tsx:433`). L’action d’envoi suit directement ces sections (`src/components/inquiries/ProjectBriefForm.tsx:532`). La sélection d’options est un bloc `details` fermé par défaut (`src/pages/configurator/index.tsx:330`).

**Effet :** il faut rouvrir plusieurs rubriques pour vérifier besoin, coût et options avant de transmettre.

**Ajouter :** un récapitulatif compact consultable avant l’envoi, avec liens « Modifier », dépenses ponctuelles/mensuelles et points restant à confirmer. Ce n’est pas une nouvelle étape obligatoire de formulaire si le récapitulatif tient dans l’écran existant.

### 7. P2 — Changer de forfait peut retirer des options sans expliquer lesquelles

**Confirmé dans les règles ; ressenti à vérifier dans l’IAB.** Le changement d’offre passe par `forOffer` puis `prunePublicConfiguration` (`src/pages/configurator/index.tsx:46`, `src/pages/configurator/index.tsx:179`). Les listes d’options publiques diffèrent (`shared/offer-options.ts:21`). Exemple : une Galerie de réalisations sélectionnée en Vitrine n’est pas exposée dans Connecté et sera retirée.

**Effet :** le client qui compare plusieurs forfaits peut croire que sa sélection complète a été conservée.

**Ajouter :** un retour bref lorsqu’une option est retirée, ou une liste des éléments conservés/à reconsidérer au changement. Ne pas modifier automatiquement les compatibilités pour masquer ce point.

### 8. P2 — La galerie montre l’inspiration, puis ne reconduit pas vers le budget associé

**Confirmé.** Image, titre et action ouvrent le site externe, conformément au choix approuvé (`src/pages/public/index.tsx:638`). La catégorie apparaît mais aucun lien contextuel ne ramène du filtre « Vitrine » vers sa configuration (`src/pages/public/index.tsx:659`).

**Effet :** le visiteur apprécie un exemple sans comprendre ce qui est comparable au forfait de base et ce qui ferait augmenter le prix.

**Ajouter :** sous les résultats ou à côté du filtre, « Estimer mon site Vitrine/Connecté/3D ». Quand les scénarios seront définis, montrer une estimation pour un projet comparable avec ses hypothèses ; ne pas attribuer un coût réel au site externe, ni prétendre en avoir réalisé la prestation. Conserver l’ouverture directe et les crédits existants.

### 9. P2 — La confirmation décrit le système d’e-mail plutôt que la prochaine action pour le client

**Confirmé dans la source, non déclenché en production.** Les trois textes de succès détaillent `accepted`, `queued` ou `unavailable` (`src/pages/configurator/index.tsx:490`, `src/components/inquiries/ProjectBriefForm.tsx:380`). Le numéro de demande retourné dans `InquiryResult` n’est pas présenté dans ce rendu. Il manque aussi une action concrète de suivi et une attente de réponse expliquée.

**Effet :** même le cas normal peut sembler incertain (« livraison pas encore confirmée »), sans aider le client à savoir ce qui arrive ensuite.

**Remplacer :** conserver « Demande enregistrée », expliquer que le studio examine le projet et recontactera le client, puis afficher une référence utile et un moyen de suivi réel. Les détails techniques n’ont leur place que si le client peut agir dessus. Ne pas inventer de délai de réponse ni affirmer qu’un e-mail a été reçu.

### 10. P3 — Les animations utiles doivent confirmer les changements d’état du configurateur

**Constat de source, comportement à vérifier.** Le total a déjà `aria-live="polite"` (`src/pages/configurator/index.tsx:289`), mais il n’existe pas de message précisant l’option ajoutée/retirée, la variation du coût ou une modification de compatibilité. Les anciens appels `Reveal` comportent encore un `delay` ignoré volontairement (`src/components/layout/motion.tsx:5`).

**Ajouter si le test visuel le confirme :** une transition très courte sur la valeur actualisée ou une mise en évidence du changement, avec montant final immédiat, fonctionnement clavier et réduction des animations. Garder les micro-interactions actuelles des cartes ; ne pas relancer d’animation de fond, de suivi du pointeur ou de contenu masqué au scroll rejetés par Mathis. Une animation ne doit pas servir à combler un écran sans prix.

## Avis sur les heures et les prix

### Recommandation

Afficher d’abord un **prix de création estimé**, les **frais mensuels choisis** et un **périmètre lisible**. Garder les heures comme outil de calcul interne ; si elles sont visibles, les placer dans un détail facultatif « Charge de travail estimée », distinct du délai de livraison.

Les heures aident à expliquer le travail, mais une durée publique fixe (« cette fonction : 1 h ») peut faire croire à un délai, devenir un engagement inadapté et déplacer la discussion vers la vitesse d’exécution. La difficulté principale est de définir la fonction : réservation simple par service existant et moteur de réservation particulier ne représentent pas le même travail.

### Pour viser une estimation à ±10–20 %

1. Définir les scénarios standard et leurs limites (pages/types de pages, volumes, intégration, contenus fournis, retours inclus), puis les vraies options/paliers.
2. Calculer en interne conception + réalisation + échanges + vérification + mise en ligne choisie + marge d’incertitude ; ne pas réduire le chiffrage aux seules heures de codage.
3. Donner immédiatement un prix/fourchette avec ces hypothèses avant les coordonnées, et indiquer les points qui pourraient le modifier.
4. Confirmer ensuite un périmètre et un prix fixe pour ce périmètre ; tout changement demandé ensuite fait l’objet d’un montant présenté et accepté avant travail.
5. Comparer estimations et projets réels pour mesurer la précision. ±10–20 % est aujourd’hui un objectif à vérifier, pas un résultat démontré. Les projets atypiques peuvent dépasser cette incertitude et doivent le dire.

### Garder / enlever / ajouter

- **Garder :** configurateur, options explicites, mensuel séparé, accompagnement, retours sans perte, crédits externes et matières approuvées.
- **Enlever/remplacer :** ellipses tarifaires comme état permanent, formulations techniques de confirmation, ambiguïté entre prix final et estimation.
- **Ajouter en premier :** catalogue borné et tarifs validés, budget complet avant coordonnées, hypothèses et points à confirmer, accord préalable avant supplément. Les animations viennent ensuite.

## État de vérification

Avis source scellé. Captures et observations IAB du coordinateur à relier en annexe sans réécrire l’avis initial. Pas de preuve d’envoi effectif, de délivrabilité, de statistiques de conversion, de conformité juridique complète ou de précision tarifaire réelle dans cette revue.

## Annexe de rapprochement aux captures de cette session

Captures production IAB reçues du coordinateur et ouvertes localement après rédaction de l’avis source : `02-accueil-desktop.jpg`, `03-configurateur-desktop.jpg`, `05-brief-desktop.jpg`, `06-brief-mobile.jpg`, `08-configurateur-mobile.jpg`.

- **Constat 2 confirmé en production :** l’accueil affiche bien « À partir de… », le configurateur « + … € » ; ce n’est pas seulement le catalogue de repli local.
- **Constat 4 confirmé visuellement :** l’accueil est lisible, mais le premier écran ne met pas en avant l’estimation du budget.
- **Constat 6 étayé :** dans le brief desktop, « Votre sélection » est replié sous la carte ; les champs sont répartis dans les sections. Pas de preuve de rendu du bas de formulaire dans ces cinq captures.
- **Point mobile supplémentaire, P2 :** en haut de la page de brief mobile (capture 06), la carte détaillée de forfait occupe l’essentiel de l’écran ; « Décrivez votre projet » apparaît près du bas, après une répétition des inclusions déjà vues. Une version compacte du récapitulatif pendant le brief aiderait à retrouver les champs rapidement. Ce constat concerne la hauteur du contenu montré, pas un défaut prouvé du scroll après le clic (l’action exacte n’a pas été observée par cet agent).
- **À garder :** la barre fixe de budget/action sur mobile est claire dans la capture 08 ; elle sera beaucoup plus utile lorsque les montants seront renseignés. La sélection mobile dispose d’une coche lisible, et les captures ne justifient pas d’épaissir les contours approuvés.
- Les captures fixes ne suffisent pas à confirmer la qualité temporelle des animations, le focus au clavier, le zoom, l’envoi ni la récupération d’erreurs. Aucune conclusion contraire n’est ajoutée.
