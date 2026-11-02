# Direction retenue — révision après essai

Les dernières corrections de Mathis priment sur les premières maquettes.

- Accueil explicite et concis : création de sites internet clé en main. Aucun aperçu de site à l’arrivée.
- Vocabulaire « forfait », quatre accès directs au menu. Aucun bouton public « Mon projet ».
- Menu réduit à Accueil et quatre forfaits ; Exemples, La méthode et FAQ retirés du haut. Exemples dans les configurateurs, aide dans le pied de page. FAQ et galerie sans filtres superflus ; méthode intégrée aux étapes de l’accueil.
- Cartes entièrement cliquables ; texture originale à grain uniquement en haut, inclusions neutres. Rendu approuvé par Mathis.
- Fond pastel visible généré en CSS, plages lavande/pêche/ciel/crème et grain procédural fin en lumière douce. Le voile gris de la première version est supprimé. Sans image d’ambiance ni animation. Les essais bitmap sont archivés hors du build.
- Survol léger de 120 ms, texture WebP de 163 Ko. Pas de suivi de pointeur, filtre animé, transition circulaire ou attente de préchargement.
- Navigation immédiate ; contenu visible sans observateur. Entrées discrètes de 160–180 ms, désactivées avec la préférence de réduction des animations.
- Pas d’animation de taille ni de barre de progression du header ; aucun traitement de scroll de navigation. Configurateur chargé à l’ouverture du forfait, limite de chargement à l’intérieur du layout pour garder la navigation affichée.
- Fiche de forfait = configurateur : grand aperçu sticky à gauche et choix détaillés à droite. Aucun onglet Présentation/Exemple redondant.
- Déploiement ponctuel et maintenance mensuelle facultatifs, deux totaux séparés.
- Comparatif des quatre forfaits avec coches et case Afficher les détails.
- Geist unique, composants shadcn/Radix et icônes Lucide.

Les routes canoniques sont /forfaits et /forfaits/:slug. Les anciennes routes /formules redirigent. L’espace client réel reste inclus pour préparer les contenus, échanger et valider. La gestion des contenus du site après livraison est distincte de cet espace.

Les prix, la fiscalité et les engagements commerciaux restent à arrêter. Le paiement et le transport des e-mails de production ne sont pas raccordés. Aucun déploiement public n’est déduit de la prévisualisation locale.

Vitrine utilise la capture authentique de DOMTEKNIKA comme premier aperçu ; Immersif 3D présente d’abord la galerie Julie Thiam. Un lien Accueil est explicite dans les deux menus. Les titres décoratifs et les explications répétées ont été supprimés.
