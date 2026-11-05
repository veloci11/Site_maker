# Audit général du site et du modèle de prix

4 novembre 2026, date du client — https://gilmathis.com/. Audit et propositions uniquement. Aucun tarif adopté, aucun fichier produit changé, aucun déploiement ni formulaire envoyé.

## Décision recommandée

Afficher **les prix en euros au premier plan**, sous forme de forfaits et d’options dont le périmètre est défini. Garder les heures pour calculer les prix et vérifier la capacité de production. Un détail facultatif de charge peut être utile ; une intervention réellement vendue au temps peut afficher un taux et un budget maximum convenus.

L’utilité recherchée par Mathis est précise : **obtenir son budget avant de donner ses coordonnées, puis éviter les suppléments non compris**. Le site possède déjà le bon ordre de parcours, mais les montants manquent et plusieurs cases couvrent des volumes indéfinis. Ce sont les deux principaux obstacles. Ajouter partout « 1 h / 2 h / 20 h » ne les résoudrait pas.

L’objectif d’une estimation à ±10–20 % reste à démontrer sur des projets réels comparables, à périmètre constant. Une fourchette, un plafond et un prix ferme sont trois engagements différents. La règle commerciale proposée est de confirmer prix et périmètre avant démarrage, puis de présenter et faire accepter tout changement avant le travail supplémentaire. Elle n’est pas encore publiée ni adoptée.

## Méthode et preuves

Cinq conseillers distincts ont rédigé un avis initial indépendant. Le coordinateur a ensuite mélangé les cinq avis sous les identifiants A–E ; chacun a relu l’ensemble et rédigé sa critique séparément. Les avis initiaux ont été préservés et leurs empreintes SHA-256 enregistrées. L’arbitrage ci-dessous repose sur les preuves et les contraintes du projet, pas sur un vote.

Le coordinateur a contrôlé la production dans le navigateur intégré : ordinateur 1440 × 900, mobile 390 × 844. Les captures ont été enregistrées puis rouvertes et inspectées. Une capture de galerie prise avant la fin du chargement et une capture Sur mesure incomplète ont été remplacées par des captures stables. Les écrans légaux provisoires, les prix en points de suspension et le retrait silencieux de Galerie ont été confirmés en production.

- [Avis 1 — parcours](avis-1-parcours.md), [avis 2 — interface](avis-2-interface.md), [avis 3 — technique](avis-3-technique.md), [avis 4 — budget](avis-4-budget.md), [avis 5 — confiance](avis-5-confiance.md).
- [Corpus anonymisé](corpus-anonyme.md), [empreintes des avis](sceau-avis-initiaux.json).
- [Relecture 1](relecture-1.md), [relecture 2](relecture-2.md), [relecture 3](relecture-3.md), [relecture 4](relecture-4.md), [relecture 5](relecture-5.md).
- [Parcours visuel numéroté et captures](design-qa.md).

Sources locales relues sur `main`, révision `a90cbce2883ea2d1e264df0866d062c95831b417`. Ce numéro décrit le checkout audité ; aucune égalité complète entre cette révision et la release de production n’a été contrôlée dans cet audit.

## Les cinq priorités

1. **Définir ce que le client achète**, avec les quantités, les limites et les cas qui sortent du standard ; arrêter ensuite les prix correspondants.
2. **Afficher le budget avant les coordonnées** : création, options ponctuelles, récurrents choisis, frais externes et inconnues explicites.
3. **Donner une estimation conservable et maîtriser les changements** : récapitulatif, date/version, correction possible, prix confirmé avant démarrage et accord avant extension.
4. **Achever les éléments de confiance** : identité réelle, textes légaux et liens visibles, confirmation compréhensible ; réception réelle des demandes à vérifier au moment prévu.
5. **Corriger les frictions prouvées**, puis finir les animations : expliquer les options retirées/devenues incluses, foncer les petits textes et signaler brièvement un prix modifié.

P1 ci-dessous signifie important avant de présenter le site comme un estimateur commercial fiable. Il ne signifie pas nécessairement panne ou régression. Les points de préparation déjà connus sont identifiés comme tels.

## Liste générale priorisée

| Priorité | Constat | Action proposée et preuve |
|---|---|---|
| P1 — préparation connue | **Aucun budget public exploitable.** Accueil, Vitrine, Connecté et 3D montrent « À partir de… » ; les options « + … € ». | Adopter les montants après définition du périmètre. Retirer les ellipses comme état commercial permanent. Source : `shared/catalog.ts:519`, `src/pages/public/index.tsx:57`. Captures 02, 03, 08, 15, 16. Aucun tarif de l’étude antérieure repris automatiquement. |
| P1 — modèle commercial | **Le forfait de base ne définit pas encore une quantité de travail vendue.** Le nombre et les types de pages, le volume des contenus et les retours inclus ne sont pas bornés dans l’offre. | Écrire une fiche d’inclusions/exclusions pour chaque base. Les nombres restent à choisir ; cet audit ne les invente pas. `shared/catalog.ts:66`, `shared/brief.ts:45`. |
| P1 — modèle commercial | **Certaines options ne sont que des cases pour un besoin variable.** Pages supplémentaires, boutique, reprise de contenus, intégration, modèle 3D. | Ajouter unités/paliers et critères d’éligibilité : volume, type de parcours, service standard, modèle fourni/créé. Un cas hors limites doit être signalé. `Configuration` ne contient pas de quantités (`shared/catalog.ts:26`) ; descriptions ouvertes aux lignes 393, 421, 449, 477. |
| P1 — transparence | **Le total ne donne pas encore tout le budget pour disposer et exploiter le site.** Ponctuel et mensuel sont déjà séparés ; domaine, outils externes et traitement fiscal ne sont pas explicités près du total. | Afficher création, mise en ligne choisie, récurrents choisis, frais tiers inclus/exclus/inconnus et présentation fiscale réelle. Ajouter une projection sur 12 mois quand calculable, sans en déduire une durée d’engagement. `configurator/index.tsx:289`, `shared/catalog.ts:257`. Captures 03 et 11. |
| P1 — confiance | **Informations d’éditeur et textes légaux encore provisoires ; accès absent du footer.** | Compléter avec les informations réelles puis rendre les pages accessibles au pied de page. `src/App.tsx:25`, `PublicLayout.tsx:190`. Captures 02 et 13. Ce constat n’est pas une validation juridique globale. |
| P2 — positionnement | **Le premier écran ne communique pas encore l’avantage “budget avant contact”.** | Quand l’estimation sera disponible, faire apparaître cette utilité dans l’introduction et envisager « Estimer mon site » comme action principale. `src/pages/public/index.tsx:151`. Capture 02. Ne pas promettre aujourd’hui une précision non démontrée. |
| P2 — parcours | **Des questions qui peuvent changer le prix arrivent après la configuration.** Les réponses libres du brief peuvent révéler beaucoup plus de travail, mais ne changent jamais le prix. | Poser avant les coordonnées quelques questions structurées qui déterminent le prix. Signaler le hors-standard sans ajouter une option payante à l’insu du client. Conserver les précisions de production dans le brief. `shared/brief.ts:45`, `ProjectBriefForm.tsx:317`. |
| P2 — vérification client | **La vue d’ensemble est dispersée avant l’envoi.** Options dans « Votre sélection » replié, réponses réparties en accordéons. | Ajouter une synthèse compacte avant le bouton d’envoi, avec liens de modification, budget, volumes et points à confirmer. Une nouvelle étape obligatoire n’est pas nécessaire. `configurator/index.tsx:330`, `ProjectBriefForm.tsx:532`. Capture 05. |
| P2 — comportement reproduit | **Un changement de forfait retire des choix sans expliquer lesquels.** Vitrine avec mobile + Galerie → Connecté : mobile devient inclus, Galerie disparaît et la carte revient à « Forfait de base ». | Un message explicite doit distinguer les éléments devenus inclus, conservés et retirés. Il ne faut pas prétendre que Galerie est techniquement impossible dans Connecté : seule son exclusion du catalogue public est établie. `configurator/index.tsx:46`, `:179`, `shared/offer-options.ts:21`. Capture 15 et observations DOM avant/après. |
| P2 — trace client | **Pas de récapitulatif conservable ou de référence présentée au client après envoi.** | Prévoir une version imprimable/téléchargeable, avec configuration, périmètre, montant/fourchette, frais et date/version. Disponible avant coordonnées si possible ; aucune donnée personnelle ou référence privée dans localStorage. `configurator/index.tsx:485`, `ProjectBriefForm.tsx:380`. Lecture source, succès non déclenché en production. |
| P2 — contenu | **La confirmation parle de l’état technique du service d’e-mail.** | Expliquer demande enregistrée, prochaine étape et référence. Si un incident empêche la notification, conserver une information honnête et une action utile réellement disponible. Ne pas affirmer une réception non vérifiée ni inventer un délai de réponse. Même sources que ci-dessus. |
| P2 — risque futur | **Un changement de tarif pendant la saisie peut changer l’estimation enregistrée.** Le serveur recalcule avec le catalogue courant sans recevoir la version vue. | Avec l’activation des prix, comparer la version et faire confirmer un changement ; garder le serveur responsable du calcul. `configurator/index.tsx:134`, `ProjectBriefForm.tsx:317`, `server/inquiries.mjs:178`. Aucun supplément ou paiement incorrect observé aujourd’hui. |
| P2 — évolution future | **Une seule ligne inconnue fait disparaître le total ponctuel calculable.** | Montrer éventuellement « Partie chiffrée : X ; postes restant à estimer : Y ». Ne jamais appeler ce sous-total coût complet, prix garanti ou plafond. `shared/catalog.ts:661`. Le comportement actuel évite correctement de compter une inconnue comme zéro. |
| P2 — accessibilité locale | **Certains petits textes secondaires sont trop clairs.** `#81758c`, 11 px : ratio calculé 4,324:1 sur blanc ; fond proche dans la capture 14. | Foncer les numéros de rubrique et « Facultatif », puis vérifier les fonds réellement composités. `brief-form.css:10`, `:22`, `project.css:79`. Le repère du texte courant est 4,5:1 selon [W3C, contraste minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), page vérifiée dans l’IAB pendant cet audit. Pas de conclusion globale sur l’accessibilité. |
| P2 — compréhension | **Les références externes montrent un rendu, mais ne bornent pas ce que le forfait livrerait.** | Préciser le seul aspect illustré, ajouter un lien d’estimation lié à l’offre et des scénarios de budget propres au studio. Ne pas donner le prix supposé d’un site tiers ni laisser entendre que tout Cal.com est compris dans Connecté. `src/pages/public/index.tsx:633`. Capture 10. |
| P2 — résilience future | **Chargement, prix à définir et panne du catalogue ne sont pas distingués partout.** | Une fois les montants activés, afficher un état clair et une action de réessai. `src/pages/public/index.tsx:41`, `configurator/index.tsx:439`. Aucun incident du catalogue n’a été constaté en production. |
| P3 — animation utile | **Le nouveau montant n’a pas de feedback visuel dédié.** Les coches, compteurs et annonce `aria-live` existent. | Après activation des tarifs, tester une mise en évidence de 150–200 ms du total/delta, avec valeur finale immédiate. Pas de compteur qui déroule. `configurator/index.tsx:289`. Captures 04 et 08. |
| P3 — à mesurer | **Corps des pages rendu côté client.** Métadonnées serveur déjà présentes. | Mesurer chargement, exploration et indexation avant de décider d’un prérendu. `index.html:13`, `src/main.tsx:6`, `server/seo.mjs:32`. Aucun mauvais classement, défaut d’indexation ou résultat Core Web Vitals démontré. |
| P3 — arbitrage produit | **Une simple question exige aussi le téléphone alors que le contact annonce une réponse par e-mail.** | Éventuel test futur d’un contact bref ou d’une explication de l’usage du téléphone. L’obligation est une décision actuelle explicite : aucun retrait préconisé comme correction automatique. `src/pages/public/index.tsx:813`, `ProjectBriefForm.tsx:452`. Capture 12. |

## Animations : où en ajouter et quoi conserver

Le site a déjà des entrées de page courtes, des accordéons animés, un dépliage du comparatif et les fondus/grain des cartes. Leur présence est vérifiée dans les sources actuelles ; cet audit n’a pas effectué un enregistrement image par image de toutes les transitions ni une nouvelle certification reduced motion.

| Zone | Décision recommandée | But |
|---|---|---|
| Total de configuration | Bref signal sur la valeur finale et le delta, après activation des prix | Comprendre ce que la dernière sélection change dans le budget |
| Changement de forfait | Message textuel explicite, accompagné éventuellement d’un fondu | Comprendre les choix retirés ou devenus inclus |
| Passage options ↔ brief | Conserver le comportement actuel, testé sur mobile | Le titre et les champs arrivent déjà correctement à l’écran |
| Accordéons, comparatif, cartes, filtres | Conserver les animations courtes ; vérifier après toute évolution | Les retours d’état existent déjà |
| Fond, défilement, carte suivant le pointeur | Aucun ajout recommandé | Décisions visuelles approuvées ; priorité à la lisibilité, sans mouvement permanent |

Les propositions de micro-animation doivent respecter reduced motion, le clavier et l’annonce accessible du prix. Elles ne doivent jamais retarder le résultat du calcul.

## Heures ou prix : comparaison et proposition concrète

| Modèle | Ce que comprend le client | Utilisation recommandée |
|---|---|---|
| « Fonction : 2 h » | Une quantité de travail, mais pas forcément la dépense finale ni le délai | Détail explicatif facultatif ; éviter un compteur permanent pour les créations |
| « Fonction : X €, pour ce périmètre » | Résultat et dépense définis | Base et options réellement standardisées |
| « Projet estimé : X–Y €, sous ces hypothèses » | Budget initial et raisons de variation | Périmètre encore à vérifier, avec bornes défendables |
| « Intervention : taux, charge estimée, maximum accepté » | Achat volontaire au temps, limité | Diagnostic ou évolution ciblée si ce mode est choisi |

**Structure client proposée :** budget de création, détail des fonctions/quantités, mensualités choisies, autres frais connus ou inconnus, hypothèses et exclusions. Le visiteur peut modifier et conserver son estimation sans fournir ses coordonnées. Le brief détaillé vient ensuite.

**Exemple strictement fictif de présentation, aucun tarif de vente proposé :** base 1 000 € + option 150 € + mise en ligne 100 € = 1 250 € de création. Hébergement choisi à 15 €/mois : 1 430 € sur les douze premiers mois, hors les postes tiers explicitement nommés. Cette projection ne signifie pas un engagement de douze mois. Le traitement fiscal doit être affiché selon la situation réelle ; les montants de cet exemple ne sont ni HT ni TTC validés.

Si le besoin reste incertain, montrer une fourchette motivée plutôt qu’un faux prix ferme. Une estimation de 1 500 € à ±10 % correspond à 1 350–1 650 € ; à ±20 %, 1 200–1 800 €. Cette marge ne doit pas être interprétée comme une autorisation de supplément. La promesse à construire est surtout : le client voit le montant confirmé avant le démarrage et accepte toute extension avant son exécution.

### Comment construire une précision défendable

1. Définir les scénarios standard, inclusions, unités et bornes ; sortir explicitement de l’automatique pour les cas inconnus.
2. Estimer en interne préparation, conception, échanges, réalisation, tests, retours prévus et livraison choisie. Distinguer coût horaire et taux de vente : un taux de vente peut déjà intégrer frais et marge, qui ne doivent pas être ajoutés une deuxième fois.
3. Recueillir seulement les variables qui déterminent le montant avant l’estimation : quantités et critères explicites, sans supposer qu’un texte libre est interprétable avec fiabilité.
4. Comparer estimation et prix final sur les projets terminés, en isolant les changements de périmètre demandés. Mesurer séparément l’effort réel pour vérifier la viabilité des prix.
5. N’annoncer ±10–20 % que pour les catégories où cette précision est réellement soutenue. Pour une refonte inconnue ou de la 3D complexe, garder une incertitude explicite.

## Garder, remplacer, ajouter

- **Garder** les six prestations, les matières originales, le fond statique, la carte sélectionnée, les options explicites, Vitrine ordinateur avec mobile facultatif, le mensuel séparé, les crédits externes et la barre mobile.
- **Remplacer à terme** les points de suspension par les prix adoptés, les options trop ouvertes par des prestations bornées, et le jargon d’e-mail par une confirmation compréhensible et honnête.
- **Ajouter d’abord** le périmètre commercial, les unités/paliers, le coût complet, une synthèse conservable, les règles de changement de prix et les informations réelles du studio.
- **Ajouter ensuite** les retours visuels sur les changements et les scénarios de budget. Aucune refonte générale ni suppression d’une catégorie ne ressort des preuves recueillies.

## Arbitrages après confrontation des avis

- **Défaut de défilement mobile écarté.** La capture 06 a été prise après redimensionnement. Le vrai clic mobile, capture 14, arrive bien au titre et aux champs. Aucun ticket d’autoscroll ou de compaction prioritaire retenu.
- **Image GeoBoss cassée écartée.** L’image s’est chargée, dimensions naturelles 1600 × 900, et la capture 10 finale la montre. Le premier blanc était transitoire.
- **Risque sticky tablette non retenu.** Pas de reproduction probante dans cette session.
- **Fourchette universelle non retenue.** Un vrai forfait fixe borné n’a pas besoin d’un min/max artificiel. Les postes incertains doivent être traités à part.
- **Téléphone obligatoire maintenu comme choix actuel**, simple hypothèse de test futur.
- **Réception Resend à vérifier ultérieurement.** L’adresse a été volontairement reportée ; cet audit ne prouve aucune panne ni réception. Aucune relance d’adresse ni envoi de test.
- **SEO à mesurer**, derrière les problèmes de budget directement prouvés.

## Validation et limites

Le conseiller technique a exécuté les tests existants ciblés : catalogue, brouillon, options publiques, SEO, coordonnées et conseil briefs. **55 tests passants, aucun échec.** Aucun calcul incorrect n’a été démontré. Ce résultat local ne prouve pas la livraison d’e-mails, l’absence de tout bug, la conformité juridique, l’accessibilité complète ou les performances en conditions réelles.

Les captures de formulaires ne valident pas leur soumission : aucune demande ni image transmise à la production. Aucune consultation de dossier client privé ou de configuration sensible. Aucun serveur local lancé, aucun commit/push/déploiement. Viewport réinitialisé et onglets temporaires fermés.

Les taux d’abandon, l’effet commercial des heures et la précision des futurs tarifs ne sont pas mesurés : les recommandations sur ces sujets restent des hypothèses de conception à tester. L’étude de prix existante n’a pas été actualisée et ses montants ne sont pas adoptés par cet audit.

La prochaine étape recommandée est de rédiger les périmètres de base et les unités des options, puis d’arrêter les tarifs avant d’implémenter l’estimateur.
