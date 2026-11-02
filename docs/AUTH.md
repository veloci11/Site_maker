# Comptes et sessions

Le serveur gère les comptes dans SQLite. Aucun compte client ou administrateur n'est livré avec un mot de passe par défaut. Les comptes d'essai des tests vivent dans un répertoire temporaire supprimé à la fin.

## Montage du serveur

Monter `authRouter` sur `/api/auth`, après `express.json()` ; appliquer `optionalAuth` aux routes projet avant `requireAuth`, et `csrfProtection` aux mutations privées. `requireAdmin` contrôle le rôle côté serveur. Le serveur doit conserver les données et l'outbox hors de ses répertoires statiques.

Routes : `GET /me`, `POST /register`, `/login`, `/logout`, `/forgot-password`, `/reset-password`, `PATCH /me` et `POST /change-password`. Les réponses de compte exposent uniquement `{ id, name, email, role }`. Les erreurs ont la forme `{ error, code }`.

Un nouveau mot de passe doit contenir 12 à 128 caractères. Il est dérivé avec scrypt (N=32768, r=8, p=3), sel aléatoire de 16 octets, clé de 64 octets. Le calcul est asynchrone et sa concurrence est limitée. La comparaison utilise `timingSafeEqual`.

Les sessions ont un jeton aléatoire de 32 octets ; seul son SHA-256 est conservé en base. Le cookie `studio_session` est HttpOnly, SameSite=Lax, Path=/, et Secure en production ou HTTPS. La durée maximale est de sept jours. Connexion et changement de mot de passe renouvellent la session ; réinitialiser le mot de passe révoque toutes les sessions du compte.

Configurer `APP_ORIGIN` ou `PUBLIC_APP_URL` avec l'origine attendue et servir la production en HTTPS. En développement, le proxy Vite doit préserver le Host (`changeOrigin:false`) ou `APP_ORIGIN` doit contenir l'origine du navigateur. Ne pas activer un proxy de confiance sans connaître l'infrastructure. Les origines étrangères et Origin:null sont rejetées sur les mutations. Les tentatives d'inscription, connexion et récupération sont limitées par adresse cliente en mémoire ; plusieurs instances nécessiteront un limiteur partagé.

## Récupération du mot de passe

Les demandes ne révèlent pas si le compte existe et ne retournent jamais le lien ou le jeton au navigateur demandeur. Les jetons durent trente minutes et ne servent qu'une fois. La base conserve uniquement leur hash.

Sans prestataire d'e-mail configuré, aucun e-mail n'est annoncé comme envoyé. En développement, les messages de récupération des comptes existants sont écrits dans `DATA_DIR/mail-outbox.ndjson` (droits 0600), hors de la partie publique du site. L'opérateur peut lire ce fichier localement pour tester le parcours ; ce fichier contient des liens secrets, ne doit pas être partagé, commité, servi par HTTP ou copié dans des journaux publics. En production, sans transport et origine HTTPS configurés, aucune livraison n'est simulée : la réponse indique que l'envoi d'e-mails n'est pas encore activé.

`createAuthRouter({ resetTransport })` permet de raccorder un transport transactionnel ultérieurement. Le transport reçoit `{ to, subject, resetUrl, createdAt }`. `PUBLIC_APP_URL` détermine l'origine du lien ; le Host de la requête n'est jamais utilisé pour construire un lien de récupération.

## Administration

L'export `createAdminUser({ name, email, password })` est réservé à une commande opérateur locale. Ne pas exposer cet export sur une route publique. Un e-mail déjà utilisé provoque une erreur ; le helper ne promeut ni ne remplace silencieusement un compte existant. Le navigateur ne peut pas choisir son rôle à l'inscription ou via le profil.

Les tests dédiés se lancent avec `node --test tests/auth.test.mjs`.
