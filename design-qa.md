# Vérification visuelle — configurateur sans compte, 2 novembre 2026

final result: passed

La source fournie sert de référence de structure pour la grande carte colorée. Les décisions explicites de Mathis priment : carte à gauche, options à droite façon Apple, texture studio déjà approuvée, Geist unique, aucun exemple de site dans le configurateur. Il ne s’agit pas de copier les couleurs, les fonctions audio ou les promotions d’ElevenLabs.

## Sources et comparaison normalisée

- Vérité visuelle : `docs/qa/anonymous-configurator/source-structure.png`, copie de la pièce jointe sélectionnée, 3000 × 1610 px. Son viewport CSS et sa densité ne sont pas connus.
- Implémentation : `vitrine-desktop.jpg`, IAB sur `http://127.0.0.1:4173/forfaits/vitrine?nouveau=1`, Vitrine avec adaptation mobile sélectionnée, sans compte.
- Viewport CSS ordinateur observé : 1280 × 720, DPR 2 ; capture de contenu renvoyée par IAB : 1265 × 712 px. Viewport mobile : 390 × 844, DPR 1, capture 375 × 812 px. Les captures sont conservées à leur taille reçue, sans inventer la taille CSS de la source.
- Comparaison plein cadre : `comparison-full.jpg`, source et capture réunies dans la même image à 1280 px de largeur. Les différences de navigation et l’inversion des colonnes sont intentionnelles.
- Comparaison ciblée : `comparison-card.jpg`, carte source recadrée et carte studio complète, normalisées à 560 px de large. La carte studio contient davantage de texte utile ; son prix est placé sous les inclusions comme dans la carte studio approuvée.
- Les deux planches combinées ont été ouvertes et évaluées, puis le recadrage de détail ajusté pour conserver les coins de la carte entière. Aucun asset source n’a été remplacé par du dessin HTML.

## Itérations et corrections

1. P2 constaté au changement d’étape : le focus automatique faisait passer le titre des coordonnées sous le header fixe. Correction : focus sans scroll automatique, retour en haut sur ordinateur et alignement explicite sous le header sur mobile. Preuves après correction : `contact-desktop.jpg` et `contact-mobile.jpg` ; titre entièrement visible.
2. P2 ergonomique mobile : première colonne du comparatif trop large, ne laissant qu’une partie du premier forfait visible. Correction : colonne de 156 px, tableau de 764 px, libellés figés et indication de défilement sur mobile. Preuves : `comparison-mobile.jpg` / `comparison-desktop.jpg`. Mesures réelles : première colonne 156 px et aucun débordement global.
3. Revenir au même forfait depuis le menu après une confirmation ouvrait encore l’état de confirmation. Correction : clé de navigation du configurateur, brouillon conservé et état de formulaire renouvelé. Essai local complet : demande enregistrée, clic Vitrine, titre « Configurez votre site » de nouveau visible.
4. Retour aux options mobile rendu visible à côté de l’étape 02 ; clic testé, adaptation mobile toujours sélectionnée. La barre de total mobile disparaît pendant la saisie des coordonnées.

## Cinq surfaces de fidélité

- **Typographie** : Geist Variable unique pour studio, graisses 400–600, hiérarchie nom du forfait/titre de configuration/options respectée. Libellés lisibles et retours à la ligne contrôlés sur mobile. Les petits prix restent secondaires. Les marques externes conservent leur identité dans la galerie.
- **Espacement et composition** : carte importante à gauche, choix à droite, bouton de carte large, marges communes. Carte fixe quand la colonne d’options défile. Empilement mobile, formulaire une colonne au petit format et total accessible en bas. Aucun onglet redondant.
- **Couleurs et états** : texture grained studio conservée ; recadrages/teintes différenciés par forfait. Texte blanc contrasté, choix sélectionné avec coche et bordure sombre, focus visible. Fond pastel CSS progressif, racine pastel et overscroll `none`, aucune animation d’ambiance.
- **Images et matière** : grain-plasma-card.webp déjà approuvé, sans nouveau fond bitmap. Aucun aperçu ou image fictive dans les quatre configurateurs (0 image DOM vérifiée). DOMTEKNIKA et Julie Thiam présents dans la galerie. Ancien Atelier retiré et archivé hors du build.
- **Contenus** : offre de création de sites explicite, termes « forfait » et « options », comptes utilisateurs du site livré distingués du parcours sans compte. Aucun faux nombre de clients, avis ou pourcentage. Vitrine ordinateur à la base ; adaptation mobile facultative. Prix non approuvés laissés en attente.

## Interactions et comportement vérifiés dans IAB

- Cartes d’accueil et effet de survol conservés : `cards-hover-desktop.jpg` ; carte entière ouvre le forfait.
- Quatre forfaits : Vitrine, Connecté, Immersif 3D et Sur mesure ouvrent le configurateur, sans aperçu de site. Captures `vitrine-desktop.jpg`, `immersif-desktop.jpg`, `custom-desktop.jpg`.
- Sélection/désélection d’options, sections dépliables, modification de forfait, capacités comprises non refacturées.
- Contrôle local de calcul avec tarifs strictement temporaires : base 800 €, mobile 150 €, bilingue 150 € → 1 100 € ; maintenance +49 €/mois séparément. Preuve `price-test-only.jpg`. Ces montants sont des données de test, pas des prix commerciaux. L’ancien catalogue local a été restauré ; aucune donnée locale ne part en production.
- Coordonnées sans compte, retour aux options, succès d’un envoi local à données fictives. Réponse `unavailable` présentée comme « enregistrée », sans prétendre à l’envoi d’un mail.
- Menu mobile sans connexion, filtres de galerie : 3D affiche Julie Thiam et Tiny Heaven ; `gallery-mobile.jpg`.
- Comparatif base/détails, coches/tirets, aucun « En option » répétitif ni note supprimée par Mathis.
- Journal navigateur : aucune erreur ni avertissement applicatif observé. Aucune animation permanente au repos. Mesure locale de peinture du grain : environ 0,1 ms sur cette machine, pas une garantie universelle de performance.
- `npm run check` : TypeScript, build et 113 tests passants. `git diff --check` propre.

## Limites factuelles

- Le contrôle visuel est passé. L’adresse destinataire demandée à Mathis manque encore ; le domaine Resend est vérifié et la clé d’envoi est installée, mais aucun envoi réel ni réception n’est affirmé.
- Prix, identité commerciale et conditions définitives restent à arrêter. Aucun paiement n’est demandé dans ce parcours.
- Captures publiques après déploiement et révision déployée consignées dans `ops/DEPLOYMENT_STATUS.md`.

Aucun P0/P1/P2 ouvert à l’issue de la comparaison. Aucun écart de marque d’ElevenLabs n’est traité comme une erreur : le rendu studio approuvé reste la référence de couleur et de police.
