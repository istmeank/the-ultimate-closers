/** Supabase placeholder for MatchingService (reserved — Vague 3). */
import type { MatchingService } from '@/lib/services/matching.service';

const NOT_IMPLEMENTED = 'matching.service: not implemented yet (Vague 3 — matching-engine).';

export const supabaseMatchingAdapter: MatchingService = {
  async scoreAffinity() {
    throw new Error(NOT_IMPLEMENTED);
  },
  async matchClosersToProspect() {
    throw new Error(NOT_IMPLEMENTED);
  },
  async getMatchExplanation() {
    throw new Error(NOT_IMPLEMENTED);
  },
};
