/**
 * realtime.service — abstraction for realtime subscriptions / presence.
 * Reserved — Supabase Realtime today, Socket.io after migration (ADR-025).
 */

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

export interface RealtimeService {
  /** Subscribe to row changes on a table. */
  subscribeToTable(
    table: string,
    callback: (payload: unknown) => void
  ): RealtimeSubscription;
  /** Broadcast a custom event on a channel. */
  broadcastEvent(channel: string, event: string, payload: unknown): Promise<void>;
  /** Track presence on a channel. */
  presence(channel: string, callback: (state: unknown) => void): RealtimeSubscription;
}

import { supabaseRealtimeAdapter } from '@/lib/adapters/supabase/realtime.supabase';

export const realtimeService: RealtimeService = supabaseRealtimeAdapter;
