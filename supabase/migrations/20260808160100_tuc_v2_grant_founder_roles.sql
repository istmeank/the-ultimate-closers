-- ═══════════════════════════════════════════════════════════════════════════
-- Attribution des rôles fondateur — Owner + Administrateur
-- Session 34 (2026-08-08) · demandé par Nacer
-- ═══════════════════════════════════════════════════════════════════════════
--
-- OBJET
-- Attribuer `owner` et `admin` au compte fondateur. Les rôles étant cumulables
-- (aucune hiérarchie implicite), les deux sont posés explicitement — `owner`
-- seul ne conférerait pas les droits d'administration.
--
-- PRÉREQUIS — LE COMPTE DOIT EXISTER
-- Cette migration ne crée AUCUN compte : la création d'un utilisateur suppose
-- de définir un mot de passe, ce qui ne se fait ni dans une migration ni par
-- un agent. Nacer crée le compte lui-même, via l'inscription de l'application
-- ou le tableau de bord Supabase (Authentication → Users → Add user).
--
-- Si le compte n'existe pas encore, la migration ne fait rien et le signale
-- par un NOTICE, sans échouer — elle reste rejouable telle quelle après
-- création du compte.
--
-- IDEMPOTENTE — `ON CONFLICT DO NOTHING` s'appuie sur UNIQUE (user_id, role).
-- Rejouer cette migration n'a aucun effet de bord.
--
-- NOTE SUR L'ADRESSE EN CLAIR
-- L'adresse figure dans un fichier versionné. Il s'agit de l'adresse
-- professionnelle du fondateur, sur le domaine de l'entreprise, communiquée
-- explicitement pour cet usage — non d'une donnée prospect, que les règles TUC
-- interdisent de faire figurer dans le dépôt. Le bénéfice est la
-- reproductibilité : un nouvel environnement rejoue cette migration et
-- retrouve son compte fondateur sans intervention manuelle.
-- ═══════════════════════════════════════════════════════════════════════════

SET lock_timeout = '5s';

DO $$
DECLARE
  v_email   CONSTANT TEXT := 'abdenacer.maredj@theultimateclosers.com';
  v_user_id UUID;
  v_granted INTEGER;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(v_email)
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE
      'Compte % introuvable — aucun rôle attribué. Créez le compte '
      '(inscription de l''application ou Supabase → Authentication → Users), '
      'puis rejouez cette migration.', v_email;
    RETURN;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'owner'),
         (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  GET DIAGNOSTICS v_granted = ROW_COUNT;

  RAISE NOTICE 'Compte % (%) — % rôle(s) ajouté(s). owner + admin actifs.',
    v_email, v_user_id, v_granted;
END $$;
