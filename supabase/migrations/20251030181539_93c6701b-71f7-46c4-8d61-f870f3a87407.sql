-- Migration 2: Assigner les rôles et créer les données de test
-- Modifier le trigger handle_new_user pour assigner automatiquement le rôle "user"
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insérer dans profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assigner automatiquement le rôle "user" par défaut
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Assigner le rôle admin à l'utilisateur existant
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'abdenacer.maredj@theultimateclosers.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Créer des profils closers de test
INSERT INTO public.profiles (id, email, full_name, is_active, max_concurrent_leads)
VALUES 
  (gen_random_uuid(), 'closer1@test.theultimateclosers.com', 'Closer Test 1', true, 15),
  (gen_random_uuid(), 'closer2@test.theultimateclosers.com', 'Closer Test 2', true, 10)
ON CONFLICT (id) DO NOTHING;

-- Assigner le rôle closer aux profils de test
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'closer'::app_role
FROM public.profiles p
WHERE p.email IN ('closer1@test.theultimateclosers.com', 'closer2@test.theultimateclosers.com')
ON CONFLICT (user_id, role) DO NOTHING;