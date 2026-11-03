# Effet des cartes ElevenLabs — inspection technique

Relevé du 2 novembre 2026 (heure locale), destiné à comprendre la fabrication de l’effet sans changer la matière STUDIO déjà approuvée.

## Périmètre et limites

- Source primaire demandée : [ElevenLabs Pricing](https://elevenlabs.io/pricing).
- Premier relevé DOM/CSS et pointeur fait sur la carte **Free** de [ElevenAgents Pricing](https://elevenlabs.io/pricing/agents), dans l’onglet alors ouvert. Les mesures détaillées de ce relevé sont conservées ci-dessous ; un contrôle complémentaire a ensuite été effectué par le parent sur la page principale **`/pricing`**, dans le navigateur intégré.
- Le navigateur avait une fenêtre de 1 728 × 1 084 pixels CSS, à DPR 2. Aucun changement de viewport, formulaire, compte ou facturation.
- L’utilisateur ayant ensuite demandé exclusivement le navigateur intégré, **toute interaction Chrome a été arrêtée immédiatement**. Aucun onglet utilisateur n’a été fermé ou modifié ensuite. Le contrôle complémentaire du parent respecte cette contrainte ; sa portée et ses preuves sont distinguées plus bas.
- Les mesures déjà disponibles couvrent le transfert **Free → Starter** et la **sortie de Starter hors de la grille**, aux cibles 0 / 100 / 300 / 800 ms. L’entrée et la sortie de Free comme séquence autonome n’ont pas été remesurées après cette nouvelle consigne.
- Aucun asset ElevenLabs copié dans le produit ou enregistré dans `public/`. Les vérifications de format ont lu les réponses HTTP en mémoire seulement. Aucun code produit modifié.

## Résultat principal

La couleur est une **image fixe révélée par un fondu d’opacité**. Le grain est une seconde image, répétée et superposée au-dessus. Le caractère vivant vient surtout de cette révélation et du changement de couleur des textes, pas d’un dégradé qui se déforme ou suit le pointeur.

Le dernier forfait survolé reste coloré quand le pointeur quitte la grille. Un autre forfait survolé prend sa place ; l’ancien s’efface pendant que le nouveau apparaît. Ce comportement est observé dans le DOM et les styles calculés. L’implémentation interne de l’état React n’a pas été extraite.

## Construction réelle de la carte Free

La zone colorée mesurait 262 × 200 pixels CSS, avec un rayon de 16 pixels et `overflow: hidden`. De bas en haut :

| Couche | Valeurs constatées | Fonction |
| --- | --- | --- |
| Fond neutre | `position: absolute; inset: 0; background: rgb(245, 243, 241)` | Reste sous la couleur. |
| Révélation de l’image | Conteneur absolu, opacité 0 ou 1, `transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)` | Seule cette couche colorée s’efface. |
| Image Free | `<img>`, `object-fit: cover`, `object-position: 50% 50%`, largeur/hauteur 100 % | Image cadrée au centre ; aucune transformation constatée. |
| Grain | Image répétée, `mix-blend-mode: overlay`, `image-rendering: pixelated`, opacité 1 | Ajoute une matière indépendante, toujours présente. |
| Contenu | `position: relative; z-index: 10`, remplissage de 20 pixels | Titre et prix au-dessus de la matière. |
| Contour | Couche absolue, `pointer-events: none; z-index: 30`, fin anneau intérieur noir à faible opacité | Garde un bord propre. |

Le bouton noir et les fonctionnalités sont **sous cette zone**, hors de sa pile d’images. Le titre et le prix passent du noir au blanc avec une transition de couleurs de **150 ms**, même courbe `cubic-bezier(0.4, 0, 0.2, 1)`. Aucun délai supplémentaire constaté dans les effets de transition.

Les relevés ne montrent ni zoom, ni déplacement d’image, ni déplacement d’`object-position`, ni flou animé : `transform: none`, `filter: none`, `object-position: 50% 50%` restent identiques. `getAnimations()` retourne des `CSSTransition` pendant le fondu et aucune animation après stabilisation. Aucun canvas ou WebGL dans cette carte.

## Images et grain : URLs, dimensions et formats

Réponses primaires vérifiées par HTTP, avec dimensions lues dans les en-têtes des fichiers :

| Ressource | Dimensions réelles | Type de réponse | Taille du corps |
| --- | --- | --- | --- |
| [Source Free](https://eleven-public-cdn.elevenlabs.io/marketing_website/_next/static/media/Free.489beebc.png) | 786 × 600 | PNG | 121 350 octets |
| [Image Free optimisée par Next](https://elevenlabs.io/_next/image?url=https%3A%2F%2Feleven-public-cdn.elevenlabs.io%2Fmarketing_website%2F_next%2Fstatic%2Fmedia%2FFree.489beebc.png&w=3840&q=90) | 786 × 600 | WebP, chunk `VP8 ` | 14 214 octets |
| [Grain privilégié](https://eleven-public-cdn.elevenlabs.io/marketing_website/_next/static/media/noise@20aq.289c1f1d.avif) | 256 × 256 | AVIF | 10 462 octets |
| [Grain de repli](https://eleven-public-cdn.elevenlabs.io/marketing_website/_next/static/media/noise.24b8225d.png) | 256 × 256 | PNG | 101 338 octets |

Le HTML propose `srcset` avec les largeurs 640, 750, 828, 1080, 1200, 1920, 2048 et 3840, et `sizes="100vw"`. La réponse active était celle avec `w=3840&q=90`. Ce paramètre ne signifie pas que le fichier fourni fait 3 840 pixels : les octets reçus décrivent bien **786 × 600**. La réponse WebP annonce `Vary: Accept` et un cache public de 31 536 000 secondes.

Le navigateur indiquait `naturalWidth: 353` et `naturalHeight: 270` pour cette image avec son descripteur de densité ; ces propriétés ne doivent pas être confondues avec les dimensions du fichier décodé. La correction liée au `srcset` explique cette différence (inférence cohérente avec le rapport 3 840 / 1 728).

Le grain utilise un `background-image: image-set(...)` : AVIF si supporté, PNG en repli. `--noise-scale` vaut 1. Le motif fait **256 pixels CSS** par défaut, et **128 pixels CSS à partir de 2 dppx** : sa source de 256 pixels est donc affichée à la densité native d’un écran DPR 2. Le grain demeure à opacité 1 pendant tout le changement de forfait ; sa position, son échelle et sa texture ne sont pas animées.

## Chronologie effectivement mesurée

Les cibles correspondent au début de l’échantillonnage juste après la commande de déplacement du pointeur. Les temps réels sont conservés ci-dessous : ils incluent les décalages du protocole et de la première frame. Ce relevé établit le mécanisme et ses états ; il ne constitue pas une mesure INP ou une comparaison de performances entre sites.

Passage de Free coloré à Starter :

| Cible | Temps réel de lecture | Opacité Free | Opacité Starter | Couleur du titre Free | Couleur du titre Starter |
| --- | --- | --- | --- | --- | --- |
| 0 ms | 2,5 ms | 1 | 0 | Blanc | Noir |
| 100 ms | 110 ms | 0,874908 | 0,125092 | `rgb(104,104,104)` | `rgb(151,151,151)` |
| 300 ms | 307,9 ms | 0,0117735 | 0,988227 | Noir | Blanc |
| 800 ms | 885,1 ms | 0 | 1 | Noir | Blanc |

Les effets CSS rapportent une durée de **300 ms** pour l’opacité, **150 ms** pour les textes, avec `delay: 0`, `iterations: 1` et la même courbe. À la lecture de 110 ms, leur `currentTime` était d’environ 58,4 ms ; à celle de 307,9 ms, environ 257,5 ms. Cela distingue bien la durée déclarée de l’horloge de collecte.

Après déplacement hors de toutes les cartes, vers le bord de la page :

| Cible | Temps réel de lecture | Opacité Free | Opacité Starter | Transitions actives |
| --- | --- | --- | --- | --- |
| 0 ms | 0,3 ms | 0 | 1 | Aucune |
| 100 ms | 126,9 ms | 0 | 1 | Aucune |
| 300 ms | 319,6 ms | 0 | 1 | Aucune |
| 800 ms | 845,2 ms | 0 | 1 | Aucune |

La sortie seule **ne réinitialise donc pas le dernier forfait** dans le composant inspecté. Le bruit reste à opacité 1, les images à `transform: none` et `object-position: 50% 50%` à chaque lecture.

## Application compatible avec STUDIO

1. Garder les couleurs, le cadrage et la matière propres à STUDIO, approuvés par l’utilisateur. La texture STUDIO contient déjà du grain : ajouter le bruit ElevenLabs par-dessus changerait cette matière et doublerait potentiellement le grain.
2. Conserver une image fixe dans la zone supérieure, un fond neutre derrière et le contenu lisible au-dessus. Le bon modèle technique est le fondu d’une couche déjà décodée, sans recalcul de dégradé à chaque mouvement du pointeur.
3. Garder les contrôles immédiatement disponibles, même si la source haute densité arrive ensuite. La petite texture légère convient aux menus, boutons et petites cartes ; le master déjà prévu reste réservé aux grandes surfaces haute densité.
4. Le fondu STUDIO de 120 ms est volontairement plus rapide que les 300 ms observées. Ne pas le ralentir ni introduire une persistance du dernier survol sans décision explicite : le rendu actuel a été validé. Respecter `prefers-reduced-motion` et les états clavier. Le code STUDIO garde également sa couche lumineuse préexistante, avec opacité 180 ms et déplacement 550 ms ; cette couche distincte ne doit pas être attribuée à ElevenLabs.
5. Pour les six offres du sous-menu, réutiliser leurs variantes de couleur dans chaque lien, avec le même type de révélation au survol ou au focus clavier. Le trigger « Forfaits » conserve son traitement de navigation. Sur tactile, un état pressé ou actif lisible suffit.
6. Éviter suivi de pointeur, `requestAnimationFrame` permanent, transformation de grande image, filtre animé, shader et flou dynamique. Rien de cela n’est nécessaire pour reproduire le mécanisme observé.

## Confirmation dans le navigateur intégré sur `/pricing`

Le parent a ouvert et inspecté la page principale [ElevenLabs Pricing](https://elevenlabs.io/pricing) dans le navigateur intégré. Ce contrôle porte bien sur **`/pricing`**, pas sur `/pricing/agents`.

Preuves locales : [capture de la carte Free](qa/card-alignment-faq-portfolio/elevenlabs-free-iab.jpg) et [chronologie IAB enregistrée](qa/card-alignment-faq-portfolio/elevenlabs-iab-timeline.json).

Les propriétés rapportées par le parent confirment la même construction : image Free fixe révélée par opacité, grain séparé superposé, texte au-dessus et bouton hors de la zone texturée. La source Free et le grain correspondent aux ressources primaires documentées dans la section « Images et grain ». Le parent a également observé que le dernier forfait survolé reste coloré à la sortie de la grille.

Il faut distinguer ces observations de la portée du fichier enregistré : le JSON contient **six échantillons d'entrée** et les propriétés calculées de la couche colorée. Il ne contient ni champ `src`, ni relevé du grain, ni séquence de sortie de grille. Il prouve directement le fondu ci-dessous ; la source, le grain et la persistance à la sortie sont des observations complémentaires du parent, pas des champs de ce JSON.

| Temps de collecte enregistré | Opacité de la couche Free | Transformation | Filtre |
| --- | --- | --- | --- |
| 4 ms | 0,00174276 | `none` | `none` |
| 97 ms | 0,465408 | `none` | `none` |
| 189 ms | 0,905929 | `none` | `none` |
| 280 ms | 0,998501 | `none` | `none` |
| 372 ms | 1 | `none` | `none` |
| 464 ms | 1 | `none` | `none` |

La transition calculée est, dans chaque échantillon, `opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)`. Ce sont les temps réels de collecte de cette séquence, pas des cibles strictes ni une mesure de latence d'interaction. Le champ final `animations: 0` décrit l'état stabilisé ; il ne signifie pas qu'aucune transition n'a eu lieu.

Cette confirmation complète l'étude de la page principale sans transformer STUDIO en copie de ses comportements. **Les quatre cartes principales STUDIO n'ont pas changé durant cette vague** : matière, cadrage et fondu de 120 ms sont conservés, ainsi que leur couche lumineuse préexistante. La persistance du dernier survol et le timing ElevenLabs de 300 ms n'ont pas été implémentés. Aucun asset ElevenLabs n'a été intégré au produit et aucune dépendance n'a été ajoutée pour cette inspection ; les captures ci-dessus restent des preuves internes.

L'alignement des deux cartes Évolution/Refonte et les autres changements du lot sont, à ce stade documentaire, intégrés localement. Cette analyse externe et ses preuves IAB ne constituent pas une validation de publication du site STUDIO en production.
