# Révision fond, navigation et charge initiale — 2 novembre 2026

## Changements

- Navigation principale : cinq entrées, Accueil et les quatre forfaits, au lieu de huit entrées dont un méga-menu. Connexion conservée.
- Exemples regroupés dans les fiches ; FAQ/contact dans le pied de page. La méthode se lit dans l’accueil ; `/methode` redirige vers `/#fonctionnement`.
- FAQ : sept questions directement accessibles en accordéon, sans recherche ni quatre catégories. Galerie : références visibles sans cinq filtres.
- Fond statique CSS lavande/pêche/ciel/crème, grain procédural en lumière douce. Le grain ne pose plus un voile gris sur les couleurs. Aucun fond bitmap, filtre animé ou boucle de rendu.
- Suppression de la barre de progression et du traitement de scroll/ResizeObserver du header. La navigation ne change plus de hauteur au défilement.
- Configurateurs en imports différés ; boundary Suspense dans la zone de contenu afin de garder le header et le footer visibles pendant le chargement d’un forfait.
- Styles des anciens composants retirés. Originaux et essais graphiques conservés dans `docs/asset-sources`, hors de `public`.
- Le composant et le style des cartes approuvées sont inchangés.

## Mesures et limites

| Mesure | Avant | Après | Interprétation |
| --- | ---: | ---: | --- |
| Assets copiés depuis `public` | 25 192 429 octets | 1 030 910 octets | 24 161 519 octets retirés du build public, conservés en sources. Ce n’est pas un gain de téléchargement à chaque arrivée : les anciens fichiers n’étaient pas tous chargés. |
| Entrée JS du build | 402 648 octets | 335 851 octets | Environ 17 % de code en moins dans le fichier principal. |
| JS chargé à l’accueil | 429 144 octets | 391 786 octets | Environ 9 % en moins, ressources de l’accueil uniquement, tailles décodées non compressées. Contrôle après rechargement, avant visite d’un forfait. |
| Header | Écouteurs scroll + resize, RAF et ResizeObserver | Aucun traitement du défilement | Suppression de travail décoratif, pas une mesure de FPS. |

La mesure après provient du navigateur sur le build local. La mesure avant et l’analyse de dépendances ont été relevées avant modification. Les tailles gzip du build sont des estimations d’encodage, pas la preuve qu’un hébergeur les sert compressées. Aucun score Lighthouse, INP, GPU ou appareil physique n’est déduit de ces chiffres.

## Vérification

`npm run check` : TypeScript, build et **80 tests réussis**, sans avertissement CSS ; journal `docs/qa/navigation-background/check.txt`. Cartes et texture comparées au commit précédent, inchangées. Menu mobile et fermeture après choix, ouverture réelle du configurateur 3D et image Julie Thiam, FAQ dépliée, ancres des étapes et du comparatif contrôlés dans le navigateur. Le retour Accueil après une ancre ou un défilement réinitialise bien la position à zéro. Les captures et leur contexte sont dans `design-qa.md`.
