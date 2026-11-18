# Déploiement de pixelito — gilmathis.com

Dernière livraison applicative publiée et contrôlée le 17 novembre 2026 sur ordinateur et mobile dans le navigateur intégré.

## Version active — filtres de galerie par usage

- Révision applicative `e22c955f3b6b194a924ebee1e1f2f158b1131764`
- Release `/home/mathis/site-maker/releases/20261118T000457Z-e22c955f3b6b`
- Client `/assets/index-t-BYykcW.js`, SHA-256 `1ffb3863ec39718c188eb1f29030c1c89559fd003e4d2e260969ece19bb0f24b`
- Archive : 27 938 840 octets, SHA-256 `1119f636632dcb1b9a3b310fb2342ae6446de10bb09f606cd4fda05c0de3bdca`

GeoBoss et DOMTEKNIKA classés en Business. Satellite Story et Tiny Heaven classés en Vitrine selon leur format d’une page. Un lien sous les filtres ouvre le comparatif des inclusions. En HTTPS, quatre références Business, deux Vitrine, trois Premium / 3D et neuf au total. Lien GeoBoss confirmé, aucune alerte console. 317 tests passent. Voir `docs/qa/gallery-categories-2026-11-17/design-qa.md`.

Sauvegarde et préflight SSR des trois filtres avant bascule. L’empreinte du catalogue hors identifiants de référence `exampleId` est identique. Service et tunnel actifs, aperçu local arrêté.

## Version précédente — carte choisie centrée au retour mobile

- Révision applicative `d41b9df63dfd8247d1046892d2cfaf761a0b3d9c`
- Release `/home/mathis/site-maker/releases/20261117T220025Z-d41b9df63dfd`
- Client `/assets/index-DbvE-oBD.js`, SHA-256 `34bca7b5143765c3b5552ad7b3379e469d68b6c6b7f67f142d1bb0c5ae04e5e1`
- Archive : 27 940 144 octets, SHA-256 `e0326fbf1e39fe5fb1ecb1e708bed251eba63fb26b4caf1af6168a09bc05b948`

En HTTPS à 430 × 932 px, les cartes Vitrine et Business se centrent à moins de 0,2 px près dans l’espace sous le header après Retour navigateur et Tous les forfaits. Déplacement de 16 px sur 560 ms, opacité à 1 et défilement stable. En aperçu à 320 × 568 px, titre à 12 px sous le header et mouvement réduit appliqué. Raccord bureau à 560 ms vérifié. 316 tests passent.

Sauvegarde, préflight SSR et bascule vérifiés, catalogue identique par SHA-256. Service et tunnel actifs. Aperçu local fermé.

## Version précédente — retour mobile sans variation d’opacité

- Révision applicative `5c77fc9da692f51b41daab5ddd704698fd0128ce`
- Release `/home/mathis/site-maker/releases/20261117T215514Z-5c77fc9da692`
- Client `/assets/index-BPZhiqhE.js`, SHA-256 `16e6391e03063f8b932e8d2b20198a2d87661de69b0988c6b4ce1cc6e5b9d65f`
- Archive : 27 938 934 octets, SHA-256 `39795fca01053b52ee2fb84e915991973807e46a115afb29da6bb5a0d6bf77cc`

Retour mobile à 560 ms avec glissement progressif de 14 px et opacité constante. En HTTPS à 430 px, le retour navigateur depuis Business et le lien Tous les forfaits depuis Premium / 3D présentent une opacité de 1 sur toutes les images échantillonnées et aucun mouvement du défilement une fois la liste affichée. Mouvement réduit validé en local à 320 px. 314 tests passent. Aucune alerte console dans le contrôle HTTPS.

Sauvegarde, préflight SSR et bascule vérifiés, catalogue identique par SHA-256. Service et tunnel actifs. Aperçu local fermé.

## Version précédente — dégradés mobiles et retour des forfaits

- Révision applicative `4bd3c2d69d9398fc203da0a7eec20a8cc936336b`
- Release `/home/mathis/site-maker/releases/20261117T213822Z-4bd3c2d69d93`
- Client `/assets/index-DMhThJ2V.js`, SHA-256 `51bc9eb0b441d48150f8b07c52ad4a4ad318853b84fdd7822a8533a77a6c696a`
- Archive : 27 941 172 octets, SHA-256 `722f9b235de57f74e6306c1e9d5ca095118b8541c5777fe525ff8d5a4de24c69`

En HTTPS à 430 px, les trois dégradés de carte sont visibles au repos et les boutons Configurer restent noirs. Au Retour navigateur, Business se stabilise à 126,80 px, avec un fondu et un déplacement de 14 px sur 560 ms. Aucun déplacement du document pendant l’animation. Le survol bureau, le lien Tous les forfaits et le mouvement réduit à 320 px ont aussi été contrôlés en local. 314 tests passent.

Sauvegarde et préflight SSR réussis avant la bascule. Catalogue identique par SHA-256, service et tunnel actifs. Aperçu local fermé. Détails dans `docs/qa/choice-flow-2026-11-17/design-qa.md`.

## Version précédente — header compact et transitions à 560 ms

- Révision applicative `4d2cd20269c309b3dd14e462a39ba46070f422db`
- Release `/home/mathis/site-maker/releases/20261117T212753Z-4d2cd20269c3`
- Client `/assets/index-C-B4xcQw.js`, SHA-256 `97e04184bf0ed8d7e9dc7043e9edf785c8dc10a8d1ab3a62cfc46f7cef312d8d`
- Archive : 27 955 877 octets, SHA-256 `67cb9ef161b386c194bbe239db6f84504093cd0dd6f76a6e1ccfd4617f27efbd`

Le header mobile occupe 68 px hors zone système. Entrée et retour à 560 ms sur téléphone et ordinateur. Liens de paiement se replie sous Boutique, le compteur s’ouvre sous Ajouter une page et le sous-menu Forfaits se déplie. Les résultats filtrés de la galerie apparaissent progressivement.

Vérification HTTPS dans le navigateur intégré. À 430 px avec safe-area simulée de 59 px, header 127 px et retour Business à 126,80 px. Le paiement se replie de 147,9 à 0 px et se redéploie à 147,9 px, Boutique reste à 617,55 px. Raccords natifs de 560 ms à 1 280 px. Filtre de galerie et réduction du mouvement contrôlés, aucune alerte console. 314 tests passent. Détails dans `docs/qa/choice-flow-2026-11-17/design-qa.md`.

Préflight SSR sur trois routes, sauvegarde privée réussie et bascule atomique. Catalogue identique par SHA-256, service et tunnel actifs. Seul `site-maker.service` a été redémarré. Aperçu local arrêté après contrôle.

## Version précédente — choix mobiles stables et transition progressive

- Révision applicative `ed8a123675d6fc546a142c192cb50ac6088ca592`
- Release `/home/mathis/site-maker/releases/20261117T064321Z-ed8a123675d6`
- Client `/assets/index-C22JzSDI.js`, SHA-256 `06ed1324c4f48fbe1c57870b6ce08cf8798459567cb4fe203d93467b4675a598`
- Archive : 27982965 octets, SHA-256 `b8634a9ff276fbb6cd45333c1ca683fcbc35ec1ce3a610c5097430f81fc478f7`

Le résumé placé au-dessus des choix poussait la ligne touchée d'environ113px pendant son agrandissement. Sur public<=760px, taille finale synchrone et compensation unique avant peinture, sans boucle de scroll. Cadre de résumé écrit avant la compensation, clones FLIP évités sur mobile, recentrage différé d'accordéon annulé dès un choix ; quantité, mensuels et masquage Paiement/Boutique couverts. Privé et desktop conservent leurs effets.

Arrivée mobile560ms/.2→1/18px et courbe répartie(.4,0,.6,1), carte/texte ensemble. Fonctionnalités et enfants du bandeau en opacité seule ; fond opaque et fixe. Au retour mobile, carte recentrée en fondu.65→1/300ms, sans capture, translation ni délai. Mouvement réduit, contraste Changer, comparatif au scroll de page, logo et desktop760ms conservés.

Deux relectures spécialisées ; TypeScript, builds client/SSR/Sites et314 tests réussis. IAB430/320, appuis AX répétés, quantité, mensuels, boutique et appui130ms après ouverture : dérive≤0,21px, stable après750ms. Desktop ajout/retrait : ligne fixe, cadre animé620ms conservé. HTTPS430 : opacité.200→.529→1 et translation17,992→10,598→0 px ; ajout/retrait±0,203px, retour147,211px pour header147px, fondu.65→1. Aucune alerte console. JS et CSS accueil/configurateur (cinq actifs) conformes au build par SHA-256 ; santé valide. Émulation, sans revendication de FPS sur iPhone matériel.

Sauvegarde et préflight Node24/SSR avant bascule atomique. Trois offres,28 définitions, tarifs et identifiants inchangés ;22 autres services/PID conservés, GP Park inactif. Seul site-maker.service redémarré ; Tailscale déjà actif laissé inchangé. Localhost4183 fermé (PID84591), deux onglets locaux fermés et émulations/viewport retirés ; aperçu public conservé. Rapport : `docs/qa/mobile-steady-features-2026-11-17/`.

## Version précédente — contraste de Changer sur téléphone

- Révision applicative `d807806baf1d244c4de2e2ac3c5ba1bb55f64fc0`
- Release `/home/mathis/site-maker/releases/20261117T061816Z-d807806baf1d`
- Client `/assets/index-BAJu3ZUu.js`, SHA-256 `1794e3544b967d3e771dcf5b47f86896d208f6c5146ba2ffe8cf6fc4a84f0f37`
- Archive : 27982607 octets, SHA-256 `355f282545f1a7bbe3d969ead556861e5a1e1a8af775fe38364212124a9b9938`

Sur760 px maximum, Changer a un fond noir opaque#111, texte blanc, état ouvert/survol#292929 et apparence native retirée. Même style pour le bouton et son double décoratif. Dimensions stables88,875×44 px ; desktop32 px et rendu translucide conservés. Aucun changement JS, de navigation ou d'animation. Arrivée mobile400 ms conservée.

TypeScript, builds client/SSR/Sites et314 tests réussis. IAB local430/320/bureau : trois forfaits, ouverture/fermeture, mouvement réduit et absence de déplacement contrôlés. HTTPSBusiness430 confirme fond/texte/tailles, menu et arrivée.4s, aucune alerte console. JS et CSS des routes accueil/configurateur conformes par SHA-256 ; santé valide.

Sauvegarde et préflight Node24/SSR avant bascule atomique. Trois offres,28 définitions, tarifs et identifiants inchangés ;22 autres services/PID conservés et GP Park inactif. Seul site-maker.service redémarré ; Tailscale déjà actif laissé inchangé. Localhost4183 arrêté (PID82741), émulations/viewport retirés, aperçu public conservé. Rapport : `docs/qa/mobile-change-contrast-2026-11-17/`.

## Version précédente — arrivée mobile visible

- Révision applicative `c6e4354605d37aa1e0563a9470a1b018e0341630`
- Release `/home/mathis/site-maker/releases/20261117T060918Z-c6e4354605d3`
- Client `/assets/index-BPA2Kegc.js`, SHA-256 `7a501da3317a019e6b37d4acd90c68802b57044e19d8ad1cf3e66a783e07b68a`
- Archive :27980763 octets, SHA-256 `a828fd679e8696ee2065f4b00ecb36ab821b2330be4058513730ea1a2d66419b`

Arrivée400 ms de la carte réelle et des liens, texte/image ensemble, opacité0→1 et translation24 px ; fonctionnalités et contenu de barre en opacité seule. Fond de barre opaque et fixe, ancre Personnaliser immobile. Aucun zoom/capture/délai. Listing stable, desktop760 ms, comparatif au scroll de page, logo et réduction du mouvement conservés.

TypeScript, builds client/SSR/Sites et314 tests réussis. IAB430/320/bureau : phases réelles observées, appui immédiat, menu et retour contrôlés. HTTPS430 : opacité.011→.494→1, translation23,733→12,145→0 px, barre au bas932 et zéro capture ; aucune alerte console. Client/deuxCSS conformes par SHA-256 et santé valide. Ces observations ne mesurent pas les FPS d'un iPhone matériel.

Sauvegarde et préflight Node24/SSR avant bascule atomique. Trois offres,28 définitions, prix et identifiants inchangés ;22 autres services/PID conservés et GP Park inactif. Seul site-maker.service redémarré ; Tailscale déjà actif laissé inchangé. Localhost4183 fermé (PID81716), deux onglets locaux fermés, émulations et viewport retirés, aperçu public conservé. Rapport : `docs/qa/mobile-visible-entry-2026-11-17/`.

## Version précédente — comparatif dans la page et carte mobile directe

- URL `https://gilmathis.com/`
- Révision applicative `8363e7e8eaae2d240221a183d876a0bc4102c5b4`
- Release `/home/mathis/site-maker/releases/20261117T054057Z-8363e7e8eaae`
- Client `/assets/index-DFgDc_AJ.js`, SHA-256 `ab49fc6316f2ee1d3d7a481c4e004f80df12f34d1f05c1d645518340166bfa09`
- Archive client/SSR/runtime : 27980165 octets, SHA-256 `b0c857f1ec550e2b35ed0069bfa3ea3f6971af52cf50e02a80a999dd029c3f30`

Le comparatif mobile ne crée plus de scrollport : trois colonnes, critères pleine largeur, défilement du document et thead sticky sous la navigation. Bordure et arrondis attachés aux cellules, masquage des tr/tbody via timelines CSS ou fallback mobile rAF. Aucune surface colorée ajoutée derrière la nav. L'animation mobile/tactile utilise la carte réelle entière sur200 ms, image et texte ensemble, opacité et déplacement6 px ; aucun zoom, recadrage ou capture native, y compris au Retour/Avance. L'ancien mécanisme compact est supprimé. Le listing reste stable et centré au retour. Raccord desktop760 ms, logo et fondu supérieur conservés.

Trois spécialistes et contre-relecture finale ; TypeScript, builds client/SSR/Sites et314 tests passent. IAB320/430, safe-area59/34 et écran court568 : scroll page, sortie du tableau et remontée, détails, Changer, retours Business/Premium et retour après30 ms vérifiés. Mouvement réduit sans animation et barre fixe non transformée. Desktop1280 : trois calques760 ms et tableau4colonnes sticky96 px conservés. Mesures préchauffées : layouts16/14/15→8/7/7 et travail de style réduit ; ce ne sont pas des FPS sur iPhone matériel.

HTTPS430 : cadre1477 px overflowvisible/scrollTop0, scrollY2714,5→3460 depuis le tableau, thead147 px sous nav147 px, bordure1 px et rayon14 px. Business arrive en.2s, copie opacity1, zéro capture, barre au bas932 ; retour carte147,211 px pour nav147. Aucune alerte console. Client et deux CSS publics conformes par SHA-256 ; santé, thème et manifeste valides.

Sauvegarde privée et préflight Node24/SSR avant bascule atomique ; trois offres,28 définitions, tarifs et identifiants historiques inchangés.22 autres services/PID préservés et GP Park inactif ; seul site-maker.service redémarré. Tailscale déjà actif laissé inchangé. Localhost4183 fermé (PID79585), compteurs de performance/émulations/viewport retirés et quatre onglets de test fermés. Prévisualisation publique conservée. Rapport et limites : `docs/qa/mobile-page-scroll-2026-11-16/`.

## Version précédente — fluidité mobile, comparatif trois offres et logo

- URL `https://gilmathis.com/`
- Révision applicative `c128e4213fa8a117d55908c17a922abb6ad019e9`
- Release `/home/mathis/site-maker/releases/20261117T043244Z-c128e4213fa8`
- Client `/assets/index-DctWazF2.js`, SHA-256 `f1487a99669f8c1a92fbb270fc5b9daad7cc7fc1a4b35495869403ff7c58e49c`
- Archive client/SSR/runtime : 27979958 octets, SHA-256 `6e6e0d0c2b3930801427d4ebd8610164efa847a185498dc21eb7d4aa3d9c00cc`

Le mobile ne capture plus que sa texture : canevas fixe, translation/échelle uniforme et recadrage sur 360 ms. Le texte reste réel et apparaît en fondu 140 ms après le retrait de la surface native. Le changement entre forfaits ne conserve plus le fondu desktop de 500 ms. Logo au même dessin et à la même animation : bandes vectorielles placées dans des calques HTML, payload stable et introduction indexée sur pathname+search ; menu, ancre et sélection ne la rejouent plus. Le comparatif mobile présente les trois offres en colonnes, avec critères pleine largeur, noms/prix/CTA fixes et sans sélecteurs. Fondu supérieur, navigation transparente, prix et raccord desktop 760 ms conservés.

TypeScript, builds client/SSR/Sites et 321 tests passent. Deux relectures de source et IAB local 320/430/1280 : détails, mouvement réduit, sélection/retrait, changement de forfait et retours vérifiés. Sur les parcours Vitrine préchauffés, layouts 80–85 avant / 14–16 après ; ce sont des compteurs de navigateur émulé, sans garantie FPS sur iPhone physique.

IAB HTTPS 1280 : menu Forfaits sans rejeu du logo. HTTPS 430 avec safe-area 59/34 : trois offres simultanées, une seule capture plan-connecte sur .36 s, canevas fixe ; retour Business à 147,211 px pour un header de 147 px. Aucune alerte console. Client et deux CSS publics conformes par SHA-256, santé valide, thème/manifeste blancs et fondu 180 px conservés.

Sauvegarde privée et préflight Node24/SSR avant bascule atomique. Trois offres, 28 définitions, tarifs et identifiants historiques inchangés ; 22 autres services/PID préservés et GP Park inactif. Seul site-maker.service redémarré. Tailscale déjà actif laissé inchangé. Localhost 4183 fermé (PID 75792) ; compteurs de performance, émulations et viewport retirés, quatre onglets de test fermés. Prévisualisation publique conservée. Rapport et preuves : `docs/qa/mobile-fluid-2026-11-16/`.

## Version précédente — fondu supérieur et navigation transparente

- URL `https://gilmathis.com/`
- Révision applicative `b45c6ca69f0f76954b67c16ad89a9e19a69c0de4`
- Release `/home/mathis/site-maker/releases/20261117T022813Z-b45c6ca69f0f`
- Client `/assets/index-DqM0nf_I.js`, SHA-256 `0c0d35953009498f6c0fc6744cde874f430415e3036af3d6111a23e82008417b`
- Archive client/SSR/runtime : 27978506 octets, SHA-256 `d7e1ba1b3d807d87098c07d0f70863c454c4da4c65d4b92d2a46e19d91c7a60f`

Mathis précise que la zone native est mauve unie et accepte un fondu avant celle-ci. Le décor et son grain rejoignent progressivement le blanc sous la safe-area, sur 180 px, uniquement sur mobile/tactile/fenêtre étroite. Fond HTML/body, thème et manifeste blancs. Le fond opaque du wrapper de navigation est supprimé ; sa géométrie et son comportement au scroll sont conservés. Le desktop reste sans fondu supérieur. Ce lot remplace l'essai de fond derrière le header décrit ci-dessous, sans revendiquer un dégradé dans le chrome natif de Safari.

TypeScript, builds client/SSR/Sites et 321 tests passent. Avant/après dans l'IAB : 320/430 px, safe-area 59/34 et desktop 1280 px. HTTPS à 430 × 932 : haut blanc progressif, wrapper transparent sans image, hauteur 147 px et même scroll 2027,5 ; aucune alerte console. Client et deux CSS publics conformes par SHA-256, manifeste actuel et santé valide.

Sauvegarde privée, import runtime Node24 et rendu SSR vérifiés avant bascule atomique. Trois offres, 28 définitions, tarifs et identifiants historiques inchangés ; 22 autres services/PID conservés et GP Park inactif. Seul site-maker.service redémarré. Tailscale déjà actif laissé inchangé. Localhost 4183 arrêté (PID 69176), port vérifié fermé ; émulations retirées et onglets de test fermés. Prévisualisation publique conservée. Rapport et preuves : `docs/qa/native-gradient-2026-11-16/`.

## Version précédente — animation et ergonomie mobile, fond de navigation

- URL `https://gilmathis.com/`
- Révision applicative `561725509cfa95c443b37ba0256a743b87e23de7`
- Release `/home/mathis/site-maker/releases/20261117T014851Z-561725509cfa`
- Client `/assets/index-CTzg6dx7.js`, SHA-256 `eb5b273fafd7a9574814f331d5c1efbd909ef4477b3fad346b9798406f1e333c`
- Archive client/SSR/runtime : 27976922 octets, SHA-256 `3ba53ae7be23ff2cc629a353b981ccd7b010f06cb1b8776e6314a93498ebf732`

Raccord mobile de420ms avec seulement les couches image/texte ; aucun snapshot racine/page/footer. Arrivée visible360ms depuis le menu ou une source non appariée, mouvement réduit respecté. Ligne Votre forfait/Changer après le raccord, sans flottement. Menu sans logo, croix fixe et liste défilante. Personnaliser amène aux vraies fonctionnalités avant Continuer ; cibles44px. Desktop760ms, dimensions32px et comparaison simultanée conservés.

Le premier essai e7de738, publié dans 20261117T013123Z-e7de73879695, ne résolvait pas la bande native selon Mathis. Sa capture IMG_5897 montre le mauve système pendant le rafraîchissement et le dégradé du contenu plus bas. La version finale retire ce calque fixed expérimental et peint directement tout le wrapper de navigation avec le dégradé opaque. body et manifeste gardent le fond pastel. **Le rendu derrière l'heure/la batterie reste non confirmé sur l'iPhone réel après cette dernière version.**

321 tests passent après les derniers changements : TypeScript et builds client/SSR/Sites. IAB local320/430 et bureau1280, puis HTTPS430 : vrai fond de header opaque et dégradé, zéro calque expérimental, menu Menu sans logo, deux noms de capture et durée420ms. Personnaliser déroule les fonctionnalités, devient Continuer, focus sur Configurez votre site ; barre au bas932, header configurateur sorti de l'écran. Aucun envoi ni alerte console. Client/deuxCSS publics conformes par SHA-256 et manifeste actuel ; réponses iPhone/desktop identiques, no-store et CDN DYNAMIC.

Sauvegarde et préflight Node24/SSR réussis avant bascule atomique ; santé, tarifs, trois offres et28 définitions inchangés. Seul site-maker.service redémarré ;22 autres services/PID inchangés et GP Park inactif. Tailscale déjà actif laissé inchangé. Localhost4183 arrêté, émulations retirées et onglets de test fermés ; prévisualisation publique conservée. Rapport, captures et limites : `docs/qa/mobile-polish-2026-11-16/`.

## Version précédente — Safari iPhone, menu compact et comparaison simultanée

- URL `https://gilmathis.com/`
- Révision applicative `169e3a8b65242916d0f3734aa51744ba89dfbeb8`
- Release `/home/mathis/site-maker/releases/20261116T230338Z-169e3a8b6524`
- Client `/assets/index-fiCz-Uir.js`, SHA-256 `2cdc36ce4581e50b597ea4bcf79bc31fd93f4b809536b7149e4499b8ae57bdca`
- Archive client/SSR/runtime : 27975352 octets, SHA-256 `07dc44fbbb7155f7fb930080e3383051f13bab545f84e09dc6a3797451ac72fd`

Viewport jusqu'aux bords, fond racine pastel et protection safe-area. Menu burger flottant borné, entrée 260 ms et sortie 220 ms ; focus et sous-menu accessibles sur écran court. Parcours des forfaits tactile sans captures lourdes, fondu de la carte réelle 140 ms ; raccord desktop conservé. Comparatif mobile de deux offres simultanées, sélection parmi les trois, noms/prix/CTA fixes dans le tableau et aucun défilement horizontal. Le tableau desktop, le logo, les textes commerciaux et le catalogue sont conservés.

TypeScript, builds client/SSR/Sites et 318 tests passent ; sources de l'archive vérifiées contre le commit relu. IAB local à 320/430 px avec safe-areas de 59/34 px, écran court 568 px et desktop 1280 px. IAB HTTPS : menu 360 × 410,35 px, animation d'ouverture/fermeture et restitution du focus ; comparatif à 390 px sans débordement, choix Premium et détails fonctionnels. Ouverture de Premium avec fondu 140 ms ; retour devant sa carte à 146,80 px pour un header de 147 px. Aucune alerte console observée. Client et deux CSS publics identiques aux fichiers construits par SHA-256.

Sauvegarde privée et préflight Node24/SSR réussis avant la bascule atomique ; santé, tarifs, trois offres et 28 définitions inchangés. Les 22 autres services/PID restent identiques ; GP Park reste inactif. Seul le service du site est redémarré. Tailscale était déjà actif et est laissé dans cet état. Rapport, captures et preuves : `docs/qa/mobile-safari-2026-11-16/`. Pas d'iPhone Safari matériel ni de benchmark FPS ; le tint natif de Safari doit être distingué du fond de page testé en émulation.

Serveur local de cette tâche arrêté (PID 47639, port 4183 vérifié fermé), émulations et viewport restaurés, onglets locaux/de recherche fermés. Prévisualisation publique conservée.

## Version précédente — logo animé, mobile et historique

- URL `https://gilmathis.com/`
- Révision applicative `84f34bc96601ef7065a30de9a7e1a3d4abc49f33`
- Release `/home/mathis/site-maker/releases/20261116T222847Z-84f34bc96601`
- Client `/assets/index-DwiRxYqD.js`, SHA-256 `a9c2ffb666ef71db94a412554d46ae6a93f52f12f731170ddf13ad360a6443c0`
- Archive client/SSR/runtime : 27973260 octets, SHA-256 `d99c1ee998b1e11c0260cc1e4e76d08d14e17489e5fd1f8782a4b04469622ff9`

Introduction de 720 ms du symbole choisi, chargement orbital réel, SVG identique intégré au HTML et mouvement réduit respecté. Reprise mobile : skip link au clavier seulement, fond racine, défilement tactile, barres fixes, comparatif avec un forfait entier à côté des labels, bornage du scroll et retrait des calculs de clipping desktop sur mobile. Retour au forfait courant, historique ordinaire et dossiers privés protégés. Ancres internes de l'accueil gérées par le routeur. Copie commerciale et prix conservés.

TypeScript, build client/SSR/Sites et 316 tests réussis sur export isolé. Contrôles IAB locaux 320/390 et HTTPS, copie du client et des actifs conforme. Retour Premium à 87,80 px pour une navigation 88 px ; document 390/viewport 390. Dernier onglet public sans alerte console. Test chargement sur latence temporaire, remise à zéro ; mouvement réduit et clavier vérifiés.

Sauvegarde privée et préflight Node24 (imports/rendu SSR) avant la bascule, santé et catalogue identiques. Seul le service du site est redémarré, 22 autres services/PID inchangés ; GP Park reste inactif. src/content/home-copy.ts fait partie des modules nécessaires à l'archive, comme indiqué dans ops/README.md. Le premier essai sans ce module a été automatiquement annulé avant la livraison corrigée.

Preuves et limites : `docs/qa/mobile-2026-11-16/`. Pas de benchmark FPS ni de téléphone Safari physique. Localhost de cette tâche fermé (4183), viewport restauré et onglets temporaires fermés. VPN déjà actif au moment du déploiement laissé inchangé ; ce lot ne l'a pas activé. La version intermédiaire fc89044 a précédé le correctif d'ancres de la version finale 84f34bc.

## Version précédente — accroche commerciale sur les agences

- URL `https://gilmathis.com/`
- Révision applicative `1a85add1bbbe13cc086276168f0094932e639b1f`
- Release `/home/mathis/site-maker/releases/20261116T214541Z-1a85add1bbbe`
- Client `/assets/index-DzA3PkMC.js`, SHA-256 `b5241c9fa42790f2134ecd7cfa3793ebd7dfb37daf8c652f73ba6faaa684f95c`
- Archive code et builds : 41 783 345 octets, SHA-256 `edbbfe572669ec4af56c2d21f48f28ec8ad82cf923471cb866e36d5e6ffa9d7d`

À la demande réitérée de Mathis, l'accueil affiche « Jusqu’à 40 % moins cher qu’une agence traditionnelle » dans un encart clair, avec la première partie en gras, au-dessus de Choisir mon forfait. Cette publication remplace la mise en brouillon du lot précédent. Le chiffre est une accroche demandée par Mathis, pas une moyenne de marché validée par nos contrôles. Introduction sur mesure et description SEO conservées ; prix et trois bénéfices retirés du hero toujours absents.

Export propre du commit sans les modifications mobiles et de marque concurrentes. TypeScript, builds client/SSR/Sites et 290 tests passent ; rendu serveur vérifié avec Node 24 à l'origine. Contrôle IAB local puis HTTPS bureau/mobile : encart à 18 px au-dessus du bouton, document de 305 px à 320 × 740 sans débordement, bouton entièrement visible (bas à 544,125 px), description SEO et canonical conservées, aucune alerte console observée. Captures et preuves dans `docs/qa/agency-saving-2026-11-16/`.

Sauvegarde réussie, archive vérifiée, bascule atomique, santé et tunnel actifs ; catalogue complet strictement inchangé. Seul `site-maker.service` redémarré. Serveur local 4173 arrêté, émulations retirées, onglets temporaires fermés et Tailscale remis à l'arrêt. Le défaut du comparatif reste en attente dans ce lot.

## Version précédente — introduction sur mesure, tarif réservé au SEO

- URL `https://gilmathis.com/`
- Révision applicative `a056e8f5d7b440199b01c8c737925017943e754f`
- Release `/home/mathis/site-maker/releases/20261116T213508Z-a056e8f5d7b4`
- Client `/assets/index-hyoJnksy.js`, SHA-256 `4e1d6a98c2e65a2872aeb3f5d973de910d0f987052555a31ec0311853133cd03`
- Archive code et builds : 41 756 665 octets, SHA-256 `596fdfcbef168edfded997529299f9aa44639606622d54909c06d0000550a482`

Clarification de Mathis appliquée : prix et trois bénéfices retirés du hero. La description SEO conserve le site personnalisé à petit prix dès 890 €, mobile et mise en ligne compris. L'introduction visible devient « Nous concevons et créons votre site internet sur mesure pour présenter votre activité, faciliter les prises de contact ou faire découvrir votre univers en 3D. ». La comparaison « jusqu'à 40 % moins cher qu'une agence » reste en brouillon, faute de comparaison équivalente établie.

Export propre du commit, indépendant des modifications mobiles et de marque en cours dans le répertoire partagé. TypeScript, builds client/SSR/Sites et 290 tests passent. Contrôle IAB local puis HTTPS sur ordinateur et à 320 × 740 : nouveau texte, aucun bloc prix ni liste de bénéfices, métadonnées conservées, largeur du document 305 px sans débordement, bloc de boutons terminé à 518,125 px. Aucune alerte console observée. Captures et preuves dans `docs/qa/hero-correction-2026-11-16/`.

Sauvegarde réussie avant bascule atomique ; service et tunnel actifs, catalogue complet strictement inchangé. Seul `site-maker.service` redémarré. Émulations retirées, onglets temporaires fermés, serveur local 4173 arrêté et Tailscale remis à l'arrêt. Le défilement vers une zone blanche après le choix « platinum » dans le comparatif est seulement mis en attente dans `docs/SUIVI_DEMANDES.md`, sans reproduction ni correctif dans cette release.

## Version précédente — accroche commerciale dès 890 €

- URL `https://gilmathis.com/`
- Révision applicative `38594530b5e1f9e4d9ed0babebaf9e15fa936e9a`
- Release `/home/mathis/site-maker/releases/20261116T211930Z-38594530b5e1`
- Client `/assets/index-Bw9zP6Jx.js`, SHA-256 `6f3db27285eca692115b665d3cd133e3ec0b40e11626167ea1bcb1e3a8a9877a`
- Archive code et builds : 41 757 107 octets, SHA-256 `7629627ee917d1fef95d9c6ef90f0cb7e42bd979b0435d8e92653f835300c24a`

Description SEO recentrée sur le site personnalisé à petit prix à partir de 890 €. L'accueil affiche le prix et trois arguments courts avant le bouton : Design personnalisé, Mobile compris, Mise en ligne comprise. Les montants sont lus dans le catalogue serveur, avec CHF et « sur devis » conservés ; aucun tarif ni périmètre modifié. L'image de partage pointe vers le fichier de marque présent `logo-pixelito-512.png`.

TypeScript, build client/SSR/Sites et 290 tests passent. Contrôle IAB public à 1280 px puis 320 × 740 : description dans le HTML initial et l'Open Graph, prix et arguments présents, absence de débordement (document 305 px), bouton visible (bas à 599 px), aucune erreur console observée. Image sociale servie en PNG avec statut 200. Le bouton de choix du forfait garde son ancre. Les SVG et le favicon transparent précédemment livrés sont conservés.

La comparaison demandée vise les agences ; cinq offres d'agences ont été vérifiées. Le calcul 890 € contre un budget hypothétique de 1 500 € donne 40,7 %, mais ne prouve pas une moyenne à prestations égales : aucun pourcentage moyen n'est publié. Repérage : `docs/qa/commercial-2026-11-16/comparaison-agences.html`.

Sauvegarde réussie avant bascule atomique ; santé et tunnel actifs après livraison, catalogue complet strictement inchangé. Seul `site-maker.service` redémarré ; aucun formulaire envoyé. Preuves dans `docs/qa/commercial-2026-11-16/`. Serveurs locaux arrêtés (4173/4185), émulations retirées, onglets fermés et Tailscale temporairement repris puis remis à l'arrêt.

## Version précédente — favicon transparent

- URL `https://gilmathis.com/`
- Révision applicative `e113bf17cda5d970cfa444fd4b041c03f5096ba0`
- Release `/home/mathis/site-maker/releases/20261116T210809Z-e113bf17cda5`
- Client `/assets/index-Bx8iDzZT.js`, SHA-256 `7408f1d79860dc11eb0324bf6ffd68bd885673ad2b0c6fdf0f1bc694f642aad6`
- Archive client/SSR/runtime : 27968250 octets, SHA-256 `e014bb57d69841a3f8ca9a8026e443baea1f3087820d191a52ec10ba02202b8e`

Fond blanc retiré des six PNG et des images ICO : symbole sur fond transparent, sans changement des SVG ni du logo de navigation. Liens d'icônes et manifeste versionnés. TypeScript, build client/SSR/Sites et 290 tests passent. Huit ressources publiques correspondent aux exports ; canal alpha des PNG et des images ICO vérifié. Head et rendu public contrôlés dans l'IAB, aucune alerte console observée.

Sauvegarde privée avant bascule, santé valide, catalogue et prix identiques, paiements désactivés. Les 22 autres services/PID sont inchangés ; GP Park reste inactif. Localhost de cette tâche fermé (4183) et Tailscale remis arrêté. Les essais commerciaux locaux d'une autre tâche ne sont pas inclus. Preuves : `docs/qa/favicon-transparent-2026-11-16/`.

## Version précédente — HTML public, SEO et IA

- URL `https://gilmathis.com/`
- Révision applicative `a4fead9624ed1345ca5b6518a2d554e78c1a5a8a` sur `main`
- Release `/home/mathis/site-maker/releases/20261116T205204Z-a4fead9624ed`
- Client `/assets/index-Bx8iDzZT.js`, SHA-256 `7408f1d79860dc11eb0324bf6ffd68bd885673ad2b0c6fdf0f1bc694f642aad6`
- Archive code et builds vérifiée de 41 761 378 octets, SHA-256 `194287aa60c41dbfe87d9eff18e059c0ced0ac4f25cf6250ee58d4af89126bba`

Les neuf pages publiques livrent leur contenu React dans le HTML initial, avec styles de route, tarifs serveur et hydratation. Métadonnées et titres renforcés, données structurées cohérentes, aperçu social et cache des fichiers hashés. Pas de HTML public sur les routes privées ; aucun nom légal ou contact sur pixelito.dev inventé. Mentions légales et Confidentialité accessibles par le pied de page, toujours provisoires et hors indexation. Logo SVG choisi conservé.

TypeScript, build client/SSR/Sites et 290 tests passent. Contrôle IAB HTTPS des neuf pages : statut 200, un H1, corps HTML et balisage présents ; accueil sans JavaScript sur ordinateur et à 390 px, sans débordement. Formulaire activé après hydratation, aucune erreur console observée et aucun envoi. PageSpeed mobile après publication : 96 performances, 100 accessibilité automatique, 100 bonnes pratiques, 100 SEO ; LCP 0,9 s, TBT 0 ms, CLS 0. Ce test ne mesure ni classement ni citations IA. La propriété Search Console du domaine n'est pas accessible au compte ouvert.

Sauvegarde privée réussie, contrôle du rendu avec Node 24.22.1, bascule atomique et santé/tunnel actifs. Catalogue public complet strictement identique avant/après. Seul le service du site est redémarré. Rapport et limites : `docs/SEO_IA_2026-11-16.md` ; preuves : `docs/qa/seo-ai-2026-11-16/`. Localhost arrêté, émulations retirées et Tailscale temporairement repris puis remis à l'arrêt. La release précédente reste disponible.

## Version précédente — logo Pixelito SVG

- URL `https://gilmathis.com/`
- Révision applicative `ca178280eed0026379524620a6fa016ed07d08ea` sur `main`
- Release `/home/mathis/site-maker/releases/20261116T204453Z-ca178280eed0`
- Client `/assets/index-GOYaL1PZ.js`, SHA-256 `bc836a9cb06d5e73f5244bc43cf22981397ce2aa75b5382ced3b2b59360c2484`
- Archive vérifiée de 14157211 octets, SHA-256 `0038a42327bd3731261a4a501ef21f719a7e100d7bee7d129a163959c93fa91d`

Logo à trois bandes et typographie de la capture choisie, vectorisés en tracés. Fichiers `logo-pixelito.svg`, `logo-pixelito-symbole.svg` et `logo-pixelito-typo.svg`, symbole/mot séparés ; favicon et icônes mobiles dérivés du symbole. Logo commun à la navigation, au menu, au pied de page et à l'espace privé ; symbole seul pour les chargements. Ancien personnage orange et masques retirés du client.

Les 284 tests passent. IAB HTTPS à 1280 et 320 px : logo entier, menu accessible, retour en haut et absence de débordement vérifiés ; aucune alerte console observée. Seize contrôles HTTPS des pages et ressources, empreintes conformes au build isolé. Sauvegarde privée et santé validées ; catalogue public inchangé (3 offres, 28 définitions), prix inchangés et paiements désactivés. Les 22 autres services/PID restent identiques ; GP Park était inactif et le reste. Preuves dans `docs/qa/brand-2026-11-16/`.

La release provient d'un export propre du commit, sans les travaux légaux ni SEO concurrents restés locaux. Serveur local de cette tâche arrêté (4183), viewport restauré et Tailscale remis à l'état arrêté initial. La préparation des SVG utilise Potrace ; le build courant ne dépend pas de cet outil.

## Version précédente — logo orange restauré

- URL `https://gilmathis.com/`
- Révision applicative `e2f568abc974acb75a6c0d2c8eb5ac4afaf92bc1` sur `main`
- Release `/home/mathis/site-maker/releases/20261113T021824Z-e2f568abc974`
- Client `/assets/index-emgLuvKH.js`, SHA-256 `8cc12aa079767d8f5d679657260964b5d48547227a8c840569850163feadbed6`
- Archive vérifiée de 14 963 843 octets, SHA-256 `d20b0bbea693e8ffb9c83f90988d68913d1cf3aa9e01600d0416fb136c83abbb`

À la demande de Mathis, l'essai de compagnon de navigation est annulé. Logo et x d'origine restaurés, petit personnage orange animé simplement à côté. Le composant de promenade, sa feuille de styles et leurs imports/effets sont supprimés. Sources applicatives identiques à la révision `31a3a88` d'avant l'essai et client identique par SHA-256 à la version `340e503`. Aucun marqueur du compagnon dans les sources ou le build. Clic de retour en haut conservé. Contrôles locaux et HTTPS sur ordinateur et à 320 px : animation simple, aucun débordement ni erreur console observée. Les 284 tests passent. Sauvegarde privée, santé et catalogue vérifiés. Localhost arrêté ; Tailscale déjà actif au début de cette livraison est laissé actif. Date de livraison : 12 novembre dans le fuseau du client, nom de release en UTC.

## Version précédente — retour en haut depuis l'accueil

- URL `https://gilmathis.com/`
- Révision applicative `340e503200374febdd559ca52addf1842e50eef5` sur `main`
- Release `/home/mathis/site-maker/releases/20261113T011206Z-340e50320037`
- Client `/assets/index-emgLuvKH.js`, SHA-256 `8cc12aa079767d8f5d679657260964b5d48547227a8c840569850163feadbed6`
- Archive vérifiée de 14 963 885 octets, SHA-256 `ea54460ed9036523240d3aad6b2c1da35dccf36d437934d959a64d4917f3cc83`

Le logo/nom et les liens Accueil ramènent en haut si l’URL d’accueil est déjà ouverte, avec défilement doux et mouvement réduit respecté. Le menu mobile se ferme et restitue le focus sans interrompre cette remontée. Contrôle HTTPS à 1280 et 390 px : positions finales à 0 px depuis 1440 et 1688 px ; retour depuis FAQ conservé, aucune erreur console observée. Les 284 tests passent. Sauvegarde privée, santé et catalogue vérifiés. Viewport restauré, onglet fermé, localhost arrêté et Tailscale remis dans son état arrêté initial. Le nom de release est en UTC ; livraison le 12 novembre dans le fuseau du client.

## Version précédente — logo pixelito animé

- URL `https://gilmathis.com/` ; le domaine `pixelito.dev` n'est pas configuré dans cette livraison.
- Révision applicative `bb5dd070c84aca728ef68d744cbfc39c51b965a8` sur `main`
- Release `/home/mathis/site-maker/releases/20261112T231505Z-bb5dd070c84a`
- Client `/assets/index-Br8ZqEmO.js`, SHA-256 `b0fccdd1b33bbac16ae464d4e6e3225ba6ab2582fe060ffa266d0485cd2cbcd0`
- Archive vérifiée de 14 964 062 octets, SHA-256 `7d78a6325d88ccc636df48111003baf10a653dc891e4779ada3231e6a41ffc3c`

Le logo choisi avec le personnage orange remplace le précédent dans la barre publique ; l'image source est conservée à l'identique. Le personnage et sa traînée sont animés séparément du texte ; un dessin vectoriel léger reprend le personnage pendant les chargements des routes et du formulaire. Animation désactivée si mouvement réduit demandé. Rendu et animation contrôlés en local et en HTTPS sur ordinateur et mobile ; chargement ralenti vérifié localement puis formulaire affiché sans envoi. Les 284 tests passent. Sauvegarde privée, santé et catalogue vérifiés. Localhost arrêté, Tailscale remis dans son état arrêté initial.

## Version précédente — premier essai de logo pixelito

- Révision applicative `4a4c026153dab705d6f0a961de8563b267e0cf4c`
- Release `/home/mathis/site-maker/releases/20261112T230705Z-4a4c026153da`

## Version précédente — Changer et animation du menu

- URL `https://gilmathis.com/`
- Révision `1c5d757689656eefc6a2658d227830765bde9b38` sur `main`
- Release `/home/mathis/site-maker/releases/20261112T054946Z-1c5d75768965`
- Client `/assets/index-72Jt91dI.js`, SHA-256 `6cd1c8930c94a31a965068ba181fb386d9c25f942c281365fff2f08c4a8ccdaa`
- Archive vérifiée de 13 983 935 octets, SHA-256 `88a8ddca895e23e262f403e83bdfa1af0d18babd5e58e68e506a9fb83e63bbb5`

Changer et sa copie native mesurent désormais tous deux 32 px de haut avec la même hauteur de ligne de 18 px. Le panneau se déplie en 240 ms et se replie en 200 ms, sans mettre le texte à l’échelle. Le déclencheur ne subit plus une fermeture concurrente par le menu sortant lors d’une réouverture rapide. Le menu reste non modal. Le vocabulaire « fonctionnalités » et la rubrique « Services en ligne » sont conservés.

Contrôles HTTPS à 1 280 et 320 px, 284 tests passants. Mesures pendant et après l’arrivée sur Business : bouton et copie 88,875 × 32 px. Même constat sur mobile et lors du choix de Premium. Sept échantillons publics de dépliage et neuf de repli confirment la vraie animation et le démontage en fin de sortie. Aucun verrouillage du body. Sauvegarde privée, santé et catalogue vérifiés. Capture `59-changer-menu-anime-public.jpg`, relevés `57-changer-animation-local.json` et `58-changer-animation-public.json` dans `../outputs/audit-ergonomie-2026-11-10/`. Mouvement réduit retiré après test, viewport réinitialisé, onglet fermé. Localhost arrêté, ports 4173/4174 libres.

Tailscale était arrêté sur le poste. Connexion temporairement reprise avec les paramètres existants (`accept-routes` conservé), publication puis état arrêté initial restauré. Le tunnel public reste actif. Les noms de releases emploient UTC ; cette livraison correspond au 11 novembre au soir dans le fuseau du client.

## Agrandissement et FAQ détaillée publiés le 11 novembre

- URL `https://gilmathis.com/`
- Révision `9eb5048934f6be693b91151fcae187d3ee8e9910` sur `main`
- Release `/home/mathis/site-maker/releases/20261111T071306Z-9eb5048934f6`
- Client `/assets/index-DzewHxyV.js`, SHA-256 `3a3186292cc240b3d6fd00f80010cb0e27c6e2e0729ffa005898e82a0816c6b2`
- Archive vérifiée de 13 983 004 octets, SHA-256 `760b822d1fd705924134a62e89b3919128d747c1174adfa316a34c2376a98ce4`

Le bouton Configurer du comparatif devient le point de départ de l’agrandissement vers la fiche. Les cartes de base gardent leur propre départ. La première FAQ détaille les trois formules mensuelles. Contrôle HTTPS desktop/mobile, 276 tests passants. Sauvegarde privée, santé et catalogue vérifiés. Serveur local arrêté, ports 4173/4174 libres.

## Retrait de la rubrique publié le 11 novembre

- URL `https://gilmathis.com/`
- Révision `5601f8b5a60da388ecb5e9744bf485a8e191df56` sur `main`
- Release `/home/mathis/site-maker/releases/20261111T064304Z-5601f8b5a60d`
- Client `/assets/index-DunDBleH.js`, SHA-256 `a1789f6505206bed1bc9eb9e7d1d403e86197c7ec5ea7dbfe90af25af52ae0d0`
- Archive vérifiée de 13 982 108 octets, SHA-256 `a8c9c943365af4ac0bcbfc2b5c95a1a703cdaea102d5d8b90dd03691bdde4379`

La rubrique réalisations/tarifs/avis est retirée du comparatif, du texte Business et des inclusions des nouvelles configurations. CMS et prix inchangés ; anciens dossiers conservés. Contrôle HTTPS à 1 280 × 700 et 320 × 740, 276 tests passants. Sauvegarde privée, santé et catalogue vérifiés. Localhost arrêté et ports 4173/4174 libres.

## Lignes uniformes publiées le 11 novembre

- URL `https://gilmathis.com/`
- Révision `c6e1a705bc7a5b02e2166acd8c2bf0f2e9f05879` sur `main`
- Release `/home/mathis/site-maker/releases/20261111T063205Z-c6e1a705bc7a`
- Client `/assets/index-C3a_SDUY.js`, SHA-256 `177f7bf1c79e64b19ed14eccaf958a5ef828b2ead851ed4f73846d3156ce2da9`
- Archive vérifiée de 13 982 437 octets, SHA-256 `da3af247c19046eee6e554a21966cde1677306f03ef5a9857260d93ec6969f31`

Les lignes du corps du comparatif sont uniformément blanches, y compris au survol et en début de groupe, avec des séparateurs de 1 px. Contrôle HTTPS à 1 280 × 700 et 320 × 740, 273 tests passants, sauvegarde privée, santé et catalogue vérifiés. Localhost arrêté, ports 4173/4174 libres.

## Tableau et retours publiés le 11 novembre

- URL `https://gilmathis.com/`
- Révision `6195cb142415d0ae5b1c8df24ecb42c18a2e9b30` sur `main`
- Release `/home/mathis/site-maker/releases/20261111T062206Z-6195cb142415`
- Client `/assets/index-11r4uc2l.js`, SHA-256 `e5330aa8c8bcf64a23475973629ef78b79dc651d6fd30e53451b8d9efec275c0`
- Archive vérifiée de 13 981 574 octets, SHA-256 `4501314272641fe9592723aadcb1fc3166b816c897686cda16a137330f12cf91`

La reprise du comparatif auparavant gardée en local est désormais publiée, à la demande du 11 novembre. Le retour depuis les cartes, le comparatif et la navigation utilise le même recentrage vers les offres. Contrôle HTTPS sur ordinateur et mobile ; 273 tests passent. Sauvegarde privée, santé et catalogue vérifiés. Le serveur local est arrêté et les ports 4173/4174 sont libres.

## Carte aérée publiée le 11 novembre

- URL `https://gilmathis.com/`
- Révision `ae40bafa0d056c5c0e84a72402177ec329bf39c7` sur `main`
- Release `/home/mathis/site-maker/releases/20261111T060811Z-ae40bafa0d05`
- Client `/assets/index-DRDi_nsE.js`, SHA-256 `2ebd8819feccd68eb7f0d80ada31d424b48a5af4f1243dab9d33c251a26d56d6`
- Archive vérifiée de 13 983 080 octets, SHA-256 `9f9a9555b6367a08083f5b5c08e7422fd696b531ad3ebc419bd2fcad3e94932f`

La carte publique utilise une présentation intermédiaire plus aérée, identique quelle que soit la hauteur de la fenêtre. Les inclusions ne disparaissent plus sur écran bas. Les 270 tests passent. Contrôle HTTPS à 1 280 × 700, 1 280 × 1 100 et 320 × 740 ; sauvegarde privée, santé et catalogue vérifiés. La reprise du comparatif reste locale et n’est pas dans cette release.

## Carte compacte publiée le 10 novembre

- URL `https://gilmathis.com/`
- Révision `8c06298727348c323232a2e9c0fe3fc9e7b835ca` sur `main`
- Release `/home/mathis/site-maker/releases/20261111T052204Z-8c0629872734`
- Client `/assets/index-CVKs8o1o.js`, SHA-256 `cd305e23e521a5900f318aa898cde59d258090745cae4fee358ba7f9fab4a0b8`
- Archive vérifiée de 13 982 588 octets, SHA-256 `0e83c1db5b43a996e488ef9fbdc9fa82cb15a8a8155cedc3483344b7300270e2`

Ce lot adapte uniquement la carte du configurateur aux fenêtres basses et étroites. Contrôle HTTPS avec onze options à 1 200 × 700, puis disposition empilée à 1 100 × 700 et 320 × 740. Les 270 tests passent. Sauvegarde, santé de l’origine et catalogue vérifiés avant/après publication.

Mathis a demandé de ne pas publier la nouvelle reprise de la bordure du comparatif en remontant. Ces modifications restent dans l’arbre de travail et dans `.data/held-comparison-scroll-up.patch`, hors de cette release. Le défaut signalé sur le comparatif reste donc ouvert en production.

## Défilement et libellés publiés le 10 novembre

- URL `https://gilmathis.com/`
- Révision `f2d2a2a798de86d8bce6a518f70d421bdac19537` sur `main`
- Release `/home/mathis/site-maker/releases/20261111T043737Z-f2d2a2a798de`
- Client `/assets/index-Cjg3QUFs.js`, SHA-256 `41a4687a8fa9a04d3cbe41137f442034354950134551effcad3a917940f769e1`
- Archive vérifiée de 13 983 427 octets, SHA-256 `b5057586d699ad5b0d9f5bd5d7ad730b2fa149b8b20dd36672cf22d543bdf94f`

Le lot `5c27c0f` a publié le masquage natif du comparatif et les réglages du configurateur. `f2d2a2a` ajoute le retour vers les offres depuis le menu et les nouveaux libellés. Sauvegardes, santé de l’origine et catalogue vérifiés aux deux publications. La version finale a été contrôlée en HTTPS à 320 et 1 280 px. Les 270 tests passent.

## Cadre du comparatif repris le 10 novembre

- URL `https://gilmathis.com/`
- Révision `4271b3d8b399619796b539ebb669d24e2b3b0a4e` sur `main`
- Release `/home/mathis/site-maker/releases/20261111T031622Z-4271b3d8b399`
- Client `/assets/index-D6kgoMuN.js`, SHA-256 `b35d723b5b4bb7b30643d63dfcd2d0d1d4a4d38466d0a4f7ed7e7c60b1dad451`
- Archive vérifiée de 13 980 801 octets, SHA-256 `6c3064d8bef9e9eb38c17ac9e86bfa46a6298f7662d7e5ae302b1a55bc2a6e48`

Les bordures et les coins supérieurs appartiennent aux cellules de l’en-tête du comparatif. La bordure basse ferme le cadre à la dernière ligne. Parcours vérifié en HTTPS avec défilement réel, à 1 280, 800 et 320 px en local puis à 1 280 et 320 px en public. Sauvegarde, santé de l’origine et catalogue vérifiés. Les 270 tests passent.

## Premier contour arrondi publié le 10 novembre

- URL `https://gilmathis.com/`
- Révision `6e224d7b2ad2e77c8c28471cc49b2fa712e32145` sur `main`
- Release `/home/mathis/site-maker/releases/20261111T025659Z-6e224d7b2ad2`
- Client `/assets/index-UDndeRW6.js`, SHA-256 `e408cc4ee6482847c687b89c4c3561037f085a0c9050389f724adbcf95408948`
- Archive vérifiée de 13 981 816 octets, SHA-256 `4ba4a3e82e78d959ff40197430691adcda0a1726ba11d030fcf8dbbaca730922`

La bordure supérieure et les coins arrondis accompagnent l’en-tête fixe du comparatif. Vérification publique à 1 280 et 320 px. Sauvegarde, santé de l’origine et catalogue vérifiés. Les 270 tests passent.

## En-tête complet du comparatif fixé le 10 novembre

- URL `https://gilmathis.com/`
- Révision `c7118859f8b59b3b2378993e7acb5f0614222807` sur `main`
- Release `/home/mathis/site-maker/releases/20261111T011342Z-c7118859f8b5`
- Client `/assets/index-6rJL5K2W.js`, SHA-256 `cf0ce18c818def6d02258e40339247edf3f8d4f99408d5f92dfdbab3f4e989df`
- Archive vérifiée de 13 981 225 octets, SHA-256 `ebc24600932f28970a9626fbf5fd9ab022220e1746c5fc96be8516313adc2634`

L’en-tête complet du comparatif reste ancré pendant la lecture. Les lignes se masquent à son bord inférieur. La vérification publique couvre le tableau et les détails à 1 280 px, puis le défilement du tableau à 320 px. Sauvegarde, santé de l’origine et catalogue vérifiés. Les 270 tests passent.

## Masquage du cadre du comparatif publié le 10 novembre

- URL `https://gilmathis.com/`
- Révision `3d9cb35abf8ec0cbeb54655a9f87eca840294cf6` sur `main`
- Release `/home/mathis/site-maker/releases/20261111T005421Z-3d9cb35abf8e`
- Client `/assets/index-BSYmK8F3.js`, SHA-256 `f14f4e8c6511177e07ff748bfde4d509351ad2f5488aeaa9359c255c12f30b90`
- Archive vérifiée de 13 982 534 octets, SHA-256 `737270372c964fef5baeb4a30d7b46d584bcd8683525c77982beda98d2b64719`

Le comparatif se masque au bord inférieur de la navigation transparente. Contrôles en HTTPS à 1 280 et 320 px, sauvegarde, santé de l’origine et catalogue vérifiés. Les 270 tests passent.

## Navigation flottante, animation et estimation corrigées le 10 novembre

- URL `https://gilmathis.com/`
- Révision `7dd22835feb1a32db7042871e4327e8a95ed5368` sur `main`
- Release `/home/mathis/site-maker/releases/20261111T004211Z-7dd22835feb1`
- Client `/assets/index-VxwN5bQ0.js`, SHA-256 `b7824207f1d4e3a068a02d30e0a069c3640d75a6f7918559a66c707193acb495`
- Archive vérifiée de 13 983 122 octets, SHA-256 `3a613eb9d3840fcdf293287cee7ccb22015bde64c37d9c847e5c2a9f7a96f6ab`

La navigation flottante garde son conteneur transparent jusqu’au pied de page. Les rubriques du configurateur s’animent dans les deux sens en 620 ms. Le total indicatif prend le milieu des fourchettes et affiche le mensuel à part. Sauvegarde, santé d’origine et catalogue vérifiés. Les contrôles en HTTPS à 320 et 1 280 px et les 270 tests passent.

## Navigation et bouton des détails corrigés le 10 novembre

- URL `https://gilmathis.com/`
- Révision `eb698772cc29ac251663c7ce6bfcf6b2789463e7` sur `main`
- Release `/home/mathis/site-maker/releases/20261111T001834Z-eb698772cc29`
- Client `/assets/index-BTRzZMIR.js`, SHA-256 `21f70d9c077f0e2a10529d5c7b5e49f135c8e170bcac55594813abce4658df90`
- Archive vérifiée de 13 981 576 octets, SHA-256 `f39de2038d4706e84bc1741e3614ce838df5d39ab2f12844b293c08cf644e709`

La navigation défile avec la page. Le menu Forfaits présente les trois offres. Le bouton des détails occupe toute la largeur sous le tableau. Version vérifiée à 320 et 1 280 px en HTTPS. Les 270 tests passent.

## Ergonomie et navigation fixe publiées le 10 novembre

- URL `https://gilmathis.com/`
- Révision `1ff76cf100e0c72776daef94cdd41e0eca00ae7f` sur `main`
- Release `/home/mathis/site-maker/releases/20261111T000939Z-1ff76cf100e0`
- Client `/assets/index-DWI5GL-j.js`, SHA-256 `5979453ab4e03f7e1af8b69b4fe68310189421292d10adf6976ac38594d8986d`
- Archive vérifiée de 13 982 779 octets, SHA-256 `55d5b5c0521ed638b0003668717c5b01245c038e558a1fc5c1366e530c39cb52`

Le lot `cfd8f27` a publié les ajustements du configurateur, du comparatif et des exemples. `1ff76cf` a rétabli la navigation fixe. Sauvegarde, santé d’origine et catalogue vérifiés aux deux bascules. Version finale vérifiée en HTTPS à 320 et 1 280 px. Les 270 tests passent.

## Premier lot de retours UX publié le 10 novembre

- URL `https://gilmathis.com/`
- Révision `8ff63f395d49d9268183500f155982c48a5bbd4a` sur `main`
- Release `/home/mathis/site-maker/releases/20261110T234139Z-8ff63f395d49`
- Client `/assets/index-DvkFI2wn.js`, SHA-256 `62316d588818b17a49a4ed0c61f0cdb5c165ed88b941027b6977cb521c77706e`
- Archive vérifiée de 13 981 108 octets, SHA-256 `29328d4eecebfae7cb3bc74e1aa3ea5141ed07beefe890e1aefc3a25c36b3f7a`

Sauvegarde vérifiée avant la bascule. L’origine sert la révision attendue et le catalogue conserve les tarifs, options et identifiants. Parcours publics vérifiés en HTTPS à 320 et 1 280 px. Carte Premium également inspectée à 1 440 px en densité 2. Les 270 tests passent.

## FAQ révisée publiée le 9 novembre

- URL `https://gilmathis.com/`
- Révision `d1e203f4ff8f6f7cb431aa72159ebf6646e984db` sur `main`
- Release `/home/mathis/site-maker/releases/20261109T062000Z-d1e203f4ff8f`
- Client `/assets/index-CZ817RAY.js`, SHA-256 `5da9bff85c0ff1a0c219f17895df43231de08fb5da7f8cb57577489fda4bfd8d`
- Archive vérifiée de 13 985 307 octets, SHA-256 `a96d5d385613b5022046b183d68cc71c016178537ac6ed919b533945ba402301`

Huit réponses de la FAQ vérifiées en HTTPS à 320 et 1 280 px. La première série de trois réponses a été publiée et vérifiée sur `7281f15` avant la livraison de la version finale. Sauvegarde, santé d’origine et catalogue vérifiés. Les 270 tests passent.

## Réponse sur les frais après création publiée le 9 novembre

- URL `https://gilmathis.com/`
- Révision `65380cbb02ee058e478a5a40b8166df1712365e3` sur `main`
- Release `/home/mathis/site-maker/releases/20261109T061021Z-65380cbb02ee`
- Client `/assets/index-CWLzfs5e.js`, SHA-256 `79cd61f2d23c04766e991e08e0501a3e00326eb2b7baf5682704df83f8769e96`
- Archive vérifiée de 13 980 156 octets, SHA-256 `d69ebe9763303ae7ab16a143c6d99c897c1969306512d90f13e72903717afd93`

Réponse sur les frais après création vérifiée dans la FAQ à 1 280 px et sur l’accueil à 320 px. Sauvegarde, santé d’origine et catalogue vérifiés. Les 270 tests passent.

## Textes de suivi et lien Addiction Agency publiés le 9 novembre

- URL `https://gilmathis.com/`
- Révision `88e0cd837f574c821e322cecc75258081eed1b60` sur `main`
- Release `/home/mathis/site-maker/releases/20261109T060211Z-88e0cd837f57`
- Client `/assets/index-DbD6GyyV.js`, SHA-256 `b34a8b0fb20c00a8fc284a006456710fc5b6dbc7e59c568ba41fdba27505793e`
- Archive vérifiée de 13 988 612 octets, SHA-256 `805828a57968711b3995c7e560c3dabd6ee31e4b01b9f67d7fa43967c03df6fc`

Descriptions de Maintenance et Sérénité et FAQ simplifiées. Les quatre liens de la carte Addiction Agency pointent vers l’accueil du site. Sauvegarde et santé d’origine vérifiées. Le contrôle du catalogue confirme les deux descriptions modifiées et les mêmes prix. Vérification HTTPS à 1 280 et 320 px. Les 270 tests passent.

## Offres et étapes de l’accueil publiées le 8 novembre

- URL `https://gilmathis.com/`
- Révision `693aca595f85725dcf81f394e9aa529ca3c8c8db` sur `main`
- Release `/home/mathis/site-maker/releases/20261109T053618Z-693aca595f85`
- Client `/assets/index-rRqkBTUm.js`, SHA-256 `73659a32b40214df37ef3b0683badd54d8eeaf46002ce072403666fac01dc636`
- Archive vérifiée de 13 982 175 octets, SHA-256 `74fd0517266f0ba487008ddc7cebec3e8656877d8e46bc5869a9a753010cf932`

Premium / 3D démarre à 2 490 €. Le CMS et l’espace membres ne sont plus des choix Vitrine. Le CMS est compris dès Business et l’espace membres reste disponible en option dès Business. Les trois étapes de l’accueil et le libellé CMS ont été reformulés. Sauvegarde, santé, tunnel et tarifs vérifiés. Accueil, configurateurs, comparatif et FAQ contrôlés en HTTPS à 320 et 1 280 px. Les 270 tests passent.

## Adresse e-mail professionnelle publiée le 8 novembre

- URL `https://gilmathis.com/`
- Révision `29bb86deab13cb5eb48e88eef3bd32834df04cca` sur `main`
- Release `/home/mathis/site-maker/releases/20261109T052452Z-29bb86deab13`
- Client `/assets/index-mobKKB8j.js`, SHA-256 `7bb349d430e5ea6e62c8d71ed87a95c020c6b89ab5bc466a7090a80db8e0e0a4`
- Archive vérifiée de 13 981 715 octets, SHA-256 `65cc1f448deb65b0a3f3541650d8a4597823066b92be2eec2f007ec4fd8fa218`

La mise en place de l’adresse professionnelle est comprise dans Business et Premium / 3D. Le devis l’affiche à 0 € et le configurateur Vitrine ne la propose pas. Tarifs, reprise Premium, santé et tunnel vérifiés après sauvegarde. Comparatif et configurateur contrôlés en HTTPS à 320 et 1 280 px, FAQ vérifiée et console sans erreur. Les 270 tests passent.

## Prise de contact de l’expert publiée le 8 novembre

- URL `https://gilmathis.com/`
- Révision `dc4a18d733763647099677bb66a910a1c5e2a00c` sur `main`
- Release `/home/mathis/site-maker/releases/20261108T214836Z-dc4a18d73376`
- Client `/assets/index-DUQ2t6Py.js`, SHA-256 `216017596a5906f5b138d78c8bbc04414c633d81ebfc0f9585f79320fe8f72c9`
- Archive vérifiée de 13 982 638 octets, SHA-256 `48bbf39b2940e7d6c695558a218d70e3502e94636777fa2b28e046929398ce8c`

La note sous le prix précise qu’un expert contactera le client pour adapter l’offre. Vérifiée en HTTPS sur trois lignes à 320 px pour chaque forfait et deux lignes à 1 280 px. Les 269 tests passent. Sauvegarde, santé et tarifs vérifiés.

## Paragraphe sous le prix publié le 8 novembre

- URL `https://gilmathis.com/`
- Révision `03e7a8f9e0ae8c489bd4ff8c3a0bc13b7d310ad5` sur `main`
- Release `/home/mathis/site-maker/releases/20261108T214214Z-03e7a8f9e0ae`
- Client `/assets/index-YKVi2hVl.js`, SHA-256 `34173d520e56ccf9319118a73b9ebe0ec5c1ae3a0b8c992583e8159a7a9a58c6`
- Archive vérifiée de 13 982 138 octets, SHA-256 `0130587717e814c474fe4e314afdd4b8a1718e07d56cf2e572cb010be89dfb79`

La note sous le prix se répartit naturellement sur trois lignes à 320 px pour les trois forfaits et sur deux lignes à 1 280 px. Les 269 tests passent. Sauvegarde, santé et tarifs vérifiés.

## Note à trois lignes publiée le 8 novembre

- URL `https://gilmathis.com/`
- Révision `513b18cb28e2996376bfe4dd1f73566bb0b98b59` sur `main`
- Release `/home/mathis/site-maker/releases/20261108T213632Z-513b18cb28e2`
- Client `/assets/index-CCVI7Hbo.js`, SHA-256 `a263d2987d864fceaefbddf3a5eaef1541decde3c40d322472b7c032bc95a0e7`
- Archive vérifiée de 13 981 488 octets, SHA-256 `e1dc2f99e6bd9943a9066691f83b2fd065c7d12179426cd0bc18b88b817e29c3`

Le texte de prix indicatif et de conseil tient sur trois lignes sous le prix dans les trois configurateurs à 320 px. « Continuer » ouvre le formulaire et la zone sous le bouton est libre. Vérification en HTTPS à 320 et 1 280 px. TypeScript, build et 269 tests passent. Sauvegarde, santé et tarifs vérifiés avant et après la bascule.

## Survol, options et estimation publiés le 7 novembre

- URL `https://gilmathis.com/`
- Révision `5f8893631306296c41e64c0180e7f94e3655e2d5` sur `main`
- Release `/home/mathis/site-maker/releases/20261108T004909Z-5f8893631306`
- Client `/assets/index-CTr1c1Ej.js`, SHA-256 `b2221cf37ea373a508efd0c04de911e1e0ac3646bfdd6c002ec79b17f2f0b4c3`
- Archive vérifiée de 13 984 669 octets, SHA-256 `459b584aad6aaf1d0058784f04ad9e70751b1dc269f93dc04f009403f7845866`

Survol du bouton, 3D incluse, traduction, repli des liens de paiement, estimation et message sous « Continuer » vérifiés en HTTPS à 1 280 et 320 px. TypeScript, build et 269 tests passent. Sauvegarde vérifiée avant bascule, origine saine et prix préservés. Le tunnel conserve son processus.

## Réinitialisation des options publiée le 7 novembre

- URL `https://gilmathis.com/`
- Révision `6aae31ce43c10db5f4ffb204dae8fdfc76c9e874` sur `main`
- Release `/home/mathis/site-maker/releases/20261107T200957Z-6aae31ce43c1`
- Client `/assets/index-A-fLsKiO.js`, SHA-256 `3c9d22b82066ee5d4e168d183ea6b4639d0f6c29c91358acc82acd0ceb99d895`
- Archive vérifiée de 13 983 367 octets, SHA-256 `48d87b3209c60c59f6154deda4b9636deaa6b898df5ea242f162d14232843deb`

La quantité de pages supplémentaires est dans la case de l’option. La remise à zéro est disponible dans le résumé et s’applique aussi au changement de forfait public. Les textes des cartes et du blog sont actualisés. TypeScript, build et 268 tests passent. Sauvegarde, santé et prix vérifiés. Le tunnel conserve son processus. Parcours contrôlé en HTTPS à 1 280 et 320 px.

## Forfaits cumulatifs publiés le 7 novembre

- URL `https://gilmathis.com/`
- Révision `f7336f274fbc603cd8ee33647cae425182ee8061` sur `main`
- Release `/home/mathis/site-maker/releases/20261107T194847Z-f7336f274fbc`
- Client `/assets/index-B7XQB3PC.js`, SHA-256 `a9472a4c7cd8eb409a62d01bada03be74ae39738182f7e570a508d7df40d6f8e`
- Archive vérifiée de 13 986 994 octets, SHA-256 `0400fb1305d38e28d63b718f550d8801a168dffb5ad046ebdc7e3edb00c6af0e`

Cartes cumulatives, reprise de contenus incluse dans Premium / 3D, libellé newsletter et mention « à titre indicatif » publiés. TypeScript, build et 268 tests passent. Sauvegarde vérifiée avant bascule. Le contrôle d’origine confirme les mêmes tarifs, la reprise incluse à 2 499 € et le même processus du tunnel. Vérification HTTPS en IAB à 1 280, 390 et 320 px. Aucun envoi de formulaire.

## Défilement de la navigation publié le 7 novembre

- URL `https://gilmathis.com/`
- Révision `408754b8a2b0eb179d683c2bd73c294a9ca397e9` sur `main`
- Release `/home/mathis/site-maker/releases/20261107T191513Z-408754b8a2b0`
- Client `/assets/index-dx-m2Qxf.js`, SHA-256 `7af562fb07b255b6aae681628fec7c81078ba7cca35d397d3b1fa87b6d71920e`
- Archive vérifiée de 13 979 694 octets, SHA-256 `7980ce0fa34c05c7eac865004dda4d4a803f3284597aeb3a27bd4ef406ffc5d4`

La navigation publique défile avec la page. La carte du configurateur conserve son ancrage sur ordinateur et les animations protègent la portion visible du menu. TypeScript, build et 268 tests passent. Sauvegarde vérifiée avant la bascule et contrôle de santé réussi. Le tunnel conserve son processus.

Le contrôle public a reproduit le défilement d’une fiche Business dans une fenêtre de 1 280 × 560 px. La barre qui masquait 64 px de la carte quitte désormais l’écran. Le comparatif, le menu mobile et l’ouverture du formulaire ont été contrôlés. [Mesures et capture](../docs/qa/navigation-2026-11-07/).

## Langue, comparatif et carte publiés le 7 novembre

- URL `https://gilmathis.com/`
- Révision `3e543b272f921aeaeec6e3d9f6147258ce4523b0` sur `main`
- Release `/home/mathis/site-maker/releases/20261107T185917Z-3e543b272f92`
- Client `/assets/index-DgwnpVUQ.js`, SHA-256 `2ee2a6e836926e0ebb613d0562692bdfbf402a8f4c6fb3a0eca3b0778525039a`
- Archive vérifiée de 13 988 416 octets, SHA-256 `2e8fb2f1af76b267cb4c87d2e645431d03ed4c1ba5185c5359e930889b909221`

Le lot ajuste le périmètre de la langue supplémentaire, ordonne les inclusions et raccourcit la carte du configurateur. `npm run check` a validé TypeScript, le build et 268 tests. La sauvegarde a précédé la bascule du lien `current`. Le service répond et le tunnel conserve son processus. La release précédente reste disponible pour le retour arrière.

Client public vérifié à 1 280, 390 et 320 px. Carte Business sans paragraphe et option de langue à six pages, trois groupes dans le comparatif de l’accueil et de `/forfaits`, aucun débordement de la page ni erreur ou avertissement dans la console observée. [Mesures et captures](../docs/qa/forfaits-2026-11-07/).

## Version vérifiée le 6 novembre

- URL : https://gilmathis.com/
- Révision applicative : `dbcd9e38577fb155c00ae42b9ffba4d61edd3996`, poussée sur `veloci11/Site_maker` / `main`.
- Release : `/home/mathis/site-maker/releases/20261106T202312Z-dbcd9e38577f`, bascule atomique.
- Client public : `/assets/index-CcPXBE2O.js`, SHA-256 local `a6c20418c6567d5341a1ef75a552309f73b1e7bd4b05d32ef89289a4bfd6f17c`, chemin confirmé dans l’IAB public.
- Archive : SHA-256 `f0fda0e4ca6df18f0b27bf02792a9a0cb58b4c4dd2b08116f94e0d530c1df1da`, 13983514 octets, vérifiée avant extraction.
- Version précédente conservée : `/home/mathis/site-maker/releases/20261106T201720Z-8a46e1369fd9`. Lot fonctionnel initial : `8a46e13`, suivi du correctif de largeur `dbcd9e3`.

Ces éléments concernent la livraison du 6 novembre.

## Robustesse, pages, marketing et petits écrans

Frontière d’erreur française des routes, échéance de soumission de 30 s avec saisie et idempotence conservées, quantité de pages supplémentaires à 60–120 €/page. Limites langue/CMS/reprise visibles dans les sélections et nouveaux dossiers ; anciens instantanés préservés. Correction du passage privé de cinq à une page. Arguments des trois offres clarifiés, référencement local mieux visible, 18 FAQ, rôle des références externes précisé. Prix et inclusions validés conservés.

TypeScript, build et **268 tests passent**. IAB local : rejet réel de module, attente réseau suspendue, même requestId au nouvel essai, puis confirmation ; deux demandes locales, zéro tentative e-mail. IAB public : trois ouvertures/retours ordinateur puis mobile, quantités, exclusivité des suivis, boutique/paiement, comparatif/FAQ/galerie et formulaire. Contrôle final 320/390/820/1280 px : aucun débordement global, y compris après menu à 320 px ; mouvement réduit et console sans erreur/alerte observée. Preuves : `docs/qa/fixes-2026-11-06/REVIEW.md`.

Sauvegardes réussies ; sept tables privées, tarif stocké et 24 autres services inchangés. Aucun envoi public. Sélections de test vides, préférence de mouvement et viewport restaurés ; serveur local arrêté, ports 4173/4174 libres et données locales supprimées. `INQUIRY_TO` et identité légale toujours à compléter ; aucune réception e-mail réelle attestée.

## Clarté des détails, formulaire et revue critique

Quinze descriptions de comparaison sans répéter les inclusions ; photos de réalisations/tarifs/avis clients renommés, CMS explicite dans Business/Premium et l’option Vitrine. Formulaire « Décrivez brièvement votre projet » ; après succès API, enregistrement confirmé et rappel par un développeur. Prix/pages/inclusions/graphisme approuvés conservés.

TypeScript, build et 251 tests passent ; dernier build après ajustement d’une référence textuelle de FAQ. Deux confirmations contrôlées avec deux enregistrements locaux isolés, aucun e-mail. IAB public à 320/390/820/1280 px : nouveau client, 15 descriptions, CMS dans les deux fiches, nouveau champ dans les deux parcours, absence de débordement global et de console en erreur. Revue complète et sources : `docs/qa/critical-review-2026-11-06/REVIEW.md`.

Sauvegarde réussie, santé valide, données privées/réglage de prix et 24 autres services inchangés. Aucun envoi public. Serveur local arrêté, base de test supprimée, viewport restauré. `INQUIRY_TO` toujours absent ; informations légales provisoires. La revue documente également deux défauts de robustesse (chargement différé et attente réseau), sans les déclarer corrigés par ce lot de textes.

Les sections suivantes décrivent les livraisons précédentes.

## Gamme finale et CMS mis en avant

Vitrine : 1 à 3 pages, à partir de 890 €. Business : 1 à 6 pages, à partir de 1 490 €, « Populaire », CMS au premier plan. Premium / 3D : 1 à 10 pages, à partir de 2 499 €, tout Business et son CMS, prestations visuelles et demandes sur mesure étudiées. Treize options ponctuelles, dont réservation générique 90–180 € sur les trois. FAQ17, mensualités19/39/69 € exclusives, formulaire court. Image continue haut/bouton des cartes, Premium plus vif, badge tablette corrigé.

TypeScript, build et **251 tests passent** ; build relancé après le dernier ajustement CSS. Contrôles IAB publics ordinateur/tablette/mobile (1280/820/390/320 px), trois allers-retours ordinateur et trois mobile, réservation et ses totaux sur les trois, comparatif développé, FAQ, formulaire à droite, textures et réduction du mouvement. Aucune erreur/alerte console observée. Preuves dans `docs/qa/cumulative-offers/review.md`.

Sauvegarde réussie ; sept tables privées et réglage tarifaire inchangés ; 24 autres services conservent PID/état. Aucun formulaire public envoyé. Choix de test, viewport et préférence réduite restaurés, localhost arrêté. Destination `INQUIRY_TO` et informations légales toujours à compléter. Aucune réception e-mail réelle n’est attestée.

## Animations et textures — livraison précédente

Les six offres utilisent une ouverture/fermeture de 760 ms : déplacement de surface et copies séparées, sans étirement du texte ni de l’image. Seule la page sortante est capturée ; les contrôles entrants restent vivants. Les retours retrouvent la liste d’origine ; les services sont distingués par `besoin`. Un déplacement de souris ne coupe plus l’effet ; pression, clavier et défilement reprennent la main. L’arrivée reste stable sans second fondu de page. Liens ordinaires, réduction du mouvement et protections du brouillon conservés.

Les trois textures d’origine restent identiques octet pour octet. La partie haute garde l’original 1536 × 1024 ; une vraie continuation native prolonge le bas sans miroir visible ni agrandissement de la source rejetée de 724 px. Exports 1x et 2x, ces derniers sans perte. Le filtre sombre a été allégé. Les fichiers sources, la consigne et l’assemblage sont dans `docs/asset-sources/textures/vitrine-continuation-prompts.md` et `vitrine-continuation-assembly.json`.

L’image a une hauteur fixe pendant l’ajout/retrait des options, animé sur 620 ms dans la carte. Aucune hauteur maximale ni défilement interne. Grille explicite : trois choix à gauche, trois à droite, puis alternance gauche/droite. Elle suit les choix dans la session ; un retrait compacte la séquence et un réajout arrive à sa fin. La présentation compacte selon le nombre de choix est supprimée : titre et espacements ne rétrécissent plus. Gutter stable pour la largeur de page. Sur mobile ou carte étroite, une colonne conserve la lisibilité. L’ancrage sticky tient compte de la hauteur réelle ; le défilement normal permet d’accéder au bas. Plusieurs groupes d’options peuvent rester ouverts.

## Dernière vérification — revue Astra du modèle modulaire

Six missions Astra et vérification parent. Les prix recommandés couvrent 6 forfaits/services et 26 options, avec comparables primaires, cas spécifiques et limites du moteur ; ils restent hors du catalogue de production. Contenus précisés, défaut HeadersInit corrigé, pages publiques rendues plus lisibles, règles CSS natives obsolètes retirées et guide manuel actualisé.

TypeScript/build et 230 tests passent. 24 trajets locaux puis 24 trajets publics ordinateur/mobile aboutissent avec opacité 1, phase nulle, aucune animation active et aucun débordement. En local : Changer pendant l’ouverture, Évolution/Refonte puis historique, 17 choix et retrait/réajout, préférence réduite, FAQ/comparatif et erreurs du brief contrôlés. En public : client attendu, précisions mise en ligne, FAQ et console sans erreur/alerte observée.

Sauvegarde réussie, prix et identifiants historiques conservés, définitions conformes au build ; 24 autres services gardent PID/état et GP Park répond HTTP 200. Aucun formulaire public envoyé. Choix publics vides, viewport restauré et localhost arrêté (4173/4174 libres). Workflow GitHub toujours uniquement manuel. Rapport et captures : `docs/qa/astra-review/review.md`.

## Vérification précédente — revue critique des options et fiabilité

Neuf avis spécialisés et contre-audit final ; newsletter/statistiques réexposées, langues/SEO local transversaux et galerie Connecté. Brief conditionnel, clarté du devis, bugs UTF-8/API, focus et FAQ 160 ms corrigés. TypeScript/build et 228 tests passent. Vingt-quatre trajets IAB publics ordinateur/mobile aboutissent avec phase nulle, opacité 1, zéro animation native active et aucun débordement. Les quatre menus publiés comportent 14/17/14/14 choix ; client attendu confirmé, FAQ progressive observée et console sans erreur/alerte. Préférence réduite publique contrôlée. Aucun formulaire ni fichier de test envoyé en production ; choix publics vides et viewport restaurés, localhost arrêté.

Sauvegarde privée préalable réussie. Prix en production et 26 IDs historiques inchangés ; définitions d’options conformes au build relu. Santé valide, 24 autres services conservent PID/état, GP Park HTTP 200. Workflow GitHub toujours manuel. Les nouveaux tarifs restent des propositions dans le classeur révisé. Rapport : `docs/qa/site-review-v2/review.md`.

## Vérification précédente — raccord complet des cartes

Révision `b261ffa` : 24 trajets locaux et 24 publics contrôlés dans l’IAB, sur ordinateur et mobile. Un calque d’image reste opaque ; le masque extérieur suit les quatre bords du cadre. Résumé et total suivent le contenu, titres séquencés et Changer vivant hors capture, avec apparence décorative pour le raccord. Retour au comparatif sans miniature en fondu normal. Mouvement réduit et actions rapides préservés.

TypeScript/build et 213 tests passent. Santé et 13 empreintes publiques conformes. Sauvegarde préalable, catalogue et 24 autres services inchangés, GP Park HTTP 200. Aucun formulaire envoyé. Sélections/viewport restaurés, localhost arrêté. Capture `docs/qa/card-motion-polish/public-final.jpg`, preuves dans le même dossier. Les contrôles ci-dessous conservent l’historique des versions précédentes.

## Vérification précédente — taille et transitions

- TypeScript, build et 213 tests passants ; trois textures originales identiques octet pour octet.
- IAB local : six ouvertures et six retours sur ordinateur puis mobile, entrée stable, scroll de retour exact, douze options sans réduction, retrait et actions rapides contrôlés.
- IAB public : mêmes six parcours dans les deux formats, animations natives 760 ms, premier/cinquième choix sans réduction et retrait 620/420 ms. Le premier relevé Vitrine à froid finit avant la transition ; recontrôle complet à chaud stable. Aucun débordement mobile.
- Santé origine/HTTPS et neuf empreintes conformes. Sauvegarde réussie, catalogue et 25 autres PID inchangés. Aucun formulaire envoyé ; choix, groupes et viewport restaurés ; localhost arrêté.
- Journal public : un abandon natif au redimensionnement du banc de test, détaillé dans le rapport ; parcours à taille stable passants. Capture `docs/qa/stable-motion/public-final.jpg`, preuves dans le même dossier.
- GitHub run 42000019786 : compte verrouillé pour facturation, runner 0 et aucune étape. Le titulaire doit lever le verrouillage avant relance. Le code n’a pas produit d’échec de test sur ce run.

## Contrôle précédent — retraits animés

Le retrait garde une copie décorative en fondu de 420 ms, hors du flux et de l’arbre accessible. Les lignes restantes glissent sur 620 ms vers leurs nouvelles cases et la hauteur du résumé est animée. Les clics rapides repartent de la position visuelle courante ; les copies et animations sont nettoyées, y compris au démontage et en réduction du mouvement. Configuration et totaux restent immédiats. Après les blocs de trois, l’alternance commence désormais à gauche.

- `npm run check` : TypeScript, build et **213 tests passants**.
- IAB local : déplacement réel mesuré (67 positions horizontales), onze niveaux d’opacité à la sortie, clics rapides/retrait-réajout, dernière option et réduction du mouvement. Mobile : 31 positions verticales. Texture fixe de 580 px / 500 px, console vide, aucun défilement interne.
- IAB public : bon client, mouvement continu confirmé avec 48 positions horizontales intermédiaires ; sortie en fondu et zéro copie à la fin. Mobile 390 × 844 : 28 positions verticales, zéro copie à la fin et aucun débordement. Le premier enregistrement mobile s’était arrêté au premier frame de l’action ; le recontrôle observe toute l’animation et sa fin.
- Santé origine/HTTPS valide ; neuf empreintes (client et huit CSS) identiques au build. Sauvegarde réussie avant bascule, catalogue et 25 autres PID de services inchangés.
- Choix publics initiaux, groupes et viewport restaurés. Aucun formulaire envoyé. Serveur local arrêté ; ports 4173/4174 libres.
- Preuves actuelles : `docs/qa/option-reflow/`, capture `public-desktop.jpg`. Diagnostic CI : `ci-diagnosis.md` ; blocage de facturation du compte GitHub à lever par le titulaire avant un nouveau run.

## Contrôle précédent — ordre de la grille


- `npm run check` : TypeScript, build et **213 tests locaux passants**. Aucun calcul, prix ou stockage modifié ; ordre de présentation en mémoire uniquement.
- IAB local : douze choix volontairement différents du catalogue, positions validées aux douze étapes ; trois à gauche, trois à droite, puis droite/gauche. Retrait/réajout et séquence mobile vérifiés. Image fixe et zéro message de console.
- IAB public : même validation aux douze étapes, bon client, total visible et aucun défilement interne. Mobile 390 × 844 : même séquence en une colonne, image fixe de 500 px et aucun débordement. Choix initiaux et viewport restaurés ; console vide.
- Santé origine/HTTPS valide, client et huit CSS identiques au build (neuf empreintes), sauvegarde réussie. Catalogue et 25 autres PID de services inchangés. Serveur local arrêté et ports 4173/4174 libres.
- Preuves actuelles : `docs/qa/option-order/`, capture `public-desktop-full.jpg`.

## Contrôle précédent — retrait de la barre interne


- Build/typecheck et **213 tests locaux passants** après cette correction. Vitrine et Connecté à 12 choix, Sur mesure à 10, mobile et écran bas contrôlés dans l’IAB ; entrée compacte de 620 ms et texture inchangée.
- IAB public : client attendu, 12 options Vitrine en deux colonnes ; contenu client/scroll 609/609, overflow visible, total dans la carte. Mobile 390 × 844 : une seule colonne, texture de 500 px, absence de débordement. Aucune erreur/alerte de console. Choix publics initiaux vides restaurés ; groupes et viewport réinitialisés.
- HTTPS : santé valide, client et huit CSS (9 empreintes) identiques au build. Sauvegarde avant bascule ; catalogue et 25 autres PID de services inchangés. Localhost arrêté et ports 4173/4174 libres.
- Preuves actuelles : `docs/qa/option-columns/`. Capture publique : `public-desktop.jpg`. Les trois originaux restent identiques à la révision précédente.

## Contrôles précédents conservés — animations et textures


- `npm run check` : TypeScript, build et **213 tests passants**, après le retrait du défilement interne. Revue finale indépendante sans blocage.
- IAB local : six ouvertures et six retours sur ordinateur/mobile, services et retour navigateur, texte du brouillon conservé après annulation, clavier, réduction du mouvement dynamique et absence de débordement. Douze options Vitrine et dix Sur mesure contrôlées ; image fixe à 580 px / 500 px pendant la croissance. Le DPR 2 charge effectivement le master original et la continuation native.
- IAB public : nouveau client attendu, ouverture native, premier ajout 0→1 et groupes simultanés ; mobile 390 × 844 (client 375 avec barre de défilement), image fixe et croissance normale. Clic rapide vers Connecté reçu, retour et sélection initiale vide restaurés ; console sans erreur/avertissement. Capture : `docs/qa/full-motion/public/desktop.jpg`.
- HTTPS : santé valide, client et **16 fichiers** comparés au build par SHA-256, dont les trois textures originales et les quatre continuations.
- Origine : sauvegarde réussie avant bascule, Sharp vérifié, catalogue inchangé, **25 autres PID de services inchangés** ; seul `site-maker.service` redémarré. Tunnel inchangé.
- Aucun formulaire réel envoyé, aucun e-mail émis pendant ces contrôles. Les serveurs de test locaux sont arrêtés ; les émulations temporaires ont été réinitialisées.

Preuves : `docs/qa/full-motion/` (traces, dix interventions spécialisées, revues, empreintes et captures). Les traces attestent les durées/exécutions observées ; elles ne garantissent pas 60 images/s sur chaque appareil.

## GitHub Actions

Le contrôle de cette révision échoue avant tout lancement de job : compte GitHub bloqué pour un problème de facturation. [Exécution concernée](https://github.com/veloci11/Site_maker/actions/runs/41983847358). Il ne s’agit pas d’un test applicatif en échec ; les contrôles locaux ont passé et la publication Ubuntu a été vérifiée séparément. Le workflow n’a pas été contourné et aucune opération de facturation n’a été effectuée. Preuve actuelle : `docs/qa/option-reflow/ci.json` ; détail dans `ci-diagnosis.md`. Aucun runner attribué et aucune étape exécutée ; déblocage du compte requis côté facturation GitHub.

## Éléments commerciaux reportés

Les prix et périmètres restent ceux du catalogue existant et attendent leurs montants définitifs ; aucun prix ni délai n’a été inventé. Le destinataire Resend reste reporté par Mathis ; les demandes sont conservées mais une réception réelle devra être vérifiée après sa configuration. Les documents commerciaux définitifs restent à compléter.

## Base conservée et historique des lots précédents

Quatre forfaits de création : Vitrine, Connecté, Immersif 3D et Sur mesure. Évolution et Refonte concernent un site existant et conduisent à deux fiches sur devis, avec la même grande carte à gauche et leur formulaire contextualisé à droite. Le sujet est fixé par la fiche, sans sélecteur redondant. Ces deux cartes utilisent maintenant le même composant `PricingCard`, les mêmes dimensions, la même matière, trois points et le même CTA que les quatre créations. Elles sont centrées en colonnes 2 et 3 sur grand écran, puis partagent les règles tablette/mobile. Les quatre identifiants techniques de création restent inchangés.

- Navigation : menu Forfaits avec six entrées, FAQ à droite avant le contact noir. Le déclencheur Forfaits reste neutre ; la texture apparaît sur chaque offre du sous-menu au survol ou au focus. Liste dépliable sur mobile, fermeture après navigation. Liens actifs noirs et soulignés dans le burger ; Forfaits utilise un soulignement noir renforcé au focus clavier, sans contour violet.
- Cartes : matière et effets approuvés des quatre créations conservés ; deux nouvelles variantes pour les services. Boutons noirs au repos, texture au survol/focus partagée avec le comparatif ; Configurer sans flèche. Flèches diagonales retirées du public.
- Dernière clarification de Mathis : nos images restent exactement les mêmes. Reflet, liseré et halo retirés. Les couleurs apparaissent en 300 ms et le texte en 150 ms ; un grain indépendant précalculé (WebP 256 × 256, 107 058 octets, overlay 0,32) se déplace de quelques pixels pendant 360 ms à l’entrée du survol/focus, une seule fois, puis s’immobilise. Carte et image fixes, pas de filtre animé ni de bruit calculé à l’interaction. CTA et menu conservent 120 ms.
- Comparatif : « Afficher plus de détails » sous le tableau, puis « Masquer les détails », chevron et dépliage CSS de 280 ms ; aucune case à cocher. Tableau sémantique unique et réduction du mouvement respectée.
- Configuration : grande carte à gauche, options à droite, inclusions expliquées par forfait, coordonnées et demande au studio. Accordéon à groupes multiples indépendants (la version antérieure n’ouvrait qu’une rubrique à la fois), résumés des choix actifs dans les rubriques fermées, inclusions signalées et compteurs cohérents. Les six offres partagent la grande carte `SelectedPlanCard` et leurs styles dans `src/components/layout/project.css`. « Changer » est un menu translucide de 210 px attaché au bouton, avec six choix et coche sur le choix courant ; couleurs au survol/clavier, aucun dialogue ni contour de focus extérieur. Le doublon Continuer est retiré de la carte ; une action explicite reste après les options. Totaux ponctuels et mensuels séparés. Vitrine commence sur ordinateur, mobile facultatif ; Connecté comprend les comptes visiteurs et les contenus modifiables.
- Galerie : dix références externes avec filtres et crédits. Le bloc d’introduction est retiré, le H1 accessible conservé. Filtrage strict par offre sans saut de scroll : Lactel en Vitrine, GeoBoss en Connecté, Julie Thiam en Sur mesure ; Cal.com ajouté comme exemple avec connexion vérifiée. La remarque de l’ami sur les aplats est annulée. Un seul badge par site, avec la matière et la variante de sa carte forfait ; les filtres de catégorie restent blancs au repos et révèlent la matière au survol réel, au focus clavier ou à la sélection, avec fondu de 300 ms. Le filtre actif porte un contour. Les badges secondaires sont retirés ; Projet archivé reste dans la description. GeoBoss, Aéma Groupe, Satellite Story et Atlante 3D ajoutés depuis le portfolio de Raphaël. Trois aperçus capturés sur les vrais sites dans l’IAB ; Atlante reprend le poster original et porte la mention « Projet archivé » dans sa description, avec lien vers le README de l’auteur. DOMTEKNIKA, Lactel, Julie Thiam, Tiny Heaven et Addiction Agency conservés. Image, titre et action ouvrent directement la destination dans un nouvel onglet ; anciennes fiches redirigées directement, aperçu en sous-fenêtre supprimé. Aucune scène externe chargée automatiquement.
- FAQ : dix questions concrètes. Les huit premières couvrent frais, contenus, autonomie, domaine, mobile, site existant, calendrier et référencement, avec provenance Reddit qualitative documentée. Deux questions supplémentaires demandées directement par Mathis rassurent sur le choix du forfait et la réorientation par nos développeurs avant démarrage ; ajoutées en fin de liste, elles préservent les trois questions de l’accueil. Aucun prix, avis client, rabais ou délai chiffré inventé.

Catalogue et JSX indentés ; textes partagés dans `shared/catalog.ts` et `src/content/`, guide manuel `docs/MODIFIER_LE_SITE.md`. Primitives shadcn/Radix, Geist et Lucide conservés ; Sharp ajouté côté serveur pour le décodage réel des images ; aucun décodeur natif dans le client. Les dernières vérifications navigateur utilisent exclusivement le navigateur intégré demandé par Mathis.

## Dernier lot — image fixe et fond prolongé

Application `3d1c08c` : la texture et sa lumière gardent une hauteur fixe quand la carte grandit ; une continuation en miroir de la même matière apparaît dessous. Les bandes suivantes sont préparées hors du cadrage, sans nouvelle image ni modification des trois originaux. Les deux instantanés natifs restent à leur taille propre. Options et hauteur ralenties à 620 ms, fondu à 420 ms, accélération douce et préférence de réduction du mouvement conservée.

TypeScript, build et 213 tests passent. Client public SHA-256 `e5638dca06eb7b705d5aaa67e3e3b4ab73a40790d569a3b4fb6ee104311d4ece` ; client, huit CSS et trois textures identiques au build par HTTPS. Sauvegarde réussie, Sharp et archive vérifiés avant bascule. Santé valide, catalogue inchangé et 25 autres services gardent leur PID, tunnel compris. Aucun changement de DNS ou de configuration du tunnel.

IAB public : zéro à douze options, carte de 580 à 973 px, première bande toujours de 612,1 × 580 px. Mesures pendant l’ajout : ancrage à 0, hauteur inchangée et transitions effectives de 620/420 ms. Mobile 390 × 844 : carte de 872,8 px à douze options, bande de 335 × 500 px. Document/client 1425/1425 et 375/375, sans débordement. Choix de départ rétablis, aucun formulaire envoyé, console sans erreur/alerte observée ; viewport temporaire retiré, accueil public conservé et localhost arrêté. Rapport : `docs/qa/fixed-texture/review.md`.

## Lot précédent — fluidité après essai public

Application `7b50265` : cadre et coins progressifs en 520 ms, grande texture révélée à sa taille finale sans étirement, texte capturé séparément et fondu au-dessus de l’image. Préchargement du configurateur au survol/focus, sans attente au clic. Ajout/retrait des options et hauteur de carte progressifs en 360 ms ; totaux, mensuel, rubriques et brief animés. Réduction du mouvement relue au clic et appliquée aussi aux coins du cadre natif.

TypeScript, build et 213 tests passent. Client public SHA-256 `49277ba0c30e82141951956b70e19230af3ec3643d3c9003040d05bb7050e2b5` ; client, huit CSS et trois textures identiques au build par HTTPS. Sauvegarde réussie et Sharp vérifié avant bascule. Santé valide ; catalogue inchangé et 25 autres services gardent leur PID, tunnel compris. Aucun changement de DNS ni de configuration du tunnel.

IAB public : 65 échantillons de transition, durée native de 520 ms, texture entrante `object-fit:none` et opacité du texte de 0 à 1. Ajout/retrait réellement progressifs observés ; premier choix de 580 à 620,6 px, retrait d’une ligne de 29,5 à 0 px. Deux options visibles dans la carte sur ordinateur et mobile, document/client 1425/1425 et 375/375. Dernier retrait : sélection à hauteur 0 et carte revenue à 580 px. Choix initiaux rétablis, aucun formulaire soumis, console sans erreur/alerte observée, viewport temporaire retiré et accueil public conservé. Localhost arrêté. Rapport : `docs/qa/plan-motion-refinement/review.md`.

## Lot précédent — ouverture des forfaits et options dans la carte

Application `3e8bd12` : transition native de 420 ms entre les surfaces de la petite et de la grande carte, contenu en fondu et contrôles laissés cliquables. Options sélectionnées directement dans la grande carte, au-dessus du total, sans volet replié. Carte extensible et sticky désactivé si sa hauteur dépasse l’espace disponible ; préférence de réduction des animations respectée.

TypeScript, build et 213 tests passent. Client public SHA-256 `3807c667b66b744d925a7b032e5db833b16173089af05fe77baba0a2a918726c` ; client, huit CSS et trois textures identiques au build par HTTPS. Sauvegarde réussie, Sharp et santé contrôlés avant/après bascule. Catalogue inchangé et 25 autres services conservent leur PID, tunnel compris ; seul `site-maker.service` a été redémarré.

IAB public : animation native `plan-vitrine` mesurée à 420 ms ; deux options visibles dans la carte sur ordinateur 1440 × 900 et mobile 390 × 844, sans débordement ni ancien volet. Aucune erreur/alerte de console observée. Sélection initiale rétablie, viewport temporaire retiré et accueil public conservé. Aucun formulaire envoyé ; serveurs locaux arrêtés. Preuves et limites : `docs/qa/plan-transitions/public-review.md`.

## Lot précédent — contour de sélection des options

Application `e8895ae` : contour violet autour des lignes retiré dans les options du configurateur et les choix multiples du brief. Coche noire et bordure neutre de 1 px ; au clavier, repère sombre de 2 px sur la petite case. Aucun changement fonctionnel, de prix ou de matière.

TypeScript, build et 213 tests passent. Client public `index-Biz5hM9-.js`, SHA-256 `4cbcc5dca08c84101ae1b69d797d70279cdcbeab6b1024dc547e503e60c6dbdf` ; client et deux CSS modifiés identiques au build par HTTPS. Sauvegarde, décodage Sharp et santé vérifiés ; autres services/PID inchangés, GP Park HTTP 200.

IAB public : souris et clavier sur Vitrine ; choix du brief Refonte sur ordinateur et mobile 390 × 844, document/client 375/375 sans débordement. Choix initiaux rétablis, aucun formulaire soumis, réglages temporaires retirés et localhost fermé. Preuves : `docs/qa/selection-focus/review.md`, `after-public.jpg`, `after-public-mobile.png`, `public-browser.json` et `public-https.json`.

## Lot précédent — questionnaires, accompagnement et étude de prix

Application `82d3e3b` : lien HTTPS facultatif de partage dans les sept briefs, description conditionnelle, réponses et références dans le dossier privé. Questions adaptées, détails techniques facultatifs, branches selon options et historique conservé. L’accueil explique le service, le choix vérifié et les engagements de livraison sécurité/RGPD. La qualification d’ingénieur reste à confirmer. Étude de prix distincte, catalogue sans montant publié.

TypeScript, build et 213 tests passent. Archive retransférée après une première expiration sans activation ; checksum vérifié, sauvegarde et décodage Sharp avant bascule. Santé, quatre offres, 26 options, prix inchangés et autres projets/PID inchangés ; GP Park HTTP 200. Client public `index-BlgVzUM-.js`, SHA-256 `361cc0e2d6fe8b82e8b0b4634d444c82c5ac671bdb4916fd157d02d693b9f04f`, identique au build.

IAB public : accueil et Refonte, rubrique de fichiers, précision conditionnelle et résumé fermé, ordinateur/mobile sans débordement. Une URL fictive a été saisie puis effacée ; aucun formulaire soumis ni fichier téléversé en production. Base QA locale uniquement pour la soumission complète, session déconnectée et zéro tentative e-mail. Réglages navigateur rétablis, localhost fermé. Compte rendu et preuves : `docs/qa/brief-council/final-review.md`. Le retour suivant sur l’encadrement de sélection a ensuite été traité dans le lot `e8895ae` décrit ci-dessus.

## Lot précédent — galerie, parcours et SEO

Application `099c1a1` : cinq filtres testés en public avec scroll conservé, dix sites, un badge chacun et quarante liens externes target blank. Mobile 390 × 844 CSS sans débordement. Garde de sortie Contact réellement vérifié en production avec saisie fictive, conservée par Rester puis abandonnée explicitement ; aucun envoi. Contrôles locaux plus larges sur Vitrine, Retour, Changer et écran bas. Primitives, images et effet approuvés inchangés.

TypeScript, build et 202 tests passent. Après publication, robots texte, sitemap XML de douze URL, head FAQ/canonical, noindex privé, 301 et 404 vérifiés par HTTPS. Empreinte client SHA-256 `e5935505beb738db90db2506195c7329874126f630278abeaf724807833fd20a`, identique au build. Observations IAB initiales : CLS environ 0,00007 cache navigateur ignoré, 0 cache actif sur accueil/galerie/Vitrine ; LCP respectivement 616/608/820 ms sans cache et 592/568/584 ms avec cache. Un échantillon par condition, pas de mesure terrain ni d’INP. Formulaire absent du chargement accueil/galerie. Corps React toujours côté client.

Sauvegarde, décodeur PNG Sharp et santé vérifiés avant/après bascule ; autres projets/services/PID inchangés, GP Park HTTP 200. Informations légales et destinataire Resend restent à renseigner ultérieurement. Preuves et revue finale : `docs/qa/gallery-review/final-review.md`, avec captures natives ordinateur/mobile. Localhost arrêté (4173/4174 libres), onglets temporaires fermés, galerie publique conservée.

## Lot précédent — briefs V2 et images privées

- Recherche préalable et quinze spécialistes : `docs/BRIEF_RECHERCHE.md` et `docs/qa/brief-v2/team-review.md`. Questions, coordonnées et compatibilité des options centralisées dans trois modules partagés, formulaire unique et guide manuel mis à jour.
- Quatre coordonnées obligatoires, sept contextes comprenant le contact général. Six parcours locaux revus ; questions conditionnelles, résumés et retour aux options sans perdre le brief ni les images.
- Options publiques 12/12/12/10 ; inclusions expliquées, sans cases facturables répétées. Catalogue de 26 options et instantanés historiques conservés.
- Images privées BLOB SQLite, six au maximum, 5 Mio chacune, 20 Mio au total. Décodage effectif, limites de pixels/concurrence et quota cumulé 512 Mio par défaut ; configuration facultative `INQUIRY_UPLOAD_STORAGE_LIMIT_BYTES`. Sauvegarde/restauration des BLOB et anciens fichiers testée.
- TypeScript, build et 192 tests passent. Après la dernière modification de libellé, reconstruction finale sans changement de schéma. Aucun marqueur d’asset Vite non résolu dans le build produit. Matières approuvées identiques par SHA-256.
- Ubuntu : sauvegarde avant bascule, `npm ci --omit=dev --ignore-scripts`, import Sharp et décodage PNG vérifiés avant activation. Santé, quatre offres, 26 définitions, prix inchangés et autres projets/PID inchangés ; GP Park HTTP 200.
- HTTPS : client principal SHA-256 `f44e4664f5e24094c1e78faec7da34a714553891c9c353dcacefa939a79c3a8e`, identique au build. Refonte et Vitrine contrôlés dans l’IAB ; branches plateforme/SEO et références, quatre champs requis et une seule rubrique ouverte confirmés. Mobile 390 × 844 : largeur 390, zéro contrôle hors largeur. Aucune erreur applicative observée.
- Aucun formulaire soumis ni image téléversée en production. Parcours complet testé uniquement dans une base locale isolée avec des coordonnées fictives ; notification indisponible et zéro tentative. `INQUIRY_TO` reste à fournir plus tard par Mathis.
- Preuves : `docs/qa/brief-v2/`, dont `public-refonte-desktop.png`, `public-refonte-mobile.png`, `public-refonte-technical.txt`, `public-vitrine.txt` et `public-https.json`. Localhost arrêté, onglets temporaires fermés et onglet public actualisé conservé.

## Vérifications du lot précédent — cartes partagées et menu translucide

- TypeScript, build et 113 tests passent après les modifications finales. La carte et les styles sont réellement partagés ; aucune image source ni règle de prix modifiée.
- Refonte et Évolution : carte à gauche, un seul H1, prix Sur devis, formulaire à droite avec URL facultative et message propres au service. Sujet fixé dans le JSON de la demande, sans sélecteur redondant ; logique d’envoi existante conservée. Contact général et son choix de sujet contrôlés localement. Aucun formulaire envoyé.
- Cartes desktop : largeur 568,3 px et hauteur 530 px dans le viewport contrôlé, identiques entre les services et les créations. Les quatre créations et les services ont été parcourus dans l’IAB ; options compatibles conservées.
- Menu Changer : six choix, coche des services aussi, fond rgba(22,20,26,.64) et flou statique 12 px ; largeur 210 px, contenu/client 208/208 après correction des marges du séparateur. Texture au survol confirmée à opacité 1 ; contour du menu et du déclencheur absent. Focus clavier souligné, Échap conservé.
- Options : zéro bouton Continuer et zéro bouton d’action dans la carte à cette étape. Ajouter mes coordonnées ouvre bien la seconde étape ; retour aux options avec choix conservés. Sur mobile, seule l’action Mes coordonnées de la barre fixe est visible.
- Mobile public 390 × 844 CSS : document/client 390/390, carte de 350 px au-dessus du formulaire, menu de 210 px dans la largeur disponible. Émulation retirée, aucune alerte applicative observée.
- Santé et empreinte HTTPS identiques au build. Origine Ubuntu : sauvegarde avant bascule, quatre forfaits de création, 26 options et prix inchangés, autres projets/PID inchangés, GP Park HTTP 200.
- Preuves : `docs/qa/shared-project-cards/`, dont `public-refonte-glass.png`, `public-refonte-glass.json`, `public-evolution.json`, `public-actions-mobile.json` et `public-https.json`. Localhost fermé, ports 4173/4174 libres ; onglet de contrôle temporaire fermé, onglet public Refonte conservé.

## Vérifications des lots précédents — filtres, navigation et menu Changer

- TypeScript, build et 113 tests passent après les dernières modifications ; diff sans erreur d’espacement.
- Filtres : blancs au repos, texture révélée au survol/focus et maintenue sur la sélection ; retour au blanc après désélection. Un seul badge texturé par site conservé.
- Menu mobile : tous les liens ordinaires noirs, page courante soulignée ; contact noir à texte blanc. Accordéon du configurateur recontrôlé : une seule rubrique ouverte et choix visibles dans les rubriques fermées.
- Changer : six choix, coche sur la création courante, séparateur avant Évolution/Refonte. Menu de 224 px, positionné 6 px sous le bouton sur ordinateur ; zéro dialogue central. Les six destinations et la conservation des options compatibles passent localement ; Refonte et Évolution sont également vérifiées en production avec leur sujet correspondant. Aucun formulaire envoyé.
- Focus Forfaits : aucun contour violet après sélection ; soulignement noir de 2 px au clavier, ouverture par flèche bas et fermeture par Échap conservées. Les autres contrôles gardent leur règle de focus.
- Mobile public 390 × 844 CSS : six entrées dans le menu Changer, document/client 390/390, aucun débordement, zéro dialogue. Émulation temporaire retirée ; aucune alerte applicative observée.
- Santé HTTPS et client identiques au build par SHA-256. Origine Ubuntu : sauvegarde avant bascule, quatre forfaits de création, 26 options et prix inchangés, autres projets/PID inchangés, GP Park HTTP 200.
- Preuves : `docs/qa/filter-hover-mobile-menu/` et `docs/qa/inline-plan-chooser/`, notamment `public-menu.png`, `public-menu.json`, `public-refonte.json`, `public-evolution.json`, `public-header-focus.json`, `public-mobile.json` et `public-https.json`. Localhost arrêté, ports 4173/4174 libres ; seul l’onglet public est conservé.

## Vérifications du lot précédent — couleurs de la galerie

- TypeScript, build et 113 tests passent ; diff sans erreurs d’espacement.
- IAB public : neuf sites et neuf badges, variantes et texture des cartes partagées avec les badges et filtres. Les cinq filtres donnent 9/2/1/5/2 références ; aucun double badge, contour de sélection visible. Archive signalée dans le texte, 36 liens externes conservés.
- Formats desktop et mobile vérifiés. À 390 × 844 CSS, document/client 377/377 : pas de débordement. Aucune alerte applicative observée, viewport temporaire réinitialisé, onglet public conservé.
- HTTPS : santé et empreinte du client conformes au build. Origine Ubuntu : sauvegarde avant bascule, quatre forfaits, 26 options et prix inchangés, autres services/PID inchangés, GP Park HTTP 200.
- Preuves : `docs/qa/gallery-plan-colors/public-gallery.json`, `public-filters.json`, `public-mobile.json`, `public-https.json` et `public-final.png`. Aucun formulaire envoyé. Localhost fermé : ports 4173/4174 libres.

## Vérifications du lot précédent — accordéon et galerie

- TypeScript, build et 113 tests passent ; `git diff --check` propre.
- Accordéon exclusif, fermeture au clavier, réouverture avec choix conservés, retrait d’un choix et inclusions contrôlés dans l’IAB.
- Galerie : neuf références, 36 liens `target="_blank"` et `rel="noopener noreferrer"`, clic DOMTEKNIKA conservant la galerie et ouvrant un onglet distinct ; `window.opener === null` confirmé par CDP. Badges pastel avec contraste minimum 5,86:1.
- Contrôles publics desktop et mobile à 390 px CSS : aucune largeur excédentaire ; aucune erreur/alerte applicative observée. Ancien brouillon public rétabli ; aucun formulaire soumis.
- HTTPS : santé valide et client identique au build par SHA-256. Origine : quatre forfaits, 26 options, prix inchangés, paiements désactivés. Sauvegarde avant bascule, autres projets/PID inchangés et GP Park 200.
- Preuves : `docs/qa/accordion-gallery/`, dont `public-https.json`, `public-accordion.json`, `public-mobile-accordion.json`, `public-gallery.json`, `public-new-tab.json` et `public-gallery-final.png`. Localhost fermé et viewport temporaire réinitialisé.

## Vérifications du lot précédent — grain

- `npm run check` final : TypeScript, build et **113 tests passants**. `git diff --check` propre. Revue indépendante par lecture sans blocage.
- Origine Ubuntu : santé valide, quatre créations, **26 options**, bases de prix nulles et paiements désactivés. Sauvegarde privée avant bascule, autres projets/PID inchangés et GP Park HTTP 200.
- HTTPS : santé et empreinte client conformes. SHA-256 des trois textures colorées et du nouveau grain identiques aux fichiers locaux. Les trois textures colorées ont aussi été comparées octet pour octet à Git : aucune image d’origine changée.
- IAB public : neuf échantillons d’entrée, de 1 à 457 ms ; le grain change brièvement de position puis revient à transform:none, image révélée à opacité 1 en environ 300 ms. Carte toujours transform:none, zéro animation après stabilisation. Aucune ombre/lueur extérieure ni reflet diagonal.
- Contrôles locaux : pas de redémarrage entre les enfants de la carte ; sortie masquant le grain, réentrée rejouant une seule fois ; focus 3 px et réduction du mouvement (grain visible, immobile) respectés. Clic mobile vers le configurateur réel, dix FAQ conservées.
- Mobile public 390 × 844 CSS : document/client 375/375, six cartes et grain à opacité 0 au repos. Aucune erreur ni alerte applicative observée. Viewport et émulation temporaires réinitialisés.
- Preuves : `design-qa.md`, `docs/qa/grain-entry/public-timeline.json`, `public-retina.png`, `mobile-public.json`, `mobile-public.jpg`, `original-images.json` et `grain-asset.json`.
- Aucun formulaire soumis ni e-mail réel envoyé. Localhost arrêté : ports **4173/4174** libres ; seul l’onglet public conservé dans l’IAB.

## Isolement et sauvegardes

Application, runtime Node, tunnel, données et sauvegardes restent dédiés à `/home/mathis/site-maker/`. L’application écoute uniquement `127.0.0.1:3020`. Les services propres sont `site-maker.service`, `site-maker-tunnel.service` et `site-maker-backup.timer`, tous actifs. Le compte Unix reste partagé : séparation opérationnelle, pas une frontière de sécurité entre comptes système.

Une sauvegarde privée a précédé la bascule. Les données et secrets de `shared/` ne sont inclus ni dans Git ni dans les archives. États et PID de `gp-park.service`, `encar-dashboard.service` et `cloudflared-dashboard.service` identiques avant/après ; GP Park répond 200. Aucun de ces services n’a été redémarré.

## Grande carte et éléments reportés

Le master `grain-plasma-master.webp` reste l’export sans perte de la source originale 1536 × 1024, sans flou ni grain de remplacement. La source légère reste dessous et sert seule à DPR 1. Aucun changement du master ni de son recadrage pendant ce lot ; provenance dans `docs/ASSETS_REFERENCES.md`.

La configuration Resend existante est conservée : domaine d’envoi et expéditeur dédiés installés, destinataire **INQUIRY_TO reporté explicitement par Mathis**. Les demandes sont persistées, mais une réception réelle reste à vérifier après fourniture de l’adresse. Ne pas redemander cette adresse pendant les corrections visuelles.

Les prix publics et périmètres sont ceux confirmés dans la livraison actuelle. L’identité et les documents commerciaux définitifs restent à compléter. Les pages provisoires ne sont pas validées par cette livraison d’interface. Aucun paiement n’est demandé à l’envoi d’une demande. Détails opérateur : `docs/EMAIL_REQUESTS.md`, `docs/RESEND_DNS.md` et `docs/AUDIT_SITE_2026-11-02.md`.
