# Modifier le site à la main

Le site utilise React, TypeScript et des composants shadcn/Radix. Les contenus réutilisés sont séparés du rendu : modifier un intitulé dans le catalogue met aussi à jour son entrée dans le menu.

## Trouver le bon fichier

| Ce que vous voulez changer | Fichier | Élément |
| --- | --- | --- |
| Nom, description et trois points d’un forfait | `shared/catalog.ts` | `offers` : `title`, `description`, `features` |
| Nom et explication d’une option | `shared/catalog.ts` | `optionDefinitions` : `title`, `description` |
| Questions fréquentes | `shared/catalog.ts` | `faqs` : dix entrées `question`, `answer` |
| Image, lien et crédit d’un exemple | `shared/catalog.ts` | `examples` : neuf entrées, `image`, `url`, `sourceUrl`, `creator`, `tags`, `archived` |
| Explication des inclusions avant les options | `src/content/configurator-copy.ts` | `includedGuidance`, une entrée par forfait |
| Textes, trois points, boutons et sujets Évolution/Refonte | `src/content/existing-site.ts` | `existingSiteOffers` : `title`, `features`, `cta`, sujets et textes du formulaire |
| Structure du menu | `src/components/layout/PublicLayout.tsx` | `PublicHeader` ; les quatre liens proviennent de `offers` |
| Accueil, comparatif, galerie et formulaire de contact | `src/pages/public/index.tsx` | Fonctions `HomePage`, `OfferComparison`, `ExamplesPage`, `InquiryForm`, `ContactPage` |
| Options et étapes de configuration | `src/pages/configurator/index.tsx` | `ConfiguratorPage` |
| Aspect commun des six cartes | `src/components/layout/PricingCard.tsx` | Même rendu pour créations et services ; CTA `.plan-cta`, images inchangées, couche `.pricing-card__grain` à entrée brève, aucun reflet/halo |
| Couleurs, navigation et cartes partagées | `src/styles.css` | Variantes `.pricing-card--*`, liens `.public-offer-link` ; déclencheur Forfaits neutre |
| Comparatif, galerie et placement des services | `src/pages/public.css` | `.comparison-details-toggle`, `.comparison-detail-reveal`, `.public-gallery-*`, `.pricing-grid--existing` |
| Mise en page du configurateur | `src/pages/configurator.css` | `.configurator-*` |

Exemple : pour modifier les trois éléments de Vitrine, chercher `id: 'vitrine'` dans `offers`, puis changer les chaînes de `features`. Les cartes de l’accueil et du configurateur utilisent ces mêmes données.

La FAQ actuelle répond aux frais après création, aux contenus, aux modifications, au domaine/hébergement, au mobile/tablette, au site existant, au calendrier et au référencement. `docs/FAQ_RECHERCHE_REDDIT.md` conserve la recherche qualitative qui a éclairé les thèmes ; ce n’est pas une étude statistique. Les réponses publiées doivent toujours suivre les inclusions réelles, sans inventer de montant, de délai ou de position Google.

## Prix et inclusions

Les tarifs actifs se règlent dans l’administration privée, rubrique tarifs. Ils sont persistés côté serveur, en centimes ; `server/orders.mjs` les lit et `shared/catalog.ts` calcule les totaux. `defaultPricing` est un repli lorsque les tarifs ne sont pas renseignés : modifier cette constante ne remplace pas les prix déjà enregistrés dans la base de production. `null` signifie « prix à définir », et non gratuit.

Les options portent `billing: 'once'` pour une création ponctuelle ou `'monthly'` pour un service mensuel. Les règles `isOptionIncluded`, `normalizeConfiguration` et `quoteConfiguration` déterminent ce qui est compris et évitent une seconde facturation. Modifier le texte d’une carte ne change pas ces règles. Toute modification commerciale doit rester cohérente entre règles, explications et comparatif.

Les identifiants `id`, les slugs et les clés des options relient l’interface aux demandes historiques. Pour une retouche de texte, conserver ces valeurs techniques. Une nouvelle option ou inclusion demande une adaptation des règles partagées et des tests.

## Refonte et formulaires

Évolution et Refonte sont deux prestations sur devis, distinctes des quatre forfaits de création. Leurs liens sont `/contact?besoin=evolution` et `/contact?besoin=refonte` : le formulaire préremplit le sujet et propose l’URL facultative du site actuel. Cette URL est jointe au message enregistré. `existingSiteOffers` alimente les deux cartes, le menu et les textes du formulaire ; `getExistingSiteOffer` retrouve une prestation à partir de son identifiant. Le paramètre `projet` sert aux dossiers privés ; ne pas l’utiliser pour une prestation publique.

`ExistingSiteServices` rend chaque prestation avec `PricingCard`, `features={service.features}` et `variant={service.id}`. Ne pas créer de carte de service parallèle : dimensions, structure et interactions restent communes aux six cartes. Les variantes `evolution` et `refonte` sont dans `src/styles.css` et réutilisent la texture approuvée, sans motifs spécifiques. `.pricing-grid--existing` dans `src/pages/public.css` place les deux cartes en colonnes 2 et 3 à partir de 1 121 px ; les grilles plus étroites suivent les règles partagées.

Dans `InquiryForm`, `website` est un champ antispam masqué. L’URL fournie par le visiteur va dans `currentSite`. Conserver cette séparation, la limite de longueur, le blocage du double envoi et l’identifiant de nouvelle tentative.

## Images et styles

Placer les exports actifs dans `public/assets/examples/`, puis modifier le chemin dans `examples`. Garder le lien réel et le crédit du site présenté. Les originaux et anciens essais restent dans `docs/asset-sources/` ou `docs/qa/`, hors du build public. La provenance des captures est documentée dans `docs/ASSETS_REFERENCES.md`.

Les neuf références sont DOMTEKNIKA, Lactel, Julie Thiam, Tiny Heaven, Addiction Agency, GeoBoss, Aéma Groupe, Satellite Story et Atlante 3D. Pour qu’un exemple classé autrement apparaisse aussi dans le filtre 3D, utiliser `tags: ['3D']` comme GeoBoss. Pour un projet archivé, conserver `archived: true`, une description honnête et une destination encore consultable : Atlante ouvre son README GitHub avec « Voir la présentation ». Ne pas transformer ce lien en promesse de démonstration active.

Les images, titres et actions des exemples sont des liens directs dans un nouvel onglet. Les crédits conservent leur propre lien source. `ExampleDetailPage` maintient la compatibilité de `/exemples/:slug` : il redirige par effet vers `example.url` avec `window.location.replace` et laisse un lien de repli. Le composant `ExamplePreview` est retiré ; ne pas réintroduire de fenêtre intermédiaire ou de scène embarquée.

L’interface utilise Geist Sans, Lucide et les composants de `src/components/ui/`. Réutiliser ces éléments pour garder les tailles, focus et interactions cohérents. Les cartes et leur matière ont été validées : leurs textures, recadrages et transitions sont décrits dans `docs/CHARTE_INTERFACE.md`.

Les boutons noirs des cartes et du comparatif partagent `.plan-cta` dans `src/styles.css`. Le menu utilise les six liens `.public-offer-link` avec `.pricing-card--${variant}` pour révéler leur texture au survol/focus et à la sélection clavier Radix ; le déclencheur Forfaits reste neutre. Le dépliage du comparatif reste un tableau unique : « Afficher plus de détails » devient « Masquer les détails » et pilote les lignes complémentaires via `.comparison-detail-reveal`. Halo, ancien `.pricing-card__glow`, reflet diagonal et liseré sont retirés. Ne pas modifier les images : leur source, leur recadrage et leurs filtres restent inchangés. `.pricing-card__grain` est une couche décorative séparée, avec `card-grain.webp` répété à 128 px CSS en overlay (opacité 0,32). `card-grain-entry` déplace uniquement cette couche pendant 360 ms, une itération sur hover réel ou focus-visible. Elle revient à `transform:none` ensuite. Le fondu des couleurs dure 300 ms (texte 150 ms), sans bloquer les liens. Pour ajuster l’effet, modifier les valeurs CSS de grain/timing, pas les fichiers colorés. Le SVG source et son export PNG sont dans `docs/asset-sources/textures/` ; le WebP servi a été encodé avec `cwebp -lossless -exact -m 6`, pour éviter un filtre SVG actif pendant le survol. La réduction des animations reste gérée par la règle globale. Les deux FAQ ajoutées à la fin de `faqs` viennent de la demande utilisateur ; les trois entrées de l’accueil restent inchangées.

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

Les rubriques d’options dans `src/pages/configurator/index.tsx` utilisent `Accordion type="single" collapsible`. Le résumé de chaque rubrique fermée est calculé depuis `isOptionSelected` et `isOptionIncluded` ; ne pas conserver une seconde liste de choix dans un état React. La galerie affiche un seul badge par référence. Badges et filtres récupèrent la classe `pricing-card--${offer.variant}` du catalogue et partagent un pseudo-élément texturé dans `src/pages/public.css` ; les variables de couleur et de cadrage viennent de `src/styles.css`, comme pour les cartes. Les tags secondaires servent uniquement au classement interne ; « Projet archivé » est écrit dans la description.
