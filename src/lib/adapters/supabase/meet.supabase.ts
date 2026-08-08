/** Supabase implementation of MeetService. */
import { supabase } from '@/integrations/supabase/client';
import type { BookingResult, Deal, MeetService } from '@/lib/services/meet.service';

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
};
