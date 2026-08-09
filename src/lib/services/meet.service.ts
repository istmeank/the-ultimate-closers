/**
 * meet.service — abstraction for the meet/booking/deals domain (Domain 4).
 * Today: secure booking submission + deal listing/pipeline. Future: calendar,
 * transcription, post-meet feedback (see ADR-025 / architecture-evolution.md).
 */

import type { Lead } from '@/lib/services/leads.service';

/**
 * Les 7 stades du pipeline d'affaires (kanban closer, session du 2026-08-09).
 * Miroir exact de la contrainte `deals.stage` de la migration cible — voir
 * `docs/architecture-evolution.md`. Ce type ne doit jamais être redéclaré
 * ailleurs : il s'importe d'ici.
 */
export type DealStage =
  | 'opportunite'
  | 'programme'
  | 'a_reprogrammer'
  | 'a_relancer'
  | 'close'
  | 'paye'
  | 'perdu';

/** Libellés français des stades — source unique, aucun composant n'a le droit d'en dupliquer. */
export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  opportunite: 'Opportunité',
  programme: 'Programmé',
  a_reprogrammer: 'Reprogrammer',
  a_relancer: 'Relancer',
  close: 'Closé',
  paye: 'Payé',
  perdu: 'Perdu',
};

/** Ordre d'affichage imposé des colonnes du kanban (Nacer, session du 2026-08-09). */
export const DEAL_STAGE_ORDER: DealStage[] = [
  'opportunite',
  'programme',
  'a_reprogrammer',
  'a_relancer',
  'close',
  'paye',
  'perdu',
];

/** Stades "parking" — une carte qui y entre mémorise le stade quitté dans `previous_stage`. */
export const PARKING_STAGES: readonly DealStage[] = ['a_reprogrammer', 'a_relancer'];

/** Garde-fou runtime : le schéma cible n'est pas encore appliqué en base, donc rien ne garantit qu'un `stage` lu soit valide. */
export function isDealStage(value: string): value is DealStage {
  return (DEAL_STAGE_ORDER as string[]).includes(value);
}

/**
 * Calcule le prochain `previous_stage` d'un deal déplacé dans le kanban.
 *
 * Règle (Nacer, 2026-08-09) : au dépôt dans une colonne parking, on mémorise
 * le stade quitté ; au dépôt hors parking, on efface la mémoire.
 *
 * Décision de conception : si la carte se déplace *entre* les deux colonnes
 * parking (a_relancer <-> a_reprogrammer), on NE réécrit PAS previous_stage
 * avec l'autre stade parking — on préserve le stade opérationnel déjà mémorisé,
 * sinon un aller-retour entre les deux colonnes parking effacerait le souvenir
 * du stade d'origine (opportunite/programme/close/paye/perdu).
 */
export function computeNextPreviousStage(
  sourceStage: DealStage,
  currentPreviousStage: DealStage | null,
  destinationStage: DealStage
): DealStage | null {
  if (!PARKING_STAGES.includes(destinationStage)) return null;
  if (PARKING_STAGES.includes(sourceStage)) return currentPreviousStage;
  return sourceStage;
}

/** Formate un montant en centimes pour affichage fr-FR, en gérant l'absence de montant. */
export function formatAmountCents(amountCents: number | null, currency: string): string {
  if (amountCents === null) return 'Non renseigné';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(
    amountCents / 100
  );
}

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
  /** Nullable depuis la migration cible du 2026-08-09 — une opportunité peut ne pas encore avoir de montant chiffré. */
  amount_cents: number | null;
  currency: string;
  stage: DealStage;
  /** Stade quitté quand la carte part en `a_relancer` ou `a_reprogrammer` (voir computeNextPreviousStage). */
  previous_stage: DealStage | null;
  created_at: string;
}

/** Sous-ensemble de Lead nécessaire à l'affichage d'une carte kanban — dénormalisé par l'adapter via jointure. */
export type DealCardLead = Pick<
  Lead,
  | 'id'
  | 'full_name'
  | 'email'
  | 'phone'
  | 'score'
  | 'source'
  | 'created_at'
  | 'status'
  | 'owner_id'
  | 'qualification'
  | 'temperature_override'
>;

/** Une carte du pipeline d'affaires : un deal, augmenté du lead auquel il appartient. */
export interface DealWithLead extends Deal {
  lead: DealCardLead;
}

export interface MeetService {
  /** Submit a booking through the secure (rate-limited, validated) backend. */
  submitBooking(payload: BookingSubmission): Promise<BookingResult>;
  /** Deals attached to a lead, newest first. */
  listDealsForLead(leadId: string): Promise<Deal[]>;
  /** Tous les deals des leads possédés par ce closer, avec le lead dénormalisé (pipeline kanban). */
  listForCloser(ownerId: string): Promise<DealWithLead[]>;
  /** Déplace un deal vers un nouveau stade, en fixant explicitement previous_stage (cf computeNextPreviousStage). */
  updateStage(
    dealId: string,
    patch: { stage: DealStage; previousStage: DealStage | null }
  ): Promise<void>;
}

import { supabaseMeetAdapter } from '@/lib/adapters/supabase/meet.supabase';

export const meetService: MeetService = supabaseMeetAdapter;
