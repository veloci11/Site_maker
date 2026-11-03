# Revue critique des performances — production du 3 novembre 2026

La production s’affiche rapidement sur la connexion de cet ordinateur, mais le remplacement du contenu d’attente provoque un déplacement du pied de page. L’accueil et la galerie dépassent 0,1 de CLS pendant les passages observés, y compris avec les ressources en cache. L’accueil charge aussi le chunk partagé du formulaire alors qu’il ne présente aucun formulaire.

Cette revue est une **mesure de la production antérieure au déploiement de la galerie compacte à dix références**. La production observée affiche encore neuf références et son introduction. Les modifications locales de galerie ne sont donc pas validées en production par ces chiffres. Aucun fichier d’application, visuel ou texture n’a été modifié par cette revue ; seuls ce rapport et son JSON de preuves ont été ajoutés.

## Méthode et portée

- Navigateur intégré Codex exclusivement, dans un onglet caché isolé, fermé à la fin. Aucun onglet utilisateur ni onglet d’un autre spécialiste manipulé.
- Mesures du 03/11/2026, de 22:24 à 22:26 UTC, soit 16:24–16:26 à Mexico. Viewport **1280 × 720 CSS px, DPR 2**.
- Un passage par route avec le cache navigateur ignoré via CDP, puis un rechargement avec cache. Connexion réseau réelle de cet ordinateur, sans limitation réseau/CPU. DNS, TLS et connexions ne sont pas remis à zéro ; le cache CDN reste dans son état réel HIT/EXPIRED. « Froid » signifie donc ici cache navigateur ignoré, pas première visite entièrement froide.
- Navigation/Resource/Paint Timing, événements Network et Performance CDP, observateurs LCP/Layout Shift/Long Task avec récupération des entrées bufferisées. Observateurs déconnectés après 100 ms ; aucun changement de DOM, aucune surcharge globale ni script persistant. Cache réactivé et domaines de diagnostic désactivés avant fermeture.
- Les octets de transfert sont les `transferSize` déclarés par le navigateur, comprenant son estimation des en-têtes, et non une capture des octets sur le réseau. Les comptes incluent le document, le favicon et les ressources servies depuis le cache. Les corps privés et les cookies ne sont pas archivés.
- Aucun score Lighthouse, résultat mobile, INP, percentile terrain, FPS ou coût GPU n’est annoncé. L’absence de tâche longue dans ces buffers ne certifie pas l’interactivité pour toute utilisation. Les mesures ne sont pas un benchmark du serveur Vite local.

Les seuils officiels sont LCP ≤ 2,5 s et CLS ≤ 0,1, évalués au 75e percentile des visites réelles, en séparant mobile et ordinateur. Les échantillons ci-dessous servent à diagnostiquer le site, sans certifier ses Core Web Vitals. Source primaire lue dans le navigateur intégré : [Web Vitals, web.dev](https://web.dev/articles/vitals).

## Mesures

Toutes les durées sont en millisecondes. Les valeurs CLS sont arrondies ici ; le JSON garde les valeurs observées. Pour ces fenêtres courtes, les shifts sans entrée récente appartiennent à une même fenêtre de session.

| Route | Cache navigateur | TTFB | FCP | LCP | CLS initial observé | Transfert observé |
|---|---|---:|---:|---:|---:|---:|
| `/` | ignoré | 185,9 | 344 | 808 | 0,15343 | 488 834 octets |
| `/` | actif | 244,2 | 380 | 628 | 0,13141 | 3 192 octets |
| `/exemples` | ignoré | 181,2 | 416 | 844 | 0,13168 | 1 776 033 octets |
| `/exemples` | actif | 182,8 | 264 | 624 | 0,13141 | 613 octets |
| `/forfaits/vitrine` | ignoré | 439,2 | 628 | 936 | 0,06743 | 3 011 198 octets |
| `/forfaits/vitrine` | actif | 177,3 | 264 | 608 | 0,06716 | 3 192 octets |

L’élément LCP de l’accueil est le titre `#home-title`. Celui de la galerie est Lactel à froid et DOMTEKNIKA avec cache. Celui du forfait est le fond de `.selected-plan`. Le LCP enregistré sur le forfait cite la source légère `grain-plasma-card.webp` ; le master DPR 2 termine ensuite à 1 118,8 ms. Le LCP de 936 ms ne doit donc pas être présenté comme l’heure de fin du chargement du master.

## Corrections prioritaires proposées

### P2 — Stabiliser la place du pied de page pendant le chargement

**Preuve.** Avec cache, le seul shift de l’accueil vaut 0,131406 à 602,2 ms et sa source est `footer.site-footer`. La galerie reproduit exactement cette valeur à 530,7 ms. Le forfait présente 0,067157 à 526,8 ms. À froid, un petit déplacement du menu est aussi observé dans la fenêtre d’arrivée de Geist ; celui de la galerie vaut 0,000276.

**Cause dans le code.** `src/components/layout/PublicLayout.tsx:214` remplace un petit message `Chargement…` par le contenu de la route et laisse le footer rendu dès le départ à la ligne 227. `src/styles.css:271` réserve seulement `60vh` au main : le pied de page apparaît dans le viewport avant d’être repoussé hors écran par la page complète. La police utilise déjà `font-display: swap` ; elle n’explique pas le shift qui subsiste avec le cache.

**Correction ciblée.** Réserver au main/état d’attente une hauteur couvrant la partie visible de la page, afin que le footer soit initialement sous le viewport. Garder la géométrie finale, les cartes et les images. Puis vérifier le démarrage avec cache et sans cache sur les trois routes, ainsi qu’une page courte sur mobile. Ne pas masquer ou retarder le contenu prêt pour obtenir artificiellement un bon résultat.

Le shift mesuré quantifie le problème actuel. Le CLS après correction doit être mesuré ; aucun résultat corrigé n’est inventé ici.

### P2 — Sortir le formulaire du chargement de l’accueil et de la galerie

**Preuve.** Sans interaction sur l’accueil, le navigateur récupère `ProjectBriefForm-D1LurAhs.js` : **43 205 octets décodés, 15 533 octets compressés**, et `ProjectBriefForm-DV4MnLR3.css` : **16 796 / 4 214 octets**. Le module public unique contient aussi contact, les prestations existantes et les autres pages. Il importe statiquement le formulaire et `SelectedPlanCard` (`src/pages/public/index.tsx:20`, `:22`). L’accueil et la galerie chargent chacun 480 939 octets de JS décodé dans les ressources observées.

**Correction ciblée.** Isoler le formulaire ou les pages de contact/prestation dans une importation à la demande, sans laisser leur CSS dans la dépendance de l’accueil. Le chunk actuel partage aussi d’autres éléments, dont la grande carte : ses 60 001 octets JS + CSS décodés sont un coût observé, **pas une économie intégrale garantie**. Vérifier le graphe et le réseau après build pour donner le gain réel. Aucun gain en millisecondes n’a été mesuré pour cette proposition.

**Limite à préserver.** Les pages privées sont déjà chargées à la demande par `src/App.tsx:11`. Aucun chunk de pages auth, portail, collaboration ou commandes n’a été demandé dans ces visites anonymes, ni `/api/projects`. `PortalLayout` et les providers d’auth/projet restent dans l’entrée (`src/App.tsx:3`, `:45`). `AuthProvider` déclenche bien `/api/auth/me` sur les pages publiques (`src/lib/auth.tsx:15`) : 13 octets de corps et 174,8 ms sur l’accueil froid. Ce GET n’a pas bloqué l’accueil. Réorganiser les providers peut retirer cet appel, mais exige de préserver le configurateur qui utilise les deux contextes ; ce n’est pas la première correction à faire pour cette galerie.

### P2 — Découvrir les images du premier rang sans lazy loading

**Preuve.** Toutes les images de la galerie sont `loading="lazy"` (`src/pages/public/index.tsx:631`). Sur la production, le premier rang est dans le viewport, à y = 438,16 px. Lactel n’est demandé qu’à 665,2 ms, finit à 802,7 ms et devient LCP à 844 ms. Ses dimensions intrinsèques et le ratio CSS réservent déjà la place ; aucun shift d’image n’a été observé pendant le scroll testé.

**Correction ciblée.** Mettre les images du premier rang en `eager` et conserver `lazy` pour les suivantes ; une priorité élevée peut être réservée à une seule candidate principale après mesure. Le premier rang change selon la largeur et le filtre : conserver le traitement simple et mesurer le résultat de la galerie compacte avant de généraliser. Garder les mêmes fichiers, ratios, couleurs et badges. Le décalage de découverte de 665,2 ms n’est pas un gain de 665,2 ms promis : l’exécution des modules et leur CSS doivent de toute façon aboutir avant la création du DOM.

## CDN, cache, images et grain

| Élément observé | Résultat vérifié | Conclusion |
|---|---|---|
| Document HTML | HTTP/3, zstd, `public, max-age=0`, Cloudflare DYNAMIC | L’HTML est revalidable ; conserver le renouvellement du document à chaque version. |
| JS/CSS | HTTP/3, zstd, `public, max-age=14400`, HIT et EXPIRED selon le fichier | Compression et cache fonctionnent déjà. Ajouter gzip/Brotli sans preuve d’absence ne traite pas les coûts constatés. |
| Police Geist Latin | 29 400 octets, une seule police téléchargée, `swap`, terminée à 753,4 ms sur l’accueil froid | Les autres sous-ensembles exportés ne sont pas téléchargés dans ces pages. Un preload de la seule police utilisée est une piste de second rang ; gain non mesuré. |
| Textures WebP | Même cache de quatre heures, pas de recompression HTTP | Le format est déjà compressé. Ne modifier aucun export approuvé. |
| API auth/catalogue | `no-store`, DYNAMIC | Préserver ces protections ; ne pas appliquer un cache public global à `/api`. |
| `/favicon.ico` | HTTP 200 mais `text/html`, corps décodé de 774 octets | Le fallback SPA renvoie l’HTML pour l’icône manquante. Ajouter un vrai favicon ou une route 404 ciblée est une petite correction, de priorité inférieure aux trois précédentes. |

Une durée de cache plus longue est possible pour les JS/CSS dont le nom contient un hash, par exemple via `server/app.mjs:51`. L’état actuel économise déjà le transfert lors du rechargement immédiat. Un bénéfice sur des revisites après quatre heures n’a pas été mesuré. Les textures ont des noms stables : ne pas leur ajouter `immutable` sans stratégie de version d’URL. L’origine annonce une heure dans le code alors que les réponses publiques observées annoncent quatre heures ; la politique publique mesurée prime pour ce rapport.

La galerie froide charge six aperçus à cause de la marge native de lazy loading. Les trois derniers restent différés avant scroll ; un `naturalWidth` nul dans cet état n’est pas une image cassée. Après un scroll de 0 à 720 px, les neuf images sont chargées. Les corps téléchargés comprennent notamment Lactel (233 002 octets) et GeoBoss (709 578 octets). Les scènes et sites externes liés ne sont pas chargés automatiquement. Le fichier le plus lourd n’implique donc pas l’exécution d’une scène 3D dans la galerie.

Le master approuvé de la grande carte pèse **2 636 656 octets** et est effectivement choisi à DPR 2 ; son coût explique la majeure partie des 3,01 Mo du forfait froid. Le remplacer ou le réexporter contredirait la direction validée. Aucun changement n’est proposé sur les trois textures protégées ; leurs SHA-256 sont dans le JSON.

Le fond `AmbientGrain` utilise un canvas 2D, une tuile de 128 px et un rendu à DPR 1 (`src/components/layout/AmbientGrain.tsx:45`). Son instrumentation de peinture donne 0 à 0,1 ms selon l’échantillon, sans nouvelle mesure pendant le scroll. Cette durée n’inclut pas la génération préalable de la tuile ni le travail GPU de composition. Le mouvement des petites cartes reste la courte animation CSS d’entrée déjà approuvée (`src/styles.css:358`) ; aucune boucle d’animation ou dépendance WebGL n’est ajoutée par cette galerie. Le test de scroll ne détecte ni nouveau shift ni tâche longue ; il ne mesure pas les FPS.

## Vérification à intégrer après correction

Le parent peut corriger les trois points ciblés, puis mesurer le build réellement servi et, après publication, la production. Conserver les textures octet pour octet ; vérifier le premier rang, les filtres et le retour en arrière ; refaire un démarrage froid/avec cache sur les trois routes avec la même taille de viewport. Le réseau doit montrer les formulaires absents de l’accueil et de la galerie si leur séparation a été faite. Les pages contact et brief doivent toujours charger le formulaire et conserver leurs données.

Preuves : [performance-evidence.json](./performance-evidence.json). Les six buffers CDP ont été lus sans troncature. La console à la fin du contrôle ne contient ni erreur ni avertissement. Aucun e-mail ni formulaire n’a été envoyé.
