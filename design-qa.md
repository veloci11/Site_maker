# Vérification visuelle — fond et navigation, 2 novembre 2026

**final result: passed**

Le fond et la simplification sont implémentés et les parcours locaux ci-dessous fonctionnent. Ce résultat décrit la vérification technique et visuelle de cette révision ; le nouveau fond reste soumis au retour esthétique de Mathis. Il ne constitue pas une validation commerciale ou de production.

## Source et comparaison

- Vérité visuelle pour les **cartes approuvées** : `docs/reference-cartes-validee.png` et les arbitrages utilisateur suivants (couleur en haut uniquement, aucune description ni image dans les cartes). Le composant PricingCard est inchangé, ainsi que les 30 règles CSS contenant `.pricing-card` comparées au commit précédent.
- Nouvelle direction demandée : fond mieux rendu et plus visible, sans image d’ambiance ni animation ; navigation réduite aux accès utiles. Interprétation mise en œuvre : plages lavande/pêche/ciel/crème, grain fin en lumière douce sans voile gris, menu Accueil + quatre forfaits et connexion.
- Avant : `docs/qa/navigation-background/before.jpg` et `docs/qa/final-mobile.jpg`. Ils représentent l’état rejeté du fond/menu et non une cible à recopier.
- Implémentation réellement ouverte : http://127.0.0.1:4173/ ; build servi par Express.

### Preuves composées et inspectées ensemble

| Preuve | Contenu et normalisation |
| --- | --- |
| `docs/qa/navigation-background/comparison-mobile-full.jpg` | Page entière avant à gauche et après à droite, chacune normalisée à 375 px de large. Ancienne capture 375 × 3850 ; nouvelle 318 × 3215, normalisée proportionnellement. Le retrait de la phrase de footer et les retours à la ligne expliquent la différence de hauteur. |
| `docs/qa/navigation-background/comparison-navigation.jpg` | Focus sur le header, ancien en haut, nouveau en bas. L’ancien affichait huit entrées dont Exemples avec sous-menu ; le nouveau conserve cinq liens et la connexion. Les régions sont normalisées à 878 px de large. |
| `docs/qa/navigation-background/desktop-preview.jpg` | Vue desktop à quatre colonnes, ouverture complète dans le navigateur adaptatif : header, titre, CTA et début des quatre cartes. Capture du contenu uniquement, 708 × 444 px. |
| `docs/qa/navigation-background/final-opening.jpg` | Dernière capture native mobile, 383 × 723 px, état anonyme en haut de page, menu fermé. |
| `docs/qa/navigation-background/final-full.jpg` | Dernière page mobile entière, 318 × 3215 px ; cartes au repos, comparatif et FAQ fermés. |
| `docs/qa/navigation-background/menu-mobile.jpg` | Menu ouvert : Accueil, quatre forfaits, connexion et fermeture. |

Viewport desktop contrôlé dans le DOM : **1280 × 800 CSS px**, quatre colonnes, aucune largeur de page excédant le viewport. Le navigateur adaptatif affichait 1536 × 960 à un zoom de 120 % ; sa vue visible était réduite dans le panneau de l’application. La capture desktop retenue est le contenu de cette vue, sans le reste de l’application. Les essais de capture d’émulation recadrés incorrectement ont été exclus des preuves et conservés hors Git.

Viewport mobile final : **395 × 745 CSS px**, DPR signalé 2,4 à ce zoom. Le navigateur restitue des captures natives/pleine page de densités différentes ; la comparaison entière normalise leur largeur au lieu de traiter ces différences comme des changements de typographie. L’ancienne comparaison mobile avait un viewport de 390 × 844. Cette petite différence de largeur est signalée ; aucune fidélité au pixel près n’est revendiquée.

## Résultats par surface

| Surface | Résultat |
| --- | --- |
| Fonts/typographie | Geist unique, titres et contrôles lisibles, aucun changement de police ni d’échelle des cartes. Hiérarchie et retours à la ligne conservés. Le secondaire public est foncé à #575360 pour rester lisible sur les pastels. La normalisation des images ne remplace pas ce contrôle CSS/DOM. |
| Espacement/layout | Menu allégé, quatre forfaits sur desktop et une colonne mobile ; aucun débordement de page observé. Les cartes gardent exactement leur anatomie. Le tableau comparatif reste défilable dans son cadre, sans faire déborder la page. Header de hauteur stable, sans animation au scroll. |
| Couleurs/tokens | Le bleu/vert/corail mélangé et le voile gris sont remplacés par des plages pastel plus distinctes. Grain généré une fois et mélangé en lumière douce ; fondu continu vers le blanc. Pas de bitmap d’ambiance ni animation de fond. |
| Images et icônes | Texture approuvée des cartes inchangée. DTK/Julie et les autres exports WebP actifs restent disponibles. Originaux et essais retirés du build, conservés dans `docs/asset-sources`. Lucide et logos existants conservés ; aucune approximation graphique ajoutée. |
| Copy/contenus | Retrait des entrées de menu et contrôles redondants, de la recherche/catégories des sept FAQ et des filtres de la petite galerie. Les étapes restent sur l’accueil et la comparaison se rejoint dans la page. Aucun texte commercial supplémentaire ni prix inventé. |

## Historique des écarts et corrections

1. **P1 — fond encore rejeté et navigation trop chargée.** Source : retour utilisateur après la précédente livraison et capture avant. Correction : nouvelle palette, grain sans voile gris, cinq liens principaux, suppression du méga-menu, aide en pied de page. Recomparaison : images composées entière et header ci-dessus ; aucun élément nécessaire au choix d’un forfait n’est masqué.
2. **P2 — contrôles de navigation disproportionnés.** La FAQ avait recherche et quatre catégories pour sept questions ; la galerie répétait cinq filtres pour une petite liste. Correction : listes directement accessibles, accordéons FAQ conservés. Le clic FAQ et l’ouverture d’une réponse ont été testés dans le navigateur.
3. **P2 — retour Accueil après ancre/défilement.** Le chemin seul ne changeait pas et le retour pouvait conserver la position. Correction : gestion du hash et de la clé de navigation dans ScrollTop. Après rechargement du build final, les deux essais donnent `scrollY: 0` : retour depuis une ancre puis retour après défilement sur le même chemin.
4. **Recomparaison finale.** Pas d’écart P0/P1/P2 restant dans les surfaces contrôlées. Les anciennes vérifications et leurs limites restent archivées dans `docs/qa/design-qa-previous.md` ; le retour utilisateur annule leur acceptation du fond/menu.

## Interactions et vérifications finales

- Menu mobile ouvert, entrées vérifiées ; choix Immersif 3D ferme le menu et ouvre le vrai configurateur avec Julie Thiam.
- FAQ accessible depuis le pied de page, sept questions sans catégories, réponse dépliée correctement.
- Lien Comment ça se passe vers `#fonctionnement`, placé sous le header ; lien de comparaison vers `#comparer` sur la même page.
- Ancienne route `/methode` redirigée vers les étapes ; position observée autour de 84–88 px sous le header sur viewport stabilisé.
- Retour Accueil vérifié depuis une ancre et après défilement sur le même chemin : position zéro dans les deux cas.
- Layout desktop à quatre colonnes et mobile sans débordement ; cartes préservées par comparaison du composant et des règles CSS.
- Journaux navigateur finaux : aucun avertissement ni erreur recueilli.
- `npm run check` après la correction de navigation : TypeScript, build et **80 tests réussis**, sans avertissement CSS. Journal : `docs/qa/navigation-background/check.txt`.
- Mesures de ressources : `docs/qa/navigation-background/resources.json` et `docs/OPTIMISATION_INTERFACE.md`. Environ 9 % de JS initial en moins ; assets publics ramenés de 25,2 à 1,03 Mo. Le volume public n’est pas assimilé à un téléchargement intégral à chaque visite. Aucun gain FPS/INP n’est inventé.

## Checklist et limites

Cartes inchangées ; fond statique en code ; navigation réduite ; liens et ancres testés ; aperçu conservé ; sources archivées ; build et tests passants. Aucun nouveau blocage P0/P1/P2 constaté sur ces parcours locaux.

Pas de test sur appareil physique, de charge représentative ou de déploiement public. Prix/périmètres, documents commerciaux et services de production restent dans l’état décrit dans `docs/READINESS_REVIEW.md`. Le goût visuel du nouveau fond reste une décision utilisateur, distincte du résultat technique de QA.
