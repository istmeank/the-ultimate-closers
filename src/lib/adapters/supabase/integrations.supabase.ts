/** Supabase implementation of IntegrationsService. */
import { supabase } from '@/integrations/supabase/client';
import type {
  GoogleCalendarConnection,
  HubspotConnection,
  IntegrationsService,
  SyncLog,
} from '@/lib/services/integrations.service';

async function requireUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const supabaseIntegrationsAdapter: IntegrationsService = {
  async getHubspotConnection(): Promise<HubspotConnection> {
    const { data, error } = await supabase
      .from('closer_integrations')
      .select('*')
      .eq('integration_type', 'hubspot')
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    return {
      isConnected: !!data,
      hasToken: !!(data as { access_token?: string } | null)?.access_token,
    };
  },

  async listHubspotSyncLogs(limit = 10) {
    const { data, error } = await supabase
      .from('external_sync_log')
      .select('*')
      .eq('entity_type', 'lead')
      .order('last_sync', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as SyncLog[];
  },

  async testHubspotConnection(apiKey) {
    const { data, error } = await supabase.functions.invoke('hubspot-sync', {
      body: { action: 'test_connection', apiKey },
    });
    if (error) throw error;
    return (data ?? { success: false }) as { success: boolean; message?: string };
  },

  async saveHubspotApiKey(apiKey) {
    const userId = await requireUserId();
    if (!userId) throw new Error('Utilisateur non authentifié.');
    const { error } = await supabase.from('closer_integrations').upsert(
      {
        closer_id: userId,
        integration_type: 'hubspot',
        access_token: apiKey,
        is_active: true,
      },
      { onConflict: 'closer_id,integration_type' }
    );
    if (error) throw error;
  },

  async syncAllLeads() {
    const { data, error } = await supabase.functions.invoke('hubspot-sync', {
      body: { action: 'sync_all' },
    });
    if (error) throw error;
    return { synced: (data as { synced?: number })?.synced ?? 0 };
  },

  async syncLead(leadId, action) {
    const { data, error } = await supabase.functions.invoke('hubspot-sync', {
      body: { leadId, action },
    });
    if (error) throw error;
    return data;
  },

  async disconnectHubspot() {
    const { error } = await supabase
      .from('closer_integrations')
      .update({ is_active: false })
      .eq('integration_type', 'hubspot');
    if (error) throw error;
  },

  async getGoogleCalendarConnection(userId): Promise<GoogleCalendarConnection> {
    const { data, error } = await supabase
      .from('google_calendar_tokens')
      .select('calendar_email, expires_at')
      .eq('user_id', userId)
      .maybeSingle();
    // PGRST116 = no rows; treat as "not connected".
    if (error && error.code !== 'PGRST116') throw error;
    if (data && data.expires_at) {
      return {
        connected: new Date(data.expires_at) > new Date(),
        calendarEmail: data.calendar_email ?? null,
      };
    }
    return { connected: false, calendarEmail: null };
  },

  async getGoogleAuthUrl() {
    const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
      body: { action: 'get_auth_url' },
    });
    if (error) throw error;
    return (data as { authUrl?: string })?.authUrl ?? null;
  },

  async exchangeGoogleCode(code) {
    const { error } = await supabase.functions.invoke('google-calendar-auth', {
      body: { action: 'exchange_code', code },
    });
    if (error) throw error;
  },

  async disconnectGoogleCalendar(userId) {
    const { error } = await supabase
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  },
};
