-- Créer la table pour les tokens Google Calendar
CREATE TABLE IF NOT EXISTS public.google_calendar_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  calendar_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Activer RLS
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Politique: les utilisateurs peuvent voir seulement leurs propres tokens
CREATE POLICY "Users can view their own calendar tokens"
ON public.google_calendar_tokens
FOR SELECT
USING (auth.uid() = user_id);

-- Politique: les utilisateurs peuvent supprimer leurs propres tokens
CREATE POLICY "Users can delete their own calendar tokens"
ON public.google_calendar_tokens
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_google_calendar_tokens_updated_at
BEFORE UPDATE ON public.google_calendar_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_google_calendar_tokens_user_id ON public.google_calendar_tokens(user_id);
CREATE INDEX idx_google_calendar_tokens_expires_at ON public.google_calendar_tokens(expires_at);