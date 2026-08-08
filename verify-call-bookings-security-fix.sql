-- Script de vérification post-correction sécurité call_bookings
-- À exécuter après avoir appliqué la migration 20250127000002_fix_call_bookings_security_corrected.sql

-- 1. Vérifier que RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Activé'
        ELSE '❌ RLS DÉSACTIVÉ - RISQUE SÉCURITÉ!'
    END as security_status
FROM pg_tables 
WHERE tablename = 'call_bookings';

-- 2. Lister toutes les policies sur call_bookings
SELECT 
    policyname,
    cmd as command,
    roles,
    CASE 
        WHEN roles IS NULL OR 'public' = ANY(roles) THEN '✅ Public access (correct pour INSERT)'
        WHEN 'authenticated' = ANY(roles) THEN '⚠️ Authenticated access'
        ELSE '✅ Restricted access'
    END as access_level,
    qual as condition
FROM pg_policies 
WHERE tablename = 'call_bookings'
ORDER BY policyname;

-- 3. Vérifier les permissions sur la table
SELECT 
    grantee,
    privilege_type,
    is_grantable,
    CASE 
        WHEN grantee = 'public' THEN '❌ PERMISSION PUBLIQUE!'
        WHEN grantee = 'authenticated' THEN '⚠️ Permission authentifiée'
        ELSE '✅ Permission restreinte'
    END as permission_level
FROM information_schema.table_privileges 
WHERE table_name = 'call_bookings' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 4. Test de sécurité - Cette requête doit échouer pour les utilisateurs non-admin
-- (Commenter cette ligne si vous êtes connecté en tant qu'admin)
-- SELECT COUNT(*) as public_access_test FROM public.call_bookings;

-- 5. Résumé de sécurité
SELECT 
    'call_bookings' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'call_bookings' AND rowsecurity = true
        ) THEN '✅ RLS Activé'
        ELSE '❌ RLS Désactivé'
    END as rls_status,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN roles IS NULL OR 'public' = ANY(roles) THEN 1 END) as public_policies,
    COUNT(CASE WHEN 'authenticated' = ANY(roles) THEN 1 END) as authenticated_policies
FROM pg_policies 
WHERE tablename = 'call_bookings';

-- 6. Vérification finale
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'call_bookings' AND rowsecurity = true
        ) AND EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'call_bookings' 
            AND cmd = 'INSERT' 
            AND (roles IS NULL OR 'public' = ANY(roles))
        ) AND EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'call_bookings' 
            AND cmd = 'SELECT' 
            AND 'authenticated' = ANY(roles)
        ) THEN '✅ CORRECTION APPLIQUÉE AVEC SUCCÈS'
        ELSE '❌ PROBLÈME DÉTECTÉ - VÉRIFIER LES POLICIES'
    END as final_status;
