# Défilement de page et animation mobile directe

16 novembre 2026. État : publié et contrôlé sur `https://gilmathis.com/`, révision `8363e7e8eaae2d240221a183d876a0bc4102c5b4`, release `20261117T054057Z-8363e7e8eaae`.

## Demande retenue et réalisation

Mathis apprécie les trois colonnes, mais demande le défilement de la page et un en-tête de tableau qui suit, comme sur ordinateur. L'animation mobile précédente reste étrange sur son téléphone.

La version retire entièrement les captures natives sur tactile/fenêtre étroite, y compris celles mémorisées au Retour/Avance. La carte réelle et son texte apparaissent ensemble sur 200 ms, par opacité et déplacement de 6 px, sans zoom ni recadrage. Aucun ancêtre de la barre de prix fixe n'est transformé. Le listing reste stable au retour. Les branches compactes et sept tests du mécanisme retiré ont été supprimés ; les tests de politique utilisent le vrai routeur, y compris après un passage desktop→tactile.

Le tableau mobile n'a plus de hauteur maximale, d'overflow ni de scrollport interne. Le thead suit le document sous la navigation ; les arrondis et bordures sont attachés aux cellules. Le masquage porte uniquement sur tr/tbody, via timelines CSS ou un fallback mobile passif coalescé par rAF. Pas de masque opaque derrière la navigation. Données, trois colonnes, CTA de 44 px, détails, logo, fond supérieur et comparatif desktop conservés.

## Contrôles IAB avant publication

1. **Défilement unique : réussi.** À 430 × 932, safe-area 59/34, le cadre mesure 1477 px de haut et son overflow est visible ; scrollHeight=clientHeight, scrollTop=0. Un geste dans le tableau fait passer scrollY de 2714,5 à 3646,5. Le thead reste à 147 px, exactement sous la navigation. Capture `02-page-scroll-sticky-430.jpg`, baseline du scroll interne rejeté `01-before-inner-scroll.jpg`.
2. **Bordures et remontée : réussi.** Haut de cellules : bordure 1 px et arrondis 14 px. À la sortie basse, theadTop106,305 / tableBottom249,297 : clip40,672 empêche le débordement au-dessus de147. Après remontée, theadTop147 et clip négatif ; puis le thead reprend le flux à170,008 et263,008 sans bordure détachée. Contrôles après stabilisation du scroll. Captures `03-table-end-430.jpg`, `04-table-scroll-up-430.jpg`, mesures `scroll-down-up-430.json`.
3. **Petits écrans et détails : réussi.** À320 ×740 et320 ×568 avec safe-area59/34, document320 px, trois offres lisibles et thead147 px. Cadre1534 px sans scroll interne ni débordement horizontal. Captures `05-page-scroll-sticky-320.jpg`, `07-short-screen-320.jpg`. Les détails font passer le tableau430 de1477 à2215 px ; le header reste au bon endroit. `details-430.json`, `small-short-reduced.json`.
4. **Image et texte ensemble : réussi.** Entrée Business : animation plan-live-card-arrive .2s, opacité de carte .55, translation6 px à échelle1 ; copie opacité1 et aucune animation distincte. Zéro nom de capture, motion-page sans transform, barre fixe au bas740. Capture `06-live-card-entry.jpg`, `live-entry-business-return.json`.
5. **Changer et retours : réussi.** Business puis Changer vers Premium : carte réelle animée, texte présent, zéro capture et barre au bas740. Retour normal et retour après30 ms : carte Premium à147,094 px pour un header147 px. Business revient lui aussi à147,094. Pas de fondu de tout le listing. `premium-switch-rapid-return.json`.
6. **Mouvement réduit et bureau : réussi.** En réduction de mouvement, carte opacity1/transformnone/animationnone et zéro capture, barre au bas568. Desktop1280 : raccord.76s avec les trois calques de Business ; comparatif quatre colonnes, thead96 px pour navigation96, arrondi14 et logo au repos. `desktop-motion.json`, `desktop-table.json`, `08-desktop-sticky.jpg`.

`npm run check` : TypeScript, builds client/SSR/Sites et **314 tests passent**. Trois spécialistes ont réalisé les deux lots et la contre-relecture finale : géométrie de retour, politiques du routeur, overflow sticky, CSS natif/fallback, observers et cleanup. Aucun autre défaut actionnable relevé. Aucune alerte console observée sur les trois formats locaux et aucun formulaire envoyé.

## Mesures et limites

`performance-before-after.json` compare des parcours Vitrine préchauffés, 430 ×932 / DPR3 / safe-area59, dans des fenêtres de550 ms et après l'arrêt des tests des agents. Durées CPU TaskDuration : retour par lien108,534→65,303 ms, ouverture95,168→74,825 ms, Retour navigateur87,835→48,819 ms. Layouts16/14/15→8/7/7 ; durée des recalculs de styles41,878/36,894/37,067→12,667/14,609/9,945 ms.

Ces mesures caractérisent le travail du navigateur sur cette machine, pas des FPS sur iPhone matériel ni une mesure d'INP. Le masque natif est vérifié dans l'IAB ; le fallback pour navigateurs sans scroll-driven est relu dans la source mais n'a pas été forcé dans cet émulateur. Le retour physique de Mathis reste distinct de ces contrôles.

## Contrôle public et fermeture

HTTPS430 ×932 avec safe-area59/34 : cadre1477 px, overflowvisible et scrollTop0. Un geste dans le tableau déplace scrollY2714,5→3460 et le thead reste à147 px sous la navigation147 px ; bordures1px et arrondis14px. Capture `09-public-page-sticky.jpg`. Entrée Business : plan-live-card-arrive.2s, copie opacity1, aucune capture ni transform sur la page et barre au bas932. Retour Business : carte147,211 px pour nav147 px, sans débordement ni capture. Aucune alerte console (`public-browser.json`).

Client et deux CSS HTTPS identiques au build par SHA-256 ; santé valide, thème/manifeste blancs conservés (`public-integrity.json`). Sauvegarde privée et préflight Node24/SSR réussis avant bascule atomique. Trois offres,28 définitions, tarifs et identifiants historiques inchangés ; seul site-maker.service redémarré,22 autres services/PID inchangés et GP Park inactif (`deployment-origin.json`). Tailscale déjà actif laissé inchangé.

Localhost de cette tâche arrêté : PID79585, port4183 vérifié fermé. Compteurs de performance, émulations et viewport retirés ; quatre onglets de contrôle fermés, nouvelle prévisualisation publique conservée.
