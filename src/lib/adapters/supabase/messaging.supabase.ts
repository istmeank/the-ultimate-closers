/** Supabase placeholder for MessagingService (reserved — Vague 3+). */
import type { MessagingService } from '@/lib/services/messaging.service';

const NOT_IMPLEMENTED = 'messaging.service: not implemented yet (Vague 3+ — Domain 2).';

export const supabaseMessagingAdapter: MessagingService = {
  async sendMessage() {
    throw new Error(NOT_IMPLEMENTED);
  },
  async listConversation() {
    throw new Error(NOT_IMPLEMENTED);
  },
  async markRead() {
    throw new Error(NOT_IMPLEMENTED);
  },
  async byChannel() {
    throw new Error(NOT_IMPLEMENTED);
  },
};
