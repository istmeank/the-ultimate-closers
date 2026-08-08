-- Script de test post-correction sécurité finale
-- À exécuter après avoir appliqué la migration 20250127000004_final_security_fix_call_bookings.sql

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
        WHEN roles IS NULL OR 'public' = ANY(roles) THEN '❌ ACCÈS PUBLIC DÉTECTÉ!'
        WHEN 'authenticated' = ANY(roles) THEN '⚠️ Accès authentifié'
        WHEN 'service_role' = ANY(roles) THEN '✅ Accès service role (Edge Function)'
        ELSE '✅ Accès restreint'
    END as access_level,
    qual as condition
FROM pg_policies 
WHERE tablename = 'call_bookings'
ORDER BY policyname;

-- 3. Vérifier les contraintes de validation
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    CASE 
        WHEN contype = 'c' THEN 'CHECK constraint'
        WHEN contype = 'f' THEN 'FOREIGN KEY'
        WHEN contype = 'p' THEN 'PRIMARY KEY'
        WHEN contype = 'u' THEN 'UNIQUE'
        ELSE contype::text
    END as constraint_description
FROM pg_constraint 
WHERE conrelid = 'public.call_bookings'::regclass
ORDER BY conname;

-- 4. Vérifier les permissions de table
SELECT 
    grantee,
    privilege_type,
    is_grantable,
    CASE 
        WHEN grantee = 'public' THEN '❌ PERMISSION PUBLIQUE!'
        WHEN grantee = 'authenticated' THEN '⚠️ Permission authentifiée'
        WHEN grantee = 'service_role' THEN '✅ Permission service role'
        ELSE '✅ Permission restreinte'
    END as permission_level
FROM information_schema.table_privileges 
WHERE table_name = 'call_bookings' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 5. Test de sécurité - Ces requêtes doivent TOUTES échouer
-- (Commenter ces lignes si vous êtes connecté en tant qu'admin/service_role)

-- Test 1: INSERT public (doit échouer)
-- INSERT INTO public.call_bookings (first_name, last_name, email, phone, company_name, industry, annual_revenue, main_challenge, call_objective, has_used_ai_crm, urgency, timezone, preferred_platform, commitment_confirmed) 
-- VALUES ('Test', 'User', 'test@example.com', '+33123456789', 'Test Company', 'tech', '1M-10M', 'test challenge', 'test objective', 'yes', 'urgent', 'Europe/Paris', 'zoom', true);

-- Test 2: SELECT public (doit échouer)  
-- SELECT COUNT(*) FROM public.call_bookings;

-- Test 3: UPDATE public (doit échouer)
-- UPDATE public.call_bookings SET status = 'test' WHERE id = (SELECT id FROM public.call_bookings LIMIT 1);

-- Test 4: DELETE public (doit échouer)
-- DELETE FROM public.call_bookings WHERE email = 'test@example.com';

-- 6. Vérifier le champ submission_source
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'call_bookings' 
AND table_schema = 'public'
AND column_name = 'submission_source';

-- 7. Résumé de sécurité final
WITH security_summary AS (
    SELECT 
        t.tablename,
        t.rowsecurity as rls_enabled,
        COUNT(p.policyname) as policy_count,
        COUNT(CASE WHEN p.roles IS NULL OR 'public' = ANY(p.roles) THEN 1 END) as public_policies,
        COUNT(CASE WHEN 'service_role' = ANY(p.roles) THEN 1 END) as service_role_policies,
        COUNT(CASE WHEN tp.grantee = 'public' THEN 1 END) as public_permissions
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
    LEFT JOIN information_schema.table_privileges tp ON t.tablename = tp.table_name AND tp.table_schema = 'public'
    WHERE t.schemaname = 'public'
    AND t.tablename = 'call_bookings'
    GROUP BY t.tablename, t.rowsecurity
)
SELECT 
    tablename,
    CASE 
        WHEN rls_enabled = false THEN '🔴 CRITIQUE: RLS désactivé'
        WHEN public_policies > 0 THEN '🔴 CRITIQUE: Policies publiques'
        WHEN public_permissions > 0 THEN '🔴 CRITIQUE: Permissions publiques'
        WHEN service_role_policies = 0 THEN '🟡 ATTENTION: Aucune policy service_role'
        ELSE '✅ Sécurisé'
    END as security_status,
    rls_enabled,
    policy_count,
    public_policies,
    service_role_policies,
    public_permissions
FROM security_summary;

-- 8. Vérification finale
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'call_bookings' AND rowsecurity = true
        ) AND NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'call_bookings' 
            AND (roles IS NULL OR 'public' = ANY(roles))
        ) AND EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'call_bookings' 
            AND 'service_role' = ANY(roles)
        ) THEN '✅ CORRECTION APPLIQUÉE AVEC SUCCÈS - SÉCURITÉ MAXIMALE'
        ELSE '❌ PROBLÈME DÉTECTÉ - VÉRIFIER LES POLICIES'
    END as final_status;
