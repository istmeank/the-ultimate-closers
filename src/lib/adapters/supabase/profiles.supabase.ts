/** Supabase implementation of ProfilesService. */
import { supabase } from '@/integrations/supabase/client';
import type {
  CloserWithStats,
  Profile,
  ProfilesService,
} from '@/lib/services/profiles.service';

export const supabaseProfilesAdapter: ProfilesService = {
  async getById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as Profile) ?? null;
  },

  async listAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Profile[];
  },

  async update(id, patch) {
    const { error } = await supabase.from('profiles').update(patch).eq('id', id);
    if (error) throw error;
  },

  async setActive(id, isActive) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', id);
    if (error) throw error;
  },

  async listClosersWithStats(): Promise<CloserWithStats[]> {
    const { data: closerRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'closer');
    if (rolesError) throw rolesError;
    if (!closerRoles || closerRoles.length === 0) return [];

    const closerIds = closerRoles.map((r) => r.user_id);

    const { data: closersData, error: closersError } = await supabase
      .from('profiles')
      .select('id, full_name, email, is_active, max_concurrent_leads')
      .in('id', closerIds);
    if (closersError) throw closersError;

    return Promise.all(
      (closersData ?? []).map(async (closer): Promise<CloserWithStats> => {
        const { count: currentLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', closer.id)
          .in('status', ['new', 'qualified', 'in_progress']);

        const { data: assignmentData } = await supabase
          .from('closer_assignments')
          .select('total_assigned, last_assigned_at')
          .eq('closer_id', closer.id)
          .maybeSingle();

        return {
          id: closer.id,
          full_name: closer.full_name,
          email: closer.email,
          is_active: closer.is_active ?? false,
          max_concurrent_leads: closer.max_concurrent_leads ?? 0,
          current_leads: currentLeads ?? 0,
          total_assigned: assignmentData?.total_assigned ?? 0,
          last_assigned_at: assignmentData?.last_assigned_at ?? null,
        };
      })
    );
  },
};
