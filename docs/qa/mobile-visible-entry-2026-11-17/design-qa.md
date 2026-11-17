# Arrivée mobile plus visible

17 novembre 2026. État : contrôlé localement, publication à consigner.

Mathis confirme la disparition des saccades mais ne perçoit pas le mouvement précédent de200 ms, opacité.55→1 et translation6 px. Le changement reste limité à plan-motion.css : arrivée de400 ms avec fondu0→1 et glissement24 px de la carte réelle et des liens supérieurs. Les fonctionnalités apparaissent au même rythme, en opacité seule pour préserver l'ancre de défilement. Le fond de la barre de prix reste opaque ; ses enfants suivent le fondu. Aucun zoom, bitmap natif, minuteur, attente de navigation ni nouvelle dépendance. Les autres parcours et le comparatif restent conservés.

## Vérification

- **Mouvement observé à430 px, safe-area59/34.** Carte et liens : opacité.010→.537→1 et translation23,748→11,100→0 px, échelle1 constante. Fonctionnalités et enfants de barre : mêmes opacités, sans transformation. La barre reste opaque1 et son bas reste932 px sur les trois phases. Zéro capture et aucune transformation sur motion-page. Capture `01-visible-entry-mid.jpg`, mesures `entry-frames.json`.
- **Commande immédiate et absence de rejeu.** Personnaliser cliqué pendant l'entrée : focus Configurez votre site, options transformnone et barre au bas932. Après sélection d'une langue, tous les conteneurs restent opacity1 sans relance de l'arrivée ; choix ensuite retiré. `early-tap-selection.json`.
- **Menu à320 px.** Après choix Business et disparition du panneau, la carte est encore animée : opacity.874, translation3,031 px, durée.4s. Pas de capture. Retour Business à147,094 px pour un header147 px, listing sans animation. `menu-arrival-320.json`, `return-320.json`.
- **Mouvement réduit.** Tous les éléments contrôlés ont animationnone, opacity1 et transformnone ; barre au bas740. `reduced-320.json`.
- **Ordinateur.** À1280 px : durée native.76s et trois calques Vitrine, selected-plan sans animation ordinaire. `desktop.json`.

TypeScript, builds client/SSR/Sites et **314 tests passent**. Pas de test miroir ajouté pour ces styles réversibles. Relecture spécialisée de la structure : barre fixe hors des éléments translatés ; le risque de déplacement d'ancre sur un appui immédiat a été évité en limitant les fonctionnalités au fondu. Aucune alerte console sur les contrôles mobile et desktop, aucun formulaire envoyé.

Ces contrôles observent le contenu web dans le navigateur intégré ; ils ne constituent pas une mesure FPS sur un iPhone physique.
