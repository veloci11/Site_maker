# Provenance de l’échec GitHub Actions

Vérification en lecture seule le **5 novembre 2026 à 05:13 UTC** (4 novembre à 23:13, Mexico), via l’API publique GitHub. Aucun test, build, changement de compte, relancement ou déploiement effectué dans cette intervention.

Le dernier run disponible, [Check application #54](https://github.com/veloci11/Site_maker/actions/runs/41971359457), concerne le commit [`3d4d854677066c9779cf7c743e068c92ece3e880`](https://github.com/veloci11/Site_maker/commit/3d4d854677066c9779cf7c743e068c92ece3e880). Il est terminé en échec ; son job `check` dure deux secondes, de 05:01:25 à 05:01:27 UTC, avec `runner_id: 0`, nom de runner vide et aucune étape exécutée ([réponse jobs](https://api.github.com/repos/veloci11/Site_maker/actions/runs/41971359457/jobs)).

L’[annotation officielle de ce job](https://api.github.com/repos/veloci11/Site_maker/check-runs/127060133301/annotations) indique :

> The job was not started because your account is locked due to a billing issue.

Le [run #53 cité dans la notification](https://github.com/veloci11/Site_maker/actions/runs/41968746233), sur `e6cf6f7`, possède [la même annotation de blocage](https://api.github.com/repos/veloci11/Site_maker/check-runs/127051764912/annotations). L’autre annotation est une simple information sur la migration de l’image `ubuntu-latest` vers Ubuntu 26. Elle ne signale pas la cause de l’échec. Les données publiques ne précisent ni la somme, ni le moyen de paiement, ni la cause détaillée du verrouillage.

Les dix derniers runs montrent sept échecs successifs (#48 à #54) ; le dernier succès est [#47](https://github.com/veloci11/Site_maker/actions/runs/41774282106), sur `a90cbce`, le 4 novembre à 04:37 UTC. Les annotations ont été contrôlées directement pour #53 et #54 seulement ([liste publique des runs](https://api.github.com/repos/veloci11/Site_maker/actions/runs?per_page=10)).

## Trois états distincts

| Contrôle | Ce qui est établi |
| --- | --- |
| GitHub Actions | Le job distant des deux runs examinés est bloqué avant l’exécution. Aucun résultat de test distant ne peut en être déduit. Le [workflow à cette révision](https://github.com/veloci11/Site_maker/blob/3d4d854677066c9779cf7c743e068c92ece3e880/.github/workflows/ci.yml) prévoit checkout, Node 24, `npm ci`, puis `npm run check` ; il ne contient pas de déploiement. |
| Vérification locale | [Le rapport de livraison Vitrine](../vitrine-trial/review.md) consigne TypeScript, build et **213 tests locaux réussis**. Résultat antérieur documenté, non réexécuté par cette intervention. Cela ne vaut pas validation distante des modifications en cours. |
| Production Ubuntu | Le même rapport et [la trace d’origine](../vitrine-trial/deployment-origin.json) consignent la release active `20261105T050156Z-3d4d85467706`, publiée sur [gilmathis.com](https://gilmathis.com/), avec santé et contrôles publics réussis. Cette intervention n’a pas recontrôlé le serveur. `ops/DEPLOYMENT_STATUS.md` décrit encore la livraison précédente `3d1c08c` ; il ne faut pas utiliser ce fichier seul comme preuve du dernier état. |

## Action à faire par Mathis

Ouvrir les [paramètres de facturation du compte GitHub](https://github.com/settings/billing), examiner l’alerte de verrouillage et suivre la résolution demandée par GitHub. Si l’état ne s’explique pas ou reste verrouillé, contacter le [support GitHub](https://support.github.com/contact) en donnant les deux liens de runs ci-dessus. Une fois le compte débloqué, relancer le workflow et attendre son résultat avant de qualifier la CI de réussie. Aucun changement du code CI ne résout le blocage de compte signalé.

Aucun lien portant un jeton de notification e-mail n’a été utilisé ou conservé.

## Révision finale vérifiée

Le contrôle du commit `891bfac296850f83b0a39d94009738c7543576b8` affiche le même blocage de facturation avant lancement du job. [Exécution](https://github.com/veloci11/Site_maker/actions/runs/41977433109). Détail et annotation conservés dans `final-ci.json`.
