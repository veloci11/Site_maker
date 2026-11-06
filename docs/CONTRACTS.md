# Contrats de construction — studio

Mise à jour du 6 novembre 2026. État de publication et preuves : `../ops/DEPLOYMENT_STATUS.md` et `qa/three-offers/review.md`.

## Stack et propriété

React19/TypeScript/Vite ; React Router ; primitives shadcn/Radix ; Geist Sans ; Lucide ; Express5/Node24 ; node:sqlite. Le parent possède package.json, Vite, App/router, src/lib/api.ts, src/lib/auth.tsx, src/lib/project.tsx, shared/catalog.ts et le montage serveur. Chaque spécialiste a ses routes/pages et peut créer son CSS de page utilisant exclusivement les tokens partagés.

## Routes UI

PublicLayout : / ; /forfaits ; /forfaits/:slug (vitrine,connecte,immersif-3d) ; /options ; /exemples ; /exemples/:slug ; /methode ; /faq ; /contact ; /configurateur ; /inscription ; /connexion ; /mot-de-passe-oublie ; /reinitialiser-mot-de-passe ; /commande/:projectId. Les anciennes routes /formules restent des redirections de compatibilité, pas le libellé produit. /forfaits/sur-mesure redirige vers Premium / 3D, sauf si `projet` ou `projectId` désigne un dossier privé. Les anciennes fiches /contact?besoin=evolution et /contact?besoin=refonte rejoignent le contact général ; ces prestations ne sont plus proposées dans les menus.

PortalLayout protégé : /espace ; /espace/contenus (onglets activite,textes,fichiers) ; /espace/messages ; /espace/maquettes ; /espace/commande ; /espace/compte. Admin : /admin, rôles serveur. Les prochains chemins doivent rester internes avant redirection de connexion.

## Modèles

OfferId = vitrine | connecte | immersif | sur-mesure. Les identifiants historiques restent stables. PUBLIC_OFFER_IDS = vitrine | connecte | immersif ; leurs libellés publics sont Vitrine, Business et Premium / 3D, pour respectivement 890 €, 1 490 € et 2 499 €. Slug public immersif-3d correspond à immersif ; Business conserve connecte. `offers` conserve les quatre définitions pour les dossiers privés ; les menus, cartes, filtres et comparatif utilisent `publicOffers`.

Configuration = {offerId, language:'fr'|'fr-en', mobile:boolean, managedContent:boolean, scene3d:boolean, deployment:boolean, maintenance:boolean, extras:ExtraOptionId[]}. Les trois forfaits publics comprennent mobile et deployment. Business inclut managedContent, portfolio-gallery, analytics et local-seo ; les comptes utilisateurs sont une option. Premium / 3D reprend ces inclusions et ajoute scene3d, avec recours à la 3D selon le projet. booking et advanced-forms restent historiques mais ne sont plus compris dans les nouvelles offres publiques. extras est une liste validée, dédoublonnée et canonique. Une boutique comprend catalogue et paiement, les rôles historiques nécessitent des comptes. Hébergement, Maintenance et Sérénité sont trois choix mensuels exclusifs : le choix d’un autre plan remplace le précédent.

`shared/offer-options.ts` borne les choix publics. `changePublicOffer` conserve les ajouts choisis compatibles et retire les inclusions de l’ancien forfait avant normalisation du nouveau : passer de Business à Vitrine ne facture donc pas automatiquement un CMS ou des statistiques auparavant inclus. `prunePublicConfiguration` ne doit pas être appliqué aux projets historiques privés. Les instantanés de configuration, noms et montants enregistrés ne sont pas réécrits.

User = {id,name,email,role:'customer'|'admin'}.

Project = {id,name,offerId,configuration,activity:Record<string,string>,status,createdAt,updatedAt}. API POST {name?,configuration}. Contents = {pageKey,title,data:Record<string,string>,updatedAt}.

shared/catalog.ts exporte notamment offers, publicOffers, getOffer(idOrSlug), examples, faqs, OFFER_IDS, PUBLIC_OFFER_IDS, isPublicOffer, optionDefinitions, normalizeConfiguration(unknown), quoteConfiguration(configuration,pricing?), defaultPricing, formatMoney et formatOptionPrice. Pricing.options possède les 28 clés de optionDefinitions, y compris les options historiques retirées du public ; aucune clé historique n’est renommée. Chaque option porte id, title, description, group et billing:'once'|'monthly'. Helpers isOptionSelected, isOptionIncluded et withOption partagent les règles frontend/serveur. Les anciens catalogues de prix complets à cinq clés sont acceptés et étendus à null ; les clés inconnues et montants invalides restent refusés.

Le catalogue public conserve douze options ponctuelles, selon les inclusions du forfait : langue supplémentaire 100 €, gestion des contenus 300 €, élément 3D 250–600 €, comptes 300–600 €, liens de paiement 100 €, boutique 600–1 100 €, blog 150 €, page supplémentaire 60–120 €, reprise de contenus 100–250 €, modèle 3D à partir de 150 €, statistiques 60 €, newsletter à partir de 90 €. Les trois plans mensuels sont Hébergement 19 €, Maintenance 39 € et Sérénité 69 €. Les limites exactes figurent dans optionDefinitions ; les fourchettes sont définies par OPTION_PRICE_RANGES. Le blog comprend son éditeur, la boutique sa gestion des produits et son paiement ; le CMS des autres pages et la création/intégration 3D restent des périmètres distincts.

Quote = {currency,lines:[{key,label,amountCents,maximumCents?,estimated?,included,billing:'once'|'monthly'}],totalCents,maximumTotalCents?,monthlyTotalCents,checkoutReady,requiresQuote,estimated,version}. **totalCents est uniquement le montant ponctuel de création** ; deployment est compris pour les trois forfaits publics. Une option en fourchette rend estimated/requiresQuote vrais. totalCents conserve le minimum ; maximumTotalCents fournit la somme des plafonds connus ou null. formatQuoteTotal/formatQuoteLine affichent la plage enregistrée, ou « À partir de » en absence de plafond ; formatOptionPrice porte les plages des choix. Les anciens instantanés restent inchangés. **monthlyTotalCents** est le suivi mensuel séparé : 0 si non sélectionné, null si sélectionné et prix inconnu. La maintenance ne s’additionne jamais au montant ponctuel. checkoutReady exige les deux montants connus et un forfait ne nécessitant pas de devis ; le paiement reste de toute façon désactivé sans prestataire actif. Afficher clairement « / mois » pour les montants récurrents. null signifie inconnu, jamais gratuit.

## API

Préfixe /api ; JSON erreurs {error:string,code?:string,fields?:Record<string,string>}. Client api<T>(path, options?) utilise credentials same-origin, JSON sauf FormData, renvoie T ; lève ApiError avec status/code. Paths passent avec /api inclus.

Les inscriptions sont fermées en production (403 REGISTRATION_CLOSED) ; /inscription redirige vers le configurateur. La connexion privée et les anciens comptes sont conservés.

Auth monté /api/auth : /register,/login,/logout,/me,/forgot-password,/reset-password,/change-password ; PATCH /me. Succès {user}, logout {ok:true}. Réinitialisation body {token,password}. Mots de passe minimum12 ; la récupération renvoie générique et n'expose pas de token au client. Transport externe non configuré ; outbox développement privée. Hook useAuth = {user,loading,refresh,login(email,password),register(name,email,password),logout()}.

Projets /api/projects : GET {projects}, POST {project}; /:projectId GET/PATCH {project}; /:projectId/contents/:pageKey GET/PUT {content}. Projet accessible uniquement au propriétaire ; routes admin distinctes autorisées par rôle serveur. Hook useProject = {project,projects,loading,error,selectProject(id),refresh(),updateProject(patch)}. Sélection UI mémorisée, données toujours serveur.

Fichiers : GET /api/projects/:projectId/files {files}; POST multipart même chemin, champ files (jusqu'à10), category optionnelle ; DELETE /:fileId (corbeille récupérable) ; POST /:fileId/restore ; GET /:fileId/download authentifié. File={id,originalName,mime,size,category,createdAt,deletedAt?}. Pas de fichiers publics, pas de path fourni par client.

Messages : GET/POST /api/projects/:projectId/messages {messages}/{message}, body POST {body,attachmentIds?:string[]}. Maquettes : GET /api/projects/:projectId/previews {previews}; POST /previews/:previewId/feedback {body}; POST /previews/:previewId/approve {confirmed:true}. Droits serveur et version explicite.

Commande : GET/PUT /api/projects/:projectId/order {order,quote,isCurrent,payment}, body PUT {billing}; POST /checkout. order.totalCents reste le ponctuel ; order.monthlyTotalCents est lu depuis l’instantané du devis. Un prix incomplet, ponctuel ou mensuel sélectionné, ou un paiement non configuré ne peut jamais produire paid/success. Administration permet de gérer demandes, projets, versions et prix ; créer administrateur par CLI locale explicite sans mot de passe en dur. getPricing() utilise defaultPricing si aucun réglage n’existe ou si l’ancien catalogue EUR draft-vN est entièrement à null, sans modifier la ligne stockée. Les réglages administratifs existants restent prioritaires, y compris leurs null explicites ; les nouvelles clés absentes sont complétées à null. Les instantanés de commandes précédents restent immuables et interprètent l’absence de maintenance comme 0 mensuel. Une ancienne inclusion devenue payante rend le devis courant à réexaminer sans modifier le devis sauvegardé.

Demandes publiques : POST /api/inquiries conserve le schéma V2 de `docs/BRIEF_CONTRACT.md`. Le formulaire public courant envoie `briefFormat:'contact'`, un UUID stable, requestType, prénom, nom, e-mail et téléphone obligatoires, entreprise facultative, `brief:{activity?,message}` et la configuration correspondante au forfait (null pour contact général). getContactBriefSections/validateContactBrief partagent le modèle navigateur/serveur. Le formulaire est placé à droite du récapitulatif après les options ; le retour aux options conserve la saisie. Calendrier, fichiers et long questionnaire ne sont plus affichés dans ce parcours.

Les anciennes écritures V2 sans briefFormat restent compatibles avec leur questionnaire et leur transport multipart `payload` + `files` privé JPEG/PNG/WebP ; les anciennes lignes et pièces jointes restent lisibles. Les nouvelles écritures V1 sont refusées pour ne pas contourner les coordonnées requises. Les réponses compactes sont reconnues au récapitulatif sans réécrire les anciens questionnaires. Configuration et prix sont calculés côté serveur. Réponse {ok:true,id,notification:'queued'|'accepted'|'unavailable'}, 201 création/200 retry identique/409 conflit. Le worker Resend et sa file privée persistante sont décrits dans docs/EMAIL_REQUESTS.md ; accepted signifie acceptation API, jamais preuve de livraison. Aucun e-mail automatique au visiteur.

## Base et montage

server/db.mjs getDb() DatabaseSync, closeDb(), transaction(fn), newId(), now(), parseJson(), projectDto(), getOwnedProject(projectId,userId), ensureProjectOwner(). Tables auth : users(id,name,email,password_hash,role,created_at), sessions(id_hash,user_id,expires_at,created_at), password_resets(token_hash,user_id,expires_at,created_at). Voir migrations pour autres tables.

server/auth.mjs authRouter, createAuthRouter(), optionalAuth, requireAuth, requireAdmin, csrfProtection, createAdminUser(). Ordre : helmet, JSON parser, optionalAuth, csrfProtection, routes auth, projets/domaines requireAuth. APP_ORIGIN définit origine autorisée ; Vite proxy changeOrigin:false. API produit JSON404 plutôt que fallback HTML.

## Style et composants

Classes partagées : container,page-heading,page-subtitle,eyebrow,page-section,page-intro,atmosphere,grid-2,grid-3,stack,cluster,panel,surface,divider,field,field-error,form-grid,table,empty-state,loading-state,badge,preview-frame,button. PricingCard {slug,title,description?,price?,features,href,cta?,variant?,featured?}, description NON RENDUE selon dernière correction. Variantes publiques vitrine/connecte/immersif, variantes historiques conservées. featured affiche « Offre principale » sur Business. Carte entière cliquable ; seul le bloc supérieur se colore au survol/focus, aucun aperçu. Premium / 3D réutilise la composition anciennement Sur mesure, avec une palette ajustée dans les variables CSS ; cartes, menus et filtres partagent la même variante.

## Concurrence des textes

PUT /api/projects/:projectId/contents/:pageKey accepte {title,data,expectedUpdatedAt?:string|null}. Le client courant envoie le timestamp reçu au chargement (null pour une page absente). Une modification concurrente renvoie 409 {error,code:'CONTENT_CONFLICT',content:<version enregistrée>} sans écraser les données. La comparaison et l’écriture sont atomiques ; updatedAt avance strictement même dans la même milliseconde. Le champ absent conserve la compatibilité des anciens appels. Le client conserve son brouillon et propose une comparaison avant de recharger ou de remplacer explicitement la version courante.
