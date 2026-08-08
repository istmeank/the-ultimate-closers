-- Reconstituée en session 34 depuis `supabase_migrations.schema_migrations`
-- (version 20260607194643). Remplace `00000000000001_baseline.sql`, monolithique,
-- qui ne correspondait pas à ce que la production avait réellement exécuté et qui
-- aurait échoué sur une base vierge — BLOCKER-012.
--
-- Pourquoi la baseline est découpée en trois migrations :
-- la première tentative d'application, en session 9, avait échoué parce que
-- `has_role` y était créée avant la table `user_roles`. PostgreSQL valide le corps
-- d'une fonction `LANGUAGE SQL` dès sa création (LEARNING-011). L'ordre ci-dessous
-- est celui qui a fonctionné : tables d'abord, fonctions ensuite.
--
-- Note : `closer_integrations.access_token` et `google_calendar_tokens.access_token`
-- sont ici en clair. C'est l'état du 7 juin. La migration 20260609175708 les
-- remplace par des pointeurs Vault. Ne pas « corriger » ce fichier : il documente
-- un état historique, la correction est la migration suivante.
--
-- SQL identique à celui exécuté ; seul cet en-tête a été ajouté.

-- TUC-v2 BASELINE — Setup + Types + Tables (sans fonctions ni RLS)
SET lock_timeout = '5s';

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'closer', 'user');

-- update_updated_at_column ne référence aucune table, on peut la créer en premier
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- DOMAIN 0 — IDENTITÉ (tables d'abord)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT CHECK (length(full_name) BETWEEN 2 AND 100),
  avatar_url TEXT,
  bio TEXT CHECK (length(bio) <= 1000),
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_concurrent_leads INTEGER NOT NULL DEFAULT 10 CHECK (max_concurrent_leads BETWEEN 0 AND 200),
  specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_profiles_specialties_gin ON public.profiles USING GIN (specialties);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- has_role peut maintenant référencer user_roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role); $$;

-- handle_new_user référence profiles et user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

-- Trigger sur auth.users (peut échouer si privilèges insuffisants - on tentera après si besoin)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id TEXT NOT NULL UNIQUE CHECK (length(section_id) BETWEEN 1 AND 100),
  content_fr TEXT, content_en TEXT, content_ar TEXT, image_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_site_content_updated_at BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.site_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (length(event_type) BETWEEN 1 AND 100),
  page_path TEXT CHECK (length(page_path) <= 500),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_site_analytics_event_type ON public.site_analytics(event_type);
CREATE INDEX idx_site_analytics_created_at ON public.site_analytics(created_at DESC);
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  description TEXT CHECK (length(description) <= 5000),
  file_url TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('video', 'pdf', 'audio', 'doc')),
  thumbnail_url TEXT,
  duration_minutes INTEGER CHECK (duration_minutes >= 0),
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_formations_is_published ON public.formations(is_published) WHERE is_published = true;
CREATE INDEX idx_formations_order_index ON public.formations(order_index);
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_formations_updated_at BEFORE UPDATE ON public.formations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (length(full_name) BETWEEN 2 AND 100),
  email TEXT NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone TEXT CHECK (phone IS NULL OR length(phone) BETWEEN 6 AND 30),
  source TEXT NOT NULL CHECK (source IN ('audit','contact','ads','ig','referral','chatbot','whatsapp','telegram','messenger')),
  interest TEXT CHECK (length(interest) <= 2000),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','qualified','in_progress','won','lost','disqualified')),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_leads_owner_id ON public.leads(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_status ON public.leads(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_score ON public.leads(score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call','msg','email','meet','whatsapp','telegram','messenger','instagram')),
  content TEXT CHECK (length(content) <= 10000),
  by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_interactions_lead_id ON public.interactions(lead_id);
CREATE INDEX idx_interactions_by_user_id ON public.interactions(by_user_id);
CREATE INDEX idx_interactions_created_at ON public.interactions(created_at DESC);
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  sentiment NUMERIC(3,2) CHECK (sentiment BETWEEN -1 AND 1),
  features JSONB DEFAULT '{}'::jsonb,
  model TEXT CHECK (length(model) <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_scores_lead_id ON public.lead_scores(lead_id);
CREATE INDEX idx_lead_scores_updated_at ON public.lead_scores(updated_at DESC);
CREATE INDEX idx_lead_scores_features_gin ON public.lead_scores USING GIN (features);
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.closer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closer_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  last_assigned_at TIMESTAMPTZ,
  total_assigned INTEGER NOT NULL DEFAULT 0 CHECK (total_assigned >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_closer_assignments_closer_id ON public.closer_assignments(closer_id);
ALTER TABLE public.closer_assignments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.closer_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('google_calendar','slack','hubspot','whatsapp_business','telegram','meta_graph')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (closer_id, integration_type)
);
CREATE INDEX idx_closer_integrations_closer_id ON public.closer_integrations(closer_id);
CREATE INDEX idx_closer_integrations_expires_at ON public.closer_integrations(expires_at) WHERE is_active = true;
ALTER TABLE public.closer_integrations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_closer_integrations_updated_at BEFORE UPDATE ON public.closer_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.call_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL CHECK (length(first_name) BETWEEN 1 AND 50),
  last_name TEXT NOT NULL CHECK (length(last_name) BETWEEN 1 AND 50),
  email TEXT NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone TEXT CHECK (phone IS NULL OR length(phone) BETWEEN 6 AND 30),
  company_name TEXT CHECK (length(company_name) <= 100),
  main_challenge TEXT CHECK (length(main_challenge) <= 2000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','done','no_show','canceled')),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_call_bookings_status ON public.call_bookings(status);
CREATE INDEX idx_call_bookings_lead_id ON public.call_bookings(lead_id);
CREATE INDEX idx_call_bookings_created_at ON public.call_bookings(created_at DESC);
ALTER TABLE public.call_bookings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_call_bookings_updated_at BEFORE UPDATE ON public.call_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  channel TEXT NOT NULL DEFAULT 'meet' CHECK (channel IN ('meet','phone','teams','whatsapp')),
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked','done','no_show','canceled')),
  gcal_event_id TEXT,
  auto_assigned BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CHECK (end_at > start_at)
);
CREATE INDEX idx_appointments_lead_id ON public.appointments(lead_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_assigned_to ON public.appointments(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_start_at ON public.appointments(start_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_status ON public.appointments(status) WHERE deleted_at IS NULL;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  offer_name TEXT NOT NULL CHECK (length(offer_name) BETWEEN 1 AND 200),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR','USD','DZD','MAD','CAD','CHF','GBP')),
  stage TEXT NOT NULL DEFAULT 'qualified' CHECK (stage IN ('qualified','proposal','negotiation','won','lost')),
  expected_close_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_deals_lead_id ON public.deals(lead_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_stage ON public.deals(stage) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_expected_close_date ON public.deals(expected_close_date) WHERE deleted_at IS NULL;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('stripe','paypal','cib','edahabia','chargily')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  tx_ref TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_deal_id ON public.payments(deal_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_tx_ref ON public.payments(tx_ref) WHERE tx_ref IS NOT NULL;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('script','video','pdf','template','audio','doc')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_resources_lead_id ON public.resources(lead_id);
CREATE INDEX idx_resources_type ON public.resources(type);
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  calendar_email TEXT CHECK (calendar_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_google_calendar_tokens_user_id ON public.google_calendar_tokens(user_id);
CREATE INDEX idx_google_calendar_tokens_expires_at ON public.google_calendar_tokens(expires_at);
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_google_calendar_tokens_updated_at BEFORE UPDATE ON public.google_calendar_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.external_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead','deal','appointment','contact')),
  entity_id UUID NOT NULL,
  hubspot_id TEXT,
  last_sync TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','failed','pending')),
  error TEXT
);
CREATE INDEX idx_external_sync_log_entity ON public.external_sync_log(entity_type, entity_id);
CREATE INDEX idx_external_sync_log_status ON public.external_sync_log(status);
CREATE INDEX idx_external_sync_log_last_sync ON public.external_sync_log(last_sync DESC);
ALTER TABLE public.external_sync_log ENABLE ROW LEVEL SECURITY;
