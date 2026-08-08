-- ═══════════════════════════════════════════════════════════════════════════
-- Droits du rôle `manager` — supervision globale en lecture + réassignation
-- Session 34 (2026-08-08) · ADR-036 · décidé par Nacer
-- ═══════════════════════════════════════════════════════════════════════════
--
-- ⚠️ À APPLIQUER APRÈS `20260808160000_tuc_v2_extend_app_role_enum.sql`.
-- PostgreSQL interdit d'utiliser une valeur d'enum dans la transaction qui l'a
-- créée : cette migration référence `'manager'`, elle doit donc être appliquée
-- séparément, une fois l'enum étendu et validé.
--
-- PÉRIMÈTRE DÉCIDÉ
-- Une seule équipe de closers pour l'instant. Le manager supervise donc tout le
-- monde, sans notion de rattachement — `profiles` n'a pas de `manager_id`, et
-- en ajouter un pour une équipe unique serait construire une structure pour un
-- besoin qui n'existe pas.
--
--   ✓ Lecture de tous les leads, interactions, rendez-vous et affaires
--   ✓ Lecture des profils de closers (charge, activité)
--   ✓ Réassignation d'un lead d'un closer à un autre — geste de supervision
--   ✗ Aucune création ni suppression
--   ✗ Aucun accès à `user_roles` (il ne se promeut pas lui-même)
--   ✗ Aucun accès aux jetons d'intégration
--
-- ⚠️ POINT DE VIGILANCE RGPD — À REVOIR À LA SECONDE ÉQUIPE
-- Un manager voit ici TOUS les prospects, y compris ceux dont il n'a pas la
-- charge. C'est défendable avec une équipe unique, où « son équipe » et « tout
-- le monde » se confondent. Dès qu'une seconde équipe apparaît, cette lecture
-- globale expose des données personnelles au-delà du nécessaire et contredit le
-- principe de minimisation. Le remède est connu : ajouter `manager_id` sur
-- `profiles` et filtrer ces politiques dessus. Ce n'est pas un oubli — c'est un
-- report assumé, avec son déclencheur écrit.
--
-- MÉTHODE — les politiques existantes ne sont pas modifiées.
-- On ajoute des politiques distinctes. PostgreSQL combine par OU logique les
-- politiques permissives d'une même commande : les droits existants des
-- closers, admins et owners sont donc intacts. Une migration qui n'altère rien
-- se relit et s'annule plus facilement qu'une migration qui réécrit.
-- ═══════════════════════════════════════════════════════════════════════════

SET lock_timeout = '5s';

-- ── leads : lecture globale ──────────────────────────────────────────────────
CREATE POLICY "leads_select_manager" ON public.leads
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND public.has_role((select auth.uid()), 'manager'::public.app_role)
  );

-- ── leads : réassignation uniquement ─────────────────────────────────────────
-- Le manager peut modifier un lead, y compris changer son `owner_id` pour le
-- confier à un autre closer. Il ne peut pas le sortir de la corbeille :
-- `deleted_at IS NULL` est exigé des deux côtés, donc un lead supprimé reste
-- supprimé et un lead vivant ne peut pas être marqué supprimé par ce biais.
CREATE POLICY "leads_update_manager" ON public.leads
  FOR UPDATE TO authenticated
  USING (
    deleted_at IS NULL
    AND public.has_role((select auth.uid()), 'manager'::public.app_role)
  )
  WITH CHECK (
    deleted_at IS NULL
    AND public.has_role((select auth.uid()), 'manager'::public.app_role)
  );

-- ── interactions : lecture globale ───────────────────────────────────────────
CREATE POLICY "interactions_select_manager" ON public.interactions
  FOR SELECT TO authenticated
  USING (public.has_role((select auth.uid()), 'manager'::public.app_role));

-- ── appointments : lecture globale ───────────────────────────────────────────
CREATE POLICY "appointments_select_manager" ON public.appointments
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND public.has_role((select auth.uid()), 'manager'::public.app_role)
  );

-- ── deals : lecture globale ──────────────────────────────────────────────────
CREATE POLICY "deals_select_manager" ON public.deals
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND public.has_role((select auth.uid()), 'manager'::public.app_role)
  );

-- ── profiles : lecture des closers supervisés ────────────────────────────────
-- Nécessaire pour afficher la charge et l'activité de chaque closer.
CREATE POLICY "profiles_select_manager" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role((select auth.uid()), 'manager'::public.app_role));

COMMENT ON POLICY "leads_update_manager" ON public.leads IS
  'Manager : réassignation d''un lead entre closers. Ne peut ni supprimer ni '
  'restaurer (deleted_at IS NULL exigé en USING et WITH CHECK). ADR-036.';
