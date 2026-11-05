# Suite demandée — coordination de dix interventions

État : essai `3d4d854` en ligne. Qualité de la source générée rejetée ; le master d’origine de 1536 × 1024 est conservé. La CI GitHub est bloquée avant démarrage par la facturation du compte, d’après l’annotation du run 41968746233 ; ne pas présenter cela comme un échec des tests locaux.

Capacité : trois sous-agents actifs simultanément, parent compris dans une limite de quatre agents actifs. Dix interventions distinctes se succèdent par vagues.

1. `motion_core` : orchestration de page/carte aller-retour, fichiers motion.tsx, plan-transition.tsx et nouveau plan-motion.css.
2. `motion_returns` : origine de liste, position de retour et liens de sortie, helper plan-return.ts, ScrollTop et liens ciblés.
3. `texture_quality` : master conservé et continuation réellement haute définition, nouveaux assets seulement.
4. Revue du blocage GitHub et provenance des vérifications.
5. Revue des interruptions, du header et du menu pendant les mouvements.
6. Revue accessibilité, mouvement réduit et contenu défilable de la carte.
7. Revue performance et poids des nouveaux assets.
8. Contrôle des six parcours sur ordinateur dans l’IAB.
9. Contrôle mobile des parcours et options dans l’IAB.
10. Revue finale du diff, des invariants et de la livraison.

Seul le parent construit, commit, pousse et déploie. Pas de partage des fichiers modifiés par deux spécialistes simultanément. Les vérifications navigateur sont séquencées pour éviter les conflits de viewport. Aucun formulaire ou e-mail de production envoyé. Les autres services de l’hôte Ubuntu restent hors périmètre.
