# Corpus anonymisé — cinq avis initiaux

Avis scellés, ordre mélangé. Les noms des agents et leurs spécialités ne sont pas fournis. Les identifiants A–E servent à discuter les arguments, sans vote forcé. Les avis originaux ne sont pas réécrits.


---

# Avis A

Date : 4 novembre 2026, fuseau du client. Avis initial scellé avant lecture des quatre autres avis. Audit et recommandations seulement : aucun prix validé, aucun changement produit, aucun envoi ni déploiement.

## Verdict

Le bon objectif est de permettre de **connaître son budget avant de donner ses coordonnées**. Je recommande des forfaits et options en euros, avec prix ferme sur les cas standard bien bornés et fourchette explicitée sur les cas encore incertains. Les heures servent d'abord à vérifier les coûts et la capacité en interne. Les mettre partout au premier plan déplacerait la question du client vers « et si cela prend plus longtemps ? », précisément l'incertitude qu'il souhaite éviter.

La structure actuelle est adaptée à ce projet : le configurateur précède le questionnaire, un total existe déjà, les coûts ponctuels et mensuels sont séparés et la barre mobile accompagne les options. Les principaux obstacles sont les montants encore absents et le périmètre variable des cases, davantage que le manque d'animation.

## Preuves inspectées et état des étapes

Captures réalisées sur la production par le parent dans l'IAB, puis ouvertes dans cet avis :

1. `captures/03-configurateur-desktop.jpg` — choix du forfait et options : lisible, mais montant et suppléments remplacés par des points de suspension.
2. `captures/08-configurateur-mobile.jpg` — options mobile : barre de budget déjà présente et choix visible ; le montant reste inconnu.
3. `captures/14-arrivee-brief-mobile-apres-clic.jpg` — passage réel des options au questionnaire mobile : titre et premiers champs correctement amenés à l'écran. `captures/06-brief-mobile.jpg` montre un redimensionnement de la vue desktop et ne constitue pas un défaut de transition. Le défilement prévu dans `src/pages/configurator/index.tsx:69` est cohérent avec la capture 14.

La revue s'appuie aussi sur le catalogue, les options publiques, le questionnaire, le récapitulatif et l'étude de prix locale du 3 novembre. Les montants de cette étude restent des propositions non approuvées ; ils ne sont pas des prix de vente actuels ni des preuves d'une marge réalisable.

## Dix constats prioritaires

| # | Priorité et nature | Constat et preuve | Recommandation |
|---|---|---|---|
| 1 | P1 — écart à l'objectif, état préparatoire connu | `shared/catalog.ts:519` initialise toutes les bases et options à `null`. Les captures 03/08 montrent effectivement « À partir de… » et « + … € ». Le visiteur peut configurer mais ne découvre aucun budget. | Arrêter les prix et le périmètre avant d'en faire la promesse centrale. Ne pas remplacer ces inconnues par les propositions de l'étude sans validation. |
| 2 | P1 — périmètre à définir | La Vitrine décrit design, ordinateur et contact (`shared/catalog.ts:66`), sans quantité de pages ni bornes de contenu. `shared/brief.ts:45` recueille ensuite une liste libre de pages. | Définir ce que couvre le prix de base : volume, contenus fournis, degré de conception, corrections et livraison. Tous les nombres restent à décider ; un forfait sans unité de travail définie ne peut pas porter une précision de ±10–20 %. |
| 3 | P1 — modèle incomplet pour les volumes | La configuration contient des booléens et une liste d'options (`shared/catalog.ts:26`). « Pages supplémentaires » laisse le nombre à préciser (`:421`), la boutique produits/livraison (`:393`), le modèle 3D sa complexité (`:449`), l'intégration sa nature (`:477`). | Donner des unités ou paliers aux options standard : nombre de pages, volume de produits, type d'intégration, modèle fourni/créé. Basculer explicitement hors estimation automatique au-delà des bornes. Une case à prix unique ne représente pas tous les volumes. |
| 4 | P1 — précision non démontrée | `Quote` n'a qu'un montant par ligne et un total (`shared/catalog.ts:50`), sans borne basse/haute ni niveau de certitude. Aucun historique de prix final versus estimation n'est apporté dans cet audit. | Réserver l'objectif ±10–20 % aux configurations standard après mesure de cas réels. Afficher les hypothèses de la fourchette et les éléments qui restent à vérifier. Pour refonte, intégration particulière ou 3D complexe, annoncer un besoin d'examen au lieu de leur donner artificiellement la même précision. |
| 5 | P2 — limite du total avec une inconnue | Une seule ligne non chiffrée rend tout le total ponctuel `null` (`shared/catalog.ts:661`). L'affichage retombe alors sur « À partir de… » (`src/pages/configurator/index.tsx:113`), même si les autres lignes ont un montant connu. | Conserver un sous-total des éléments chiffrés et nommer les éléments à estimer. Montrer une fourchette complète uniquement si ces derniers ont des bornes raisonnables. Ne jamais présenter le sous-total comme le prix complet. |
| 6 | P1 — coût complet à rendre visible | Les totaux ponctuel/mensuel sont déjà séparés (`src/pages/configurator/index.tsx:289`). La FAQ repousse le domaine et les outils externes à la préparation (`shared/catalog.ts:257`). L'option Boutique ne rappelle pas les frais du prestataire, alors que l'ancien Paiement en ligne le fait (`:385`, `:393`). Le modèle `Pricing` précise devise mais pas la base fiscale (`:44`). | Conserver la séparation ; ajouter près du budget les frais tiers, leur caractère inclus/exclu/inconnu, la présentation fiscale réellement applicable et le total de première année quand calculable. Un abonnement non sélectionné ne signifie pas que le site n'aura aucun frais d'exploitation. |
| 7 | P1 — protection contre les surprises à formaliser | Les réponses du brief ne choisissent pas les options ; c'est une bonne règle à préserver. La création est néanmoins recalculée au catalogue courant lors de l'envoi (`server/inquiries.mjs:178`), et le client décrit encore un besoin ouvert. | Proposer une règle commerciale concrète : prix confirmé avant démarrage ; modification demandée ou périmètre dépassé présentés avec impact chiffré ; accord du client avant supplément. Sur un forfait accepté, une sous-estimation du temps interne ne devrait pas produire une hausse automatique. Enregistrer aussi la version de l'estimation vue par le client et signaler tout changement avant validation. Ce sont des décisions à approuver, pas des engagements déjà offerts. |
| 8 | P2 — budget difficile à conserver | Le détail des options existe dans « Votre sélection » (`src/pages/configurator/index.tsx:330`), mais la confirmation montre l'enregistrement et le statut de notification (`:485`) sans action pour conserver le budget. | Ajouter un récapitulatif imprimable/téléchargeable : configuration, fourchette ou prix, inclusions, exclusions, frais récurrents et date/version. L'obtenir avant les coordonnées serait cohérent avec le positionnement. Ne pas enregistrer coordonnées ou liens privés dans localStorage. |
| 9 | P2 — comparaison visuelle sans comparaison de périmètre | La galerie annonce correctement des références externes (`src/pages/public/index.tsx:633`), puis ouvre les sites. Elle ne relie pas un rendu précis au volume et au budget de son équivalent (`:637`). | Ajouter des scénarios chiffrés créés par le studio et bornés, distincts des références externes. « Un site comme Cal.com = tel petit forfait » serait trompeur sur le périmètre. Montrer plutôt le prix d'une réservation définie ou d'un espace membre simple, avec ses limites. |
| 10 | P2 — positionnement encore peu exprimé | L'accueil dit « clé en main » et décrit les types de sites (`src/pages/public/index.tsx:151`), sans dire que le visiteur peut obtenir un budget avant une discussion. C'est cohérent avec l'absence actuelle de tarifs, mais ne communique pas encore la différence voulue par Mathis. | Quand le chiffrage fonctionnera, donner cette utilité au premier écran et à l'action principale : par exemple « Estimer mon site ». Mesurer la compréhension du budget et l'écart au prix final sur des dossiers réels ; les heures internes doivent inclure préparation, échanges, tests et corrections, pas seulement le codage. |

P1 signifie ici condition importante pour une promesse tarifaire fiable ; ce n'est pas une affirmation de panne ou de régression. Les décisions approuvées restent respectées : Vitrine ordinateur à la base, mobile facultatif, six prestations, textures et fond statique.

## Heures, forfaits, fourchettes : décision recommandée

| Cas | Affichage client recommandé | Usage des heures |
|---|---|---|
| Fonction standard et volume borné | Supplément fixe en euros, inclusion et unité explicites | Estimation/coût suivis en interne |
| Configuration standard encore à vérifier | Fourchette en euros et raisons précises de variation ; plafond seulement si l'équipe est prête à le tenir | Contrôle interne de la réserve et de la rentabilité |
| Refonte, diagnostic, intégration inconnue, 3D complexe | Repère budgétaire prudent avec hypothèses, puis examen préalable | Heures visibles possibles pour une petite intervention réellement vendue au temps, avec taux, estimation et budget maximum acceptés |
| Planning de livraison | Calendrier confirmé selon charge, contenus et validations | Ne pas faire croire que 20 heures de travail signifient livraison dans 20 heures calendaires |

Les heures affichées ne sont pas mauvaises en elles-mêmes ; elles conviennent quand le client achète volontairement une intervention au temps. Pour le site principal, elles ne répondent pas aussi directement à « combien vais-je payer au final ? » qu'un périmètre et un prix maîtrisés.

**Exemple fictif de présentation, aucun tarif proposé pour le catalogue :** forfait standard à 1 000 €, option A à 150 €, mise en ligne à 100 € ; création 1 250 €. Hébergement facultatif à 15 €/mois ; première année 1 430 € avant les éventuels frais tiers explicitement listés. Si une composante reste incertaine, afficher par exemple « création estimée 1 100 à 1 400 € pour les hypothèses indiquées », sans appeler cela un prix ferme. Les montants et le traitement des taxes de cet exemple sont purement illustratifs.

Une tolérance de ±20 % ne résout pas seule le problème : sur une estimation de 1 000 €, elle représente jusqu'à 200 € de plus. La confiance vient de la borne lisible et de l'absence de hausse non acceptée. Une fourchette opérationnelle honnête peut donc être plus utile qu'un badge « précision 90 % » non mesuré.

## Garder, enlever, ajouter

- **Garder** le configurateur avant les coordonnées, le détail des options, le total visible, les mensualités distinctes, le mobile Vitrine explicitement facultatif, les crédits des références et les animations discrètes déjà prévues.
- **Enlever/remplacer après validation des prix** les points de suspension publics. Ne pas ajouter un compteur d'heures facturables ni une longue animation qui retarde le nouveau total.
- **Ajouter** des unités/paliers, un périmètre de base défini, les frais tiers et le coût de première année, un récapitulatif conservable et des exemples de budget complets.
- **Animation utile à envisager** : bref fondu du montant et signal de la ligne qui vient d'être ajoutée, avec mise à jour immédiate et `prefers-reduced-motion`. L'annonce `aria-live` existe déjà (`src/pages/configurator/index.tsx:289`) ; elle doit être conservée. Aucune animation de fond ni mouvement permanent n'est nécessaire à la transparence.

## Limites

Aucun envoi de formulaire, aucune réception d'e-mail, aucune facturation ni mesure de marge réelle. L'absence de prix dans les captures est confirmée ; l'effet de futurs prix sur la conversion et la précision ±10–20 % restent à mesurer. Pas de défaut d'accessibilité global conclu à partir de ces captures. Pas de nouvelle enquête de marché ni de promesse fiscale ou juridique ajoutée.


---

# Avis B

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


---

# Avis C

Avis indépendant scellé le 4 novembre 2026. Aucun autre avis du conseil lu. Audit documentaire du code actuel et inspection des captures IAB de production 02, 03, 07, 08 et 10. Aucun formulaire envoyé, aucune modification produit. Les comportements de succès sont examinés dans le code, pas observés après un envoi réel.

## Verdict

La présentation est propre, les quatre créations sont compréhensibles et les options disposent de vrais états de sélection. Le principal défaut commercial est plus fondamental que l'animation : le client ne peut pas encore savoir ce qu'il paiera, ni rapprocher un exemple de site d'un budget réaliste. Le modèle public doit vendre un résultat borné avec son prix. Les heures peuvent aider Mathis à préparer et contrôler ses tarifs ; elles rassurent moins directement un acheteur qui veut connaître sa dépense maximale.

## Constats

| Priorité | Constat et preuve | Amélioration proposée | Nature |
|---|---|---|---|
| P1 | L'accueil et le configurateur affichent « À partir de… » et « + … € ». Captures 02/03/08 ; `shared/catalog.ts:519–525`, `src/pages/public/index.tsx:57–60`. | Arrêter les prix des prestations standard avant de présenter le site comme un estimateur. Montrer immédiatement un prix de base et un total de configuration. | État réel connu de pré-lancement, devenu obstacle à l'objectif ; aucun tarif inventé. |
| P1 | Les unités qui déterminent l'effort ne sont pas bornées : pages supplémentaires, reprise de contenus, modèle 3D et intégration restent à préciser. `shared/catalog.ts:421–451`, `shared/catalog.ts:477–479`. Le modèle de configuration contient des booléens et une liste d'options, sans quantités (`shared/catalog.ts:26–35`). | Définir les inclusions et exclusions de chaque prestation ; ajouter des paliers lorsqu'un volume change le prix. Une seule case « boutique » ne doit pas promettre un prix couvrant toutes les boutiques. | Écart structurel à une précision ±10–20 %, pas bug de calcul. |
| P1 | La base Vitrine couvre l'ordinateur ; mobile et mise en ligne sont facultatifs. L'explication est explicite dans le configurateur, mais le premier prix de l'accueil n'est pas le coût d'un scénario complet. Captures 02/03 ; `shared/catalog.ts:74`, `src/pages/public/index.tsx:300–302`. | Conserver ces choix approuvés. Ajouter près du prix un exemple chiffré complet avec mobile et mise en ligne sélectionnés, et distinguer les cas où le client les gère lui-même. | Clarification commerciale, pas demande de rendre les options obligatoires. |
| P2 | Les références sont correctement créditées et signalées externes, mais des produits entiers comme Cal.com ne disent pas quelles fonctions pourraient être livrées dans notre forfait. Capture 10 ; `src/pages/public/index.tsx:633–686`, `shared/catalog.ts:168–176`. | Sous la description existante, préciser le seul aspect illustré et, plus tard, associer un scénario de budget à des fonctions équivalentes bornées. Ne pas suggérer de reproduire tout Cal.com au prix de Connecté. Garder liens externes et crédits. | Risque de mauvaise attente ; aucune confusion de client observée. |
| P2 | Le total distingue déjà ponctuel/mensuel, ce qui est utile, mais domaine et abonnements tiers restent seulement annoncés comme « précisés avant le démarrage ». `shared/catalog.ts:257–259`, `src/pages/configurator/index.tsx:289–295`. | Montrer un coût initial, les frais récurrents, et éventuellement un total sur 12 mois avec les postes inconnus nommés. Ne pas compter les frais externes inconnus comme zéro ni présenter une année comme un engagement minimal sans contrat. | Amélioration de transparence ; mécanisme mensuel existant à préserver. |
| P1 | Le footer ne donne pas d'identité de l'entreprise ni accès aux informations légales/confidentialité ; ces pages annoncent encore qu'elles seront complétées. Capture 02 ; `src/components/layout/PublicLayout.tsx:190–201`, `src/App.tsx:25`. | Compléter les informations réelles et les rendre accessibles dans le footer. La confiance commerciale exige de savoir à qui on confie son site et ses coordonnées. | Manque de contenu confirmé dans le code ; pas une certification juridique ni un audit RGPD. |
| P2 | Le contact annonce une réponse par e-mail, mais réclame aussi prénom, nom et téléphone obligatoires, même pour poser une simple question. `src/pages/public/index.tsx:813–827`, `src/components/inquiries/ProjectBriefForm.tsx:452–465`, `shared/brief.ts:414–422`. | Tester un contact bref pour les questions, ou expliquer l'usage du téléphone si l'obligation reste souhaitée. Cette proposition change une décision produit existante et doit être arbitrée, pas corrigée comme un bug. | Friction plausible, non mesurée. |
| P2 | La réussite détaille l'acceptation technique de la notification par le prestataire et renvoie surtout à l'accueil. Elle n'affiche pas de référence client ni de copie conservable de la demande. `src/pages/configurator/index.tsx:485–503`, `src/components/inquiries/ProjectBriefForm.tsx:380–386`. | Donner une confirmation centrée sur le client : demande conservée, référence, récapitulatif exportable et prochaine étape réelle. Conserver une information honnête en cas d'échec de notification, avec une action de récupération disponible, sans laisser croire à un e-mail reçu. | Lecture du code seulement ; aucun échec de livraison constaté en production. |
| P2 | Le brief recueille des informations qui peuvent révéler un besoin plus important, mais ne modifie jamais la configuration payante : `ProjectBriefForm.tsx:317–323`, `shared/brief.ts:45–47`. C'est une protection utile, mais le client n'a pas encore d'écran qui sépare estimation standard et points restant à chiffrer. | Avant envoi, récapituler fonctions, volumes retenus, prix estimé, frais récurrents et éléments à confirmer. Ne jamais transformer une réponse libre en supplément payant automatique. Si le besoin sort du standard, l'indiquer explicitement avant l'engagement. | Extension du parcours proposée ; ne pas inventer un faux calcul à partir du texte libre. |
| P3 | Les sélections disposent déjà de coches, compteurs, résumés et d'un total annoncé en `aria-live`. Captures 03/08 ; `src/pages/configurator/index.tsx:289–300`, `375–427`. | Une courte mise en évidence du nouveau total et du delta « + X € » serait utile quand de vrais prix existent. Réserver l'animation aux changements compréhensibles ; garder reduced motion et les matières approuvées. | Opportunité de feedback, pas absence générale d'animation. |

## Garder, enlever, ajouter

- Garder : quatre créations et deux prestations sur l'existant, sélection explicite, résumé des options, prix ponctuel/mensuel distinct, barre mobile, FAQ rassurante, crédits des références, visuels approuvés.
- Enlever à terme : ellipses tarifaires publiques et formulations de périmètre ouvertes sur une ligne annoncée comme prix fixe. Réécrire les confirmations techniques pour qu'une prochaine action soit claire ; préserver leur honnêteté.
- Ajouter : inclusions mesurables, paliers de volume, exemple de budget complet, informations réelles de l'éditeur, copie conservable et versionnée de la configuration, traitement explicite du hors-périmètre.

## Tarification recommandée

**Prix en euros au premier plan ; heures pour le pilotage interne.** Afficher « cette option prend 2 h » rapproche l'achat d'un compteur qui peut dépasser. Le client cherche plutôt « cette option coûte X et couvre Y ». Les heures peuvent apparaître dans un détail facultatif, sous forme de charge estimée, en précisant que charge de travail et délai calendaire diffèrent. Éviter qu'une promesse de 20 h fasse croire à une livraison en trois jours.

Pour une prestation vraiment standard et bornée : prix fixe avec ce qui est compris. Pour un cas paramétrable : fourchette basse/haute calculée d'après des volumes, assortie des hypothèses. Pour une refonte inconnue, une application ou de la 3D complexe : estimation initiale plus large et vérification préalable. Ne pas promettre ±10–20 % pour toutes les demandes.

Exemple **strictement fictif, pas une proposition de tarifs approuvés** : base 900 € + mobile 150 € + mise en ligne 150 € = 1 200 € de création ; hébergement 15 €/mois ; coût des 12 premiers mois 1 380 € hors domaine et outils tiers non chiffrés. Le traitement fiscal doit être clairement indiqué lorsqu'il est arrêté. Pour ce périmètre standard, le studio peut décider d'un montant ferme. Si la demande ajoute une boutique hors périmètre, annoncer le nouvel impact et recueillir l'accord avant tout travail facturé. Une fourchette ne justifie pas une hausse automatique à sa borne haute.

## Limites

Pas de taux de conversion ni de test utilisateur ; les frictions restent des hypothèses. Captures à 1440×900 et 390×844 fournies par le parent. Pas d'évaluation exhaustive clavier, lecteur d'écran, performance réseau ou livraison e-mail. La capture 06, prise après redimensionnement, ne prouve pas une mauvaise transition mobile ; le code prévoit un défilement au titre à la vraie transition (`src/pages/configurator/index.tsx:69–73`). Aucune demande de refonte visuelle générale.


---

# Avis D

Date : 4 novembre 2026, date du client. Revue des sources actuelles uniquement, avant lecture des autres avis. Produit non modifié. Les captures IAB du parent feront l'objet d'un complément séparé ; aucune affirmation de validation visuelle ou de performance en production ici.

## Verdict

Le socle de calcul est cohérent : centimes entiers, inclusions non facturées deux fois, mensualités séparées, options publiques bornées par forfait, validation serveur et instantané privé de la demande. **Le site ne sait cependant pas encore donner le budget anticipé recherché** : les prix sont laissés en attente et le modèle additionne des cases sans quantifier leur périmètre. Ce n'est pas un bug arithmétique démontré.

## Dix constats et propositions

| Priorité | Constat actuel et preuve | Conséquence / action proposée | Statut |
|---|---|---|---|
| P1 | Toutes les bases et options par défaut sont `null` : `shared/catalog.ts:519–525`. Les cartes affichent alors « À partir de… » (`src/pages/public/index.tsx:57–60`), le configurateur « + … € » (`src/pages/configurator/index.tsx:237–244`). | Fixer d'abord trois bases et des options standard réellement chiffrées. Tant qu'aucun montant n'est arrêté, impossible de promettre au client une estimation à ±10–20 %. Ne pas inventer ni publier des chiffres pour remplir le vide. | Limite produit confirmée dans le code ; prix effectifs en production à vérifier par le parent. Choix de lancement jusqu'ici explicite. |
| P1 | « Pages supplémentaires », rédaction, langue, modèle 3D et CRM n'ont chacun qu'un booléen ou un identifiant, aucun volume (`shared/catalog.ts:26–35`, `421–451`, `477–479`). Les quantités sont demandées en texte libre dans le brief, sans effet sur le prix (`shared/brief.ts:136–139`, `246–247`). | Avant prix fixes, définir des unités et limites : page type, nombre de langues, volume de textes, modèle 3D fourni/créé, connecteur standard. Au-delà, indiquer explicitement une estimation complémentaire à valider. Le brief ne doit toujours pas ajouter silencieusement d'options payantes. | Limite structurelle confirmée ; le choix historique de questions non facturantes est à conserver. |
| P1 | `Quote` ne contient ni minimum/maximum, ni hypothèses, ni exclusions, ni plafond (`shared/catalog.ts:50–64`). Le calcul produit un seul total ou `null` (`633–675`). | Pour tenir l'objectif de maîtrise du budget, ajouter une fourchette liée à un périmètre vérifiable, et distinguer « prix de cette configuration standard » d'un poste incertain. Éviter une marge générique ±20 % appliquée aveuglément aux projets complexes. | Capacité absente confirmée ; évolution proposée, pas erreur actuelle. |
| P2 | Le prix affiché est chargé une fois à l'ouverture (`src/pages/configurator/index.tsx:134–142`). L'envoi ne transporte pas sa version (`ProjectBriefForm.tsx:317–331`) ; le serveur recalcule avec les prix du moment (`server/inquiries.mjs:178–183`). | Si un tarif change pendant la saisie, le dossier peut contenir un prix différent de celui vu par le client. Lors de l'activation commerciale, contrôler la version et faire valider un changement, ou enregistrer séparément estimation vue et estimation actuelle. Ne jamais faire confiance aux montants envoyés par le navigateur. | Risque futur démontré par le flux ; pas de surcoût réel observé et aucun engagement/paiement créé actuellement. |
| P2 | L'écran final affiche uniquement l'enregistrement et l'état technique de notification (`src/pages/configurator/index.tsx:485–509`). Aucun récapitulatif téléchargeable ou copiable, et pas de copie client dans le flux d'envoi (`server/inquiries.mjs:207–210`). | Donner au visiteur une référence lisible, les choix, le coût ponctuel, le mensuel, les exclusions et la date/version de son estimation. Copie e-mail facultative à concevoir ultérieurement, sans envoi de test non autorisé. | Absence confirmée dans les sources. |
| P2 | Accueil/comparatif masquent une panne du catalogue et gardent l'état non chiffré (`src/pages/public/index.tsx:41–54`). Le configurateur sait afficher un avertissement, mais sans réessai (`src/pages/configurator/index.tsx:439–443`). | Une fois les prix publiés, différencier chargement, panne et prix à définir ; offrir « Réessayer ». Sinon la promesse de transparence disparaît silencieusement en cas d'incident. | Comportement de repli confirmé ; risque conditionnel, aucune panne de production prétendue. |
| P1 | Les pages légales partagent encore un texte provisoire annonçant leur complétion avant commandes (`src/App.tsx:25`, `81–83`). Le footer ne les rend pas directement accessibles (`PublicLayout.tsx:190–202`). | Compléter identité réelle, informations commerciales et confidentialité, puis liens visibles au footer. À traiter avant ouverture commerciale, sans inventer l'identité ni présenter cet avis comme validation juridique. | Incomplétude confirmée. |
| P1 | La configuration de notification exige `INQUIRY_TO` (`server/inquiries.mjs:78–84`). Son report est documenté (`ops/DEPLOYMENT_STATUS.md:126`). Une demande peut être enregistrée sans notification envoyée (`server/inquiries.mjs:187–193`). | Prévoir la vérification de réception avant acquisition réelle ; maintenir un accès admin et un suivi des demandes en attendant. Ne pas confondre stockage et livraison d'e-mail. Ne pas redemander l'adresse pendant cet audit : Mathis l'a explicitement reportée. | Dépendance opérationnelle connue ; état actuel de production non inspecté par cet agent. |
| P2 | Le serveur renseigne bien le head par route (`server/seo.mjs:32–43`, `72–86`), mais le corps initial reste `#root` vide (`index.html:13–16`, `src/main.tsx:6`). | Étudier le prérendu des pages publiques pour rendre immédiatement disponible le contenu aux robots et aux connexions lentes. Ne pas annoncer que le site est invisible sur Google : aucune donnée d'indexation ou mesure utilisateur n'a été recueillie. | Architecture confirmée, effet SEO/performance à mesurer. |
| P3 | Les totaux changent comme du texte React ordinaire, avec annonce `aria-live` présente (`src/pages/configurator/index.tsx:289–302`), sans signal visuel propre au prix. | Quand les montants seront activés, tester un fondu très court du total et un delta explicite « + … € », stable, sans compteur qui déroule. Respecter reduced motion. Priorité inférieure à la lisibilité du budget ; pas besoin d'animation décorative de fond ou de scroll. | Opportunité de feedback, pas bug ni défaut constaté visuellement. |

## Garder / enlever / ajouter

- **Garder** les textures approuvées, la navigation immédiate, les animations brèves existantes, l'absence de double facturation, la séparation ponctuel/mensuel, les choix compatibles conservés, les réponses privées en mémoire et les protections contre la perte de saisie.
- **Enlever à terme** les prix laissés en suspens sur les prestations standard et les messages techniques du prestataire e-mail visibles au client. Conserver l'information honnête « demande enregistrée » et traiter les incidents côté équipe.
- **Ajouter** des unités commerciales, des hypothèses explicites, les frais tiers séparés, une estimation conservable, et la règle : aucun ajout facturé sans validation préalable.

## Heures ou prix

**Conseil : prix forfaitaires publics en premier ; heures pour le calcul et le suivi internes.** Le client veut savoir ce qu'il obtient et son budget, pas interpréter « 20 h » ni supporter la variabilité d'exécution. Une estimation de charge peut figurer en détail facultatif sur une intervention ciblée, sous forme de fourchette, sans prétendre que charge de travail = délai calendaire.

Le prix doit couvrir conception, échanges, préparation, développement, vérifications, corrections prévues, déploiement choisi, coûts directs et marge. Une case « prise de rendez-vous » ne vaut pas systématiquement 1 h : intégration standard et planning spécifique ne partagent pas le même périmètre.

Pour viser ±10–20 %, commencer sur des cas standard dont les hypothèses sont contrôlées. La précision devra se mesurer sur les projets terminés (estimation initiale comparée au prix final à périmètre constant). Pour Sur mesure, 3D complexe ou reprise d'existant inconnue, publier une fourchette indicative et ses limites plutôt qu'un faux prix précis.

## Vérification effectuée

Commande : `node --test tests/catalog.test.mjs tests/draft.test.mjs tests/offer-options.test.mjs tests/seo.test.mjs tests/inquiry-contact.test.mjs tests/brief-council.test.mjs`.

Résultat : **55 tests passants, zéro échec**. Aucun formulaire de production soumis, aucun e-mail envoyé, aucun serveur laissé démarré. Ces tests confirment des règles locales ; ils ne prouvent ni la délivrabilité réelle, ni la conformité légale, ni les Core Web Vitals en production.

Avis initial scellé avant lecture des autres conseillers. Toute correction issue de la revue croisée sera écrite séparément.


---

# Avis E

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
