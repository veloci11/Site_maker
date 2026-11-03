# studio — décisions et consignes actuelles

Les dernières corrections de Mathis remplacent les maquettes et demandes antérieures contradictoires. Références internes : `docs/DIRECTION_RETENUE.md`, `docs/CHARTE_INTERFACE.md`, `docs/CONTRACTS.md`. Dépôt prévu : https://github.com/veloci11/Site_maker.

## Produit et textes

- Création de sites internet clé en main : Vitrine, Connecté, Immersif 3D, Sur mesure.
- Employer « forfait(s) ». Menu : Accueil, déclencheur Forfaits avec un petit sous-menu, Exemples de sites et bouton noir « Nous contacter » à droite. Les quatre forfaits sont dans ce sous-menu, pas dans quatre onglets de la barre. Même organisation sur mobile, dans une liste dépliable.
- Refonte & évolution est une prestation séparée sur devis, sous les quatre cartes de création et après le comparatif. Une entrée séparée dans le sous-menu conduit à `/contact?besoin=refonte`, avec sujet prérempli et URL facultative du site actuel. Ne pas ajouter un cinquième OfferId ; `projet` reste réservé aux dossiers privés.
- Ne pas afficher « Sans compte » / « Aucun compte à créer » dans le parcours public. Les phrases « Un interlocuteur direct » et « Un périmètre validé ensemble » sont retirées ; ne pas remplacer ces badges par d’autres promesses génériques.
- FAQ entièrement revue : contenus à fournir, délai, modifications après livraison, adaptation mobile, domaine/hébergement et maintenance. Pas de questions évidentes sur « À partir de » ou le cumul d’options, ni de formulation « Je n’y connais rien ». Ne pas inventer de délai chiffré, de nombre de pages, de retouches, de transfert de droits ou d’inclusion non validés.
- Aucun aperçu de site à l’arrivée sur l’accueil. Titres directs et textes utiles ; supprimer les phrases décoratives comme « À chaque projet, son point de départ ».
- Une fiche standard est le configurateur : grande carte texturée du forfait choisi à gauche avec le total, options façon Apple à droite. Aucun aperçu de site ni onglet Présentation/Exemple dans ce parcours.
- Les références externes sont regroupées dans une galerie « Exemples de sites », avec filtres et tags (Vitrine, 3D, etc.). Crédits et liens externes, aucune revendication de relation client. Aucun site fictif Atelier / Artisanat. Pas de scène 3D externe automatiquement chargée.
- Déploiement ponctuel et maintenance mensuelle sont facultatifs, avec totaux distincts. Comparatif des quatre forfaits avec coches et détails facultatifs.
- Parcours sans compte : choix du forfait, options, coordonnées, demande envoyée au studio via Resend. Conserver les données historiques privées et l’administration ; ne plus diriger les visiteurs vers une inscription ou un paiement.
- Connecté couvre les comptes utilisateurs et les fonctions interactives du site livré. Le CMS n’est pas son seul argument. Vitrine : ordinateur seul à la base, adaptation mobile facultative (choix explicite de Mathis).
- Prix non arrêtés : « À partir de… », aucun montant ou rabais inventé. Les calculs ponctuels et mensuels s’actualisent selon le catalogue. Aucun chiffre client, avis fictif ou « 50 % moins cher » sans preuve : Mathis a confirmé préférer des arguments concrets.
- Comparatif des fonctions de base : coches, tirets et détails utiles. Supprimer la légende « Inclus », les cellules répétitives « En option » et la note sur l’ajout des options ; garder visibles les montants mensuels réels dans le configurateur.

## Design et performance — approuvés après essai

- **Ne pas modifier l’aspect ni l’effet des cartes : Mathis les a validés.** Toute la carte est un lien, texture originale à grain dans le bloc supérieur uniquement, inclusions neutres, bouton noir. Aucun texte sous le nom, aucun « Selon les options choisies », aucun aperçu dans les cartes.
- **Correction explicite de Mathis : l’essai lissage + grain procédural est rejeté.** Il préfère la matière d’avant et demande seulement une meilleure qualité, comme les petites cartes et les cartes ElevenLabs. La grande carte reprend la source originale, sans flou ni grain inventé : export WebP sans perte 1536×1024 `grain-plasma-master.webp`, en `cover`, source légère dessous et à DPR 1. Préserver les couleurs, recadrages, contrastes et effets approuvés. Ne pas présenter cette conversion sans perte comme une nouvelle résolution 4K. Le fichier plus lourd est réservé aux grandes cartes haute densité ; les contrôles ne doivent pas attendre son chargement.
- Mathis fournira plus tard l’adresse de réception Resend : ne pas la redemander pendant les corrections visuelles.
- Fond pastel visible en CSS : plages lavande, pêche, ciel et crème, grain procédural fin en lumière douce sans voile gris. **Pas d’image d’ambiance ni d’animation de fond.** Le fond doit continuer jusqu’au bord supérieur, y compris au rebond du scroll, et s’estomper sans coupure. Cette décision remplace la demande initiale de couleurs mobiles.
- Fondu de carte de 120 ms avec texture WebP légère. Pas de suivi de pointeur, filtre animé, transition circulaire, attente de préchargement ou contenu masqué avant observation.
- Les boutons du comparatif sont noirs au repos et révèlent la matière colorée de leur forfait au survol ou au focus. Conserver les cartes principales approuvées. Le configurateur explique clairement les inclusions avant les options ; les textes sont dans `src/content/configurator-copy.ts`.
- Navigation immédiate. Entrées discrètes de 160–180 ms, désactivées avec la préférence de réduction des animations.
- Pas de barre de progression décorative ni d’écouteur de scroll dans le header. Le configurateur est chargé à l’ouverture du forfait ; le menu reste présent pendant ce chargement. Pas de filtres de FAQ ; filtres de galerie rétablis à la demande de Mathis. Les étapes sont sur l’accueil, `/methode` redirige vers `/#fonctionnement`.
- Geist Sans unique dans l’interface, Lucide, primitives shadcn/Radix. Les marques des aperçus gardent leur typographie. La charte reste interne, sans route publique.

## Construction et données

Mathis a autorisé une équipe de dix spécialistes par vagues, puis des revues critiques en parallèle. React 19, Vite, TypeScript, React Router ; API Express 5 / Node 24, SQLite persistant. Comptes, contenus et fichiers privés réels, jamais simulés par localStorage. Données privées et sauvegardes hors de `public/`, `dist/` et Git. Aucun message ou e-mail de test à un tiers.

Les anciennes routes `/formules` redirigent vers `/forfaits`. Les modifications de contenu utilisent `expectedUpdatedAt` et gardent le brouillon local en cas de conflit. Les calculs de prix appartiennent au serveur et au catalogue partagé.

Les originaux d’images et essais inutilisés sont conservés dans `docs/asset-sources`, hors des fichiers copiés dans le build public. Ne servir que les exports actifs et garder la texture validée `grain-plasma-card.webp`.

Pour les retouches manuelles, suivre `docs/MODIFIER_LE_SITE.md`. Garder les textes et paramètres partagés dans `shared/catalog.ts` et `src/content/`, les composants en JSX indenté, et les règles métier dans le catalogue/serveur. Ne pas dupliquer les liens des forfaits dans le header ni ajouter une abstraction pour un simple texte.

Respecter les contrats et les périmètres attribués aux spécialistes. Le parent coordonne les fichiers communs ; aucun commit par les sous-agents. Ne pas écraser les modifications d’un autre spécialiste.

## Vérification et livraison

Instance publique : `https://gilmathis.com/`, application Ubuntu dans `/home/mathis/site-maker/` ; chaque projet doit garder ses propres chemins, données, runtimes et services. Pour cette instance, se référer à `ops/README.md` et `ops/DEPLOYMENT_STATUS.md`. Cloudflare est administré via le MCP demandé par Mathis. Ne pas modifier les tunnels/services GP Park, Encar ou trading pour déployer studio. Le localhost a été arrêté à sa demande ; ne pas le laisser tourner après livraison.

Démarrer le serveur local et ouvrir la prévisualisation soi-même. Vérifier les interactions dans le navigateur, les formats desktop/mobile et les erreurs. Le rapport visuel final est `design-qa.md`. Exécuter `npm run check` après les modifications fonctionnelles nécessaires ; ne pas confondre validation locale et production.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`. The static worker does not supply the persistent Express API.

Before substantial visual changes, use the Product Design plugin’s get-context skill if the source is unclear or no longer matches the goal. Record durable user feedback here. When implementing a selected mock, follow its layout and anatomy except where the explicit later decisions above supersede it.
