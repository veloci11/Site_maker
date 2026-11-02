# Contrats de construction — studio

## Stack et propriété

React19/TypeScript/Vite ; React Router ; primitives shadcn/Radix ; Geist Sans ; Lucide ; Express5/Node24 ; node:sqlite. Le parent possède package.json, Vite, App/router, src/lib/api.ts, src/lib/auth.tsx, src/lib/project.tsx, shared/catalog.ts et le montage serveur. Chaque spécialiste a ses routes/pages et peut créer son CSS de page utilisant exclusivement les tokens partagés.

## Routes UI

PublicLayout : / ; /forfaits ; /forfaits/:slug (vitrine,connecte,immersif-3d,sur-mesure) ; /options ; /exemples ; /exemples/:slug ; /methode ; /faq ; /contact ; /configurateur ; /inscription ; /connexion ; /mot-de-passe-oublie ; /reinitialiser-mot-de-passe ; /commande/:projectId. Les anciennes routes /formules restent des redirections de compatibilité, pas le libellé produit.

PortalLayout protégé : /espace ; /espace/contenus (onglets activite,textes,fichiers) ; /espace/messages ; /espace/maquettes ; /espace/commande ; /espace/compte. Admin : /admin, rôles serveur. Les prochains chemins doivent rester internes avant redirection de connexion.

## Modèles

OfferId = vitrine | connecte | immersif | sur-mesure. Slug public immersif-3d correspond à immersif.

Configuration = {offerId, language:'fr'|'fr-en', managedContent:boolean, scene3d:boolean, deployment:boolean, maintenance:boolean}. Connecté inclut managedContent, Immersif inclut scene3d. Une option incluse ne se facture pas deux fois. Les nouveaux champs deployment/maintenance sont optionnels en entrée pour les anciens projets et normalisés à false s’ils sont absents. Leur sélection reste indépendante et facultative.

User = {id,name,email,role:'customer'|'admin'}.

Project = {id,name,offerId,configuration,activity:Record<string,string>,status,createdAt,updatedAt}. API POST {name?,configuration}. Contents = {pageKey,title,data:Record<string,string>,updatedAt}.

shared/catalog.ts exporte offers, getOffer(idOrSlug), examples, faqs, OFFER_IDS, optionDefinitions, normalizeConfiguration(unknown), quoteConfiguration(configuration,pricing?), defaultPricing, formatMoney. Les valeurs de prix sont null tant que non validées ; aucune fausse réduction, frais ou promesse. Pricing.options possède language-en, managed-content, scene-3d, deployment et maintenance-monthly. optionDefinitions indique billing:'once'|'monthly'.

Quote = {currency,lines:[{key,label,amountCents,included,billing:'once'|'monthly'}],totalCents,monthlyTotalCents,checkoutReady,requiresQuote,version}. **totalCents est uniquement le montant ponctuel de création**, avec deployment si choisi. **monthlyTotalCents** est le suivi mensuel séparé : 0 si non sélectionné, null si sélectionné et prix inconnu. La maintenance ne s’additionne jamais au montant ponctuel. checkoutReady exige les deux montants connus et un forfait ne nécessitant pas de devis ; le paiement reste de toute façon désactivé sans prestataire actif. Afficher clairement « / mois » pour les montants récurrents. Aucun prix n’est inventé.

## API

Préfixe /api ; JSON erreurs {error:string,code?:string,fields?:Record<string,string>}. Client api<T>(path, options?) utilise credentials same-origin, JSON sauf FormData, renvoie T ; lève ApiError avec status/code. Paths passent avec /api inclus.

Auth monté /api/auth : /register,/login,/logout,/me,/forgot-password,/reset-password,/change-password ; PATCH /me. Succès {user}, logout {ok:true}. Réinitialisation body {token,password}. Mots de passe minimum12 ; la récupération renvoie générique et n'expose pas de token au client. Transport externe non configuré ; outbox développement privée. Hook useAuth = {user,loading,refresh,login(email,password),register(name,email,password),logout()}.

Projets /api/projects : GET {projects}, POST {project}; /:projectId GET/PATCH {project}; /:projectId/contents/:pageKey GET/PUT {content}. Projet accessible uniquement au propriétaire ; routes admin distinctes autorisées par rôle serveur. Hook useProject = {project,projects,loading,error,selectProject(id),refresh(),updateProject(patch)}. Sélection UI mémorisée, données toujours serveur.

Fichiers : GET /api/projects/:projectId/files {files}; POST multipart même chemin, champ files (jusqu'à10), category optionnelle ; DELETE /:fileId (corbeille récupérable) ; POST /:fileId/restore ; GET /:fileId/download authentifié. File={id,originalName,mime,size,category,createdAt,deletedAt?}. Pas de fichiers publics, pas de path fourni par client.

Messages : GET/POST /api/projects/:projectId/messages {messages}/{message}, body POST {body,attachmentIds?:string[]}. Maquettes : GET /api/projects/:projectId/previews {previews}; POST /previews/:previewId/feedback {body}; POST /previews/:previewId/approve {confirmed:true}. Droits serveur et version explicite.

Commande : GET/PUT /api/projects/:projectId/order {order,quote,isCurrent,payment}, body PUT {billing}; POST /checkout. order.totalCents reste le ponctuel ; order.monthlyTotalCents est lu depuis l’instantané du devis. Un prix incomplet, ponctuel ou mensuel sélectionné, ou un paiement non configuré ne peut jamais produire paid/success. Administration permet de gérer demandes, projets, versions et prix ; créer administrateur par CLI locale explicite sans mot de passe en dur. getPricing() complète les anciens tarifs persistés avec les nouvelles clés à null sans les réécrire ; les instantanés de commandes précédents restent immuables et interprètent l’absence de maintenance comme 0 mensuel.

Contacter : POST /api/inquiries {name,email,subject,message} enregistre une demande privée ; ne prétend pas envoyer un e-mail externe.

## Base et montage

server/db.mjs getDb() DatabaseSync, closeDb(), transaction(fn), newId(), now(), parseJson(), projectDto(), getOwnedProject(projectId,userId), ensureProjectOwner(). Tables auth : users(id,name,email,password_hash,role,created_at), sessions(id_hash,user_id,expires_at,created_at), password_resets(token_hash,user_id,expires_at,created_at). Voir migrations pour autres tables.

server/auth.mjs authRouter, createAuthRouter(), optionalAuth, requireAuth, requireAdmin, csrfProtection, createAdminUser(). Ordre : helmet, JSON parser, optionalAuth, csrfProtection, routes auth, projets/domaines requireAuth. APP_ORIGIN définit origine autorisée ; Vite proxy changeOrigin:false. API produit JSON404 plutôt que fallback HTML.

## Style et composants

Classes partagées : container,page-heading,page-subtitle,eyebrow,page-section,page-intro,atmosphere,grid-2,grid-3,stack,cluster,panel,surface,divider,field,field-error,form-grid,table,empty-state,loading-state,badge,preview-frame,button. PricingCard {slug,title,description?,price?,features,href,cta?,variant?}, description NON RENDUE selon dernière correction. Variantes vitrine/connecte/immersif/custom. Carte entière cliquable ; seul le bloc supérieur se colore au survol/focus, aucun aperçu.

## Concurrence des textes

PUT /api/projects/:projectId/contents/:pageKey accepte {title,data,expectedUpdatedAt?:string|null}. Le client courant envoie le timestamp reçu au chargement (null pour une page absente). Une modification concurrente renvoie 409 {error,code:'CONTENT_CONFLICT',content:<version enregistrée>} sans écraser les données. La comparaison et l’écriture sont atomiques ; updatedAt avance strictement même dans la même milliseconde. Le champ absent conserve la compatibilité des anciens appels. Le client conserve son brouillon et propose une comparaison avant de recharger ou de remplacer explicitement la version courante.
