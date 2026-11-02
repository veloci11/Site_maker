# DNS — notifications transactionnelles studio

Sous-domaine d’envoi dédié : `notifications.gilmathis.com` (Resend, Europe).
Aucun changement des MX du domaine principal. Pas de suivi des ouvertures ni des clics.

| Type | Nom dans la zone gilmathis.com | Valeur | Priorité | TTL |
| --- | --- | --- | --- | --- |
| TXT | resend._domainkey.notifications | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDEDagwnf8xoM9XakGJjMpq1coynYkWIOO+kQ5KsQYNhLDxXf7gMWuM3OVif589ZZEbCJ0WYoPC7mTSc21iobpbgZQuDQ1Duzu8w9GBYPM3mdsRezvH3zDcFcyIPxBvhywKi9N7vky6P7on5fBpvtO2YCE8/X13vjLxBvpgxDWSyQIDAQAB` | — | Auto |
| MX | send.notifications | feedback-smtp.eu-west-1.amazonses.com | 10 | Auto |
| TXT | send.notifications | `v=spf1 include:amazonses.com ~all` | — | Auto |
| CNAME | rsend.notifications | send.forge.rmta.net | — | Auto |

Le CNAME reste en DNS seul (non proxifié). Les clés API ne figurent jamais dans ce fichier.
