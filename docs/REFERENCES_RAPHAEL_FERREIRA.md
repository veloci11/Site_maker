# Références du portfolio de Raphaël Ferreira

Recherche initiale du 2 novembre 2026, fuseau America/Mexico_City, complétée par l'état de l'intégration locale du parent. La recherche et cette mise à jour documentaire n'ont pas modifié les sites sources.

## Résultat et périmètre

La collection `Works` du [portfolio de Raphaël Ferreira](https://raphael-ferreira.com/) contient **sept projets web**. Les quatre références absentes lors de la recherche — **GeoBoss, Atlante 3D, AEMA et Satellite Story** — sont maintenant intégrées localement dans `shared/catalog.ts`, en complément de Lactel, Tiny Heaven et Addiction Agency. Avec DOMTEKNIKA et Julie Thiam, le catalogue local contient **neuf exemples**. Cette intégration locale n'est pas encore une confirmation de publication en production.

L'inventaire a été recoupé avec le module public chargé par le portfolio, [index-C1b7cpez.js](https://raphael-ferreira.com/assets/index-C1b7cpez.js), et avec les README GitHub du même auteur. Les fiches du portfolio chargent elles-mêmes ces README. Les titres, slugs, liens `live`, `poster` et `poster_big` cités ci-dessous sont présents dans ces sources ; aucune adresse de site n'a été déduite du seul nom d'un projet.

| Titre exact dans Works | Fiche déclarée par le portfolio | État dans notre galerie |
| --- | --- | --- |
| Addiction Agency | [AddictionAgency](https://raphael-ferreira.com/work/AddictionAgency) | Déjà présent ; conserver la capture actuelle de l'agence |
| Lactel | [Lactel](https://raphael-ferreira.com/work/Lactel) | Déjà présent |
| GeoBoss | [GeoBoss](https://raphael-ferreira.com/work/GeoBoss) | Intégré localement, capture réelle du site |
| Tiny Heaven | [TinyHeaven](https://raphael-ferreira.com/work/TinyHeaven) | Déjà présent |
| Atlante 3D | [Atlante3d](https://raphael-ferreira.com/work/Atlante3d) | Intégré localement, projet archivé vers le README |
| AEMA | [aema](https://raphael-ferreira.com/work/aema) | Intégré localement sous le nom Aéma Groupe |
| Satellite Story | [SatelliteStory](https://raphael-ferreira.com/work/SatelliteStory) | Intégré localement, capture réelle du site |

**Limite du portfolio constatée :** une ouverture HTTP directe de `/works` ou de chacune des quatre fiches ajoutées renvoie `404 Not Found`. La navigation interne depuis la racine charge bien `/works` côté client. Ces URL de fiche décrivent donc la route de l'application, mais ne constituent pas aujourd'hui un lien externe fiable. Pour un crédit cliquable, utiliser la [racine du portfolio](https://raphael-ferreira.com/) ou le README primaire correspondant.

## Les quatre références ajoutées

### GeoBoss

- **Titre exact :** GeoBoss.
- **Fiche du portfolio :** [work/GeoBoss](https://raphael-ferreira.com/work/GeoBoss), ouverture directe en 404 lors de la vérification.
- **Source primaire détaillée :** [README de rqphy/GeoBoss](https://github.com/rqphy/GeoBoss#readme).
- **Site attesté et vérifié :** [geoboss.onrender.com](https://geoboss.onrender.com/), HTTP 200 sans redirection vers un autre projet. La page porte le titre `GeoBoss - Défie tes amis sur le globe`.
- **Fonctions documentées :** jeu de géographie avec globe 3D, parties multijoueurs en temps réel, classements et stockage persistant. Le README précise que les joueurs sont anonymes ; ne pas en déduire une démonstration de comptes utilisateurs.
- **Classement local :** offre **Sur mesure**, catégorie descriptive **Jeu en ligne** et tag **3D**. Ce tag permet de retrouver le globe dans le filtre 3D sans assimiler les fonctions multijoueurs et la base de données à celles du forfait Immersif 3D.
- **Crédit attesté :** le portfolio identifie Raphaël Ferreira et renvoie vers `rqphy/GeoBoss` ; le pied de page du jeu crédite Raphaël et lie `github.com/rqphy`. Crédit intégré localement : **Raphaël Ferreira**.
- **Contrôle visuel :** la page du jeu a été affichée ; après réveil du serveur, les boutons de création de partie sont actifs et le classement se charge. Aucune partie n'a été créée et aucun parcours multijoueur n'a été testé.
- **Texte de galerie intégré localement :** « Un jeu de géographie multijoueur avec globe 3D et classement. »

### Atlante 3D

- **Titre exact dans Works :** Atlante 3D ; titre du README : `Atlante3d`.
- **Fiche du portfolio :** [work/Atlante3d](https://raphael-ferreira.com/work/Atlante3d), ouverture directe en 404 lors de la vérification.
- **Source primaire détaillée :** [README de rqphy/Atlante3d](https://github.com/rqphy/Atlante3d#readme).
- **Site vivant :** aucun lien `live` dans la collection Works. Le README annonce explicitement : « The site is not live anymore ». Ne pas substituer le site institutionnel d'Atlante à cette expérience.
- **Fonctions documentées :** présentation 3D d'une borne et de sa station de recharge, points d'intérêt, déplacements de caméra et exploration du lieu. C'est bien un ancien site interactif, pas seulement une image ou un modèle 3D isolé.
- **Classement local :** **3D** ; badge **Projet archivé**.
- **Crédit attesté :** le README est publié par Raphaël Ferreira / `rqphy` et décrit une prestation freelance pour Atlante. Aucun autre crédit de conception ou de modélisation n'est explicitement fourni dans cette fiche. Crédit intégré localement : **Raphaël Ferreira — projet Atlante**.
- **Destination intégrée localement :** [README Atlante3d](https://github.com/rqphy/Atlante3d#readme), avec `archived: true`, badge **Projet archivé** et action de présentation. Le crédit mène à la racine du portfolio. Le visiteur n'est pas envoyé vers une route 404 ni vers un site vivant de substitution.
- **Texte de galerie intégré localement :** « Une présentation interactive de station de recharge en 3D. » Le statut archivé est affiché séparément.

### AEMA

- **Titre exact dans Works :** AEMA. Le site officiel utilise la marque Aéma Groupe.
- **Fiche du portfolio :** [work/aema](https://raphael-ferreira.com/work/aema), ouverture directe en 404 lors de la vérification.
- **Source primaire détaillée :** [README de rqphy/aema](https://github.com/rqphy/aema#readme).
- **Site attesté et vérifié :** [aemagroupe.fr](https://aemagroupe.fr/) redirige vers [www.aemagroupe.fr](https://www.aemagroupe.fr/), HTTP 200. Le titre est `Accueil - Aéma Groupe` ; le site affiche bien les contenus du groupe mutualiste.
- **Fonctions documentées dans le cas :** amélioration des performances et du header, animations de défilement, intégration de publications sociales. Le site actuel comporte une navigation institutionnelle et des actualités ; ses ressources publiques identifient WordPress.
- **Classement local :** **Vitrine**, avec tag secondaire **Contenus**, sous le titre Aéma Groupe. La fiche ne démontre pas de comptes utilisateurs ; ne pas utiliser cette référence pour promettre cette fonction.
- **Crédit attesté :** la rubrique Experiences du portfolio attribue AEMA à **Raphaël Ferreira, chez Wonderstudios, 2022**. Crédit intégré localement : **Raphaël Ferreira · Wonderstudios**. Ne pas présenter Raphaël comme l'unique auteur de tout le site actuel ni supposer que celui-ci n'a pas évolué depuis cette mission.
- **Texte de galerie intégré localement :** « Un site institutionnel avec actualités et contenus éditoriaux. »

### Satellite Story

- **Titre exact dans Works :** Satellite Story ; le README et le grand titre du site emploient **A Satellite Story**.
- **Fiche du portfolio :** [work/SatelliteStory](https://raphael-ferreira.com/work/SatelliteStory), ouverture directe en 404 lors de la vérification.
- **Source primaire détaillée :** [README de rqphy/SatelliteStory](https://github.com/rqphy/SatelliteStory#readme).
- **Site actuel attesté et vérifié :** [satellite.raphael-ferreira.com](https://satellite.raphael-ferreira.com/), lien `Live` du README, HTTP 200 sans redirection vers un autre projet. Le titre est `Satellite Story - Raphaël Ferreira`.
- **Autre adresse réellement déclarée :** [satellite-story.netlify.app](https://satellite-story.netlify.app/) figure encore dans le module du portfolio et répond en 200 avec le même titre et le même bundle que le sous-domaine. Préférer le lien actuel du README.
- **Fonctions documentées :** narration autour de Spoutnik, Terre et satellite en 3D, rotation et textes synchronisés au défilement. L'expérience 3D a été ouverte et son rendu observé dans le navigateur.
- **Classement local :** **3D**, expérience narrative personnelle ; ce n'est pas une preuve de réalisation d'un site client pour notre studio.
- **Crédit attesté :** Raphaël Ferreira / `rqphy`. Le README renvoie séparément aux licences du modèle du satellite et de la Terre ; le crédit du développeur ne remplace pas les crédits des auteurs des modèles si l'on réutilise ces fichiers.
- **Texte de galerie intégré localement :** « Une histoire de Spoutnik, animée en 3D au défilement. »

## Images originales disponibles

Les quatre URL `poster_big` ci-dessous proviennent exactement du module du portfolio. Elles répondent toutes en HTTP 200, type `image/jpeg`, sans redirection. Dimensions lues dans les fichiers : **1600 × 1000 px**. Ce sont les exports publiés par l'auteur ; cette mesure ne prouve pas une résolution native supérieure de leur contenu.

| Projet | URL exacte de l'affiche du portfolio | Taille du fichier |
| --- | --- | ---: |
| GeoBoss | [geoboss-big.jpg](https://raphael-ferreira.com/posters/geoboss-big.jpg) | 301 753 octets |
| Atlante 3D | [atlante-big.jpg](https://raphael-ferreira.com/posters/atlante-big.jpg) | 67 413 octets |
| AEMA | [aema-big.jpg](https://raphael-ferreira.com/posters/aema-big.jpg) | 47 596 octets |
| Satellite Story | [satellite-big.jpg](https://raphael-ferreira.com/posters/satellite-big.jpg) | 28 034 octets |

Des captures supplémentaires sont présentes dans les README. Les adresses ci-dessous ont aussi été récupérées et leurs en-têtes d'image vérifiés, sans export dans `public/`.

| Projet / vue | URL exacte de la capture du README | Format et dimensions |
| --- | --- | --- |
| GeoBoss | [Capture GeoBoss](https://juq1maqrjs.ufs.sh/f/r1m4dnkvsK4QIzhGlmZXrY8jfHmARMvkSpL0NyuF9IcUTgeQ) | PNG, 1099 × 822 |
| Atlante, vue principale | [Vue principale Atlante](https://juq1maqrjs.ufs.sh/f/r1m4dnkvsK4QSgoePhD79W0CsnlGaMLmPio2exXKZOBt3Yvd) | PNG, 1242 × 815 |
| Atlante, borne | [Borne Atlante](https://juq1maqrjs.ufs.sh/f/r1m4dnkvsK4QvooD4v9aRhwlC4uoHjK93vmM5SJgZiGsacXQ) | PNG, 1242 × 815 |
| Satellite Story | [Capture Satellite Story](https://juq1maqrjs.ufs.sh/f/r1m4dnkvsK4QopvBOHkJYt0MjvGVNx71POTzu2f9aDki6FEs) | PNG, 1242 × 815 |

Le README AEMA ne contient pas de capture supplémentaire. Les petits posters déclarés sont les mêmes noms sans suffixe `-big` : `geoboss.jpg`, `atlante.jpg`, `aema.jpg` et `satellite.jpg`. L'export le plus grand explicitement proposé par le portfolio est celui du tableau ci-dessus.

## Sources conservées et images actives dans le lot local

Les quatre affiches du portfolio sont conservées dans `docs/asset-sources/examples/raphael/` : `geoboss.jpg`, `aema.jpg`, `satellite.webp` et `atlante.webp`, toutes à 1600 × 1000. Les formats réellement reçus lors du téléchargement du parent sont JPEG pour les deux premières et WebP pour les deux dernières ; l'extension `.jpg` de l'URL n'impose pas le format du corps reçu. Les contrôles HTTP historiques ci-dessus décrivent les réponses obtenues pendant la recherche initiale.

Pour GeoBoss, Aéma et Satellite, les exports actifs viennent de **nouvelles captures réelles du navigateur intégré**, pas des affiches archivées du portfolio. Les PNG sources de 2560 × 1440 sont conservés dans `docs/qa/card-alignment-faq-portfolio/source-{geoboss,aema,satellite}-retina.png`. Leur réduction à 1600 × 900 puis leur encodage WebP qualité 94 ne recadrent pas le contenu. Les exports actifs sont `public/assets/examples/geoboss.webp`, `aema.webp` et `satellite.webp`.

Atlante utilise `public/assets/examples/atlante.webp`, **1600 × 1000, 53 866 octets**, copie identique de l'original conservé. Source et export partagent le SHA-256 `0d1278a665a497958199d9eaf02c26ad97ba5a685133ef5bbb6502e2b69001ef`. Aucune nouvelle capture du site hors ligne n'est revendiquée.

La provenance complète des quatre exports, avec tailles et empreintes, est enregistrée dans [portfolio-assets.json](qa/card-alignment-faq-portfolio/portfolio-assets.json) et résumée dans [ASSETS_REFERENCES.md](ASSETS_REFERENCES.md). Les neuf exemples restent des images statiques avec liens externes déclenchés par le visiteur, sans iframe chargée automatiquement. Les anciens chemins internes `/exemples/:slug` redirigent aussi vers la destination externe correspondante ; aucune fiche d'aperçu intermédiaire n'est nécessaire.

## Références existantes et exclusions

- **Lactel** : déjà présent ; le [README](https://github.com/rqphy/Lactel#readme) décrit une réalisation avec Wonderstudios et un thème WordPress. Garder un crédit qui reflète cette collaboration.
- **Tiny Heaven** : déjà présent ; l'adresse actuelle du [README](https://github.com/rqphy/TinyHeaven#readme), désormais utilisée dans le catalogue local, est [tiny.raphael-ferreira.com](https://tiny.raphael-ferreira.com/). L'ancienne adresse Netlify, utilisée auparavant, répond également en 200 avec le même titre et le même bundle. C'est une démonstration web 3D personnelle ; les licences des modèles restent distinctes.
- **Addiction Agency** : déjà présent avec une nouvelle capture du vrai site de l'agence. Ne pas réintroduire automatiquement l'ancien poster du portfolio, qui montre un visuel de jeu pixel art plutôt qu'une présentation nette de l'agence. Le lien historique `www.addiction-agency.com/fr/` aboutit aujourd'hui à [addiction-agency.com](https://addiction-agency.com/), bien le site de l'agence.
- **Harmonie Mutuelle** : uniquement mentionné dans la liste Experiences du portfolio, avec Wonderstudios en 2021. Aucune fiche Works ni destination de projet n'a été trouvée dans la collection publiée ; aucun ajout de galerie ne peut être sourcé à partir de cette seule mention.
- Aucun projet autonome de shader ou de simple modèle 3D n'apparaît dans cette collection de sept Works. Les projets 3D listés sont des expériences web ; leur statut personnel, commercial ou archivé doit rester visible.

Ces références servent à illustrer des styles et des usages. Elles ne sont pas des réalisations de notre studio et n'attestent ni d'une relation client, ni d'un prix, ni de l'inclusion de toutes leurs fonctions dans un forfait de création.
