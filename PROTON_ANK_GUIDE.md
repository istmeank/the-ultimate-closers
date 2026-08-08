# 🧠 Proton ANK - Guide Complet

## 📋 Table des matières

1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Utilisation](#utilisation)
6. [Fine-tuning du modèle](#fine-tuning)
7. [Intégration au CRM](#intégration-crm)
8. [FAQ](#faq)

---

## Introduction

**Proton ANK** est un LLM propriétaire basé sur **Nemotron H 8b Reasoning** spécialement conçu pour "The Ultimate Closers". Il est spécialisé dans :

- ✅ **Acquisition de clients**: Qualification, closing, objections
- ✅ **Structuration d'entreprise**: Optimisation des processus commerciaux
- ✅ **Psychologie cognitive-comportementale**: Analyse des profils de leads
- ✅ **Support natif du Darija** (الدارجة المغربية)

### Fonctionnalités clés

1. **Suggestions en temps réel** pour les closers pendant les conversations
2. **Scoring intelligent** des leads avec analyse prédictive
3. **Analyse psychologique** des profils clients
4. **Génération d'emails** personnalisés
5. **Identification des signaux d'achat**
6. **Apprentissage continu** à partir des interactions

---

## Architecture

```
the-ultimate-closers/
├── proton-ank-backend/          # Backend Python (FastAPI)
│   ├── main.py                  # API principale
│   ├── requirements.txt         # Dépendances Python
│   ├── .env                     # Configuration
│   └── README.md                # Documentation backend
│
├── src/
│   ├── lib/
│   │   └── proton-ank.ts       # Service client TypeScript
│   ├── hooks/
│   │   └── useProtonANK.tsx    # Hooks React
│   └── components/
│       └── closer/
│           ├── ProtonANKAssistant.tsx         # Composant assistant
│           └── ProtonANKLeadScoring.tsx       # Composant scoring
│
└── .env.local                   # Config frontend
```

### Stack technique

**Backend:**
- Python 3.9+
- FastAPI (API REST)
- PyTorch (LLM)
- Transformers (Hugging Face)
- Nemotron H 8b Reasoning

**Frontend:**
- TypeScript
- React 18
- Tailwind CSS
- shadcn/ui
- React Query

---

## Installation

### 1. Backend (API Python)

```bash
cd proton-ank-backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres
```

### 2. Frontend (React)

```bash
# À la racine du projet
npm install

# Configurer l'environnement
# Créer ou éditer .env.local
echo "VITE_PROTON_ANK_API_URL=http://localhost:8001" >> .env.local
```

---

## Configuration

### Backend (.env)

```env
# Modèle
MODEL_NAME=nvidia/Nemotron-H-8B-Reasoning
MODEL_PATH=/path/to/local/model  # Si modèle local

# Serveur
HOST=0.0.0.0
PORT=8001
RELOAD=true

# Hardware
DEVICE=cuda  # ou cpu pour développement

# CORS
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173
```

### Frontend (.env.local)

```env
VITE_PROTON_ANK_API_URL=http://localhost:8001
```

---

## Utilisation

### Démarrer les serveurs

**Terminal 1 - Backend:**
```bash
cd proton-ank-backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Le backend sera disponible sur `http://localhost:8001`
Le frontend sera disponible sur `http://localhost:8080`

### API REST

#### 1. Health Check

```bash
curl http://localhost:8001/health
```

**Réponse:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cuda",
  "timestamp": "2025-01-07T10:30:00"
}
```

#### 2. Génération de texte

```bash
curl -X POST http://localhost:8001/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Comment qualifier ce lead tech ?",
    "context": "Startup SaaS, 100k€ revenus",
    "mode": "acquisition",
    "language": "darija",
    "temperature": 0.7,
    "max_tokens": 500
  }'
```

#### 3. Scoring de lead

```bash
curl -X POST http://localhost:8001/score-lead \
  -H "Content-Type: application/json" \
  -d '{
    "lead_data": {
      "name": "Ahmed Benali",
      "company": "TechStartup DZ",
      "annual_revenue": 150000,
      "team_size": 8,
      "industry": "tech",
      "goals": "doubler le CA en 6 mois"
    },
    "interaction_history": []
  }'
```

### Utilisation dans React

#### 1. Hook de base

```typescript
import { useProtonANK } from '@/hooks/useProtonANK';

function MyComponent() {
  const { isAvailable, isLoading, response, generate } = useProtonANK();

  const handleGenerate = async () => {
    await generate({
      prompt: "Suggère une stratégie de closing",
      mode: "acquisition",
      language: "darija"
    });
  };

  return (
    <div>
      {isAvailable ? "Proton ANK disponible" : "Non disponible"}
      <button onClick={handleGenerate} disabled={isLoading}>
        Générer
      </button>
      {response && <p>{response.response}</p>}
    </div>
  );
}
```

#### 2. Scoring de lead

```typescript
import { useLeadScoring } from '@/hooks/useProtonANK';

function LeadDetail({ lead }) {
  const { scoringResult, scoreLead, isLoading } = useLeadScoring();

  const handleScore = async () => {
    await scoreLead({
      lead_data: lead,
      interaction_history: lead.interactions
    });
  };

  return (
    <div>
      <button onClick={handleScore}>Score ce lead</button>
      {scoringResult && (
        <div>
          <p>Score global: {scoringResult.overall_score}/100</p>
          <p>Style de décision: {scoringResult.psychological_profile.decision_style}</p>
        </div>
      )}
    </div>
  );
}
```

#### 3. Composant Assistant complet

```typescript
import { ProtonANKAssistant } from '@/components/closer/ProtonANKAssistant';

function CloserDashboard({ lead, interactions }) {
  const handleSuggestionApply = (suggestion: string) => {
    console.log('Appliquer:', suggestion);
    // Copier dans un champ de texte, etc.
  };

  return (
    <div>
      <ProtonANKAssistant
        leadData={lead}
        interactions={interactions}
        onSuggestionApply={handleSuggestionApply}
      />
    </div>
  );
}
```

#### 4. Composant Scoring

```typescript
import { ProtonANKLeadScoring } from '@/components/closer/ProtonANKLeadScoring';

function LeadPage({ lead, interactions }) {
  const handleScoreCalculated = (score) => {
    console.log('Score calculé:', score);
    // Sauvegarder en base, afficher notification, etc.
  };

  return (
    <ProtonANKLeadScoring
      leadData={lead}
      interactions={interactions}
      onScoreCalculated={handleScoreCalculated}
      autoScore={true}  // Score automatique au chargement
    />
  );
}
```

---

## Fine-tuning

### Préparer les données d'entraînement

Créez un dataset au format JSONL avec vos données spécifiques :

```json
{"prompt": "Lead hésite sur le prix, comment répondre ?", "completion": "واش تعرف، الثمن هو استثمار في نجاح شركتك..."}
{"prompt": "Analyser ce profil: CEO, 50 ans, industrie traditionnelle", "completion": "Profil décideur analytique, besoin de preuve ROI..."}
```

### Script de fine-tuning

```python
# finetune.py
from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments
from datasets import load_dataset

# Charger le modèle de base
model_name = "nvidia/Nemotron-H-8B-Reasoning"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Charger votre dataset
dataset = load_dataset('json', data_files='training_data.jsonl')

# Configuration du training
training_args = TrainingArguments(
    output_dir="./proton-ank-finetuned",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-5,
    fp16=True,  # Si GPU avec CUDA
    save_steps=500,
    logging_steps=100,
)

# Entraîner
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset['train'],
)

trainer.train()
trainer.save_model("./proton-ank-finetuned")
```

### Utiliser le modèle fine-tuné

Mettez à jour `proton-ank-backend/main.py`:

```python
# Ligne 34
MODEL_NAME = "./proton-ank-finetuned"  # Chemin vers votre modèle
```

---

## Intégration CRM

### 1. Intégration au dashboard Closer

Éditez `src/pages/CloserDashboard.tsx`:

```typescript
import { ProtonANKAssistant } from '@/components/closer/ProtonANKAssistant';

export function CloserDashboard() {
  const { lead, interactions } = useCloserData();

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        {/* Kanban board existant */}
      </div>
      <div className="col-span-1">
        {/* Assistant IA */}
        <ProtonANKAssistant
          leadData={lead}
          interactions={interactions}
        />
      </div>
    </div>
  );
}
```

### 2. Intégration au scoring existant

Remplacez l'ancien système de scoring dans `supabase/functions/score-lead/`:

```typescript
// Appeler Proton ANK au lieu du scoring basique
const response = await fetch('http://localhost:8001/score-lead', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lead_data: lead,
    interaction_history: interactions
  })
});

const scoring = await response.json();
// Sauvegarder dans Supabase
```

### 3. Ajout au détail du lead

Éditez `src/components/closer/LeadDetail.tsx`:

```typescript
import { ProtonANKLeadScoring } from '@/components/closer/ProtonANKLeadScoring';

export function LeadDetail({ lead }) {
  return (
    <Tabs>
      <TabsList>
        <TabsTrigger value="info">Info</TabsTrigger>
        <TabsTrigger value="scoring">Scoring IA</TabsTrigger>
      </TabsList>

      <TabsContent value="scoring">
        <ProtonANKLeadScoring
          leadData={lead}
          interactions={lead.interactions}
          autoScore={true}
        />
      </TabsContent>
    </Tabs>
  );
}
```

---

## FAQ

### Q: Le modèle est trop lent sur CPU, que faire ?

**R:** Utilisez un GPU NVIDIA avec CUDA. Pour tester sans GPU, utilisez un modèle plus petit (3B ou 7B) ou un service cloud comme Hugging Face Inference.

### Q: Comment améliorer la qualité des réponses en darija ?

**R:**
1. Fine-tunez le modèle avec plus de données darija
2. Ajoutez des exemples darija dans les prompts système
3. Utilisez `temperature=0.5-0.7` pour plus de cohérence

### Q: Peut-on déployer en production ?

**R:** Oui ! Utilisez :
- **Docker** pour containeriser le backend
- **Nginx** comme reverse proxy
- **Gunicorn + Uvicorn** pour le serveur Python
- **CDN** (Vercel, Netlify) pour le frontend

### Q: Comment monitorer les performances ?

**R:** Ajoutez des logs et métriques :
```python
import time
start = time.time()
# ... génération ...
latency = time.time() - start
logger.info(f"Latency: {latency}s, Tokens: {tokens_used}")
```

### Q: Le backend ne démarre pas ?

**R:** Vérifiez :
1. Python 3.9+ installé : `python --version`
2. Dépendances installées : `pip list`
3. Port 8001 libre : `lsof -i :8001` (Linux/Mac)
4. Variables d'environnement : `cat .env`

### Q: Comment ajouter une nouvelle spécialisation ?

**R:**
1. Ajoutez un nouveau prompt dans `SYSTEM_PROMPTS` (main.py)
2. Créez un hook React spécifique
3. Ajoutez un onglet dans le composant Assistant

Exemple:
```python
SYSTEM_PROMPTS["negociation"] = """Expert en négociation commerciale..."""
```

---

## Roadmap

- [ ] Cache Redis pour les réponses fréquentes
- [ ] Streaming des réponses (SSE)
- [ ] Fine-tuning automatique avec feedback
- [ ] Support de l'arabe standard
- [ ] Intégration avec HubSpot
- [ ] Dashboard analytics pour Proton ANK
- [ ] A/B testing des prompts
- [ ] Mode multi-modèle (switch Nemotron/GPT)

---

## Support

Pour toute question ou problème :

1. Consultez les logs backend : `tail -f proton-ank-backend/app.log`
2. Vérifiez le health check : `curl http://localhost:8001/health`
3. Testez l'API dans le navigateur : `http://localhost:8001/docs`

---

## License

Proprietary - © 2025 The Ultimate Closers

**Tous droits réservés.**
