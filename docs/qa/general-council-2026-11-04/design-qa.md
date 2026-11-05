# Parcours visuel — audit général

Production observée le 4 novembre 2026. Navigateur intégré uniquement. Captures locales enregistrées puis rouvertes et inspectées. Ordinateur 1440 × 900, mobile 390 × 844. Les états de succès après envoi ont été examinés dans les sources seulement.

## Étapes contrôlées

| Étape | Action et état général | Preuve acceptée | Constat principal |
|---|---|---|---|
| 1 | Accueil et comparatif — présentation lisible, budget incomplet | 02 | Aucun montant ; l’estimation avant contact n’est pas encore mise en avant |
| 2 | Configuration Vitrine — choix fonctionnels, budget incomplet | 03, 04 | Coche et compteur réagissent ; suppléments sans montant |
| 3 | Questionnaire desktop et mobile — progression correcte, synthèse à améliorer | 05, 07, 14 | Vrai clic mobile amène le titre et les premiers champs ; pas de bug d’autoscroll |
| 4 | Retour aux options mobile — fonctionnel | 08 | Choix mobile conservé ; barre fixe de budget/action déjà présente |
| 5 | Changement Vitrine vers Connecté — changement fonctionnel, information manquante | 15, observations DOM avant/après | Galerie retirée sans message ; mobile devenu inclus |
| 6 | Galerie, filtre Connecté — fonctionnel | 09, 10 | Deux références externes, URL du filtre mise à jour ; lien vers estimation associé à envisager |
| 7 | FAQ des coûts — réponse disponible, information éloignée du total | 11 | Ponctuel/mensuel/domaine/tiers expliqués, à rapprocher du budget |
| 8 | Contact simple — formulaire accessible, friction possible à arbitrer | 12 | Téléphone obligatoire selon la décision actuelle ; aucune saisie ni soumission |
| 9 | Confidentialité — page accessible, contenu provisoire | 13 | Informations de l’éditeur et conditions annoncées à compléter |
| 10 | Immersif 3D — offre et formulaire de configuration accessibles, budget incomplet | 16 | Modèle fourni inclus, création de modèle distincte ; prix absents |
| 11 | Sur mesure — parcours accessible, chiffrage spécifique explicite | 17 | Sur devis ; ne pas lui attribuer automatiquement la précision d’un standard |
| 12 | Évolution — formulaire contextualisé accessible | 18 | Questions sur site actuel et ajouts ; Sur devis, pas d’estimation automatique fiable établie |
| 13 | Refonte — formulaire contextualisé accessible | 19 | Questions sur éléments à conserver et reprise ; Sur devis, pas d’estimation automatique fiable établie |

## Captures et notes

### 1 — Accueil

L’accueil est cohérent et les six prestations sont visibles. Les textures des petites cartes apparaissent à l’interaction selon la décision approuvée ; leur état neutre dans une capture sans survol n’est pas une erreur. Le point bloquant pour le nouveau positionnement est l’absence de montant.

![Accueil complet sur ordinateur](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/02-accueil-desktop.jpg>)

### 2 — Configuration et sélection

Carte et options sont lisibles. La coche et le nombre d’options reflètent la sélection. Une animation du montant ne pourra être évaluée utilement qu’après activation de vrais tarifs.

![Configurateur Vitrine](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/03-configurateur-desktop.jpg>)

![Option mobile sélectionnée](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/04-option-selectionnee.jpg>)

### 3 — Questionnaire et vraie progression mobile

Le questionnaire ne montre pas de débordement grossier dans les vues capturées. Il gagnerait une synthèse du besoin et du budget. Les petits textes secondaires demandent un contraste plus fort. La capture 06, après redimensionnement depuis desktop, reste une trace de ce redimensionnement ; elle n’est pas retenue comme preuve d’une transition défectueuse. La capture 14 ci-dessous montre le clic réel mobile, correctement positionné.

![Questionnaire sur ordinateur](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/05-brief-desktop.jpg>)

![Arrivée réelle sur le questionnaire mobile](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/14-arrivee-brief-mobile-apres-clic.jpg>)

### 4 — Retour aux options

Le choix est conservé. La barre fixe de prix et de progression existe déjà ; aucun besoin de l’ajouter à nouveau.

![Options et barre de budget mobile](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/08-configurateur-mobile.jpg>)

### 5 — Changement de forfait

Observation avant : Vitrine, deux options sélectionnées (mobile et Galerie), Galerie cochée. Action : Changer → Connecté. Observation après : Forfait de base, aucun message de retrait ; mobile fait partie des inclusions, Galerie a quitté la sélection selon le catalogue public. L’état final est capturé ci-dessous. Aucun défaut technique empêchant une Galerie dans Connecté n’est établi.

![État Connecté après changement](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/15-changement-forfait-mobile.jpg>)

### 6 — Galerie filtrée

Le filtre Connecté donne deux références et l’URL `?type=connecte`. GeoBoss a eu un chargement transitoire : image complète vérifiée ensuite, aucune image cassée retenue. Les crédits et la mention références externes sont visibles.

![Galerie Connecté sur ordinateur](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/10-galerie-desktop.jpg>)

### 7 — FAQ des coûts

L’accordéon s’ouvre et distingue les types de frais. Cette réponse utile pourrait être reprise sous forme compacte près du montant.

![FAQ des frais après création](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/11-faq-couts.jpg>)

### 8 — Contact

Les champs et le contexte sont lisibles. Réduire les coordonnées d’un simple contact serait une décision produit à tester, pas une correction imposée pendant cet audit.

![Contact général](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/12-contact.jpg>)

### 9 — Confidentialité

Le texte provisoire est confirmé en production. L’identité réelle et les textes définitifs doivent être fournis ; aucune donnée n’est inventée.

![Page de confidentialité provisoire](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/13-confidentialite.jpg>)

### 10 — Immersif 3D

Les inclusions distinguent modèle fourni et modèle à créer. Il reste à borner complexité et interactions pour chiffrer un scénario standard.

![Configurateur Immersif 3D](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/16-immersif-3d.jpg>)

### 11 — Sur mesure

Une première capture incomplètement rendue a été rejetée et remplacée. La capture acceptée montre le titre, les options et le prix Sur devis.

![Configurateur Sur mesure](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/17-sur-mesure.jpg>)

### 12 — Évolution

La fiche utilise la carte commune et son formulaire contextualisé. La récupération de l’existant doit rester un élément de diagnostic avant prix ferme.

![Fiche Évolution](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/18-evolution.jpg>)

### 13 — Refonte

La fiche est contextualisée et se distingue d’Évolution. Aucune vérification de migration réelle, de données client ou de continuité n’a été exécutée.

![Fiche Refonte](</Users/mathis/Site Business/site/docs/qa/general-council-2026-11-04/captures/19-refonte.jpg>)

## Limites visuelles

Captures de cette session uniquement. Pas de lecteur d’écran complet, téléphone physique, zoom exhaustif, mesure terrain, soumission de formulaire ou réception d’e-mail. Les captures statiques ne certifient pas toutes les animations, leur fluidité ou reduced motion ; leur implémentation a été relue. Aucun défaut sticky/tablette retenu sans reproduction. Viewport réinitialisé, onglets temporaires fermés.

Les priorités, sources précises et décisions sont dans le [rapport général](rapport-general.md).
