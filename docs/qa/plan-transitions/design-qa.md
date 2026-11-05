# Ouverture des forfaits et options visibles — validation locale et publique

4 novembre 2026, date utilisateur. **Application `3e8bd12` poussée, déployée et vérifiée sur gilmathis.com.** La validation locale initiale est conservée ci-dessous ; la [revue publique](public-review.md) décrit la livraison et ses preuves. Aucun formulaire envoyé, aucune image téléversée, aucun e-mail déclenché.

## Résultat

- La surface d’une petite carte rejoint celle du forfait ouvert avec une transition native de **420 ms**, courbe `cubic-bezier(.22,1,.36,1)`.
- Les textes et les options apparaissent par un fondu court. Ils ne sont pas agrandis dans une capture raster, ce qui évite de déformer les caractères.
- Seule la surface décorative est capturée. La navigation et les contrôles restent actifs pendant le mouvement. Le second clic interrompt la transition et atteint bien la destination demandée.
- Les options choisies sont affichées **dans la carte, avant le total**, avec leur libellé et leur coût ponctuel ou mensuel. Le détail replié sous la carte a été retiré.
- La carte s’allonge pour une sélection importante. Un `ResizeObserver` désactive sa position sticky lorsqu’elle dépasse l’espace disponible ; aucun écouteur de scroll ni scroll interne n’a été ajouté.
- Les trois textures approuvées restent identiques octet pour octet. Aucune modification des prix, des inclusions, des calculs, des envois ou des données privées.

## Navigation vérifiée

| Départ → destination | Relation et traitement | Résultat |
|---|---|---|
| Accueil → Vitrine | Petite surface → grande surface, contenu en fondu | Passé, y compris premier chargement du build final |
| Accueil → Connecté | Même mécanisme, variante propre | Passé |
| Accueil → Immersif 3D | Même mécanisme, variante propre | Passé |
| Accueil → Sur mesure | Même mécanisme, prix Sur devis conservé | Passé |
| Accueil → Évolution | Même mécanisme, formulaire contextualisé | Passé |
| Accueil → Refonte | Même mécanisme, formulaire contextualisé | Passé |
| Forfait → Accueil → autre forfait rapidement | Navigation effective prioritaire, transition précédente interrompue | Les six destinations successives sont correctes |
| Comparatif → Vitrine au clavier | Navigation native par Entrée | Passé |
| FAQ avec Cmd+clic | Comportement normal du lien, hors interception animée | Nouvel onglet ouvert ; page d’origine conservée ; onglet temporaire refermé |
| Options → brief → options | Étapes internes et réponses en mémoire | Choix visibles et conservés |
| Brief saisi → Changer → Connecté → Rester | Garde avant mutation de configuration/navigation | Vitrine et saisie conservées ; texte fictif ensuite effacé |
| Réduction des animations → forfait | Navigation directe, aucune animation native | Passé ; préférence rétablie |

Les modules des pages publiques et du configurateur sont résolus par les routes avant la capture. L’ouverture à froid ne capture donc pas un fallback à la place de la fiche. Un fallback initial accessible a également été ajouté pour éviter l’avertissement d’hydratation des routes différées.

## Mesures et limites

Ordinateur : 1440 × 900. Mobile : 390 × 844 ; largeur du contenu 375 px avec la barre de défilement de ce navigateur. Aucun débordement horizontal observé.

- Build final, Vitrine : groupe natif `plan-vitrine`, durée 420 ms. Surface de départ mesurée à 291,5 × 196 px ; surface d’arrivée à environ 612,1 × 707,5 px avec les trois options du brouillon de contrôle. Ces valeurs sont propres au viewport et à la sélection, pas des dimensions commerciales imposées.
- Sélection de douze options sur ordinateur : carte d’environ 973 px, position de colonne `static`, aucun ancien volet replié ni débordement.
- Sélection de douze options sur mobile : carte d’environ 865 px, colonne `static`, aucune largeur débordante. La liste n’est ni tronquée ni repliée.
- Vérification finale avec réduction du mouvement : Vitrine atteinte par Entrée, **zéro animation en cours**, trois options visibles, zéro `.configurator-selection`.
- Nouvelle session sur le build final : aucune erreur ni alerte dans la console observée. Les avertissements d’hydratation des premières versions ont été corrigés avant cette vérification.

Les captures finales ci-dessous ont été enregistrées puis rouvertes et inspectées. Elles prouvent la disposition ; les keyframes natives enregistrées étayent le mouvement. Ce contrôle dans l’IAB ne constitue pas un test exhaustif de tous les navigateurs ou d’un téléphone physique. Le fallback des navigateurs sans API est conservé par détection de capacité ; la préférence reduced motion a été effectivement testée.

### Ordinateur — résultat final

![Options directement dans la carte sur ordinateur](</Users/mathis/Site Business/site/docs/qa/plan-transitions/options-visible-desktop.jpg>)

### Mobile — résultat final

![Options directement dans la carte sur mobile](</Users/mathis/Site Business/site/docs/qa/plan-transitions/options-visible-mobile.jpg>)

## Vérifications techniques

`npm run check` passe après la dernière modification fonctionnelle : TypeScript, build, **213 tests passants, zéro échec**. Les tests existants couvrent notamment calculs, inclusions, dossiers historiques, briefs, fichiers privés, envois et packaging Sites.

Le build a été lancé avec le vrai serveur Express en mode production, dans une base temporaire isolée et avec transport e-mail désactivé. Les références d’assets ont été contrôlées : aucun marqueur `__VITE_PUBLIC_ASSET__` non résolu dans les fichiers livrables. Les avertissements intermédiaires Vite liés à la réécriture des URLs publiques ne subsistent pas comme URLs cassées dans le build final.

Les trois fichiers `grain-plasma-card.webp`, `grain-plasma-master.webp` et `grain-plasma-detail.webp` ont été comparés aux octets de `HEAD` et sont inchangés. Les avis initiaux scellés de l’audit précédent ont aussi été préservés.

### Coordination du routeur

Le projet conserve React 19.2 et ses dépendances actuelles. L’intégration utilise les transitions fournies par React Router, sans appel manuel à `document.startViewTransition`. Les liens restent des ancres ; Cmd/Ctrl, clic secondaire, téléchargement et nouvelles fenêtres gardent leur comportement habituel. La navigation animée simple est coordonnée par le routeur en mode synchrone pour qu’une transition en cours ne réapplique pas une ancienne destination. Les gardes du brief restent dans le parcours du routeur.

Source primaire consultée : [React Router — View Transitions](https://reactrouter.com/how-to/view-transitions), ouverte dans l’IAB pendant ce lot. L’API React `<ViewTransition>` de la documentation actuelle exige une version plus récente que celle du projet ; l’API du routeur reste compatible avec React 19.2. Aucune migration de dépendances n’a été ajoutée à cette correction.

## Traces et nettoyage

- `production-build-check.json` : keyframes et état du build final à froid.
- `six-plan-checks.json` : six destinations correctes lors de navigations rapprochées.
- `final-interactions.json` : garde conservant la saisie et navigation clavier avec mouvement réduit.
- `long-selection-mobile-metrics.json` : sélection de douze options au format mobile.
- Les fichiers `native-keyframes-slow.json` et les captures comportant `slow` sont des observations de prototypes au ralenti, **pas** les timings de la version finale. Les variables d’inspection temporaires ont été retirées.

À l’issue du contrôle local : saisies fictives effacées ; sélection de départ rétablie (français/anglais, rendez-vous et maintenance). Préférences et viewport réinitialisés. Onglets temporaires fermés. Serveurs locaux arrêtés, aucun écouteur restant sur 4173/4174. Cette phase locale n’avait pas modifié l’instance Ubuntu.

La publication demandée ensuite est terminée : release `20261105T032011Z-3e8bd1274408`, santé valide, options et transition contrôlées dans l’IAB public sur ordinateur/mobile. Voir [le compte rendu de publication](public-review.md).
