# Pages publiques

Le rendu public garde la direction approuvée : fond statique, cartes texturées, quatre créations, deux prestations pour un site existant, galerie et FAQ. Les textes partagés et règles commerciales vivent dans `shared/` et `src/content/`.

## Fichiers

- `index.tsx` : accueil, pages de forfaits/options, galerie, FAQ et contact.
- `OfferComparison.tsx` : tableau et détails repliables ; les colonnes suivent les quatre créations du catalogue.
- `FaqList.tsx` : accordéon FAQ partagé par l’accueil et `/faq`. Les réponses restent dans le DOM ; celles qui sont fermées sont inaccessibles au clavier et aux lecteurs d’écran.
- `pricing.ts` : lecture du catalogue tarifaire validé, libellés de départ et liens de configuration. Aucun montant commercial en dur.
- `../public.css` : mise en page et états visuels propres aux pages publiques.

## Parcours et invariants

Les six cartes partagent `PricingCard`. Les quatre créations ouvrent le configurateur commun dans `../configurator/index.tsx` ; Évolution et Refonte ouvrent `/contact?besoin=…`, avec `SelectedPlanCard` et leur questionnaire. Le formulaire commun `ProjectBriefForm` est chargé à la demande.

La navigation propose Accueil, un menu Forfaits, Exemples de sites, FAQ et Nous contacter. Les étapes sont sur l’accueil (`#fonctionnement`) ; `/methode` y redirige. Les anciennes routes `/formules` restent compatibles.

La galerie contient dix références externes créditées. Un seul badge et une seule catégorie par site, filtrée par `offerId`. Image, titre et action ouvrent directement la référence dans un nouvel onglet. Aucun aperçu externe embarqué ni relation client revendiquée. Atlante est archivé ; les captures et crédits sont documentés dans `docs/ASSETS_REFERENCES.md`.

Les prix proviennent du serveur, avec un repli non tarifé si le catalogue manque ou est invalide. Les inclusions et totaux sont calculés dans `shared/catalog.ts` ; les options visibles dans `shared/offer-options.ts`. Les montants proposés par une étude ne sont pas automatiquement publiés. Les frais ponctuels et mensuels restent distincts.

Les demandes sont enregistrées dans l’API privée ; une notification dépend de la configuration du transport. Les essais locaux désactivent ce transport. Ne jamais soumettre une demande fictive en production.

Pour les modifications et vérifications, suivre `docs/MODIFIER_LE_SITE.md` et les dernières décisions de `AGENTS.md`.
