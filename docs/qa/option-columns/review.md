# Résumé sans barre intérieure

La solution garde toutes les options et le total visibles dans le flux de la carte. Deux colonnes équilibrées sur une carte large, une seule sur mobile ou sur carte étroite. La compaction au cinquième choix est animée ; les lignes conservent leur entrée/sortie de 620 ms. Aucune image ni règle métier modifiée.

Les preuves locales couvrent Vitrine et Connecté à 12 choix, Sur mesure à 10, mobile, écran bas, transition depuis le comparatif, retour aux trois options initiales et absence de messages de console. Le sticky reste limité par la grille, comme auparavant. La colonne CSS se lit de haut en bas puis passe à la suivante ; elle ne tronque pas les libellés.

Publication terminée : `0cdbd930aa8157086a53e8994e9d4ebb65106a48`, release `20261105T061831Z-0cdbd930aa81`. Santé origine/HTTPS valide, client et huit CSS identiques au build, catalogue et 25 autres PID inchangés, sauvegarde réussie. Dans l’IAB public : 12 options et total visibles dans la carte à deux colonnes, sans overflow interne ni horizontal ; mobile en une colonne. Console vide. Sélection initiale vide restaurée, viewport réinitialisé, serveur local arrêté. TypeScript, build et 213 tests passants. Le contrôle GitHub reste bloqué par la facturation du compte avant démarrage d’un job, preuve dans `ci.json`.
