/**
 * Supabase implementation of AiService (Edge Functions backed).
 *
 * Deferred capabilities are listed in `docs/deferred-capabilities.md`.
 * They fail loudly on purpose: a silent `undefined` would surface as a blank
 * screen for a closer mid-call. See `deferred.test.ts` for the guarantee.
 */
import { supabase } from '@/integrations/supabase/client';
import type { AiService, ScoreLeadResult } from '@/lib/services/ai.service';

/** Reserved for the ANK phase (see docs/deferred-capabilities.md). */
const NOT_IMPLEMENTED_ANK = (method: string) =>
  `ai.${method}: not implemented yet (reserved for ANK phase — see docs/deferred-capabilities.md).`;

export const supabaseAiAdapter: AiService = {
  async scoreLead(leadData) {
    const { data, error } = await supabase.functions.invoke('score-lead', {
      body: { leadData },
    });
    if (error) throw error;
    return data as ScoreLeadResult;
  },

  async generateScript() {
    throw new Error(NOT_IMPLEMENTED_ANK('generateScript'));
  },

  async classifyLead() {
    throw new Error(NOT_IMPLEMENTED_ANK('classifyLead'));
  },

  async askANK() {
    throw new Error(NOT_IMPLEMENTED_ANK('askANK'));
  },
};
