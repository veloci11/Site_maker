# Avis indépendant — fiabilité du brief et des fichiers

Phase 1, 3 novembre 2026. Revue indépendante du code, deux sources lues dans l’IAB. Aucun autre avis lu, aucune soumission ou modification applicative.

## Ce qui fonctionne déjà

Validation partagée navigateur/serveur, clés inconnues rejetées et conditions évaluées sur les parents validés (`shared/brief.ts:405–501`). Transaction demande/brief/images/outbox et idempotence incluant les octets (`server/inquiries.mjs:168–188`). Consultation et images réservées à l’admin (`server/inquiry-admin.mjs:21–53`). Garde de navigation et retour aux options conservant la saisie déjà présents ; ne pas les réimplémenter ni mettre coordonnées/liens privés dans localStorage.

## Priorités

**P2 confirmé — aucun moyen de fournir les contenus lourds.** La section finale accepte uniquement six images JPEG/PNG/WebP, 5 Mio chacune et 20 Mio au total (`ProjectBriefForm.tsx:472–507`, `brief-form-files.ts:19–30`). Les textes, documents, archives, vidéos et modèles 3D ne passent pas ; l’erreur ne propose qu’un allègement. Ajouter le lien dès cette section, facultatif et disponible même sans image, plutôt que seulement après une erreur.

Questions proposées, communes aux sept contextes :

- « Lien de téléchargement de vos fichiers » — URL facultative. Aide : « Pour vos documents, vidéos, modèles 3D ou fichiers de plus de 20 Mio : ajoutez un lien WeTransfer, SwissTransfer ou un autre espace de partage. N’indiquez aucun mot de passe. »
- « Que contient ce lien ? » — texte facultatif, affiché si le lien existe. Aide : « Par exemple : logo, textes, photos ou modèle 3D. Indiquez sa date d’expiration si vous la connaissez. »

Le lien est facultatif, non facturable, sans compte fournisseur obligatoire ni conservation illimitée promise.

**P2 — préserver réellement l’historique lors de la refonte du questionnaire.** Le DTO conserve les réponses brutes mais son résumé est recalculé avec le questionnaire actuel (`server/inquiry-admin.mjs:30–37`, `shared/brief.ts:506`). Supprimer des identifiants ou des valeurs de choix ferait disparaître leurs réponses du résumé. Conserver les anciens identifiants/valeurs et une lecture historique ; si une question disparaît du parcours neuf, ne pas jeter son contenu archivé. Le message enregistré constitue déjà un instantané utile (`server/inquiries.mjs:142–151`). Ce risque concerne la modification envisagée, pas une perte constatée en production.

**P3 confirmé — réponses contradictoires possibles.** Les multisélections ajoutent chaque valeur sans exclusivité (`ProjectBriefForm.tsx:111–113`), et la validation vérifie seulement appartenance et unicité (`shared/brief.ts:451–472`). « Je ne sais pas » peut donc accompagner des accès précis ou des interactions 3D. Rendre les choix d’incertitude exclusifs dans l’UI et dans la validation ; ne pas supprimer les valeurs historiques.

## Questions métier à préciser sans alourdir tous les parcours

- **Vitrine :** remplacer le fourre-tout par « Quelles informations vos visiteurs doivent-ils trouver pour vous contacter ? » — facultatif, exemples téléphone, adresse professionnelle, zone desservie, formulaire. Ne pas demander l’adresse personnelle du porteur.
- **Connecté :** « Combien de personnes utiliseront le site au lancement ? » et « Certains contenus doivent-ils rester réservés à une personne ou un groupe ? » — facultatifs, ordre de grandeur ou « À définir ». Prévoir une branche sur les catégories de données sensibles, sans demander d’exemples réels ni d’export client.
- **3D :** « Combien d’objets, de produits ou de scènes sont concernés ? » — facultatif. La description du modèle ne doit pas forcer un débutant à connaître poids/format ; conserver une réponse d’incertitude. « Avez-vous l’autorisation d’utiliser ces modèles et visuels ? » — facultatif : oui / à vérifier / à créer, sans promesse juridique.
- **Sur mesure :** conserver le scénario complet et les priorités de lancement, déjà utiles. Ajouter seulement « Quels volumes approximatifs devons-nous prévoir ? » — facultatif, exemples comptes, opérations ou documents ; éviter un second inventaire des données et validations.
- **Évolution :** demander « S’agit-il d’ajouter une fonction ou de corriger un problème ? » puis, uniquement pour un problème, « Quelle action pose problème, que se passe-t-il et quel résultat attendez-vous ? ». Facultatif ; captures ou lien de transfert possibles.
- **Refonte :** « Disposez-vous d’une sauvegarde récente récupérable ? » — facultatif, oui / non / je ne sais pas. La continuité et les URL importantes sont déjà bien couvertes : ne pas demander au prospect de réaliser lui-même un audit SEO.

## Implémentation et vérifications indispensables

Stocker le lien comme réponse du brief dans une section commune Fichiers. Le JSON/multipart, le hash d’idempotence, SQLite, la sauvegarde, le résumé admin et l’e-mail texte peuvent alors le transporter sans nouveau stockage de fichiers ni endpoint de téléchargement. Conserver la limite d’images ; un lien n’autorise pas un import automatique de gros fichiers.

Réutiliser la validation URL bornée à 2048 caractères : protocole HTTP(S), pas d’identifiants, caractères de contrôle, espace ou antislash (`shared/brief.ts:393–403`). HTTPS seul pour ce champ est préférable. Ne faire **aucun fetch, HEAD, résolution DNS, aperçu ou vérification automatique** du lien. L’admin peut disposer d’un lien explicite affichant son domaine, avec nouvel onglet et `noopener noreferrer`. Aucun lien de transfert privé dans les pages publiques, analytics ou journaux d’erreur. Aucune liste fermée de deux fournisseurs nécessaire si rien n’est téléchargé.

Tester : absent/valide/invalide, changement de fournisseur, liens courts `we.tl`, userinfo trompeur, protocoles actifs, conditions et erreur ciblée ; même UUID/même lien = même demande, lien changé = conflit ; JSON et multipart ; lecture admin/notification injectée/restauration ; ancienne demande lisible ; conservation du lien en repliant et en revenant aux options.

## Confiance et sources

La transaction étaye « demande enregistrée » ; elle n’étaye pas « e-mail livré » ni « traitement immédiat ». Le destinataire Resend reste différé. Aucun avis client, taux de satisfaction ou rabais moyen sans preuve. Les pièces jointes sont effectivement privées dans l’application, mais le lien externe reste soumis aux réglages du fournisseur.

- [OWASP SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) : une URL utilisateur devient un risque de requête serveur lorsqu’elle est suivie ; la conserver sans la visiter évite d’introduire ce comportement.
- [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) : défenses combinées, bornes de taille/type et stockage hors accès public ; le lien ne justifie pas de retirer les protections existantes.

Pas de test de production, d’appareil physique ou de benchmark. Onglet fermé.
