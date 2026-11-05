# Relecture croisée 3

Lecture des cinq avis anonymisés A–E après scellement de l'avis initial. Produit inchangé, pas de nouveau test ni envoi. Captures actuelles 03, 13, 14 et 15 ouvertes et inspectées pendant cette relecture.

## Accords utiles

- **A–E : priorité au budget et au périmètre.** Les ellipses sont bien présentes dans la production capturée (03), et pas uniquement dans le catalogue de repli. Des prix sans unités/limites ne donneraient toujours pas une estimation fiable. Le problème principal n'est pas un manque général d'animation.
- **A/B/C : montrer le coût complet.** La séparation ponctuel/mensuel existe déjà ; la compléter par domaine et outils tiers inclus/exclus/inconnus, présentation fiscale réelle et coût sur douze mois calculable. Une valeur inconnue ne vaut jamais zéro ; une projection sur douze mois n'implique pas un engagement de douze mois.
- **B : retrait silencieux des choix.** La règle de compatibilité est légitime ; le manque d'explication du retrait ne l'est pas. Le parent a reproduit Vitrine avec mobile + galerie, puis Connecté : mobile devient inclus, galerie disparaît. La capture 15 montre l'état final « Forfait de base ». Recommandation P2 confirmée : annoncer les options retirées et distinguer celles devenues incluses. Ne pas ouvrir tous les forfaits à toutes les fonctions pour contourner le problème.
- **A/B/C/E : récapitulatif avant envoi et conservable.** Une seule synthèse peut couvrir choix, périmètre, montant, récurrents, inconnues et version. Elle n'exige pas une étape supplémentaire ni un compte.
- **C/D : informations réelles de l'éditeur.** La capture 13 confirme le texte provisoire. Compléter les pages et leurs liens avant lancement commercial ; aucune conformité juridique globale n'est déduite de cet audit.

## Corrections et réserves

1. **A, total rendu inconnu : évolution future, pas panne de calcul.** Le comportement de `shared/catalog.ts:661` évite de transformer un poste inconnu en gratuit. L'amélioration serait d'afficher « Sous-total connu : X ; postes restant à estimer : Y », sans le présenter comme coût complet, prix minimum garanti ou borne haute. Une fourchette complète exige de vraies bornes pour Y.
2. **B/E, brief mobile : ne pas retenir un défaut d'autoscroll.** La capture 14 montre le vrai passage après clic, correctement positionné sur le titre et les champs. La 06 a été prise après redimensionnement. Compacter davantage la carte reste une préférence possible, mais aucune correction urgente de ce comportement n'est justifiée.
3. **D, notification : dépendance reportée, pas panne démontrée.** L'adresse de réception a été explicitement reportée par Mathis. Planifier une vérification ultérieure avant acquisition ; aucune relance d'adresse dans cet audit, aucune affirmation de message perdu. Les textes de confirmation peuvent être simplifiés indépendamment.
4. **E, contraste : conserver le constat ciblé.** Le calcul de `#81758c` sur blanc identifie un risque concret pour petit texte ; le rendu des différents arrière-plans doit être contrôlé avant verdict global WCAG. Foncer les libellés secondaires utiles est une retouche raisonnable. Pas de déclaration « site non accessible ».
5. **SEO/performance : mesurer avant chantier.** Le rendu client du corps est confirmé, mais il ne prouve ni absence d'indexation ni mauvaise performance en usage réel. Le prérendu vient après le chiffrage et le parcours, sauf mesure qui change la priorité. Le retard transitoire de GeoBoss résolu par le parent ne devient pas une image cassée permanente.

## Cinq priorités finales

1. **Définir les prestations standard et leur prix** : inclusions de base, unités/paliers, options variables et cas exclus de l'estimation automatique. Activer ensuite la promesse « budget avant contact » sur l'accueil.
2. **Afficher une estimation complète et compréhensible** : ponctuel, récurrents, tiers, hypothèses et postes à confirmer ; prix fixe quand le périmètre le permet, fourchette honnête sinon.
3. **Sécuriser la continuité du budget et des choix** : notification des retraits au changement de forfait, version de prix vue/enregistrée et accord explicite avant supplément.
4. **Donner une trace et un interlocuteur identifiable** : récapitulatif conservable avant/après envoi, référence de demande, prochaine étape simple ; informations réelles de l'éditeur accessibles. Réception réelle à valider au moment prévu.
5. **Polir les retours d'état** : contraste des petits libellés, confort des cibles secondaires, bref signal du changement de prix/option. Conserver les matières, le fond statique, le focus, reduced motion et la navigation immédiate.

## Prix / heures après confrontation

Je conserve **euros d'abord, heures principalement en interne**. Un détail de charge peut expliquer une intervention, mais « 1 h » n'est ni une définition de périmètre ni une protection contre le dépassement. Une prestation volontairement vendue au temps peut afficher taux, fourchette et budget maximum convenus ; cela ne doit pas devenir le modèle implicite de tous les forfaits.

L'objectif ±10–20 % doit se mesurer sur des projets comparables à périmètre constant. La promesse utile pour le client est l'absence de supplément non accepté, pas l'autorisation implicite d'ajouter 20 %. Une fois un forfait précis accepté, une mauvaise estimation de nos heures ne devrait pas automatiquement changer son prix. C'est une règle commerciale proposée à Mathis, pas un engagement déjà publié.
