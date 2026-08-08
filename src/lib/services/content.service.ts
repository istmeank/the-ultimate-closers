/**
 * content.service — abstraction for CMS content: formations + site_content.
 * (Domain 5 onboarding/CMS + homepage content.)
 */

export interface Formation {
  id?: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  thumbnail_url: string;
  duration_minutes: number;
  order_index: number;
  is_published: boolean;
}

export interface SiteContentSection {
  id?: string;
  section_id: string;
  content_fr?: string | null;
  content_en?: string | null;
  content_ar?: string | null;
  image_url?: string | null;
  updated_at?: string;
}

export interface ContentService {
  // --- Formations ---
  listFormations(): Promise<Formation[]>;
  saveFormation(formation: Formation): Promise<void>;
  deleteFormation(id: string): Promise<void>;
  setFormationPublished(id: string, isPublished: boolean): Promise<void>;
  // --- Site content (homepage CMS) ---
  listSiteContent(): Promise<SiteContentSection[]>;
  addSiteContent(section: SiteContentSection): Promise<void>;
  upsertSiteContent(section: SiteContentSection): Promise<void>;
}

import { supabaseContentAdapter } from '@/lib/adapters/supabase/content.supabase';

export const contentService: ContentService = supabaseContentAdapter;
