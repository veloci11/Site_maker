> Mise à jour après correction : les deux défauts techniques, les quantités de pages supplémentaires et les limites des options ont été traités dans le lot suivant. Voir [les corrections et leurs preuves](../fixes-2026-11-06/REVIEW.md). Ce document conserve les constats de la revue initiale ; les besoins de destinataire e-mail, d’identité éditoriale et de suivi des coûts restent distincts.

# Revue critique commerce et marketing — 6 novembre 2026

## Périmètre et conclusion

Audit en lecture seule du code courant et du catalogue. Les décisions les plus récentes en tête d’`AGENTS.md` priment : Vitrine personnalisée 1–3 pages à partir de 890 €, Business 1–6 pages avec CMS à partir de 1 490 €, Premium cumulatif 1–10 pages à partir de 2 499 €, réservation optionnelle sur les trois forfaits. Aucun produit ni prix n’a été modifié. Les scénarios de prix ont été exécutés avec `quoteConfiguration` ; les calculs portant sur plusieurs pages sont distingués des résultats du configurateur, qui ne gère pas les quantités.

La gamme n’a pas de cannibalisation complète démontrée : une Vitrine avec CMS reste moins complète que Business. En revanche, il reste des limites commerciales réelles : identité et modalités provisoires, peu de preuves propres au studio, portée des unités insuffisamment matérialisée dans le configurateur, et rentabilité non établie. Les mentions « à partir de » évitent de figer une prestation, mais ne remplacent pas un périmètre et un devis exploitables.

Le rapport conserve les constats de l’audit initial. Les sections B2 et B5 ont été actualisées le 6 novembre 2026 après les changements de confirmation et les clarifications éditoriales ; elles distinguent les corrections déjà apportées des points résiduels.

Aucune nouvelle recherche externe ni navigation Chrome. Les recherches primaires et contrôles publics sont réalisés par le coordinateur. La nouvelle preuve opérationnelle mentionnée en B2 est son contrôle SSH du 6 novembre 2026, relayé à cet agent ; ce n’est ni un contrôle de production autonome de ce spécialiste ni une preuve de livraison d’e-mail.

## Constats priorisés

### B1 — P1 — Identité et modalités encore provisoires

**Statut : défaut de confiance vérifié ; informations à fournir par le propriétaire.**

Preuves : `src/App.tsx:86–103` affiche que les informations de l’éditeur et les conditions commerciales restent à compléter. `src/components/layout/PublicLayout.tsx:158–170` ne donne ni identité, ni coordonnées directes, ni lien vers les informations légales. `src/pages/public/index.tsx:495–514` présente uniquement le formulaire et un lien vers les forfaits.

Impact : le prospect est invité à confier un projet et des coordonnées à « studio » sans pouvoir identifier directement l’entreprise ni un interlocuteur. L’absence de ces informations affaiblit notamment les affirmations de sécurité et de protection des données présentes sur l’accueil (`src/pages/public/index.tsx:154–169`). Ce constat ne constitue pas une qualification juridique de conformité.

Action : obtenir l’identité réelle et les coordonnées professionnelles, compléter les pages correspondantes, rendre leurs liens accessibles. Clarifier également le régime des prix affichés (HT/TTC ou situation de TVA applicable), les livrables, modalités d’accord/paiement, responsabilités sur les contenus et conditions du suivi. Ces faits ne doivent pas être inventés par le développeur.

### B2 — P1 — La notification reste incomplète malgré la confirmation simplifiée

**Statut : limite opérationnelle confirmée par le coordinateur le 6 novembre 2026 ; interface de confirmation déjà modifiée.**

État actualisé : les deux parcours confirment désormais « Votre demande a bien été enregistrée » puis annoncent qu’un développeur contactera le visiteur au plus vite. Ils n’exposent plus l’indisponibilité de la notification (`src/components/inquiries/ProjectBriefForm.tsx:173–179`, `src/pages/configurator/index.tsx:549–559`). La phrase de l’audit initial décrivant un avertissement public sur la notification n’est donc plus actuelle.

Preuve opérationnelle relayée : le coordinateur a contrôlé par SSH la version en production le **6 novembre 2026**. La clé d’envoi et l’expéditeur sont présents ; `INQUIRY_TO` reste absent. Aucun secret n’a été recopié dans ce rapport. Ce contrôle de configuration n’atteste ni un e-mail effectivement envoyé ni sa réception. Il confirme la limite déjà documentée dans `ops/DEPLOYMENT_STATUS.md:22`.

Impact résiduel : les demandes peuvent être enregistrées sans alerte reçue par l’équipe. Le message plus simple améliore le parcours, mais la promesse d’être recontacté exige une prise en charge réelle des demandes conservées. La simplification de l’interface ne résout pas l’absence de destinataire.

Action : lorsque le propriétaire fournit le destinataire, configurer puis attester une réception autorisée. Dans l’intervalle, définir qui consulte les demandes enregistrées et à quelle fréquence. Ne pas envoyer un faux prospect ni un e-mail de test externe sans l’autorisation correspondante. Aucun test local ni contrôle de présence des variables ne doit être présenté comme une livraison d’e-mail réussie.

### B3 — P2 — Libellés des estimations différents entre public et dossiers

**Statut : incohérence de présentation vérifiée, pas un engagement contractuel ferme démontré.**

Preuves : les cartes affichent « À partir de » (`src/pages/public/pricing.ts:20–23`). Le socle du calcul conserve `estimated: false` et la même valeur en minimum/maximum (`shared/catalog.ts:740–747`). Le configurateur ajoute manuellement le préfixe sur les montants non variables (`src/pages/configurator/index.tsx:140–142`), tandis que le dossier utilise « Total création » lorsque `quote.estimated` est faux (`src/pages/orders/index.tsx:50–51`).

Exemples exécutés : Business seul est formaté `1 490 €` par le helper partagé ; Vitrine + réservation est formaté `980–1 070 €`. Les fourchettes sont bien qualifiées d’indicatives (`shared/catalog.ts:813–816`) et l’e-mail précise l’absence d’engagement commercial (`server/inquiries.mjs:122–125`). Il ne faut donc pas présenter ces plages comme un plafond contractuel avéré.

Impact : le statut « prix de départ » du socle n’est pas présenté de manière uniforme. Une équipe relisant un dossier peut traiter trop vite son total comme un prix arrêté.

Action : conserver les plages demandées, mais harmoniser le vocabulaire d’estimation dans les nouveaux dossiers et notifications. Expliquer que la plage additionne les options au prix de départ affiché et reste à confirmer pour le périmètre convenu. Ne pas recalculer les instantanés historiques ni transformer cette clarification en hausse de prix automatique.

### B4 — P2 — Des options à l’unité, sans quantités dans le configurateur

**Statut : limite fonctionnelle et commerciale vérifiée ; évolution de parcours à décider.**

Preuves : `Configuration` contient des booléens et des IDs d’options, pas de quantité (`shared/catalog.ts:32–41`). « Ajouter une page » est bien décrit comme un prix par page (`:470–474`), mais rendu par une seule case (`src/pages/configurator/index.tsx:463–489`). La langue supplémentaire à 100 € couvre cinq pages (`shared/catalog.ts:385–389`), le CMS Vitrine à 300 € couvre cinq pages (`:392–396`), la reprise couvre cinq pages et quinze médias (`:484–488`). Business peut compter six pages et Premium dix (`:95–106`).

Impact : un client qui souhaite traduire tout un Premium de dix pages ne dispose pas d’un total pour dix pages ; la case ne chiffre que le lot annoncé de cinq pages. Même limite pour deux pages supplémentaires ou deux langues. Les descriptions sont présentes et empêchent d’affirmer une facturation erronée, mais l’utilisateur doit comprendre lui-même que son besoin dépasse l’unité calculée.

Action : au minimum, rappeler l’unité dans le récapitulatif sélectionné (ex. « Langue supplémentaire — jusqu’à 5 pages », « 1 page supplémentaire »). Évolution possible à décider : saisir les quantités lorsque leur prix est réellement déterminé ; sinon demander le volume dans le message et conserver une estimation explicitement partielle. Ne pas doubler silencieusement une option ni inventer le prix d’un sixième contenu administrable.

### B5 — P2 — Lisibilité améliorée ; certains avantages Business restent dans les détails

**Statut : constat initial partiellement traité par les changements éditoriaux ; recommandation résiduelle de hiérarchie commerciale.**

Audit initial : le comparatif présentait des intitulés plus techniques et peu expliqués. Ce constat ne doit plus être repris comme si la clarification n’avait pas eu lieu.

État relu après modification : la description Business explique maintenant l’« espace de gestion (CMS) » et précise référencement local de base et statistiques de visites (`shared/catalog.ts:95–96`). Premium reprend explicitement Business et explique également le CMS (`:105–106`). Les lignes du comparatif ont été renommées ou détaillées : « Statistiques de visites », « Éléments 3D interactifs », « Bases du référencement naturel », « Photos de réalisations, tarifs et avis clients », avec une explication pour chaque fonction (`src/pages/public/OfferComparison.tsx:9–26`). Cette partie de la lisibilité a donc déjà été améliorée.

Point résiduel vérifié dans cette lecture : la vue initiale montre pages, CMS, statistiques puis trois éléments propres à Premium (`:9–16`). Le référencement local et les photos de réalisations/tarifs/avis clients restent dans la partie détaillée (`:22–23`). Les petites cartes affichent leurs arguments, mais pas les descriptions longues — choix explicite du composant (`src/components/layout/PricingCard.tsx:10`, `:111–118`).

Impact résiduel : pour un visiteur souhaitant trois pages modifiables, Vitrine + CMS à 1 190 € peut encore sembler très proche de Business à 1 490 €. Le supplément Business est justifié par des fonctions et une capacité supérieures ; une partie de ces différences nécessite toutefois d’ouvrir les détails. Ce n’est pas une erreur de prix ni la preuve d’une offre équivalente moins chère.

Action résiduelle : envisager de remonter le référencement local ou les photos de réalisations/tarifs/avis clients dans le comparatif initial. Garder les explications récemment ajoutées ; une nouvelle réécriture générale n’est pas nécessaire pour traiter ce point. Ne pas supprimer un choix Vitrine adapté à un besoin simple dans le seul but de forcer une montée en gamme.

### B6 — P2 — Le badge « Populaire » n’est pas étayé dans les sources examinées

**Statut : affirmation statique vérifiée ; réalité commerciale inconnue, décision propriétaire.**

Preuves : `PricingCard.tsx:104` affiche « Populaire » lorsqu’un booléen est vrai ; l’accueil applique ce booléen à Business (`src/pages/public/index.tsx:120`). Aucun justificatif de demandes ou de ventes n’a été fourni dans cette mission. Cette absence de preuve dans le code ne démontre pas que l’affirmation est fausse. Le libellé est une demande explicite du propriétaire.

Impact : « Populaire » suggère une préférence observée chez d’autres clients. S’il s’agit seulement du forfait que le studio veut privilégier, c’est une affirmation différente.

Action : demander au propriétaire de confirmer la base factuelle. À défaut, recommander une formulation assumée comme « Notre recommandation », sans la substituer silencieusement au choix explicite de Mathis.

### B7 — P2 — Les références externes inspirent, mais ne prouvent pas le travail du studio ni le périmètre vendu

**Statut : architecture de preuve vérifiée ; risque d’interprétation, pas usurpation avérée.**

Preuves : les neuf exemples sont explicitement comptés comme références externes (`src/pages/public/index.tsx:363–365`) et crédités (`:410–419`). Lactel est associé à Business et décrit par ses produits/articles/recettes (`shared/catalog.ts:157–166`), alors que blog et boutique restent des options (`:442–458`). GeoBoss est associé à Premium et décrit comme un jeu multijoueur avec classement (`:205–214`), alors que Premium prévoit seulement l’étude et le chiffrage des demandes particulières (`:105–106`). La phrase excluant une relation client est dans la page d’informations légales (`src/App.tsx:100`), pas directement dans la galerie.

Impact : le prospect peut comprendre à tort que l’ensemble du site de référence est réalisable au prix de départ du badge. Les crédits limitent la confusion sur l’auteur, mais ne donnent pas de preuve propre à l’équipe qui vend la prestation.

Action : ajouter une phrase courte près de la galerie : « Références externes pour illustrer les styles et fonctionnalités ; leur périmètre complet n’est pas inclus dans les forfaits affichés. » Préparer ensuite une ou deux études de cas réellement réalisées par l’équipe, avec rôle exact, livrable et limites. Ne pas transformer un site tiers en client, ne pas inventer de résultats ou d’avis.

### B8 — P2 — Les prestations de suivi et les travaux personnalisés restent à encadrer opérationnellement

**Statut : éléments non définis dans les textes examinés ; décisions propriétaire, pas défaut de calcul.**

Preuves : Maintenance précise les petits changements de contenus et exclut nouvelles pages/fonctions (`shared/catalog.ts:548–550`), mais le nombre ou temps d’interventions n’est pas arrêté. Sérénité ajoute une heure et la priorité (`:555–557`). Premium annonce performances/accompagnement renforcés et étude des demandes sur mesure (`:105–106`, `src/content/configurator-copy.ts:10`) sans quantité de cycles, mécanisme de validation ou livrables précis. Les textes indiquent déjà une confirmation du périmètre, ce qui doit rester.

Impact : le risque de travail non facturé se situe dans les validations, retours, contenus tardifs, support et petites interventions autant que dans le développement. Le prix seul ne borne pas ces demandes.

Action : établir une fiche interne de devis avec pages et contenus prévus, intégrations, livrables, validations, responsabilités, travaux supplémentaires et suivi. Pour le mensuel, définir le périmètre des petites interventions, l’usage de l’heure et la signification du support prioritaire, sans inventer un délai garanti ni une règle de report des heures sur le site.

### B9 — P2 — Deux différences de forfait restent sémantiquement ambiguës

**Statut : ambiguïtés résiduelles vérifiées dans les libellés ; périmètre à préciser par le propriétaire. Aucune prestation supplémentaire déduite.**

**Contenus statiques ou rubriques structurées.** Le comparatif marque « Photos de réalisations, tarifs et avis clients » comme non compris dans Vitrine (`src/pages/public/OfferComparison.tsx:23`), tandis que Vitrine est présenté comme un site personnalisé de présentation de l’activité (`shared/catalog.ts:84–85`) recevant les textes et images fournis (`src/content/configurator-copy.ts:6`). Le libellé peut laisser croire qu’un prix écrit dans un paragraphe, une photo ou une citation client ne pourrait pas figurer dans une page Vitrine. Le code et les textes ne définissent pas si l’avantage Business est une rubrique structurée, une galerie dédiée, un contenu administrable particulier ou simplement la présence de ces contenus.

Impact : la distinction peut paraître artificielle au prospect et provoquer des désaccords de périmètre. Cela ne prouve pas qu’une prestation est contractuellement incluse dans Vitrine ; l’audit ne doit ni l’affirmer ni l’ajouter.

Action : faire confirmer la frontière entre insertion de contenus statiques dans les pages prévues et fonctionnalités/rubriques Business. Ensuite seulement, nommer la fonction précise dans le comparatif. Ne pas transformer sans validation cette ligne en engagement de galerie filtrable, collecte automatique d’avis ou module tarifaire.

**Site personnalisé ou direction artistique personnalisée.** Vitrine et Business sont déjà personnalisés (`shared/catalog.ts:84–96`). La direction artistique réservée à Premium est expliquée par les couleurs, typographies et mise en page propres à la marque (`src/pages/public/OfferComparison.tsx:13`) : pour un prospect, ces critères peuvent aussi décrire ce qu’il attend d’un site personnalisé.

Impact : le supplément Premium est clair pour les animations et interactions, mais la valeur propre de la direction artistique reste difficile à apprécier. Il s’agit d’une différenciation insuffisamment définie, pas d’une preuve de doublon commercial.

Action : demander au propriétaire de préciser le travail créatif et les livrables qui distinguent réellement Premium de la personnalisation des deux autres forfaits. Illustrer ensuite cette différence avec un exemple véritable. Ne pas inventer un nombre de maquettes, de révisions, une création de logo ou une refonte de charte.

### B10 — P3 — Le CMS est expliqué, mais son usage n’est pas montré

**Statut : recommandation de preuve commerciale, pas défaut bloquant ni engagement manquant.**

Le CMS est désormais défini comme un espace permettant de modifier textes et images (`shared/catalog.ts:95`, `:272`, `:393–394`). L’accueil et la galerie présentent les forfaits et des sites publics (`src/pages/public/index.tsx:109–124`, `:367–432`), sans démonstration de cette tâche de gestion. L’amélioration du texte est réelle ; l’absence d’exemple visuel n’en fait pas une fonction absente.

Action possible : préparer une courte démonstration réelle montrant une modification de texte ou d’image puis son résultat, avec uniquement des contenus de démonstration. Choisir un emplacement adapté tel qu’une fiche ou une réponse CMS, en respectant la décision de ne pas ajouter d’aperçu à l’arrivée sur l’accueil. Ne pas utiliser une interface fictive comme preuve du CMS livré, ni laisser apparaître des données ou accès clients. Le choix de cette démonstration et de son support reste une décision produit.

## Arbitrage chiffré Vitrine / Business

Montants de création uniquement, hors suivis mensuels et services externes. Les bases sont des prix de départ. Les scénarios comportant plusieurs pages ajoutées sont des calculs manuels indicatifs, pas des sorties du configurateur actuel.

| Besoin ou sélection | Vitrine | Business | Lecture correcte |
| --- | --- | --- | --- |
| 1–3 pages sans gestion autonome | À partir de 890 € | À partir de 1 490 € | Vitrine est rationnelle si les fonctions supplémentaires n’apportent pas de valeur au besoin. |
| 1–3 pages modifiables | À partir de 1 190 € | À partir de 1 490 € | Différence 300 €, mais Business apporte capacité jusqu’à 6 pages, SEO local, galerie/tarifs/témoignages et statistiques. |
| 1–3 pages modifiables + statistiques | À partir de 1 250 € | À partir de 1 490 € | Différence 240 € ; l’offre n’est pas équivalente. |
| 4 pages modifiables + statistiques | 1 310–1 370 € calculés sur le socle affiché | À partir de 1 490 € | Une page supplémentaire peut être cochée ; le CMS couvre bien ce volume inférieur à 5. |
| 5 pages modifiables + statistiques | 1 370–1 490 € par calcul manuel de 2 pages | À partir de 1 490 € | Le configurateur ne prend pas 2 unités. Business est au même prix que la borne haute, avec davantage de fonctions ; le bas de la plage n’est pas une offre équivalente. |
| 6 pages toutes modifiables + statistiques | Non calculable à périmètre comparable | À partir de 1 490 € | 3 pages ajoutées donneraient arithmétiquement 1 430–1 610 €, mais l’option CMS Vitrine couvre seulement 5 pages. Le coût de gestion de la sixième n’est pas arrêté. Ne pas utiliser cette somme pour affirmer une équivalence. |

La réservation à 90–180 € étant optionnelle sur les trois forfaits, elle ne justifie plus la différence Vitrine/Business. Aucune recommandation de la réintégrer gratuitement dans Business.

## Options qui se complètent ou se remplacent

- **Boutique / liens de paiement :** le calcul exécuté Vitrine + boutique + liens conserve uniquement la boutique et produit 1 490–1 990 € sur le socle affiché. Ce résultat est cohérent. Business seul à 1 490 € n’inclut pas de boutique : comparaison de prix sans équivalence de besoin.
- **Blog / CMS :** Vitrine + blog = 1 040 € au socle affiché. L’éditeur des articles est compris, pas la gestion des autres pages. Ajouter CMS augmente à 1 340 € pour un besoin supplémentaire distinct. Ne pas recommander CMS au client qui veut seulement publier des articles.
- **Modèle 3D / intégration :** création dès 150 €, intégration hors Premium 250–600 €, donc ensemble dès 400 €, sans plafond total connu. La description actuelle explicite cette dépendance (`shared/catalog.ts:491–500`). La première intégration Premium est comprise ; le modèle ne l’est pas.
- **Langue / pages :** Business + langue donne 1 590 € dans le moteur, Premium + langue 2 599 €, mais seulement 5 pages traduites fournies sont couvertes. Ces montants ne chiffrent pas automatiquement tout un site de 6 ou 10 pages dans deux langues.

## Rentabilité : ce qui peut être conclu et ce qui manque

Aucune marge nette ne peut être déduite du catalogue. Il manque au minimum les heures de cadrage, production, intégration des contenus, validation, corrections et support, les coûts directs, le coût d’acquisition et la capacité de production. Les prix de départ sont cohérents comme segmentation, mais leur viabilité n’est pas démontrée.

Le passage Maintenance 39 € → Sérénité 69 € apporte 30 € de recettes mensuelles supplémentaires pour une heure incluse et la priorité. Si l’heure est entièrement utilisée, cet écart ne finance que 30 €/h avant support additionnel et coûts. Ce n’est ni une marge ni la preuve que l’abonnement complet est déficitaire. Décision nécessaire : suivre l’utilisation réelle et tester le prix avec les coûts de l’équipe avant de promettre une capacité de suivi à grande échelle.

## Recommandations de conversion secondaires

- Le formulaire annonce un retour par e-mail mais exige aussi le téléphone (`src/components/inquiries/ProjectBriefForm.tsx:199–211`). C’est une friction possible, pas une baisse de conversion mesurée. Arbitrer l’intérêt commercial du téléphone obligatoire ; aucun taux de conversion inventé.
- L’accueil explique choix, message et préparation (`src/pages/public/index.tsx:131–143`), mais pas les étapes de réalisation, validation et livraison. Une courte progression réellement pratiquée rassurerait davantage, sans promettre de calendrier chiffré.
- Les questions sur propriété/accès, livrables remis, corrections après livraison et fin du suivi ne reçoivent pas de réponse précise dans les 17 FAQ actuelles. Définir ces décisions avec le propriétaire avant d’ajouter des réponses. Une FAQ plus longue avec des engagements improvisés serait contreproductive.

## Ordre conseillé

1. Compléter les faits d’identité et assurer la prise en charge des demandes.
2. Harmoniser les libellés d’estimation et rappeler les unités dans la sélection.
3. Mettre les différences Business au premier niveau et qualifier le périmètre des références externes.
4. Arrêter les limites de prestation et mesurer les heures/coûts.
5. Ajouter des preuves propres à l’équipe et des réponses sur les modalités réellement retenues.
