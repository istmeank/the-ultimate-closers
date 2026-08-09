-- TUC — jeu de démonstration « PERCEPTION »
-- Date : 2026-08-09
--
-- À exécuter dans Supabase → SQL Editor, sur le projet llxgyomevketvypusafl.
-- Données entièrement fictives. Les adresses utilisent le domaine réservé `exemple.test`,
-- qui n'est routable nulle part : aucun message ne pourra partir vers ces contacts.
-- La requête de purge est fournie en fin de fichier.
--
-- Ce que ce jeu couvre :
--   - les 7 stades du pipeline d'affaires (ADR-040), une carte par colonne
--   - les 3 qualifications : non évalué, qualifié, non qualifié (ADR-042)
--   - les 3 températures dérivées du score : froid < 40, tiède 40-69, chaud >= 70
--   - un cas de surcharge manuelle (Leïla : score tiède, forcée à « chaud »)
--   - une affaire sans montant, au stade « opportunite » (amount_cents nullable)
--   - `previous_stage` renseigné sur les deux colonnes d'attente
--   - deux rendez-vous, qui déclencheront les triggers T05 et rempliront la timeline

BEGIN;

-- enforce_lead_owner() force owner_id = auth.uid() pour les non-admin. Exécuté depuis
-- l'éditeur SQL, auth.uid() est NULL et les leads seraient orphelins — invisibles dans
-- le kanban. On se présente donc sous l'identité du compte fondateur, qui est owner :
-- le trigger le reconnaît et laisse owner_id tel quel. Aucun trigger n'est désactivé.
SET LOCAL request.jwt.claims = '{"sub":"ecdff951-ae2b-4fc5-82e3-7abe4d012a2d","role":"authenticated"}';

INSERT INTO public.leads
  (id, full_name, email, phone, source, interest, status, owner_id, score, qualification, temperature_override)
VALUES
  ('11111111-1111-4111-8111-000000000001', 'Amine Belkacem', 'amine.belkacem@exemple.test', '+213661000001', 'chatbot',
   'Découverte du programme PERCEPTION', 'new', 'ecdff951-ae2b-4fc5-82e3-7abe4d012a2d', 35, 'non_evalue', NULL),

  ('11111111-1111-4111-8111-000000000002', 'Yasmine Haddad', 'yasmine.haddad@exemple.test', '+213661000002', 'referral',
   'PERCEPTION 12 semaines, recommandée par une amie', 'qualified', 'ecdff951-ae2b-4fc5-82e3-7abe4d012a2d', 78, 'qualifie', NULL),

  ('11111111-1111-4111-8111-000000000003', 'Karim Bouaziz', 'karim.bouaziz@exemple.test', '+213661000003', 'ig',
   'A manqué le premier appel, souhaite replanifier', 'in_progress', 'ecdff951-ae2b-4fc5-82e3-7abe4d012a2d', 62, 'qualifie', NULL),

  ('11111111-1111-4111-8111-000000000004', 'Leïla Mansouri', 'leila.mansouri@exemple.test', '+213661000004', 'audit',
   'Intéressée, sans réponse depuis deux semaines', 'in_progress', 'ecdff951-ae2b-4fc5-82e3-7abe4d012a2d', 45, 'qualifie', 'chaud'),

  ('11111111-1111-4111-8111-000000000005', 'Sofiane Cherif', 'sofiane.cherif@exemple.test', '+213661000005', 'contact',
   'Accord verbal, contrat signé, paiement en attente', 'in_progress', 'ecdff951-ae2b-4fc5-82e3-7abe4d012a2d', 88, 'qualifie', NULL),

  ('11111111-1111-4111-8111-000000000006', 'Nadia Ould-Ali', 'nadia.ould-ali@exemple.test', '+213661000006', 'referral',
   'PERCEPTION individuel, réglé intégralement', 'won', 'ecdff951-ae2b-4fc5-82e3-7abe4d012a2d', 91, 'qualifie', NULL),

  ('11111111-1111-4111-8111-000000000007', 'Rachid Slimani', 'rachid.slimani@exemple.test', '+213661000007', 'ads',
   'Budget hors de portée, hors cible', 'lost', 'ecdff951-ae2b-4fc5-82e3-7abe4d012a2d', 22, 'non_qualifie', NULL);

-- Une affaire par stade. Montants en dinars : amount_cents est en centimes,
-- 18000000 = 180 000,00 DZD.
INSERT INTO public.deals
  (lead_id, offer_name, amount_cents, currency, stage, previous_stage, expected_close_date)
VALUES
  -- Opportunité : née avant tout chiffrage, d'où amount_cents à NULL
  ('11111111-1111-4111-8111-000000000001', 'PERCEPTION — session découverte',      NULL,     'DZD', 'opportunite',    NULL,          NULL),
  ('11111111-1111-4111-8111-000000000002', 'PERCEPTION — programme 12 semaines',   18000000, 'DZD', 'programme',      NULL,          current_date + 14),
  -- Rendez-vous manqué : la carte revient de « programme »
  ('11111111-1111-4111-8111-000000000003', 'PERCEPTION — programme 12 semaines',   18000000, 'DZD', 'a_reprogrammer', 'programme',   current_date + 21),
  -- Relance : la carte revient de « opportunite »
  ('11111111-1111-4111-8111-000000000004', 'PERCEPTION — accompagnement individuel', 32000000, 'DZD', 'a_relancer',   'opportunite', current_date + 30),
  ('11111111-1111-4111-8111-000000000005', 'PERCEPTION — accompagnement individuel', 32000000, 'DZD', 'close',        NULL,          current_date + 7),
  ('11111111-1111-4111-8111-000000000006', 'PERCEPTION — accompagnement individuel', 32000000, 'DZD', 'paye',         NULL,          current_date - 3),
  ('11111111-1111-4111-8111-000000000007', 'PERCEPTION — programme 12 semaines',   18000000, 'DZD', 'perdu',          NULL,          NULL);

-- Deux rendez-vous : ils déclenchent log_appointment_as_interaction() et écrivent
-- les premières lignes de la timeline, avec start_at brut dans metadata.
INSERT INTO public.appointments (lead_id, assigned_to, start_at, end_at, channel, status)
VALUES
  ('11111111-1111-4111-8111-000000000002', 'ecdff951-ae2b-4fc5-82e3-7abe4d012a2d',
   now() + interval '2 days',  now() + interval '2 days 45 minutes',  'meet',     'booked'),
  ('11111111-1111-4111-8111-000000000003', 'ecdff951-ae2b-4fc5-82e3-7abe4d012a2d',
   now() - interval '1 day',   now() - interval '1 day' + interval '30 minutes', 'whatsapp', 'no_show');

COMMIT;

-- ---------------------------------------------------------------------------
-- Vérification
-- ---------------------------------------------------------------------------

-- Le pipeline, colonne par colonne
SELECT d.stage, d.previous_stage, l.full_name, l.qualification, l.score,
       coalesce(l.temperature_override, CASE WHEN l.score >= 70 THEN 'chaud'
                                             WHEN l.score >= 40 THEN 'tiede'
                                             ELSE 'froid' END) AS temperature_effective,
       d.amount_cents, d.currency
FROM public.deals d
JOIN public.leads l ON l.id = d.lead_id
ORDER BY d.stage;

-- La timeline écrite par les triggers : content court, metadata structurée
SELECT i.type, i.content, i.metadata
FROM public.interactions i
ORDER BY i.created_at DESC;

-- ---------------------------------------------------------------------------
-- Purge — à exécuter pour effacer entièrement le jeu de démonstration
-- ---------------------------------------------------------------------------
-- DELETE FROM public.leads WHERE email LIKE '%@exemple.test';
-- Les deals, rendez-vous et interactions partent avec, par cascade sur lead_id.
