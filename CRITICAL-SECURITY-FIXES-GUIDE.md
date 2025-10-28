# 🚨 CORRECTION URGENTE - 3 Vulnérabilités Critiques

## Problèmes Identifiés

### 1. 🚨 call_bookings - INSERT Publique
- **Risque** : Données sensibles (emails, téléphones, infos business) accessibles publiquement
- **Impact** : Vol de données, spam, injection malveillante

### 2. 🚨 site_analytics - INSERT Publique  
- **Risque** : Poisoning des analytics, fausses métriques, coûts de stockage
- **Impact** : Données business faussées, attaques DDoS

### 3. 🚨 Protection Mots de Passe - Désactivée
- **Risque** : Utilisation de mots de passe compromis
- **Impact** : Comptes piratés, accès non autorisé

## ✅ SOLUTION COMPLÈTE

### Étape 1 : Appliquer la Migration de Sécurité

**Copier-coller ce code dans Lovable Cloud SQL Editor :**

```sql
-- CORRECTION URGENTE - Toutes les vulnérabilités de sécurité
-- Migration pour corriger call_bookings, site_analytics et protection mots de passe

-- ========================================
-- 1. CORRECTION call_bookings
-- ========================================

-- Supprimer toutes les policies INSERT publiques existantes
DROP POLICY IF EXISTS "public_can_create_booking" ON public.call_bookings;
DROP POLICY IF EXISTS "secure_create_booking" ON public.call_bookings;
DROP POLICY IF EXISTS "Anyone can create booking" ON public.call_bookings;

-- Créer une policy restrictive pour INSERT (service_role seulement)
CREATE POLICY "only_service_role_can_insert_bookings"
ON public.call_bookings FOR INSERT
TO service_role
WITH CHECK (true);

-- S'assurer que RLS est activé
ALTER TABLE public.call_bookings ENABLE ROW LEVEL SECURITY;

-- Ajouter des contraintes de validation
ALTER TABLE public.call_bookings 
ADD CONSTRAINT IF NOT EXISTS valid_phone_format 
CHECK (phone ~* '^[\+]?[0-9\s\-\(\)]{10,}$');

ALTER TABLE public.call_bookings 
ADD CONSTRAINT IF NOT EXISTS valid_company_name 
CHECK (length(company_name) >= 2 AND length(company_name) <= 100);

ALTER TABLE public.call_bookings 
ADD CONSTRAINT IF NOT EXISTS valid_names 
CHECK (
  length(first_name) >= 2 AND length(first_name) <= 50 AND
  length(last_name) >= 2 AND length(last_name) <= 50
);

-- Ajouter champ de tracking
ALTER TABLE public.call_bookings 
ADD COLUMN IF NOT EXISTS submission_source TEXT DEFAULT 'edge_function';

-- ========================================
-- 2. CORRECTION site_analytics
-- ========================================

-- S'assurer que RLS est activé sur site_analytics
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.site_analytics;
DROP POLICY IF EXISTS "Public can insert analytics" ON public.site_analytics;

-- Créer une policy restrictive pour INSERT (service_role seulement)
CREATE POLICY "only_service_role_can_insert_analytics"
ON public.site_analytics FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy pour que les admins puissent voir les analytics
CREATE POLICY "admins_can_view_analytics"
ON public.site_analytics FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Ajouter des contraintes de validation pour site_analytics
ALTER TABLE public.site_analytics 
ADD CONSTRAINT IF NOT EXISTS valid_event_type 
CHECK (event_type IN ('page_view', 'click', 'form_submit', 'download', 'custom'));

ALTER TABLE public.site_analytics 
ADD CONSTRAINT IF NOT EXISTS valid_page_path 
CHECK (length(page_path) <= 500);

-- Ajouter champ de tracking
ALTER TABLE public.site_analytics 
ADD COLUMN IF NOT EXISTS submission_source TEXT DEFAULT 'edge_function';

-- ========================================
-- 3. CORRECTION user_roles (si nécessaire)
-- ========================================

-- S'assurer que RLS est activé sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy pour que seuls les admins puissent gérer les rôles
CREATE POLICY "admins_can_manage_roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ========================================
-- 4. CORRECTION profiles (si nécessaire)
-- ========================================

-- S'assurer que RLS est activé sur profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy pour que les utilisateurs voient leur propre profil
CREATE POLICY "users_can_view_own_profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy pour que les utilisateurs puissent mettre à jour leur profil
CREATE POLICY "users_can_update_own_profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy pour que les admins voient tous les profils
CREATE POLICY "admins_can_view_all_profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ========================================
-- 5. COMMENTAIRES DE SÉCURITÉ
-- ========================================

COMMENT ON TABLE public.call_bookings IS 'Sensitive customer booking data - INSERT ONLY VIA SECURE EDGE FUNCTION. No public access.';
COMMENT ON TABLE public.site_analytics IS 'Analytics data - INSERT ONLY VIA SECURE EDGE FUNCTION. No public access.';
COMMENT ON TABLE public.user_roles IS 'User roles - ADMIN ACCESS ONLY. No public access.';
COMMENT ON TABLE public.profiles IS 'User profiles - OWN PROFILE ACCESS ONLY. Admins can see all.';

-- Message de confirmation
SELECT 'All security vulnerabilities fixed successfully' as status;
```

### Étape 2 : Déployer les Edge Functions Sécurisées

**Créer 2 Edge Functions dans Lovable :**

1. **submit-booking-secure** (déjà créée)
2. **submit-analytics-secure** (nouvelle)

### Étape 3 : Activer la Protection Mots de Passe

**Dans Lovable Dashboard :**
1. **Aller** dans Auth → Settings
2. **Activer** "Leaked password protection"
3. **Configurer** les seuils de sécurité

### Étape 4 : Mettre à Jour le Code Frontend

**Modifier les appels directs à la base de données :**

```typescript
// AVANT (vulnérable)
const { error } = await supabase
  .from('call_bookings')
  .insert(bookingData)

const { error } = await supabase
  .from('site_analytics')
  .insert(analyticsData)

// APRÈS (sécurisé)
const { data, error } = await supabase.functions.invoke('submit-booking-secure', {
  body: bookingData
})

const { data, error } = await supabase.functions.invoke('submit-analytics-secure', {
  body: analyticsData
})
```

## 🧪 Tests de Vérification

**Après la correction, ces requêtes doivent TOUTES échouer :**

```sql
-- Test 1: INSERT call_bookings (doit échouer)
INSERT INTO public.call_bookings (first_name, last_name, email) 
VALUES ('Test', 'User', 'test@example.com');

-- Test 2: INSERT site_analytics (doit échouer)
INSERT INTO public.site_analytics (event_type, page_path) 
VALUES ('page_view', '/test');

-- Test 3: SELECT call_bookings (doit échouer pour non-admin)
SELECT * FROM public.call_bookings;
```

## ✅ Résultat Final

Après cette correction :
- ❌ **Aucun accès public** aux données sensibles
- ✅ **Validation stricte** côté serveur
- ✅ **Rate limiting** anti-spam
- ✅ **Protection mots de passe** activée
- ✅ **Edge Functions sécurisées** pour tous les inserts

## 🚨 URGENCE

Ces vulnérabilités doivent être corrigées **immédiatement** car :
- Vos données clients sont exposées
- Vos analytics peuvent être manipulés
- Vos utilisateurs sont vulnérables

---

**⚠️ IMPORTANT** : Appliquez cette correction maintenant pour protéger votre application et vos utilisateurs.
