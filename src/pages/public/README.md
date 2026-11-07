Dernière clarification : chaque ligne du comparatif possède une description fonctionnelle, dépliée avec les détails. Ne pas y répéter les inclusions indiquées dans les colonnes. Intitulé : « Photos de réalisations, tarifs et avis clients ». Décrire concrètement le CMS et garder le vocabulaire compréhensible par un client.

# Pages publiques

Le rendu public garde la direction approuvée : fond statique, cartes texturées, trois forfaits de création, galerie et FAQ. Les textes partagés et règles commerciales vivent dans `shared/` et `src/content/`.

## Fichiers

- `index.tsx` : accueil, pages de forfaits/options, galerie, FAQ et contact.
- `OfferComparison.tsx` : tableau et détails repliables ; les colonnes suivent les trois offres de `publicOffers`.
- `FaqList.tsx` : accordéon FAQ partagé par l’accueil et `/faq`. Les réponses restent dans le DOM ; celles qui sont fermées sont inaccessibles au clavier et aux lecteurs d’écran.
- `pricing.ts` : lecture du catalogue tarifaire validé, libellés de départ et liens de configuration. Aucun montant commercial en dur.
- `../public.css` : mise en page et états visuels propres aux pages publiques.

## Parcours et invariants

Les trois cartes partagent `PricingCard` et ouvrent le configurateur commun dans `../configurator/index.tsx`. Après les options, `ProjectBriefForm` affiche coordonnées et message à droite de `SelectedPlanCard`, sans calendrier ni fichiers. Les anciennes offres quittent le parcours public tout en restant lisibles dans les historiques privés.

La navigation propose Accueil, un menu Forfaits, Exemples de sites, FAQ et Nous contacter. Les étapes sont sur l’accueil (`#fonctionnement`) ; `/methode` y redirige. Les anciennes routes `/formules` restent compatibles.

La galerie contient neuf références externes créditées. Un seul badge et une seule catégorie par site, filtrée par `offerId`. Image, titre et action ouvrent directement la référence dans un nouvel onglet. Aucun aperçu externe embarqué ni relation client revendiquée. Atlante est archivé ; les captures et crédits sont documentés dans `docs/ASSETS_REFERENCES.md`.

Les prix proviennent du serveur, avec les prix validés de `defaultPricing` comme repli si le catalogue manque ou est invalide. Les inclusions et totaux sont calculés dans `shared/catalog.ts` et les options visibles dans `shared/offer-options.ts`. Les prix de départ sont donnés à titre indicatif. Business reprend Vitrine et Premium / 3D reprend Business. La reprise de 5 pages et 15 médias est comprise dans Premium / 3D. Les fourchettes d’options produisent une plage totale si toutes les bornes sont connues. Les trois abonnements mensuels 19/39/69 € se remplacent sans se cumuler.

Les demandes sont enregistrées dans l’API privée ; une notification dépend de la configuration du transport. Les essais locaux désactivent ce transport. Ne jamais soumettre une demande fictive en production.

Pour les modifications et vérifications, suivre `docs/MODIFIER_LE_SITE.md` et les dernières décisions de `AGENTS.md`.

Derniers nombres de pages : Vitrine 1–3, Business 1–6, Premium 1–10. CMS mis en avant dans Business. Réservation générique proposée séparément sur les trois forfaits. Les hauts des cartes et leurs boutons partagent un canevas de texture continu ; les quatre arguments Premium doivent être affichés.
