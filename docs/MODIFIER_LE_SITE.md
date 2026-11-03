# Modifier le site à la main

Le site utilise React, TypeScript et des composants shadcn/Radix. Les contenus réutilisés sont séparés du rendu : modifier un intitulé dans le catalogue met aussi à jour son entrée dans le menu.

## Trouver le bon fichier

| Ce que vous voulez changer | Fichier | Élément |
| --- | --- | --- |
| Nom, description et trois points d’un forfait | `shared/catalog.ts` | `offers` : `title`, `description`, `features` |
| Nom et explication d’une option | `shared/catalog.ts` | `optionDefinitions` : `title`, `description` |
| Questions fréquentes | `shared/catalog.ts` | `faqs` : `question`, `answer` |
| Image, lien et crédit d’un exemple | `shared/catalog.ts` | `examples` : `image`, `url`, `sourceUrl`, `creator` |
| Explication des inclusions avant les options | `src/content/configurator-copy.ts` | `includedGuidance`, une entrée par forfait |
| Texte et bouton Refonte & évolution | `src/content/existing-site.ts` | `existingSiteOffer` |
| Structure du menu | `src/components/layout/PublicLayout.tsx` | `PublicHeader` ; les quatre liens proviennent de `offers` |
| Accueil, comparatif, galerie et formulaire de contact | `src/pages/public/index.tsx` | Fonctions `HomePage`, `OfferComparison`, `ExamplesPage`, `InquiryForm`, `ContactPage` |
| Options et étapes de configuration | `src/pages/configurator/index.tsx` | `ConfiguratorPage` |
| Aspect d’une carte sur l’accueil | `src/components/layout/PricingCard.tsx` | Rendu de carte ; les textes viennent du catalogue |
| Couleurs, navigation et cartes partagées | `src/styles.css` | Variables en tête de fichier et sélecteurs correspondants |
| Comparatif, galerie et bloc Refonte | `src/pages/public.css` | `.comparison-cta`, `.public-gallery-*`, `.existing-site-offer` |
| Mise en page du configurateur | `src/pages/configurator.css` | `.configurator-*` |

Exemple : pour modifier les trois éléments de Vitrine, chercher `id: 'vitrine'` dans `offers`, puis changer les chaînes de `features`. Les cartes de l’accueil et du configurateur utilisent ces mêmes données.

## Prix et inclusions

Les tarifs actifs se règlent dans l’administration privée, rubrique tarifs. Ils sont persistés côté serveur, en centimes ; `server/orders.mjs` les lit et `shared/catalog.ts` calcule les totaux. `defaultPricing` est un repli lorsque les tarifs ne sont pas renseignés : modifier cette constante ne remplace pas les prix déjà enregistrés dans la base de production. `null` signifie « prix à définir », et non gratuit.

Les options portent `billing: 'once'` pour une création ponctuelle ou `'monthly'` pour un service mensuel. Les règles `isOptionIncluded`, `normalizeConfiguration` et `quoteConfiguration` déterminent ce qui est compris et évitent une seconde facturation. Modifier le texte d’une carte ne change pas ces règles. Toute modification commerciale doit rester cohérente entre règles, explications et comparatif.

Les identifiants `id`, les slugs et les clés des options relient l’interface aux demandes historiques. Pour une retouche de texte, conserver ces valeurs techniques. Une nouvelle option ou inclusion demande une adaptation des règles partagées et des tests.

## Refonte et formulaires

Refonte & évolution est une prestation sur devis, distincte des quatre forfaits de création. Son lien est `/contact?besoin=refonte` : le formulaire préremplit le sujet et propose l’URL facultative du site actuel. Cette URL est jointe au message enregistré. Le paramètre `projet` sert aux dossiers privés ; ne pas l’utiliser pour une prestation publique.

Dans `InquiryForm`, `website` est un champ antispam masqué. L’URL fournie par le visiteur va dans `currentSite`. Conserver cette séparation, la limite de longueur, le blocage du double envoi et l’identifiant de nouvelle tentative.

## Images et styles

Placer les exports actifs dans `public/assets/examples/`, puis modifier le chemin dans `examples`. Garder le lien réel et le crédit du site présenté. Les originaux et anciens essais restent dans `docs/asset-sources/` ou `docs/qa/`, hors du build public. La provenance des captures est documentée dans `docs/ASSETS_REFERENCES.md`.

L’interface utilise Geist Sans, Lucide et les composants de `src/components/ui/`. Réutiliser ces éléments pour garder les tailles, focus et interactions cohérents. Les cartes et leur matière ont été validées : leurs textures, recadrages et transitions sont décrits dans `docs/CHARTE_INTERFACE.md`.

Le JSX des pages modifiées est indenté, avec des noms explicites. Garder les textes partagés dans le catalogue ou `src/content/`, les actions dans des fonctions nommées et les styles dans les fichiers CSS correspondants. Les commentaires expliquent les règles moins évidentes, comme la déduplication d’une demande.

## Vérifier une modification

Depuis la racine du projet, avec Node 24 :

```sh
npm run dev
```

Ouvrir `http://127.0.0.1:4173`, vérifier le parcours concerné au clavier et sur mobile, puis lancer :

```sh
npm run check
git diff --check
```

`check` vérifie les types, construit le site et exécute les tests. Pour un essai de formulaire purement local, désactiver explicitement l’envoi : `INQUIRY_TO= RESEND_API_KEY= npm run dev`. Ne pas soumettre de demande de test en production.

Arrêter la prévisualisation avec Ctrl+C. Un résultat local ne modifie ni GitHub ni le site public. La mise en ligne isolée sur Ubuntu est décrite dans `ops/README.md` ; son état vérifié est suivi dans `ops/DEPLOYMENT_STATUS.md`.
