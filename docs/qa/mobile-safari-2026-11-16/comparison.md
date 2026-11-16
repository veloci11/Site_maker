# Comparatif téléphone — 16 novembre 2026

## Demande et choix ergonomique

Le tableau qui montrait un seul forfait à la fois imposait de mémoriser les valeurs en changeant de colonne. Sous 761 px, le comparatif présente maintenant deux forfaits côte à côte. Chaque intitulé de fonction occupe toute la largeur, directement au-dessus des deux valeurs alignées. Les intitulés longs ne prennent donc plus la place d’une offre.

Deux sélecteurs HTML natifs permettent d’accéder aux trois offres. La paire initiale est Vitrine / Business. Choisir le forfait déjà présent à côté échange les deux colonnes : deux offres distinctes restent toujours comparées. Aucun glissement horizontal n’est nécessaire.

Les noms gardent une taille de 16 px et peuvent revenir sur deux lignes. Le sélecteur natif couvre sa présentation visuelle et ouvre le choix système, avec une taille de 16 px pour éviter le zoom de focus d’iOS. Chaque sélecteur fait 52 px de haut et chaque CTA au moins 44 px. L’en-tête reste ancré dans un scrollport vertical natif ; noms, prix et boutons restent ainsi visibles pendant la lecture des fonctions.

## Périmètre des sources

- `src/pages/public/OfferComparison.tsx` : présentation mobile de deux offres, alimentée par les mêmes `comparisonSections`, `publicOffers`, `publicPageCounts` et `startingPrice` que le tableau complet. Les 15 fonctions, leurs détails, inclusions et tarifs restent ceux du catalogue existant. Le bouton de détails commande les deux présentations.
- `src/pages/public.css` : nouvelles règles du comparatif limitées au téléphone, sous 761 px. Le tableau desktop, son en-tête sticky, ses cellules et ses coins arrondis conservent leurs règles existantes.
- `src/lib/comparison-pair.ts` : le calcul de défilement horizontal devenu inutile est remplacé par la sélection d’une paire distincte, sans mutation de l’état précédent.
- `tests/comparison-pair.test.mjs` : choix du troisième forfait dans chaque colonne, permutation en cas de doublon, toutes les paires et sélections possibles, absence de mutation et sélection inchangée.

Les CTA mobiles réutilisent `ComparisonConfigureButton`, `MotionLink`, le préchargement, les surfaces texturées et la logique de retour existants. Leur nom accessible comprend le forfait et son prix réel. Les sélecteurs portent « Premier forfait à comparer » et « Deuxième forfait à comparer ». Chaque valeur possède une association explicite avec son intitulé de fonction et son en-tête de forfait.

## Vérification locale et limites

- `npm run typecheck` : réussi.
- `node --test tests/comparison-pair.test.mjs` : 4 tests réussis.
- Contrôle du diff : aucune modification des données du catalogue ni des règles desktop du tableau.
- Contrôles visuels et interactions à 320, 390 et 430 px : à consigner par le contrôle intégré coordonné dans le chat principal.
- Aucun essai matériel sur iPhone/Safari effectué dans ce sous-lot. L’émulation de taille ne doit pas être présentée comme un test sur appareil réel.

État : code local, sans commit, push ni publication dans ce sous-lot. Aucun serveur local ni navigateur externe démarré.
