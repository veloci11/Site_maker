# Demandes publiques et notifications Resend

Le parcours public n’exige aucun compte. La demande est enregistrée en SQLite avant la notification ; une panne de Resend ne supprime pas le dossier. Aucun paiement ni commande payée n’est créé par ce parcours. Les anciennes demandes et leur liste dans l’administration sont conservées.

## Contrat HTTP

`POST /api/inquiries` accepte le formulaire historique :

```json
{"name":"Nom du contact","email":"contact@example.com","subject":"Projet de site","message":"Description du projet, au moins dix caractères."}
```

Ou une demande configurée :

```json
{
  "name":"Nom du contact",
  "email":"contact@example.com",
  "phone":"",
  "company":"",
  "message":"",
  "inspiration":"",
  "configuration":{"offerId":"vitrine","mobile":true,"extras":[]},
  "requestId":"a7e9cf2e-5f62-4dc2-ae10-d98e9a25c9da",
  "website":""
}
```

Le client génère un UUID stable pour une soumission et le conserve pendant ses retries. Une nouvelle demande ou une modification volontaire du formulaire utilise un nouvel UUID. Le `requestId` est obligatoire avec `configuration`, facultatif pour les anciens contacts. Les champs facultatifs vides sont normalisés ; les coordonnées sont validées et les champs inconnus refusés. Le prix, le devis, le destinataire et les informations d’expéditeur ne peuvent pas être fournis par le navigateur.

La configuration accepte les clés `offerId`, `language`, `mobile`, `managedContent`, `scene3d`, `deployment`, `maintenance` et `extras`. Le catalogue partagé valide les options, impose les capacités comprises dans le forfait et évite leur double facturation. Les tarifs viennent de `getPricing()` côté serveur. Configuration et devis sont enregistrés en instantanés, sans être recalculés lors d’un retry identique.

Une création renvoie **201**, un retry identique **200** :

```json
{"ok":true,"id":"identifiant-de-la-demande","notification":"queued"}
```

La réponse ne contient ni coordonnées, ni devis, ni secret. `notification` signifie :

| Valeur | Signification |
| --- | --- |
| `queued` | Demande enregistrée ; notification en attente ou en cours avec configuration disponible. |
| `accepted` | Resend a accepté la notification et a renvoyé un identifiant, lors d’une tentative antérieure. Cela ne prouve pas sa livraison en boîte de réception. |
| `unavailable` | Demande enregistrée, mais transport absent/invalide ou notification arrêtée. Ne pas annoncer qu’un e-mail est parti. |

Un UUID déjà utilisé avec d’autres données renvoie **409**, `code: REQUEST_CONFLICT`, sans exposer la demande antérieure. Une validation échoue avec **400**. Le champ `website` est un piège anti-robot : il doit rester vide ; un remplissage reçoit une réponse neutre sans enregistrement ni notification. Les demandes sont limitées par adresse IP (8 par 15 minutes par processus, réponse **429**). Le contrôle d’origine déjà utilisé par l’application s’applique aussi à cette route. Le proxy doit conserver la configuration de confiance documentée pour que la limitation corresponde à la bonne adresse.

Il n’existe aucun accès GET public aux coordonnées ou aux demandes. Le texte utilisateur reste du texte brut dans la notification ; aucune chaîne de visiteur n’est exécutée comme du HTML.

## Configuration serveur

| Variable | Usage |
| --- | --- |
| `RESEND_API_KEY` | Clé privée d’envoi Resend, uniquement côté serveur. |
| `RESEND_FROM` | Expéditeur autorisé, par exemple `Studio <contact@votre-domaine.fr>`. |
| `INQUIRY_TO` | Adresse unique du studio destinataire des nouvelles demandes. |

Ces variables ne portent jamais de préfixe `VITE_`. Elles sont injectées dans l’environnement privé du service, hors du dépôt et des journaux. L’expéditeur doit appartenir au domaine configuré et vérifié dans Resend. Leur présence syntaxique ne constitue pas une preuve de validité de la clé, du domaine ou de délivrabilité.

Le destinataire est exclusivement `INQUIRY_TO`. L’adresse du visiteur est placée dans `reply_to` pour permettre une réponse manuelle du studio ; elle n’est jamais utilisée comme destinataire automatique. Aucune auto-réponse au visiteur n’est envoyée, afin que le formulaire public ne serve pas de relais de messages vers un tiers.

Sans configuration valide, le dossier reste enregistré avec une notification `unavailable` et zéro tentative. Il pourra être traité si le service est ensuite configuré. Cela ne raccorde pas la récupération de mot de passe historique : son transport est un mécanisme distinct.

## File durable et reprise

Le module `server/inquiries.mjs` crée de façon idempotente :

- `inquiry_details`, rattachée à `inquiries`, avec UUID unique, empreinte du contenu et instantanés JSON ;
- `inquiry_outbox`, avec état, tentatives, échéances, bail temporaire, corps Resend figé et identifiant du prestataire.

La demande, ses détails et la tâche d’envoi sont écrits dans une même transaction. La liste administrative historique lit toujours `inquiries`. Son message inclut un récapitulatif des choix ; les instantanés structurés restent privés dans `inquiry_details`. Les nouvelles tables sont incluses dans les sauvegardes SQLite habituelles ; aucun fichier d’outbox public n’est créé.

**Seul `server/index.mjs` démarre le worker.** Importer `createApp()` ou poster une demande ne déclenche aucun appel réseau. Le worker consulte la file au démarrage puis toutes les cinq secondes après la fin du lot précédent, avec des timers `unref`. Un lot traite au maximum quatre tâches successivement. Un bail et un jeton de prise en charge empêchent deux workers de finaliser simultanément la même tâche ; un bail expiré après un arrêt brutal peut être repris.

L’appel à `https://api.resend.com/emails` utilise un délai maximal de cinq secondes, y compris la lecture de la réponse. Il est annulé à l’arrêt du service. Le destinataire, l’expéditeur et le corps exact sont figés à la première tentative et conservés pour les suivantes, même si l’environnement change entre-temps. La clé API n’est jamais enregistrée dans ce corps. L’en-tête `Idempotency-Key` vaut `studio-inquiry/<id>` pour toutes les tentatives d’une notification.

Resend conserve les clés d’idempotence pendant 24 heures. Le worker limite donc les reprises à **23 heures après la première tentative**, avec au maximum **8 tentatives**, sans prolonger cette échéance après redémarrage. Le délai croît de 30 secondes à 32 minutes ; `Retry-After` est respecté lorsque son attente est plus longue, dans la limite de la fenêtre. Un dossier qui n’a encore jamais pu être tenté faute de configuration ne consomme pas cette fenêtre. Voir [la documentation officielle d’idempotence Resend](https://resend.com/docs/dashboard/emails/idempotency-keys).

| État privé | Traitement |
| --- | --- |
| `pending` / `unavailable` | En attente d’une première prise en charge/configuration. |
| `processing` | Bail actif pendant l’appel Resend. |
| `retry` | Erreur réseau, timeout, HTTP 408/429/5xx, réponse de succès illisible, ou `concurrent_idempotent_requests` ; reprise programmée. |
| `accepted` | Réponse Resend valide avec identifiant ; aucun nouvel envoi automatique. |
| `failed` | Erreur permanente (dont HTTP 401/403/422 ou conflit de corps), nombre maximal de tentatives atteint, ou prochaine reprise hors fenêtre. Intervention opérateur nécessaire. |
| `expired` | La fenêtre de 23 heures est dépassée au contrôle suivant ; aucune reprise automatique. |

Les erreurs de configuration du compte et les erreurs transitoires sont ainsi distinguées. Le message détaillé de Resend n’est ni stocké ni journalisé ; seuls des codes contrôlés sont conservés (`CONFIG_MISSING`, `HTTP_403`, `TIMEOUT`, `NETWORK_ERROR`, `IDEMPOTENCY_BUSY`, etc.). Resend documente séparément le [conflit de corps permanent et une requête identique encore en cours](https://resend.com/docs/dashboard/emails/idempotency-keys#possible-responses).

## Suivi opérateur

Dans un contexte privé d’administration de la base, ces lectures ne contiennent pas de coordonnées :

```sql
SELECT status, COUNT(*) AS count, MIN(updated_at) AS oldest_update
FROM inquiry_outbox GROUP BY status;

SELECT inquiry_id, status, attempts, last_error_code, next_attempt_at, deadline_at
FROM inquiry_outbox
WHERE status IN ('failed','expired','unavailable')
ORDER BY updated_at;
```

L’export `inquiryOutboxSummary()` fournit également le premier récapitulatif, sans route publique. Surveiller les tâches `unavailable`, les échecs et les tâches anciennes en `retry`/`processing`. Vérifier le domaine expéditeur, la clé, le quota et les événements dans le tableau de bord Resend lorsqu’un envoi a été accepté mais que le message n’est pas reçu.

Cette version ne traite pas de webhook de livraison ou de rebond : `accepted` n’est jamais renommé `delivered`. Après une erreur permanente, corriger la cause et examiner la tâche ainsi que l’historique Resend avant une éventuelle reprise manuelle. Ne pas réinitialiser aveuglément un identifiant ou une échéance dépassée : une nouvelle émission après expiration de la clé pourrait produire un doublon. Ne pas publier de corps de messages, d’exports de demandes ou de secrets dans un ticket de diagnostic.

`SIGINT`/`SIGTERM` arrêtent la prise de tâches, annulent l’appel en cours, attendent sa mise à jour dans la file puis ferment SQLite. Un arrêt brutal peut laisser un bail qui sera repris après expiration, avec le même corps et la même clé.

## Vérifications locales

`node --test tests/inquiries.test.mjs` utilise des bases privées temporaires et un `fetch` injecté, jamais Resend réel : **16/16 tests réussis le 2 novembre 2026**. Les cas couvrent le contact anonyme historique, les options/prix serveur, le retry identique et le conflit, le piège anti-robot, les origines et limites IP, l’absence de configuration, les erreurs permanentes/transitoires, le timeout, la fenêtre de reprise, les prises concurrentes et l’arrêt du worker. Les contrôles intégrés de l’application vérifient aussi que le contact demeure accessible avant les routeurs exigeant une session.

La configuration de l’environnement public, l’état du domaine Resend et un éventuel envoi réel autorisé doivent être vérifiés séparément par l’opérateur. Les tests n’en constituent pas une preuve.

## Préparation de l’instance gilmathis.com — 2 novembre 2026

- Domaine `notifications.gilmathis.com` vérifié dans Resend ; les quatre enregistrements sont dans `RESEND_DNS.md`. Aucun MX du domaine principal modifié.
- Clé active dédiée `studio-site-maker-production`, permission d’envoi limitée à ce domaine, installée dans le fichier privé de l’application Ubuntu. Jamais dans les sources ou le build.
- Adresse `RESEND_FROM` préparée : `studio <projets@notifications.gilmathis.com>`.
- `INQUIRY_TO` attend l’adresse de réception de Mathis. Tant qu’elle manque, les demandes restent privées et conservées, notification `unavailable` ; aucun envoi réel n’a été testé.
- Le premier essai d’installation a créé une clé nommée `studio-site-maker-inquiries`, jamais installée ni utilisée ; sa valeur n’est pas conservée. Elle reste à supprimer manuellement si souhaité. Le connecteur exige une confirmation explicite pour révoquer une clé ; aucune révocation ni modification d’une clé préexistante n’a été effectuée.
