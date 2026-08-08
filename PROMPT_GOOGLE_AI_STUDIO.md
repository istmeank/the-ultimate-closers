# 🚀 Prompt pour reproduire "The Ultimate Closers" sur Google AI Studio

## Contexte du Projet

Crée un système CRM complet appelé **"The Ultimate Closers"** - une plateforme SaaS pour les équipes de vente avec intégration d'un LLM propriétaire appelé **Proton ANK** basé sur Nemotron H 8B Reasoning.

## Architecture Globale

### Stack Technique

**Backend:**
- Python 3.9+ avec FastAPI
- API REST pour le LLM Proton ANK
- PyTorch + Transformers (Hugging Face)
- Modèle: Nemotron H 8B Reasoning (nvidia/Nemotron-H-8B-Reasoning)
- Uvicorn comme serveur ASGI

**Frontend:**
- React 18 avec TypeScript
- Vite comme build tool
- Tailwind CSS + shadcn/ui pour l'UI
- React Router pour la navigation
- React Query pour la gestion d'état serveur
- Supabase pour l'authentification et la base de données

**Base de données:**
- Supabase (PostgreSQL)
- Authentification Supabase
- Edge Functions pour les opérations serveur

## Fonctionnalités Principales

### 1. Système d'Authentification
- Authentification Supabase (email/password)
- Rôles: Admin, Closer, Lead
- Gestion des sessions
- Routes protégées par rôle

### 2. Dashboard Closer
- Kanban board pour gérer les leads (To Do, In Progress, Qualified, Closed)
- Vue liste des leads avec filtres
- Détail de chaque lead avec historique
- Intégration Google Calendar pour les rendez-vous
- Intégration HubSpot pour la synchronisation
- Intégration Slack pour les notifications

### 3. Proton ANK - LLM Propriétaire

**Backend API (FastAPI):**

Crée un fichier `proton-ank-backend/main.py` avec:

```python
# API FastAPI avec endpoints:
# - GET /health : Vérification de santé
# - POST /generate : Génération de texte avec le LLM
# - POST /score-lead : Scoring intelligent de leads
# - GET /prompts : Liste des prompts système

# Modes spécialisés:
# - acquisition: Acquisition de clients et closing
# - structuration: Organisation d'entreprise
# - psychologie: Analyse psychologique cognitive-comportementale
# - scoring: Scoring prédictif de leads

# Support multilingue:
# - darija (dialecte maghrébin)
# - français
# - arabe
```

**Prompts système à implémenter:**

1. **Mode Acquisition:**
```
أنت خبير في اكتساب العملاء (acquisition de clients).
Tu parles couramment le darija (الدارجة المغربية) et tu aides les closers à:
- Qualifier les leads
- Identifier les signaux d'achat
- Adapter la stratégie de vente
- Surmonter les objections

Réponds de manière concise et actionnable.
```

2. **Mode Structuration:**
```
Vous êtes consultant expert en structuration d'entreprise.
Vous aidez à:
- Optimiser les processus de vente
- Structurer les équipes commerciales
- Créer des pipelines efficaces
- Améliorer la conversion

Soyez pragmatique et orienté résultats.
```

3. **Mode Psychologie:**
```
Tu es psychologue spécialisé en cognition et comportement.
Tu analyses les profils clients pour:
- Identifier les motivations profondes
- Détecter les biais cognitifs exploitables
- Suggérer des techniques d'influence éthiques
- Prédire les comportements d'achat

Basez vos analyses sur la psychologie scientifique.
```

4. **Mode Scoring:**
```
Vous êtes un système d'analyse prédictive de leads.
Évaluez chaque lead selon:
- Intent score (0-100): Intention d'achat
- Fit score (0-100): Adéquation produit/besoin
- Engagement score (0-100): Niveau d'engagement
- Urgency score (0-100): Urgence de la décision
- Risk score (0-100): Risque de perdre le deal

Justifiez chaque score avec des insights actionnables.
```

**Structure des réponses API:**

```typescript
// POST /generate
interface ProtonANKResponse {
  response: string;
  mode: string;
  confidence: number;
  tokens_used: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

// POST /score-lead
interface LeadScoringResponse {
  intent_score: number; // 0-100
  fit_score: number; // 0-100
  engagement_score: number; // 0-100
  urgency_score: number; // 0-100
  risk_score: number; // 0-100
  overall_score: number; // 0-100
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

### 4. Service Client TypeScript

Crée `src/lib/proton-ank.ts` avec une classe `ProtonANKService` qui expose:

- `healthCheck()`: Vérifie la disponibilité du service
- `generate(request)`: Génère une réponse
- `scoreLead(request)`: Score un lead
- `getCloserSuggestion()`: Suggestions en temps réel pour closers
- `analyzeLeadPsychology()`: Analyse psychologique
- `generatePersonalizedEmail()`: Génération d'emails personnalisés
- `identifyBuyingSignals()`: Identification de signaux d'achat

### 5. Hooks React

Crée `src/hooks/useProtonANK.tsx` avec:

- `useProtonANK()`: Hook principal pour génération
- `useLeadScoring()`: Hook pour scoring de leads
- `useCloserAssistant()`: Hook pour suggestions en temps réel
- `usePsychologicalAnalysis()`: Hook pour analyse psychologique
- `useEmailGenerator()`: Hook pour génération d'emails

### 6. Composants React

**ProtonANKAssistant.tsx:**
- Interface pour l'assistant IA en temps réel
- Suggestions pendant les conversations
- Affichage des réponses avec confiance
- Support multilingue (darija, français, arabe)

**ProtonANKLeadScoring.tsx:**
- Affichage visuel des scores (graphiques)
- Insights actionnables
- Profil psychologique du lead
- Actions recommandées

### 7. Intégrations

**Google Calendar:**
- Authentification OAuth2
- Création de rendez-vous
- Synchronisation bidirectionnelle
- Edge Function: `google-calendar-auth`

**HubSpot:**
- Synchronisation des leads
- Import/export de données
- Edge Function: `hubspot-sync`

**Slack:**
- Notifications en temps réel
- Webhooks pour événements
- Configuration par utilisateur

### 8. Base de Données Supabase

**Tables principales:**

```sql
-- Users (géré par Supabase Auth)
-- Profiles avec rôles: admin, closer, lead

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  phone TEXT,
  status TEXT, -- 'to_do', 'in_progress', 'qualified', 'closed'
  score INTEGER, -- Score Proton ANK
  closer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Interactions
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id),
  type TEXT, -- 'call', 'email', 'meeting', 'note'
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scoring History
CREATE TABLE scoring_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id),
  intent_score INTEGER,
  fit_score INTEGER,
  engagement_score INTEGER,
  urgency_score INTEGER,
  risk_score INTEGER,
  overall_score INTEGER,
  insights JSONB,
  psychological_profile JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 9. Pages Frontend

**Routes principales:**
- `/`: Page d'accueil avec présentation
- `/auth`: Authentification (login/signup)
- `/admin`: Dashboard admin (gestion utilisateurs, analytics)
- `/closer`: Dashboard closer (kanban, leads)
- `/closer/leads`: Liste des leads
- `/closer/leads/:id`: Détail d'un lead avec Proton ANK
- `/closer/profile`: Profil du closer
- `/closer/settings`: Paramètres (Google Calendar, HubSpot, Slack)
- `/book-call`: Page publique pour réserver un appel

### 10. UI/UX

**Design System:**
- Utilise shadcn/ui pour les composants
- Thème sombre/clair avec next-themes
- Responsive design (mobile-first)
- Animations avec framer-motion
- Icons avec lucide-react

**Composants clés:**
- Kanban board avec drag & drop (@hello-pangea/dnd)
- Tableaux de données avec filtres
- Graphiques avec recharts
- Formulaires avec react-hook-form + zod
- Toasts pour notifications
- Modals et dialogs

### 11. Sécurité

- Row Level Security (RLS) sur Supabase
- Validation des inputs avec Pydantic (backend) et Zod (frontend)
- CORS configuré pour les origins autorisées
- Authentification JWT via Supabase
- Protection des routes par rôle

### 12. Configuration

**Backend (.env):**
```env
MODEL_NAME=nvidia/Nemotron-H-8B-Reasoning
HOST=0.0.0.0
PORT=8001
DEVICE=cuda  # ou cpu
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173
```

**Frontend (.env.local):**
```env
VITE_PROTON_ANK_API_URL=http://localhost:8001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Structure des Fichiers

```
the-ultimate-closers/
├── proton-ank-backend/
│   ├── main.py              # API FastAPI
│   ├── requirements.txt     # Dépendances Python
│   └── README.md
│
├── src/
│   ├── lib/
│   │   └── proton-ank.ts   # Service client TypeScript
│   ├── hooks/
│   │   └── useProtonANK.tsx # Hooks React
│   ├── components/
│   │   ├── closer/
│   │   │   ├── ProtonANKAssistant.tsx
│   │   │   └── ProtonANKLeadScoring.tsx
│   │   └── admin/
│   │       └── CloserDashboard.tsx
│   ├── pages/
│   │   ├── DashboardCloser.tsx
│   │   ├── LeadDetail.tsx
│   │   └── ...
│   └── integrations/
│       └── supabase/
│           ├── client.ts
│           └── types.ts
│
├── supabase/
│   ├── migrations/          # Migrations SQL
│   └── functions/           # Edge Functions
│
├── package.json
└── README.md
```

## Fonctionnalités Avancées à Implémenter

1. **Scoring Intelligent:**
   - Analyse automatique des leads
   - Scoring basé sur l'historique d'interactions
   - Prédiction de probabilité de closing

2. **Suggestions en Temps Réel:**
   - Assistant IA pendant les conversations
   - Suggestions contextuelles basées sur le profil du lead
   - Détection automatique des signaux d'achat

3. **Génération de Contenu:**
   - Emails personnalisés
   - Scripts de conversation
   - Propositions commerciales

4. **Analytics:**
   - Dashboard avec métriques de performance
   - Graphiques de conversion
   - Analyse des tendances

5. **Multilingue:**
   - Support darija (dialecte maghrébin)
   - Support français
   - Support arabe standard

## Instructions de Développement

1. **Backend:**
   - Créer environnement virtuel Python
   - Installer dépendances: `pip install -r requirements.txt`
   - Configurer variables d'environnement
   - Lancer: `python main.py` (sur port 8001)

2. **Frontend:**
   - Installer dépendances: `npm install`
   - Configurer `.env.local`
   - Lancer: `npm run dev` (sur port 5173)

3. **Base de données:**
   - Configurer projet Supabase
   - Exécuter migrations SQL
   - Configurer RLS policies
   - Créer Edge Functions

## Points d'Attention

- Le modèle Nemotron nécessite un GPU pour de bonnes performances (CUDA)
- Mode CPU possible mais très lent (pour développement uniquement)
- Le backend peut fonctionner en mode mock si le modèle n'est pas chargé
- Gérer les erreurs gracieusement (fallback si Proton ANK indisponible)
- Implémenter rate limiting en production
- Ajouter logging structuré
- Mettre en cache les réponses fréquentes (Redis recommandé)

## Résultat Attendu

Un système CRM complet avec:
- Interface moderne et responsive
- Authentification sécurisée
- Gestion de leads avec kanban
- Intégration LLM pour assistance IA
- Scoring intelligent de leads
- Intégrations tierces (Google Calendar, HubSpot, Slack)
- Support multilingue (darija, français, arabe)
- Analytics et reporting

---

**Note:** Ce prompt est conçu pour être utilisé avec Google AI Studio (Gemini) ou tout autre assistant IA capable de générer du code complet. Adapte les détails selon les capacités spécifiques de l'outil utilisé.

