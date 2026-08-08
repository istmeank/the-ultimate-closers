/**
 * leads.service — abstraction for the leads domain (Domain 1 Acquisition).
 * Components/pages/hooks consume this; never the supabase client directly.
 */

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  score: number;
  source: string;
  interest: string | null;
  owner_id: string | null;
  created_at: string;
}

export interface LeadInteraction {
  id: string;
  lead_id: string;
  type: string;
  content: string;
  created_at: string;
  by_user_id: string | null;
  profiles?: {
    full_name: string;
    email: string;
  };
}

/** Aggregated KPIs for a closer's personal pipeline. */
export interface CloserPipelineStats {
  hotLeads: number;
  upcomingAppointments: number;
  activeDeals: number;
  /** won deals / total leads (%). */
  conversionRate: number;
  /** won deals / total deals (%). */
  closingRate: number;
  totalLeads: number;
}

export interface LeadsService {
  /** All leads owned by a closer, newest first. */
  listForCloser(ownerId: string): Promise<Lead[]>;
  /** Single lead by id, or null. */
  getById(id: string): Promise<Lead | null>;
  /** Update a lead's status. */
  updateStatus(id: string, status: string): Promise<void>;
  /** Total number of leads. */
  countAll(): Promise<number>;
  /** Number of leads with score >= threshold (default 75). */
  countQualified(minScore?: number): Promise<number>;
  /** Interactions timeline for a lead, newest first. */
  listInteractions(leadId: string): Promise<LeadInteraction[]>;
  /** Aggregated pipeline KPIs for one closer. */
  getCloserPipelineStats(ownerId: string): Promise<CloserPipelineStats>;
}

import { supabaseLeadsAdapter } from '@/lib/adapters/supabase/leads.supabase';

export const leadsService: LeadsService = supabaseLeadsAdapter;
