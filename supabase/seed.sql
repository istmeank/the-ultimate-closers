-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA — TUC-v2 développement local
-- À utiliser uniquement avec `supabase db reset` en local.
-- Ne contient AUCUNE donnée prospect réelle (règle confidentialité CLAUDE.md).
-- ═══════════════════════════════════════════════════════════════════════════

-- NOTE : ce seed suppose que vous avez déjà créé manuellement des utilisateurs
-- via Supabase Auth (Dashboard ou supabase auth signup CLI).
-- Remplacer les UUIDs ci-dessous par les vrais IDs de vos utilisateurs test.

-- Exemple de structure (à activer manuellement après création des users) :
--
-- INSERT INTO public.user_roles (user_id, role) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'owner'),
--   ('00000000-0000-0000-0000-000000000002', 'admin'),
--   ('00000000-0000-0000-0000-000000000003', 'closer')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Contenu du site (CMS) — données test génériques
INSERT INTO public.site_content (section_id, content_fr, content_en, content_ar) VALUES
  ('hero.title',    'L''excellence des closers de confiance', 'Excellence of trusted closers', 'تميز المغلقين الموثوقين'),
  ('hero.subtitle', 'CRM IA pour closers haut de gamme',      'AI CRM for premium closers',    'CRM ذكي للمغلقين المتميزين')
ON CONFLICT (section_id) DO NOTHING;
