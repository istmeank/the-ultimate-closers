-- Table pour les réservations d'appels B2B
CREATE TABLE public.call_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identification prospect
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_website TEXT,
    company_linkedin TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    
    -- Validation email professionnel
    is_business_email BOOLEAN DEFAULT false,
    
    -- Données business
    industry TEXT NOT NULL,
    annual_revenue TEXT NOT NULL,
    sales_team_size INTEGER,
    current_channels JSONB,
    main_challenge TEXT NOT NULL,
    
    -- Intention et maturité
    call_objective TEXT NOT NULL,
    has_used_ai_crm TEXT NOT NULL,
    urgency TEXT NOT NULL,
    
    -- Détails pratiques
    preferred_date TIMESTAMPTZ,
    timezone TEXT NOT NULL,
    preferred_platform TEXT NOT NULL,
    
    -- Engagement
    commitment_confirmed BOOLEAN NOT NULL DEFAULT false,
    
    -- Metadata
    status TEXT DEFAULT 'pending',
    language TEXT DEFAULT 'fr',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    confirmed_at TIMESTAMPTZ,
    
    -- Contraintes
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Index pour les recherches
CREATE INDEX idx_call_bookings_email ON public.call_bookings(email);
CREATE INDEX idx_call_bookings_status ON public.call_bookings(status);
CREATE INDEX idx_call_bookings_created_at ON public.call_bookings(created_at DESC);
CREATE INDEX idx_call_bookings_company ON public.call_bookings(company_name);

-- RLS Policies
ALTER TABLE public.call_bookings ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut créer une réservation
CREATE POLICY "Anyone can create booking"
ON public.call_bookings FOR INSERT
TO public
WITH CHECK (true);

-- Seuls les admins peuvent voir toutes les réservations
CREATE POLICY "Admins can view all bookings"
ON public.call_bookings FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins peuvent modifier les réservations
CREATE POLICY "Admins can update bookings"
ON public.call_bookings FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger pour updated_at
CREATE TRIGGER update_call_bookings_updated_at
BEFORE UPDATE ON public.call_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour limiter les réservations (anti-spam)
CREATE OR REPLACE FUNCTION public.check_booking_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si email a déjà réservé dans les 7 derniers jours
  IF EXISTS (
    SELECT 1 FROM public.call_bookings
    WHERE email = NEW.email
    AND created_at > now() - interval '7 days'
    AND status != 'cancelled'
  ) THEN
    RAISE EXCEPTION 'Vous avez déjà une réservation en cours. Veuillez patienter 7 jours avant de réserver à nouveau.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour enforcer la limite
CREATE TRIGGER enforce_booking_limit
BEFORE INSERT ON public.call_bookings
FOR EACH ROW EXECUTE FUNCTION public.check_booking_limit();