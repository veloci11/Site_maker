# Dossier de relecture croisée A–E

Les cinq avis ci-dessous ont été remis avant ce dossier. Aucune identité ou spécialité d’auteur n’est fournie. Chacun reconnaît naturellement son propre texte : il s’agit d’une relecture anonymisée, pas d’un aveugle total. Jugez les preuves et les propositions, sans essayer d’identifier les auteurs.


## Avis A

Phase 1, 3 novembre 2026. Revue indépendante du code, deux sources lues dans l’IAB. Aucun autre avis lu, aucune soumission ou modification applicative.

## Ce qui fonctionne déjà

Validation partagée navigateur/serveur, clés inconnues rejetées et conditions évaluées sur les parents validés (`shared/brief.ts:405–501`). Transaction demande/brief/images/outbox et idempotence incluant les octets (`server/inquiries.mjs:168–188`). Consultation et images réservées à l’admin (`server/inquiry-admin.mjs:21–53`). Garde de navigation et retour aux options conservant la saisie déjà présents ; ne pas les réimplémenter ni mettre coordonnées/liens privés dans localStorage.

## Priorités

**P2 confirmé — aucun moyen de fournir les contenus lourds.** La section finale accepte uniquement six images JPEG/PNG/WebP, 5 Mio chacune et 20 Mio au total (`ProjectBriefForm.tsx:472–507`, `brief-form-files.ts:19–30`). Les textes, documents, archives, vidéos et modèles 3D ne passent pas ; l’erreur ne propose qu’un allègement. Ajouter le lien dès cette section, facultatif et disponible même sans image, plutôt que seulement après une erreur.

Questions proposées, communes aux sept contextes :

- « Lien de téléchargement de vos fichiers » — URL facultative. Aide : « Pour vos documents, vidéos, modèles 3D ou fichiers de plus de 20 Mio : ajoutez un lien WeTransfer, SwissTransfer ou un autre espace de partage. N’indiquez aucun mot de passe. »
- « Que contient ce lien ? » — texte facultatif, affiché si le lien existe. Aide : « Par exemple : logo, textes, photos ou modèle 3D. Indiquez sa date d’expiration si vous la connaissez. »

Le lien est facultatif, non facturable, sans compte fournisseur obligatoire ni conservation illimitée promise.

**P2 — préserver réellement l’historique lors de la refonte du questionnaire.** Le DTO conserve les réponses brutes mais son résumé est recalculé avec le questionnaire actuel (`server/inquiry-admin.mjs:30–37`, `shared/brief.ts:506`). Supprimer des identifiants ou des valeurs de choix ferait disparaître leurs réponses du résumé. Conserver les anciens identifiants/valeurs et une lecture historique ; si une question disparaît du parcours neuf, ne pas jeter son contenu archivé. Le message enregistré constitue déjà un instantané utile (`server/inquiries.mjs:142–151`). Ce risque concerne la modification envisagée, pas une perte constatée en production.

**P3 confirmé — réponses contradictoires possibles.** Les multisélections ajoutent chaque valeur sans exclusivité (`ProjectBriefForm.tsx:111–113`), et la validation vérifie seulement appartenance et unicité (`shared/brief.ts:451–472`). « Je ne sais pas » peut donc accompagner des accès précis ou des interactions 3D. Rendre les choix d’incertitude exclusifs dans l’UI et dans la validation ; ne pas supprimer les valeurs historiques.

## Questions métier à préciser sans alourdir tous les parcours

- **Vitrine :** remplacer le fourre-tout par « Quelles informations vos visiteurs doivent-ils trouver pour vous contacter ? » — facultatif, exemples téléphone, adresse professionnelle, zone desservie, formulaire. Ne pas demander l’adresse personnelle du porteur.
- **Connecté :** « Combien de personnes utiliseront le site au lancement ? » et « Certains contenus doivent-ils rester réservés à une personne ou un groupe ? » — facultatifs, ordre de grandeur ou « À définir ». Prévoir une branche sur les catégories de données sensibles, sans demander d’exemples réels ni d’export client.
- **3D :** « Combien d’objets, de produits ou de scènes sont concernés ? » — facultatif. La description du modèle ne doit pas forcer un débutant à connaître poids/format ; conserver une réponse d’incertitude. « Avez-vous l’autorisation d’utiliser ces modèles et visuels ? » — facultatif : oui / à vérifier / à créer, sans promesse juridique.
- **Sur mesure :** conserver le scénario complet et les priorités de lancement, déjà utiles. Ajouter seulement « Quels volumes approximatifs devons-nous prévoir ? » — facultatif, exemples comptes, opérations ou documents ; éviter un second inventaire des données et validations.
- **Évolution :** demander « S’agit-il d’ajouter une fonction ou de corriger un problème ? » puis, uniquement pour un problème, « Quelle action pose problème, que se passe-t-il et quel résultat attendez-vous ? ». Facultatif ; captures ou lien de transfert possibles.
- **Refonte :** « Disposez-vous d’une sauvegarde récente récupérable ? » — facultatif, oui / non / je ne sais pas. La continuité et les URL importantes sont déjà bien couvertes : ne pas demander au prospect de réaliser lui-même un audit SEO.

## Implémentation et vérifications indispensables

Stocker le lien comme réponse du brief dans une section commune Fichiers. Le JSON/multipart, le hash d’idempotence, SQLite, la sauvegarde, le résumé admin et l’e-mail texte peuvent alors le transporter sans nouveau stockage de fichiers ni endpoint de téléchargement. Conserver la limite d’images ; un lien n’autorise pas un import automatique de gros fichiers.

Réutiliser la validation URL bornée à 2048 caractères : protocole HTTP(S), pas d’identifiants, caractères de contrôle, espace ou antislash (`shared/brief.ts:393–403`). HTTPS seul pour ce champ est préférable. Ne faire **aucun fetch, HEAD, résolution DNS, aperçu ou vérification automatique** du lien. L’admin peut disposer d’un lien explicite affichant son domaine, avec nouvel onglet et `noopener noreferrer`. Aucun lien de transfert privé dans les pages publiques, analytics ou journaux d’erreur. Aucune liste fermée de deux fournisseurs nécessaire si rien n’est téléchargé.

Tester : absent/valide/invalide, changement de fournisseur, liens courts `we.tl`, userinfo trompeur, protocoles actifs, conditions et erreur ciblée ; même UUID/même lien = même demande, lien changé = conflit ; JSON et multipart ; lecture admin/notification injectée/restauration ; ancienne demande lisible ; conservation du lien en repliant et en revenant aux options.

## Confiance et sources

La transaction étaye « demande enregistrée » ; elle n’étaye pas « e-mail livré » ni « traitement immédiat ». Le destinataire Resend reste différé. Aucun avis client, taux de satisfaction ou rabais moyen sans preuve. Les pièces jointes sont effectivement privées dans l’application, mais le lien externe reste soumis aux réglages du fournisseur.

- [OWASP SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) : une URL utilisateur devient un risque de requête serveur lorsqu’elle est suivie ; la conserver sans la visiter évite d’introduire ce comportement.
- [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) : défenses combinées, bornes de taille/type et stockage hors accès public ; le lien ne justifie pas de retirer les protections existantes.

Pas de test de production, d’appareil physique ou de benchmark. Onglet fermé.


## Avis B

03/11/2026. Lecture du catalogue, des sept questionnaires et de l’accueil. Recherches dans un onglet IAB isolé, sans formulaire soumis ni compte créé. Aucun autre avis consulté ; aucune modification applicative.

## Constats vérifiables

- `shared/catalog.ts:519–525` : toutes les bases/options sont sans prix. L’accueil ne peut pas promettre un prix définitif ou une économie mesurée ; le comparateur produit montre des inclusions, pas une preuve de prix national.
- `shared/catalog.ts:74` : Vitrine comprend l’ordinateur, tandis que Connecté/Immersif comprennent mobile. Respecter cette décision, mais comparer le prix **avec mobile ajouté** aux concurrents qui le comprennent.
- `src/pages/public/index.tsx:158–160` explique les types de sites mais ne dit pas concrètement comment le client est aidé. Les étapes `:213–218` évoquent seulement nom/e-mail alors que prénom/nom/e-mail/téléphone sont désormais requis. Elles devraient décrire le brief et sa vérification, pas minimiser la démarche.
- `shared/brief.ts:109–111` rend obligatoire une description de données par types/champs. C’est utile au développeur mais le client peut croire devoir concevoir une base de données. `:325–327` rend même obligatoires des détails SEO conditionnels.
- `ProjectBriefForm.tsx:475–489` permet seulement six images, 5 Mio chacune/20 Mio ensemble. Les documents PDF, vidéos et modèles 3D ont besoin du lien demandé, même sous 20 Mio.
- Refonte/Évolution demandent déjà problème/changements et éléments à conserver (`brief.ts:269–305`) : ne pas rajouter une deuxième formulation des mêmes questions.

## Questions à retenir et à alléger

1. Tous les contextes, dans les pièces jointes : **« Un lien vers vos fichiers ? »**, URL facultative. Aide : « Pour un dossier volumineux, une vidéo, un PDF ou un modèle 3D, collez un lien SwissTransfer, WeTransfer ou un autre lien de partage. Vérifiez sa durée de validité. N’y placez pas de mots de passe ni de données de vos clients. » Ne pas imposer une inscription externe ni aller télécharger automatiquement. Conserver les limites actuelles des images.
2. Vitrine : **« Quels services ou offres faut-il mettre en avant en premier ? »**, texte long facultatif, avec exemple court.  ne pas le rendre obligatoire en plus d’activité/cible/action/pages.
3. Connecté : renommer `dataFields` en **« Quelles informations vos utilisateurs devront-ils retrouver ou enregistrer ? »** ; aide « Par exemple : leur profil, une réservation ou le suivi d’une demande. Décrivez avec vos mots. » Garder la collecte métier obligatoire mais retirer la demande de concevoir des champs. Ajouter **« Combien de personnes utiliseront le site environ ? »**, texte facultatif « Une estimation ou “à définir” suffit. » Ajouter les références visuelles déjà disponibles ailleurs.
4. Refonte : **« Quelle quantité de contenus faut-il reprendre environ ? »**, texte facultatif (pages, articles, produits ; “je ne sais pas” accepté). Cela influence réellement le travail de migration. Rendre `seoDetails` facultatif : avoir un outil ne signifie pas comprendre ses métriques.
5. Évolution : **« Parmi ces changements, lesquels faut-il traiter en premier ? »**, texte facultatif, sans refaire la liste requise des changements. Utile pour proposer une intervention limitée au budget.
6. Sur mesure, Refonte, Évolution uniquement : **« Avez-vous un budget à ne pas dépasser ? »**, texte facultatif avec « Une estimation suffit ; vous pouvez aussi en discuter avec nous. »  Inutile de redemander un budget à chaque petit forfait déjà configuré.
7. 3D : détails du modèle facultatifs ; conserver objet/bénéfice/modèle disponible comme questions principales. Demander un fichier ou un lien plutôt que le poids/format/animations obligatoires que le studio peut analyser.

## Accueil proposé

Garder le titre et les cartes approuvés. Description courte : **« Vous décrivez votre activité et ce que votre site doit permettre. Nous vous aidons à choisir les bonnes fonctions, puis réalisons votre site. »**

Accompagnement utile près des étapes : **« Un doute sur le forfait ? Décrivez votre projet : notre équipe vérifie votre choix avant de commencer. »** C’est cohérent avec les deux FAQ déjà approuvées, sans nouvelle garantie commerciale.

Étapes : **« Choisissez vos fonctions » → « Décrivez votre projet » → « Préparons sa réalisation »**. Le texte du troisième indique que le besoin et la configuration sont repris avec le client. Éviter « un site pour vous », badges génériques, compteurs, avis fictifs, garantie de position Google, délai fixe ou “50 % moins cher” universel. Ne pas promettre une réponse par e-mail déjà envoyée : la destination Resend est encore différée.

## Sources tarifaires effectivement lues

Ces offres primaires ne constituent pas une moyenne française.

- [Agence Easy](https://www.sites-internet-easy.fr/creation-de-sites-internet/tarifs-creation-site-internet.html) : vitrine dès **1 490 € HT**, avancé avec réservation/configurateur/espace privé **2 900 € HT**, refonte **1 900 € HT**, portail/métier **4 900 € HT**. Suivi/hébergement séparés à **29/89/169 € HT/mois**. Offre créateur à 950 € HT liée à un engagement de douze mois : pas un prix autonome. Tarifs indicatifs 2026 avec devis.
- [123SolutionWeb](https://www.123solutionweb.fr/tarif-site-vitrine/) : affiche **849 €**, TVA non applicable, pour 5–8 pages/mobile, mais présente plus bas **849 € + 42 €/mois pendant douze mois** pour un one-page. Contradiction interne : ne pas retenir 849 € comme référence nette comparable. Le deuxième bloc correspond arithmétiquement à **1 353 € sur douze mois**, sous réserve de confirmation du prestataire.
- [Le Site Français](https://le-site-francais.fr/prix-site-internet/) : location **49/99/129 € HT/mois sur 48 mois**, maintenance/hébergement compris, soit respectivement **2 352/4 752/6 192 € HT engagés**. Pas un achat au prix d’un mois ; les fonctions et modèles de pages varient.
- [WebStart 3D](https://wstart.fr/creation-site-web/3d-website-development/) : devis, **aucun prix visible** dans la page actuelle. Le résultat Google annonçait 1 023 € ; ce montant est écarté faute de confirmation primaire. Aucun prix 3D national déduit.

Conclusion : viser une offre accessible exige un périmètre de base explicite et un coût total comparable. L’économie par gabarits doit financer le cadrage/recette et une marge pour les retours, pas faire disparaître ces tâches. Les six fourchettes finales doivent être des recommandations conditionnelles, jamais des faits de marché ou des prix publiés sans arbitrage.


## Avis C

Revue indépendante du code, des sept questionnaires et de l’accueil, le 3 novembre 2026. Sources consultées dans l’IAB uniquement. Aucune modification applicative ni soumission. Les risques de conversion sont des hypothèses UX.

## Diagnostic et priorités

**Aucun P1 confirmé.** Enrichir les renseignements tout en évitant une succession de rédactions. À l’ouverture : Vitrine 10 questions, Connecté 16, 3D 15, Sur mesure 16, Évolution 14, Refonte 17, Contact 3, hors coordonnées/images. Sur mesure présente 10 textes longs ; Connecté et Refonte 8. Comptage direct dans `shared/brief.ts`.

1. **P2 — Aucun lien externe.** `ProjectBriefForm.tsx:472-508` accepte seulement des images, jusqu’à 20 Mio. Ajouter dans « Vos fichiers · facultatif » **« Lien vers vos fichiers »**, facultatif partout : **« Pour des fichiers volumineux, des documents ou un modèle 3D, collez un lien WeTransfer, SwissTransfer ou un autre lien de partage accessible à notre équipe. »** Afficher ce champ avant une erreur de poids, même pour de petits PDF/GLB. Conserver le lien dans le dossier et le récapitulatif, sans téléchargement automatique ni mot de passe. Ne pas promettre la récupération avant expiration.

2. **P2 — Technicité obligatoire.** `shared/brief.ts:202-204` rend obligatoire un champ sollicitant format, poids, textures et animations. Conserver `modelStatus` obligatoire ; rendre `modelDetails` facultatif : **« Avez-vous des précisions sur le fichier 3D ? »**, aide : **« Si vous les connaissez : format, textures, animations. Vous pouvez aussi partager le fichier ci-dessous pour que nous l’examinions. »** Ne pas forcer une fausse précision.

3. **P2 — Sélections incohérentes.** `availableAccess` permet « Je ne sais pas » avec « Administration du site » (`brief.ts:98-105`) ; `interactions3d` combine « À définir ensemble » et des interactions précises (`209-216`). Rendu et validation les acceptent (`ProjectBriefForm.tsx:112-115`, `brief.ts:451-472`). Rendre l’incertitude exclusive. « Accès à récupérer » peut coexister avec certains accès disponibles : le traiter séparément.

4. **P2 éditorial — Accueil inexact.** `public/index.tsx:214-215` annonce nom/e-mail. Quatre coordonnées sont obligatoires : corriger le texte, conserver l’exigence de Mathis.

## Questions à enrichir ou alléger par forfait

| Parcours | Proposition exacte et statut | Décision de conception |
|---|---|---|
| Tous hors Contact | **« Avez-vous déjà un logo ou une identité visuelle à respecter ? »** — facultatif : Oui / En partie / Non / À préciser | « Contenus prêts » ne précise pas l’identité à reprendre. Détails facultatifs conditionnés à Oui/En partie. |
| Vitrine | **« Dans quelles villes ou régions intervenez-vous ? »** — facultatif, aide « Indiquez aussi si votre activité se déroule en ligne. » | Collecter une information directement exploitable dans les contenus et le référencement local, actuellement seulement suggérée par l’exemple d’audience (`34-35`). Ne pas ajouter de jargon SEO. |
| Contenus partiels/à créer | **« Quels contenus restent à préparer, et qui s’en occupera ? »** — conditionnel et facultatif | `contentReady` indique l’avancement, pas la responsabilité (`45-53`). Cette question anticipe un blocage réel sans promettre une rédaction incluse. |
| Connecté | **« Combien de personnes devraient utiliser le site, au lancement puis ensuite ? »** — facultatif, estimation acceptée | Conserver utilisateurs/actions. Ajouter `references` facultatif, absent de cette branche (`179`). |
| 3D | **« Combien d’objets ou de scènes souhaitez-vous présenter ? »** — facultatif, « Une estimation suffit. » | L’objet et les interactions sont déjà présents ; la quantité reste déterminante pour le travail. Ne pas demander un catalogue de contraintes de rendu au débutant. |
| Sur mesure | Rendre `primaryAction` facultatif uniquement ici ; garder **« Décrivez une utilisation du début à la fin »** obligatoire | Le scénario reprend et précise l’action principale. Conserver acteurs et priorités ; ne pas ajouter une seconde question générique « Parlez-nous de votre projet ». |
| Évolution | Aide à `requestedChanges` : **« Pour chaque changement : la page ou fonction concernée, ce qui se passe aujourd’hui et le résultat souhaité. »** | Enrichir le champ existant (`269-270`) ; préservation et accès sont déjà demandés. |
| Refonte | Conserver problèmes/conservation obligatoires, données/SEO conditionnels ; rendre `seoDetails` facultatif | Un rapport disponible n’implique pas que le client sache l’interpréter (`325-327`). Demander les outils connus et permettre leur partage, sans imposer une analyse SEO au prospect. |
| Sur mesure, Évolution, Refonte | **« Avez-vous une enveloppe à respecter ? »** — facultatif, estimation ou « À définir » | Aide à proposer un périmètre réaliste sur devis. Ne pas bloquer une demande ni ajouter cette question aux forfaits déjà configurés. |
| Contact | Conserver demande + coordonnées ; calendrier facultatif | Une question générale ne doit pas déclencher le brief complet de réalisation. |

## Textes d’accueil proposés

Conserver « Votre site internet. Clé en main. ». Paragraphe : **« Choisissez les fonctions utiles à votre activité. Nous vérifions votre demande avec vous pour préparer un site adapté à votre besoin. »**

Étape 2 : **« Décrivez votre projet »** / **« Ajoutez vos réponses, vos fichiers et vos coordonnées. »**

Étape 3 : **« Préparons la réalisation »** / **« Nous vous aidons à confirmer le forfait et les options avant de démarrer. »** Processus concret ; pas de délai, rabais, avis ou client inventé, ni nouveau badge décoratif.

## Sources et limites

- [GOV.UK — Structuring forms](https://www.gov.uk/service-manual/design/form-structure), consulté le 3 novembre 2026 : justifier chaque question et ses utilisateurs, limiter les questions par branche aux informations nécessaires. La préconisation initiale d’une chose par page n’oblige pas à remplacer l’accordéon approuvé ; c’est une piste à tester, pas une modification demandée ici.
- [GOV.UK — Designing good questions](https://www.gov.uk/service-manual/design/designing-good-questions), page mise à jour le 24 juin 2026, lue dans l’IAB : questions simples et compréhensibles, réponses d’incertitude valides, aides proches du champ et brèves. Ces principes motivent les sélecteurs simples et le caractère facultatif des détails techniques.

Pas de test utilisateur ni de mesure d’abandon. Aucun tarif, changement de DA ou d’inclusion. Propositions à arbitrer, pas des modifications livrées.


## Avis D

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


## Avis E

Phase 1, 3 novembre 2026. Lecture du catalogue, des sept briefs, du formulaire et du contrat V2 ; recherche primaire dans l’IAB uniquement. Aucun autre avis consulté, aucun changement applicatif, aucune soumission. Angle : exigences exploitables par un développeur, surtout Vitrine et Connecté.

## Diagnostic

Connecté demande les acteurs, leurs actions, l’inscription, les droits, les données, les imports et les connexions (`shared/brief.ts:145–179`). Refonte couvre conservation, URL, accès, référencement et continuité (`:288–350`). Il ne faut donc pas refaire un inventaire technique complet.

Deux lacunes concrètes : le formulaire connaît la configuration mais construit les questions seulement à partir du type de demande (`ProjectBriefForm.tsx:158–160`), et la zone de pièces jointes n’accepte que des images bornées à 20 Mio (`:472–490`). Les options Réservation, Boutique et CRM (`shared/offer-options.ts:21–75`) ne déclenchent aucune question dédiée. Connecté n’a pas de question de références visuelles, alors que les autres créations en ont une (`shared/brief.ts:179`, à comparer avec `:125`, `:233`, `:262`).

Friction probable, à tester avec de vrais débutants : le champ obligatoire « Quelles informations faut-il gérer ? » demande déjà de raisonner en types de données et champs (`shared/brief.ts:109–112`). Ce n’est pas un défaut bloquant démontré par un test utilisateur, mais le vocabulaire est celui de la conception d’un modèle de données.

## Priorités et questions proposées

1. **Fichiers : champ facultatif toujours disponible dans la rubrique existante.** Renommer celle-ci « Vos fichiers · facultatif ». Ajouter `transferUrl`, type URL : **« Lien de téléchargement de vos fichiers »**. Aide : « Pour les fichiers volumineux, vidéos ou modèles 3D, ajoutez un lien WeTransfer, SwissTransfer ou un dossier partagé accessible à notre équipe. Aucun mot de passe ni donnée personnelle de vos clients. » Ne pas attendre une erreur de poids pour afficher ce champ. C’est un moyen d’envoi facultatif, pas une option tarifaire. Valider HTTP(S), sans identifiants ; ne pas télécharger automatiquement. Dans l’admin, conserver le lien comme une information distincte des pièces jointes réellement stockées. Un lien reçu ne prouve ni son accessibilité future ni son contenu.

2. **Connecté : reformuler le champ de données, sans en ajouter un doublon.** Garder son caractère obligatoire, mais écrire : **« Quelles informations vos utilisateurs doivent-ils retrouver ou modifier ? »** Aide courte : « Par exemple : leurs demandes, réservations ou fiches produits. Décrivez un exemple fictif ; “À définir ensemble” convient aussi. » Le développeur déduira ensuite les champs techniques. Conserver les questions actuelles sur les droits et l’inscription : elles distinguent correctement compte et autorisation.

3. **Connecté : rendre le parcours métier plus concret en remplaçant `workflow`.** **« Décrivez ce qui se passe lorsqu’un utilisateur réalise l’action principale. »** Textarea, facultatif. Aide : « Que fait-il, que reçoit-il, et qui vérifie ou traite sa demande ? » Cela précise états, notifications et interventions humaines sans demander de jargon. Ne pas ajouter simultanément une autre question « parcours idéal ».

4. **Connecté : ordre de grandeur.** **« Combien d’utilisateurs et de fiches prévoyez-vous au lancement ? »** Texte facultatif ; « Une estimation suffit. Par exemple : 50 membres, 200 produits ; sinon, indiquez “Je ne sais pas”. »

5. **Connecté : ajouter le champ `references` partagé** dans la dernière rubrique, facultatif.

6. **Vitrine : rattacher le contenu à un périmètre utilisable.** Garder pages/rubriques obligatoires, mais préciser dans l’aide : « Pour chaque page, notez ce qu’elle doit présenter. Une liste provisoire suffit. » Étendre l’aide d’`audience` à la zone desservie si elle compte pour l’activité. Ne pas ajouter un questionnaire SEO obligatoire à toutes les vitrines.

7. **Options sélectionnées : seulement des branches pertinentes.** Si Réservation est choisie, une textarea facultative : **« Que doit-on pouvoir réserver et comment confirmez-vous la réservation ? »** Si Boutique : **« Que souhaitez-vous vendre et comment les commandes seront-elles traitées ? »**, avec exemple sur nombre de produits, livraison ou retrait. Si CRM : réutiliser `integrations`, pas un doublon. Ces réponses ne sélectionnent ni ne facturent une option. L’API doit valider leur contexte avec la configuration reçue ; ne pas simplement cacher des champs côté navigateur.

## Ce que je retire ou évite

Pas de demande de framework, base de données, fournisseur d’authentification, clés API, stratégie de mots de passe, liste d’événements webhooks ou données réelles : ce sont des décisions d’implémentation ultérieures. Pas de nouveau long texte générique « contraintes techniques » ; `constraints` existe déjà. Pas de priorité, budget et identité détaillée imposés partout : le besoin minimal doit rester envoyable et le brief peut être complété pendant l’échange. Les quatre coordonnées obligatoires résultent d’une décision explicite de Mathis, à conserver.

## Sources primaires lues

- [GOV.UK — Structuring forms](https://www.gov.uk/service-manual/design/form-structure) : justifier l’utilisation de chaque réponse et n’afficher que les questions pertinentes via des branches. L’accordéon retenu reste une adaptation du produit ; la source propose de commencer par une chose par page.
- [GOV.UK — Designing good questions](https://www.gov.uk/service-manual/design/designing-good-questions), mise à jour affichée au 24 juin 2026 : questions simples, possibilité de ne pas savoir et aide brève. Cela soutient les reformulations ; aucune hausse chiffrée de conversion n’en est déduite.
- [Auth0 — Role-Based Access Control](https://auth0.com/docs/manage-users/access-control/rbac) : distinguer responsabilités, rôles et actions autorisées, avec le minimum de permissions nécessaire. Les questions actuelles de Connecté sont donc utiles ; elles ne justifient pas de demander la technologie d’authentification au prospect.

## Confiance sur l’accueil

Privilégier des preuves consultables : un lien clair vers le comparatif et des références explicitement externes. Deux formulations factuelles possibles, sans les cumuler en badges décoratifs : **« Nos développeurs vérifient votre besoin avant de démarrer. »** (engagement déjà validé en FAQ) ; **« Modifiez vos options avant d’envoyer votre demande. »** (parcours réellement disponible). Ni statistiques clients, ni économie moyenne, ni prix figé, ni délai inventé. La réception réelle d’un e-mail reste à terminer ; ne pas en faire un argument acquis.

Limite : revue de code et sources, sans test utilisateur ni nouvelle navigation des formulaires locaux. Les questions finales et leur charge doivent être arbitrées après les cinq avis.
