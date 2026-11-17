# Douceur mobile et choix sans déplacement

17 novembre2026. Publié et contrôlé en HTTPS : `20261117T064321Z-ed8a123675d6`, révision `ed8a123675d6fc546a142c192cb50ac6088ca592`.

## Défaut reproduit et correction

À430 px, sélectionner Langue agrandit le résumé de436,375 à578,672 px. La ligne passe de407,305 à520,102 px à l'écran (+112,797 px), pendant620ms : le résumé est au-dessus des choix. La hausse de scrollY est seulement29,5px. `before-selection.json`, capture01. Le locator de l'outil recentre lui-même légèrement avant le clic : les validations finales utilisent des appuis AX aux coordonnées visibles, sans ce recentrage.

Sur public<=760px, tailles du résumé/mensuel et masquage Paiement/Boutique commits immédiatement. useOptionReflow écrit la hauteur finale avant de sortir, et n'alloue plus les clones/animations de liste sur téléphone. La ligne .configurator-choice-item est capturée avant mutation ; un layoutEffect placé après celui du résumé compense son déplacement une fois avant peinture. Grille exclue de l'ancrage natif, aucune boucle de scroll ou observation permanente ajoutée. La remise en vue différée d'un accordéon est annulée quand un choix intervient. Privé et desktop gardent leurs transitions.

## Vérifications des choix

- **Appuis AX répétés430px.** Cinq ajouts/retraits : écart final±0,203px, identique immédiatement et après750ms ; bandeau au bas932. Le récapitulatif peut grandir, la ligne reste visible au même endroit. `direct-taps.json`, capture02.
- **Pages et quantité.** Ajout/retrait±0,203px, nombre1→2 sans déplacement. `quantity.json`.
- **Mensuels exclusifs.** Hébergement, Maintenance, Sérénité et retrait : écart0 à±0,102px ; bandeau au bas932. `monthly.json`.
- **Boutique.** La ligne Paiement se masque/se réaffiche sans déplacer Boutique :±0,102px. `store-inclusion.json`.
- **Pendant ouverture.** Appui Réservation130ms après ouverture : écart−0,070px après800ms, aucun recentrage différé. `during-open.json`.
- **320px/réduction du mouvement.** Écart−0,195px, aucune animation d'arrivée, bandeau au bas740. `narrow-reduced.json`, capture04.
- **Desktop1280.** Ligne inchangée à l'ajout/retrait ; cadre49→64,680→78,5px avec transition620ms et raccord natif760ms conservé. `desktop.json`.

## Arrivée et retour

Arrivée560ms, opacité initiale.2 plutôt que0, glissement18px et courbe(.4,0,.6,1) répartie. Carte et texte ensemble ; fonctionnalités et enfants du bandeau en fondu mobile distinct, sans translation. Fond du bandeau opaque1, bas932 ; zéro capture native. Phases réelles observées, pas seulement nom CSS (`entry-motion.json`, capture03). Le retour anime seulement la carte recentrée en opacité.65→1/300ms ; position147,211px pour header147px, stable jusqu'à la fin (`return-motion.json`). Ni menus/hash, ni les choix de fonctionnalités ne déclenchent ce retour ; mouvement réduit prioritaire.

Deux spécialistes ont relu le diff en lecture seule : ordre des effets/tailles, nettoyage, portée privé/desktop, retour sans changement d'historique et bandeau fixe conservés. **314 tests passent**, TypeScript et builds client/SSR/Sites réussis. Aucune alerte console sur les parcours vérifiés, aucun formulaire envoyé. Ces observations de contenu mobile émulé ne mesurent pas les FPS sur un iPhone matériel.

## Publication vérifiée

Sur gilmathis.com430px/safe-area59/34, arrivée réelle560ms : opacité.200→.529→1, translation17,992→10,598→0 px. Fondu synchronisé, zéro capture, bandeau opaque et ancré. Ajout/retrait par appui AX : écarts+0,203/−0,203px, stables après750ms. Retour Vitrine : opacité.65→1 et top147,211px inchangé pour header147px. Aucune alerte console. Captures05–06 et `public-browser.json`.

Le JS et les CSS des routes accueil/configurateur, cinq actifs au total, correspondent au build par SHA-256 ; santé valide (`public-integrity.json`). Sauvegarde et préflight Node24/SSR avant bascule, trois offres/28 définitions, prix et identifiants inchangés.22 autres services/PID conservés et GP Park inactif (`deployment-origin.json`). Seul site-maker.service redémarré. Localhost4183 arrêté (PID84591), deux onglets locaux fermés et émulations/viewport retirés ; aperçu public conservé.
