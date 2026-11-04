# Avis indépendant — phase 1

03/11/2026. Lecture du catalogue, des sept questionnaires et de l’accueil. Recherches dans un onglet IAB isolé, sans formulaire soumis ni compte créé. Aucun autre avis consulté ; aucune modification applicative.

## Constats vérifiables

- `shared/catalog.ts:519–525` : toutes les bases/options sont sans prix. L’accueil ne peut pas promettre un prix définitif ou une économie mesurée ; le comparateur produit montre des inclusions, pas une preuve de prix national.
- `shared/catalog.ts:74` : Vitrine comprend l’ordinateur, tandis que Connecté/Immersif comprennent mobile. Respecter cette décision, mais comparer le prix **avec mobile ajouté** aux concurrents qui le comprennent.
- `src/pages/public/index.tsx:158–160` explique les types de sites mais ne dit pas concrètement comment le client est aidé. Les étapes `:213–218` évoquent seulement nom/e-mail alors que prénom/nom/e-mail/téléphone sont désormais requis. Elles devraient décrire le brief et sa vérification, pas minimiser la démarche.
- `shared/brief.ts:109–111` rend obligatoire une description de données par types/champs. C’est utile au développeur mais le client peut croire devoir concevoir une base de données. `:325–327` rend même obligatoires des détails SEO conditionnels. 
- `ProjectBriefForm.tsx:475–489` permet seulement six images, 5 Mio chacune/20 Mio ensemble. Les documents PDF, vidéos et modèles 3D ont besoin du lien demandé, même sous 20 Mio.
- Refonte/Évolution demandent déjà problème/changements et éléments à conserver (`brief.ts:269–305`) : ne pas rajouter une deuxième formulation des mêmes questions.

## Questions à retenir et à alléger

1. Tous les contextes, dans les pièces jointes : **« Un lien vers vos fichiers ? »**, URL facultative. Aide : « Pour un dossier volumineux, une vidéo, un PDF ou un modèle 3D, collez un lien SwissTransfer, WeTransfer ou un autre lien de partage. Vérifiez sa durée de validité. N’y placez pas de mots de passe ni de données de vos clients. » Ne pas imposer une inscription externe ni aller télécharger automatiquement. Conserver les limites actuelles des images.
2. Vitrine : **« Quels services ou offres faut-il mettre en avant en premier ? »**, texte long facultatif, avec exemple court.  ne pas le rendre obligatoire en plus d’activité/cible/action/pages.
3. Connecté : renommer `dataFields` en **« Quelles informations vos utilisateurs devront-ils retrouver ou enregistrer ? »** ; aide « Par exemple : leur profil, une réservation ou le suivi d’une demande. Décrivez avec vos mots. » Garder la collecte métier obligatoire mais retirer la demande de concevoir des champs. Ajouter **« Combien de personnes utiliseront le site environ ? »**, texte facultatif « Une estimation ou “à définir” suffit. » Ajouter les références visuelles déjà disponibles ailleurs.
4. Refonte : **« Quelle quantité de contenus faut-il reprendre environ ? »**, texte facultatif (pages, articles, produits ; “je ne sais pas” accepté). Cela influence réellement le travail de migration. Rendre `seoDetails` facultatif : avoir un outil ne signifie pas comprendre ses métriques.
5. Évolution : **« Parmi ces changements, lesquels faut-il traiter en premier ? »**, texte facultatif, sans refaire la liste requise des changements. Utile pour proposer une intervention limitée au budget.
6. Sur mesure, Refonte, Évolution uniquement : **« Avez-vous un budget à ne pas dépasser ? »**, texte facultatif avec « Une estimation suffit ; vous pouvez aussi en discuter avec nous. »  Inutile de redemander un budget à chaque petit forfait déjà configuré.
7. 3D : détails du modèle facultatifs ; conserver objet/bénéfice/modèle disponible comme questions principales. Demander un fichier ou un lien plutôt que le poids/format/animations obligatoires que le studio peut analyser.

## Accueil proposé

Garder le titre et les cartes approuvés. Description courte : **« Vous décrivez votre activité et ce que votre site doit permettre. Nous vous aidons à choisir les bonnes fonctions, puis réalisons votre site. »**

Accompagnement utile près des étapes : **« Un doute sur le forfait ? Décrivez votre projet : notre équipe vérifie votre choix avant de commencer. »** C’est cohérent avec les deux FAQ déjà approuvées, sans nouvelle garantie commerciale.

Étapes : **« Choisissez vos fonctions » → « Décrivez votre projet » → « Préparons sa réalisation »**. Le texte du troisième indique que le besoin et la configuration sont repris avec le client. Éviter « un site pour vous », badges génériques, compteurs, avis fictifs, garantie de position Google, délai fixe ou “50 % moins cher” universel. Ne pas promettre une réponse par e-mail déjà envoyée : la destination Resend est encore différée.

## Sources tarifaires effectivement lues

Ces offres primaires ne constituent pas une moyenne française.

- [Agence Easy](https://www.sites-internet-easy.fr/creation-de-sites-internet/tarifs-creation-site-internet.html) : vitrine dès **1 490 € HT**, avancé avec réservation/configurateur/espace privé **2 900 € HT**, refonte **1 900 € HT**, portail/métier **4 900 € HT**. Suivi/hébergement séparés à **29/89/169 € HT/mois**. Offre créateur à 950 € HT liée à un engagement de douze mois : pas un prix autonome. Tarifs indicatifs 2026 avec devis. 
- [123SolutionWeb](https://www.123solutionweb.fr/tarif-site-vitrine/) : affiche **849 €**, TVA non applicable, pour 5–8 pages/mobile, mais présente plus bas **849 € + 42 €/mois pendant douze mois** pour un one-page. Contradiction interne : ne pas retenir 849 € comme référence nette comparable. Le deuxième bloc correspond arithmétiquement à **1 353 € sur douze mois**, sous réserve de confirmation du prestataire.
- [Le Site Français](https://le-site-francais.fr/prix-site-internet/) : location **49/99/129 € HT/mois sur 48 mois**, maintenance/hébergement compris, soit respectivement **2 352/4 752/6 192 € HT engagés**. Pas un achat au prix d’un mois ; les fonctions et modèles de pages varient.
- [WebStart 3D](https://wstart.fr/creation-site-web/3d-website-development/) : devis, **aucun prix visible** dans la page actuelle. Le résultat Google annonçait 1 023 € ; ce montant est écarté faute de confirmation primaire. Aucun prix 3D national déduit.

Conclusion : viser une offre accessible exige un périmètre de base explicite et un coût total comparable. L’économie par gabarits doit financer le cadrage/recette et une marge pour les retours, pas faire disparaître ces tâches. Les six fourchettes finales doivent être des recommandations conditionnelles, jamais des faits de marché ou des prix publiés sans arbitrage.
