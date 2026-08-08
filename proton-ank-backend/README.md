# 🚀 Proton ANK Backend

API backend pour le LLM propriétaire Proton ANK basé sur Nemotron H 8b Reasoning.

## 🎯 Spécialisations

- **Acquisition de clients**: Qualification, scoring, stratégies de closing
- **Structuration d'entreprise**: Optimisation des processus commerciaux
- **Psychologie cognitive-comportementale**: Analyse des profils et motivations
- **Support natif du Darija**: Conversations naturelles en dialecte maghrébin

## 🛠️ Installation

### Prérequis

- Python 3.9+
- CUDA 11.8+ (recommandé pour GPU)
- 16GB+ RAM (32GB+ recommandé)
- Modèle Nemotron H 8b téléchargé

### Setup

```bash
# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Lancer le serveur
python main.py
```

Le serveur démarre sur `http://localhost:8001`

## 📡 API Endpoints

### `GET /`
Informations sur le service

### `GET /health`
Vérification de santé

### `POST /generate`
Génération de réponse avec Proton ANK

**Request:**
```json
{
  "prompt": "Comment qualifier ce lead ?",
  "context": "Lead: startup tech, 50k€ revenus, cherche à scaler",
  "mode": "acquisition",
  "language": "darija",
  "temperature": 0.7,
  "max_tokens": 500
}
```

**Response:**
```json
{
  "response": "هاد الـ lead واعر، عندو potential...",
  "mode": "acquisition",
  "confidence": 0.85,
  "tokens_used": 120,
  "timestamp": "2025-01-07T10:30:00",
  "metadata": {}
}
```

### `POST /score-lead`
Scoring intelligent d'un lead

**Request:**
```json
{
  "lead_data": {
    "name": "Ahmed Benali",
    "company": "TechStartup DZ",
    "annual_revenue": 150000,
    "team_size": 8,
    "industry": "tech",
    "goals": "doubler le CA en 6 mois"
  },
  "interaction_history": [
    {"type": "call", "date": "2025-01-01"},
    {"type": "email", "date": "2025-01-03"}
  ]
}
```

**Response:**
```json
{
  "intent_score": 85,
  "fit_score": 90,
  "engagement_score": 75,
  "urgency_score": 70,
  "risk_score": 20,
  "overall_score": 80,
  "insights": [...],
  "recommended_actions": [...],
  "psychological_profile": {...}
}
```

### `GET /prompts`
Liste des prompts système disponibles

## 🧠 Modes Disponibles

- `acquisition`: Acquisition de clients et closing
- `structuration`: Organisation et processus d'entreprise
- `psychologie`: Analyse psychologique cognitive-comportementale
- `scoring`: Scoring prédictif de leads

## 🌍 Langues Supportées

- `darija`: Darija (dialecte maghrébin)
- `français`: Français
- `arabe`: Arabe standard

## 🔧 Configuration Avancée

### Utilisation avec GPU

Si vous avez un GPU NVIDIA avec CUDA:

```bash
# Vérifier CUDA
python -c "import torch; print(torch.cuda.is_available())"

# Le modèle se chargera automatiquement sur GPU
```

### Mode CPU (développement)

Pour tester sans GPU:

```python
# Dans .env
DEVICE=cpu
```

⚠️ Note: Le mode CPU sera significativement plus lent.

## 📊 Monitoring

Le backend expose des métriques via l'endpoint `/health`:
- Statut du modèle
- Device utilisé (cuda/cpu)
- Timestamp

## 🔐 Sécurité

- CORS configuré pour les origins autorisées uniquement
- Validation des inputs avec Pydantic
- Rate limiting recommandé (à implémenter en production)

## 🚀 Déploiement en Production

### Option 1: Docker (recommandé)

```dockerfile
# Dockerfile à créer
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Option 2: Serveur dédié

- Utiliser gunicorn avec uvicorn workers
- Configurer nginx en reverse proxy
- Monitorer avec Prometheus/Grafana

## 📝 TODO

- [ ] Implémenter le caching des réponses
- [ ] Ajouter rate limiting
- [ ] Métriques détaillées (latence, tokens/s)
- [ ] Fine-tuning continu avec feedback des closers
- [ ] Logging structuré (JSON)
- [ ] Tests unitaires et d'intégration
- [ ] Documentation OpenAPI enrichie

## 🤝 Contributing

Ce système est propriétaire pour "The Ultimate Closers".

## 📄 License

Proprietary - Tous droits réservés
