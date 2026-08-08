# ⚡ Proton ANK - Démarrage Rapide

Guide ultra-rapide pour démarrer avec Proton ANK en 5 minutes.

## 🎯 Objectif

Avoir un **CRM augmenté par IA** avec assistant intelligent en darija pour vos closers.

## 📦 Installation en 5 étapes

### 1️⃣ Backend Python (2 min)

```bash
cd proton-ank-backend
python setup.py
```

Le script d'installation va:
- ✅ Créer l'environnement virtuel
- ✅ Installer les dépendances
- ✅ Configurer le fichier .env
- ✅ Vérifier CUDA

### 2️⃣ Configurer Nemotron (1 min)

Éditez `proton-ank-backend/.env`:

```env
MODEL_NAME=nvidia/Nemotron-H-8B-Reasoning
MODEL_PATH=/chemin/vers/votre/modele/nemotron
DEVICE=cuda  # ou cpu
PORT=8001
```

> **Note:** Si vous n'avez pas encore téléchargé Nemotron, le modèle sera téléchargé automatiquement au premier démarrage (cela peut prendre du temps selon votre connexion).

### 3️⃣ Démarrer le backend (30 sec)

**Windows:**
```bash
cd proton-ank-backend
venv\Scripts\activate
python main.py
```

**Linux/Mac:**
```bash
cd proton-ank-backend
source venv/bin/activate
python main.py
```

Attendez de voir:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
Modèle chargé avec succès!
```

✅ Backend prêt sur `http://localhost:8001`

### 4️⃣ Tester l'API (30 sec)

Ouvrez votre navigateur: `http://localhost:8001/docs`

Ou testez avec curl:
```bash
curl http://localhost:8001/health
```

Réponse attendue:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cuda"
}
```

### 5️⃣ Démarrer le frontend (1 min)

**Nouveau terminal:**
```bash
cd the-ultimate-closers
npm install  # Si pas déjà fait
npm run dev
```

Frontend disponible sur `http://localhost:8080`

---

## ✨ Tester les fonctionnalités

### Test 1: Générer une suggestion

Dans l'API docs (`http://localhost:8001/docs`), essayez `/generate`:

```json
{
  "prompt": "Comment répondre à un lead qui dit que c'est trop cher ?",
  "mode": "acquisition",
  "language": "darija",
  "temperature": 0.7
}
```

### Test 2: Scorer un lead

Essayez `/score-lead`:

```json
{
  "lead_data": {
    "name": "Ahmed Benali",
    "company": "StartupTech DZ",
    "annual_revenue": 150000,
    "industry": "tech",
    "goals": "Doubler le CA en 6 mois"
  },
  "interaction_history": []
}
```

Vous obtiendrez:
- Scores détaillés (intent, fit, engagement, urgency, risk)
- Insights actionnables
- Profil psychologique
- Actions recommandées

---

## 🎨 Utiliser dans votre CRM

### Option A: Composant Assistant Standalone

```typescript
import { ProtonANKAssistant } from '@/components/closer/ProtonANKAssistant';

function MyPage() {
  return (
    <ProtonANKAssistant
      leadData={currentLead}
      interactions={leadInteractions}
    />
  );
}
```

### Option B: Composant Scoring Standalone

```typescript
import { ProtonANKLeadScoring } from '@/components/closer/ProtonANKLeadScoring';

function LeadDetail({ lead }) {
  return (
    <ProtonANKLeadScoring
      leadData={lead}
      interactions={lead.interactions}
      autoScore={true}
    />
  );
}
```

### Option C: Hooks personnalisés

```typescript
import { useProtonANK, useLeadScoring } from '@/hooks/useProtonANK';

function MyComponent() {
  const { generate, isLoading } = useProtonANK();
  const { scoreLead, scoringResult } = useLeadScoring();

  const handleAskAI = async () => {
    const response = await generate({
      prompt: "Ma question",
      mode: "acquisition"
    });
    console.log(response);
  };

  return <button onClick={handleAskAI}>Demander à l'IA</button>;
}
```

---

## 🚀 Intégration au Dashboard Closer

### Méthode 1: Sidebar (Recommandé)

Éditez `src/pages/CloserDashboard.tsx`:

```typescript
<div className="grid grid-cols-4 gap-4">
  {/* Kanban principal */}
  <div className="col-span-3">
    <KanbanBoard />
  </div>

  {/* Assistant IA */}
  <div className="col-span-1">
    <ProtonANKAssistant
      leadData={selectedLead}
      interactions={interactions}
    />
  </div>
</div>
```

### Méthode 2: Modal/Dialog

```typescript
import { Dialog, DialogContent } from '@/components/ui/dialog';

<Dialog open={showAI} onOpenChange={setShowAI}>
  <DialogContent className="max-w-3xl">
    <ProtonANKAssistant leadData={lead} />
  </DialogContent>
</Dialog>

<Button onClick={() => setShowAI(true)}>
  🧠 Demander à l'IA
</Button>
```

### Méthode 3: Onglets dans Lead Detail

```typescript
<Tabs>
  <TabsTrigger value="info">Info</TabsTrigger>
  <TabsTrigger value="ai">🧠 IA</TabsTrigger>

  <TabsContent value="ai">
    <ProtonANKAssistant leadData={lead} />
    <ProtonANKLeadScoring leadData={lead} autoScore />
  </TabsContent>
</Tabs>
```

---

## 🎓 Exemples d'utilisation

### Exemple 1: Obtenir une suggestion de closing

**Situation:** Lead hésite sur le prix

```typescript
const { generate } = useProtonANK();

const response = await generate({
  prompt: "Le lead trouve ça trop cher. Comment justifier la valeur ?",
  context: `Lead: ${lead.name}, Secteur: ${lead.industry}, Budget: ${lead.budget}`,
  mode: "acquisition",
  language: "darija"
});

// Réponse en darija avec techniques de persuasion
console.log(response.response);
```

### Exemple 2: Analyser le profil psychologique

```typescript
const { analyzeLeadPsychology } = usePsychologicalAnalysis();

const analysis = await analyzeLeadPsychology(lead, interactions);

// Retourne:
// - Type de décideur (analytique, émotionnel)
// - Motivations principales
// - Biais cognitifs exploitables
// - Stratégie de persuasion recommandée
```

### Exemple 3: Générer un email de suivi

```typescript
const { generateEmail } = useEmailGenerator();

const email = await generateEmail(
  lead,
  'follow_up',  // ou 'first_contact', 'proposal', 'closing'
  'Après notre call de ce matin'
);

// Copier dans votre client email
await navigator.clipboard.writeText(email);
```

---

## 🎯 Cas d'usage par spécialisation

### 1. Acquisition (mode: "acquisition")

**Utiliser pour:**
- Qualifier un lead
- Surmonter une objection
- Identifier les signaux d'achat
- Closer un deal
- Rédiger des scripts de vente

**Exemple:**
```
Prompt: "Lead dit qu'il doit réfléchir. Que faire ?"
Réponse: "واش تعرف، 'je dois réfléchir' غالبا يعني عندو objection مخبية..."
```

### 2. Psychologie (mode: "psychologie")

**Utiliser pour:**
- Comprendre les motivations du lead
- Détecter les biais cognitifs
- Adapter la stratégie de communication
- Prédire les objections
- Choisir le bon angle d'influence

**Exemple:**
```
Prompt: "Analyser: CEO, 55 ans, industrie traditionnelle, risk-averse"
Réponse: "Profil analytique conservateur. Levier: sécurité et ROI prouvé..."
```

### 3. Structuration (mode: "structuration")

**Utiliser pour:**
- Optimiser le processus de vente
- Créer des playbooks
- Structurer les équipes
- Améliorer la conversion
- Analyser les metrics

**Exemple:**
```
Prompt: "Comment améliorer notre taux de conversion lead → deal ?"
Réponse: "1. Qualifier plus tôt, 2. Nurturing automatisé, 3. Multi-touch..."
```

### 4. Scoring (mode: "scoring")

**Utiliser pour:**
- Prioriser les leads
- Prédire la conversion
- Identifier les leads chauds
- Allouer les ressources
- Mesurer le fit

**Automatique via:** `<ProtonANKLeadScoring autoScore />`

---

## 📊 Interpréter les scores

### Score Global (Overall Score)

- **80-100**: 🔥 Lead chaud - Closer immédiatement
- **60-79**: 👍 Bon lead - Engager activement
- **40-59**: 😐 Lead tiède - Nurturing requis
- **0-39**: ❄️ Lead froid - Requalifier ou disqualifier

### Scores détaillés

1. **Intent Score** (Intention d'achat)
   - Mesure la volonté d'acheter maintenant
   - Indicateurs: urgence, budget, timing

2. **Fit Score** (Adéquation produit/besoin)
   - Mesure à quel point votre solution convient
   - Indicateurs: secteur, taille, problèmes

3. **Engagement Score** (Niveau d'engagement)
   - Mesure l'intérêt et l'implication
   - Indicateurs: interactions, réponses, questions

4. **Urgency Score** (Urgence de décision)
   - Mesure la pression temporelle
   - Indicateurs: deadline, douleur, événements

5. **Risk Score** (Risque de perte)
   - Mesure la probabilité de perdre le deal
   - Indicateurs: concurrence, hésitations, objections

---

## 🔥 Conseils Pro

### ✅ Bonnes pratiques

1. **Contexte riche**: Plus vous donnez de contexte, meilleures sont les réponses
2. **Feedback régulier**: Likez les bonnes réponses pour améliorer le modèle
3. **Température ajustée**:
   - 0.3-0.5 pour du factuel (scoring, analyse)
   - 0.6-0.8 pour de la créativité (suggestions, emails)
4. **Combiner les modes**: Utiliser psychologie + acquisition ensemble
5. **Itérer**: Si la réponse n'est pas bonne, reformulez la question

### ❌ À éviter

1. Questions trop vagues: "Comment vendre ?" → "Comment closer un CEO risk-averse ?"
2. Pas de contexte: Toujours donner le secteur, la taille, les objectifs du lead
3. Ignorer les suggestions: L'IA est une aide, pas un remplacement de votre expertise
4. Ne pas donner de feedback: Likez/dislikez pour améliorer le système

---

## 🐛 Problèmes courants

### "Proton ANK non disponible"

```bash
# Vérifier que le backend tourne
curl http://localhost:8001/health

# Si non, redémarrer
cd proton-ank-backend
python main.py
```

### Réponses trop lentes

```env
# Réduire max_tokens dans la requête
max_tokens: 300  # au lieu de 500

# Ou utiliser un GPU
DEVICE=cuda
```

### Modèle ne se charge pas

```bash
# Vérifier les logs
tail -f proton-ank-backend/app.log

# Vérifier l'espace disque (modèle = 16GB+)
df -h
```

---

## 📚 Documentation complète

- **Guide complet**: `PROTON_ANK_GUIDE.md`
- **Récapitulatif**: `PROTON_ANK_INTEGRATION_RECAP.md`
- **Backend README**: `proton-ank-backend/README.md`

---

## 🎉 C'est parti !

Vous êtes maintenant prêt à utiliser Proton ANK !

**Prochain objectif:** Former vos closers et commencer à collecter des feedbacks pour améliorer le modèle.

Bon closing! 🚀
