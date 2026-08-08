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

## LEARNING-085 — Une couche d'abstraction sans test n'est pas une abstraction, c'est une convention
- Date : 2026-08-08
- Contexte : clôture de T28. Les 13 services et 13 adapters existaient déjà et étaient de bonne facture, mais aucun test ne les couvrait. Les interfaces TypeScript disparaissent à la compilation : rien ne vérifiait à l'exécution qu'un adapter honorait son contrat.
- Leçon : le livrable qui prouve une abstraction n'est pas le fichier d'interface, c'est le test qui remplace l'adapter par un double et constate que le service fonctionne quand même. Tant que ce test n'existe pas, l'abstraction est une intention de l'auteur, pas une propriété du code. Corollaire : la ligne « 0 import orphelin » d'un rapport ne prouve rien seule — c'est le garde-fou automatisé qui la maintient vraie demain.

## LEARNING-086 — Une méthode différée doit échouer bruyamment et nommer sa tâche
- Date : 2026-08-08
- Contexte : dix méthodes de la couche services sont déclarées sans implémentation (matching → T08, secrets → T01, messaging → Domain 2, ai → phase ANK). Elles lèvent une erreur explicite plutôt que de renvoyer `undefined`.
- Leçon : le danger d'une capacité différée n'est pas l'oubli, c'est la découverte tardive. Un `undefined` silencieux se manifeste en écran blanc chez un closer en pleine conversation. Une erreur qui cite la tâche qui la débloquera transforme un incident de production en information de backlog. Le test qui garantit cet échec (`deferred.test.ts`) devient rouge le jour où la capacité est livrée — c'est le mécanisme de rappel qui met à jour le registre de dette tout seul.

## LEARNING-087 — Une leçon capitalisée dans une entité sœur ne se propage pas toute seule
- Date : 2026-08-08
- Contexte : BLOCKER-009 (262 fichiers marqués modifiés sans changement de contenu, faute de `.gitattributes`) avait déjà été rencontré ET résolu dans LULG tech, capitalisé en LEARNING-004 de ce dépôt. TUC a vécu le même problème pendant des semaines sans bénéficier de la réponse.
- Leçon : le squelette Silicate reproduit la *méthode* de capitalisation dans chaque entité, mais ne fait circuler aucun *contenu* entre elles. Deux dépôts gouvernés par le même squelette peuvent se croiser sur le même mur. Il manque un mécanisme de transfert — registre partagé au niveau SILICATE, ou revue croisée périodique des LEARNINGS entre entités sœurs. À remonter comme suggestion de squelette v0.7.

## LEARNING-088 — Un environnement de développement ne se répare pas depuis un montage réseau
- Date : 2026-08-08
- Contexte : `npm install` échoue structurellement sur le montage FUSE du dépôt (`ENOTEMPTY` sur le renommage de répertoires non vides, opération que npm utilise systématiquement). Une tentative interrompue a laissé `node_modules` amputé de ses binaires.
- Leçon : les opérations qui reposent sur le renommage atomique de répertoires (npm, git gc, certains bundlers) ne sont pas fiables sur un système de fichiers monté à distance. Elles doivent être exécutées côté machine native. Corollaire de vérification : quand une porte de la règle d'or ne peut pas être franchie depuis l'environnement courant, on l'annonce comme non franchie — on ne la déclare pas passée par équivalence.

## LEARNING-089 — Une valeur d'enum PostgreSQL s'ajoute, ne se retire pas
- Date : 2026-08-08
- Contexte : extension de `app_role` de quatre à sept valeurs (ADR-036).
- Leçon : `ALTER TYPE ... ADD VALUE` est trivial ; l'opération inverse n'existe pas. Retirer une valeur exige de recréer le type, de réécrire chaque colonne qui l'utilise et chaque politique qui s'y réfère — ici 93 occurrences de `has_role`. Conséquence pratique : on n'ajoute jamais un rôle « au cas où ». Le coût d'attendre est nul, celui de se tromper est une migration lourde. Corollaire : une valeur ajoutée dans une transaction ne peut pas être utilisée dans cette même transaction — l'extension de l'enum et son usage sont toujours deux migrations.

## LEARNING-090 — Un type dupliqué annule toute correction à la source
- Date : 2026-08-08
- Contexte : `AppRole` était redéclaré à l'identique dans trois composants en plus du service. Corriger le service n'aurait rien changé aux écrans.
- Leçon : la duplication d'un type n'est pas seulement une redondance, c'est une rupture silencieuse de la propagation. Le compilateur ne signale rien : les deux définitions coïncident au moment de la copie, et divergent ensuite sans avertissement. Un type partagé s'importe. Règle applicable au-delà des rôles : toute énumération qui reflète une contrainte de base de données doit avoir exactement une déclaration côté front, dans le service qui l'expose.

## LEARNING-091 — Un fichier de types généré, édité à la main, devient un mensonge que rien ne signale
- Date : 2026-08-08
- Contexte : cause racine de BLOCKER-010. `src/integrations/supabase/types.ts` porte l'en-tête « automatically generated — do not edit » et déclarait pourtant six valeurs d'enum quand la base n'en avait que quatre. Le front s'est aligné dessus en toute confiance.
- Leçon : un fichier généré est un miroir de la base. Édité à la main, il devient la source de vérité de fait du front — et l'écart est invisible : TypeScript valide, la compilation passe, seule la base refuse, à l'exécution, en production. Deux gardes : régénérer systématiquement après toute migration touchant un type ou une table, et considérer toute divergence entre un fichier généré et le schéma comme un incident, pas comme un détail à corriger en passant.
