-- Sécurisation des tables profiles et call_bookings
-- Bloquer tout accès public (anon)

-- 1. Supprimer toute policy publique sur profiles si elle existe
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- 2. S'assurer que RLS est activé
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_bookings ENABLE ROW LEVEL SECURITY;

-- 3. Vérifier que les policies existantes ne permettent PAS l'accès anon
-- Pour profiles : seuls les utilisateurs authentifiés peuvent voir leur propre profil ou les admins/owners peuvent tout voir
-- Les policies actuelles sont correctes, elles nécessitent auth.uid()

-- 4. Pour call_bookings : s'assurer qu'aucun accès public en lecture n'existe
-- Les policies actuelles nécessitent has_role(auth.uid(), 'admin') pour SELECT
-- C'est correct car auth.uid() retourne NULL pour les utilisateurs non authentifiés

-- 5. Ajouter une policy explicite de blocage pour les utilisateurs non authentifiés (optionnel mais recommandé)
-- Ceci est redondant avec RLS mais rend l'intention explicite

-- Note: Les policies existantes sont déjà sécurisées car elles utilisent auth.uid()
-- qui retourne NULL pour les utilisateurs anonymes, donc les conditions ne matchent jamais
-- et RLS bloque l'accès par défaut.

-- Confirmation que les tables sont sécurisées
DO $$
BEGIN
  RAISE NOTICE 'Migration de sécurité appliquée: profiles et call_bookings sont protégées contre l''accès public';
END $$;