-- Script de vérification de sécurité pour call_bookings
-- Exécuter ce script dans le SQL Editor de Supabase pour vérifier les policies

-- 1. Vérifier que RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'call_bookings';

-- 2. Lister toutes les policies sur call_bookings
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as condition,
    with_check
FROM pg_policies 
WHERE tablename = 'call_bookings'
ORDER BY policyname;

-- 3. Tester l'accès public (doit échouer)
-- Cette requête doit retourner une erreur si la sécurité est correcte
SELECT COUNT(*) as public_access_test FROM public.call_bookings;

-- 4. Vérifier les permissions sur la table
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'call_bookings' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;
