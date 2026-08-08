-- AUDIT DE SÉCURITÉ COMPLET - The Ultimate Closers
-- Script pour vérifier la sécurité de toutes les tables sensibles

-- 1. Vérifier l'état RLS de toutes les tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Activé'
        ELSE '❌ RLS DÉSACTIVÉ - RISQUE SÉCURITÉ!'
    END as security_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'call_bookings', 'leads', 'interactions', 'deals', 
    'appointments', 'payments', 'lead_scores', 'resources',
    'external_sync_log', 'profiles', 'user_roles'
)
ORDER BY rowsecurity, tablename;

-- 2. Lister toutes les policies par table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    CASE 
        WHEN roles IS NULL OR 'public' = ANY(roles) THEN '❌ ACCÈS PUBLIC DÉTECTÉ!'
        WHEN 'authenticated' = ANY(roles) THEN '⚠️ Accès authentifié'
        ELSE '✅ Accès restreint'
    END as access_level
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'call_bookings', 'leads', 'interactions', 'deals', 
    'appointments', 'payments', 'lead_scores', 'resources',
    'external_sync_log', 'profiles', 'user_roles'
)
ORDER BY tablename, policyname;

-- 3. Vérifier les permissions de table
SELECT 
    table_name,
    grantee,
    privilege_type,
    CASE 
        WHEN grantee = 'public' THEN '❌ PERMISSION PUBLIQUE!'
        WHEN grantee = 'authenticated' THEN '⚠️ Permission authentifiée'
        ELSE '✅ Permission restreinte'
    END as permission_level
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND table_name IN (
    'call_bookings', 'leads', 'interactions', 'deals', 
    'appointments', 'payments', 'lead_scores', 'resources',
    'external_sync_log', 'profiles', 'user_roles'
)
ORDER BY table_name, grantee, privilege_type;

-- 4. Résumé des risques de sécurité
WITH security_summary AS (
    SELECT 
        t.tablename,
        t.rowsecurity as rls_enabled,
        COUNT(p.policyname) as policy_count,
        COUNT(CASE WHEN p.roles IS NULL OR 'public' = ANY(p.roles) THEN 1 END) as public_policies,
        COUNT(CASE WHEN tp.grantee = 'public' THEN 1 END) as public_permissions
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
    LEFT JOIN information_schema.table_privileges tp ON t.tablename = tp.table_name AND tp.table_schema = 'public'
    WHERE t.schemaname = 'public'
    AND t.tablename IN (
        'call_bookings', 'leads', 'interactions', 'deals', 
        'appointments', 'payments', 'lead_scores', 'resources',
        'external_sync_log', 'profiles', 'user_roles'
    )
    GROUP BY t.tablename, t.rowsecurity
)
SELECT 
    tablename,
    CASE 
        WHEN rls_enabled = false THEN '🔴 CRITIQUE: RLS désactivé'
        WHEN public_policies > 0 THEN '🔴 CRITIQUE: Policies publiques'
        WHEN public_permissions > 0 THEN '🔴 CRITIQUE: Permissions publiques'
        WHEN policy_count = 0 THEN '🟡 ATTENTION: Aucune policy'
        ELSE '✅ Sécurisé'
    END as security_status,
    rls_enabled,
    policy_count,
    public_policies,
    public_permissions
FROM security_summary
ORDER BY 
    CASE 
        WHEN rls_enabled = false THEN 1
        WHEN public_policies > 0 THEN 2
        WHEN public_permissions > 0 THEN 3
        WHEN policy_count = 0 THEN 4
        ELSE 5
    END;
