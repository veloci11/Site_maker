# Retrait et replacement réellement animés

Le changement de case CSS instantané est remplacé par une animation FLIP des lignes réelles. L’action capture leurs positions visuelles avant la mise à jour ; la nouvelle configuration et le total sont calculés immédiatement. Les lignes restantes glissent vers leurs nouvelles cases sur 620 ms. La ligne retirée est clonée uniquement pour un fondu de 420 ms, hors du flux, non interactive et masquée aux technologies d’assistance, puis supprimée. La hauteur du résumé suit le contenu sur 620 ms.

Les déplacements interrompus repartent de la position visuelle courante. Un réajout pendant le fondu reprend la position/opacité de la sortie, sans conserver de doublon. Toutes les animations et copies sont nettoyées à la fin, au démontage et à l’activation de la réduction du mouvement. Aucun changement des calculs, du stockage ou des textures.

Ordre corrigé : 1–3 gauche, 4–6 droite, 7 gauche, 8 droite, puis alternance.

## Preuves IAB locales

- Retrait au milieu de 12 options : Prise de rendez-vous passe de x 286,05 à x 0 et de y 0 à y 52, avec 67 positions horizontales arrondies distinctes. Les échantillons intermédiaires progressent, au lieu d’un saut de case.
- La sortie montre onze niveaux d’opacité de 1 à 0 ; aucune copie à la fin. Texture fixe de 580 px.
- Retrait/réajout rapide puis second retrait : état attendu et aucune copie résiduelle.
- Dernière option : hauteur 29,5→0, sortie en fondu et zéro choix restant.
- Mobile : 31 positions verticales arrondies pour la ligne qui se replace, pas de copie résiduelle. Texture fixe de 500 px.
- Réduction du mouvement : aucune copie ni animation de ligne ; préférence ensuite restaurée.
- Console vide, choix locaux initiaux restaurés et viewport réinitialisé.

Les traces attestent le déplacement et les durées observées, pas une garantie de cadence sur chaque appareil. Publication terminée : `ab76cb29705868e4882b5835d6db0a9c0fcd98d4`, release `20261105T065746Z-ab76cb297058`. IAB public : 48 positions horizontales intermédiaires et 28 positions verticales, sortie en fondu, zéro copie à la fin, image fixe et aucune erreur de console. Recontrôle mobile complet après une première trace arrêtée au début de l’action. Configuration initiale vide restaurée et viewport réinitialisé. Santé/empreintes vérifiées, sauvegarde réussie et 25 autres PID inchangés ; localhost arrêté. Les 213 tests passent. GitHub : échec avant tout runner/étape pour compte verrouillé côté facturation, action du titulaire requise ; voir `ci-diagnosis.md`.
