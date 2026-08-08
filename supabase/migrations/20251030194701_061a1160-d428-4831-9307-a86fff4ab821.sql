-- Fonction de validation des emails @theultimateclosers.com
CREATE OR REPLACE FUNCTION public.validate_email_domain()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Vérifier que l'email se termine par @theultimateclosers.com
  IF NEW.email !~* '@theultimateclosers\.com$' THEN
    RAISE EXCEPTION 'Seuls les emails @theultimateclosers.com sont autorisés';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger sur auth.users pour valider l'email à l'inscription
DROP TRIGGER IF EXISTS validate_email_on_signup ON auth.users;
CREATE TRIGGER validate_email_on_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_email_domain();

-- Modifier le trigger handle_new_user pour NE PLUS assigner automatiquement le rôle "user"
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insérer uniquement dans profiles (pas de rôle par défaut)
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- NE PLUS assigner automatiquement le rôle "user"
  -- Les owners devront manuellement assigner les rôles
  
  RETURN NEW;
END;
$$;