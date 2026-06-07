# 🎯 Prompt Concis pour Google AI Studio

## Objectif

Crée un CRM SaaS complet "The Ultimate Closers" avec intégration LLM Proton ANK (basé sur Nemotron H 8B).

## Stack

**Backend:** FastAPI + Python + PyTorch + Transformers (Nemotron H 8B)
**Frontend:** React 18 + TypeScript + Vite + Tailwind + shadcn/ui
**DB:** Supabase (PostgreSQL + Auth)

## Fonctionnalités Clés

### 1. Backend API (FastAPI)

Fichier: `proton-ank-backend/main.py`

```python
# Endpoints:
# GET /health
# POST /generate → Génération texte LLM
# POST /score-lead → Scoring intelligent leads
# GET /prompts

# Modes: acquisition, structuration, psychologie, scoring
# Langues: darija, français, arabe
```

**Prompts système:**
- **acquisition:** Expert closing, support darija, qualification leads, signaux d'achat
- **structuration:** Consultant processus commerciaux, optimisation équipes
- **psychologie:** Analyse cognitive-comportementale, biais, motivations
- **scoring:** Scoring prédictif (intent, fit, engagement, urgency, risk)

### 2. Frontend React

**Service client:** `src/lib/proton-ank.ts`
- Classe `ProtonANKService` avec méthodes: `generate()`, `scoreLead()`, `getCloserSuggestion()`, `analyzeLeadPsychology()`, `generatePersonalizedEmail()`

**Hooks:** `src/hooks/useProtonANK.tsx`
- `useProtonANK()`, `useLeadScoring()`, `useCloserAssistant()`, `usePsychologicalAnalysis()`, `useEmailGenerator()`

**Composants:**
- `ProtonANKAssistant.tsx`: Interface assistant IA temps réel
- `ProtonANKLeadScoring.tsx`: Affichage scores + insights + profil psychologique

### 3. Dashboard Closer

- Kanban board (drag & drop): To Do → In Progress → Qualified → Closed
- Liste leads avec filtres
- Détail lead: historique + scoring Proton ANK + suggestions IA
- Intégrations: Google Calendar, HubSpot, Slack

### 4. Base de Données

**Tables Supabase:**
- `leads`: id, name, email, company, status, score, closer_id
- `interactions`: lead_id, type, content, created_at
- `scoring_history`: lead_id, scores (intent/fit/engagement/urgency/risk), insights, psychological_profile

### 5. Routes Frontend

- `/`: Landing page
- `/auth`: Login/Signup
- `/closer`: Dashboard kanban
- `/closer/leads`: Liste leads
- `/closer/leads/:id`: Détail avec Proton ANK
- `/closer/settings`: Config intégrations
- `/admin`: Dashboard admin

### 6. Types TypeScript

```typescript
interface ProtonANKResponse {
  response: string;
  mode: string;
  confidence: number;
  tokens_used: number;
  timestamp: string;
}

interface LeadScoringResponse {
  intent_score: number; // 0-100
  fit_score: number;
  engagement_score: number;
  urgency_score: number;
  risk_score: number;
  overall_score: number;
  insights: string[];
  recommended_actions: string[];
  psychological_profile: {
    decision_style: string;
    primary_motivation: string;
    objections_prévues: string[];
    levier_influence: string;
    biais_cognitifs: string[];
  };
}
```

## Structure Fichiers

```
proton-ank-backend/
  └── main.py (FastAPI + LLM)

src/
  ├── lib/proton-ank.ts
  ├── hooks/useProtonANK.tsx
  ├── components/closer/
  │   ├── ProtonANKAssistant.tsx
  │   └── ProtonANKLeadScoring.tsx
  └── pages/
      ├── DashboardCloser.tsx
      └── LeadDetail.tsx
```

## Configuration

**Backend .env:**
```
MODEL_NAME=nvidia/Nemotron-H-8B-Reasoning
PORT=8001
DEVICE=cuda
```

**Frontend .env.local:**
```
VITE_PROTON_ANK_API_URL=http://localhost:8001
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Résultat

CRM avec:
- ✅ Authentification Supabase
- ✅ Kanban gestion leads
- ✅ LLM Proton ANK (génération, scoring, suggestions)
- ✅ Support darija/français/arabe
- ✅ Intégrations Google Calendar/HubSpot/Slack
- ✅ UI moderne (shadcn/ui + Tailwind)

---

**Utilise ce prompt dans Google AI Studio pour générer le code complet du projet.**

