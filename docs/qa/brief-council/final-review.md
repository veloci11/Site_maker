# Livraison — questionnaires, accompagnement et étude de prix

Application `82d3e3b9dad94034d2c0f95988472732da2ae873`, poussée sur `veloci11/Site_maker/main`, puis déployée sur https://gilmathis.com/. Release `20261104T024657Z-82d3e3b9dad9` ; version précédente conservée : `20261103T225415Z-099c1a131eef`.

## Résultat

Les sept contextes de brief disposent d’un lien HTTPS de partage facultatif, même sans image, et d’une précision facultative une fois ce lien saisi. WeTransfer, SwissTransfer ou dossier partagé : aucun compte fournisseur demandé et aucune ouverture, requête ou récupération automatique du fichier. Images privées toujours limitées à six fichiers, cinq Mio chacun et vingt Mio au total.

Les questions sont adaptées au besoin : Réservation/Boutique conditionnées aux options réelles ; Connecté décrit acteurs, actions, droits et informations métier ; détails techniques 3D facultatifs ; Sur mesure créatif possible sans données ; Refonte et Évolution précisent reprise, continuité et changements. Budget facultatif sur devis. Les choix d’incertitude sont exclusifs dans les nouveaux envois. L’administration conserve les anciennes réponses sans leur réappliquer les conditions courantes ni réécrire les dossiers.

L’accueil décrit le service et le parcours réel, rassure sur l’aide au choix puis présente revue de sécurité avant livraison et conception tenant compte du RGPD. La qualification d’ingénieur reste dans le texte commercial préparé, à confirmer : le « je pense » reçu ne prouve pas son intervention systématique. Pas de certification, statistiques client ou réduction moyenne inventées. Les images, cartes, badges, grain et prix du catalogue restent inchangés.

Cinq avis indépendants ont été scellés, puis réordonnés anonymement et relus par chacun ; arbitrage documenté dans `protocole-et-arbitrage.md`. Les cinq empreintes initiales ont été revérifiées après intégration. L’étude `../../ETUDE_MARCHE_PRIX_FRANCE_2026-11-03.md` distingue 32 lignes de dix prestataires, agrégats externes, coûts complets, fiscalité et hypothèses de production. Aucun prix proposé n’est publié dans le catalogue.

## Vérification locale

TypeScript, build et **213 tests passent**. Six tests de contrat et cinq tests d’intégration supplémentaires couvrent URL, validation conditionnelle, transport JSON/multipart, idempotence, droits, historique et sauvegarde/restauration SQLite. Rapport brut : `.data/qa/brief-council/check.log`, hors Git.

IAB local : demande Vitrine fictive réellement enregistrée dans une base dédiée, puis relue dans l’administration authentifiée ; lien et description retrouvés, notification indisponible avec zéro tentative d’e-mail. L’erreur en cascade sous une URL invalide a été corrigée puis retestée. Branches Sur mesure, 3D, Refonte, résumé fermé, retour aux options et mobile vérifiés. Session QA déconnectée, configuration initiale rétablie et localhost fermé.

## Vérification publique

Le premier transfert SCP a expiré avant activation. L’archive partielle a été constatée, retransférée complètement, puis vérifiée par SHA-256 avant extraction. Sauvegarde privée, dépendances de production et décodage réel Sharp vérifiés avant bascule atomique ; seul `site-maker.service` redémarré. Santé, quatre offres, 26 options, bases de prix nulles et paiements désactivés confirmés. États/PID des trois services voisins inchangés et GP Park HTTP 200.

Client public `index-BlgVzUM-.js`, SHA-256 `361cc0e2d6fe8b82e8b0b4634d444c82c5ac671bdb4916fd157d02d693b9f04f`, identique au build. Vérification HTTPS via curl ; Python urllib a reçu un 403 et n’a pas servi de preuve de réussite.

IAB public : nouvel accueil, six cartes, un H1, textes de confiance et absence de qualification d’ingénieur confirmés. Refonte : accordéon exclusif, questions de reprise/continuité, lien facultatif sans image, précision conditionnelle et résumé « Lien de partage ajouté » contrôlés. Saisie fictive effacée avant retour à l’accueil ; aucun envoi, téléversement ou e-mail en production. Aucune erreur applicative observée.

Mobile : viewport 390 × 844, document/client 375/375 après réglage natif (scrollbar de 15 px), pas de débordement et une rubrique ouverte. L’accueil empile les deux engagements en une colonne. Une capture déformée par le mélange d’émulation CDP et de viewport natif a été écartée ; `public-refonte-mobile.jpg` est la capture correcte du viewport natif. Réglages temporaires réinitialisés.

Preuves : `public-https.json`, `public-browser.json`, `public-trust.jpg`, `public-refonte-mobile.jpg`, plus `local-browser.json` et `local-storage.json`. L’accueil public est conservé ; localhost arrêté.

## Points restant à décider

Prix et périmètres commerciaux précis, identité/documents légaux et destinataire Resend restent ouverts. La mention d’ingénieur demande confirmation de son intervention réelle. Les tests ne prouvent pas une conformité juridique générale ni la réception d’un e-mail. Le retour ultérieur de Mathis sur le contour des options constitue le lot suivant, sans annuler cette livraison.
