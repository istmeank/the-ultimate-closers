/** Supabase placeholder for RealtimeService (reserved). */
import type { RealtimeService } from '@/lib/services/realtime.service';

const NOT_IMPLEMENTED = 'realtime.service: not implemented yet (reserved).';

export const supabaseRealtimeAdapter: RealtimeService = {
  subscribeToTable() {
    throw new Error(NOT_IMPLEMENTED);
  },
  async broadcastEvent() {
    throw new Error(NOT_IMPLEMENTED);
  },
  presence() {
    throw new Error(NOT_IMPLEMENTED);
  },
};
