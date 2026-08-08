/**
 * integrations.service — abstraction for third-party integrations:
 * HubSpot CRM sync + Google Calendar OAuth. (Domain 4/transverse.)
 * All OAuth secrets and provider calls live behind this service.
 */

export interface SyncLog {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  error: string | null;
  last_sync: string;
  hubspot_id: string | null;
}

export interface HubspotConnection {
  isConnected: boolean;
  hasToken: boolean;
}

export interface GoogleCalendarConnection {
  connected: boolean;
  calendarEmail: string | null;
}

export interface IntegrationsService {
  // --- HubSpot ---
  getHubspotConnection(): Promise<HubspotConnection>;
  listHubspotSyncLogs(limit?: number): Promise<SyncLog[]>;
  testHubspotConnection(apiKey: string): Promise<{ success: boolean; message?: string }>;
  saveHubspotApiKey(apiKey: string): Promise<void>;
  syncAllLeads(): Promise<{ synced: number }>;
  syncLead(leadId: string, action: 'create' | 'update'): Promise<unknown>;
  disconnectHubspot(): Promise<void>;

  // --- Google Calendar ---
  getGoogleCalendarConnection(userId: string): Promise<GoogleCalendarConnection>;
  getGoogleAuthUrl(): Promise<string | null>;
  exchangeGoogleCode(code: string): Promise<void>;
  disconnectGoogleCalendar(userId: string): Promise<void>;
}

import { supabaseIntegrationsAdapter } from '@/lib/adapters/supabase/integrations.supabase';

export const integrationsService: IntegrationsService = supabaseIntegrationsAdapter;
