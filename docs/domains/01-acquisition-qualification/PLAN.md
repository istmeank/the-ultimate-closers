# DOMAIN 01 — Acquisition & Qualification

## Mission
Capter le prospect, l'enrichir, le scorer, le qualifier. Sortie : prospect prêt à entrer dans le pipeline messagerie.

## Entités principales
- `Lead` (table `leads` existe)
- `LeadScore` (table `lead_scores` existe)
- `Interaction` (table `interactions` existe)
- `Qualification` (à créer ou attribut sur Lead)

## État actuel (audit code existant)
- **Code existant** : `src/pages/CloserLeads.tsx`, `src/pages/LeadDetail.tsx`, `src/components/ChatbotQualif.tsx`, `src/components/ChatbotConversation.tsx`
- **Migrations existantes** : table `leads`, `lead_scores`, `interactions` créées dans migration `20251026162800`
- **Dette** : RLS multiples contradictoires sur `leads` (3 versions), à consolider dans la baseline TUC-v2
- **Manquant** : enrichissement automatique (API enrichissement type Clearbit/Apollo), scoring IA, qualification automatique

## Backlog priorisé
1. **(V1)** Stabilisation RLS leads dans baseline TUC-v2 (owner closer + admin/owner full)
2. **(V2)** Refonte UI `CloserLeads.tsx` (filtres, tri, recherche, statut)
3. **(V2)** Refonte UI `LeadDetail.tsx` (timeline interactions, score, actions rapides)
4. **(V2)** Intégration formulaire externe (Tally / Typeform / formulaire site)
5. **(V3)** Scoring IA basé sur signaux conversationnels
6. **(V3)** Qualification automatique (cold/warm/hot/disqualified) par règles + IA
7. **(V4)** Enrichissement automatique (recherche d'entreprise via API tierce)

## Risques spécifiques
- RLS mal faite = fuite leads entre closers (CRITIQUE).
- Formulaire public = vecteur de spam (rate limiting obligatoire).
- Enrichissement = coût API + compliance RGPD (consentement explicite).

## Skills nécessaires
- `.claude/skills/supabase-auth-rls/` (pour RLS leads)
- `.claude/skills/react-shadcn-patterns/` (à créer V2)
- `.claude/skills/lead-scoring-strategies/` (à créer V3)

## Agents owner
- Lead : `frontend-react`, `backend-supabase`
- Support : `database-postgres`, `auth-security-rls`, `anthropic-gateway` (V3+)
