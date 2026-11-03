# Revue finale — galerie et parcours publics, 3 novembre 2026

Version applicative `099c1a131eef6129e67a979587871eda501a1b1f` poussée sur main, puis publiée dans `/home/mathis/site-maker/releases/20261103T225415Z-099c1a131eef`. Contrôles publics effectués exclusivement dans le navigateur intégré. Les trois revues initiales sont conservées avec leur contexte et leurs limites ; ce document fixe l’état après intégration et publication.

## Demandes livrées

- La remarque de l’ami sur les couleurs unies est annulée : badges, matières et variantes approuvés conservés. Filtres blancs au repos, texture au survol ou à la sélection ; aucun nouveau style de badge.
- L’introduction au-dessus des filtres est retirée ; un H1 accessible reste présent. Dix références externes créditées, sans revendication de relation client.
- Vitrine : DOMTEKNIKA, Lactel, Aéma Groupe. Connecté : Cal.com, GeoBoss. 3D : Tiny Heaven, Satellite Story, Atlante. Sur mesure : Julie Thiam, Addiction Agency. Une catégorie et un badge par site. Aucun tag secondaire ne modifie le filtrage.
- Cal.com ajoute un exemple réel avec connexion utilisateur, vérifiée sans compte créé ni connexion effectuée. La provenance de sa capture native figure dans `../../asset-sources/examples/cal-com-source.md`.
- Contrôle public des cinq filtres par clic natif : scroll à 18 px conservé pour chaque changement ; 3/2/2/3/10 résultats selon 3D/Sur mesure/Connecté/Vitrine/Tous. Les quarante liens de référence portent target blank et rel noopener noreferrer. Les sites restent externes, sans chargement de leurs scènes dans la galerie.

## Revue critique et corrections

Trois spécialistes distincts : interface/parcours, performance et SEO. Aucun P1 confirmé dans le périmètre audité. La revue ne certifie pas tous les états possibles de l’administration ni la conformité juridique.

| Constat | État final et preuve |
|---|---|
| Perte de la saisie en quittant un brief | Garde de sortie et lien Confidentialité dans un autre onglet. Contact et Vitrine testés localement, y compris Retour et refus de changer de forfait. Contact recontrôlé en production : Rester conserve la saisie fictive, Quitter mène à la galerie. Aucun envoi. |
| Actions de carte hors d’un écran bas | Carte non sticky sous 681 px de hauteur sur ordinateur. Action de retour aux options réellement retestée à 1066 × 600 CSS. |
| Pied de page visible dans le fallback puis repoussé | Hauteur de contenu réservée. CLS public observé après correction : environ 0,00007 sans cache navigateur et 0 avec cache sur les trois routes mesurées. |
| Formulaire chargé sur l’accueil et la galerie | Chunk ProjectBriefForm absent des ressources de ces deux routes après correction ; présent seulement sur le parcours qui l’utilise. Pas de promesse de baisse globale des octets, le routeur de données étant aussi intégré dans l’entrée. |
| Titres génériques, canoniques absents et soft 404 | Métadonnées par route livrées dans le head serveur et suivies dans la SPA, douze URL dans un vrai sitemap XML, robots texte, aliases 301, inconnus et assets absents en 404. Coquilles privées et pages légales provisoires noindex. |
| Réponses FAQ absentes tant que fermées | Dix réponses présentes dans le DOM, panneaux fermés de hauteur zéro et masqués. Ouverture puis remplacement par une autre réponse testés dans l’IAB local, une seule ouverte. |
| Informations de l’éditeur encore provisoires | Reste à renseigner avec des informations réelles. Aucune identité ou adresse inventée. |

## Mesures publiques après publication

Viewport réel 1280 × 720 CSS, DPR 2, sans ralentissement CPU/réseau. Un échantillon par route et condition, cache navigateur ignoré puis actif ; CDN/DNS/TLS non remis à zéro. Ce sont des observations initiales dans l’IAB, pas des données terrain ni une certification Core Web Vitals. Les images différées peuvent terminer après l’instant de collecte ; les transferts ne constituent pas un budget complet par route.

| Route | LCP cache ignoré / actif | CLS cache ignoré / actif |
|---|---:|---:|
| Accueil | 616 / 592 ms | 0,00007 / 0 |
| Galerie | 608 / 568 ms | 0,00007 / 0 |
| Vitrine | 820 / 584 ms | 0,00007 / 0 |

Le problème principal du pied de page mesuré avant publication (CLS environ 0,13 sur accueil/galerie avec cache) ne se reproduit plus dans ces mesures. Aucun test INP, FPS ou percentile de visites réelles n’est annoncé. Le corps demeure rendu côté client : aucune migration SSR ni garantie d’indexation ou de position Google. Les prix restent non arrêtés et l’adresse Resend sera fournie plus tard par Mathis.

## Validation et livraison

TypeScript, build et **202 tests réussis** après les derniers changements fonctionnels. Textures approuvées comparées octet pour octet, fichiers de compatibilité Sites intacts. Santé HTTPS et client `index-DZiCU2sY.js` identiques au build par SHA-256 `e5935505beb738db90db2506195c7329874126f630278abeaf724807833fd20a`. Sauvegarde privée puis décodeur Sharp testés avant activation sur Ubuntu ; autres services et PID des projets voisins inchangés, GP Park HTTP 200. Les répertoires et services restent isolés.

Galerie mobile contrôlée à 390 × 844 CSS : document/client 390/390, deux résultats Connecté, aucun débordement horizontal. Zéro erreur applicative observée dans l’onglet public. Pas de formulaire soumis, d’image jointe envoyée ni de message de test à un tiers. Saisie fictive de contrôle abandonnée après le test. Localhost arrêté, ports 4173/4174 libres ; onglets locaux et de recherche fermés, galerie publique conservée. Émulation et cache de diagnostic rétablis.

Preuves : `public-gallery.json`, `public-performance.json`, `public-https.json`, `local-filters.json`, `local-guard-and-faq.json`. Captures natives : `public-gallery-desktop.png`, 2560 × 1440 pixels pour 1280 × 720 CSS/DPR 2 ; `public-gallery-mobile.png`, 390 × 844 pixels/CSS à DPR 1.
