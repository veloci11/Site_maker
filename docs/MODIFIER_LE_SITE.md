# Modifier le site à la main

Le site utilise React, TypeScript et des composants shadcn/Radix. Les contenus réutilisés sont séparés du rendu : modifier un intitulé dans le catalogue met aussi à jour son entrée dans le menu.

Ce guide décrit le lot du 6 novembre 2026, codé et vérifié localement. Il ne constitue pas une confirmation de push ou de publication.

## Trouver le bon fichier

| Ce que vous voulez changer | Fichier | Élément |
| --- | --- | --- |
| Nom, description et trois points d’un forfait | `shared/catalog.ts` | `offers` : `title`, `description`, `features` |
| Nom et explication d’une option | `shared/catalog.ts` | `optionDefinitions` : `title`, `description` |
| Options proposées dans chaque forfait public | `shared/offer-options.ts` | `PUBLIC_OPTIONS_BY_OFFER` ; le catalogue historique reste complet |
| Questions fréquentes | `shared/catalog.ts` | `faqs` : dix entrées `question`, `answer` |
| Image, lien et crédit d’un exemple | `shared/catalog.ts` | `examples` : neuf entrées, `image`, `url`, `sourceUrl`, `creator`, `tags`, `archived` |
| Explication des inclusions avant les options | `src/content/configurator-copy.ts` | `includedGuidance`, une entrée par forfait |
| Définitions historiques Évolution/Refonte | `src/content/existing-site.ts` | Conservées pour compatibilité ; aucune carte ni entrée de menu publique |
| Titres, descriptions, canoniques et indexation | `shared/seo.ts` | `getRouteSeo`, `publicPagePaths` ; head servi par Express et synchronisé après navigation |
| Protection du brief non envoyé | `src/components/inquiries/BriefNavigationGuard.tsx` | Dialogue de sortie et protection du rechargement, sans stockage personnel |
| Structure du menu | `src/components/layout/PublicLayout.tsx` | `PublicHeader` ; les trois liens proviennent de `publicOffers` |
| Accueil, galerie et formulaire de contact | `src/pages/public/index.tsx` | `HomePage`, `ExamplesPage`, `InquiryForm`, `ContactPage` |
| Comparatif des forfaits | `src/pages/public/OfferComparison.tsx` | Lignes de base, détails et leur rendu |
| Ouverture et fermeture des FAQ | `src/pages/public/FaqList.tsx` | Accordéon accessible ; textes dans `shared/catalog.ts` |
| Lecture des prix publics et libellé de départ | `src/pages/public/pricing.ts` | `usePricing`, `startingPrice`, `configureHref` |
| Routes, accès privés et pages de repli | `src/App.tsx` | Chargement des pages, `RequireAuth`, `AppBoundary` |
| Options et étapes de configuration | `src/pages/configurator/index.tsx` | `ConfiguratorPage` |
| Formulaire court et anciens questionnaires | `shared/brief.ts` | `getContactBriefSections`, `validateContactBrief` ; `sectionsByRequest` reste disponible pour les anciennes demandes |
| Coordonnées requises et leur validation | `shared/inquiry-contact.ts` | `validateInquiryContact` utilisé par le navigateur et le serveur |
| Rendu du formulaire court | `src/components/inquiries/ProjectBriefForm.tsx` | Coordonnées et message, communs aux trois forfaits et à Nous contacter ; aucun calendrier ni fichier |
| Contrat des demandes et pièces jointes historiques | `docs/BRIEF_CONTRACT.md`, `server/inquiry-images.mjs` | Payload V2 compact et compatibilité des anciens transports |
| Aspect commun des trois cartes | `src/components/layout/PricingCard.tsx` | CTA `.plan-cta`, badge `featured` Business, couche `.pricing-card__grain` à entrée brève, aucun reflet/halo |
| Couleurs, navigation et cartes partagées | `src/styles.css` | Variantes `.pricing-card--*`, liens `.public-offer-link` ; déclencheur Forfaits neutre |
| Comparatif et galerie | `src/pages/public.css` | `.comparison-details-toggle`, `.comparison-detail-reveal`, `.public-gallery-*` |
| Mise en page du configurateur | `src/components/layout/project.css` | `.configurator-*` |

Exemple : pour modifier les trois éléments de Vitrine, chercher `id: 'vitrine'` dans `offers`, puis changer les chaînes de `features`. Les cartes de l’accueil et du configurateur utilisent ces mêmes données.

La FAQ actuelle répond aux frais après création, aux contenus, aux modifications, au domaine/hébergement, au mobile/tablette, au site existant, au calendrier et au référencement. `docs/FAQ_RECHERCHE_REDDIT.md` conserve la recherche qualitative qui a éclairé les thèmes ; ce n’est pas une étude statistique. Les réponses publiées doivent toujours suivre les inclusions réelles, sans inventer de montant, de délai ou de position Google.

## Prix et inclusions

Les forfaits affichent un prix de départ donné à titre indicatif. Vitrine démarre à 890 € pour 1 à 3 pages. Business reprend Vitrine à 1 490 € sur 1 à 6 pages avec le CMS, le SEO local, les rubriques et les statistiques. Premium / 3D reprend Business à 2 499 € sur 1 à 10 pages avec la reprise de contenus, les animations avancées, la 3D si pertinente et l’étude des demandes sur mesure. Le badge Business est « Populaire ». Les trois comprennent l’adaptation aux écrans et la mise en ligne. La prise de rendez-vous reste une option à 90–180 €.

Les tarifs actifs se règlent dans l’administration privée, rubrique tarifs. Ils sont persistés côté serveur, en centimes ; `server/orders.mjs` les lit et `shared/catalog.ts` calcule les totaux. `defaultPricing` contient les montants approuvés. Il est utilisé sans réécriture si aucun réglage n’existe ou si l’ancien catalogue EUR `draft-vN` était entièrement à null. Les tarifs administratifs déjà enregistrés restent prioritaires : modifier cette constante ne les remplace pas. Leurs valeurs null explicites et leurs nouvelles clés absentes restent inconnues. `null` signifie « prix à définir », et non gratuit.

Les douze options ponctuelles conservées sont les suivantes ; leur disponibilité dépend des fonctions déjà comprises dans le forfait.

| Option | Prix approuvé | Périmètre de référence |
| --- | --- | --- |
| Langue supplémentaire | 100 € | 1 langue au choix, jusqu’à 5 pages sur Vitrine ou 6 sur Business et Premium / 3D, textes traduits fournis |
| Modifier mes contenus | 300 € | CMS simple pour 5 pages de Vitrine ; inclus dans Business et Premium / 3D |
| Ajouter un élément 3D | 250–600 € | 1 modèle fourni, intégré sur 1 page |
| Espace membres | 300–600 € | Authentification et profil simple |
| Liens de paiement | 100 € | 1 prestataire, jusqu’à 3 liens |
| Boutique avec panier et paiement | 600–1 100 € | Boutique native, 10 produits simples |
| Blog prêt à publier | 150 € | 1 rubrique, 3 articles fournis, éditeur du blog |
| Ajouter une page | 60–120 € | 1 page sur modèle existant |
| Reprendre mon ancien contenu | 100–250 € | Jusqu’à 5 pages et 15 médias. Compris dans Premium / 3D. |
| Créer mon modèle 3D | À partir de 150 € | 1 objet simple, 1 révision |
| Suivre mes visites | 60 € | Visites et 1 événement ; compris dans Business |
| Inscription à la newsletter | À partir de 90 € | 1 formulaire, 2 champs, 1 liste |

Les trois plans mensuels sont **Hébergement 19 €/mois** (hébergement, SSL, surveillance), **Maintenance 39 €/mois** (hébergement, mises à jour, sauvegardes et petites modifications) et **Sérénité 69 €/mois** (Maintenance, 1 heure de modifications par mois et support prioritaire). Ils sont facultatifs et exclusifs : `withOption` remplace le plan précédent, sans cumuler leurs prix.

Les options portent `billing: 'once'` pour une création ponctuelle ou `'monthly'` pour un service mensuel. Les règles `isOptionIncluded`, `normalizeConfiguration` et `quoteConfiguration` déterminent ce qui est compris et évitent une seconde facturation. La boutique comprend son catalogue, la gestion des produits et le paiement ; le blog comprend son éditeur d’articles. Le CMS des autres pages reste distinct, comme la création et l’intégration d’un modèle 3D. Modifier le texte d’une carte ne change pas ces règles. Toute modification commerciale doit rester cohérente entre règles, explications et comparatif.

`OPTION_PRICE_RANGES` et `formatOptionPrice` portent les fourchettes et les prix « À partir de ». Une option de ce type rend `quote.estimated` et `quote.requiresQuote` vrais : le total conserve les minimums et une borne haute quand elle est connue. `formatQuoteTotal` affiche la plage agrégée, sinon « À partir de » ; les anciens instantanés ne sont pas recalculés. Le mensuel reste séparé du total ponctuel. Les frais des prestataires externes restent à préciser.

Les identifiants `id`, les slugs et les clés des options relient l’interface aux demandes historiques. Pour une retouche de texte, conserver ces valeurs techniques. `OFFER_IDS` et `offers` conservent quatre définitions ; `PUBLIC_OFFER_IDS` et `publicOffers` n’en exposent que trois. Business garde l’ID/slug `connecte` et Premium / 3D l’ID `immersif` et le slug `immersif-3d`. Les **28 identifiants d’options** comprennent les choix historiques désormais masqués ; ne pas les supprimer du catalogue ou des instantanés. Une nouvelle option ou inclusion demande une adaptation des règles partagées et des tests.

## Formulaire court et compatibilité

Le parcours public contient les options puis un formulaire court à droite de la grande carte récapitulative. `ProjectBriefForm` est aussi utilisé dans Nous contacter : prénom, nom, e-mail et téléphone obligatoires, entreprise et activité facultatives, puis un message obligatoire. Calendrier, fichiers et questionnaire détaillé sont retirés de l’interface publique. Le retour aux options garde les coordonnées et le message en mémoire ; une navigation sortante demande confirmation si la saisie n’est pas envoyée.

L’API reçoit `schemaVersion: 2`, `briefFormat: 'contact'`, le `requestType`, un UUID de nouvelle tentative et `brief: { activity?, message }`. Une demande de forfait contient sa configuration ; la demande générale a `configuration: null`. Les prix sont recalculés côté serveur. `website` reste un champ antispam masqué, sans lien avec l’activité du visiteur. Préserver validation, limites, blocage du double envoi et identifiant de nouvelle tentative.

Sur mesure, Évolution et Refonte ne sont plus des offres publiques. `/forfaits/sur-mesure` redirige vers Premium / 3D ; les anciens liens `/contact?besoin=evolution` et `/contact?besoin=refonte` rejoignent le contact général. Les paramètres `projet` et `projectId` restent réservés aux dossiers privés, dont la configuration et les instantanés ne sont pas réécrits. Les anciens questionnaires V2 et leurs fichiers restent lisibles, et leur transport API demeure compatible ; ne pas retirer les modèles historiques au seul motif qu’ils ne sont plus affichés.

## Images et styles

Placer les exports actifs dans `public/assets/examples/`, puis modifier le chemin dans `examples`. Garder le lien réel et le crédit du site présenté. Les originaux et anciens essais restent dans `docs/asset-sources/` ou `docs/qa/`, hors du build public. La provenance des captures est documentée dans `docs/ASSETS_REFERENCES.md`.

Les neuf références sont réparties par `offerId` : DOMTEKNIKA en Vitrine ; Lactel et Aéma Groupe en Business ; GeoBoss, Tiny Heaven, Satellite Story, Atlante, Julie Thiam et Addiction Agency en Premium / 3D. Cal.com est retiré. Chaque référence appartient à un seul filtre ; ne pas utiliser les tags secondaires pour afficher un site dans plusieurs catégories. Pour un projet archivé, conserver `archived: true`, une description honnête et une destination encore consultable : Atlante ouvre son README GitHub avec « Voir la présentation ». Ne pas transformer ce lien en promesse de démonstration active.

Les images, titres et actions des exemples sont des liens directs dans un nouvel onglet. Les crédits conservent leur propre lien source. `ExampleDetailPage` maintient la compatibilité de `/exemples/:slug` : il redirige par effet vers `example.url` avec `window.location.replace` et laisse un lien de repli. Le composant `ExamplePreview` est retiré ; ne pas réintroduire de fenêtre intermédiaire ou de scène embarquée.

L’interface utilise Geist Sans, Lucide et les composants de `src/components/ui/`. Réutiliser ces éléments pour garder les tailles, focus et interactions cohérents. Les cartes et leur matière ont été validées : leurs textures, recadrages et transitions sont décrits dans `docs/CHARTE_INTERFACE.md`.

Les boutons noirs des cartes et du comparatif partagent `.plan-cta` dans `src/styles.css`. Le menu utilise les trois liens `.public-offer-link` avec `.pricing-card--${variant}` pour révéler leur texture au survol/focus et à la sélection clavier Radix ; le déclencheur Forfaits reste neutre. Le dépliage du comparatif reste un tableau unique : « Afficher plus de détails » devient « Masquer les détails » et pilote les lignes complémentaires via `.comparison-detail-reveal`. Halo, ancien `.pricing-card__glow`, reflet diagonal et liseré sont retirés. Les fichiers originaux restent conservés. La variante Premium / 3D reprend la composition de l’ancien Sur mesure avec une palette bordeaux/indigo ajustée via les variables CSS de `.pricing-card--immersif` ; les filtres, badges et menus utilisent cette même variante. Toute autre modification de matière doit suivre les décisions de design courantes. `.pricing-card__grain` est une couche décorative séparée, avec `card-grain.webp` répété à 128 px CSS en overlay (opacité 0,32). `card-grain-entry` déplace uniquement cette couche pendant 360 ms, une itération sur hover réel ou focus-visible. Elle revient à `transform:none` ensuite. Le fondu des couleurs dure 300 ms (texte 150 ms), sans bloquer les liens. Pour ajuster l’effet, modifier les valeurs CSS de grain/timing, pas les fichiers colorés. Le SVG source et son export PNG sont dans `docs/asset-sources/textures/` ; le WebP servi a été encodé avec `cwebp -lossless -exact -m 6`, pour éviter un filtre SVG actif pendant le survol. La réduction des animations reste gérée par la règle globale. Les deux FAQ ajoutées à la fin de `faqs` viennent de la demande utilisateur ; les trois entrées de l’accueil restent inchangées.

Le JSX des pages modifiées est indenté, avec des noms explicites. Garder les textes partagés dans le catalogue ou `src/content/`, les actions dans des fonctions nommées et les styles dans les fichiers CSS correspondants. Les commentaires expliquent les règles moins évidentes, comme la déduplication d’une demande.

## Vérifier une modification

Depuis la racine du projet, avec Node 24 :

```sh
npm run dev
```

Ouvrir `http://127.0.0.1:4173` **dans le navigateur intégré uniquement**, vérifier le parcours concerné au clavier et sur mobile, puis lancer :

```sh
npm run check
git diff --check
```

`check` vérifie les types, construit le site et exécute les tests. Pour un essai de formulaire purement local, désactiver explicitement l’envoi : `INQUIRY_TO= RESEND_API_KEY= npm run dev`. Ne pas soumettre de demande de test en production.

La préférence de Mathis concerne aussi les recherches de références : utiliser exclusivement le navigateur intégré, pas Google Chrome. Ne pas modifier la fenêtre ou les formulaires de son navigateur personnel pour contrôler le site.

Arrêter la prévisualisation avec Ctrl+C. Un résultat local ne modifie ni GitHub ni le site public. La mise en ligne isolée sur Ubuntu est décrite dans `ops/README.md` ; son état vérifié est suivi dans `ops/DEPLOYMENT_STATUS.md`.

Les rubriques d’options dans `src/pages/configurator/index.tsx` utilisent `Accordion type="multiple"`. Le résumé de chaque rubrique fermée est calculé depuis `isOptionSelected` et `isOptionIncluded` ; ne pas conserver une seconde liste de choix dans un état React. La galerie affiche un seul badge par référence. Badges et filtres récupèrent la classe `pricing-card--${offer.variant}` du catalogue et partagent un pseudo-élément texturé dans `src/pages/public.css` ; les variables de couleur et de cadrage viennent de `src/styles.css`, comme pour les cartes. Les tags secondaires ne modifient jamais le filtre public ; « Projet archivé » est écrit dans la description.

Le choix de forfait dans `src/pages/configurator/index.tsx` réutilise `DropdownMenu` et le style `.public-offers-menu` du header. Les trois choix viennent de `publicOffers`. `changePublicOffer` dans `shared/offer-options.ts` conserve les options choisies compatibles, mais retire les inclusions de l’ancien forfait avant de normaliser le nouveau. Ainsi, passer de Business ou Premium / 3D à Vitrine ne sélectionne pas automatiquement un CMS payant. `prunePublicConfiguration` ne concerne pas les anciens dossiers privés. Le dialogue central est retiré. Le focus de `.nav-offers-trigger` se voit par son trait noir de 2 px ; ne pas supprimer la règle globale de focus pour tous les autres contrôles.

La grande carte des trois forfaits est partagée dans `src/components/layout/SelectedPlanCard.tsx`. Le configurateur transmet sa fonction `changeOffer` ; le menu ne propose que les offres publiques. La matière, le menu translucide et les dimensions se règlent dans `src/components/layout/project.css`. Après Continuer, la carte et ses options restent à gauche, et le formulaire court apparaît à droite ; sur mobile ils restent dans le flux. Ne pas réintroduire de questionnaire plein écran ni de bouton Continuer en doublon dans la carte.

## Questions, historique et confiance

Le formulaire courant utilise `getContactBriefSections` et `validateContactBrief` dans `shared/brief.ts` ; éviter de créer le même champ dans plusieurs composants. Les anciennes questions et leurs conditions `showWhen`, `showWhenAnswered`, `showForOption`, `showForAnyOption` et `exclusiveValues` restent nécessaires à la compatibilité des questionnaires antérieurs. Préserver leurs identifiants et la lecture historique. `summarizeBrief(..., { historical: true })` affiche les anciennes réponses sans les réinterpréter comme de nouvelles sélections payantes, et reconnaît le message des demandes compactes.

La rubrique de fichiers n’est plus rendue par `ProjectBriefForm`. Les liens, descriptions et images déjà enregistrés restent privés ; les limites de l’ancien transport sont conservées dans `server/inquiry-images.mjs` et les helpers historiques. Ne pas supprimer ces données, ni ajouter de récupération automatique ou d’aperçu d’un lien partagé.

Les engagements de l’accueil sont dans `HomePage`, `.home-assurance` et les trois étapes existantes. Les images et effets des cartes restent approuvés. La proposition mentionnant un ingénieur reste dans `TEXTE_SECURITE_A_CONFIRMER.md` tant que l’intervention précise n’est pas confirmée. Les études de marché restent des propositions historiques ; seuls les prix explicitement approuvés pour les trois forfaits et les options ci-dessus alimentent le catalogue courant.

## Animation : où intervenir

- `src/components/layout/plan-transition.tsx` relie les liens/navigation aux transitions du routeur et interrompt les instantanés quand le visiteur agit.
- `motion.tsx` mesure la petite et la grande carte ; `plan-motion.css` règle le raccord, les masques et les fondus. Le timing approuvé est de 760 ms.
- `use-option-reflow.ts` anime le déplacement des choix après ajout/retrait, sans retarder la configuration ni les prix.
- `project.css` fixe les dimensions de la matière et le résumé ; ne pas réduire les titres ou ajouter un défilement interne quand la sélection grandit.

Après modification, contrôler les trois forfaits dans les deux sens, le premier clic sur Changer, le retour navigateur, une sélection longue et la préférence de réduction des animations. Un viewport changé pendant un raccord annule naturellement sa capture : mesurer à dimensions stables.

## Principe commercial

STUDIO propose une base puis des modules utiles à la carte. Un module réutilisable et précisément borné peut recevoir un prix simple ; une intégration ou une création spécifique demande un périmètre distinct. Le catalogue du configurateur ne démontre pas à lui seul l’existence d’une bibliothèque de modules livrables : vérifier ce qui est réellement réutilisable avant de garantir un prix fixe. Les recherches de marché restent des propositions ; les prix approuvés de ce lot sont codés dans le catalogue. Leur validation locale ne prouve ni un push ni une publication : consulter `docs/SUIVI_DEMANDES.md` et `ops/DEPLOYMENT_STATUS.md` pour l’état de livraison.
