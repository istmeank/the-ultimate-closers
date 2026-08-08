/**
 * messaging.service — abstraction for multi-channel messaging (Domain 2:
 * WhatsApp, Telegram, Messenger, Instagram). Reserved — Vague 3+.
 * RGPD: every send requires a traced opt-in (see .claude/rules/global.md).
 */

export type MessagingChannel =
  | 'whatsapp'
  | 'telegram'
  | 'messenger'
  | 'instagram';

export interface OutboundMessage {
  leadId: string;
  channel: MessagingChannel;
  content: string;
}

export interface ConversationMessage {
  id: string;
  leadId: string;
  channel: MessagingChannel;
  direction: 'in' | 'out';
  content: string;
  created_at: string;
  read: boolean;
}

export interface MessagingService {
  /** Send an opt-in–verified message on a channel. */
  sendMessage(message: OutboundMessage): Promise<void>;
  /** Full conversation for a lead. */
  listConversation(leadId: string): Promise<ConversationMessage[]>;
  /** Mark a message as read. */
  markRead(messageId: string): Promise<void>;
  /** Conversation filtered by channel. */
  byChannel(leadId: string, channel: MessagingChannel): Promise<ConversationMessage[]>;
}

import { supabaseMessagingAdapter } from '@/lib/adapters/supabase/messaging.supabase';

export const messagingService: MessagingService = supabaseMessagingAdapter;
