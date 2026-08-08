-- Script complet pour créer l'utilisateur passe-partout
-- À exécuter dans Lovable Cloud → Database → SQL Editor

-- ========================================
-- ÉTAPE 1: Créer l'utilisateur dans auth.users
-- ========================================

-- Note: Cette étape doit être faite via l'interface Supabase Auth
-- ou via l'API. Voici le script pour vérifier l'existence :

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email = 'abdenacer.maredj@theultimateclosers.com';

-- ========================================
-- ÉTAPE 2: Si l'utilisateur existe, récupérer son ID
-- ========================================

-- Remplacez 'USER_ID_HERE' par l'ID réel retourné par la requête ci-dessus

-- ========================================
-- ÉTAPE 3: Ajouter le rôle 'owner' (accès complet)
-- ========================================

-- Script avec placeholder pour l'ID utilisateur
DO $$
DECLARE
    user_id_var UUID;
BEGIN
    -- Récupérer l'ID de l'utilisateur
    SELECT id INTO user_id_var 
    FROM auth.users 
    WHERE email = 'abdenacer.maredj@theultimateclosers.com';
    
    -- Si l'utilisateur existe, créer le rôle
    IF user_id_var IS NOT NULL THEN
        -- Ajouter le rôle owner
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_id_var, 'owner')
        ON CONFLICT (user_id) 
        DO UPDATE SET role = 'owner';
        
        -- Créer/mettre à jour le profil
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
            user_id_var,
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
            
        RAISE NOTICE 'Utilisateur passe-partout créé avec succès pour: %', user_id_var;
    ELSE
        RAISE NOTICE 'Utilisateur non trouvé dans auth.users. Veuillez d''abord créer le compte via l''interface Auth.';
    END IF;
END $$;

-- ========================================
-- ÉTAPE 4: Vérification finale
-- ========================================

SELECT 
    p.id,
    p.full_name,
    p.email,
    ur.role,
    p.specialty,
    p.max_concurrent_leads,
    p.is_active,
    au.email_confirmed_at
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email = 'abdenacer.maredj@theultimateclosers.com';

-- ========================================
-- ÉTAPE 5: Test des permissions
-- ========================================

-- Tester la fonction has_role
SELECT 
    'Test has_role function' as test_name,
    public.has_role(
        (SELECT id FROM auth.users WHERE email = 'abdenacer.maredj@theultimateclosers.com'),
        'owner'::app_role
    ) as is_owner,
    public.has_role(
        (SELECT id FROM auth.users WHERE email = 'abdenacer.maredj@theultimateclosers.com'),
        'admin'::app_role
    ) as is_admin;

-- Message de confirmation
SELECT 'Script d''installation utilisateur passe-partout terminé' as status;
