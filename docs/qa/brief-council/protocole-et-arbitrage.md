# Conseil de cinq agents — questionnaires, accueil et prix

## Méthode retrouvée et réellement appliquée

Méthode reprise du chat « Retrouver la prochaine publication », où le travail sur une publication DOMTEKNIKA utilisait cinq conseillers puis un arbitre. Le fichier de consignes de ce chat a été lu pour retrouver le protocole, sans réutiliser ses conclusions éditoriales pour ce site.

1. Cinq missions distinctes : ergonomie et débutants ; exigences Vitrine/Connecté ; fiabilité et données privées ; 3D et reprise de site ; acheteur sceptique et positionnement.
2. Chaque conseiller a lu le code initial et remis son analyse sans consulter les autres. Les fichiers de `independent/` ont été scellés par SHA-256 avant la suite ; ils sont restés inchangés.
3. Les cinq contributions ont été réordonnées dans `dossier-anonymise.md`, sous les lettres A–E, sans nom ni spécialité d’auteur. Chacun a ensuite relu les cinq avis et déposé sa propre révision dans `relecture/`.
4. L’agent parent a arbitré sur les faits, le coût des questions et la possibilité de vérifier les changements. Il a intégré les modifications et assuré les contrôles de code, navigateur et livraison.

Cinq conseillers et cinq relectures, pas un simple avis collectif produit puis attribué à cinq rôles. Chaque agent pouvait reconnaître son texte : l’anonymisation des autres auteurs ne constitue pas un aveugle total. Ce sont des analyses d’agents sur un même projet, pas cinq entretiens utilisateurs ou des certifications professionnelles.

## Arbitrage final

| Sujet | Décision et raison |
|---|---|
| Fichiers lourds ou autres formats | Lien HTTPS facultatif dans « Vos fichiers », même sans image ; précision facultative une fois le lien saisi. La taille des images reste bornée à 20 Mio. Aucun téléchargement, aperçu ou test d’accessibilité automatique. |
| Technicité imposée au client | Précisions du fichier 3D et des rapports SEO facultatives. Le client fournit son besoin ; l’équipe analyse les fichiers et outils. |
| Sur mesure créatif | Ajouter le choix Oui/Non/À définir pour les informations à gérer. Le détail est facultatif et affiché si Oui. Scénario et priorités restent structurants ; l’action principale n’est plus un doublon obligatoire. |
| Connecté | Conserver les acteurs, actions et droits ; reformuler les données en informations que l’utilisateur retrouve ou modifie. Ajouter un ordre de grandeur facultatif et les références visuelles. |
| Réservation et Boutique | Retenues malgré une objection sur le coût d’intégration : deux questions facultatives ont une utilité directe. La configuration est déjà validée avant le brief ; un contexte partagé suffit à les montrer et les valider côté serveur. Aucune sélection ou facturation automatique. |
| Refonte et Évolution | Estimation de contenus en Refonte ; aide sur le changement de domaine et la continuité ; situation actuelle/résultat/priorité dans la même question Évolution. Budget facultatif sur les trois prestations sur devis. |
| Ajouts universels | Écartés : accumuler logo, zone, validateur, budget, priorités et restrictions répéterait les champs existants. Les aides et branches recueillent ce qui change réellement le travail. |
| Incertitude | « Je ne sais pas » / « À définir ensemble » exclusifs des choix précis dans les nouveaux envois. Un accès disponible peut coexister avec d’autres accès à récupérer. |
| Historique | Les nouvelles règles ne revalident pas les snapshots admin. Les anciennes données et combinaisons restent visibles, sans migration ni réécriture. Les nouvelles demandes suivent les règles courantes. |
| Accueil | Service explicite, aide au choix du forfait, trois étapes décrivant le vrai brief. Aucune statistique client, économie moyenne ou opinion de client inventée. |
| Sécurité et RGPD | La dernière clarification vise les sites livrés. Texte public : revue avant livraison et site conçu pour respecter le RGPD. La qualification de l’intervenant reste en texte préparé tant que l’intervention systématique est seulement « je pense ». Les protections de notre formulaire ne prouvent pas la conformité de chaque site client. |
| Prix | Étude séparée : 32 prestations/estimations chez dix prestataires, données France Num et observatoire clairement séparés. Six recommandations conditionnelles ; aucun prix publié dans le catalogue. |

## Vérifications effectuées

TypeScript, build et 213 tests passent après les derniers changements fonctionnels. Six nouveaux tests du contrat et cinq tests d’intégration réels complètent les vérifications existantes : transport JSON/multipart, idempotence, droits admin, notification injectée et restauration SQLite. Les anciennes réponses conditionnelles et sélections contradictoires restent lisibles.

Dans l’IAB local, avec une base temporaire isolée : un brief Vitrine fictif a été soumis, puis relu dans l’administration authentifiée. Lien et description présents, lien explicite en nouvel onglet, notification indisponible et aucune tentative d’e-mail. Correction d’une erreur en cascade trouvée pendant ce contrôle : un lien invalide ne demande plus d’effacer sa description.

Sur mesure Oui/Non, détails 3D et SEO facultatifs, exclusivité des choix, références de fichiers repliées, retour aux options et mobile 390 × 844 testés. Une seule rubrique ouverte et aucun débordement horizontal observé. Configuration locale initiale rétablie et session QA déconnectée. Voir `local-browser.json`, `local-home.png` et `local-trust.jpg`.

Les recommandations React et Web Interface Guidelines ont été appliquées au périmètre modifié : contrôles nommés et étiquetés, aide et erreurs reliées au champ, premier champ en erreur focalisé, `type=url`, pas de données privées persistées dans localStorage, pas de nouvelle animation ni requête externe liée au lien. Texte de succès distinguant enregistrement et livraison de l’e-mail conservé.

Les tests locaux ne sont pas une preuve de production. Les preuves publiques et la révision livrée sont ajoutées dans le compte rendu final de publication. Aucun formulaire ne doit être soumis en production pour ce contrôle.
