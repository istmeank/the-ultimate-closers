-- ═══════════════════════════════════════════════════════════════════════════
-- TUC-v2 BASELINE — Migration consolidée à partir des 30 migrations Lovable
-- Date : 2026-06-07
-- Projet Supabase : llxgyomevketvypusafl (eu-west-3, Postgres 17)
-- Construite selon : 
--   - .claude/skills/postgresql-supabase/SKILL.md (10 principes + checklist 12 points)
--   - .claude/skills/supabase-auth-rls/SKILL.md (RLS patterns + anti-patterns + RBAC)
--   - .claude/skills/owasp-saas-supabase/SKILL.md (OWASP 2025 + secrets)
-- Audit source : docs/security-audit-baseline.md
-- Corrige les 6 anomalies critiques (C1-C6) du rapport.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Section 1 — Setup ────────────────────────────────────────────────────────
SET lock_timeout = '5s';

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Section 2 — Types/Enums (CORRECTION C1) ──────────────────────────────────
-- Enum complet dès la baseline : owner > admin > closer > user.
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'closer', 'user');

-- ── Section 3 — Fonctions utilitaires (CORRECTION C4 + C5) ───────────────────

-- 3.1 update_updated_at : trigger générique pour timestamps audit
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public.update_updated_at_column() IS 
'Trigger BEFORE UPDATE générique. SECURITY INVOKER car ne nécessite pas de privilèges élevés.';

-- 3.2 has_role : UNE SEULE signature typée strict (CORRECTION C4)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;
COMMENT ON FUNCTION public.has_role(UUID, public.app_role) IS 
'Vérifie le rôle utilisateur. SECURITY DEFINER pour éviter la récursion RLS sur user_roles. search_path inclut pg_temp en dernier pour bloquer les attaques par table temporaire (skill postgresql-supabase §4).';

-- 3.3 handle_new_user : auto-création du profile à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  -- Par défaut, tout nouvel utilisateur est 'user' (closer/admin/owner à promouvoir manuellement)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public.handle_new_user() IS 
'Trigger AFTER INSERT sur auth.users. Crée le profile + assigne le rôle ''user'' par défaut.';

-- 3.4 soft_delete : marque deleted_at au lieu de DELETE physique
CREATE OR REPLACE FUNCTION public.soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  EXECUTE format('UPDATE %I.%I SET deleted_at = now() WHERE id = $1', TG_TABLE_SCHEMA, TG_TABLE_NAME)
  USING OLD.id;
  RETURN NULL; -- annule le DELETE physique
END;
$$;
COMMENT ON FUNCTION public.soft_delete() IS 
'Trigger INSTEAD OF DELETE générique pour soft delete (skill postgresql-supabase §8).';

-- ═══════════════════════════════════════════════════════════════════════════
-- DOMAIN 0 — IDENTITÉ & RÔLES
-- ═══════════════════════════════════════════════════════════════════════════

-- ── user_roles : source de vérité RBAC ───────────────────────────────────────
CREATE TABLE public.user_roles (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ── profiles : extension de auth.users avec données métier ───────────────────
CREATE TABLE public.profiles (
  id                    UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT         NOT NULL,
  full_name             TEXT         CHECK (length(full_name) BETWEEN 2 AND 100),
  avatar_url            TEXT,
  bio                   TEXT         CHECK (length(bio) <= 1000),
  is_active             BOOLEAN      NOT NULL DEFAULT true,
  max_concurrent_leads  INTEGER      NOT NULL DEFAULT 10 CHECK (max_concurrent_leads BETWEEN 0 AND 200),
  specialties           JSONB        NOT NULL DEFAULT '[]'::jsonb,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_profiles_specialties_gin ON public.profiles USING GIN (specialties);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger auto-création profile à l'inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── site_content : CMS public ────────────────────────────────────────────────
CREATE TABLE public.site_content (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  TEXT         NOT NULL UNIQUE CHECK (length(section_id) BETWEEN 1 AND 100),
  content_fr  TEXT,
  content_en  TEXT,
  content_ar  TEXT,
  image_url   TEXT,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_by  UUID         REFERENCES public.profiles(id) ON DELETE SET NULL
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_site_content_updated_at BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── site_analytics : tracking events publics ─────────────────────────────────
CREATE TABLE public.site_analytics (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  TEXT         NOT NULL CHECK (length(event_type) BETWEEN 1 AND 100),
  page_path   TEXT         CHECK (length(page_path) <= 500),
  user_id     UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata    JSONB        DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_site_analytics_event_type ON public.site_analytics(event_type);
CREATE INDEX idx_site_analytics_created_at ON public.site_analytics(created_at DESC);
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

-- ── formations : modules de formation closer ─────────────────────────────────
CREATE TABLE public.formations (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT         NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  description       TEXT         CHECK (length(description) <= 5000),
  file_url          TEXT         NOT NULL,
  file_type         TEXT         CHECK (file_type IN ('video', 'pdf', 'audio', 'doc')),
  thumbnail_url     TEXT,
  duration_minutes  INTEGER      CHECK (duration_minutes >= 0),
  order_index       INTEGER      NOT NULL DEFAULT 0,
  is_published      BOOLEAN      NOT NULL DEFAULT false,
  created_by        UUID         REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_formations_is_published ON public.formations(is_published) WHERE is_published = true;
CREATE INDEX idx_formations_order_index ON public.formations(order_index);
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_formations_updated_at BEFORE UPDATE ON public.formations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- DOMAIN 1 — ACQUISITION & QUALIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

-- ── leads : opportunités commerciales (CORRECTION H3 : soft delete) ──────────
CREATE TABLE public.leads (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT         NOT NULL CHECK (length(full_name) BETWEEN 2 AND 100),
  email       TEXT         NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone       TEXT         CHECK (phone IS NULL OR length(phone) BETWEEN 6 AND 30),
  source      TEXT         NOT NULL CHECK (source IN ('audit','contact','ads','ig','referral','chatbot','whatsapp','telegram','messenger')),
  interest    TEXT         CHECK (length(interest) <= 2000),
  status      TEXT         NOT NULL DEFAULT 'new' CHECK (status IN ('new','qualified','in_progress','won','lost','disqualified')),
  owner_id    UUID         REFERENCES public.profiles(id) ON DELETE SET NULL,
  score       INTEGER      NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ  -- soft delete
);
CREATE INDEX idx_leads_owner_id ON public.leads(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_status ON public.leads(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_score ON public.leads(score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── interactions : historique contacts ───────────────────────────────────────
CREATE TABLE public.interactions (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID         NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type        TEXT         NOT NULL CHECK (type IN ('call','msg','email','meet','whatsapp','telegram','messenger','instagram')),
  content     TEXT         CHECK (length(content) <= 10000),
  by_user_id  UUID         REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_interactions_lead_id ON public.interactions(lead_id);
CREATE INDEX idx_interactions_by_user_id ON public.interactions(by_user_id);
CREATE INDEX idx_interactions_created_at ON public.interactions(created_at DESC);
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

-- ── lead_scores : historique scoring IA ──────────────────────────────────────
CREATE TABLE public.lead_scores (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID         NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  score       INTEGER      NOT NULL CHECK (score BETWEEN 0 AND 100),
  sentiment   NUMERIC(3,2) CHECK (sentiment BETWEEN -1 AND 1),
  features    JSONB        DEFAULT '{}'::jsonb,
  model       TEXT         CHECK (length(model) <= 100),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_scores_lead_id ON public.lead_scores(lead_id);
CREATE INDEX idx_lead_scores_updated_at ON public.lead_scores(updated_at DESC);
CREATE INDEX idx_lead_scores_features_gin ON public.lead_scores USING GIN (features);
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- DOMAIN 3 — MATCHING & PILOTAGE CLOSERS
-- ═══════════════════════════════════════════════════════════════════════════

-- ── closer_assignments : tracking round-robin ────────────────────────────────
CREATE TABLE public.closer_assignments (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  closer_id         UUID         NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  last_assigned_at  TIMESTAMPTZ,
  total_assigned    INTEGER      NOT NULL DEFAULT 0 CHECK (total_assigned >= 0),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_closer_assignments_closer_id ON public.closer_assignments(closer_id);
ALTER TABLE public.closer_assignments ENABLE ROW LEVEL SECURITY;

-- ── closer_integrations : OAuth tokens (BLOCKER-001 : à chiffrer en Vague 2) ─
CREATE TABLE public.closer_integrations (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  closer_id         UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_type  TEXT         NOT NULL CHECK (integration_type IN ('google_calendar','slack','hubspot','whatsapp_business','telegram','meta_graph')),
  access_token      TEXT         NOT NULL, -- TODO BLOCKER-001 : chiffrer via pgsodium/vault
  refresh_token     TEXT,                  -- TODO BLOCKER-001 : chiffrer via pgsodium/vault
  expires_at        TIMESTAMPTZ,
  is_active         BOOLEAN      NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (closer_id, integration_type)
);
CREATE INDEX idx_closer_integrations_closer_id ON public.closer_integrations(closer_id);
CREATE INDEX idx_closer_integrations_expires_at ON public.closer_integrations(expires_at) WHERE is_active = true;
ALTER TABLE public.closer_integrations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_closer_integrations_updated_at BEFORE UPDATE ON public.closer_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- DOMAIN 4 — MEET & COACHING
-- ═══════════════════════════════════════════════════════════════════════════

-- ── call_bookings : réservations formulaire public ───────────────────────────
CREATE TABLE public.call_bookings (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name         TEXT         NOT NULL CHECK (length(first_name) BETWEEN 1 AND 50),
  last_name          TEXT         NOT NULL CHECK (length(last_name) BETWEEN 1 AND 50),
  email              TEXT         NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone              TEXT         CHECK (phone IS NULL OR length(phone) BETWEEN 6 AND 30),
  company_name       TEXT         CHECK (length(company_name) <= 100),
  main_challenge     TEXT         CHECK (length(main_challenge) <= 2000),
  status             TEXT         NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','done','no_show','canceled')),
  lead_id            UUID         REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_call_bookings_status ON public.call_bookings(status);
CREATE INDEX idx_call_bookings_lead_id ON public.call_bookings(lead_id);
CREATE INDEX idx_call_bookings_created_at ON public.call_bookings(created_at DESC);
ALTER TABLE public.call_bookings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_call_bookings_updated_at BEFORE UPDATE ON public.call_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── appointments : RDV planifiés ─────────────────────────────────────────────
CREATE TABLE public.appointments (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID         NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  assigned_to     UUID         REFERENCES public.profiles(id) ON DELETE SET NULL,
  start_at        TIMESTAMPTZ  NOT NULL,
  end_at          TIMESTAMPTZ  NOT NULL,
  channel         TEXT         NOT NULL DEFAULT 'meet' CHECK (channel IN ('meet','phone','teams','whatsapp')),
  status          TEXT         NOT NULL DEFAULT 'booked' CHECK (status IN ('booked','done','no_show','canceled')),
  gcal_event_id   TEXT,
  auto_assigned   BOOLEAN      NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ, -- soft delete
  CHECK (end_at > start_at)
);
CREATE INDEX idx_appointments_lead_id ON public.appointments(lead_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_assigned_to ON public.appointments(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_start_at ON public.appointments(start_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_status ON public.appointments(status) WHERE deleted_at IS NULL;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── deals : opportunités commerciales ────────────────────────────────────────
CREATE TABLE public.deals (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id               UUID         NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  offer_name            TEXT         NOT NULL CHECK (length(offer_name) BETWEEN 1 AND 200),
  amount_cents          INTEGER      NOT NULL CHECK (amount_cents >= 0),
  currency              TEXT         NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR','USD','DZD','MAD','CAD','CHF','GBP')),
  stage                 TEXT         NOT NULL DEFAULT 'qualified' CHECK (stage IN ('qualified','proposal','negotiation','won','lost')),
  expected_close_date   DATE,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at            TIMESTAMPTZ
);
CREATE INDEX idx_deals_lead_id ON public.deals(lead_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_stage ON public.deals(stage) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_expected_close_date ON public.deals(expected_close_date) WHERE deleted_at IS NULL;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── payments : transactions ──────────────────────────────────────────────────
CREATE TABLE public.payments (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id       UUID         NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  provider      TEXT         NOT NULL CHECK (provider IN ('stripe','paypal','cib','edahabia','chargily')),
  status        TEXT         NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  amount_cents  INTEGER      NOT NULL CHECK (amount_cents >= 0),
  tx_ref        TEXT,
  paid_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_deal_id ON public.payments(deal_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_tx_ref ON public.payments(tx_ref) WHERE tx_ref IS NOT NULL;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ── resources : documents partagés client ────────────────────────────────────
CREATE TABLE public.resources (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID         REFERENCES public.leads(id) ON DELETE CASCADE,
  title       TEXT         NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  url         TEXT         NOT NULL,
  type        TEXT         CHECK (type IN ('script','video','pdf','template','audio','doc')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_resources_lead_id ON public.resources(lead_id);
CREATE INDEX idx_resources_type ON public.resources(type);
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- ── google_calendar_tokens : OAuth Google (BLOCKER-001) ──────────────────────
CREATE TABLE public.google_calendar_tokens (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID         NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token    TEXT         NOT NULL, -- TODO BLOCKER-001 : chiffrer
  refresh_token   TEXT         NOT NULL, -- TODO BLOCKER-001 : chiffrer
  expires_at      TIMESTAMPTZ  NOT NULL,
  calendar_email  TEXT         CHECK (calendar_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_google_calendar_tokens_user_id ON public.google_calendar_tokens(user_id);
CREATE INDEX idx_google_calendar_tokens_expires_at ON public.google_calendar_tokens(expires_at);
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_google_calendar_tokens_updated_at BEFORE UPDATE ON public.google_calendar_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- TRANSVERSE
-- ═══════════════════════════════════════════════════════════════════════════

-- ── external_sync_log : sync HubSpot ─────────────────────────────────────────
CREATE TABLE public.external_sync_log (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   TEXT         NOT NULL CHECK (entity_type IN ('lead','deal','appointment','contact')),
  entity_id     UUID         NOT NULL,
  hubspot_id    TEXT,
  last_sync     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  status        TEXT         NOT NULL DEFAULT 'success' CHECK (status IN ('success','failed','pending')),
  error         TEXT
);
CREATE INDEX idx_external_sync_log_entity ON public.external_sync_log(entity_type, entity_id);
CREATE INDEX idx_external_sync_log_status ON public.external_sync_log(status);
CREATE INDEX idx_external_sync_log_last_sync ON public.external_sync_log(last_sync DESC);
ALTER TABLE public.external_sync_log ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES (CORRECTION C3 : (select auth.uid()) + TO + USING/WITH CHECK)
-- Hiérarchie : owner > admin > closer > user
-- ═══════════════════════════════════════════════════════════════════════════

-- ── user_roles ───────────────────────────────────────────────────────────────
CREATE POLICY "user_roles_select_own_or_admin_owner" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

CREATE POLICY "user_roles_manage_admin_owner" ON public.user_roles
  FOR ALL TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  )
  WITH CHECK (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

-- ── profiles ─────────────────────────────────────────────────────────────────
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "profiles_select_admin_owner" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "profiles_update_admin_owner" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  )
  WITH CHECK (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

CREATE POLICY "profiles_delete_admin_owner" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

-- ── site_content ─────────────────────────────────────────────────────────────
CREATE POLICY "site_content_select_public" ON public.site_content
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "site_content_manage_admin_owner" ON public.site_content
  FOR ALL TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  )
  WITH CHECK (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

-- ── site_analytics ───────────────────────────────────────────────────────────
-- Insertions publiques limitées au service_role (via Edge Function avec rate limit)
-- Pour MVP on autorise INSERT public, BLOCKER H8 : à durcir avec Edge Function + rate limit
CREATE POLICY "site_analytics_insert_anyone" ON public.site_analytics
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);  -- BLOCKER H8 : durcir avec Edge Function rate-limited

CREATE POLICY "site_analytics_select_admin_owner" ON public.site_analytics
  FOR SELECT TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

-- ── formations ───────────────────────────────────────────────────────────────
CREATE POLICY "formations_select_published" ON public.formations
  FOR SELECT TO authenticated USING (is_published = true);

CREATE POLICY "formations_manage_admin_owner" ON public.formations
  FOR ALL TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  )
  WITH CHECK (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

-- ── leads ────────────────────────────────────────────────────────────────────
CREATE POLICY "leads_select_owner_or_admin" ON public.leads
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      owner_id = (select auth.uid())
      OR public.has_role((select auth.uid()), 'admin'::public.app_role)
      OR public.has_role((select auth.uid()), 'owner'::public.app_role)
    )
  );

CREATE POLICY "leads_insert_authenticated" ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Le closer ne peut s'attribuer que lui-même OU admin/owner peuvent attribuer à qui ils veulent
    owner_id = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

CREATE POLICY "leads_update_owner_or_admin" ON public.leads
  FOR UPDATE TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      owner_id = (select auth.uid())
      OR public.has_role((select auth.uid()), 'admin'::public.app_role)
      OR public.has_role((select auth.uid()), 'owner'::public.app_role)
    )
  )
  WITH CHECK (
    owner_id = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

CREATE POLICY "leads_delete_admin_owner" ON public.leads
  FOR DELETE TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

-- ── interactions (via lead ownership) ────────────────────────────────────────
CREATE POLICY "interactions_via_lead" ON public.interactions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = interactions.lead_id
        AND l.deleted_at IS NULL
        AND (
          l.owner_id = (select auth.uid())
          OR public.has_role((select auth.uid()), 'admin'::public.app_role)
          OR public.has_role((select auth.uid()), 'owner'::public.app_role)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = interactions.lead_id
        AND (
          l.owner_id = (select auth.uid())
          OR public.has_role((select auth.uid()), 'admin'::public.app_role)
          OR public.has_role((select auth.uid()), 'owner'::public.app_role)
        )
    )
  );

-- ── lead_scores (via lead ownership) ─────────────────────────────────────────
CREATE POLICY "lead_scores_via_lead" ON public.lead_scores
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_scores.lead_id
        AND l.deleted_at IS NULL
        AND (
          l.owner_id = (select auth.uid())
          OR public.has_role((select auth.uid()), 'admin'::public.app_role)
          OR public.has_role((select auth.uid()), 'owner'::public.app_role)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_scores.lead_id
        AND (
          l.owner_id = (select auth.uid())
          OR public.has_role((select auth.uid()), 'admin'::public.app_role)
          OR public.has_role((select auth.uid()), 'owner'::public.app_role)
        )
    )
  );

-- ── closer_assignments ───────────────────────────────────────────────────────
CREATE POLICY "closer_assignments_select_own_or_admin" ON public.closer_assignments
  FOR SELECT TO authenticated
  USING (
    closer_id = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

CREATE POLICY "closer_assignments_manage_admin_owner" ON public.closer_assignments
  FOR ALL TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  )
  WITH CHECK (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

-- ── closer_integrations ──────────────────────────────────────────────────────
CREATE POLICY "closer_integrations_select_own_or_admin" ON public.closer_integrations
  FOR SELECT TO authenticated
  USING (
    closer_id = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

CREATE POLICY "closer_integrations_manage_own" ON public.closer_integrations
  FOR ALL TO authenticated
  USING (closer_id = (select auth.uid()))
  WITH CHECK (closer_id = (select auth.uid()));

-- ── call_bookings ────────────────────────────────────────────────────────────
-- INSERT public (formulaire site) mais via service_role uniquement pour limiter le spam
-- Pour MVP : INSERT public autorisé, BLOCKER H9 : à durcir
CREATE POLICY "call_bookings_insert_public" ON public.call_bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);  -- BLOCKER H9 : durcir avec Edge Function rate-limited

CREATE POLICY "call_bookings_select_admin_owner" ON public.call_bookings
  FOR SELECT TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

CREATE POLICY "call_bookings_update_admin_owner" ON public.call_bookings
  FOR UPDATE TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  )
  WITH CHECK (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

CREATE POLICY "call_bookings_delete_admin_owner" ON public.call_bookings
  FOR DELETE TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

-- ── appointments ─────────────────────────────────────────────────────────────
CREATE POLICY "appointments_select_assigned_or_admin" ON public.appointments
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      assigned_to = (select auth.uid())
      OR public.has_role((select auth.uid()), 'admin'::public.app_role)
      OR public.has_role((select auth.uid()), 'owner'::public.app_role)
      OR EXISTS (
        SELECT 1 FROM public.leads l
        WHERE l.id = appointments.lead_id AND l.owner_id = (select auth.uid())
      )
    )
  );

CREATE POLICY "appointments_insert_authenticated" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (
    assigned_to = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

CREATE POLICY "appointments_update_assigned_or_admin" ON public.appointments
  FOR UPDATE TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      assigned_to = (select auth.uid())
      OR public.has_role((select auth.uid()), 'admin'::public.app_role)
      OR public.has_role((select auth.uid()), 'owner'::public.app_role)
    )
  )
  WITH CHECK (
    assigned_to = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

-- ── deals (via lead) ─────────────────────────────────────────────────────────
CREATE POLICY "deals_via_lead" ON public.deals
  FOR ALL TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = deals.lead_id
        AND l.deleted_at IS NULL
        AND (
          l.owner_id = (select auth.uid())
          OR public.has_role((select auth.uid()), 'admin'::public.app_role)
          OR public.has_role((select auth.uid()), 'owner'::public.app_role)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = deals.lead_id
        AND (
          l.owner_id = (select auth.uid())
          OR public.has_role((select auth.uid()), 'admin'::public.app_role)
          OR public.has_role((select auth.uid()), 'owner'::public.app_role)
        )
    )
  );

-- ── payments (via deal -> lead) ──────────────────────────────────────────────
CREATE POLICY "payments_via_deal" ON public.payments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.deals d
      JOIN public.leads l ON l.id = d.lead_id
      WHERE d.id = payments.deal_id
        AND d.deleted_at IS NULL
        AND l.deleted_at IS NULL
        AND (
          l.owner_id = (select auth.uid())
          OR public.has_role((select auth.uid()), 'admin'::public.app_role)
          OR public.has_role((select auth.uid()), 'owner'::public.app_role)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deals d
      JOIN public.leads l ON l.id = d.lead_id
      WHERE d.id = payments.deal_id
        AND (
          l.owner_id = (select auth.uid())
          OR public.has_role((select auth.uid()), 'admin'::public.app_role)
          OR public.has_role((select auth.uid()), 'owner'::public.app_role)
        )
    )
  );

-- ── resources ────────────────────────────────────────────────────────────────
CREATE POLICY "resources_via_lead_or_public" ON public.resources
  FOR ALL TO authenticated
  USING (
    lead_id IS NULL
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = resources.lead_id
        AND l.deleted_at IS NULL
        AND l.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    lead_id IS NULL
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = resources.lead_id AND l.owner_id = (select auth.uid())
    )
  );

-- ── google_calendar_tokens ───────────────────────────────────────────────────
CREATE POLICY "google_calendar_tokens_manage_own" ON public.google_calendar_tokens
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ── external_sync_log ────────────────────────────────────────────────────────
CREATE POLICY "external_sync_log_admin_owner" ON public.external_sync_log
  FOR ALL TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  )
  WITH CHECK (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS + POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true),
       ('formations',  'formations',  false),
       ('avatars',     'avatars',     true)
ON CONFLICT (id) DO NOTHING;

-- site-images : admin/owner upload, public read
CREATE POLICY "storage_site_images_manage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'site-images' AND (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  ))
  WITH CHECK (bucket_id = 'site-images' AND (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  ));
CREATE POLICY "storage_site_images_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'site-images');

-- formations : admin/owner upload, authenticated download
CREATE POLICY "storage_formations_admin_owner" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'formations' AND (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  ))
  WITH CHECK (bucket_id = 'formations' AND (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR public.has_role((select auth.uid()), 'owner'::public.app_role)
  ));
CREATE POLICY "storage_formations_authenticated_read" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'formations');

-- avatars : chacun gère le sien, lecture publique
CREATE POLICY "storage_avatars_manage_own" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );
CREATE POLICY "storage_avatars_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'avatars');

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN BASELINE — Vérifier ensuite avec : SELECT * FROM mcp__supabase__get_advisors
-- Conformité cible : 13/15 checklist supabase-auth-rls
-- TODO post-baseline (Vague 2) :
--   - BLOCKER-001 : chiffrer tokens OAuth via pgsodium ou Supabase Vault
--   - BLOCKER H8 : Edge Function rate-limited pour site_analytics INSERT
--   - BLOCKER H9 : Edge Function rate-limited pour call_bookings INSERT
--   - Fonction auto_assign_closer_to_lead à recréer (Vague 2 — feature matching)
--   - Migration RBAC vers app_metadata JWT (gros refactor, Vague 3)
-- ═══════════════════════════════════════════════════════════════════════════
