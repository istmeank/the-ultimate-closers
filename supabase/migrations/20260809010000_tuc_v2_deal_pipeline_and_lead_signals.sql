-- TUC v2 — Deal pipeline pivot + lead qualification/temperature signals (T06)
-- Date: 2026-08-09
-- Domains: 1. Acquisition & Qualification (leads) · Kanban / pipeline (deals) · Timeline (interactions)
--
-- Context (Nacer, session 2026-08-09): the closer's kanban stops being a lead board and
-- becomes a deal pipeline — one card = one deal, not one lead. Qualification and
-- temperature are human/computed judgments about the *prospect*, not pipeline stages;
-- they move to `leads` and are only *displayed* on the deal card.
--
-- Ordering note: this migration assumes public.interactions.metadata already exists.
-- It is created in T05 (20260809000001_tuc_v2_triggers_log_interactions.sql), which was
-- revised the same session (never applied — see its own header note) specifically so it
-- would run first and hand this migration a ready-made column. Filenames sort
-- alphabetically before being applied by the Supabase CLI, and 20260809000001 <
-- 20260809010000, so the order is guaranteed without a rename.
--
-- What this migration does:
--   a) deals.stage       -> replaces the 5 old values with the 7 pipeline stages.
--   b) deals.previous_stage -> new nullable column, remembers the stage left behind
--                              when a card goes to 'a_relancer' / 'a_reprogrammer'.
--   c) deals.amount_cents   -> becomes nullable (a deal is born unpriced, at 'opportunite').
--   d) leads.qualification  -> new NOT NULL column, human judgment on the prospect.
--   e) leads.temperature_override -> new nullable column, manual override of the
--                                    score-derived temperature.
--   f) interactions.metadata -> already created by T05; see note below on why no GIN
--                                index is added here.
--   g) leads.status is untouched — still present, no longer drives the kanban, its
--      deprecation is a separate decision.

SET lock_timeout = '5s';

-- ---------------------------------------------------------------------------
-- a) deals.stage — 7-value pipeline, replacing the 5-value lead-ish stage list
-- ---------------------------------------------------------------------------

-- Safety guard: this rewrite assumes zero rows (verified 2026-08-09 via
-- `SELECT count(*) FROM public.deals` -> 0, on llxgyomevketvypusafl). If that has
-- changed by the time this migration runs, stop rather than silently drop/corrupt data.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.deals LIMIT 1) THEN
    RAISE EXCEPTION
      'tuc_v2_deal_pipeline_and_lead_signals: public.deals is not empty. '
      'The stage rewrite (7 new values, no data migration written) assumes 0 rows. '
      'Aborting — escalate to database-postgres / Nacer before proceeding.';
  END IF;
END;
$$;

ALTER TABLE public.deals DROP CONSTRAINT IF EXISTS deals_stage_check;
ALTER TABLE public.deals ADD CONSTRAINT deals_stage_check
  CHECK (stage IN ('opportunite','programme','a_reprogrammer','a_relancer','close','paye','perdu'));

ALTER TABLE public.deals ALTER COLUMN stage SET DEFAULT 'opportunite';

COMMENT ON CONSTRAINT deals_stage_check ON public.deals IS
'TUC v2 deal pipeline (T06, 2026-08-09): opportunite -> programme -> close -> paye (happy path), a_reprogrammer/a_relancer as side branches, perdu as terminal loss. Supersedes the T-baseline 5-value lead-shaped stage list (qualified/proposal/negotiation/won/lost); deals table was empty at migration time so no data mapping was needed. French enum values are intentional — the front translates for display, this constraint is the source of truth for what a card''s stage may be.';

-- ---------------------------------------------------------------------------
-- b) deals.previous_stage — remembers where a card came from
-- ---------------------------------------------------------------------------

ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS previous_stage TEXT NULL;

ALTER TABLE public.deals DROP CONSTRAINT IF EXISTS deals_previous_stage_check;
ALTER TABLE public.deals ADD CONSTRAINT deals_previous_stage_check
  CHECK (previous_stage IS NULL OR previous_stage IN ('opportunite','programme','a_reprogrammer','a_relancer','close','paye','perdu'));

COMMENT ON COLUMN public.deals.previous_stage IS
'Stage the card was in right before moving to ''a_relancer'' or ''a_reprogrammer''. Set by the service layer (not a trigger) at the moment of that specific transition, so the UI can offer "revenir a <previous_stage>" instead of forcing the closer to pick a stage from scratch. NULL otherwise (including for cards that have never been through a_relancer/a_reprogrammer, and — deliberately — not cleared automatically when the card later moves elsewhere, so the last known "return point" stays visible for support/debugging; the UI only reads it while stage IN (''a_relancer'',''a_reprogrammer'')).';

-- ---------------------------------------------------------------------------
-- c) deals.amount_cents — nullable: a deal starts at ''opportunite'', unpriced
-- ---------------------------------------------------------------------------

ALTER TABLE public.deals ALTER COLUMN amount_cents DROP NOT NULL;

-- deals_amount_cents_check (CHECK (amount_cents >= 0)) is left as-is: in Postgres a CHECK
-- constraint is satisfied whenever its expression evaluates to NULL rather than FALSE, so
-- "amount_cents >= 0" already lets NULL through — no need to rewrite the constraint to add
-- an explicit "OR amount_cents IS NULL" branch. offer_name stays NOT NULL (unchanged): a
-- deal always names what it's about, even before it has a price.

COMMENT ON COLUMN public.deals.amount_cents IS
'Nullable since T06 (2026-08-09): a deal is created at stage ''opportunite'', before any offer has been priced. NULL means "not yet chiffre", not zero. Still CHECK''d >= 0 whenever it is set (deals_amount_cents_check).';

-- ---------------------------------------------------------------------------
-- d) leads.qualification — human judgment on the prospect
-- ---------------------------------------------------------------------------

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS qualification TEXT NOT NULL DEFAULT 'non_evalue';

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_qualification_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_qualification_check
  CHECK (qualification IN ('non_evalue','qualifie','non_qualifie'));

COMMENT ON COLUMN public.leads.qualification IS
'Human judgment call by the closer/qualifier on the prospect (T06, 2026-08-09) — NOT computed, NOT derived from deals.stage. Defaults to ''non_evalue'' until someone actively marks the prospect ''qualifie'' or ''non_qualifie''. Lives on the lead (one prospect can have several deals over time); displayed as a badge on every deal card for that lead, but the kanban stage no longer encodes it.';

-- ---------------------------------------------------------------------------
-- e) leads.temperature_override — manual override of the score-derived temperature
-- ---------------------------------------------------------------------------

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS temperature_override TEXT NULL;

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_temperature_override_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_temperature_override_check
  CHECK (temperature_override IS NULL OR temperature_override IN ('froid','tiede','chaud'));

COMMENT ON COLUMN public.leads.temperature_override IS
'MANUAL OVERRIDE ONLY — this column is NOT the source of truth for a lead''s temperature. The effective temperature is computed by the services layer from leads.score: froid < 40, tiede 40-69, chaud >= 70. temperature_override exists purely so a closer can force a different value when they have context the score does not (e.g. a ''chaud'' score but the prospect just went cold on a call). NULL (the default) means "trust the score-derived value". Any read path that needs "the" temperature must apply this override on top of the score computation, in application code — do not read this column alone and do not read leads.score alone.';

-- ---------------------------------------------------------------------------
-- f) interactions.metadata — already created in T05, not recreated here
-- ---------------------------------------------------------------------------

-- interactions.metadata JSONB NOT NULL DEFAULT '{}'::jsonb was moved into
-- 20260809000001_tuc_v2_triggers_log_interactions.sql (T05) precisely so that migration,
-- which now writes into metadata, does not depend on a later file. See this migration's
-- header note for the ordering rationale.
--
-- No GIN index is added on interactions.metadata here. Reasoning:
--   - interactions is read almost exclusively "by lead_id, ORDER BY created_at DESC"
--     (the lead timeline) — both already covered by idx_interactions_lead_id and
--     idx_interactions_created_at. No product surface today queries interactions BY
--     metadata content (e.g. "find all deal_created entries across leads").
--   - interactions is an append-only audit trail written by triggers on every
--     appointment/deal insert; a GIN index adds write amplification on every one of
--     those inserts for a read pattern that does not exist yet.
--   - If a real need shows up later (e.g. an activity feed filtered by metadata->>'kind'),
--     a targeted B-Tree expression index on (metadata->>'kind') would serve that specific
--     access pattern more cheaply than a general GIN index over the whole jsonb blob.
--     Revisit then, with the actual query in hand.
