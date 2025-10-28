-- Création d'un utilisateur passe-partout pour abdenacer.maredj@theultimateclosers.com
-- Ce script doit être exécuté dans Lovable Cloud → Database → SQL Editor

-- Étape 1: Vérifier si l'utilisateur existe déjà dans auth.users
-- (Cette étape sera faite manuellement via Supabase Auth)

-- Étape 2: Ajouter le rôle 'owner' pour cet utilisateur
-- Remplacez 'USER_ID_FROM_AUTH' par l'ID réel de l'utilisateur dans auth.users

-- D'abord, vérifions les utilisateurs existants
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'abdenacer.maredj@theultimateclosers.com';

-- Si l'utilisateur existe, récupérez son ID et utilisez-le dans la requête suivante :

-- Ajouter le rôle owner (remplacez USER_ID par l'ID réel)
INSERT INTO public.user_roles (user_id, role) 
VALUES ('USER_ID_FROM_AUTH', 'owner')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'owner';

-- Étape 3: Créer/mettre à jour le profil
INSERT INTO public.profiles (
    id,
    full_name,
    email,
    specialty,
    max_concurrent_leads,
    is_active,
    created_at,
    updated_at
) VALUES (
    'USER_ID_FROM_AUTH',
    'Abdenacer Maredj',
    'abdenacer.maredj@theultimateclosers.com',
    ARRAY['tech', 'finance', 'general'],
    50,
    true,
    now(),
    now()
)
ON CONFLICT (id) 
DO UPDATE SET 
    full_name = 'Abdenacer Maredj',
    email = 'abdenacer.maredj@theultimateclosers.com',
    specialty = ARRAY['tech', 'finance', 'general'],
    max_concurrent_leads = 50,
    is_active = true,
    updated_at = now();

-- Étape 4: Vérification finale
SELECT 
    p.id,
    p.full_name,
    p.email,
    ur.role,
    p.specialty,
    p.max_concurrent_leads,
    p.is_active
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.email = 'abdenacer.maredj@theultimateclosers.com';

-- Message de confirmation
SELECT 'Utilisateur passe-partout créé avec succès' as status;
