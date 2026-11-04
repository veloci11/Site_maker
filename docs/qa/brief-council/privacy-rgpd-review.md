# Protection des données — conseil produit, 3 novembre 2026

Revue de code, sans modification applicative ni certification juridique. L’IAB n’étant plus exposé dans le contexte de ce conseiller, aucune recherche Chrome n’a été utilisée. Les deux sources CNIL ci-dessous ont été effectivement lues dans l’IAB par le parent, qui a transmis leur contenu pour cet arbitrage.

## Sources et conséquence pratique

- [CNIL — Informer les personnes](https://www.cnil.fr/fr/informer-les-personnes), page datée du 27 janvier 2020, consultée le 3 novembre 2026 par le parent : information concise et accessible lors de la collecte. Elle couvre organisme/contact, finalités, base légale, champs requis/facultatifs et conséquences, destinataires/sous-traitants, durée ou critères, droits/modalités d’exercice, réclamation CNIL et éventuels transferts hors UE.
- [CNIL — Minimisation](https://www.cnil.fr/fr/definition/minimisation), consultée le même jour par le parent : limiter les données à celles pertinentes et nécessaires à la finalité.

Ces exigences appellent une information réelle et une organisation opérationnelle. Elles ne permettent pas de déduire une conformité générale du seul contrôle d’accès technique. Ne pas publier de sceau « conforme RGPD », certification ou « RGPD inclus » dans tous les forfaits sur cette base.

## Protections observables et limites

`server/inquiry-admin.mjs:21` impose authentification et rôle administrateur pour les dossiers et images ; les images sont servies avec cache privé/no-store (`:45–54`). Le formulaire enregistre réponses et images dans des tables privées, avec transaction (`server/inquiries.mjs:170–188`). Le script de sauvegarde exclut les répertoires publics et inclut la base ; une sauvegarde n’établit pas sa durée de conservation.

Le récapitulatif prévoit l’envoi des coordonnées/réponses et des métadonnées d’images via Resend (`humanMessage`, `buildMail`, URL d’envoi). Les images ne sont pas jointes au mail. L’adresse de réception reste explicitement différée ; aucun envoi réel vérifié ici. Les liens de transfert feront partie du brief : la confidentialité de leurs fichiers dépend aussi du fournisseur et du partage choisi.

Les réponses du formulaire restent en mémoire avant envoi. Le configurateur utilise du stockage local pour ses choix ; l’authentification emploie des cookies. Éviter « aucun cookie », « aucune donnée partagée », « hébergement européen », « chiffré de bout en bout » : ces garanties ne sont pas établies par cette revue. Aucun mécanisme de purge des demandes ni durée juridique déterminée n’a été trouvé dans le périmètre lu.

## Copies courtes proposées

**Accueil**, petite mention près des étapes, lien Confidentialité dans un nouvel onglet :

« Vos demandes et images jointes sont consultables dans l’espace protégé du studio. »

Alternative plus simple : « Vos réponses et images jointes ne sont pas publiées sur le site. »

Préférer ces faits à « accessibles uniquement au studio », qui pourrait masquer les traitements techniques des prestataires et les copies de sauvegarde.

**Formulaire**, à côté de l’action et du lien Confidentialité :

« Vos coordonnées et vos réponses servent à étudier votre demande et à vous recontacter. Les champs marqués d’un * sont obligatoires pour envoyer ce formulaire. »

Le marquage obligatoire décrit l’interface ; il ne démontre pas la nécessité juridique de chaque donnée. Le téléphone reste obligatoire selon le choix explicite de Mathis, sans modification ici. Sa nécessité et sa proportionnalité doivent être documentées, ou son caractère facultatif réévalué. Une case générique de consentement ne règle pas cette question.

## Confidentialité : contenu partiel utile

Structurer les faits actuels en trois paragraphes : **Informations transmises** — coordonnées, réponses, configuration, images et lien facultatif ; **Utilisation** — étude de la demande et prise de contact ; **Accès et circulation** — dossier protégé, sauvegardes privées, récapitulatif pouvant être transmis par Resend, images consultées dans l’administration, lien externe sans téléchargement automatique.

Avant toute allégation de conformité achevée, renseigner et vérifier : responsable du traitement et contact effectif pour les droits ; bases légales par finalité ; nécessité des champs ; conservation/purge et sauvegardes ; prestataires, contrats et localisation/transferts ; procédure de droits et information sur la réclamation CNIL. Ne pas inventer identité, adresse, durée ou fondement juridique. Un formulaire de contact déjà incomplet ne remplace pas ces mentions. La page actuelle `LegalPage` reste une information provisoire, à compléter concrètement.


## Clarification ultérieure de Mathis

La demande RGPD concerne les sites livrés, avec intervention souhaitée d’un ingénieur spécialisé en cybersécurité, pas seulement les demandes collectées par notre formulaire. Le bloc sur les demandes privées préparé lors de l’interprétation initiale a été écarté. L’accueil retient un processus de revue et de conception attentive au RGPD. L’intervention systématique de l’ingénieur reste exprimée par « je pense » : son texte est préparé séparément, sans qualification présentée comme vérifiée. La page légale provisoire existante n’a pas été transformée en certification.
