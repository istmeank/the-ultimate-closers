-- ═══════════════════════════════════════════════════════════════════════════
-- Extension de l'enum app_role — Manager, Développeur, Client
-- Session 34 (2026-08-08) · résout BLOCKER-010 · décidé par Nacer
-- ═══════════════════════════════════════════════════════════════════════════
--
-- CONTEXTE
-- L'enum ne comptait que 4 valeurs (owner, admin, closer, user) alors que le
-- front utilisait déjà `developer` et `client` : toute écriture de ces rôles
-- échouait en 22P02 (BLOCKER-010). Nacer a par ailleurs confirmé le rôle
-- `manager`, absent de la base comme du front.
--
-- MODÈLE RETENU (décisions de session 34)
--   · Rôles CUMULABLES — une personne peut porter plusieurs rôles.
--     La table `user_roles` le permet déjà : UNIQUE (user_id, role).
--     Il n'y a donc PAS de hiérarchie implicite : être `owner` ne confère pas
--     automatiquement `admin`. Les deux se posent explicitement.
--   · `user` CONSERVÉ comme socle technique — c'est le rôle attribué par
--     `handle_new_user()` à chaque inscription. Le retirer casserait toute
--     création de compte. Il ne donne accès à rien de sensible.
--
-- ORDRE DE L'ENUM (après cette migration)
--   owner · admin · manager · closer · developer · client · user
--   L'ordre suit la portée décroissante des responsabilités, `user` fermant
--   la marche comme socle. Il gouverne les tris SQL sur la colonne `role`.
--
-- ⚠️ IRRÉVERSIBLE — PostgreSQL ne sait pas retirer une valeur d'un enum.
-- Ajouter est simple ; défaire exige de recréer le type et de réécrire chaque
-- colonne et chaque politique qui s'y réfèrent. D'où la retenue : on n'ajoute
-- que des rôles dont l'usage est décidé.
--
-- ⚠️ CETTE MIGRATION N'ACCORDE AUCUN DROIT.
-- Les 93 politiques RLS existantes ne mentionnent ni `manager`, ni
-- `developer`, ni `client`. Un utilisateur portant l'un de ces rôles n'aura
-- donc accès à rien de plus qu'un `user` tant que les politiques ne sont pas
-- écrites. C'est volontaire : refus par défaut. Les droits font l'objet d'une
-- migration distincte, sous la responsabilité de `auth-security-rls`.
--
-- ⚠️ ADD VALUE et transactions — PostgreSQL interdit d'UTILISER une valeur
-- d'enum dans la transaction qui l'a créée. Cette migration se contente
-- d'ajouter : aucune politique, aucun INSERT n'y référence les nouvelles
-- valeurs. Toute utilisation doit passer par une migration ultérieure.
-- ═══════════════════════════════════════════════════════════════════════════

SET lock_timeout = '5s';

-- Manager — supervise une équipe de closers.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager' AFTER 'admin';

-- Développeur — accès technique, SANS données prospects (décision session 34).
-- Périmètre : diagnostic, configuration, contenu. Jamais leads, appointments,
-- deals ni lead_interactions. Motif : véto n°3 des valeurs TUC (données
-- sensibles) et minimisation RGPD — un prestataire technique n'a pas à devenir
-- détenteur de données personnelles pour faire son travail.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'developer' AFTER 'closer';

-- Client — prospect converti disposant d'un espace personnel.
-- Déjà utilisé par le front (ProtectedRoute, UnifiedSidebar, RoleSwitcher).
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client' BEFORE 'user';

COMMENT ON TYPE public.app_role IS
  'Rôles TUC, cumulables (aucune hiérarchie implicite) : owner, admin, manager, '
  'closer, developer, client, user. `user` est le socle attribué à toute '
  'inscription par handle_new_user(). `developer` n''accède jamais aux données '
  'prospects. Voir ADR-036 et BLOCKER-010.';
