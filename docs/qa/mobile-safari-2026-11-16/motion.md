# Ouverture des forfaits sur écran tactile — 16 novembre 2026

## Modification locale

Le téléphone n'emprunte plus le raccord natif de 760 ms. Ce raccord conservait plusieurs captures de la page, du pied de page, de la matière et des textes, avec une géométrie et des masques animés. Réduire seulement sa durée aurait conservé ce travail.

La politique choisit maintenant la navigation directe dès qu'une condition est vraie : largeur de viewport de 760 px maximum, pointeur principal grossier (`pointer: coarse`) ou absence de survol (`hover: none`). Les deux dernières conditions couvrent aussi un iPhone en paysage et une tablette tactile. La détection repose sur les capacités du navigateur, sans chaîne User-Agent.

Après l'arrivée, seule la vraie carte `.selected-plan` reçoit un fondu d'opacité de 0,94 à 1 en 140 ms, sans délai ni première image invisible. Le conteneur `.motion-page` ne reçoit aucune animation sur ce parcours. Aucun déplacement de ce conteneur ne peut changer le repère de la barre de prix fixe. La navigation et les contrôles n'attendent pas la fin du fondu. Aucun calcul de géométrie de raccord, capture, masque animé, flou animé ou boucle JavaScript d'animation n'est engagé sur ce parcours.

Sur ordinateur avec pointeur fin, survol et largeur supérieure à 760 px, la géométrie native approuvée de 760 ms est conservée. La préférence `prefers-reduced-motion` empêche les captures et supprime aussi le petit fondu de la carte.

## Retour et historique

Les liens et `Changer` partagent la même politique. Le retour et le recentrage des offres restent confiés au mécanisme existant de `plan-return.ts`, sans modification de ce fichier.

React Router 7.18 mémorise les chemins ayant reçu un raccord natif et peut le redemander lors de Retour/Avance, même si le lien courant n'en demande plus. `withPlanMotionPolicy()` filtre donc seulement `viewTransitionOpts` dans l'abonnement au routeur créé par `createAppRouter()`. Cela couvre une ancienne entrée native puis le passage à un écran/pointeur tactile ou au mouvement réduit. L'état accepté, les clés d'historique, les bloqueurs, `flushSync`, les erreurs et les autres options sont transmis sans changement. Aucune méthode du document n'est remplacée.

Cet adaptateur est lié à l'interface d'abonnement de React Router 7.18. Le test avec son vrai routeur mémoire doit rester exécuté lors d'une mise à jour du routeur.

## Vérifications effectuées

Commande ciblée : `node --test tests/plan-motion-policy.test.mjs tests/plan-return.test.mjs tests/plan-transition-locations.test.mjs` — **35 tests réussis**.

- Profils iPhone portrait et paysage, tablette, pointeur fin sans survol, fenêtre étroite et ordinateur avec survol.
- Mouvement réduit, navigateur sans API View Transition et rendu sans navigateur.
- Vrai routeur mémoire : ouverture native sur ordinateur, Retour et Avance avec la politique devenue tactile, puis Retour natif après réactivation du profil ordinateur. Les clés et destinations restent celles attendues.
- Transmission inchangée de l'état et des options du routeur ; seule la métadonnée de capture est retirée.
- Régressions existantes : retour sur la carte courante après `Changer`, entrée depuis le comparatif/menu, routes privées exclues, ancienne ancre nettoyée, scroll des pages ordinaires conservé et normalisation des extrémités d'un Retour natif.

`npm run typecheck` — **réussi** après l'intégration dans `createAppRouter()`.

## Portée des preuves

Ces contrôles prouvent la suppression du chemin de capture dans la politique et dans les notifications du routeur, ainsi que la conservation des règles de retour. Ils ne mesurent pas le nombre d'images par seconde de Safari sur un vrai iPhone. Le contrôle visuel et l'éventuel ralentissement CPU dans le navigateur intégré sont effectués par le coordinateur et consignés séparément. Aucun résultat d'émulation ne doit être présenté comme une mesure sur appareil réel.

État de ce lot : **modifié localement**, sans commit, push ni déploiement par ce spécialiste.
