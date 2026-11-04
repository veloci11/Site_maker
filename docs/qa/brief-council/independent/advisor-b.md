# Avis indépendant — questionnaires fonctionnels

Phase 1, 3 novembre 2026. Lecture du catalogue, des sept briefs, du formulaire et du contrat V2 ; recherche primaire dans l’IAB uniquement. Aucun autre avis consulté, aucun changement applicatif, aucune soumission. Angle : exigences exploitables par un développeur, surtout Vitrine et Connecté.

## Diagnostic

Connecté demande les acteurs, leurs actions, l’inscription, les droits, les données, les imports et les connexions (`shared/brief.ts:145–179`). Refonte couvre conservation, URL, accès, référencement et continuité (`:288–350`). Il ne faut donc pas refaire un inventaire technique complet.

Deux lacunes concrètes : le formulaire connaît la configuration mais construit les questions seulement à partir du type de demande (`ProjectBriefForm.tsx:158–160`), et la zone de pièces jointes n’accepte que des images bornées à 20 Mio (`:472–490`). Les options Réservation, Boutique et CRM (`shared/offer-options.ts:21–75`) ne déclenchent aucune question dédiée. Connecté n’a pas de question de références visuelles, alors que les autres créations en ont une (`shared/brief.ts:179`, à comparer avec `:125`, `:233`, `:262`).

Friction probable, à tester avec de vrais débutants : le champ obligatoire « Quelles informations faut-il gérer ? » demande déjà de raisonner en types de données et champs (`shared/brief.ts:109–112`). Ce n’est pas un défaut bloquant démontré par un test utilisateur, mais le vocabulaire est celui de la conception d’un modèle de données.

## Priorités et questions proposées

1. **Fichiers : champ facultatif toujours disponible dans la rubrique existante.** Renommer celle-ci « Vos fichiers · facultatif ». Ajouter `transferUrl`, type URL : **« Lien de téléchargement de vos fichiers »**. Aide : « Pour les fichiers volumineux, vidéos ou modèles 3D, ajoutez un lien WeTransfer, SwissTransfer ou un dossier partagé accessible à notre équipe. Aucun mot de passe ni donnée personnelle de vos clients. » Ne pas attendre une erreur de poids pour afficher ce champ. C’est un moyen d’envoi facultatif, pas une option tarifaire. Valider HTTP(S), sans identifiants ; ne pas télécharger automatiquement. Dans l’admin, conserver le lien comme une information distincte des pièces jointes réellement stockées. Un lien reçu ne prouve ni son accessibilité future ni son contenu.

2. **Connecté : reformuler le champ de données, sans en ajouter un doublon.** Garder son caractère obligatoire, mais écrire : **« Quelles informations vos utilisateurs doivent-ils retrouver ou modifier ? »** Aide courte : « Par exemple : leurs demandes, réservations ou fiches produits. Décrivez un exemple fictif ; “À définir ensemble” convient aussi. » Le développeur déduira ensuite les champs techniques. Conserver les questions actuelles sur les droits et l’inscription : elles distinguent correctement compte et autorisation.

3. **Connecté : rendre le parcours métier plus concret en remplaçant `workflow`.** **« Décrivez ce qui se passe lorsqu’un utilisateur réalise l’action principale. »** Textarea, facultatif. Aide : « Que fait-il, que reçoit-il, et qui vérifie ou traite sa demande ? » Cela précise états, notifications et interventions humaines sans demander de jargon. Ne pas ajouter simultanément une autre question « parcours idéal ».

4. **Connecté : ordre de grandeur.** **« Combien d’utilisateurs et de fiches prévoyez-vous au lancement ? »** Texte facultatif ; « Une estimation suffit. Par exemple : 50 membres, 200 produits ; sinon, indiquez “Je ne sais pas”. »

5. **Connecté : ajouter le champ `references` partagé** dans la dernière rubrique, facultatif.

6. **Vitrine : rattacher le contenu à un périmètre utilisable.** Garder pages/rubriques obligatoires, mais préciser dans l’aide : « Pour chaque page, notez ce qu’elle doit présenter. Une liste provisoire suffit. » Étendre l’aide d’`audience` à la zone desservie si elle compte pour l’activité. Ne pas ajouter un questionnaire SEO obligatoire à toutes les vitrines.

7. **Options sélectionnées : seulement des branches pertinentes.** Si Réservation est choisie, une textarea facultative : **« Que doit-on pouvoir réserver et comment confirmez-vous la réservation ? »** Si Boutique : **« Que souhaitez-vous vendre et comment les commandes seront-elles traitées ? »**, avec exemple sur nombre de produits, livraison ou retrait. Si CRM : réutiliser `integrations`, pas un doublon. Ces réponses ne sélectionnent ni ne facturent une option. L’API doit valider leur contexte avec la configuration reçue ; ne pas simplement cacher des champs côté navigateur.

## Ce que je retire ou évite

Pas de demande de framework, base de données, fournisseur d’authentification, clés API, stratégie de mots de passe, liste d’événements webhooks ou données réelles : ce sont des décisions d’implémentation ultérieures. Pas de nouveau long texte générique « contraintes techniques » ; `constraints` existe déjà. Pas de priorité, budget et identité détaillée imposés partout : le besoin minimal doit rester envoyable et le brief peut être complété pendant l’échange. Les quatre coordonnées obligatoires résultent d’une décision explicite de Mathis, à conserver.

## Sources primaires lues

- [GOV.UK — Structuring forms](https://www.gov.uk/service-manual/design/form-structure) : justifier l’utilisation de chaque réponse et n’afficher que les questions pertinentes via des branches. L’accordéon retenu reste une adaptation du produit ; la source propose de commencer par une chose par page.
- [GOV.UK — Designing good questions](https://www.gov.uk/service-manual/design/designing-good-questions), mise à jour affichée au 24 juin 2026 : questions simples, possibilité de ne pas savoir et aide brève. Cela soutient les reformulations ; aucune hausse chiffrée de conversion n’en est déduite.
- [Auth0 — Role-Based Access Control](https://auth0.com/docs/manage-users/access-control/rbac) : distinguer responsabilités, rôles et actions autorisées, avec le minimum de permissions nécessaire. Les questions actuelles de Connecté sont donc utiles ; elles ne justifient pas de demander la technologie d’authentification au prospect.

## Confiance sur l’accueil

Privilégier des preuves consultables : un lien clair vers le comparatif et des références explicitement externes. Deux formulations factuelles possibles, sans les cumuler en badges décoratifs : **« Nos développeurs vérifient votre besoin avant de démarrer. »** (engagement déjà validé en FAQ) ; **« Modifiez vos options avant d’envoyer votre demande. »** (parcours réellement disponible). Ni statistiques clients, ni économie moyenne, ni prix figé, ni délai inventé. La réception réelle d’un e-mail reste à terminer ; ne pas en faire un argument acquis.

Limite : revue de code et sources, sans test utilisateur ni nouvelle navigation des formulaires locaux. Les questions finales et leur charge doivent être arbitrées après les cinq avis.
