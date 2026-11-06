# Corrections et vérifications — 6 novembre 2026

## Changements livrés

Les prix de départ restent Vitrine **890 € / 1–3 pages**, Business **1 490 € / 1–6 pages**, Premium / 3D **2 499 € / 1–10 pages**. Business garde « Populaire » et son CMS ; Premium reprend les prestations Business. Les tarifs unitaires, les inclusions et les suivis 19/39/69 € sont inchangés.

1. **Route indisponible.** Une erreur de chargement différé arrive désormais dans une frontière React Router française. Le visiteur choisit de recharger ; aucun rechargement automatique ni détail technique privé affiché. La protection de navigation des formulaires reste active.
2. **Envoi suspendu.** Le formulaire attend au maximum 30 secondes, en comptant les en-têtes et le corps JSON. Après expiration, il explique que la demande peut déjà être enregistrée et conserve les champs. Une reprise identique utilise le même requestId ; la validation et l’idempotence du serveur restent autoritaires.
3. **Pages supplémentaires.** Quantité explicite, 60–120 € multipliés par page. Trois pages ajoutent 180–360 €. Ancien choix sans quantité = une page. Une quantité invalide est rejetée, sans coercition. La borne de saisie de 100 est une limite technique, pas une promesse commerciale.
4. **Périmètres indépendants.** Langue : 100 €, une langue / cinq pages maximum / traductions fournies. CMS Vitrine : 300 € / cinq pages maximum. Reprise : 100–250 € / cinq pages et quinze médias maximum. Aucun lot n’est multiplié automatiquement. Les volumes supérieurs nécessitent un complément de devis. Le CMS Business/Premium concerne les pages du forfait ; sa portée sur des pages ajoutées est explicitement à confirmer. Unités et limites accompagnent les nouvelles estimations, dossiers et notifications.
5. **Estimation cohérente.** Les nouveaux prix simples affichent « À partir de ». Les fourchettes approuvées restent des fourchettes indicatives. Les anciens instantanés sont conservés, sans réécriture ni changement rétroactif de leurs montants. Paiements toujours désactivés.
6. **Arguments commerciaux.** Vitrine explique la présentation et la prise de contact ; Business met en avant la gestion autonome, les services détaillés, le référencement local et les statistiques ; Premium explique l’identité visuelle et l’étude des besoins particuliers. Le référencement local remonte dans le comparatif initial. Les rubriques Business sont distinguées des textes/photos simples possibles dans Vitrine. La galerie précise que ses références externes illustrent des styles, sans inclure leur périmètre complet dans le tarif de départ. FAQ : 18 questions, avec exemple de calcul pour deux pages et limites indépendantes des options.

## Défauts supplémentaires détectés pendant la contre-revue

- Le PATCH d’un projet privé pouvait conserver cinq pages lorsqu’on revenait à une, car la valeur canonique de un est omise. Corrigé et testé sur l’API réelle ; une modification partielle sans nouvelle sélection conserve sa quantité.
- À 320 px, le plancher CSS de 320 px débordait de 15 px lorsque la barre de défilement réservait sa place. Seules les largeurs minimales de html/body ont été retirées, sans masquer les débordements. Le contrôle local constate client/scroll = 305/305, avant et après ouverture/fermeture du menu.

## Vérification

`npm run check` final : TypeScript, build et **268 tests passent**. Tests ciblés : vrai rejet route.lazy à l’ouverture et en navigation ; fetch suspendu ; JSON suspendu ; annulation appelante ; retour tardif après enregistrement ; même dossier retrouvé au nouvel envoi ; quantités, limites, anciens brouillons et instantanés ; exclusivité des suivis et absence de paiement en double avec la boutique.

IAB local : module du configurateur réellement bloqué, écran français observé et bouton Recharger opérationnel après rétablissement. POST suspendu au navigateur : délai constaté, champs conservés, nouvelle tentative portant le même identifiant, puis confirmation réelle. Deux demandes stockées uniquement dans une base isolée, zéro tentative e-mail (voir `local-submissions.json`). Confirmation du formulaire général contrôlée sur mobile.

IAB public : nouveau client, trois ouvertures/retours ordinateur et trois mobile, prix/pages/CMS, comparatif détaillé, FAQ et filtres galerie 1/2/6. Quantités 3 puis 1 contrôlées dans Business. La boutique masque les liens de paiement ; sélectionner successivement les trois suivis ne conserve que Sérénité. Le formulaire reste à droite sur ordinateur et s’adapte au mobile. Aucun formulaire de test soumis en production.

Les captures et `public-checks.json` distinguent les premières observations et les recontrôles après correction du débordement à 320 px. Les essais sont réalisés dans le navigateur intégré avec des dimensions responsive ; ils ne constituent pas un essai sur tous les téléphones physiques, Safari ou tous les réseaux.

## Limites opérationnelles connues

Le destinataire `INQUIRY_TO` n’est toujours pas configuré : les demandes s’enregistrent, mais aucune réception e-mail réelle n’est attestée. Les informations légales définitives restent à fournir. Aucun nom, avis client, résultat SEO, délai garanti ni rentabilité n’a été inventé. Les prix approuvés ne constituent pas à eux seuls une démonstration de marge.

Les originaux d’image, les transitions approuvées, les fichiers Sites protégés et le déclenchement manuel de CI restent inchangés. La publication conserve les anciennes releases ; les données privées et les autres services sont comparés avant/après.

## Publication finale

Révision `dbcd9e38577fb155c00ae42b9ffba4d61edd3996`, release `20261106T202312Z-dbcd9e38577f`. Le client `/assets/index-CcPXBE2O.js` est confirmé sur gilmathis.com. Après correction CSS : largeurs client/scroll identiques à 305/305, 375/375, 805/805 et 1265/1265 pour les viewports 320, 390, 820 et 1280. Aucune erreur ou alerte de console publique observée. FAQ : 18 questions. Le contrôle final des sept tables privées, du tarif stocké et des 24 autres services est identique à l’état préalable. Serveur local arrêté, données de test supprimées et préférences du navigateur rétablies.
