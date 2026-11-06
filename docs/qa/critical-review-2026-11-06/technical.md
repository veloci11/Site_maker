# Revue technique critique — 6 novembre 2026

Périmètre : code courant de `/Users/mathis/Site Business/site`, parcours public, estimation, formulaire, notification, SEO, accessibilité structurelle et poids des ressources. Lecture directe des sources (base Git `55f0632` et ajustements de textes en cours) et du build présent, plus deux reproductions locales isolées. Le build mesuré précède ces derniers ajustements de textes ; il est identifié par son nom de fichier, sans être présenté comme un nouveau déploiement. Aucune modification de l’application, aucun accès aux données privées, aucune requête vers la production et aucun formulaire/e-mail envoyé. La QA visuelle IAB est réalisée séparément par le coordinateur. Ce rapport n’est pas un pentest ni une validation juridique.

## Conclusion

Le fonctionnement métier est cohérent avec les derniers arbitrages : Vitrine 1–3 pages, Business 1–6 pages avec CMS en premier argument, Premium 1–10 pages reprenant Business, réservation facultative sur les trois offres, mensualités exclusives et options comprises non refacturées. Je n’ai pas trouvé de nouvelle erreur de calcul ou de migration dans cette lecture.

Deux défauts de robustesse sont démontrables dans les scénarios d’échec : un chargement de route qui échoue n’utilise pas l’écran de reprise prévu, et une soumission réseau qui reste pendante n’a pas de délai maximal côté navigateur. L’HTML public dépend par ailleurs entièrement de JavaScript pour son contenu. Les grandes textures représentent un coût réel, sans mesure récente permettant de conclure sur les Core Web Vitals. La réception effective des e-mails et la complétude des informations légales restent des conditions distinctes d’un parcours qui fonctionne techniquement.

## Défauts confirmés et actions prioritaires

### P2 — Une erreur de chargement de route affiche le secours technique par défaut

**Preuve :** `src/App.tsx:40` et `src/App.tsx:53` chargent les pages par `route.lazy`. Le root du routeur à `src/App.tsx:167` ne déclare ni `errorElement` ni `ErrorBoundary`. `AppBoundary` se trouve à l’intérieur de son élément (`src/App.tsx:151`), donc ne traite pas les erreurs que le routeur intercepte avant ce rendu.

Un harnais local avec la même topologie `createMemoryRouter`, un composant frontière interne et une `lazy` rejetée donne : `routeErrors: true`, `containsDefaultError: true`, `containsCustomRecovery: false`, `hasRecoveryButton: false`. Il rend le message anglais « Unexpected Application Error! », au lieu de l’écran français et de son bouton Recharger. Aucune panne publique n’a été provoquée.

**Conséquence :** une ressource différée indisponible peut laisser un visiteur sur un écran technique. Un ancien onglet après renouvellement des chunks est un déclencheur possible ; sa fréquence n’est pas mesurée ici.

**Action :** définir une frontière d’erreur sur la route racine avec un message français et une reprise explicite. Ajouter un test ciblé de rejet de `route.lazy`, distinct d’une erreur React de rendu. Ne pas imposer un rechargement automatique qui effacerait une saisie.

### P2 — Une demande dont la requête reste pendante verrouille le formulaire sans limite applicative

**Preuve :** `src/components/inquiries/ProjectBriefForm.tsx:132` active `sending` et `inFlight`, puis attend `api()` à la ligne 139 sans signal ni échéance. La libération est dans `finally` à la ligne 160. `src/lib/api.ts:29` appelle `fetch` directement ; aucun délai maximal n’est ajouté pour cette soumission. Les champs et le bouton sont désactivés pendant cet état.

Reproduction locale sans réseau : remplacement temporaire de `fetch` par une promesse qui ne se résout pas. L’appel reste pendant et aucun `signal` n’est transmis. L’observation a été bornée à 25 ms ; la conclusion sur l’absence d’échéance provient du code, pas d’une attente prolongée ou d’un incident réel.

**Conséquence :** un réseau qui ne termine pas correctement la requête peut maintenir « Enregistrement… » jusqu’à l’échec de la pile réseau ou au départ du visiteur. Le garde de navigation avertit mais ne donne pas de reprise de l’envoi sur place.

**Action :** borner l’attente de soumission, conserver les champs et le même `requestId` pour réessayer. L’expiration côté navigateur ne prouve pas que le serveur n’a rien enregistré : le dédoublonnage existant doit rester la protection contre une deuxième création. Couvrir les cas « aucun en-tête reçu » et « corps JSON interrompu ».

## Conditions de mise en service à distinguer des bugs

### Priorité haute — Vérifier la réception réelle des notifications

`server/inquiries.mjs:78` exige une clé, un expéditeur et un destinataire valides. Si l’un manque, l’enregistrement reste possible et la notification prend l’état `unavailable` ; la file ne tente pas d’envoi (`server/inquiries.mjs:217`). La confirmation publique actuelle annonce l’enregistrement et un prochain échange avec un développeur (`ProjectBriefForm.tsx:176`, `src/pages/configurator/index.tsx:554`) ; elle ne distingue plus les états de notification. Elle ne constitue donc aucune preuve de transmission ou de réception d’un e-mail. Le worker a, lui, une échéance, des reprises bornées et une clé d’idempotence.

**État de preuve de cette revue :** mécanisme relu, configuration privée et boîte destinataire non consultées. Une vérification antérieure du coordinateur ne vaut pas preuve de livraison dans cette mission. Aucun test avec un transport simulé ne prouve une réception réelle. À la mise en service, vérifier les trois paramètres par présence/validité sans exposer leurs valeurs, puis la réception dans une boîte autorisée et le suivi de la demande. En attendant, la lecture de l’administration reste nécessaire pour traiter les demandes enregistrées.

### Priorité haute — Compléter les pages d’information avant de les présenter comme définitives

`src/App.tsx:86` affiche explicitement que l’identité de l’éditeur et les conditions commerciales seront complétées. `/conditions` et `/mentions-legales` utilisent le même composant générique ; `/confidentialite` contient une courte explication du traitement. Le footer (`src/components/layout/PublicLayout.tsx:158`) ne contient aucun lien vers ces pages ; la confidentialité est accessible depuis le formulaire.

Il s’agit d’un contenu manifestement provisoire, pas d’une erreur React et pas d’une conclusion sur la conformité légale. Les vraies informations doivent être fournies, relues et rendues accessibles ; il ne faut pas inventer une identité ou des conditions. Le `noindex` existant évite leur indexation, mais ne les rend pas complètes.

## SEO et contenu initial

- Le head est correctement centralisé : titres/descriptions/canoniques/robots côté Express, puis synchronisés en navigation React. Sitemap limité aux routes publiques et vraies réponses 404 pour les ressources absentes (`server/seo.mjs:71`) ; API et espaces privés hors indexation. Aucune règle de prix ou ancienne offre contradictoire relevée dans les métadonnées courantes.
- **Limite architecturale vérifiée :** le corps du build est uniquement `<div id="root"></div>` (`index.html:14`). `server/seo.mjs:36` remplace le head, sans rendu des textes de page. Sans exécution du JavaScript, les offres, liens, FAQ et formulaire n’apparaissent pas. Il n’y a pas de contenu de secours `noscript`.
- Ce constat ne signifie pas que Google ne peut pas indexer le site : il signifie que le contenu dépend de son rendu JavaScript et reste absent pour les consommateurs qui ne l’exécutent pas. Aucun résultat Search Console ni état d’indexation réel n’a été contrôlé ici.
- **Action à planifier :** pré-rendre au moins accueil, offres, FAQ et contact si l’acquisition organique est importante. Garder le configurateur interactif. À court terme, fournir un secours explicite si JavaScript est indisponible. L’absence d’image Open Graph est une amélioration possible des aperçus de partage, pas un blocage d’indexation.

## Poids et performance : données mesurées, limites d’interprétation

Mesures sur le build local existant, sans reconstruire ni changer les images :

| Ressource | Taille brute | Compression calculée localement |
| --- | ---: | ---: |
| Entrée `index-DrfqtuqU.js` | 493 129 octets | gzip 158 879 ; Brotli 136 537 |
| Ensemble des fichiers JS du build | 708 526 octets | Toutes routes confondues, pas le chargement initial |
| Texture haute définition du haut de carte | environ 2,5 Mio | WebP déjà compressé |
| Prolongement Vitrine/Business haute définition | environ 4,3 Mio | WebP déjà compressé |
| Prolongement Premium haute définition | environ 2,3 Mio | WebP déjà compressé |

`src/lib/plan-images.ts:4` précharge, sur intention, le master et le prolongement selon le DPR ; le CSS utilise également `image-set` (`project.css:18`). Sur un écran dense, cela peut représenter environ 6,8 Mio pour les deux textures Vitrine/Business ou 4,8 Mio pour Premium, avant réutilisation du cache. C’est une charge réelle, même si le préchargement n’attend pas leur fin pour naviguer. Les sept dernières images de galerie sont différées (`src/pages/public/index.tsx:381`).

**Interprétation :** aucune mesure réseau réelle, LCP/INP/CLS, mémoire GPU ou fluidité sur téléphone physique dans cette mission. Les tailles gzip/Brotli calculées ne prouvent pas quel encodage est servi en production. Il serait abusif d’annoncer un score de performance ou une lenteur observée à partir de ces seules tailles.

**Actions :** établir un relevé IAB à cache froid puis chaud, réseau mobile et préférence de mouvement réduite ; surveiller séparément JS initial et textures. Définir un budget de régression. Les fichiers d’origine ont été explicitement approuvés : étudier d’abord quand charger le prolongement et comment réutiliser le cache, sans les remplacer ou dégrader de sa propre initiative. Le serveur donne actuellement une heure de cache aux ressources statiques (`server/app.mjs:56`) ; les fichiers hashés pourraient être distingués des noms de texture stables.

## Parcours, estimation et protection des réponses

Points relus et solides :

- Catalogue et calculs partagés ; le serveur recalcule l’estimation et n’accepte pas de prix envoyé par le navigateur. Les bornes des options s’additionnent lorsque connues ; une option sans plafond conserve une estimation minimale (`shared/catalog.ts:733`). Les prix inconnus ne deviennent pas zéro.
- CMS et statistiques inclus sont exclus des options payantes ; la boutique couvre les liens de paiement. Les trois suivis mensuels sont mutuellement exclusifs. Les transitions filtrent les anciennes inclusions avant de reconstruire l’offre (`shared/offer-options.ts:77`).
- Migration publique versionnée des anciennes réservations Business ; conservation d’un nouveau choix volontaire. Dossiers et instantanés historiques ne sont pas réécrits par cette migration (`src/lib/draft.ts:31`).
- Formulaire court validé côté client et serveur ; erreurs rattachées aux champs, premier champ invalide ciblé, verrou anti-double-clic et dédoublonnage serveur. Un rejet réseau terminé conserve la saisie et le même identifiant pour un nouvel essai identique.
- Coordonnées et message restent en mémoire, pas dans `localStorage`. Retour aux options sans démontage du formulaire ; garde de navigation et de fermeture. Perdre les réponses après fermeture volontaire, crash ou arrêt du navigateur reste possible : il n’existe pas de récupération durable du message. C’est une limite explicite, compatible avec la décision de ne pas conserver ces données localement.
- Le catalogue client a un repli approuvé si l’API manque. Le configurateur signale l’échec. Le récapitulatif commercial est une préparation de devis, pas un paiement ; le serveur garde les paiements désactivés (`server/orders.mjs:42`).

## Accessibilité structurelle et couverture des tests

Les sources fournissent labels reliés aux champs, états d’erreur, légende, régions de statut, lien d’évitement et landmarks. Les FAQ fermées restent dans le DOM, avec `inert` et `aria-hidden`, et les déclencheurs Radix portent leurs états. Le tableau comparatif prévoit un conteneur défilable au clavier. Le garde restaure explicitement le focus en cas de refus de quitter. Les chemins de mouvement réduit sont présents dans le moteur de transition et le CSS.

Ce contrôle structurel ne certifie ni les contrastes de tous les pixels des gradients, ni un parcours avec lecteur d’écran, ni Safari/iOS, ni le clavier virtuel d’un appareil physique. Ces points exigent des observations séparées. Aucun nouveau défaut DOM confirmé dans cette revue.

`npm run check` regroupe TypeScript, build et tests Node. Le coordinateur a signalé 251 tests passants ; cette revue n’a pas relancé la suite. Les scénarios API/métier sont nettement couverts. Il n’y a pas de budget de performance ni de contrôle navigateur/accessibilité automatisé dans ce script. Les tests de montage React, chargement de route, focus et réseau suspendu méritent une petite couverture dédiée ; répéter seulement les tests métier ne prouverait pas ces comportements.

## Ordre d’action recommandé

1. Régler les conditions opérationnelles connues : destinataire/réception des demandes et informations éditoriales définitives, avec données réelles et autorisation adéquate pour tout envoi.
2. Corriger les deux chemins d’échec démontrés : frontière d’erreur du routeur et échéance de soumission conservant l’idempotence et la saisie.
3. Mesurer la performance réelle sur mobile avant d’arbitrer le chargement des textures ; ajouter un budget simple de régression.
4. Planifier le contenu HTML initial et quelques tests navigateur ciblés. Ne pas confondre ces améliorations avec une preuve d’absence de bugs ou une garantie de référencement.

Toutes les observations ci-dessus décrivent le code et le build examinés. Elles ne constituent pas une nouvelle preuve de publication, de réception d’e-mail, de conformité, ou de fonctionnement sur tous les appareils.
