-- =========================================
-- SYSTÈME D'ADMINISTRATION THE ULTIMATE CLOSERS
-- =========================================

-- 1. Créer l'enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Table des rôles utilisateur (sécurité maximale)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Activer RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fonction sécurisée pour vérifier les rôles (évite la récursion RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Politique RLS : seuls les admins voient tous les rôles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Politique : les users voient uniquement leur propre rôle
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Politique : seuls les admins peuvent gérer les rôles
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Table des profils utilisateur
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS : tout le monde peut voir son profil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- RLS : users peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- RLS : admins peuvent voir tous les profils
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS : admins peuvent modifier tous les profils
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Table pour le contenu du site (textes, images)
CREATE TABLE public.site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id TEXT NOT NULL UNIQUE,
    content_fr TEXT,
    content_en TEXT,
    content_ar TEXT,
    image_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire le contenu
CREATE POLICY "Anyone can view site content"
ON public.site_content FOR SELECT
TO public
USING (true);

-- Seuls les admins peuvent modifier
CREATE POLICY "Admins can manage site content"
ON public.site_content FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Table pour les formations
CREATE TABLE public.formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT,
    thumbnail_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID
);

ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;

-- Users authentifiés peuvent voir les formations publiées
CREATE POLICY "Users can view published formations"
ON public.formations FOR SELECT
TO authenticated
USING (is_published = true);

-- Admins peuvent tout gérer
CREATE POLICY "Admins can manage formations"
ON public.formations FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Table pour les analytics/statistiques
CREATE TABLE public.site_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    page_path TEXT,
    user_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent voir les analytics
CREATE POLICY "Admins can view analytics"
ON public.site_analytics FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tout le monde peut insérer des événements (tracking)
CREATE POLICY "Anyone can insert analytics"
ON public.site_analytics FOR INSERT
TO public
WITH CHECK (true);

-- 7. Création des buckets de stockage
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('formations', 'formations', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Policies de stockage pour site-images
CREATE POLICY "Admins can manage site images"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'site-images' AND
    public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
    bucket_id = 'site-images' AND
    public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Anyone can view site images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-images');

-- 9. Policies de stockage pour formations
CREATE POLICY "Admins can upload formations"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'formations' AND
    public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update formations"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'formations' AND
    public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete formations"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'formations' AND
    public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Authenticated users can download formations"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'formations');

-- 10. Policies de stockage pour avatars
CREATE POLICY "Users can manage own avatar"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 11. Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_formations_updated_at
    BEFORE UPDATE ON public.formations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();