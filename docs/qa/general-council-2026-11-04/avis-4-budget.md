# Avis indépendant 4 — budget, heures et promesse commerciale

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
