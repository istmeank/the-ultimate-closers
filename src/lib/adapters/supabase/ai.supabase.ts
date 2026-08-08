/** Supabase implementation of AiService (Edge Functions backed). */
import { supabase } from '@/integrations/supabase/client';
import type { AiService, ScoreLeadResult } from '@/lib/services/ai.service';

export const supabaseAiAdapter: AiService = {
  async scoreLead(leadData) {
    const { data, error } = await supabase.functions.invoke('score-lead', {
      body: { leadData },
    });
    if (error) throw error;
    return data as ScoreLeadResult;
  },

  async generateScript() {
    throw new Error('ai.generateScript: not implemented yet (reserved for ANK phase).');
  },

  async classifyLead() {
    throw new Error('ai.classifyLead: not implemented yet (reserved for ANK phase).');
  },

  async askANK() {
    throw new Error('ai.askANK: not implemented yet (reserved for ANK phase).');
  },
};
