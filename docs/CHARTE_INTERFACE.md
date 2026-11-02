# studio — charte d’interface interne

Révision du 2 novembre 2026, après essais et corrections de Mathis. Document interne, sans route publique.

## Identité

Une interface claire et calme, inspirée de la lisibilité d’ElevenLabs et de l’ancienne Base44. Les compositions de couleur sont originales. Le nom typographique studio reste provisoire. L’identité des références externes reste cantonnée aux aperçus crédités.

## Typographie et grille

Geist Sans unique, graisses 400, 500 et 600. Titres fonctionnels 52 px ordinateur / 36 px mobile ; sections 36 / 28 ; corps 16 ; contrôles 14–16 ; légendes 12. Le grand titre d’accueil possède une taille responsive dédiée. Les aperçus de sites ont leur propre identité, sans ajouter une police à l’interface studio.

Largeur publique maximale 1280 px ; marges mobiles 20 px. Échelle d’espacement 4, 8, 12, 16, 24, 32, 48 et 64. Rayons 12 pour champs et options, 16 pour cartes, capsule pour boutons et navigation. Cibles interactives d’au moins 44 px.

## Couleurs et matières

Fond blanc, texte #111111, secondaire #686872, surface grège #F5F3F0, bordure #E8E6E3. Le fond public utilise des plages CSS lavande, pêche, ciel et crème, statiques et progressivement transparentes. Le texte secondaire public est #575360 pour rester lisible sur les pastels. Il ne charge aucune image d’ambiance et ne s’anime pas. Le grain est généré une fois dans le code sur une tuile 128×128 répétée par canvas à DPR 1, en lumière douce, sans voile gris, avec repaint uniquement au redimensionnement.

Les en-têtes des cartes utilisent la texture originale grain-plasma-card.webp, 768×512 et environ 163 Ko. Recadrages, retournements et teintes statiques différencient les quatre forfaits. La texture se révèle au survol ou au focus, uniquement dans le haut ; le texte y devient blanc. Les trois inclusions restent sombres, le bouton noir. Toute la carte est un seul lien. Aucune phrase sous son nom, aucune vignette ni ligne Selon les options choisies.

## Mouvement et performance

Réactivité prioritaire. Fondu de survol 120 ms ; entrées de page 180 ms ; aperçu et copie du configurateur 160 ms. Pas de cercle de transition, capture plein écran, animation permanente du fond, suivi du pointeur, flou du header ni contenu caché dans l’attente d’un observateur. Les liens ne bloquent pas sur une promesse de préchargement. Les images de référence sont en WebP.

La préférence de réduction des animations supprime les mouvements. Un état sélectionné et un focus restent visibles sans couleur seule. Les accordéons gardent une réponse courte et les contrôles restent utilisables pendant les transitions.

## Parcours

Accueil concis sans exemple en ouverture → forfait → configuration → coordonnées → demande → recontact humain. Aucun compte à créer. Les choix sont à droite d’une grande carte texturée du forfait avec le total sur ordinateur ; le mobile empile carte/options et dispose d’une barre de total fixe. Les détails se déplient au même endroit, sans onglets redondants.

Les coûts de création incluent les options ponctuelles choisies. La maintenance choisie reste un montant mensuel séparé. Les services déjà compris ne sont pas facturés une deuxième fois. Prix inconnus : À partir de…, + … €, … € ; Sur mesure : Sur devis.

## Composants

Primitives shadcn/Radix : Button, Input, Textarea, Label, RadioGroup, Checkbox, Dialog, Sheet, Accordion, Tabs et DropdownMenu. Lucide est la seule famille d’icônes. Les comptes, fichiers privés, messages, versions et validations s’appuient sur l’API réelle.

Les références DOMTEKNIKA, Lactel, Tiny Heaven et Addiction sont des inspirations externes créditées, pas des clients revendiqués. Julie Thiam est également présentée. L’ancien exemple fictif Atelier / Artisanat est retiré ; ses originaux sont archivés hors du build. Le dossier de maquettes initial demeure une archive de conception et ne remplace pas les corrections ci-dessus.

Le header propose les quatre forfaits, la galerie avec tags, Accueil et Nous contacter. La texture de la grande carte est visible dès l’ouverture ; les cartes de l’accueil conservent leur effet de survol approuvé. Le fond public couvre le bord supérieur ; overscroll-behavior-y:none neutralise le rebond blanc.
