# Ouverture et fermeture des six cartes — 5 novembre 2026

Demande : reprendre les six cartes et leurs retours, dont le raccord restait imparfait.

## Correction

La grande image reste opaque sous le fondu de la petite image pendant une fermeture ; à l’ouverture, la grande image couvre immédiatement la croissance du cadre. Le fond de page ne traverse plus les deux images. Le cas sans petite carte correspondante (comparatif, accès direct) conserve un fondu complet, sans image figée jusqu’à la fin.

Le résumé, les options et le total appartiennent au même calque de contenu. Le masque est porté par le groupe natif extérieur, indépendamment du bitmap de texte, dont le navigateur peut calculer une zone intrinsèque différente du rectangle DOM. Ses quatre bords interpolent les limites exactes du cadre ; les marges signées évitent de rogner les éléments déjà entrés. Texte et image restent à leur échelle propre.

Votre forfait et l’apparence de Changer sont révélés au même endroit que leurs éléments réels. Le vrai bouton reste hors du sous-arbre capturé ; une apparence décorative inaccessible restitue le raccord sans absorber le premier clic. Les autres contrôles entrants restent vivants. Les deux tailles de titre ne se superposent plus pendant le retour. Durée totale : 760 ms, avec reprise immédiate au clic, clavier ou défilement.

## Vérification locale finale

`desktop-journeys.json`, `mobile-journeys.json` et `matrix-summary.json` couvrent les 24 trajets : Vitrine, Connecté, Immersif 3D, Sur mesure, Évolution et Refonte, ouverture et fermeture, dans l’IAB uniquement. Chaque trajet comporte au moins 64 relevés ; plus de 1 550 relevés au total. Pendant le déplacement (avant 750 ms), les limites du masque et celles du cadre diffèrent de moins de 0,3 pixel CSS dans ces visites. Un des deux calques d’image reste à une opacité de 1. Toutes les arrivées ont une opacité de page de 1, aucune animation de page rejouée, aucun calque natif résiduel et aucune largeur débordante.

Les relevés de nettoyage après la durée nominale restent dans les fichiers bruts ; ils ne sont pas utilisés pour mesurer les limites d’un groupe que le navigateur est en train de supprimer. Ces observations ne garantissent pas une fréquence d’images sur tous les appareils.

`interactions.json` : Changer ouvert alors que la transition entrante était encore active, changement vers Refonte, retour rapide au clavier, mouvement réduit sans transition native, ajout/retrait d’une option avec restauration des trois choix locaux initiaux. `fallback-comparison.json` : accès direct à Sur mesure puis retour au comparatif ; opacité sortante de 1 à 0, sans appariement fictif.

Les captures exploratoires des étapes précédentes ont été écartées du dossier final et conservées dans `.data/qa/card-motion-polish-exploratory/`. Elles ne prouvent pas le rendu du code final. Les captures finales de publication seront ajoutées après contrôle public.

## Revue et vérifications

Guide `vercel:react-best-practices` appliqué : hooks inconditionnels, lectures de géométrie regroupées avant les écritures, état transitoire borné au cycle de navigation, pas de boucle de mesure pendant l’animation, nettoyage des observateurs conservé. Aucun paquet ajouté. Le mécanisme de replacement des options, les calculs, les questions, les prix et les données privées ne sont pas modifiés.

Les trois textures originales sont identiques octet pour octet (`original-images.json`). Console locale sans avertissement ni erreur à la fin des contrôles. Aucune demande ni aucun e-mail envoyés. `npm run check` final : TypeScript, build et 213 tests passants (`check-summary.json`). `git diff --check` propre. Serveur local arrêté, ports 4173/4174 libres.

## Livraison

Révision applicative `b261ffad11fb09fe49cf6d0377bf901f5a728fd4`, release `20261105T205039Z-b261ffad11fb`, publiée sur https://gilmathis.com/.

Les 24 trajets sont également vérifiés dans l’IAB public, sur ordinateur et mobile (`public-*-journeys.json`, `public-summary.json`). Tous aboutissent à une page stable, sans débordement ni seconde animation. Un des deux calques reste opaque. Écart maximal relevé entre cadre et masque avant 750 ms : 0,305 px CSS. Les tailles de chaque viewport sont stabilisées avant les mesures. Le nombre de relevés varie selon l’ordonnancement du navigateur ; ces échantillons ne constituent pas une mesure de fréquence d’images.

En public, le menu Changer s’ouvre alors que la phase entrante est encore active ; changement de Refonte vers Vitrine confirmé. La sélection initiale publique vide reste vide. Console IAB sans erreur ni avertissement observé. Aucun formulaire envoyé. Capture native finale inspectée : `public-final.jpg`. Viewport réinitialisé ; seule Vitrine publique est conservée dans l’IAB.

Santé origine et publique valide. Treize fichiers publics correspondent exactement au build (entrée JavaScript, CSS, composant de carte et trois textures originales), contrôlés depuis l’origine courante dans l’IAB (`public-assets.json`). Le client HTTP Python indépendant reçoit un 403 de la couche de protection ; il n’a pas servi à établir les empreintes. Aucun réglage de protection modifié.

Sauvegarde privée préalable réussie, bascule réversible, catalogue inchangé et 24 autres services en cours d’exécution gardant leurs PID/états. GP Park répond toujours HTTP 200. Les preuves d’archive et d’origine sont dans `deployment-artifact.json` et `deployment-origin.json`.
