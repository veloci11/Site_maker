# Trois forfaits — publiés et vérifiés le 6 novembre 2026

Statut : révision `c5f499fc55bd859b99a604e981420b7277685423` poussée sur main, publiée et contrôlée sur https://gilmathis.com/. Release `20261106T185743Z-c5f499fc55bd`.

## Résultat

- Vitrine 890 €, Business 1 490 €, Premium / 3D 2 499 € ; menus, accueil, comparaison, SEO et filtres alignés.
- Sur mesure, Évolution et Refonte retirés du parcours public ; anciennes routes redirigées, dossiers privés préservés.
- Douze options ponctuelles retenues à partir des surlignages, libellés et périmètres précisés. Les options variables affichent leurs plages ; les nouveaux totaux additionnent les bornes lorsqu’elles sont connues, sinon affichent « À partir de ». Le blog inclut son éditeur ; la boutique inclut produits et paiement ; CMS général distinct. Création et intégration 3D restent distinctes.
- Hébergement 19 €, Maintenance 39 €, Sérénité 69 € par mois, choix facultatifs et exclusifs. Création et abonnement ont des totaux séparés.
- Formulaire court à droite après Continuer ; mêmes champs dans Nous contacter, sans calendrier ni fichiers. Retour aux options sans perdre la saisie, validation client/serveur et dédoublonnage conservés.
- Cal.com retiré ; neuf références externes, réparties Vitrine (DOMTEKNIKA), Business (Lactel, Aéma) et Premium / 3D (six autres).
- Premium reprend la composition de l’ancien Sur mesure, teintée et désaturée légèrement en CSS. Images originales et prolongements inchangés ; aucune nouvelle génération ou réexport des textures.

## Contrôles effectués

`npm run check` : TypeScript, build et **241 tests réussis**. Un build complémentaire couvre la dernière règle CSS tablette. `git diff --check` valide le diff. Tests API avec bases temporaires et transports e-mail injectés : quatre types de demandes courtes, validation, lecture admin, estimation minimum, anti-doublon, refus des accès non autorisés et conservation des instantanés historiques.

Dans le navigateur intégré exclusivement :

- Ordinateur 1280 px : trois cartes/prix, ouvertures Premium/Vitrine/Business, menu Changer à trois offres, formulaire bien à droite de la carte. Passage Business → Vitrine : 890 €, aucun CMS ou analytics automatiquement payant. Gestion des contenus + langue supplémentaire sur Vitrine : 1 290 € ; retrait retour 890 €.
- Hébergement → Maintenance → Sérénité : un seul abonnement, total mensuel final 69 €. Retrait du dernier abonnement possible. Les options en fourchette s’affichent comme « À partir de » dans le total.
- Saisie du prénom, retour aux options puis retour au formulaire : prénom conservé. Saisie de test effacée ensuite.
- Mobile 390 × 844 : menu à trois forfaits, parcours Vitrine → formulaire, contact sans calendrier/fichiers, erreurs obligatoires et focus du premier champ, galerie Business limitée à Lactel/Aéma, comparatif trois offres avec défilement interne au tableau. Aucun débordement horizontal de page observé.
- Tablette 820 × 1000 : trois cartes sur une ligne, badge Offre principale sans chevauchement, aucun débordement.
- Console du navigateur : aucune erreur ni alerte observée. Préférence de viewport restaurée. Aucun formulaire envoyé depuis le navigateur ; aucun e-mail externe de test.

Captures : `home-desktop.jpg`, `home-tablet.jpg`, `form-desktop.jpg`, `form-mobile.jpg`, `gallery-mobile.jpg`, `contact-mobile.jpg`, `comparison-mobile.jpg`.

La continuité des animations et de la préférence de réduction du mouvement est préservée dans le code ; pas de nouveau relevé image par image pour ce lot. Les mesures de transitions des lots précédents ne sont pas présentées comme un nouveau contrôle.

Le serveur local est arrêté après les vérifications et la base isolée de contrôle est supprimée. Les données privées existantes n’ont pas été modifiées ; la publication ultérieure est détaillée ci-dessous.

## Double vérification finale et stratégie commerciale

Dix spécialistes : catalogue, formulaires/API, FAQ, migration/options, navigation, responsive, accessibilité, animations, SEO, contre-revue. Deux avis supplémentaires : stratégie commerciale et rentabilité. Matrice catalogue : 57 344 configurations et 172 032 changements d’offre contrôlés par le spécialiste ; matrice API locale avec bases temporaires, aucun e-mail réel. La contre-revue a trouvé le cas ancien Connecté avec rôles, couvert par la correction finale.

Corrections vérifiées : anciens brouillons Connecté et rôles ne produisent plus de comptes payants implicites ; les choix versionnés volontaires restent conservés. Boutique masque les liens de paiement déjà compris. Focus restauré après « Rester », message conservé ; contraste des textes facultatifs renforcé. Barre mobile ne masque plus le footer (bas footer754px, début barre766px à390×844). Premium très haut finit dans une teinte sombre continue, images originales inchangées.

FAQ16 et navigation au clavier contrôlées à320px. Six allers-retours comparateur/forfait contrôlés en local à1280 et390px, arrivée des trois titres et absence de débordement. Vitrine+Espace membres affiche1190–1490€ avec retour ligne lisible à320px. Comparateur rend la valeur Business visible ; aucun tarif approuvé modifié. Sources et raisonnements dans faq-research.md, business-strategy.md et profitability.md. La rentabilité réelle n’est pas démontrée sans coûts et temps réels.

Limites connues : destinataire Resend INQUIRY_TO non renseigné ; notifications réelles non validées. Informations légales de l’éditeur et documents commerciaux encore provisoires. Aucun envoi de formulaire en production pour les essais.

## Publication et contrôles publics

- Release `20261106T185743Z-c5f499fc55bd` ; archive SHA-256 `584b0a0e83c3b021bd9976b53ab09ba50c432f4a1b8a4047878300db758b7fc1`, vérifiée avant extraction. Client `/assets/index-CC1vRoOh.js` observé dans l’IAB public, identique au chemin du build testé.
- Sauvegarde privée réussie avant bascule atomique. Santé origine valide, trois offres et prix approuvés servis, paiements désactivés. Données privées et réglage de prix conservés ; 24 autres services gardent leurs états et PID.
- Ordinateur1280/mobile390 : six allers-retours de forfaits, titres et bases890/1490/2499 conformes, aucun débordement. Business ne propose pas gestion des contenus/statistiques en supplément ; langue100€+Sérénité69€ donnent1590€+69€/mois, un seul abonnement.
- Formulaire ordinateur à droite : carte x40–608, formulaire x685–1225. Aucun fichier ni calendrier. Changer→Vitrine→Rester conserve Business, prix, message et focus ; retour aux options puis formulaire conserve la saisie. Saisie effacée après contrôle. Validation vide sur mobile bloque avant envoi et focalise le prénom.
- Contact court confirmé après chargement du formulaire. Les seize FAQ s’ouvrent. Galerie filtrée1/2/6, Cal.com absent. Menu mobile comporte exactement les trois forfaits.
- Largeur320 : Vitrine+Espace membres affiche1190–1490€ ; Premium avec11options affiche un minimum4359€+69€/mois, sans débordement ni coupure de teinte au bas de la grande carte. La boutique masque les liens de paiement déjà compris. Les liens du footer restent accessibles au-dessus de la barre fixe.
- Tablette820 : trois cartes alignées sans chevauchement ni débordement. Ancien Sur mesure redirige vers Premium, ancienne demande Évolution vers Contact. Réduction du mouvement : zéro animation active observée.
- Console publique : aucun avertissement/erreur observé. Choix de contrôle remis à zéro, viewport restauré, serveur local arrêté. Aucun formulaire public soumis, aucun e-mail de test réel.

Preuves : deployment-proof.json, public-motion.json et captures public-*.jpg. Le destinataire Resend et les informations légales restent à compléter ; cette validation n’atteste pas de livraison réelle d’un e-mail ni de conformité juridique complète.
