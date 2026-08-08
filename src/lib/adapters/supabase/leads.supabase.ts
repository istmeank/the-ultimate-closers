/**
 * Supabase implementation of LeadsService.
 * Only place allowed to query leads / interactions / appointments / deals
 * for the acquisition domain.
 */
import { supabase } from '@/integrations/supabase/client';
import type {
  CloserPipelineStats,
  Lead,
  LeadInteraction,
  LeadsService,
} from '@/lib/services/leads.service';

export const supabaseLeadsAdapter: LeadsService = {
  async listForCloser(ownerId) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Lead[];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as Lead) ?? null;
  },

  async updateStatus(id, status) {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  async countAll() {
    const { count, error } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count ?? 0;
  },

  async countQualified(minScore = 75) {
    const { count, error } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('score', minScore);
    if (error) throw error;
    return count ?? 0;
  },

  async listInteractions(leadId) {
    const { data, error } = await supabase
      .from('interactions')
      .select(`
        *,
        profiles:by_user_id(full_name, email)
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as LeadInteraction[];
  },

  async getCloserPipelineStats(ownerId): Promise<CloserPipelineStats> {
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Hot leads (score >= 75)
    const { count: hotLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId)
      .gte('score', 75);

    // Upcoming booked appointments (next 7 days)
    const { count: upcomingAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', ownerId)
      .gte('start_at', now.toISOString())
      .lte('start_at', sevenDays.toISOString());

    // Total leads for this owner
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId);

    // Lead ids for deal aggregation
    const { data: ownerLeads } = await supabase
      .from('leads')
      .select('id')
      .eq('owner_id', ownerId);
    const leadIds = (ownerLeads ?? []).map((l) => l.id);

    let activeDeals = 0;
    let totalDeals = 0;
    let wonDeals = 0;
    if (leadIds.length > 0) {
      const { count: activeCount } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .in('stage', ['qualified', 'proposal', 'negotiation'])
        .in('lead_id', leadIds);
      activeDeals = activeCount ?? 0;

      const { data: allDeals } = await supabase
        .from('deals')
        .select('stage')
        .in('lead_id', leadIds);
      totalDeals = allDeals?.length ?? 0;
      wonDeals = allDeals?.filter((d) => d.stage === 'won').length ?? 0;
    }

    const total = totalLeads ?? 0;
    return {
      hotLeads: hotLeads ?? 0,
      upcomingAppointments: upcomingAppointments ?? 0,
      activeDeals,
      totalLeads: total,
      conversionRate: total > 0 ? Math.round((wonDeals / total) * 100) : 0,
      closingRate: totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0,
    };
  },
};
