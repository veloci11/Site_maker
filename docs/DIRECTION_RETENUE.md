# Direction retenue — révision après essai

Les dernières corrections de Mathis priment sur les premières maquettes.

- Accueil explicite et concis : création de sites internet clé en main. Aucun aperçu de site à l’arrivée.
- Vocabulaire « forfait ». Un déclencheur Forfaits ouvre un petit sous-menu avec les quatre offres ; aucune barre de quatre onglets. Aucun bouton public « Mon projet ».
- Menu : Accueil, Forfaits, Exemples de sites, puis FAQ et bouton noir Nous contacter à droite. La liste Forfaits se déplie aussi sur mobile : quatre créations puis Évolution et Refonte après séparation. Survol coloré du déclencheur. Galerie avec tags/filtres, images et noms ouvrant directement les vrais sites dans le même onglet ; méthode intégrée à l’accueil. Aucun lien de connexion public.
- Cartes entièrement cliquables ; texture originale à grain uniquement en haut, inclusions neutres. Rendu approuvé par Mathis.
- Fond pastel visible généré en CSS, plages lavande/pêche/ciel/crème et grain procédural fin en lumière douce. Le voile gris de la première version est supprimé. Sans image d’ambiance ni animation. Les essais bitmap sont archivés hors du build.
- Survol léger de 120 ms, texture WebP de 163 Ko. Pas de suivi de pointeur, filtre animé, transition circulaire ou attente de préchargement.
- Navigation immédiate ; contenu visible sans observateur. Entrées discrètes de 160–180 ms, désactivées avec la préférence de réduction des animations.
- Pas d’animation de taille ni de barre de progression du header ; aucun traitement de scroll de navigation. Configurateur chargé à l’ouverture du forfait, limite de chargement à l’intérieur du layout pour garder la navigation affichée.
- Fiche de forfait = configurateur : grande carte texturée du forfait et total à gauche, choix façon Apple à droite. Aucun aperçu de site ni onglet redondant. Sur mobile, carte au-dessus puis options et barre de total fixe.
- Déploiement ponctuel et maintenance mensuelle facultatifs, deux totaux séparés.
- Comparatif des quatre forfaits avec coches et bouton Afficher les détails sous le tableau, chevron et dépliage fluide ; aucune case à cocher pour ce contrôle.
- Boutons des cartes et du comparatif partagés : noirs au repos, texture du forfait au survol/focus, sans flèche dans Configurer. Flèches diagonales retirées du public. Matière des cartes principales conservée, avec le léger halo de lumière demandé, animé 550 ms à l’interaction, sans boucle.
- Deux cartes Évolution et Refonte sous les offres, motifs distincts, sur devis, avec contacts contextualisés et URL facultative du site actuel. Les quatre créations restent distinctes. Les inclusions sont expliquées avant les options du configurateur.
- Geist unique, composants shadcn/Radix et icônes Lucide.

Les routes canoniques sont /forfaits et /forfaits/:slug. Les anciennes routes /formules redirigent. Le parcours public ne crée aucun compte : configuration, coordonnées, demande au studio via Resend. Les comptes historiques et l’administration restent privés ; inscriptions fermées en production. Connecté couvre les utilisateurs du site livré. Vitrine commence sur ordinateur, mobile facultatif ; mobile inclus dans Connecté et Immersif 3D.

Les prix, la fiscalité et les engagements commerciaux restent à arrêter. Aucun paiement en ligne n’est demandé. Resend dispose d’une file durable ; son activation et la réception réelle sont précisées dans ops/DEPLOYMENT_STATUS.md. Aucun déploiement public n’est déduit de la prévisualisation locale.

La galerie contient notamment DOMTEKNIKA et Julie Thiam, crédités comme références externes. Atelier / Artisanat est supprimé du site public. Un lien Accueil est explicite dans les deux menus. Les titres décoratifs et les explications répétées ont été supprimés.

Aucun chiffre client ou gain de 50 % inventé. Les badges « Un interlocuteur direct » et « Un périmètre validé ensemble » et les mentions publiques sur l’absence de compte ont été retirés à la demande de Mathis. Le fond continue jusqu’au bord supérieur et le rebond blanc du navigateur est neutralisé.
