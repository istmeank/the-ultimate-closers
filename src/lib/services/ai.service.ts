/**
 * ai.service — abstraction for AI capabilities (lead scoring today; Claude
 * scripts, lead classification and ANK Q&A are reserved for later phases —
 * see ADR-025 / architecture-evolution.md, ANK Phase 1-3).
 */

export interface ScoreLeadInput {
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  company_name?: string;
  annual_revenue?: string;
  urgency?: string;
  main_challenge?: string;
  sales_team_size?: number;
  source?: string;
  is_business_email?: boolean;
  commitment_confirmed?: boolean;
  is_darija_speaker?: boolean;
  darija_confidence?: number;
  [key: string]: unknown;
}

export interface ScoreLeadResult {
  score: number;
  auto_assigned?: boolean;
  [key: string]: unknown;
}

export interface AiService {
  /** Score a lead and (optionally) auto-assign it to a closer. */
  scoreLead(leadData: ScoreLeadInput): Promise<ScoreLeadResult>;
  /** [Reserved] Generate a personalized sales script. */
  generateScript(input: unknown): Promise<unknown>;
  /** [Reserved] Classify a lead. */
  classifyLead(input: unknown): Promise<unknown>;
  /** [Reserved] Ask ANK (TUC proprietary model, future phases). */
  askANK(prompt: string): Promise<unknown>;
}

import { supabaseAiAdapter } from '@/lib/adapters/supabase/ai.supabase';

export const aiService: AiService = supabaseAiAdapter;
