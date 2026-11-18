# Filtres de la galerie par usage — 17 novembre 2026

Publié sur gilmathis.com dans `e22c955f3b6b`. GeoBoss et DOMTEKNIKA en Business, Satellite Story et Tiny Heaven en Vitrine. Lien vers le comparatif sous les filtres. Neuf références vérifiées en HTTPS sur mobile et ordinateur. 317 tests réussis.

# Carte centrée au retour sur téléphone — 17 novembre 2026

Publié sur gilmathis.com dans `d41b9df63dfd`. La carte choisie revient au centre de la zone sous le header avec un glissement opaque de 560 ms. Sur un écran trop court, le titre reste dégagé. Retour navigateur et lien Tous les forfaits vérifiés en HTTPS à 430 px. 316 tests réussis.

# Flash au retour des forfaits sur téléphone — 17 novembre 2026

Publié sur gilmathis.com dans `5c77fc9da692`. La carte reste opaque pendant son glissement de retour à 560 ms. Retour navigateur et lien Tous les forfaits vérifiés en HTTPS à 430 px, mouvement réduit vérifié à 320 px en local. Les 314 tests passent.

# Dégradés et retour des forfaits sur téléphone — 17 novembre 2026

Publié sur gilmathis.com dans `4bd3c2d69d93`. Dégradés visibles au repos sur les trois cartes mobiles et boutons Configurer noirs. Retour de la carte choisie avec fondu et léger glissement sur 560 ms. Contrôles en local et HTTPS, 314 tests réussis.

# Header mobile et transitions des cartes — 17 novembre 2026

Publié sur gilmathis.com dans la révision `4d2cd20269c3`. Header mobile de 88 à 68 px hors zone système, commandes de 44 px. Raccords 560 ms dans les deux sens. Liens de paiement se replie sous Boutique. Compteur de pages, sous-menu et cartes de la galerie animés. Contrôlé à 320/430/1 280 px dans le navigateur intégré, avec 314 tests réussis. Détails dans `qa/choice-flow-2026-11-17/design-qa.md`.

# Animation trop directe et fonctionnalités qui déplacent la page — 17 novembre2026

Résumé situé au-dessus des choix : animation de taille620ms responsable du déplacement reproduit. Correction public mobile : taille finale synchrone, compensation unique de la ligne touchée, pas de clones FLIP et annulation du recentrage différé d'accordéon. Appuis AX répétés, quantité, mensuels, boutique et ouverture : écarts≤0,21px. Arrivée plus progressive560ms et retour300ms sur la carte choisie. Desktop et réduction du mouvement conservés ;314 tests passent. Preuves : `qa/mobile-steady-features-2026-11-17/`. Publié dans `20261117T064321Z-ed8a123675d6` et vérifié en HTTPS : entrée560ms réellement observée, ajout/retrait à±0,203px, retour recentré avec fondu, aucun message console. JS/CSS conformes, santé valide et localhost fermé.

# Changer trop blanc sur téléphone — 17 novembre2026

Le bouton translucide est remplacé sur téléphone par un fond noir opaque et du texte blanc, y compris pendant l'ouverture du menu. Dimensions88,875×44 px stables, chevron et animations conservés ; desktop inchangé. Contrôles320/430/bureau,314 tests et vérification HTTPS. Publié dans `20261117T061816Z-d807806baf1d`, localhost fermé. Preuves : `qa/mobile-change-contrast-2026-11-17/`.

# Animation mobile à nouveau perceptible — 17 novembre 2026

Mathis valide la fluidité mais ne voit pas l'entrée200 ms. Correction CSS limitée : arrivée400 ms de la carte et des liens, opacité0→1 et translation24 px ; fonctionnalités et contenu de barre en fondu synchronisé, ancre et fond de barre fixes. Aucun bitmap, zoom ou délai de navigation. IAB430/320 et bureau : phases visibles, commande immédiate, pas de rejeu après sélection, menu, retour aligné et reduced contrôlés.314 tests réussis. Rapport : `qa/mobile-visible-entry-2026-11-17/`. Publié dans `20261117T060918Z-c6e4354605d3` et vérifié en HTTPS : arrivée .4s réellement observée, barre opaque et fixe, client/CSS conformes et santé valide. Localhost fermé après vérification.

# Comparatif au scroll de page et animation mobile directe — 16 novembre 2026

Mathis rejette le scroll interne et trouve encore le raccord mobile étrange. Le comparatif suit maintenant la page, les trois offres restant visibles dans un en-tête sticky sous la navigation, avec bordures et arrondis ; CSS natif et fallback mobile rAF. La carte mobile réelle arrive en200 ms, texte/image ensemble, sans capture ni recadrage ; retour listing stable, ancien code compact supprimé. Trois spécialistes et contre-relecture ;314 tests et IAB320/430/écran court/bureau valident les détails, les deux sens de scroll, les retours Business/Premium, Changer et retour rapide. Rapport : `qa/mobile-page-scroll-2026-11-16/`. Publié dans `20261117T054057Z-8363e7e8eaae` et contrôlé en HTTPS : tableau au scroll de page, header147 px, animation réelle.2s et retour Business aligné ; client/CSS conformes, santé/catalogue inchangés et localhost fermé.

# Fluidité mobile, trois forfaits et logo — 16 novembre 2026

Mathis valide le fondu supérieur puis demande un raccord mobile fluide, trois offres comparables ensemble et le logo animé uniquement lors d'un changement de page. Correction locale : canevas fixe à une seule texture, texte live et desktop 760 ms conservé ; logo mémorisé, clé pathname+search et bandes HTML composées. Trois colonnes mobiles avec critères pleine largeur ; choix de paire supprimé. IAB 320/430/1280, détails, retours, sélection/retrait et mouvement réduit contrôlés ; 321 tests passent. Mesures de layout 80–85 avant / 14–16 après, sans revendication FPS sur iPhone. Rapport dans `qa/mobile-fluid-2026-11-16/`. Publié dans `20261117T043244Z-c128e4213fa8` et contrôlé en HTTPS : trois offres, logo stable au menu et raccord mobile .36 s à une capture ; client/CSS conformes, santé/catalogue inchangés, localhost fermé.

# Haut mauve et rectangle de navigation — 16 novembre 2026

Mathis précise « haut mauve pas blanc » et choisit un fondu avant la zone système. Le décor/grain se fond vers le blanc sous la safe-area sur 180 px, sans déplacer les éléments. Fond du wrapper de navigation retiré : la rupture au scroll est reproduite puis corrigée dans l'IAB. Base HTML/body, thème et manifeste blancs ; desktop sans fondu ajouté. 321 tests passent. Révision `b45c6ca` publiée dans `20261117T022813Z-b45c6ca69f0f` et contrôlée en HTTPS à 430 px avec safe-area 59/34 ; client/CSS conformes, aucune alerte console, santé/catalogue inchangés et localhost fermé. Preuves dans `qa/native-gradient-2026-11-16/`. Ce lot ne prétend pas forcer le dégradé derrière l'heure dans le chrome natif Safari.

# Téléphone : nouvelle reprise après retour iPhone — 16 novembre 2026

Mathis voit encore du blanc derrière l'heure et rejette l'animation mobile trop discrète. Raccord visible420ms sans captures de page, arrivée360ms depuis le menu, logo retiré, croix fixe, Personnaliser avant les vraies fonctionnalités et cibles44px. Le premier essai e7de738 de bande fixed échoue sur son iPhone ; sa capture IMG_5897 conduit à supprimer ce calque et à peindre directement le wrapper de navigation. Révision5617255 publiée dans20261117T014851Z-561725509cfa et contrôlée en HTTPS ;321 tests passent. Client/CSS conformes, santé/catalogue inchangés, localhost fermé. Preuves : `qa/mobile-polish-2026-11-16/`. Rendu natif derrière l'heure non confirmé après la dernière version ; ne pas le confondre avec l'émulation.

# Reprise Safari et téléphone — 16 novembre 2026

La capture IMG_5893 déclenche une nouvelle reprise : viewport jusqu'aux bords et protection safe-area, menu flottant compact avec vraie animation de sortie, parcours tactile de forfait sans captures natives lourdes et deux offres réellement comparables côte à côte. Ce choix remplace le comparatif mobile à une seule offre. Trois spécialistes mobilisés, puis contrôle intégré à 320/430 px et sur ordinateur. 318 tests passent. Révision `169e3a8` publiée dans `20261116T230338Z-169e3a8b6524`, menu/comparatif/retour vérifiés en HTTPS à 390/430 px ; client et CSS conformes au build. Preuves dans `qa/mobile-safari-2026-11-16/`. Aucun benchmark FPS ou test Safari matériel revendiqué.

# Animation du logo et mobile — 16 novembre 2026

Publié et contrôlé en HTTPS : introduction de 720 ms du logo, chargement orbital réel, mouvement réduit, lien Aller au contenu seulement au clavier, fond racine continu, correction des barres fixes et retour au forfait courant sur mobile. Les autres positions d'historique et les fiches privées restent protégées.316 tests passent ; parcours IAB 320/390 et captures dans `qa/mobile-2026-11-16/`. Révision `84f34bc96601ef7065a30de9a7e1a3d4abc49f33`, release `20261116T222847Z-84f34bc96601`. Ancres de l’accueil alignées sur le routeur, aucune alerte console finale. Localhost fermé.

Le signalement Premium/zone blanche du comparatif est examiné dans ce lot : aucune quatrième colonne stable reproduite, mais affichage d'un forfait entier à côté des intitulés fixes, onglets et swipe conservés, cible bornée au tableau et rebond horizontal supprimé. Pas de validation Safari physique ni de benchmark FPS revendiqués.

# En attente après la correction de l'accueil — comparatif, 16 novembre 2026

Signalement de Mathis à traiter ensuite, pas encore reproduit ni corrigé dans ce lot :

1. Sur le tableau de comparaison des forfaits.
2. Après « Comparer forfait », puis le choix « platinum » (terme employé par Mathis ; vérifier la correspondance avec Premium / 3D).
3. Le tableau défile complètement vers la droite.
4. Une zone blanche apparaît, comme si une quatrième colonne de forfait existait.

Vérifier le défilement horizontal et les largeurs des colonnes/onglets sur mobile, en tenant compte du chantier mobile déjà en cours. Mathis demande explicitement de mettre ce point en file d'attente pour après la correction actuelle de l'accueil. Aucun correctif ni contrôle de reproduction ne doit être déduit de cette note.

# Accroche sur les agences publiée — 16 novembre 2026

À la demande réitérée de Mathis, l'accroche « Jusqu’à 40 % moins cher qu’une agence traditionnelle » est maintenant publiée au-dessus de Choisir mon forfait, première partie en gras dans un encart adapté au mobile. Cette décision remplace la mise en brouillon du lot précédent. Texte sur mesure et description SEO conservés, prix et trois bénéfices toujours retirés du hero.

Lot `1a85add`, 290 tests sur export propre, contrôles IAB locaux et HTTPS ordinateur/mobile réussis. Preuves dans `qa/agency-saving-2026-11-16/`, livraison dans `../ops/DEPLOYMENT_STATUS.md`. Le défaut du comparatif décrit en tête reste en attente dans ce lot.

# Correction de l'accueil publiée — 16 novembre 2026

Lot `a056e8f` publié et vérifié : prix et trois bénéfices retirés du hero ; description SEO à partir de 890 € conservée. Introduction remplacée par « Nous concevons et créons votre site internet sur mesure pour présenter votre activité, faciliter les prises de contact ou faire découvrir votre univers en 3D. ». La comparaison « jusqu'à 40 % moins cher qu'une agence » reste en brouillon sans comparaison de prestations équivalentes établie.

290 tests passent sur l'export propre du commit. Contrôles IAB locaux et HTTPS bureau/mobile réussis, sans débordement ni alerte console observée. Preuves dans `qa/hero-correction-2026-11-16/`, livraison dans `../ops/DEPLOYMENT_STATUS.md`. Le signalement du tableau ci-dessus reste en attente et n'est pas inclus dans cette correction.

# Première accroche et description commerciales publiées — 16 novembre 2026

Lot `3859453` publié : description SEO « Votre site internet personnalisé à petit prix, à partir de 890 €. Design adapté à votre activité, mobile et mise en ligne compris. » et trois arguments courts avant Choisir mon forfait. Prix réel du catalogue, sans changement de tarifs ni de prestations ; les formats CHF et sur devis restent fonctionnels. Favicon transparent et logo SVG conservés.

L'hypothèse de 40 % vise les agences ; cinq offres ont été lues, sans moyenne représentative à périmètre égal. Le calcul 890 € contre 1 500 € donne 40,7 %, mais ce scénario n'est pas publié comme une statistique de marché. Rapport interne `qa/commercial-2026-11-16/comparaison-agences.html` ; preuves et captures dans le même dossier. 290 tests et contrôles HTTPS ordinateur/mobile réussis. Voir `../ops/DEPLOYMENT_STATUS.md`.

# Favicon transparent — 16 novembre 2026

Publié et contrôlé : fond blanc retiré des exports PNG et ICO ; seules les trois bandes du symbole restent visibles, avec transparence autour et entre elles. Liens versionnés pour renouveler le cache. SVG et logo de navigation inchangés. Révision applicative `e113bf17cda5d970cfa444fd4b041c03f5096ba0`, 290 tests passants, huit ressources HTTPS conformes, head contrôlé dans l'IAB. Localhost fermé. Preuves : `qa/favicon-transparent-2026-11-16/`.

# SEO et IA publiés — 16 novembre 2026

Lot `a4fead9` publié sur gilmathis.com et contrôlé sur les neuf routes publiques. Vrai HTML initial, styles de route, tarifs serveur et hydratation ; métadonnées centralisées, données structurées, image sociale et cache des fichiers hashés. Les comptes et URL privées restent hors indexation/pré-rendu. Les mentions sont des pages dédiées accessibles par le pied de page ; les identités et leur texte définitif restent à fournir ultérieurement par Mathis.

290 tests passent. PageSpeed mobile après publication : 100 SEO, 96 performances et LCP 0,9 s. Search Console du domaine non accessible au compte ouvert ; indexation et citations IA non attestées. Rapport `SEO_IA_2026-11-16.md`, état de livraison `../ops/DEPLOYMENT_STATUS.md` et preuves `qa/seo-ai-2026-11-16/`. Logo SVG approuvé conservé. Localhost et Tailscale arrêtés après contrôle.

# Logo Pixelito SVG — 16 novembre 2026

Publié et vérifié en HTTPS : logo à trois bandes choisi par Mathis, remplacé dans la barre, le menu mobile, le pied de page et les composants de l'espace privé/chargement. Véritables SVG sans bitmap intégré : `logo-pixelito.svg`, `logo-pixelito-symbole.svg` et `logo-pixelito-typo.svg`. Groupes et fichiers séparés, lettres en tracés. Favicon et icônes mobiles dérivés du symbole. Les anciennes images de marque restent uniquement en archives documentaires.

Révision applicative `ca178280eed0026379524620a6fa016ed07d08ea`, release `20261116T204453Z-ca178280eed0`. Les 284 tests passent ; contrôle IAB bureau/mobile et seize vérifications HTTPS. Retour en haut conservé, aucun débordement à 320 px, aucune erreur console observée sur le site publié. Localhost fermé et Tailscale remis arrêté. Preuves : `qa/brand-2026-11-16/`. Les travaux légaux et SEO concomitants ne sont pas publiés dans cette release.

# Mentions légales — 16 novembre 2026

Codé localement : liens Mentions légales et Confidentialité dans le pied de page, retour à la ligne des liens sur les écrans étroits, intitulé de page et titre SEO « Mentions légales ». La route Conditions garde son propre titre. Les textes légaux restent provisoires et hors indexation ; aucune publication de ce lot.

Le fonctionnement à deux micro-entreprises et le texte proposé sont documentés dans `MENTIONS_LEGALES.md`. Les coordonnées des deux entrepreneurs, l'identité de l'éditeur, le responsable de publication et l'hébergeur sont demandés à Mathis avant finalisation. Validation et captures : `../design-qa.md`.

# Changer : taille fixe et menu animé — 11 novembre 2026

La copie du bouton affichée pendant la transition était environ 3 px plus haute que le vrai bouton. Les deux mesurent désormais 88,875 × 32 px avec la même hauteur de ligne, y compris après le passage sur un autre forfait et sur mobile. Le panneau s’anime réellement à l’ouverture et à la fermeture (240/200 ms), sans étirer son texte. Le sens s’inverse quand le menu est placé au-dessus du bouton.

La réouverture rapide est protégée contre le menu encore en sortie. Clics rapides, Escape, clic extérieur, choix de forfait et mouvement réduit vérifiés. Révision `1c5d757` publiée et contrôlée en HTTPS. Les 284 tests passent. Capture `../outputs/audit-ergonomie-2026-11-10/59-changer-menu-anime-public.jpg`, mesures 57 et 58. Localhost arrêté.

# Fonctionnalités et menu Changer — 11 novembre 2026

La copie visible parle de « fonctionnalités » : résumé, compteur, boutons, formulaire, FAQ, titres, SEO, espace client et erreurs. La catégorie auparavant « Vos fonctionnalités » devient « Services en ligne ». Les anciens « en option » sont reformulés, sans toucher aux prix ou périmètres. Les identifiants et routes techniques sont conservés.

Le décalage à l’ouverture de Changer provenait du verrouillage du défilement et de sa compensation de 15 px. Le menu non modal garde les positions et largeurs identiques à l’ouverture et à la fermeture, vérifiées sur ordinateur et mobile. Le fond/la bordure s’animent en 180 ms et le chevron en 220 ms, avec respect du mouvement réduit. Escape et le choix de forfait fonctionnent.

Révision `b874327` publiée et contrôlée en HTTPS. Les 284 tests passent. Capture `../outputs/audit-ergonomie-2026-11-10/55-fonctionnalites-changer-public.jpg`, mesures 54 et 56. Localhost arrêté après validation.

# Netteté des aperçus et boutons — 11 novembre 2026

Les trois boutons sous les offres affichent seulement « Configurer », avec le nom du forfait conservé pour les lecteurs d’écran. Les aperçus utilisent le master sans perte de 1536 px sur écran haute densité, sur les grandes cartes de présentation et au survol/focus/capture, au lieu de conserver systématiquement l’export compressé de 768 px. Le cadrage validé et les originaux restent inchangés. Le master de la grande carte reste limité à sa définition native ; le nouvel essai imagegen, sans gain de dimensions et moins fidèle, est écarté.

Révision `8db44f9` publiée et vérifiée en HTTPS, sur ordinateur et mobile, avec contrôle de la source à DPR 2 émulé. Les 284 tests passent. Capture `../outputs/audit-ergonomie-2026-11-10/52-configurer-hd-public.jpg`. Localhost arrêté.

# Même image pendant l’agrandissement — 11 novembre 2026

Les trois forfaits partagent leur cadrage entre petite carte, bouton du comparatif et grande carte. Business garde notamment le vert en haut à droite. Correction du miroir ignoré sur la grande carte, des recadrages et du traitement de couleur divergents. L’image s’agrandit proportionnellement pendant la transition ; l’ajout d’options ne la redimensionne pas à largeur constante. Les originaux sont conservés. Les textes gardent leur propre calque net.

Le Retour du navigateur normalise aussi le sens des extrémités fournies par React Router pour conserver le raccord natif, sans fondu parasite. Le recentrage sur les offres est conservé. Révision `dd28af2` publiée et vérifiée en HTTPS sur ordinateur, grand écran et mobile. Les 284 tests passent, dont huit nouveaux sur les trajets de navigation. FAQ simplifiée toujours présente. Captures et mesures dans `../outputs/audit-ergonomie-2026-11-10/` (45 à 49). Localhost arrêté après validation.

# Mention de reprise simplifiée — 11 novembre 2026

Dans « Qui prépare les textes et les photos ? », les limites de reprise et la distinction avec la rédaction sont remplacées par « Une option de reprise de votre ancien site est également disponible. ». Révision `830b1ef` publiée et vérifiée en HTTPS sur ordinateur et mobile. Les 276 tests passent. Localhost arrêté après contrôle local.

# Essai d’agrandissement et FAQ détaillée — 11 novembre 2026

Un clic sur Configurer dans le tableau agrandit sa surface vers la carte du forfait. Un clic sur une carte de base garde le départ depuis cette carte. Les images et les textes ne sont pas étirés, le clavier fonctionne et la préférence de mouvement réduit désactive l’effet.

La première réponse de FAQ détaille Hébergement 19 €/mois (site, SSL et disponibilité), Maintenance 39 €/mois (hébergement, mises à jour, sauvegardes et petites modifications de contenus existants), Sérénité 69 €/mois (Maintenance, une heure de modifications par mois et support prioritaire). La mise en ligne comprise et le caractère facultatif du suivi restent précisés.

Révision `9eb5048` publiée et contrôlée en HTTPS sur ordinateur et mobile. Les 276 tests passent. Aucun formulaire envoyé ni option ajoutée. Localhost arrêté.

# Retrait de la rubrique réalisations/tarifs/avis — 11 novembre 2026

La ligne « Rubriques réalisations, tarifs et avis clients » et son explication sont retirées du comparatif. La présentation Business ne promet plus ces rubriques. Le CMS reste inclus dans Business et Premium / 3D.

L’ancienne galerie n’est plus ajoutée aux nouvelles configurations et devis de ces offres. Les brouillons publics la retirent en conservant leurs autres choix ; les dossiers historiques qui la portaient gardent leur ancienne inclusion gratuite. Prix inchangés. Révision `5601f8b` publiée et contrôlée en HTTPS sur ordinateur et mobile. Les 276 tests passent. Localhost arrêté.

# Fond uniforme du tableau publié le 11 novembre 2026

Les fonds différents en début de groupe et le survol violet sont retirés du corps du comparatif. Toutes les cellules restent blanches et les séparateurs ont la même épaisseur fine. Les libellés de groupes sont conservés. Révision `c6e1a70` publiée et contrôlée en HTTPS sur ordinateur et mobile. Les 273 tests passent ; localhost arrêté.

# Tableau et retours recentrés publiés le 11 novembre 2026

La correction du tableau auparavant conservée en local est publiée. Le cadre et l’en-tête sticky ne sont plus découpés par un masquage d’ancêtre ; le corps et la ligne interne de l’en-tête portent le masquage. Les bordures et coins supérieurs restent sur les cellules pendant la remontée.

Le retour depuis une carte ou un bouton du comparatif rejoint les offres sous la navigation, comme après un choix dans la barre. Même comportement avec Retour du navigateur et « Tous les forfaits ». La restauration ne conserve plus la position d’une carte partiellement cachée. Trois tests couvrent les chemins animés, sans animation, après changement de forfait et depuis le comparatif.

Révision `6195cb1` publiée et contrôlée en HTTPS à 1 280 × 700 et sur mobile à 390/320 px. Les 273 tests passent. Aucun formulaire envoyé. Serveur local arrêté, ports 4173 et 4174 libres.

# Carte plus aérée, commune aux deux modes, le 11 novembre 2026

La présentation intermédiaire s’applique en plein écran comme en fenêtre. La hauteur ne déclenche plus de changement de densité ni la disparition des inclusions. Les espacements, titre et prix sont plus grands que dans la première version compacte. Sous 1 200 px de largeur, la carte reste au-dessus des options. Sur une fenêtre basse, son contenu suit le défilement normal sans barre interne.

Révision `ae40baf` publiée et contrôlée en HTTPS avec onze options : même carte à 1 280 × 700 et 1 280 × 1 100, puis vérification mobile à 320 × 740. Les 270 tests passent.

En parallèle, la reprise locale du comparatif retire les découpes autour du cadre et de l’en-tête sticky. Le masquage natif agit sur la ligne interne de l’en-tête pour éviter un ancien rognage JS en remontant. Défilement local contrôlé en entrée, sortie et remontée, avec détails ouverts et fermés, puis sur mobile. Cette reprise n’est pas publiée, conformément à la consigne de Mathis.

# Carte adaptée aux fenêtres réduites le 10 novembre 2026

La carte se compacte selon la hauteur de la fenêtre sur ordinateur. Elle conserve le titre, les options choisies et leurs prix, le total et le suivi mensuel. Les descriptions détaillées restent dans les choix à droite. Sous 1 200 px de largeur, la carte passe au-dessus des options.

Révision `8c06298` publiée et vérifiée en HTTPS avec les onze options de la capture à 1 200 × 700 : carte entière visible, sans défilement interne. Disposition empilée contrôlée à 1 100 × 700 et sur mobile à 320 × 740. Les 270 tests passent.

À la demande explicite de Mathis, la nouvelle reprise de la bordure du comparatif en scroll vers le haut n’a pas été publiée. Elle reste en local, et le défaut public reste à traiter.

# Défilement, configurateur et libellés publiés le 10 novembre 2026

Le masquage du comparatif suit le défilement natif dans les navigateurs compatibles pour garder sa bordure supérieure à la remontée. La carte du configurateur suit 128 px plus bas et s’arrête à 24 px du pied de page. Le menu défile avec les pages de configuration. La durée des rubriques d’options passe à 372 ms.

Après un forfait choisi dans le menu de l’accueil, Retour revient à la section des offres. Le menu mobile se ferme au choix du forfait. Le lien et le titre de la méthode affichent « Les étapes du projet ». La première inclusion Premium affiche « Business inclus · pages à définir » sur une ligne. Version finale `f2d2a2a` publiée et contrôlée en HTTPS.

# Reprise du cadre du comparatif le 10 novembre 2026

Le contour supérieur est porté directement par les cellules de l’en-tête. Le cadre se ferme à la dernière ligne pendant le passage vers la FAQ. Le défilement a été contrôlé dans les deux sens, avec les détails ouverts, sur ordinateur et mobile. Révision `4271b3d` publiée et vérifiée en HTTPS.

# Contour arrondi de l’en-tête fixé le 10 novembre 2026

La bordure supérieure et les coins arrondis suivent l’en-tête du comparatif pendant le défilement. Révision `6e224d7` publiée et vérifiée en HTTPS sur ordinateur et mobile.

# En-tête complet du comparatif fixé le 10 novembre 2026

L’en-tête du tableau est fixé en bloc et les lignes disparaissent à son bord inférieur pendant le défilement. Le masquage est calculé sur la position réelle de l’en-tête. La révision `c711885` est publiée et vérifiée en HTTPS à 1 280 et 320 px.

# Défilement du comparatif corrigé le 10 novembre 2026

Les lignes et bordures du comparatif disparaissent au bord inférieur de la navigation flottante. L’en-tête des forfaits suit le défilement et ses boutons restent accessibles. La révision `3d9cb35` est publiée et vérifiée en HTTPS à 1 280 et 320 px.

# Navigation flottante, animation et estimation corrigées le 10 novembre 2026

Le menu arrondi suit le défilement jusqu’au pied de page sur ordinateur et mobile, avec son conteneur transparent. L’ouverture et la fermeture des rubriques durent 620 ms. « Environ » additionne le milieu des fourchettes et le prix affiché pour les options fixes ou sans borne haute. Les onze choix de la capture donnent 3 115 € à la création et 69 €/mois. Révision `7dd2283` publiée et contrôlée en HTTPS à 320 et 1 280 px.

# Navigation et bouton des détails corrigés le 10 novembre 2026

La navigation défile avec la page sur ordinateur et mobile. L’entrée « Comparer les forfaits » est retirée du menu Forfaits. Le bouton « Afficher plus de détails » retrouve son emplacement et sa largeur sous le tableau. Révision `eb69877` publiée et vérifiée en HTTPS à 320 et 1 280 px.

# Ergonomie et navigation fixe publiées le 10 novembre 2026

Le configurateur affiche « Environ » après la sélection d’une option, garde le prix visible lors du défilement et anime les rubriques dans les deux sens. La galerie retire le paragraphe demandé. Les commandes du comparatif précèdent le tableau et les raccourcis mobiles défilent jusqu’au forfait voulu. Un lien de forfait invalide préserve le brouillon. La navigation reste visible sur mobile et ordinateur.

Révisions `cfd8f27` et `1ff76cf` publiées. La dernière version a été vérifiée en HTTPS à 320 et 1 280 px. Les 270 tests passent.

# Retours UX publiés le 10 novembre 2026

En-tête du comparatif visible au défilement, rubriques d’options exclusives et montant indicatif unique dans le configurateur public. Vitrine affiche jusqu’à 3 pages, Business jusqu’à 6 et Premium / 3D un périmètre adapté au projet. Le rendu des textures dissocie le retournement de l’image et le filtre de couleur. L’accueil présente les étapes dans un bloc dédié et la FAQ rejoint la navigation principale.

La revue a également corrigé un bouton du comparatif qui pouvait passer sous la colonne « Fonctions » en revenant au clavier sur mobile. Révision `8ff63f3` publiée et vérifiée en HTTPS à 320 et 1 280 px. Contrôles TypeScript, build et 270 tests réussis.

# FAQ simplifiée le 9 novembre 2026

Huit réponses ont été retouchées. La FAQ invite à échanger sur les contenus à reprendre, sur le regroupement de petites pages et sur le modèle 3D avec le modélisateur. Les réponses sur la langue supplémentaire, le paiement, la 3D et les rendez-vous décrivent les prestations. Les deux lots `7281f15` et `d1e203f` sont publiés. La version finale a été vérifiée en HTTPS à 320 et 1 280 px. Les 270 tests passent.

# Réponse sur les frais après création publiée le 9 novembre 2026

La mention du nom de domaine, des abonnements externes et des frais du prestataire de paiement a été retirée de la réponse sur les frais après création. Révision `65380cb` vérifiée dans la FAQ à 1 280 px et sur l’accueil à 320 px. Les 270 tests passent.

# Textes de suivi et lien Addiction Agency publiés le 9 novembre 2026

Les descriptions de Maintenance et Sérénité et leur réponse de FAQ présentent les prestations comprises. La carte Addiction Agency ouvre `https://addiction-agency.com/`. Révision `88e0cd8` vérifiée en HTTPS sur ordinateur et mobile. Les tarifs de suivi restent à 19, 39 et 69 €/mois. Les 270 tests passent.

# Offres et étapes de l’accueil publiées le 8 novembre 2026

Premium / 3D démarre à 2 490 €. Business affiche « CMS pour gérer vos textes et images » et l’espace membres est disponible en option dès Business. Les deux choix ont été retirés du parcours public Vitrine et de la reprise de ses brouillons. L’accueil explique le choix du forfait, l’envoi du projet et l’échange avec un développeur avant le démarrage. Révision `693aca5` vérifiée en HTTPS sur ordinateur et mobile. Les 270 tests passent.

# Adresse e-mail professionnelle publiée le 8 novembre 2026

La mise en place d’une boîte sur le domaine du client et son raccordement au formulaire sont compris dans Business et Premium / 3D, avec le service de messagerie séparé. Vitrine ne propose pas cette option. La révision `29bb86d` a été vérifiée en HTTPS sur ordinateur et mobile, et les 270 tests passent.

# Prise de contact de l’expert publiée le 8 novembre 2026

La note indique que l’expert contactera le client pour adapter l’offre à ses besoins. Révision `dc4a18d` vérifiée en HTTPS sur trois lignes à 320 px et deux à 1 280 px. Les 269 tests passent.

# Paragraphe sous le prix publié le 8 novembre 2026

La carte affiche le prix indicatif et invite le client à préciser ses besoins et demandes particulières pour être guidé par l’expert. Le paragraphe suit la largeur de la carte. Révision `03e7a8f` vérifiée en HTTPS à 320 et 1 280 px. Les 269 tests passent.

# Mention de prix sur trois lignes publiée le 8 novembre 2026

La carte du configurateur affiche le prix indicatif, invite à décrire les besoins et propose le conseil de l’expert en trois lignes. Le texte sous « Continuer » est retiré. Révision `513b18c` vérifiée en HTTPS à 320 et 1 280 px. Les 269 tests passent.

# Survol, options et estimation publiés le 7 novembre 2026

Le bouton « Configurer » révèle l’image au survol du bouton. Les deux zones ouvrent le forfait. Premium affiche la 3D interactive et la langue supplémentaire comprend la traduction par l’équipe. Les descriptions des options connexes sont simplifiées. La boutique replie la ligne des liens de paiement, dont le supplément est retiré immédiatement. Sous « Continuer », un message indique qu’un expert peut recommander une formule moins chère si elle convient au projet.

Premium avec un élément 3D supplémentaire et la création du modèle affiche 2 899–3 249 €. La fourchette compte le modèle à son prix de départ de 150 €, avec mention à côté du total. Le devis garde son plafond ouvert. Révision `5f88936` publiée et vérifiée à 1 280 et 320 px. Les 269 tests passent.

# Réinitialisation des options publiée le 7 novembre 2026

Les cartes explicitent les inclusions de Vitrine dans Business et de Business dans Premium. Le blog comprend une rubrique et un éditeur pour les articles du client. Le nombre de pages supplémentaires se règle dans la même case que le prix par page. Le bouton réinitialise les options et le changement de forfait revient au nouveau forfait de base avec les rubriques dans leur état initial.

Révision `6aae31c` vérifiée en HTTPS sur ordinateur et à 320 px. Deux pages Business donnent 1 610–1 730 €. La réinitialisation revient à 1 490 € et le passage à Premium repart de 2 499 €. Les 268 tests passent.

# Forfaits cumulatifs publiés le 7 novembre 2026

Business reprend Vitrine. Premium / 3D reprend Business et inclut la reprise de 5 pages et 15 médias. Les cartes et le comparatif montrent les prestations ajoutées. Les précisions de périmètre sont près des options. « Inscription à la newsletter » et « Le prix est donné à titre indicatif » apparaissent dans le parcours public.

Les tarifs validés restent en vigueur. À 6 pages, Vitrine avec CMS sur 5 pages et statistiques est estimé à 1 430–1 610 €. Avec le repère de 180–350 € pour le référencement local de la grille de Mathis, cela donne 1 610–1 960 € avant les rubriques dédiées et le complément de CMS. À 10 pages, Business avec reprise et intégration 3D simple est estimé à 2 080–2 820 €. Les animations avancées, la fluidité et l’accompagnement sont à chiffrer au devis pour comparer à périmètre égal. La règle commerciale est dans `AGENTS.md`.

Révision `f7336f2` publiée et vérifiée en HTTPS à 1 280, 390 et 320 px. Les 268 tests passent. Le passage de Business à Premium absorbe la reprise dans le forfait. Aucun formulaire envoyé en production.

# Défilement de la navigation publié le 7 novembre 2026

La barre publique défile avec la page. Les ancres disposent d’un retrait de 24 px et la carte conserve son ancrage sur ordinateur. L’animation utilise la position de la barre au moment du changement de page.

Révision `408754b` publiée et contrôlée. Le recouvrement de la carte est passé de 64 à 0 px dans le scénario vérifié. Le menu et le formulaire sont utilisables à 390 px. La page tient dans sa largeur à 320 px. TypeScript, build et 268 tests passent. [Contrôles publics](qa/navigation-2026-11-07/).

# Langue, comparatif et carte publiés le 7 novembre 2026

L’option Langue supplémentaire à 100 € couvre cinq pages sur Vitrine et six sur Business et Premium / 3D, avec les textes traduits fournis. Le même périmètre apparaît dans le configurateur, la FAQ et les nouvelles estimations. Le comparatif présente les inclusions Vitrine, puis Business, puis Premium / 3D. La carte du configurateur affiche les points clés, les choix et le prix à la hauteur de leur contenu.

Le configurateur donne 1 310–1 370 € pour quatre pages Vitrine avec CMS et statistiques, 1 370–1 490 € pour cinq et 1 430–1 610 € pour six. Le lot CMS Vitrine couvre cinq pages. Business démarre à 1 490 € avec CMS sur les pages du forfait et référencement local.

Révision `3e543b2` en ligne et contrôlée dans le navigateur intégré à 320, 390 et 1 280 px. TypeScript, build et 268 tests passent. [Contrôles publics](qa/forfaits-2026-11-07/).

# Corrections publiées et contrôlées — 6 novembre 2026

Les deux bugs techniques sont corrigés : chargement différé avec récupération française et envoi borné à 30 s, saisie/idempotence conservées. Quantités de pages, limites des options, estimations et CMS cohérents ; prix validés conservés. Arguments renforcés et FAQ portée à 18 questions. Deux défauts supplémentaires corrigés : retour privé de cinq à une page et largeur minimale à 320 px avec scrollbar.

Application `dbcd9e3` en ligne, client `/assets/index-CcPXBE2O.js`. TypeScript, build et **268 tests** passent. Vérifications IAB ordinateur/mobile, y compris 320/390/820/1280 px ; pas d’erreur console observée. Deux enregistrements locaux seulement, aucun e-mail de test ni soumission en production. Données privées et 24 autres services inchangés. Localhost arrêté. [Rapport et preuves](qa/fixes-2026-11-06/REVIEW.md).

Restent les informations réelles déjà signalées : destinataire des notifications et informations légales définitives. Les sections suivantes conservent l’historique.

# Clarté des détails et revue critique — 6 novembre 2026

Quinze fonctions expliquées dans le comparatif, « Photos de réalisations, tarifs et avis clients », CMS explicite dans Business et Premium et dans l’option Vitrine. Descriptions sans répétition des forfaits déjà indiqués par les coches. Formulaire bref et confirmation de rappel développeur dans les deux parcours, après enregistrement réussi.

TypeScript, build et 251 tests passent. Deux demandes enregistrées uniquement dans une base locale isolée, e-mail désactivé : confirmations Contact et Business observées, mobile et focus d’erreur vérifiés. Revue critique actuelle, sources primaires et captures dans `docs/qa/critical-review-2026-11-06/REVIEW.md`. Les défauts de robustesse et les décisions commerciales y sont distingués des corrections effectuées. Publié : `69a44d5`, client `/assets/index-ClTsqN9B.js`, contrôlé dans l’IAB public à 320/390/820/1280 px. Descriptions/CMS/champ bref vérifiés, aucune erreur de console observée. Données et 24 autres services inchangés ; localhost arrêté.

Les sections suivantes conservent l’historique.

# Derniers ajustements — 6 novembre 2026

Vitrine : 1 à 3 pages, à partir de 890 €. Business : 1 à 6 pages, à partir de 1 490 €, badge « Populaire », CMS mis en premier argument. Premium / 3D : 1 à 10 pages, à partir de 2 499 €, tout Business et son CMS, prestations visuelles et demandes sur mesure étudiées. Aucune mention de template, Doctolib ou formulaire avancé dans les offres. Prise de rendez-vous générique en option sur les trois forfaits, 90–180 €. FAQ portée à 17 questions ; champs de contact courts et suivis 19/39/69 € conservés.

Prix sans fourchette préfixés « À partir de » ; fourchettes et mensualités préservées. Image continue entre le haut des cartes et le bouton Configurer, Premium plus vif. TypeScript, build et 251 tests passent. Une contre-revue indépendante n’a pas trouvé de nouvelle régression métier. Révision `c4c1a64` publiée et contrôlée dans l’IAB à 320/390/820/1280 px, sans erreur de console observée. Localhost arrêté. Publication et preuves finales dans `docs/qa/cumulative-offers/review.md` et `ops/DEPLOYMENT_STATUS.md`.

Les sections suivantes conservent l’historique des décisions précédentes.

# Trois forfaits — publiés et vérifiés le 6 novembre 2026

Vitrine 890 €, Business 1 490 €, Premium / 3D 2 499 €. Douze options retenues et détaillées, prix variables et totaux en fourchette, trois suivis mensuels exclusifs, formulaire court, Cal.com retiré. Langue supplémentaire générique, fonctions incluses hors des choix payants, comparatif valorisant Business. FAQ enrichie à seize questions avec sources primaires vérifiées.

Dix spécialistes techniques/éditoriaux, puis deux spécialistes stratégie commerciale/rentabilité. Corrections supplémentaires : migration des anciens brouillons Connecté, focus après annulation de navigation, contraste des champs facultatifs, footer mobile et prolongement des très longues cartes Premium. Prix approuvés conservés.

TypeScript, build et **241 tests passent**. Contrôles locaux IAB 320/390/820/1280 px, formulaires et navigation. Révision applicative `c5f499fc55bd` publiée et contrôlée dans l’IAB public, sans erreur/alerte console observée. Les données privées et les 24 autres services sont inchangés ; localhost arrêté. Le destinataire e-mail et les informations légales restent à compléter. L’état précis de la livraison est dans `ops/DEPLOYMENT_STATUS.md` et `docs/qa/three-offers/review.md` (liens depuis la racine du dépôt). Les entrées suivantes sont historiques.

## GitHub Actions uniquement manuel — 5 novembre 2026

Mathis demande l’arrêt des exécutions et notifications automatiques de `Check application`. Les déclencheurs `push` et `pull_request` sont remplacés par `workflow_dispatch` : le contrôle reste lançable manuellement depuis GitHub. Les commandes de vérification locales sont conservées. Changement limité à la configuration du dépôt, sans déploiement applicatif.

## Revue Astra des prix et du code — publiée et vérifiée, 5 novembre 2026

Six missions Astra, contre-revue indépendante et contrôle parent. 6 forfaits/services et 26 options étudiés à partir de sources réelles, prix proposés non publiés. Périmètres/frais clarifiés, références catalogue corrigées, fusion des en-têtes API corrigée. Comparatif/FAQ/prix extraits pour faciliter les modifications ; anciennes règles d’animation retirées, guide actualisé. TypeScript/build et 230 tests passent ; 24 trajets ordinateur/mobile et interactions rapides contrôlés dans l’IAB. Rapport : `qa/astra-review/review.md`. Publication `5b792f1`, release `20261106T050603Z-5b792f1fcbab` : 24 trajets publics passent, prix préservés, sauvegarde réussie, autres services inchangés. Localhost arrêté. Détail dans `ops/DEPLOYMENT_STATUS.md`.

## Revue critique des prix, options et fiabilité — publiée et vérifiée, 5 novembre 2026

Neuf spécialistes ont réalisé les cinq critiques, deux recherches de bugs, une revue des animations et le contre-audit. Newsletter/statistiques disponibles, langues et SEO local transversaux, galerie Connecté, quatre précisions facultatives conditionnelles ; statut du devis, coûts des outils et FAQ alignés. Bugs UTF-8 des fichiers privés et réponses API illisibles corrigés ; catalogue partiel refusé sans casser les pages. FAQ progressive et interruptible, focus du lien d'évitement et noms des liens de galerie précisés. TypeScript/build et 228 tests passent ; 24 trajets IAB locaux, longue sélection de 17 choix et demande locale isolée vérifiés. Publié : `43b5fce`, release `20261106T035942Z-43b5fce8a17a` ; 24 trajets publics, menus et FAQ contrôlés en HTTPS sur ordinateur/mobile. Prix de production conservés, sauvegarde réussie et 24 autres services inchangés. Aucun envoi public, choix/viewport restaurés, localhost arrêté. Les prix révisés restent des propositions. Rapport : `qa/site-review-v2/review.md`.

## Ouverture et fermeture des six cartes — publiées et vérifiées, 5 novembre 2026

Image opaque, masque des quatre bords porté par le groupe natif, résumé et total coordonnés, titres séquencés au retour et vrai bouton Changer hors capture. Cas du comparatif sans miniature traité. Révision applicative `b261ffa`, release `20261105T205039Z-b261ffad11fb`. Les 24 trajets passent dans l’IAB local et public ; clic rapide public confirmé. TypeScript/build et 213 tests passent. Treize empreintes publiques conformes, catalogue et 24 autres services inchangés. Images originales identiques. Aucun formulaire envoyé, viewport réinitialisé et localhost arrêté. Rapport : `docs/qa/card-motion-polish/review.md`.

## Taille stable et transitions coordonnées — publiées et vérifiées, 5 novembre 2026

La présentation compacte au cinquième choix faisait rétrécir titre et carte : elle est supprimée. Le résumé grandit sans modifier la typographie ; gutter stable évitant les changements de largeur. Six allers-retours sur 760 ms, page entrante utilisable, mouvements de souris sans interruption et aucun second fondu à l’arrivée. Image et retrait inchangés. Les 24 trajets ordinateur/mobile, les douze options, le retrait et les actions rapides passent dans l’IAB local. Publié : `57aacc2`, release `20261105T090925Z-57aacc2a6ad6`. Six allers-retours recontrôlés en public sur ordinateur et mobile, tailles stables, neuf empreintes HTTPS conformes, 25 autres services inchangés. Choix/viewport restaurés et localhost arrêté. TypeScript, build et 213 tests passent. Rapport : `qa/stable-motion/review.md`. Nouveau run GitHub 42000019786 toujours empêché par la facturation du compte avant tout runner ; action nécessaire du titulaire.

## Retrait et replacement animés — publiés et vérifiés, 5 novembre 2026

Dernière demande : corriger la disparition et le replacement instantanés, puis démarrer l’alternance à gauche après les blocs de trois. L’action garde les calculs immédiats ; une copie décorative sort en fondu pendant que les lignes réelles glissent vers leurs nouveaux emplacements. Hauteur du résumé animée et mouvements interruptibles, sans défilement interne ni changement de l’image. Publié : révision `ab76cb2`, release `20261105T065746Z-ab76cb297058`. TypeScript/build et 213 tests passent. IAB public : glissements horizontal et vertical mesurés, fondu de sortie, zéro copie résiduelle, image fixe, absence de console/débordement ; choix initiaux restaurés et localhost arrêté. Santé et neuf empreintes HTTP vérifiées. GitHub examiné ensuite : dernier run sans runner ni étape, compte verrouillé pour facturation. Le titulaire doit lever ce blocage avant une relance ; rapport dans `qa/option-reflow/ci-diagnosis.md`.

## Ordre explicite des options — publié et vérifié, 5 novembre 2026

Le rééquilibrage automatique est remplacé par des cases explicites : trois choix à gauche, trois à droite, puis alternance droite/gauche. La séquence des clics guide la présentation courante ; les calculs et la configuration restent inchangés. Sur carte étroite, une seule colonne garde la même séquence. Les lignes restent montées pour conserver leur entrée/sortie animée. Publié : révision `9486538`, release `20261105T063308Z-94865388d5c2`. TypeScript/build et 213 tests passent. IAB public : les douze étapes de placement sont correctes, même séquence sur mobile, aucun débordement/erreur de console et choix initiaux restaurés. Santé et neuf empreintes HTTP vérifiées ; serveur local arrêté. Preuves dans `qa/option-order/`.

## Résumé sans barre interne — publié et vérifié, 5 novembre 2026

Dernier retour : beaucoup d’options ne doivent pas créer de défilement à l’intérieur de la carte. Résumé en deux colonnes équilibrées quand la largeur le permet, une colonne sur carte étroite. Carte naturellement haute et présentation compacte animée à partir de cinq choix ; ancrage sticky adapté à la hauteur, sans listener de scroll. Le total et chaque option restent dans le flux de la page. Textures et transitions existantes conservées. TypeScript, build et 213 tests passent. Publié : révision `0cdbd93`, release `20261105T061831Z-0cdbd930aa81`. IAB public desktop/mobile et neuf empreintes HTTP contrôlés ; 12 options sans défilement interne, aucune erreur de console. Preuves dans `qa/option-columns/`. Choix publics initiaux restaurés et localhost arrêté.

## Livraison finale publiée et vérifiée — animations et qualité

Version applicative `891bfac`, release `20261105T055902Z-891bfac29685`, publiée sur https://gilmathis.com/ et contrôlée en ligne.

Les six parcours accueil/forfait et leurs retours ont été revus dans l’IAB, sur ordinateur et mobile. Carte native de 520 ms, copies séparées pour garder le texte net, image fixe et prolongement organique sans miroir ; ajout/retrait des options de 620 ms. Grande carte sticky et défilement interne sur ordinateur, hauteur naturelle sur mobile, groupes multiples indépendants. Original haute définition conservé octet pour octet, continuation native 1536 px et versions 1x/2x. Les clics rapides et le clavier interrompent la capture sans perdre la navigation ; annuler un changement conserve le brouillon. TypeScript, build et 213 tests passent après la dernière correction.

Les preuves et les dix interventions spécialisées sont regroupées dans `qa/full-motion/`. La révision effectivement publiée est indiquée dans `../ops/DEPLOYMENT_STATUS.md`. Les prix restent ceux du catalogue existant ; aucun chiffre commercial n’a été inventé. GitHub Actions est bloqué par le compte/la facturation avant même le démarrage d’un runner : voir `qa/full-motion/ci-provenance.md`.

# Suivi des demandes

Version applicative en ligne : `3d4d854` sur https://gilmathis.com/. L’essai Vitrine est publié ; sa définition a été rejetée par Mathis et une version haute définition ainsi que les transitions complètes sont en cours. Les anciens lots ci-dessous constituent l’historique ; les dernières décisions priment.

Traiter les demandes dans l’ordre : terminer le lot en cours, le vérifier, puis prendre le suivant. Une nouvelle instruction rejoint la file ; elle ne remplace pas silencieusement le travail déjà commencé. Les dernières décisions explicites remplacent les anciennes demandes contradictoires.

## Texture haute définition et transitions des six fiches — en cours

Après publication de l’essai généré, Mathis confirme le fonctionnement mais refuse sa faible définition. Repartir du master haute définition et créer une vraie continuation, sans simple agrandissement du fichier généré de 724 px. Conserver les cartes et l’anatomie approuvées, avec Vitrine seule en essai. Terminer aussi les ouvertures et retours des six fiches, la carte sticky et les rubriques indépendantes. Dix interventions distinctes sont demandées ; trois sous-agents peuvent travailler simultanément selon la capacité disponible.

## Essai Vitrine, couleurs, carte sticky et rubriques multiples — 4 novembre 2026, publié

Mathis juge le miroir visible, puis demande de tester directement en ligne l’image générée sur la première carte, Vitrine uniquement. Il souhaite aussi retrouver les couleurs de l’image en configuration, garder la carte à gauche pendant le défilement et ouvrir plusieurs rubriques d’options ensemble. Ces points sont implémentés, publiés et contrôlés dans l’IAB public ; les trois originaux restent conservés. La reprise des transitions aller-retour sur les six fiches est l’étape suivante autorisée. Le retour suivant refuse la faible définition de cette image d’essai.

TypeScript, build et 213 tests passent. Rapport : `qa/vitrine-trial/review.md`. GitHub Actions n’a pas exécuté le run signalé : le compte est bloqué pour un problème de facturation, d’après l’annotation du run ; ce blocage est distinct des vérifications locales et de la disponibilité du site.

## Lot précédent — image fixe, fond prolongé et options plus lentes, 4 novembre 2026

Mathis précise que la texture doit garder sa taille quand la carte s’allonge : ajouter du fond en bas. Le `cover` lié à la hauteur totale de la carte est remplacé par des bandes de hauteur fixe, avec continuation en miroir de la même matière. L’image et sa lumière ne changent plus de taille pendant la sélection ; les fichiers d’origine restent intacts. Les deux instantanés natifs gardent également leur taille propre.

Options ralenties à 620 ms avec fondu de 420 ms et accélération douce. TypeScript, build et 213 tests passent. Application `3d1c08c` poussée, déployée et vérifiée sur gilmathis.com : carte de 580 à 973 px pour zéro à douze options, bande supérieure toujours de 612,1 × 580 px, y compris pendant l’ajout. Mobile : bande de 335 × 500 px pour une carte de 873 px, sans débordement. Ajout/retrait, préférence de mouvement et sélection initiale également contrôlés localement. Client, CSS et textures publics conformes au build ; sauvegarde, Sharp et santé vérifiés, catalogue et autres services inchangés. Choix de départ et réglages rétablis, aucun envoi, console sans erreur/alerte observée et localhost arrêté. Rapport et captures publiques : `qa/fixed-texture/review.md`.

## Lot précédent — fluidité après essai public, 4 novembre 2026

Retour de Mathis : passage accueil → forfait trop brusque, texture étirée pendant l’agrandissement et ajout d’options insuffisamment animé. Agrandissement porté à 520 ms avec accélération progressive ; grande texture révélée à sa taille finale, texte dans une couche distincte au-dessus pour conserver son fondu. Préchargement du module au survol/focus sans attente au clic.

Options dépliées/repliées en 360 ms avec fondu, hauteur de carte progressive, premier/dernier choix et clics rapides gérés. Totaux, mensuel, rubriques et brief suivent des transitions courtes. Préférence de mouvement relue au clic et cadre natif également désactivé en reduced motion.

Application `7b50265` poussée sur `main`, déployée sur Ubuntu et contrôlée dans l’IAB public sur ordinateur/mobile. TypeScript, build et 213 tests passent. Contrôles locaux : six destinations, clics rapides, ajout/retrait mesurés, premier choix, douze options, brief/retour, clavier et changement dynamique de préférence. Contrôles publics : texture non redimensionnée, fondu du texte pendant les 520 ms, ajout et retrait progressifs, premier/dernier choix, options dans la carte sans débordement. Client, CSS et textures publics identiques au build ; sauvegarde, Sharp et santé validés, catalogue et autres services inchangés. Sélection initiale et réglages rétablis, aucun envoi, localhost arrêté. Rapport et captures : `qa/plan-motion-refinement/review.md`.

## Lot précédent — ouverture des forfaits et options visibles, 4 novembre 2026

Demande suivante à l’audit : fluidifier le clic sur un forfait jusqu’à sa grande carte. Puis correction reçue pendant l’implémentation : afficher les options sélectionnées dans la carte, et supprimer le détail replié sous celle-ci.

Transition native de surface en 420 ms, apparition douce du contenu, navigation et contrôles laissés hors des captures pour conserver les clics rapides. Coordination synchrone via le routeur ; vraies ancres, clavier et clics modifiés conservés. Modules publics résolus avant capture de la page cible, y compris à froid. Animations réduites selon la préférence système ; fallback sans API native. Textures d’origine identiques octet pour octet.

Options choisies affichées dans la carte au-dessus du total, mises à jour à la sélection/désélection et visibles aussi au brief. Carte extensible, arrêt de sticky si sa hauteur dépasse l’espace disponible. Contrôles IAB ordinateur/mobile, douze options visibles, aucune largeur débordante, retour au brief et refus de quitter conservant la saisie. Prix, données et logique d’envoi inchangés ; aucune demande envoyée. Rapport : `qa/plan-transitions/design-qa.md`.

État de livraison : application `3e8bd12` poussée sur `main`, déployée sur Ubuntu et vérifiée sur gilmathis.com à la demande de Mathis. TypeScript, build et 213 tests passent. Build Express local : six destinations, clics rapides, clavier, Cmd+clic, reduced motion et garde du brief vérifiés. IAB public : transition mesurée à 420 ms, options dans la carte sur ordinateur/mobile sans débordement, console sans erreur/alerte observée. Client, CSS et textures publics identiques au build ; sauvegarde réussie, santé valide et autres services inchangés. Sélection et réglages rétablis, aucun envoi, localhost arrêté. Détails et captures : `qa/plan-transitions/public-review.md`.

## Audit général et transparence des prix — 4 novembre 2026, audit terminé

Cinq avis indépendants, puis cinq relectures d’un corpus anonymisé et arbitrage du coordinateur. Sources actuelles relues et parcours publics contrôlés dans l’IAB sur ordinateur/mobile, sans soumission. Rapport : `qa/general-council-2026-11-04/rapport-general.md` ; parcours visuel numéroté : `qa/general-council-2026-11-04/design-qa.md`. Les avis initiaux sont conservés et scellés par SHA-256.

Objectif exprimé : connaître son budget avant contact, avec une estimation aussi proche que possible du prix final, et éviter les suppléments inattendus. Recommandation à arbitrer : prix forfaitaires et options en euros au premier plan ; heures surtout internes, éventuellement détail facultatif ou intervention réellement vendue au temps avec plafond convenu. Précision ±10–20 % non démontrée ; définir d’abord inclusions, unités et volumes, puis adopter les tarifs. Aucun prix de l’étude antérieure adopté ou publié.

Constats confirmés : montants publics en attente, options de volume sans quantités, textes légaux provisoires, Galerie retirée sans explication au passage Vitrine → Connecté et contraste local trop faible de petits textes. À améliorer ensuite : budget complet, récapitulatif conservable/versionné, confirmation et retours d’état du prix. Vrai passage mobile vers le brief fonctionnel ; aucune panne GeoBoss, e-mail ou indexation démontrée. Destination Resend toujours volontairement reportée, aucune relance pendant cet audit.

55 tests existants ciblés passent. Documentation uniquement ; aucun fichier produit modifié, aucun commit/push/déploiement, aucun serveur local lancé. Viewport réinitialisé et onglets temporaires fermés. Les recommandations restent à décider avant un lot d’implémentation.

## Questionnaires et conseil croisé — terminé et vérifié en ligne

Cinq conseillers indépendants puis cinq relectures des avis anonymisés, avec arbitrage final documenté. Questions allégées ou précisées selon le forfait, branches Réservation/Boutique liées aux options, Sur mesure créatif, incertitude exclusive et historique conservé. Lien HTTPS facultatif WeTransfer/SwissTransfer/dossier partagé, précision conditionnelle et récapitulatif privé ; limites des images inchangées, aucune récupération automatique.

Accueil : accompagnement et aide au choix, étapes du vrai parcours, revue de sécurité avant livraison et conception tenant compte du RGPD. Qualification d’ingénieur préparée mais pas publiée tant que l’intervention reste seulement « je pense ». Étude France sourcée et six fourchettes proposées dans `docs/ETUDE_MARCHE_PRIX_FRANCE_2026-11-03.md` ; aucun prix ni −50 % publiés.

Application `82d3e3b`, release `20261104T024657Z-82d3e3b9dad9`, client `index-BlgVzUM-.js` : TypeScript, build et 213 tests passent. Empreinte HTTPS identique, sauvegarde et décodeur avant bascule, autres projets inchangés. Accueil et Refonte vérifiés dans l’IAB public, dont lien, résumé replié et mobile ; aucune demande envoyée en production. Saisie fictive effacée, session QA locale déconnectée, réglages navigateur rétablis et localhost fermé. Preuves et limites dans `docs/qa/brief-council/final-review.md`.

## Contour de sélection des options — terminé et vérifié en ligne

Lot distinct, commencé après clôture des questionnaires : `:focus-within` dessinait un contour violet autour de toute la ligne au clic. Contour retiré dans configurateur et questionnaire ; coche noire, bordure neutre fine et focus clavier limité à la petite case. Ombre intérieure de sélection supprimée, cartes et grain conservés.

Application `e8895ae`, release `20261104T043052Z-e8895ae19aeb`, client `index-Biz5hM9-.js` : TypeScript, build et 213 tests passent. IAB local et public : souris, clavier, choix du brief et mobile ; configuration initiale et saisies fictives rétablies, aucune soumission. Client et deux CSS identiques au build par HTTPS, sauvegarde et Sharp avant bascule, autres projets inchangés. Localhost fermé. Preuves : `docs/qa/selection-focus/review.md`.

## Galerie et revue critique — terminé et vérifié en ligne

Remarque de l’ami annulée : badges et textures approuvés conservés, filtres blancs au repos puis colorés au survol/sélection. Grand bloc d’introduction retiré. Filtrage strict par offre : Julie Thiam en Sur mesure, GeoBoss en Connecté, Lactel en Vitrine ; GeoBoss ne remonte plus en 3D. Cal.com ajouté comme référence avec une vraie page de connexion vérifiée, aperçu natif et source créditée. Dix sites, un seul badge chacun ; tous les liens externes ouvrent un nouvel onglet. Cinq filtres contrôlés en production avec scroll à 18 px inchangé.

Trois spécialistes ont ensuite revu interface, performance et SEO. Perte du brief à la navigation corrigée par un garde de sortie ; Confidentialité ouvre un autre onglet. Annulation, Retour, refus de changer de forfait, reprise des options et écran bas testés localement ; garde Contact aussi testé en ligne sans envoi. Pied de page stabilisé, formulaire chargé à la demande et premières images de galerie immédiates. Métadonnées partagées serveur/SPA, sitemap XML de douze URL, robots texte et vraies 404 publiés ; dix réponses FAQ présentes dans le DOM.

Publication `099c1a1`, release `20261103T225415Z-099c1a131eef`, client `index-DZiCU2sY.js` : TypeScript, build, 202 tests, santé et empreinte HTTPS conformes au build, décodeur natif Ubuntu vérifié avant bascule et autres projets inchangés. Mesures initiales IAB à 1280 × 720 : CLS environ 0,00007 sans cache navigateur et 0 avec cache sur accueil/galerie/Vitrine ; aucun résultat terrain ou classement Google promis. Mobile 390 × 844 sans débordement. Textures inchangées, aucune demande envoyée. Informations légales réelles et destination Resend toujours à fournir ; corps des pages rendu côté client. Localhost fermé, onglet public conservé. Détails et preuves : `qa/gallery-review/final-review.md`.

## Briefs publics par forfait — terminé et vérifié en ligne

Recherche préalable Reddit et sources professionnelles documentée dans `BRIEF_RECHERCHE.md`, puis quinze spécialistes coordonnés par périmètres. Prénom, nom, e-mail et téléphone obligatoires côté navigateur et serveur. Questions propres aux quatre créations et à Évolution/Refonte ; Refonte couvre aussi identité/références, plateforme, accès disponibles, contenus, URL/redirections, référencement, données et continuité. Réponses conditionnelles et incertitude possibles. Les choix n’ajoutent aucune option silencieusement.

Options publiques ramenées à 12/12/12/10 selon le forfait, sans refacturer les inclusions ; Vitrine garde le mobile facultatif. Le retour aux options conserve le brief et les images. Le catalogue historique de 26 options reste lisible pour les dossiers privés. Les images JPEG/PNG/WebP sont bornées, décodées, enregistrées avec le dossier dans une transaction et consultables seulement par l’administration. Sauvegarde/restauration réelle, idempotence, erreurs et accès privés testés. Anciennes demandes conservées.

TypeScript, build et 192 tests réussis ; dernière reconstruction après un ajustement de texte. Parcours complet Refonte soumis uniquement à une base locale isolée, avec image de test puis lecture admin. Publication `770a271`, release `20261103T213957Z-770a271379ef`, client `index-CYUgPAPx.js` : santé et SHA-256 HTTPS conformes au build, décodeur Sharp vérifié sur Ubuntu avant bascule. Contrôles IAB publics Refonte/Vitrine et mobile 390 × 844 sans débordement, quatre coordonnées requises, branches techniques et références constatées ; aucune demande ni image envoyée en production. Les six parcours ont été revus localement. Autres projets Ubuntu inchangés, localhost fermé. L’adresse Resend reste à fournir plus tard par Mathis. Preuves et revues : `qa/brief-v2/`.

## Cartes Évolution/Refonte et menu translucide — terminé et vérifié en ligne

Contour supplémentaire autour de Changer retiré ; focus clavier souligné. Menu compact sombre translucide avec flou statique, six choix et textures au survol/clavier. Une même carte et un même menu servent aux quatre créations ainsi qu’à Évolution et Refonte ; styles partagés dans `src/components/layout/project.css`. Les deux prestations gardent leurs demandes sur devis et leur formulaire propre à droite ; le sélecteur de sujet redondant disparaît uniquement sur ces fiches.

Continuer servait à passer aux coordonnées et était affiché en double sur ordinateur. Le doublon de la carte est retiré ; une action explicite reste après les options, avec variante mobile dans la barre fixe. Retour aux options et sauvegarde des dossiers privés conservés.

Contrôles locaux IAB : six destinations, carte de même géométrie, menu sans débordement, hover coloré, un seul H1 par fiche, retour des coordonnées avec choix conservés, services sur mobile et contact général inchangé. Un débordement de 2 px du séparateur a été trouvé puis corrigé ; le menu est désormais à 208/208 px client/contenu. TypeScript, build et 113 tests passent. Aucun formulaire soumis. Preuves : `qa/shared-project-cards/`. Publication `8187d38`, release `20261103T173638Z-8187d38f889b`, client `index-ddtJu-_H.js` vérifiés : cartes Refonte/Évolution de mêmes dimensions que les créations, Sur devis et formulaires adaptés ; menu translucide de 210 px, six choix et hover coloré, zéro contour supplémentaire, aucun débordement. Action explicite vers les coordonnées testée sur ordinateur/mobile. Aucun formulaire envoyé. Santé et empreinte HTTPS conformes au build, autres projets Ubuntu inchangés, localhost fermé et onglet public conservé.

## Menu Changer et focus Forfaits — terminé et vérifié en ligne

Demande reçue pendant la clôture du lot précédent : remplacer la fenêtre centrale par un petit menu déroulant attaché au bouton. Afficher les quatre créations et les deux prestations Évolution/Refonte, en gardant leurs destinations et leurs périmètres existants. Petit DropdownMenu ancré au bouton, six choix, création courante cochée, aucune fenêtre centrale. Six destinations contrôlées, sujets Évolution/Refonte corrects et options compatibles conservées. Menu mobile de 224 px sans débordement, Échap ferme et rend le focus au bouton. Ensuite, contour violet Forfaits retiré : le clavier conserve un soulignement noir de 2 px. Preuves : `qa/inline-plan-chooser/`. Publication `db50490`, release `20261103T170055Z-db504905a1d5`, client `index-CPw93N-F.js` : menu de six entrées, zéro dialogue et position sous le bouton confirmés en ligne ; destinations Évolution/Refonte et sujets corrects, focus Forfaits sans contour violet. Contrôle mobile 390 × 844 CSS sans débordement. TypeScript, build et 113 tests passent. Les filtres blancs et le menu mobile du lot précédent restent en place. Aucun formulaire soumis. Localhost fermé, onglet public conservé, autres projets Ubuntu inchangés.

## Filtres au survol et menu mobile — terminé et vérifié en ligne

Ordre suivi : filtres blancs au repos, matière au survol/focus ou à la sélection vérifiée localement ; puis correction de l’ancien violet de la page active dans le menu mobile. La page courante garde un soulignement noir. L’accordéon exclusif et ses résumés, déjà publiés, sont recontrôlés à la demande de Mathis. Un seul badge texturé par site conservé. Retour au blanc après désélection, survol et sélection persistante validés dans l’IAB. Menu noir avec soulignement actif et accordéon recontrôlés. TypeScript, build et 113 tests passent. Preuves : `qa/filter-hover-mobile-menu/`. Publication `99f4eaf`, release `20261103T164953Z-99f4eafe49de` : filtres blancs au repos et colorés au survol/sélection, menu mobile noir avec page courante soulignée, accordéon exclusif et résumés confirmés en ligne. Client HTTPS identique au build, autre projets Ubuntu inchangés. Les choix temporaires de contrôle publics ont été retirés. Ce lot est clos avant de remplacer Changer.

## Couleurs des forfaits dans la galerie — terminé et vérifié en ligne

Un seul badge de catégorie par site. Badges et filtres réutilisent notre texture et les variables de couleur/cadrage de la carte forfait correspondante ; aucun nouveau visuel. « Tous » reste neutre et le filtre actif a un contour. Les tags secondaires restent disponibles pour le classement interne sans être affichés ; Projet archivé est conservé comme texte dans la description. Publié dans `0aeb90d`, release `20261103T164107Z-0aeb90d5a7a8`. Neuf sites et neuf badges, filtres Tous/Vitrine/Connecté/3D/Sur mesure contrôlés : 9/2/1/5/2 résultats, un seul badge par résultat. Contour actif visible ; variables de variantes identiques à celles des cartes. Les 36 liens externes gardent target/rel. HTTPS et client identiques au build, contrôles IAB desktop/mobile passés, 113 tests passants. Aucun formulaire soumis, aucune alerte applicative observée ; localhost fermé, autres projets Ubuntu inchangés. Preuves : `qa/gallery-plan-colors/`.

## Accordéon et galerie — terminé et vérifié en ligne

Demande limitée aux interactions et badges : une seule rubrique d’options ouverte à la fois, refermable au clavier ; les rubriques fermées montrent les choix actifs, dont les inclusions identifiées. Le résumé est dérivé de la configuration existante, sans changement de prix ou de persistance. Une option retirée disparaît du résumé, les choix restent cochés à la réouverture.

La galerie conserve ses neuf références, images, filtres et crédits. Image, titre et action ouvrent un nouvel onglet (`target="_blank"`, `rel="noopener noreferrer"`), remplaçant explicitement la précédente consigne. Badges pastel distincts pour les quatre catégories, Contenus et Projet archivé. Contrôles IAB locaux : ouverture d’un onglet DOMTEKNIKA distinct, conservation de la galerie, résumés, inclusions, clavier et mobile. TypeScript, build et 113 tests passent. Preuves : `qa/accordion-gallery/`. Publication vérifiée : `3e740d6`, release `20261103T163209Z-3e740d63a275`, client `index-DpDJqyK1.js`. Contrôles HTTPS et IAB publics passés : accordéon exclusif, résumés, clavier, mobile sans débordement à 390 px CSS, 36 liens externes avec target/rel et ouverture DOMTEKNIKA dans un onglet distinct. Ancien brouillon public rétabli après les sélections de contrôle ; aucune soumission. Localhost arrêté, ports 4173/4174 libres et autres projets Ubuntu inchangés.

## Images conservées, reflet retiré et entrée du grain — terminé et vérifié en ligne

Mathis rejette le reflet et demande de se rapprocher d’ElevenLabs avec un grain qui bouge brièvement au début. Sa clarification « nos images sont bien » impose de conserver exactement les images actuelles. Les trois fichiers colorés ont été comparés à la version précédente : identiques octet pour octet.

Reflet/liseré retirés, aucun halo. Fondu couleur 300 ms, texte 150 ms et grain indépendant de faible amplitude pendant 360 ms, une seule fois puis arrêt. Texture de grain WebP précalculée, sans filtre de bruit calculé à l’interaction. Revue indépendante par lecture sans blocage ; contrôles IAB d’entrée/sortie/réentrée, déplacement entre les enfants de la carte sans redémarrage, focus, réduction du mouvement et mobile passés. Dix FAQ conservées. TypeScript, build et 113 tests passent. Preuves : `qa/grain-entry/`. Publication vérifiée : `34aa797`, release `20261103T071117Z-34aa797bcb9a`, client `index-68FeVs8c.js`. Contrôles HTTPS et IAB public desktop/mobile passés ; les trois textures colorées servies sont identiques aux sources prévues, le grain bouge brièvement puis s’arrête. Aucun halo/reflet. Localhost fermé, ports 4173/4174 libres, autres projets Ubuntu inchangés.

## Retrait du halo et reflet intérieur — terminé et vérifié en ligne

Dernier retour de Mathis : halo et animation derrière les cartes rejetés, rendu du dégradé souhaité plus brillant. Les deux couches de halo sont retirées, y compris le span et son CSS ; aucune lumière ne se déplace. Un reflet diagonal fixe et un liseré limités à la zone colorée donnent le brillant ; source et cadrage conservés, saturation 1,04 / luminosité 0,94. Le fondu de couleur de 120 ms reste présent.

Contrôles locaux IAB : absence de halo/pseudo-élément extérieur et de `.pricing-card__glow`, texture au survol, carte sans transformation, focus 3 px conservé, six cartes et aucune largeur débordante sur mobile. Dix FAQ conservées, dont les deux réponses d’aide au choix. Preuves : `qa/cards-without-halo/`. TypeScript, build et 113 tests passent. Publication `2c9ba46`, release `20261103T064320Z-2c9ba4612055`, client `index-DHpQH5oY.js` vérifiés en HTTPS et IAB public, desktop/mobile. Zéro glow et aucune ombre extérieure observés ; localhost fermé. Après le correctif, ElevenLabs a été réinspecté : image PNG couleur, grain séparé et fondu CSS 300 ms confirmés, voir `EFFET_CARTES_ELEVENLABS.md`. Ce retour remplace les consignes des essais historiques ci-dessous.

## Halo visible, puis aide au choix du forfait — terminé et vérifié en ligne

Ordre suivi : halo rendu plus visible, contrôlé au survol, au clavier avec mouvement réduit et sur mobile ; puis ajout des deux FAQ demandées pendant ce travail. La présence du halo a été revue par un autre agent avant de passer aux réponses.

- Halo coloré autour des six cartes : fondu 220 ms et légère expansion 420 ms. Lumière intérieure plus visible (opacité 0,55) et déplacement 620 ms. Matière, cadrage, layout et fondu de texture 120 ms préservés.
- Zéro animation permanente après stabilisation ; aucune attente de chargement, boucle ou écouteur de souris. Focus visible et réduction du mouvement conservés.
- FAQ ajoutées en fin de liste : choix du forfait et correction d’un mauvais choix, avec accompagnement de l’équipe avant démarrage. Dix questions au total, trois de l’accueil inchangées.
- Le style de couleurs est décrit comme « grainy gradient » / dégradé granuleux ; source primaire lue dans l’IAB, lien dans `EFFET_CARTES_ELEVENLABS.md`.
- TypeScript, build et 113 tests passent ; deux revues indépendantes par lecture sans blocage. Captures et mesures : `qa/visible-halo/`, `../design-qa.md`. Aucun formulaire soumis ni e-mail réel envoyé. Publication terminée : révision `8c497b4`, release `20261103T055310Z-8c497b4c5019`, client `index-D32bwwWH.js`. Contrôles HTTPS et IAB public passés : halo, deux réponses de FAQ et mobile. Localhost arrêté (ports 4173/4174 libres), viewport réinitialisé, seul l’onglet public conservé. Les autres projets Ubuntu restent inchangés.

## Alignement des cartes, FAQ et portfolio — terminé et vérifié en ligne

Ce lot reprend les dernières corrections explicites de Mathis, qui remplacent les anciens motifs des cartes services et le survol du déclencheur Forfaits.

| Demande | Résultat vérifié |
| --- | --- |
| Évolution et Refonte comme les autres cartes | Composant `PricingCard` commun, même largeur et même hauteur, centrage sous les quatre créations ; matière d’origine, deux nouvelles variantes |
| Couleurs sur chaque offre du sous-menu | Six liens colorés au survol/focus ; déclencheur Forfaits neutre ; navigation clavier et Échap contrôlés |
| Libellé du dépliage | « Afficher plus de détails », puis « Masquer les détails » ; aucune case à cocher, réduction du mouvement respectée |
| FAQ rassurante issue de recherches Reddit | Huit questions sur frais, contenus, autonomie, domaine, mobile, site existant, calendrier et référencement ; sources et limites qualitatives documentées |
| Portfolio de Raphaël complété | GeoBoss, Aéma Groupe, Satellite Story et Atlante 3D ajoutés ; neuf références au total ; vrais aperçus, crédits et filtres |
| Atlante archivé | Badge « Projet archivé », lien « Voir la présentation » vers le README de l’auteur ; aucune fausse destination de site actif |
| Accès direct aux exemples | Liens dans le même onglet et anciennes routes de fiches redirigées directement ; ancien aperçu en sous-fenêtre et CSS associés supprimés |
| Comprendre ElevenLabs | Image, grain indépendant et fondu observés dans le navigateur intégré ; recherche distincte de l’implémentation, aucun asset copié |
| Navigateur demandé | Vérifications finales exclusivement dans le navigateur intégré, jamais Chrome après cette instruction |

TypeScript, build et 113 tests passent après la dernière correction Atlante. Revue indépendante sans blocage. Dimensions, mobile, filtres, clavier, liens et captures : `../design-qa.md` et `qa/card-alignment-faq-portfolio/`. Aucun formulaire soumis, aucun e-mail réel envoyé. Publication terminée : révision `6133f1e`, release `20261103T045550Z-6133f1e47ab9`, client `index-uoRXqwKE.js`. Santé HTTPS, empreinte du client, quatre nouveaux WebP et parcours publics desktop/mobile contrôlés. Localhost fermé, ports 4173/4174 libres, seul l’onglet public conservé. Les autres projets Ubuntu sont restés inchangés.

## Historique du premier lot terminé et vérifié en ligne

Révision applicative `6adfae1`, release `20261103T032149Z-6adfae1ad67f`, sur `https://gilmathis.com/`.

| Demande active | Résultat vérifié |
| --- | --- |
| Contact noir | Bouton noir sur ordinateur, dans l’en-tête mobile et le panneau mobile |
| Petit sous-menu Forfaits | Quatre forfaits + entrée Refonte séparée ; clavier, Échap et fermeture après navigation |
| Boutons Configurer | Vrais boutons noirs, matière du forfait au survol/focus |
| Inclusions compréhensibles | Explication propre à chaque forfait avant les options |
| Upgrade/refonte | Bloc Refonte & évolution, sur devis, sous les offres ; contact contextualisé avec URL facultative |
| Aperçu Addiction | Nouvelle capture du vrai site de l’agence, 2560 × 1440, source et crédit vérifiés |
| Code modifiable à la main | Catalogue et JSX indentés, textes partagés séparés, guide `MODIFIER_LE_SITE.md` |
| Vérification | TypeScript, build et 113 tests ; navigateur local et public ; largeur mobile sans débordement |

Preuves : `qa/offers-menu-buttons/`, `../design-qa.md`. Aucun message réel soumis sur le site public, aucun e-mail de test émis.

## Dépliage — terminé et vérifié en ligne

« Afficher les détails » sous le comparatif : bouton dépliant avec chevron et animation douce, à la place de la case à cocher. Révision `7d40317`, release `20261103T033748Z-7d40317f1498`, rechargée et contrôlée en ligne : zéro case à cocher, aria-expanded correct, lignes repliées de hauteur nulle puis ouverture à 420,5 px, aucune erreur de console. Contrôles locaux supplémentaires : fermeture au clavier, tableau unique, réduction du mouvement et largeur mobile. TypeScript, build et 113 tests passent.

## Navigation, cartes et galerie — terminés et vérifiés en ligne

1. Retirer les flèches des boutons Configurer.
2. Donner aux boutons des cartes de l’accueil le style et le survol des boutons du comparatif.
3. Ajouter un survol coloré à Forfaits dans la barre de navigation.
4. Séparer Évolution et Refonte en deux offres avec leurs propres cartes et motifs, au lieu d’un bloc commun.
5. Galerie : ouvrir directement le vrai site depuis l’image ou le nom, dans le même onglet.
6. FAQ à droite dans la navigation, avant Nous contacter ; aussi dans le panneau mobile.
7. Retirer les flèches diagonales des pages publiques, y compris Comment ça se passe.

Les sept demandes ont été traitées puis vérifiées ensemble sur ordinateur et mobile : six liens dans Forfaits, FAQ à droite, deux contacts distincts, CTA partagés, zéro flèche diagonale et clic DOMTEKNIKA arrivé directement sur le vrai site dans le même onglet. TypeScript, build et 113 tests passent. Revue indépendante sans blocage.

## Halo — traité après validation du lot précédent

Référence Free étudiée en parallèle ; léger effet lumineux original ajouté ensuite au haut des cartes, avec la matière approuvée conservée. Opacité de 180 ms et petit déplacement de 550 ms, sans boucle ni suivi de souris. Mouvement réel mesuré, zéro animation au repos ; au clavier avec réduction du mouvement : halo visible et zéro animation. TypeScript, build et 113 tests de la version finale passent. Publication finale contrôlée : révision `7c5550c`, release `20261103T040155Z-7c5550c67402`, client `index-DGJoTYdQ.js`. Les contrôles locaux ont été complétés par les parcours publics desktop/mobile. À la livraison de ce lot historique, aucune demande d’interface de sa file ne restait ouverte ; les éléments commerciaux reportés ci-dessous restent distincts.

## Décisions antérieures conservées et revues dans le code

- Quatre forfaits de création, titres directs, cartes entièrement cliquables, effet et texture approuvés conservés.
- Fond pastel et grain générés dans le code, statiques selon la dernière correction ; aucun aperçu en ouverture de l’accueil.
- Configuration avec grande carte à gauche et options à droite, sans onglets Présentation/Exemple. Totaux ponctuels et mensuels séparés ; mise en ligne et maintenance facultatives.
- Vitrine sur ordinateur à la base, mobile facultatif. Connecté comprend les comptes des visiteurs et la gestion des contenus. Immersif 3D comprend le modèle fourni et ses interactions ; création d’un modèle séparée.
- Galerie distincte, filtres et crédits, DOMTEKNIKA et Julie Thiam présents, exemple Artisanat retiré, aucune scène externe chargée automatiquement.
- Parcours public par demande de contact ; navigation de connexion et Mon projet retirée, données privées historiques conservées.
- Mentions inutiles et badges rejetés retirés ; FAQ sur contenus, délai, modifications, mobile, hébergement et maintenance.
- Ubuntu isolé par projet ; autres services inchangés lors de la bascule. Localhost à fermer à la fin du travail.

## Éléments volontairement ouverts

Les prix et périmètres commerciaux restent à arrêter ; aucun montant, délai ou chiffre client inventé. Le destinataire Resend sera fourni plus tard par Mathis : les demandes sont conservées, mais une réception e-mail réelle reste à vérifier après configuration. L’identité et les documents commerciaux définitifs restent à compléter. Ces éléments ne sont pas présentés comme terminés par la livraison de l’interface.

L’étude de marché antérieure est disponible dans le dossier de travail `recherche-marche/` à côté du dépôt : rapport complet, synthèse, benchmark et journal des sources datés du 1er novembre 2026. Sa présence a été vérifiée ; ses relevés n’ont pas été actualisés pendant cette correction d’interface et les décisions utilisateur ultérieures priment sur ses recommandations.
# Retour en haut par le logo — 12 novembre 2026

Logo/nom et liens Accueil corrigés et contrôlés localement sur ordinateur/mobile, y compris clavier, mouvement réduit et fermeture du menu sans interruption du défilement. Les 284 tests passent. Révision `340e503` publiée et vérifiée en HTTPS : remontée finale à 0 px après clic sur le logo et Accueil, sur ordinateur et mobile. Le logo depuis la FAQ rejoint aussi le haut de l’accueil. Localhost arrêté et Tailscale remis à l’arrêt.
