# 🚨 CORRECTION SÉCURITÉ - Guide Lovable Cloud

## ✅ Fichier Migration Créé

Le fichier de migration a été créé avec succès :
- **Fichier** : `supabase/migrations/20250127000002_fix_call_bookings_security_corrected.sql`
- **Contenu** : Code SQL corrigé pour Lovable Cloud

## 🔧 Comment Appliquer la Correction

### Option 1 : Via Lovable Dashboard (Recommandé)
1. **Ouvrir Lovable Dashboard**
2. **Naviguer vers Database/Supabase**
3. **Ouvrir SQL Editor**
4. **Copier-coller le contenu du fichier migration**
5. **Exécuter le script**

### Option 2 : Via Migration Automatique
Si Lovable Cloud applique automatiquement les migrations :
1. **Commit et push** le fichier migration
2. **Attendre** l'application automatique
3. **Vérifier** avec le script de test

## 📋 Code SQL à Exécuter

```sql
-- CORRECTION SÉCURISÉE - call_bookings
-- Migration pour Lovable Cloud - Sécurité corrigée
-- Cette migration corrige le problème de sécurité tout en gardant le formulaire fonctionnel

-- Étape 1: Supprimer toutes les policies existantes
DROP POLICY IF EXISTS "Anyone can create booking" ON public.call_bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "authenticated_users_can_create_booking" ON public.call_bookings;
DROP POLICY IF EXISTS "only_admins_can_view_bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "only_admins_can_update_bookings" ON public.call_bookings;
DROP POLICY IF EXISTS "only_admins_can_delete_bookings" ON public.call_bookings;

-- Étape 2: S'assurer que RLS est activé
ALTER TABLE public.call_bookings ENABLE ROW LEVEL SECURITY;

-- Étape 3: Créer des policies sécurisées

-- Policy 1: TOUS (authentifiés ET non-authentifiés) peuvent créer des réservations
-- ✅ CORRECTION: Utilise TO public au lieu de TO authenticated
CREATE POLICY "public_can_create_booking"
ON public.call_bookings FOR INSERT
TO public
WITH CHECK (true);

-- Policy 2: Seuls les admins peuvent voir les réservations
CREATE POLICY "only_admins_can_view_bookings"
ON public.call_bookings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Policy 3: Seuls les admins peuvent modifier les réservations
CREATE POLICY "only_admins_can_update_bookings"
ON public.call_bookings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Policy 4: Seuls les admins peuvent supprimer les réservations
CREATE POLICY "only_admins_can_delete_bookings"
ON public.call_bookings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Étape 4: Ajouter commentaire pour documentation
COMMENT ON TABLE public.call_bookings IS 'Sensitive customer booking data - ACCESS RESTRICTED TO ADMINS ONLY. Public can create bookings via form.';

-- Étape 5: Vérification finale
SELECT 'Security fix applied successfully - public can still create bookings' as status;
```

## 🧪 Vérification Post-Correction

Après avoir appliqué la correction, exécutez le script de vérification :
- **Fichier** : `verify-call-bookings-security-fix.sql`
- **Objectif** : Confirmer que la sécurité est correctement appliquée

## ✅ Résultat Attendu

Après la correction :
- ✅ **Formulaire de réservation** : Continue de fonctionner normalement
- ✅ **Visiteurs non connectés** : Peuvent toujours réserver
- ✅ **Admins** : Peuvent voir/modifier/supprimer toutes les réservations
- ✅ **Utilisateurs non-admin** : Ne peuvent plus voir les données sensibles
- ✅ **Aucun accès public** aux données existantes

## 🚨 Importance Critique

Cette correction doit être appliquée **immédiatement** car :
- Vos données clients sont actuellement exposées publiquement
- Des hackers peuvent scraper emails, téléphones, noms d'entreprises
- Risque de spam, vol d'identité, vente de listes de contacts

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Lovable Cloud
2. Testez chaque policy individuellement
3. Contactez le support Lovable si nécessaire

---

**⚠️ IMPORTANT** : Une fois cette correction appliquée, nous pourrons reprendre l'implémentation du système CRM en toute sécurité.
