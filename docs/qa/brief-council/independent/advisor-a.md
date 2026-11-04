# Avis indépendant — phase 1

Revue indépendante du code, des sept questionnaires et de l’accueil, le 3 novembre 2026. Sources consultées dans l’IAB uniquement. Aucune modification applicative ni soumission. Les risques de conversion sont des hypothèses UX.

## Diagnostic et priorités

**Aucun P1 confirmé.** Enrichir les renseignements tout en évitant une succession de rédactions. À l’ouverture : Vitrine 10 questions, Connecté 16, 3D 15, Sur mesure 16, Évolution 14, Refonte 17, Contact 3, hors coordonnées/images. Sur mesure présente 10 textes longs ; Connecté et Refonte 8. Comptage direct dans `shared/brief.ts`.

1. **P2 — Aucun lien externe.** `ProjectBriefForm.tsx:472-508` accepte seulement des images, jusqu’à 20 Mio. Ajouter dans « Vos fichiers · facultatif » **« Lien vers vos fichiers »**, facultatif partout : **« Pour des fichiers volumineux, des documents ou un modèle 3D, collez un lien WeTransfer, SwissTransfer ou un autre lien de partage accessible à notre équipe. »** Afficher ce champ avant une erreur de poids, même pour de petits PDF/GLB. Conserver le lien dans le dossier et le récapitulatif, sans téléchargement automatique ni mot de passe. Ne pas promettre la récupération avant expiration.

2. **P2 — Technicité obligatoire.** `shared/brief.ts:202-204` rend obligatoire un champ sollicitant format, poids, textures et animations. Conserver `modelStatus` obligatoire ; rendre `modelDetails` facultatif : **« Avez-vous des précisions sur le fichier 3D ? »**, aide : **« Si vous les connaissez : format, textures, animations. Vous pouvez aussi partager le fichier ci-dessous pour que nous l’examinions. »** Ne pas forcer une fausse précision.

3. **P2 — Sélections incohérentes.** `availableAccess` permet « Je ne sais pas » avec « Administration du site » (`brief.ts:98-105`) ; `interactions3d` combine « À définir ensemble » et des interactions précises (`209-216`). Rendu et validation les acceptent (`ProjectBriefForm.tsx:112-115`, `brief.ts:451-472`). Rendre l’incertitude exclusive. « Accès à récupérer » peut coexister avec certains accès disponibles : le traiter séparément.

4. **P2 éditorial — Accueil inexact.** `public/index.tsx:214-215` annonce nom/e-mail. Quatre coordonnées sont obligatoires : corriger le texte, conserver l’exigence de Mathis.

## Questions à enrichir ou alléger par forfait

| Parcours | Proposition exacte et statut | Décision de conception |
|---|---|---|
| Tous hors Contact | **« Avez-vous déjà un logo ou une identité visuelle à respecter ? »** — facultatif : Oui / En partie / Non / À préciser | « Contenus prêts » ne précise pas l’identité à reprendre. Détails facultatifs conditionnés à Oui/En partie. |
| Vitrine | **« Dans quelles villes ou régions intervenez-vous ? »** — facultatif, aide « Indiquez aussi si votre activité se déroule en ligne. » | Collecter une information directement exploitable dans les contenus et le référencement local, actuellement seulement suggérée par l’exemple d’audience (`34-35`). Ne pas ajouter de jargon SEO. |
| Contenus partiels/à créer | **« Quels contenus restent à préparer, et qui s’en occupera ? »** — conditionnel et facultatif | `contentReady` indique l’avancement, pas la responsabilité (`45-53`). Cette question anticipe un blocage réel sans promettre une rédaction incluse. |
| Connecté | **« Combien de personnes devraient utiliser le site, au lancement puis ensuite ? »** — facultatif, estimation acceptée | Conserver utilisateurs/actions. Ajouter `references` facultatif, absent de cette branche (`179`). |
| 3D | **« Combien d’objets ou de scènes souhaitez-vous présenter ? »** — facultatif, « Une estimation suffit. » | L’objet et les interactions sont déjà présents ; la quantité reste déterminante pour le travail. Ne pas demander un catalogue de contraintes de rendu au débutant. |
| Sur mesure | Rendre `primaryAction` facultatif uniquement ici ; garder **« Décrivez une utilisation du début à la fin »** obligatoire | Le scénario reprend et précise l’action principale. Conserver acteurs et priorités ; ne pas ajouter une seconde question générique « Parlez-nous de votre projet ». |
| Évolution | Aide à `requestedChanges` : **« Pour chaque changement : la page ou fonction concernée, ce qui se passe aujourd’hui et le résultat souhaité. »** | Enrichir le champ existant (`269-270`) ; préservation et accès sont déjà demandés. |
| Refonte | Conserver problèmes/conservation obligatoires, données/SEO conditionnels ; rendre `seoDetails` facultatif | Un rapport disponible n’implique pas que le client sache l’interpréter (`325-327`). Demander les outils connus et permettre leur partage, sans imposer une analyse SEO au prospect. |
| Sur mesure, Évolution, Refonte | **« Avez-vous une enveloppe à respecter ? »** — facultatif, estimation ou « À définir » | Aide à proposer un périmètre réaliste sur devis. Ne pas bloquer une demande ni ajouter cette question aux forfaits déjà configurés. |
| Contact | Conserver demande + coordonnées ; calendrier facultatif | Une question générale ne doit pas déclencher le brief complet de réalisation. |

## Textes d’accueil proposés

Conserver « Votre site internet. Clé en main. ». Paragraphe : **« Choisissez les fonctions utiles à votre activité. Nous vérifions votre demande avec vous pour préparer un site adapté à votre besoin. »**

Étape 2 : **« Décrivez votre projet »** / **« Ajoutez vos réponses, vos fichiers et vos coordonnées. »**

Étape 3 : **« Préparons la réalisation »** / **« Nous vous aidons à confirmer le forfait et les options avant de démarrer. »** Processus concret ; pas de délai, rabais, avis ou client inventé, ni nouveau badge décoratif.

## Sources et limites

- [GOV.UK — Structuring forms](https://www.gov.uk/service-manual/design/form-structure), consulté le 3 novembre 2026 : justifier chaque question et ses utilisateurs, limiter les questions par branche aux informations nécessaires. La préconisation initiale d’une chose par page n’oblige pas à remplacer l’accordéon approuvé ; c’est une piste à tester, pas une modification demandée ici.
- [GOV.UK — Designing good questions](https://www.gov.uk/service-manual/design/designing-good-questions), page mise à jour le 24 juin 2026, lue dans l’IAB : questions simples et compréhensibles, réponses d’incertitude valides, aides proches du champ et brèves. Ces principes motivent les sélecteurs simples et le caractère facultatif des détails techniques.

Pas de test utilisateur ni de mesure d’abandon. Aucun tarif, changement de DA ou d’inclusion. Propositions à arbitrer, pas des modifications livrées.
