# Revue SEO technique — 3 novembre 2026

Statut : fondations corrigées dans le code local ; publication et indexation non constatées. Les contrôles en ligne ci-dessous portent sur la version en production observée avant ces modifications. Aucun formulaire, compte, message ou e-mail n’a été créé pour cet audit.

## Constat en production

Inspection en lecture seule de `https://gilmathis.com/` et de réponses réseau dans le navigateur intégré, le 3 novembre 2026 vers 22 h 23 UTC.

| Point | Preuve observée | Conséquence |
| --- | --- | --- |
| HTML initial des fiches | `/forfaits/vitrine` répond 200 avec le titre générique `studio — création de sites internet`, une description commune et `<div id="root"></div>` vide | Les contenus et le titre spécifique dépendent du rendu JavaScript. |
| Texte annulé | La description initiale contient encore « Sans compte à créer » | Le texte rejeté peut apparaître dans un extrait de moteur ou un partage. |
| Métadonnées | Aucun canonical ni Open Graph dans le HTML initial ou le DOM de l’accueil contrôlé | Les URL préférées et les aperçus de partage ne sont pas explicités. |
| Robots | `/robots.txt` répond 200 en `text/html` et affiche la page introuvable | Ce n’est pas un fichier robots exploitable. |
| Sitemap | `/sitemap.xml` répond 200 en `text/html` et affiche la page introuvable | Aucun sitemap XML valide n’a été constaté. |
| Erreurs | `/seo-route-inexistante` répond 200 en `text/html` | L’écran d’erreur produit une soft 404. |
| Accès hors recherche | `/connexion` répond 200 sans `X-Robots-Tag` ni meta robots | Le shell de connexion n’est pas explicitement exclu de l’index. Aucune donnée privée n’a été lue. |
| Réponses FAQ | Sur `/faq`, après chargement, les dix panneaux fermés sont présents mais leur `textContent` est vide. La première réponse n’apparaît nulle part dans le DOM avant un clic. | Les questions existent dans le rendu ; les réponses dépendent d’une interaction que Google Search ne déclenche pas. |

L’existence d’un domaine accessible et de liens HTML dans le rendu est confirmée. La présence dans l’index Google, les requêtes, impressions, clics, positions, conversions ou Core Web Vitals terrain n’ont pas été mesurés. Aucune configuration Search Console n’a été supposée.

## Corrections locales

- Un seul contrat `shared/seo.ts` fournit titres, descriptions, URL canoniques, règles d’indexation et statut des routes. L’origine canonique est le domaine public vérifié `https://gilmathis.com`, jamais un en-tête Host fourni par le visiteur.
- Le serveur Express peut injecter dans le HTML initial le titre et la description propres à chaque page, une seule URL canonique, les métadonnées Open Graph et Twitter. Le module échappe le texte et les attributs ; il préserve les scripts, styles et préchargements du build.
- Les quatre créations, l’accueil, les forfaits, les options, la galerie, la FAQ, le contact et les deux services ont des métadonnées distinctes. Les titres suivent ceux déjà affichés par les pages, pour éviter des changements contradictoires après chargement du JavaScript.
- `?besoin=evolution` et `?besoin=refonte` sont conservés dans leurs canoniques car ils changent la fiche et le formulaire. Les filtres de galerie, paramètres de suivi et choix d’options sont retirés des URL canoniques.
- Les URL d’édition contenant `projet` ou `projectId` sont `noindex, nofollow` et ne publient aucun identifiant dans une URL canonique ou une description. Les espaces privés, l’authentification, les commandes, le configurateur historique et les pages légales encore incomplètes sont aussi exclus de la recherche par meta et en-tête HTTP.
- Un composant React met à jour les mêmes métadonnées lors de la navigation SPA, y compris le retour d’une page privée vers une page publique. Il élimine les doublons des balises qu’il gère.
- Le sitemap XML dynamique contient 12 URL canoniques publiques, dont les deux services. Il exclut les filtres, accès privés, pages légales incomplètes, erreurs, alias et redirections externes. Aucun `lastmod`, prix, avis, client ou score n’est inventé.
- Le fichier robots dynamique autorise les ressources publiques, bloque `/api/` et autorise `/api/catalogue`, que le rendu des pages peut lire. Les shells HTML `noindex` restent explorables pour que Google puisse lire la directive. Les contrôles d’accès existants restent responsables de la confidentialité.
- Le middleware API ajoute aussi `X-Robots-Tag: noindex, nofollow`, sans changer les rôles ni les réponses protégées. `/index.html` redirige vers l’accueil avant le service des fichiers statiques.
- Les routes inexistantes répondent 404 avec `noindex`. Les ressources manquantes, notamment les fichiers d’assets, répondent 404 en texte, sans recevoir une page HTML 200.
- Seuls les alias existants redirigent définitivement : anciennes formules vers les forfaits correspondants, `/methode` vers l’ancre de l’accueil et anciens détails d’exemples vers les liens fixes du catalogue. Un slug inconnu reste une 404. Les paramètres des anciennes URL de forfait sont préservés pour ne pas casser une reprise de configuration.

Le template `index.html` ne contient plus le texte annulé. Il garde des métadonnées d’accueil utiles pour le développement et le prototype statique ; le canonical spécifique est fourni par Express ou par la navigation React.

## Vérification

`node --test tests/seo.test.mjs` : 10 tests passent. Une fixture Express isolée et un test du vrai `createApp()` avec `DATA_DIR` temporaire vérifient les réponses HTML, les types MIME robots/sitemap, les 301, les 404, les headers noindex et l’absence de paramètres sensibles dans les têtes de page. Le test réel parcourt les 12 URL publiques, les shells exclus et les ressources absentes ; il confirme aussi que `/api/catalogue` reste accessible et que `/api/projects` reste protégé par une réponse 401. Les autres cas couvrent l’échappement HTML, les canoniques, les requêtes de services, les filtres, la conservation des ressources du build et les 12 entrées du sitemap. Les données temporaires ont été supprimées après test.

`npm run typecheck` passe après ajout des modules. Le parent a monté les handlers dans `server/app.mjs` et le composant dans le routeur de `src/App.tsx` ; le test réel valide ce montage serveur. Le contrôle SPA final dans le navigateur et le build complet restent coordonnés par le parent ; cette note ne transforme pas ces contrôles en vérification de production. L’IAB était disponible pour l’audit public initial, puis n’était plus exposé dans le contexte du sous-agent au moment de son contrôle local ; Chrome n’a pas été utilisé.

## Limites et suite utile

Le corps principal reste rendu côté client. Ajouter le head côté serveur corrige la distribution des métadonnées ; cela ne pré-rend pas les titres H1, textes, liens et formulaires dans le corps HTML initial. Google sait rendre JavaScript mais peut différer ce travail, et les autres robots ne l’exécutent pas tous. Google recommande encore le rendu serveur ou le pré-rendu. Une éventuelle étape suivante devrait rendre les vrais composants publics ou leur contenu partagé, sans fabriquer de texte spécifique aux robots. Cette refonte d’architecture n’a pas été ajoutée au présent lot.

Le parent a ajouté le maintien des vraies réponses FAQ dans le DOM avec `forceMount`, accompagné de règles CSS qui masquent les panneaux fermés et conservent l’accordéon. Le contrôle local du rendu et de l’interaction reste à confirmer par le parent. Un balisage FAQ injecté seul ne remplace pas la disponibilité du contenu visible par l’utilisateur.

Le worker statique Sites est conservé : il ne fournit pas ces handlers Express et ne peut pas, à lui seul, attribuer les mêmes statuts HTTP et métadonnées initiales à chaque route. La cible de ces fondations est l’instance Node/Express Ubuntu.

Après déploiement, vérifier sur le domaine public les réponses de chaque famille de routes, robots/sitemap et navigation SPA, y compris les éventuelles copies en cache Cloudflare. Si une propriété Search Console existe ou est créée par le propriétaire, l’inspection d’URL et les rapports d’indexation pourront confirmer la perception par Google ; aucune création de propriété ni soumission automatique n’a été effectuée. Les métadonnées, le sitemap et l’accessibilité technique ne garantissent ni indexation ni classement.

Les mentions légales restant incomplètes doivent être renseignées avec les informations réelles avant une ouverture commerciale complète. Elles ne sont pas inventées pour alimenter des données structurées. Aucun balisage LocalBusiness, prix, étoiles ou réalisation du studio n’a été ajouté.

## Sources primaires consultées dans le navigateur intégré

- [Google Search Central — JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) : rendu JavaScript, métadonnées uniques, canonical dans le HTML, statuts HTTP, soft 404 et recommandation SSR/pré-rendu.
- [Google Search Central — Créer un sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) : URL absolues, canoniques et entrées destinées à la recherche.
- [Google Search Central — Bloquer l’indexation avec noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing) : meta et `X-Robots-Tag`, nécessité de laisser explorer l’URL pour lire la directive.
- [Google Search Central — Contenu chargé après interaction](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading) : Google Search ne clique pas et ne fait pas défiler la page pour charger son contenu.
- [MDN — Attribut rel, canonical](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel#canonical) : URL préférée du document et réduction des doublons.

## Contrôle parent après intégration

`RouteMetadata` est monté dans le routeur de données, qui conserve les mêmes routes et permet le garde du brief. Dans l’IAB local : Confidentialité a son titre propre, noindex, sans canonical ; FAQ a son titre et son canonical. Les dix réponses FAQ sont désormais dans le DOM avant clic, fermées avec hauteur zéro et visibility:hidden. Le contrôle serveur réel et le contrôle complet sont verts : 202 tests. La réponse initiale reste un shell React pour le corps ; aucune indexation, position ou métrique Search Console n’est inventée.


## État après publication — parent

Application `099c1a1` publiée puis vérifiée dans l’IAB public. Les contrôles, mesures après correction et limites encore ouvertes sont consolidés dans [final-review.md](final-review.md). Les observations initiales ci-dessus sont conservées comme historique, sans les confondre avec l’état corrigé.
