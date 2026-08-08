/**
 * matching.service — abstraction for prospect/closer matching (Domain 3).
 * Reserved: implemented by the future `matching-engine` agent consuming the
 * `workload-management-matching` skill (priority queues x affinity x load).
 */

export interface MatchCandidate {
  closerId: string;
  score: number;
  reasons: string[];
}

export interface MatchingService {
  /** Affinity score between a lead and a closer (0-100). */
  scoreAffinity(leadId: string, closerId: string): Promise<number>;
  /** Ranked closer candidates for a given prospect. */
  matchClosersToProspect(leadId: string): Promise<MatchCandidate[]>;
  /** Human-readable explanation of why a match was proposed. */
  getMatchExplanation(leadId: string, closerId: string): Promise<string>;
}

import { supabaseMatchingAdapter } from '@/lib/adapters/supabase/matching.supabase';

export const matchingService: MatchingService = supabaseMatchingAdapter;
