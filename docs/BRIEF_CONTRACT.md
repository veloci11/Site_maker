# Briefs publics — contrat V2

Les nouvelles demandes exigent prénom, nom, e-mail et téléphone. Les anciennes demandes restent lisibles, sans découper leurs noms ni réécrire leurs messages. Aucun compte, commande ou paiement n’est créé par ce formulaire.

## Transport et validation

`POST /api/inquiries` accepte JSON sans image, ou multipart avec un seul champ `payload` JSON et des champs `files` répétés. Le payload contient exclusivement :

```ts
{
  schemaVersion: 2,
  requestId: string, // UUID, conservé pour une nouvelle tentative identique
  requestType: 'vitrine' | 'connecte' | 'immersif' | 'sur-mesure' | 'evolution' | 'refonte' | 'contact',
  firstName: string, lastName: string, email: string, phone: string,
  company?: string,
  configuration: Configuration | null,
  brief: BriefAnswers,
  website?: string // piège antispam, distinct de currentUrl dans le brief
}
```

Les quatre créations portent une configuration correspondant au type de demande. Évolution, Refonte et Contact portent `null`. Le sujet, le nom complet, les devis et les résumés sont construits par le serveur. `shared/inquiry-contact.ts`, `shared/brief.ts` et `shared/offer-options.ts` centralisent respectivement coordonnées, questions/validation et compatibilité des options. Les réponses ne déclenchent jamais une option payante.

Le brief comporte des rubriques et des questions conditionnelles. Les réponses invisibles sont retirées avant l’envoi ; le serveur refuse les clés inconnues, les choix invalides et les réponses hors contexte. Les URL doivent être HTTP(S), sans identifiants ; le serveur ne les visite pas. Aucun mot de passe ni clé API n’est demandé.

## Images privées

JPEG, PNG et WebP uniquement : six images au maximum, 5 Mio par image et 20 Mio au total. Champ JSON limité à 64 Kio. Deux requêtes multipart simultanées au maximum par processus. Extension, MIME, signature, dimensions et décodage réel sont contrôlés avant enregistrement ; pas d’image animée. Les originaux acceptés sont conservés.

Stockage retenu pour le faible volume du studio : BLOB SQLite dans `inquiry_attachments`, lié à la demande. Demande, réponses, images et outbox sont enregistrées dans une transaction ; un échec ne laisse aucun fichier orphelin. Les images sont incluses dans le snapshot SQLite de la sauvegarde existante. Le stockage cumulé est plafonné (512 Mio par défaut, réglable par `INQUIRY_UPLOAD_STORAGE_LIMIT_BYTES`) ; la saturation refuse un nouveau lot d’images sans affecter les demandes sans image.

Une deuxième table additive `inquiry_briefs` conserve version, type, prénom, nom et réponses JSON. `inquiry_details` conserve les instantanés de configuration/devis et l’empreinte, qui inclut les octets de chaque image. Même UUID et contenu : même demande ; contenu différent : conflit. Les instantanés et payloads e-mail historiques restent inchangés.

## Administration et notification

La liste admin reste légère. `GET /api/admin/inquiries/:inquiryId` fournit un détail compatible avec les anciennes lignes, avec coordonnées, rubriques, configuration/devis et métadonnées des images. `.../files/:fileId/preview` et `.../download` exigent le rôle administrateur, vérifient le rattachement à cette demande et portent des en-têtes privés. Aucun octet d’image dans le DTO JSON, aucun accès public.

Le texte de notification contient le récapitulatif et la liste des images avec un lien vers l’administration authentifiée. La file durable et la politique de nouvelle tentative existantes sont conservées. L’adresse `INQUIRY_TO` reste à fournir plus tard par Mathis. Les tests injectent le transport e-mail ; aucun envoi réel.
