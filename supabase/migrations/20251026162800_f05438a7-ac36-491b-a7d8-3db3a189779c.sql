-- ========================================
-- PHASE 1: CRM DATA MODEL
-- Tables: leads, interactions, deals, appointments, payments, lead_scores, resources, external_sync_log
-- ========================================

-- 1. Extend app_role enum to include closer, owner, client
-- Note: We already have admin in user_roles, we're adding new roles
DO $$ 
BEGIN
  -- Check if we need to add new roles to any existing enum or just use text for now
  -- Since user_roles uses text 'role' field, we'll continue with that approach
  NULL;
END $$;

-- 2. TABLE: leads (replaces/extends call_bookings)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  source TEXT NOT NULL CHECK (source IN ('audit','contact','ads','ig','referral','chatbot')),
  interest TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','qualified','in_progress','won','lost')),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE: interactions (history of all contacts with leads)
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('call','msg','email','meet')),
  content TEXT,
  by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE: deals (sales opportunities)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  offer_name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'EUR',
  stage TEXT DEFAULT 'qualified' CHECK (stage IN ('qualified','proposal','negotiation','won','lost')),
  expected_close_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE: appointments (Google Calendar RDV)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  channel TEXT DEFAULT 'meet' CHECK (channel IN ('meet','phone','teams')),
  status TEXT DEFAULT 'booked' CHECK (status IN ('booked','done','no_show','canceled')),
  gcal_event_id TEXT,
  auto_assigned BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE: payments (Stripe, PayPal, CIB, etc.)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('stripe','paypal','cib','edahabia')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  amount_cents INTEGER NOT NULL,
  tx_ref TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLE: lead_scores (AI scoring history)
CREATE TABLE IF NOT EXISTS lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  sentiment NUMERIC(3,2) CHECK (sentiment >= -1 AND sentiment <= 1),
  features JSONB,
  model TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLE: resources (documents/scripts for clients)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('script','video','pdf','template')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLE: external_sync_log (HubSpot sync tracking)
CREATE TABLE IF NOT EXISTS external_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead','deal','appointment')),
  entity_id UUID NOT NULL,
  hubspot_id TEXT,
  last_sync TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'success' CHECK (status IN ('success','failed','pending')),
  error TEXT
);

-- ========================================
-- INDEXES for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_interactions_lead_id ON interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_lead_id ON deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_appointments_lead_id ON appointments(lead_id);
CREATE INDEX IF NOT EXISTS idx_appointments_assigned_to ON appointments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_payments_deal_id ON payments(deal_id);
CREATE INDEX IF NOT EXISTS idx_lead_scores_lead_id ON lead_scores(lead_id);

-- ========================================
-- RLS POLICIES
-- ========================================

-- Helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND user_roles.role = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- LEADS RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Admins can see all leads
CREATE POLICY "admin_all_leads" ON leads
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Closers can see their own leads
CREATE POLICY "closers_own_leads_select" ON leads
  FOR SELECT USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "closers_own_leads_insert" ON leads
  FOR INSERT WITH CHECK (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "closers_own_leads_update" ON leads
  FOR UPDATE USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- INTERACTIONS RLS (based on lead ownership)
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interactions_via_lead_ownership" ON interactions
  FOR ALL USING (
    EXISTS(
      SELECT 1 FROM leads 
      WHERE leads.id = interactions.lead_id 
      AND (leads.owner_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

-- DEALS RLS (based on lead ownership)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_via_lead_ownership" ON deals
  FOR ALL USING (
    EXISTS(
      SELECT 1 FROM leads 
      WHERE leads.id = deals.lead_id 
      AND (leads.owner_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

-- APPOINTMENTS RLS (based on assignment or lead ownership)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_assigned_or_admin" ON appointments
  FOR ALL USING (
    assigned_to = auth.uid() 
    OR has_role(auth.uid(), 'admin')
    OR EXISTS(
      SELECT 1 FROM leads 
      WHERE leads.id = appointments.lead_id 
      AND leads.owner_id = auth.uid()
    )
  );

-- PAYMENTS RLS (via deal -> lead ownership)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_via_deal_ownership" ON payments
  FOR ALL USING (
    EXISTS(
      SELECT 1 FROM deals 
      JOIN leads ON leads.id = deals.lead_id
      WHERE deals.id = payments.deal_id 
      AND (leads.owner_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

-- LEAD_SCORES RLS (based on lead ownership)
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_scores_via_ownership" ON lead_scores
  FOR ALL USING (
    EXISTS(
      SELECT 1 FROM leads 
      WHERE leads.id = lead_scores.lead_id 
      AND (leads.owner_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

-- RESOURCES RLS (based on lead ownership)
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resources_via_ownership" ON resources
  FOR ALL USING (
    lead_id IS NULL -- public resources
    OR has_role(auth.uid(), 'admin')
    OR EXISTS(
      SELECT 1 FROM leads 
      WHERE leads.id = resources.lead_id 
      AND leads.owner_id = auth.uid()
    )
  );

-- EXTERNAL_SYNC_LOG RLS (admin only)
ALTER TABLE external_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "external_sync_admin_only" ON external_sync_log
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ========================================
-- TRIGGERS for auto-update timestamps
-- ========================================

-- Trigger function already exists (from previous migrations)
-- CREATE OR REPLACE FUNCTION public.update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- Apply to leads table
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply to deals table
DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- DATA MIGRATION: call_bookings -> leads
-- ========================================

-- Migrate existing call_bookings to leads table
INSERT INTO leads (full_name, email, phone, source, interest, status, created_at)
SELECT 
  CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')) as full_name,
  email,
  phone,
  'audit' as source,
  main_challenge as interest,
  CASE 
    WHEN status = 'pending' THEN 'new'
    WHEN status = 'confirmed' THEN 'qualified'
    ELSE 'new'
  END as status,
  created_at
FROM call_bookings
WHERE NOT EXISTS (
  SELECT 1 FROM leads WHERE leads.email = call_bookings.email
);