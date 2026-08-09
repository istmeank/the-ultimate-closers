/**
 * leads.service — abstraction for the leads domain (Domain 1 Acquisition).
 * Components/pages/hooks consume this; never the supabase client directly.
 */

import type { DealStage } from '@/lib/services/meet.service';

/**
 * Statuts legacy de `leads.status` (5 valeurs, colonne toujours en usage —
 * non dépréciée par le pipeline d'affaires du 2026-08-09, qui vit sur
 * `deals.stage`). Ce type ne doit jamais être redéclaré ailleurs.
 */
export type LeadStatus = 'new' | 'qualified' | 'in_progress' | 'won' | 'lost';

/** Libellés français des statuts legacy — source unique pour LeadDetail/CloserLeads/LeadCard. */
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Nouveau',
  qualified: 'Qualifié',
  in_progress: 'En cours',
  won: 'Gagné',
  lost: 'Perdu',
};

/**
 * Qualification humaine du lead (jugement du closer), distincte du `score`
 * automatique et de la température. Schéma cible du 2026-08-09.
 */
export type LeadQualification = 'non_evalue' | 'qualifie' | 'non_qualifie';

/** Libellés français de la qualification — source unique. */
export const LEAD_QUALIFICATION_LABELS: Record<LeadQualification, string> = {
  non_evalue: 'Non évalué',
  qualifie: 'Qualifié',
  non_qualifie: 'Non qualifié',
};

/**
 * Température — froid/tiède/chaud. Ne jamais confondre avec `temperature_override` :
 * ce dernier est le forçage manuel nullable stocké en base, la température
 * *effective* se calcule via `resolveTemperature`.
 */
export type LeadTemperature = 'froid' | 'tiede' | 'chaud';

/** Libellés français de la température — source unique. */
export const LEAD_TEMPERATURE_LABELS: Record<LeadTemperature, string> = {
  froid: 'Froid',
  tiede: 'Tiède',
  chaud: 'Chaud',
};

/**
 * Résout la température effective d'un lead.
 *
 * Règle (Nacer, 2026-08-09) : `temperature_override` prime s'il est renseigné
 * (jugement humain) ; sinon la température est dérivée du `score` (0-100) :
 * < 40 → froid, 40-69 → tiède, >= 70 → chaud.
 */
export function resolveTemperature(
  score: number,
  override: LeadTemperature | null
): LeadTemperature {
  if (override) return override;
  if (score >= 70) return 'chaud';
  if (score >= 40) return 'tiede';
  return 'froid';
}

/**
 * Types réels de `interactions.type` (contrainte CHECK en base). Le composant
 * InteractionsTimeline mappait jusqu'ici des valeurs fictives (`meeting`,
 * `message`, `hubspot`) qui n'existent dans aucune contrainte — corrigé ici,
 * source unique désormais.
 */
export type InteractionType =
  | 'call'
  | 'msg'
  | 'email'
  | 'meet'
  | 'whatsapp'
  | 'telegram'
  | 'messenger'
  | 'instagram'
  | 'note';

/** Libellés français des types d'interaction — source unique. */
export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  call: 'Appel téléphonique',
  msg: 'Message',
  email: 'Email',
  meet: 'Rendez-vous',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  messenger: 'Messenger',
  instagram: 'Instagram',
  note: 'Note',
};

/**
 * Canaux connus pouvant apparaître dans `InteractionMetadata['channel']`
 * (rendez-vous pris via un canal messagerie) — pas une contrainte base, une
 * simple table de traduction. Valeur inconnue : on affiche le brut plutôt que
 * de masquer l'information.
 */
const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  messenger: 'Messenger',
  instagram: 'Instagram',
  email: 'Email',
  phone: 'Téléphone',
  gcal: 'Google Agenda',
  manual: 'Manuel',
};

/** Traduit un canal en français, avec repli explicite sur la valeur brute si inconnue. */
export function translateChannel(channel: string): string {
  return CHANNEL_LABELS[channel] ?? channel;
}

/**
 * Métadonnées structurées d'une interaction — union discriminée sur `kind`.
 * Schéma cible du 2026-08-09 : `interactions.metadata` JSONB, `{}` par défaut
 * pour les interactions saisies par un humain (pas de `kind`).
 */
export type InteractionMetadata =
  | {
      kind: 'appointment_created';
      appointment_id: string;
      start_at: string;
      end_at: string;
      channel: string;
    }
  | {
      kind: 'deal_created';
      deal_id: string;
      offer_name: string;
      amount_cents: number | null;
      currency: string;
      stage: DealStage;
    }
  | Record<string, never>;

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  /** Statut legacy — cf LeadStatus. Toujours en usage, non déprécié. */
  status: LeadStatus;
  score: number;
  source: string;
  interest: string | null;
  owner_id: string | null;
  created_at: string;
  /** Jugement humain — défaut `non_evalue`. */
  qualification: LeadQualification;
  /** Forçage manuel de la température, nullable — ne pas confondre avec la température effective (cf resolveTemperature). */
  temperature_override: LeadTemperature | null;
}

export interface LeadInteraction {
  id: string;
  lead_id: string;
  type: InteractionType;
  content: string;
  created_at: string;
  by_user_id: string | null;
  /** Métadonnées structurées — priment sur `content` à l'affichage quand non vides. */
  metadata: InteractionMetadata;
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
  /** Update a lead's legacy status (leads.status — still in use, not deprecated). */
  updateStatus(id: string, status: LeadStatus): Promise<void>;
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
