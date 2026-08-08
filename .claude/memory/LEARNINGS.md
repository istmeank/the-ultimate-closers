# LEARNINGS — Apprentissages capitalisés

> Chaque solution à un blocage, chaque insight produit, chaque pattern reconnu y entre.
> C'est la mémoire vivante du projet — on la consulte **avant** d'attaquer un sujet pour ne pas refaire les mêmes erreurs.

## Pourquoi ce registre
Sans ce fichier, on retape deux fois les mêmes corrections. Avec, chaque problème résolu nous rend plus forts pour le suivant.

## Format d'une entrée

```
## LEARNING-001 — Titre court de la leçon
- Date : YYYY-MM-DD
- Domaine : (acquisition / messagerie / matching / meet / onboarding / transverse)
- Issu de : BLOCKER-XXX (si applicable)
- Constat : ce qu'on a compris
- Règle à appliquer : la formulation actionnable pour la prochaine fois
- Exemple : un cas concret
```

---

<!-- Première leçon à ajouter ici quand elle arrive -->

## LEARNING-036 — Vault secrets > pgsodium TCE pour les tokens OAuth Supabase
- **Contexte** : BLOCKER-001, session 18
- **Observation** : `pgsodium` n'est pas installé en extension brute sur TUC-v2, mais `supabase_vault` (v0.3.1) EST installé. Le skill précise que pgsodium TCE est déprécié et que Vault wraps = chemin stable long terme.
- **Pattern retenu** : stocker chaque token via `vault.secrets` (INSERT → retourne UUID), stocker l'UUID dans la table métier, lire via `vault.decrypted_secrets` avec `service_role` uniquement.
- **Gain** : pas besoin d'installer pgsodium, API Vault stable, migration pure schéma (0 données à migrer car tables vides).

## LEARNING-037 — Tables vides = migration schéma pure, risque zéro
- **Contexte** : session 18, closer_integrations + google_calendar_tokens avaient 0 lignes
- **Pattern** : avant toute migration destructive (DROP COLUMN), vérifier `rows` via `list_tables`. Si 0 → ALTER TABLE direct sans script de migration de données, sans transaction complexe.
- **Règle** : toujours vérifier le count avant de planifier une migration de données. Ça change radicalement la complexité.

## LEARNING-038 — Edge Functions Supabase : verify_jwt=false pour endpoints publics
- Date : 2026-06-09
- Contexte : `submit-call-booking` et `track-analytics` sont des endpoints publics (pas de compte requis). `verify_jwt: false` est correct ici car la sécurité est assurée par Upstash rate limiting + validation stricte des inputs.
- Leçon : `verify_jwt: true` = sécurité JWT Supabase imposée par la plateforme. `verify_jwt: false` = l'Edge Function gère sa propre auth. Ne jamais laisser un endpoint `verify_jwt: false` SANS une autre couche de protection (rate limit, validation, CORS strict).

## LEARNING-039 — DROP POLICY après migration vers Edge Function
- Date : 2026-06-09
- Contexte : déployer une Edge Function qui gère les INSERTs via service_role ne suffit pas — la politique RLS permissive reste en place et continue d'autoriser les INSERTs directs via l'API publique.
- Leçon : toujours coupler un déploiement Edge Function qui remplace un endpoint direct par un DROP POLICY de la règle permissive correspondante.

## LEARNING-040 — REVOKE PUBLIC vs REVOKE anon/authenticated
- Date : 2026-06-09
- Contexte : REVOKE EXECUTE FROM anon, authenticated ne suffit pas si un GRANT TO PUBLIC existe. PUBLIC est un groupe implicite PostgreSQL qui couvre tous les rôles présents et futurs.
- Leçon : toujours révoquer de PUBLIC en premier (`REVOKE ... FROM PUBLIC`), puis affiner avec des GRANTs ciblés. Un REVOKE sur anon/authenticated ne retire pas le grant PUBLIC.

## LEARNING-082 — Une SPA rendue côté client est invisible pour les moteurs de réponse IA
- Date : 2026-07-25
- Contexte : récupération HTTP de theultimateclosers.com. La réponse ne contient que les balises `meta` : aucun titre de section, aucun paragraphe, aucun nom de service. Les moteurs classiques exécutent JavaScript, les moteurs de réponse IA le font mal ou pas du tout.
- Leçon : sur toute SPA, vérifier ce qu'un client sans JavaScript reçoit avant de conclure qu'une page est « en ligne ». Un `curl` sur l'URL suffit. Tant que le pré-rendu n'est pas en place, un bloc `<noscript>` sémantique et un JSON-LD dans `index.html` récupèrent l'essentiel du gain pour un risque de régression nul — ils vivent dans le HTML statique, hors du cycle de rendu React.

## LEARNING-083 — Le format le plus cité par un moteur de réponse est la question, pas la page
- Date : 2026-07-25
- Contexte : mise en place de la couche AEO. Les données structurées `FAQPage` et les blocs de définition autonomes sont ce qu'un moteur extrait, parce qu'ils répondent sans dépendre du contexte environnant.
- Leçon : écrire chaque réponse pour qu'elle tienne seule, sortie de sa page, en 40 à 60 mots. Une définition qui commence par « comme nous l'avons vu plus haut » est inextractible. Cela vaut aussi pour la documentation produit et les articles.

## LEARNING-084 — Le fichier llms.txt sert autant à contrôler le récit qu'à être trouvé
- Date : 2026-07-25
- Contexte : rédaction du `llms.txt` de TUC. Sa section « ce que nous ne faisons pas » énonce explicitement l'absence de vente sous pression et de prospection sans consentement.
- Leçon : sans définition contrôlée, un modèle décrit une organisation à partir de fragments trouvés ailleurs. Le `llms.txt` est le seul endroit où l'on peut poser sa propre définition et ses propres limites. La section « ce que nous ne faisons pas » y a autant de valeur que la section « ce que nous faisons ».
