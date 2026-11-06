# Revue Astra du 5 novembre 2026

État de ce premier lot : code vérifié localement, publication suivie séparément dans `ops/DEPLOYMENT_STATUS.md`. Les prix restent des recommandations, aucun tarif de production remplacé.

## Demande et équipe

Mathis demande une contre-revue Astra des prix, des options, des bugs, des animations et du code pour le reprendre facilement. Six missions Astra réelles : prix, catalogue, bugs/code, animations, contre-audit indépendant et classeur. Le parent arbitre, simplifie les composants, vérifie les parcours et assure la livraison.

STUDIO : une base puis des modules compatibles. Un petit ajout réutilisable se distingue d’un développement spécifique. Les vraies grilles publiées de JD Création Web, Ordas et Donar sont reprises dans `docs/PRIX_ASTRA_2026-11-05.md`, avec coût complet, sources et limites. Six forfaits/services, 26 options, pas de doublon/manquant. Les quantités et variantes de prix du rapport sont des unités de devis ; le configurateur actuel a un seul montant par option et pas de quantités.

## Modifications

- API : les objets, tuples et instances `Headers` sont désormais fusionnés correctement, sans doublon de casse des en-têtes. Défaut reproduit par test avant correction ; aucun incident utilisateur actuel allégué.
- Catalogue : références internes Connecté/Immersif alignées avec leurs catégories ; précisions langues, frais de paiement, domaine/hébergement et brief créatif Sur mesure. Les menus restent 14/17/14/14, sans option inventée ni ID supprimé.
- Lisibilité : comparatif, FAQ et lecture des prix séparés de `public/index.tsx` ; routes et pages de repli de `App.tsx` mises en forme ; import/condition du brief simplifiés. Aucun nouveau framework ou dépendance.
- Animation : retrait des anciennes règles 520 ms déjà surchargées. Le moteur 760 ms, les animations de sélection 620/420 ms et les images restent inchangés. Aucun effet ajouté sans utilité ni bug d’animation universel prétendu.
- Documentation : guide manuel et README publics corrigés (catégories uniques, Cal.com, accordéons multiples, fichiers actuels).

## Vérification locale

`npm run check` : TypeScript, build et **230 tests passants**, zéro échec. Trois textures originales identiques octet pour octet. Workflow Actions uniquement manuel, inchangé.

IAB, ordinateur 1280 × 720 et mobile 390 × 844 : **24 trajets** pour les six offres, à dimensions stables. Après chaque ouverture/retour : opacité 1, phase nulle, aucune animation active, aucun débordement. Durées natives observées dans `verification.json`.

Changer ouvert dès la phase entrante active ; passage Évolution → Refonte puis historique arrière correct. Sélection Connecté de 17 choix : titre 50 px stable, retrait/réajout avec 110 positions intermédiaires sur 125 relevés. Préférence réduite : 16 choix après retrait, zéro copie restante, résumé en flux sans défilement interne. Toutes les cases d’essai ensuite effacées.

FAQ extraite : fermeture progressive 100,78 → 0 px, contenu immédiatement inert/aria-hidden. Galerie Connecté : deux références et bon bouton actif. Comparatif extrait : ouverture/fermeture et aria-expanded corrects. Questionnaire vide : première erreur focalisée, aucun envoi. Console locale observée sans erreur/alerte.

## Parcours visuel

1. Accueil : choix des offres et étapes accessibles, direction visuelle conservée.
2. Configuration : options compatibles et résumé lisibles ; les montants définitifs restent à renseigner.
3. Questionnaire : passage, champs requis et première erreur fonctionnels.
4. Galerie : deux références Connecté, une catégorie par exemple.
5. FAQ/comparatif : dépliage, repli et clavier contrôlés après extraction.

Captures courantes conservées dans le dossier de travail `revue-astra-2026-11-05/captures`. Les vérifications décrivent ces parcours, pas tous les navigateurs ni une conformité d’accessibilité certifiée. Aucune demande de test en production.
