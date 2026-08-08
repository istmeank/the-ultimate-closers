/**
 * profiles.service — abstraction for the profiles table and closer management.
 */

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  bio?: string | null;
  max_concurrent_leads?: number | null;
  specialties?: string[] | null;
  is_active?: boolean | null;
  created_at?: string;
}

export interface CloserWithStats {
  id: string;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
  max_concurrent_leads: number;
  current_leads: number;
  total_assigned: number;
  last_assigned_at: string | null;
}

export interface ProfileUpdate {
  full_name?: string;
  bio?: string;
  max_concurrent_leads?: number;
  specialties?: string[];
}

export interface ProfilesService {
  /** Single profile by id. */
  getById(id: string): Promise<Profile | null>;
  /** All profiles, newest first (admin user list). */
  listAll(): Promise<Profile[]>;
  /** Update editable fields of a profile. */
  update(id: string, patch: ProfileUpdate): Promise<void>;
  /** Enable/disable a profile (closer activation). */
  setActive(id: string, isActive: boolean): Promise<void>;
  /** Closers (user_roles = closer) enriched with assignment + lead stats. */
  listClosersWithStats(): Promise<CloserWithStats[]>;
}

import { supabaseProfilesAdapter } from '@/lib/adapters/supabase/profiles.supabase';

export const profilesService: ProfilesService = supabaseProfilesAdapter;
