# Appliquer les migrations de rôles — sans le connecteur MCP

> Session 34 · ADR-036 · à exécuter dans **SQL Editor** du tableau de bord Supabase
> Projet : `llxgyomevketvypusafl` — https://supabase.com/dashboard/project/llxgyomevketvypusafl/sql

## Pourquoi ce document

Les trois migrations existent dans `supabase/migrations/` et sont commitées, mais
un fichier `.sql` dans un dépôt n'exécute rien : il décrit une transformation, il
ne l'applique pas. L'application devait passer par le connecteur MCP, qui échoue
sur l'authentification à la base (`28P01`).

Le SQL Editor permet de ne pas attendre. **Un bloc à la fois, dans l'ordre.**

⚠️ **L'ordre n'est pas indicatif.** PostgreSQL refuse d'utiliser une valeur d'enum
dans la transaction qui l'a créée. Le bloc 1 doit être exécuté **et terminé** avant
le bloc 3. Les fusionner échoue.

---

## Bloc 0 — État avant (lecture seule, ne modifie rien)

```sql
SELECT unnest(enum_range(NULL::public.app_role))::text AS role_actuel;
```

Attendu à ce stade : 4 lignes — `owner`, `admin`, `closer`, `user`.

---

## Bloc 1 — Étendre l'enum à sept rôles

```sql
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager'   AFTER  'admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'developer' AFTER  'closer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client'    BEFORE 'user';
```

Vérification — 7 lignes attendues, dans cet ordre :
`owner · admin · manager · closer · developer · client · user`

```sql
SELECT unnest(enum_range(NULL::public.app_role))::text AS role;
```

⚠️ **Irréversible.** PostgreSQL ne sait pas retirer une valeur d'un enum.

---

## Bloc 2 — Vos rôles : owner + admin

**Prérequis : le compte doit exister.** Vérifiez d'abord :

```sql
SELECT id, email, created_at
FROM auth.users
WHERE lower(email) = lower('abdenacer.maredj@theultimateclosers.com');
```

**Aucune ligne ?** Créez le compte avant de continuer — Authentication → Users →
Add user, ou par l'inscription de l'application. Un mot de passe ne se définit ni
dans une migration, ni par un agent.

Puis :

```sql
DO $$
DECLARE
  v_email   CONSTANT TEXT := 'abdenacer.maredj@theultimateclosers.com';
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(v_email) LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Compte % introuvable — aucun rôle attribué.', v_email;
    RETURN;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'owner'), (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'owner + admin attribués à % (%).', v_email, v_user_id;
END $$;
```

Vérification — 2 lignes attendues :

```sql
SELECT u.email, r.role
FROM public.user_roles r
JOIN auth.users u ON u.id = r.user_id
WHERE lower(u.email) = lower('abdenacer.maredj@theultimateclosers.com');
```

Sans effet si rejoué : `UNIQUE (user_id, role)` absorbe les doublons.

---

## Bloc 3 — Droits du manager

**À n'exécuter qu'après le bloc 1 terminé** — il référence `'manager'`.

```sql
CREATE POLICY "leads_select_manager" ON public.leads
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL
         AND public.has_role((select auth.uid()), 'manager'::public.app_role));

CREATE POLICY "leads_update_manager" ON public.leads
  FOR UPDATE TO authenticated
  USING (deleted_at IS NULL
         AND public.has_role((select auth.uid()), 'manager'::public.app_role))
  WITH CHECK (deleted_at IS NULL
         AND public.has_role((select auth.uid()), 'manager'::public.app_role));

CREATE POLICY "interactions_select_manager" ON public.interactions
  FOR SELECT TO authenticated
  USING (public.has_role((select auth.uid()), 'manager'::public.app_role));

CREATE POLICY "appointments_select_manager" ON public.appointments
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL
         AND public.has_role((select auth.uid()), 'manager'::public.app_role));

CREATE POLICY "deals_select_manager" ON public.deals
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL
         AND public.has_role((select auth.uid()), 'manager'::public.app_role));

CREATE POLICY "profiles_select_manager" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role((select auth.uid()), 'manager'::public.app_role));
```

Vérification — 6 lignes attendues :

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public' AND policyname LIKE '%_manager'
ORDER BY tablename;
```

Ces politiques **s'ajoutent** aux existantes : PostgreSQL combine les politiques
permissives par OU logique. Les droits des closers, admins et owners sont intacts.

---

## Après application — deux choses à ne pas oublier

**1. L'historique des migrations diverge.** Le SQL Editor n'inscrit rien dans
`supabase_migrations.schema_migrations`. Le dépôt contiendra trois fichiers que la
base ne déclare pas avoir appliqués. Ce n'est pas grave en soi, mais il faut le
savoir : la source de vérité reste le dépôt Git. Si le connecteur MCP est réparé
plus tard, **ne rejouez pas** ces migrations par `apply_migration` — l'enum et les
politiques existeront déjà.

**2. Passer les advisors de sécurité.** Toute modification de politique mérite ce
contrôle — il avait rattrapé quatre avertissements lors de la baseline.
Tableau de bord → Advisors → Security.

---

## Rendre compte

Copiez-moi les résultats des trois vérifications (7 rôles, 2 rôles fondateur,
6 politiques). Je trace l'application dans `JOURNAL.md` et je clos BLOCKER-010.
