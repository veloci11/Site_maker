## src/components/inquiries/ProjectBriefForm.tsx

- `src/components/inquiries/ProjectBriefForm.tsx:161` — **P2 initial — corrigé dans le code, recontrôle UI en attente.** Avant correction, consulter les exemples détruisait le brief : `/configurateur` → « Décrire mon projet » → activité fictive → lien supérieur « Exemples de sites » → Retour → « Décrire mon projet » : activité vide, sans avertissement. Le nouveau `BriefNavigationGuard` (`src/components/inquiries/BriefNavigationGuard.tsx:7`) utilise `useBlocker` et `useBeforeUnload`, avec « Rester sur le formulaire » et « Quitter la page ». Activation relue sur toute réponse, coordonnée, image ou envoi (`src/components/inquiries/ProjectBriefForm.tsx:397`), montage à la ligne 526 ; aucune persistance personnelle ajoutée. Le retour interne aux options ne quitte pas la route. La conservation et les deux décisions du dialogue restent à confirmer dans l’UI après ce correctif.
- `src/components/inquiries/ProjectBriefForm.tsx:525` — **Même P2 initial — correction ciblée relue, recontrôle UI en attente.** Avant correction : `/contact` → message fictif → Confidentialité → Retour : message vide. Le lien possède maintenant `target="_blank"`, `rel="noopener noreferrer"` et le nom accessible « Confidentialité (nouvel onglet) ». Le piège Confidentialité et la perte par sortie de route comptent comme un seul défaut initial.

Preuves natives **avant correctif**, à 390 × 844 CSS px, DPR 2 : [avant la navigation](ux-brief-before-navigation-390.png), [après le retour](ux-brief-after-navigation-390.png). Aucun formulaire envoyé.

## src/App.tsx

- `src/App.tsx:25` — **P2 ouvert — informations publiques encore provisoires.** `/confidentialite`, `/mentions-legales` et `/conditions` affichent « Les informations de l’éditeur et les conditions commerciales seront complétées avant l’ouverture des commandes ». La page Confidentialité est pourtant proposée pendant la collecte obligatoire de nom, e-mail et téléphone. Ce texte de chantier et l’absence d’identité/contact de l’éditeur sur cette page diminuent la confiance. Compléter avec les informations réelles ; cette revue ne conclut pas à une conformité ou non-conformité juridique.
- `src/App.tsx:51` — **P3 initial — corrigé dans le code, recontrôle UI en attente.** Avant correction, depuis Contact → Confidentialité, `document.title` conservait « Contacter le studio · studio ». `RouteMetadata` est maintenant monté dans le shell, met le titre à jour (`src/components/layout/RouteMetadata.tsx:24`) et les trois titres d’informations sont définis (`shared/seo.ts:69`). Leur affichage effectif reste à confirmer dans l’UI après le nouveau build.

## Contrôles sans défaut substantiel observé

- **Galerie desktop et 390 px :** H1 accessible conservé, 10 références visibles, filtres de 44 px, sélection annoncée par `aria-pressed`, compteur `role="status"`, état dans l’URL. Le filtre Connecté affiche Cal.com et GeoBoss ; clic CDP natif à coordonnées mesurées : `scrollY` reste à 0, URL `?type=connecte`.
- **Matières et couleurs :** badges texturés visibles, filtres blancs au repos puis grain et dégradé à la sélection, contour noir distinct de la couleur. Aucun remplacement, aplat ou changement de direction artistique recommandé. Aucun défaut de contraste majeur objectivé sur les états observés ; ceci n’est pas un audit colorimétrique exhaustif de chaque pixel des textures.
- **Galerie :** images dimensionnées, liens natifs avec ouverture externe et protections `noopener noreferrer`, crédit par référence ; Atlante est explicitement archivé et son action mène à la présentation GitHub. Aucun lien public vers une inscription relevé.
- **Navigation mobile 390 px :** six entrées du sous-menu Forfaits, dépliage Entrée, focus visible, bouton de fermeture nommé ; panneau et liens accessibles. Menu fermé après navigation. Aucun débordement horizontal de la galerie à 390 px.
- **Configurateur 320 px :** pas de débordement horizontal ; bouton fixe utilisable ; arrivée au brief avec focus sur le H2 à y=112 px, sous le header qui se termine à y=88 px. Le retour direct aux options reste distinct de la perte liée à une sortie de route.
- **FAQ 390 px :** dix questions, ouverture au clavier, focus visible, réponse présente dans l’arbre accessible. Aucun débordement horizontal.
- **Ancienne route `/inscription` :** redirection vérifiée vers `/configurateur`, aucun champ mot de passe ni création de compte.
- **Limite à 300 px :** `src/styles.css:38` et `:42` imposent une largeur minimale de 320 px ; la page devient donc large de 320 px dans une surface de 300 px. Observation de compatibilité avec un écran inférieur à 320 px, pas un échec revendiqué au seuil de reflow de 320 px.

Aucun P1 confirmé. Aucun e-mail, compte ou dossier créé pendant cette revue. Pas de vérification de livraison d’e-mail ni de soumission, par périmètre. Les états réduisant les animations sont prévus dans le CSS ; cette revue n’assimile pas cette lecture à une validation physique sur appareils.

## Preuves et méthode

- [Galerie à 390 px](ux-gallery-390.png)
- [Filtre Connecté et matière conservée](ux-gallery-connected-390.png)
- [FAQ et focus clavier à 390 px](ux-faq-keyboard-390.png)

Revue locale du 3 novembre 2026, `http://127.0.0.1:4173`, navigateur intégré exclusivement. Captures propres à l’onglet de revue, `Page.captureScreenshot` avec `fromSurface: true`, clips aux dimensions CSS réellement mesurées. Émulation par onglet ; aucune modification d’un onglet utilisateur.

Relecture après correctifs : garde de sortie, lien Confidentialité, migration Data Router, titres des pages d’informations et contenu FAQ fermé relus dans le code. Le dialogue reprend les composants shadcn existants ; « Changer » reste le Dropdown approuvé. Le recontrôle UI de ce suivi a été empêché par l’indisponibilité du navigateur intégré dans l’outil du spécialiste : seule l’extension Chrome était exposée. Chrome n’a pas été utilisé. Les états « corrigé dans le code » ci-dessus ne valent donc pas encore preuve UI indépendante du correctif. L’onglet de la revue initiale avait été fermé et son émulation réinitialisée ; aucun nouvel onglet n’a été créé lors de cette tentative.

Grille utilisée : [Web Interface Guidelines, version distante récupérée pendant la revue](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), selon `/Users/mathis/.agents/skills/web-design-guidelines/SKILL.md`. Décisions produit : dernières corrections de Mathis transmises par le parent, AGENTS et documents internes. Les demandes les plus récentes priment sur l’ancienne classification GeoBoss/3D encore présente dans les textes internes.

## Contrôle final du parent dans l’IAB local

Le parent a pu garder l’IAB actif et a testé réellement les deux formulaires. Sur Contact : annuler la sortie vers Exemples et annuler Retour conservent le texte ; confirmer Quitter mène à la galerie. Confidentialité ouvre un nouvel onglet, le texte reste dans le formulaire, et le nouveau titre est bien « Confidentialité · studio » avec noindex et sans canonical. Sur Vitrine : Rester conserve l’activité, refuser un changement vers Connecté garde l’URL Vitrine et la saisie ; options → brief conserve aussi cette saisie. Un écran bas a révélé un bouton de carte partiellement sous le viewport ; le sticky est désactivé sous 681 px de hauteur et l’action a été retestée avec succès. Aucun formulaire soumis. `local-guard-and-faq.json` consigne les résultats, sans revendiquer un test réel de fermeture d’onglet. Le seul P2 éditorial restant concerne les informations légales réelles.


## État après publication — parent

Application `099c1a1` publiée puis vérifiée dans l’IAB public. Les contrôles, mesures après correction et limites encore ouvertes sont consolidés dans [final-review.md](final-review.md). Les observations initiales ci-dessus sont conservées comme historique, sans les confondre avec l’état corrigé.
