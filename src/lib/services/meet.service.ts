/**
 * meet.service — abstraction for the meet/booking/deals domain (Domain 4).
 * Today: secure booking submission + deal listing. Future: calendar,
 * transcription, post-meet feedback (see ADR-025 / architecture-evolution.md).
 */

export interface BookingSubmission {
  first_name: string;
  last_name: string;
  job_title: string;
  company_name: string;
  company_website: string | null;
  company_linkedin: string | null;
  email: string;
  phone: string;
  industry: string;
  annual_revenue?: string;
  sales_team_size: number;
  current_channels: string[];
  main_challenge: string;
  call_objective?: string;
  has_used_ai_crm?: string | boolean;
  urgency?: string;
  preferred_date: string;
  timezone: string;
  preferred_platform?: string;
  commitment_confirmed: boolean;
  language: string;
}

export interface BookingResult {
  success: boolean;
  error?: string;
}

export interface Deal {
  id: string;
  lead_id: string;
  offer_name: string;
  amount_cents: number;
  stage: string;
  created_at: string;
}

export interface MeetService {
  /** Submit a booking through the secure (rate-limited, validated) backend. */
  submitBooking(payload: BookingSubmission): Promise<BookingResult>;
  /** Deals attached to a lead, newest first. */
  listDealsForLead(leadId: string): Promise<Deal[]>;
}

import { supabaseMeetAdapter } from '@/lib/adapters/supabase/meet.supabase';

export const meetService: MeetService = supabaseMeetAdapter;
