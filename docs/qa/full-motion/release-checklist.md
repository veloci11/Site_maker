# Livraison finale — suivi des vérifications

- TypeScript, build et 213 tests locaux passent après la correction finale des clics rapides.
- Les six ouvertures et six fermetures ont été mesurées dans l’IAB sur ordinateur et mobile : transitions natives de 520 ms, routes exactes et absence de débordement horizontal.
- Ajout/retrait des options : animation de 620 ms, image fixe de 580 px sur ordinateur et 500 px sur mobile.
- Carte sticky à 112 px sur ordinateur, défilement interne testé ; carte naturelle sur mobile. Plusieurs groupes ouverts simultanément.
- Douze options Vitrine et dix Sur mesure contrôlées ; continuité du fond inspectée sans miroir visible.
- DPR 2 : original 1536 × 1024 et continuation native effectivement téléchargés. Les trois fichiers d’origine restent inchangés.
- Brouillon local : annulation au clavier conserve le texte et les trois choix ; texte de test ensuite effacé via l’interface. Aucun envoi réel.
- Réduction du mouvement activée après rendu du lien : bonne destination, aucune transition native, durées CSS de 0,01 ms.
- Clic pendant la capture native : corrigé par interruption de la capture au prochain geste réel, sans clic synthétique ni navigation différée. Les clics rapides et le retour clavier pendant une transition active atteignent la dernière destination. Le déroulé normal conserve ses 520 ms. Preuves : mobile/final-rapid.json, final-normal-open.json et final-keyboard-service-back.json.
- GitHub Actions : blocage du compte/facturation avant démarrage du runner, indépendant du code ; voir ci-provenance.md.

Les captures complètes représentent un état statique et ne démontrent pas à elles seules une cadence de 60 images/seconde. Les traces JSON confirment l’exécution et les durées des animations.
