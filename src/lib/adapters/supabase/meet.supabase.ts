/** Supabase implementation of MeetService. */
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { BookingResult, Deal, DealWithLead, MeetService } from '@/lib/services/meet.service';

/**
 * `previous_stage` n'existe pas encore dans le type `Update` généré (migration
 * cible non appliquée). On l'étend localement plutôt que de perdre toute
 * vérification de type sur le reste du payload.
 */
type DealsUpdatePayload = Database['public']['Tables']['deals']['Update'] & {
  previous_stage?: string | null;
};

export const supabaseMeetAdapter: MeetService = {
  async submitBooking(payload) {
    const { data, error } = await supabase.functions.invoke('submit-booking-secure', {
      body: payload,
    });
    if (error) throw error;
    return (data ?? { success: false }) as BookingResult;
  },

  async listDealsForLead(leadId) {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Deal[];
  },

  // NOTE: previous_stage (deals) et qualification/temperature_override (leads,
  // dénormalisé par jointure) sont posés par la migration cible du 2026-08-09,
  // pas encore appliquée — cette méthode est écrite contre ce schéma cible, pas
  // contre database.types.ts courant. Cast `as unknown as X` par cohérence avec
  // le reste de la couche adapters (voir leads.supabase.ts).
  async listForCloser(ownerId) {
    const { data, error } = await supabase
      .from('deals')
      .select('*, leads!inner(id, full_name, email, phone, score, source, created_at, status, owner_id, qualification, temperature_override)')
      .eq('leads.owner_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as unknown as Array<Record<string, unknown> & { leads: unknown }>).map(
      (row) => {
        const { leads: lead, ...deal } = row;
        return { ...deal, lead } as unknown as DealWithLead;
      }
    );
  },

  async updateStage(dealId, patch) {
    const payload: DealsUpdatePayload = {
      stage: patch.stage,
      previous_stage: patch.previousStage,
    };
    const { error } = await supabase
      .from('deals')
      .update(payload as unknown as Database['public']['Tables']['deals']['Update'])
      .eq('id', dealId);
    if (error) throw error;
  },
};
