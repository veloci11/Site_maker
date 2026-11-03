# studio — charte d’interface interne

Révision du 2 novembre 2026, après essais et corrections de Mathis. Document interne, sans route publique.

## Identité

Une interface claire et calme, inspirée de la lisibilité d’ElevenLabs et de l’ancienne Base44. Les compositions de couleur sont originales. Le nom typographique studio reste provisoire. L’identité des références externes reste cantonnée aux aperçus crédités.

## Typographie et grille

Geist Sans unique, graisses 400, 500 et 600. Titres fonctionnels 52 px ordinateur / 36 px mobile ; sections 36 / 28 ; corps 16 ; contrôles 14–16 ; légendes 12. Le grand titre d’accueil possède une taille responsive dédiée. Les aperçus de sites ont leur propre identité, sans ajouter une police à l’interface studio.

Largeur publique maximale 1280 px ; marges mobiles 20 px. Échelle d’espacement 4, 8, 12, 16, 24, 32, 48 et 64. Rayons 12 pour champs et options, 16 pour cartes, capsule pour boutons et navigation. Cibles interactives d’au moins 44 px.

## Couleurs et matières

Fond blanc, texte #111111, secondaire #686872, surface grège #F5F3F0, bordure #E8E6E3. Le fond public utilise des plages CSS lavande, pêche, ciel et crème, statiques et progressivement transparentes. Le texte secondaire public est #575360 pour rester lisible sur les pastels. Il ne charge aucune image d’ambiance et ne s’anime pas. Le grain est généré une fois dans le code sur une tuile 128×128 répétée par canvas à DPR 1, en lumière douce, sans voile gris, avec repaint uniquement au redimensionnement.

Les en-têtes des petites cartes utilisent la texture originale grain-plasma-card.webp, 768×512 et environ 163 Ko. La texture se révèle au survol ou au focus, uniquement dans le haut ; le texte y devient blanc. Les trois inclusions restent sombres, le bouton noir. Toute la carte est un seul lien. Aucune phrase sous son nom, aucune vignette ni ligne Selon les options choisies.

La grande carte du configurateur reprend la matière originale de studio, en cadrage proportionnel `cover`. L’essai lissage + grain procédural a été rejeté par Mathis : aucun flou ni grain ajouté à cette carte. À haute densité, `grain-plasma-master.webp` est un export sans perte du PNG source 1536×1024 ; les pixels décodés sont identiques au PNG. La version légère est conservée à DPR 1 et dessous pendant le chargement. Les variantes de teinte, retournements, vignette et luminosité antérieurs sont conservés. Aucun traitement du texte ou des contrôles, aucune nouvelle animation ni attente de chargement sur les interactions. Le fond pastel général reste indépendant.

## Mouvement et performance

Réactivité prioritaire. Fondu de survol 120 ms ; entrées de page 180 ms ; aperçu et copie du configurateur 160 ms. Pas de cercle de transition, capture plein écran, animation permanente du fond, suivi du pointeur, flou du header ni contenu caché dans l’attente d’un observateur. Les liens ne bloquent pas sur une promesse de préchargement. Les images de référence sont en WebP.

La préférence de réduction des animations supprime les mouvements. Un état sélectionné et un focus restent visibles sans couleur seule. Les accordéons gardent une réponse courte et les contrôles restent utilisables pendant les transitions.

Le comparatif possède un bouton Afficher les détails sous le tableau. Il ouvre et referme les lignes complémentaires avec un chevron et un dépliage CSS de 280 ms, sans case à cocher ni mesure de hauteur JavaScript. Le tableau reste unique, ses en-têtes conservent leur sémantique et les lignes repliées sont masquées aux lecteurs d’écran. Le bouton reste accessible au clavier ; la réduction des animations supprime la transition.

## Parcours

Accueil concis sans exemple en ouverture → forfait → configuration → coordonnées → demande → recontact humain. Aucun compte à créer. Les choix sont à droite d’une grande carte texturée du forfait avec le total sur ordinateur ; le mobile empile carte/options et dispose d’une barre de total fixe. Les détails se déplient au même endroit, sans onglets redondants.

Les coûts de création incluent les options ponctuelles choisies. La maintenance choisie reste un montant mensuel séparé. Les services déjà compris ne sont pas facturés une deuxième fois. Prix inconnus : À partir de…, + … €, … € ; Sur mesure : Sur devis.

## Composants

Primitives shadcn/Radix : Button, Input, Textarea, Label, RadioGroup, Checkbox, Dialog, Sheet, Accordion, Tabs et DropdownMenu. Lucide est la seule famille d’icônes. Les comptes, fichiers privés, messages, versions et validations s’appuient sur l’API réelle.

Les références DOMTEKNIKA, Lactel, Tiny Heaven et Addiction sont des inspirations externes créditées, pas des clients revendiqués. Julie Thiam est également présentée. L’ancien exemple fictif Atelier / Artisanat est retiré ; ses originaux sont archivés hors du build. Le dossier de maquettes initial demeure une archive de conception et ne remplace pas les corrections ci-dessus.

Le header propose Accueil, un déclencheur Forfaits et Exemples de sites, puis un bouton noir Nous contacter à droite. Le petit menu Forfaits présente les quatre offres de création et, après une séparation, Refonte & évolution. Sur mobile, cette liste se déplie dans le panneau ; les liens ferment le panneau après navigation. Le déclencheur reste actif sur les fiches. Les boutons Configurer du comparatif sont noirs au repos et révèlent la même texture colorée que leur forfait au survol et au focus, en 120 ms. Les cartes principales approuvées restent identiques. Aucune mention « Sans compte » dans les textes publics et aucun badge de promesse générique sous le hero. La FAQ traite les contenus, le délai, les modifications, le mobile, la mise en ligne et la maintenance.

Refonte & évolution figure sous les cartes de création de l’accueil et après le comparatif. Ce bloc reste sobre, sur devis, avec un bouton Améliorer mon site. Il conduit au contact contextualisé : sujet prérempli, URL facultative du site actuel, changements souhaités. Il ne crée ni un cinquième forfait technique ni un prix arbitraire. Dans chaque configurateur, un paragraphe précise les inclusions avant le choix des options.

La texture de la grande carte est visible dès l’ouverture ; les cartes de l’accueil conservent leur effet de survol approuvé. Le fond public couvre le bord supérieur ; overscroll-behavior-y:none neutralise le rebond blanc.
