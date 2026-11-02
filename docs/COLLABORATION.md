# Échanges et validation des maquettes

Le module est `server/collaboration.mjs`. Monter `createCollaborationRouter({ requireAuth })` sur `/api/projects`, après les sessions et la protection CSRF. Les pages client sont `MessagesPage` et `PreviewsPage` dans `src/pages/collaboration/index.tsx` ; PortalLayout fournit l’en-tête et la navigation.

## Droits et enregistrements

Chaque route vérifie le projet au serveur. Son propriétaire et un utilisateur dont le rôle serveur est explicitement `admin` peuvent consulter les messages, les pièces jointes, les versions et les retours. Un autre compte reçoit la même réponse 404 qu’un projet absent. L’auteur est toujours `req.user`, jamais un identifiant fourni dans le corps.

Les messages et retours sont de vrais enregistrements SQLite. Un compte vide reçoit un état de présentation et aucun échange ou projet démo inventé. Les pièces jointes sont les fichiers privés du projet, avec les URL authentifiées fournies par `fileDto`. Chaque ID doit appartenir au même projet et être actif lors de l’association. Une association invalide annule tout le message. Les fichiers retirés n’exposent plus leur URL dans les échanges ; le texte du message est conservé.

## Routes

| Méthode et chemin relatif | Corps | Réponse |
| --- | --- | --- |
| GET `/:projectId/messages` | — | `{messages}` |
| POST `/:projectId/messages` | `{body?,attachmentIds?:string[]}` | 201 `{message}` |
| GET `/:projectId/previews` | — | `{previews}` par version décroissante |
| POST `/:projectId/previews` | `{title,url}` ou `{title,fileId}` | 201 `{preview}`, administrateur seul |
| POST `/:projectId/previews/:previewId/feedback` | `{body}` | 201 `{preview}` |
| POST `/:projectId/previews/:previewId/approve` | `{confirmed:true}` | `{preview}`, propriétaire seul |

Un message peut contenir du texte, des fichiers ou les deux : 10 000 caractères maximum, jusqu’à 10 pièces jointes distinctes. Un retour est un texte non vide de 10 000 caractères maximum. Le titre d’une version contient de 1 à 160 caractères.

`Message = {id,body,author:{id,name,role},createdAt,attachments:File[],unavailableAttachments}`.

`Preview = {id,title,version,url,file:File|null,sourceUnavailable,status,isLatest,feedback,approvals,createdAt,updatedAt}`.

`Feedback = {id,body,author:{id,name,role},createdAt}` ; `Approval = {id,userId,name,createdAt}`.

## Publication et sécurité

Le numéro de version est calculé dans une transaction SQLite `BEGIN IMMEDIATE`. La publication place le projet en `review`. Seul l’administrateur peut publier ; les champs de version, statut ou propriétaire envoyés dans le corps sont refusés.

Un lien de maquette doit être HTTPS, public et sans identifiants. Les protocoles `javascript:`, `data:`, HTTP, les adresses locales, privées et de bouclage sont refusés. Le serveur ne télécharge et ne résout jamais ces liens. Le navigateur affiche le site dans une iframe avec sandbox sans privilège same-origin et propose une ouverture externe. Certains hébergeurs interdisent les iframes : l’ouverture externe reste disponible.

Une maquette fichier utilise l’aperçu authentifié des fichiers PNG, JPEG ou WebP. Les autres documents se téléchargent ; un SVG n’est jamais exécuté inline. Le mode mobile d’un lien adapte le viewport de l’iframe. Pour une image, il s’agit explicitement d’une vue réduite, pas d’une preuve de rendu mobile.

## Validation

L’interface demande confirmation avant d’enregistrer l’accord. L’administrateur peut commenter et publier, mais ne signe jamais à la place du client. Le serveur vérifie à nouveau dans la transaction que la version est la dernière et que sa source est disponible. Une ancienne version renvoie 409 `PREVIEW_SUPERSEDED`, même si elle avait déjà été validée. Une source retirée renvoie 409 `PREVIEW_UNAVAILABLE`. La répétition de la validation actuelle est idempotente et renvoie la même approbation.

La validation met la version et le projet en `approved`. Une nouvelle publication conserve l’historique et remet le projet en `review`. Un commentaire est un retour distinct : il ne signifie jamais une approbation et ne modifie pas son statut.

## Vérifications

`node --test tests/collaboration.test.mjs` couvre par HTTP deux propriétaires et un administrateur, toutes les autorisations, la persistance, les vraies pièces jointes privées, les références d’un autre projet ou retirées, les liens dangereux, le SVG, les retours, les versions, la confirmation, l’approbation idempotente et le refus d’une version dépassée. Le typecheck vérifie les deux pages.

La vérification visuelle sur navigateur et l’intégration du parcours complet sont conduites par l’agent racine sur l’application assemblée.
