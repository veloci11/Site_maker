# Équipe et intégration des briefs V2

Quinze spécialistes distincts, répartis en vagues de trois agents actifs au maximum en plus du coordinateur. Tous les périmètres sont clos ; aucun commit par un sous-agent.

| Spécialiste | Contribution |
| --- | --- |
| brief_research_vitrine | Recherche Reddit/Webflow, contenus et attentes de création/évolution |
| brief_research_technical | Recherche comptes, données, 3D et intégrations |
| backend_inquiry_audit | Audit des demandes, outbox, fichiers privés et sauvegardes existants |
| brief_schema_specialist | Modèle partagé des questions, validation et résumés |
| inquiry_image_specialist | Transport multipart borné, signatures et décodage des images |
| contact_validation_specialist | Validation commune des quatre coordonnées obligatoires |
| brief_form_ui_specialist | Formulaire commun, rubriques, images et erreurs |
| inquiry_backend_specialist | Schéma V2, instantanés et transaction demande/images/outbox |
| offer_options_specialist | Options publiques ciblées par forfait, historique préservé |
| admin_brief_ui_specialist | Dossiers structurés et images dans l’administration |
| configurator_integration_specialist | Intégration, retour aux options sans perdre le brief |
| inquiry_backup_specialist | Restauration réelle des BLOB et des anciens fichiers |
| inquiry_security_integration | Tests du vrai serveur et correction de concurrence après déconnexion |
| brief_browser_ux_review | Revue des six parcours et du mobile dans l’IAB |
| human_code_release_review | Revue de lisibilité, cycle de vie et préparation Ubuntu |

Le coordinateur intègre les fichiers communs et les corrections. La dernière revue de code a trouvé deux points corrigés : Changer désactivé pendant l’envoi des services, et lien direct vers un dossier consultable même au-delà des 200 demandes listées. La revue UX a conduit à compléter les références visuelles Refonte, la plateforme « autre », les échanges avec les outils et les exceptions Sur mesure. Les résumés raccourcissent seulement les longs textes affichés ; les réponses complètes et les choix restent conservés.

Validation consolidée : `npm run check`, 192 tests réussis, puis reconstruction après le dernier ajustement de libellé Sur mesure. Les trois images de matière approuvées conservent leurs SHA-256. Les avertissements Vite temporaires sur les assets ne laissent aucun marqueur non résolu dans les CSS/JS produits ; le rendu final est vérifié séparément.

Le parcours complet Refonte a été soumis uniquement à une base locale isolée avec des coordonnées fictives et une image de test : blocage des coordonnées absentes/téléphone invalide, demande enregistrée, lecture des rubriques et miniature chargée dans l’administration. Aucune notification réelle. Les tests de transport e-mail injectent leurs réponses ; ils ne démontrent aucune livraison externe.
