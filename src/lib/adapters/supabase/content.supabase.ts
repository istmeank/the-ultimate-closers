/** Supabase implementation of ContentService. */
import { supabase } from '@/integrations/supabase/client';
import type {
  ContentService,
  Formation,
  SiteContentSection,
} from '@/lib/services/content.service';

export const supabaseContentAdapter: ContentService = {
  async listFormations() {
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .order('order_index');
    if (error) throw error;
    return (data ?? []) as unknown as Formation[];
  },

  async saveFormation(formation) {
    if (formation.id) {
      const { error } = await supabase
        .from('formations')
        .update(formation)
        .eq('id', formation.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('formations').insert(formation);
      if (error) throw error;
    }
  },

  async deleteFormation(id) {
    const { error } = await supabase.from('formations').delete().eq('id', id);
    if (error) throw error;
  },

  async setFormationPublished(id, isPublished) {
    const { error } = await supabase
      .from('formations')
      .update({ is_published: isPublished })
      .eq('id', id);
    if (error) throw error;
  },

  async listSiteContent() {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('section_id');
    if (error) throw error;
    return (data ?? []) as unknown as SiteContentSection[];
  },

  async addSiteContent(section) {
    const { error } = await supabase.from('site_content').insert({
      section_id: section.section_id,
      content_fr: section.content_fr ?? '',
      content_en: section.content_en ?? '',
      content_ar: section.content_ar ?? '',
      image_url: section.image_url ?? null,
    });
    if (error) throw error;
  },

  async upsertSiteContent(section) {
    const { error } = await supabase.from('site_content').upsert({
      ...section,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  },
};
