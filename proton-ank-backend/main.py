"""
Proton ANK - API Backend
LLM propriétaire basé sur Nemotron H 8b Reasoning
Spécialisé en: acquisition clients, structuration d'entreprise, psychologie cognitive-comportementale
Support natif du darija
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import logging
from datetime import datetime

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Proton ANK API",
    description="LLM propriétaire pour CRM augmenté - Spécialisé en acquisition clients",
    version="1.0.0"
)

# Configuration CORS pour le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration du modèle Nemotron
MODEL_NAME = "nvidia/Nemotron-H-8B-Reasoning"  # Ajuster selon votre modèle local
tokenizer = None
model = None
device = "cuda" if torch.cuda.is_available() else "cpu"

# Prompts système spécialisés
SYSTEM_PROMPTS = {
    "acquisition": """أنت خبير في اكتساب العملاء (acquisition de clients).
    Tu parles couramment le darija (الدارجة المغربية) et tu aides les closers à:
    - Qualifier les leads
    - Identifier les signaux d'achat
    - Adapter la stratégie de vente
    - Surmonter les objections

    Réponds de manière concise et actioable.""",

    "structuration": """Vous êtes consultant expert en structuration d'entreprise.
    Vous aidez à:
    - Optimiser les processus de vente
    - Structurer les équipes commerciales
    - Créer des pipelines efficaces
    - Améliorer la conversion

    Soyez pragmatique et orienté résultats.""",

    "psychologie": """Tu es psychologue spécialisé en cognition et comportement.
    Tu analyses les profils clients pour:
    - Identifier les motivations profondes
    - Détecter les biais cognitifs exploitables
    - Suggérer des techniques d'influence éthiques
    - Prédire les comportements d'achat

    Basez vos analyses sur la psychologie scientifique.""",

    "scoring": """Vous êtes un système d'analyse prédictive de leads.
    Évaluez chaque lead selon:
    - Intent score (0-100): Intention d'achat
    - Fit score (0-100): Adéquation produit/besoin
    - Engagement score (0-100): Niveau d'engagement
    - Urgency score (0-100): Urgence de la décision
    - Risk score (0-100): Risque de perdre le deal

    Justifiez chaque score avec des insights actionnables."""
}


class ProtonANKRequest(BaseModel):
    """Requête pour Proton ANK"""
    prompt: str = Field(..., description="Le prompt utilisateur")
    context: Optional[str] = Field(None, description="Contexte additionnel (historique, données lead)")
    mode: str = Field("acquisition", description="Mode: acquisition, structuration, psychologie, scoring")
    language: str = Field("darija", description="Langue de réponse: darija, français, arabe")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="Température de génération")
    max_tokens: int = Field(500, ge=50, le=2000, description="Nombre maximum de tokens")


class LeadScoringRequest(BaseModel):
    """Requête pour le scoring intelligent de leads"""
    lead_data: Dict[str, Any] = Field(..., description="Données du lead")
    interaction_history: Optional[List[Dict[str, Any]]] = Field(None, description="Historique des interactions")


class ProtonANKResponse(BaseModel):
    """Réponse de Proton ANK"""
    response: str = Field(..., description="Réponse générée")
    mode: str = Field(..., description="Mode utilisé")
    confidence: float = Field(..., description="Score de confiance (0-1)")
    tokens_used: int = Field(..., description="Nombre de tokens utilisés")
    timestamp: str = Field(..., description="Timestamp de la génération")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Métadonnées additionnelles")


class LeadScoringResponse(BaseModel):
    """Réponse du scoring de lead"""
    intent_score: int = Field(..., ge=0, le=100)
    fit_score: int = Field(..., ge=0, le=100)
    engagement_score: int = Field(..., ge=0, le=100)
    urgency_score: int = Field(..., ge=0, le=100)
    risk_score: int = Field(..., ge=0, le=100)
    overall_score: int = Field(..., ge=0, le=100)
    insights: List[str] = Field(..., description="Insights actionnables")
    recommended_actions: List[str] = Field(..., description="Actions recommandées")
    psychological_profile: Dict[str, Any] = Field(..., description="Profil psychologique du lead")


def load_model():
    """Charge le modèle Nemotron H 8b"""
    global tokenizer, model

    try:
        logger.info(f"Chargement du modèle Nemotron sur {device}...")

        # Charger le tokenizer
        tokenizer = AutoTokenizer.from_pretrained(
            MODEL_NAME,
            trust_remote_code=True
        )

        # Charger le modèle
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            device_map="auto" if device == "cuda" else None,
            trust_remote_code=True
        )

        if device == "cpu":
            model = model.to(device)

        model.eval()
        logger.info("Modèle chargé avec succès!")

    except Exception as e:
        logger.error(f"Erreur lors du chargement du modèle: {e}")
        logger.warning("Le modèle n'est pas chargé. Les requêtes retourneront des réponses mock.")


@app.on_event("startup")
async def startup_event():
    """Événement de démarrage - charge le modèle"""
    load_model()


@app.get("/")
async def root():
    """Endpoint racine"""
    return {
        "service": "Proton ANK API",
        "version": "1.0.0",
        "status": "running",
        "model_loaded": model is not None,
        "device": device
    }


@app.get("/health")
async def health_check():
    """Vérification de santé du service"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": device,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/generate", response_model=ProtonANKResponse)
async def generate(request: ProtonANKRequest):
    """
    Génère une réponse avec Proton ANK
    """
    try:
        # Vérifier que le modèle est chargé
        if model is None or tokenizer is None:
            # Mode mock pour le développement
            logger.warning("Modèle non chargé - utilisation du mode mock")
            return ProtonANKResponse(
                response=f"[MOCK] Réponse en mode {request.mode} pour: {request.prompt[:50]}...",
                mode=request.mode,
                confidence=0.85,
                tokens_used=100,
                timestamp=datetime.now().isoformat(),
                metadata={"mock": True}
            )

        # Construire le prompt complet
        system_prompt = SYSTEM_PROMPTS.get(request.mode, SYSTEM_PROMPTS["acquisition"])

        full_prompt = f"{system_prompt}\n\n"
        if request.context:
            full_prompt += f"Contexte: {request.context}\n\n"
        full_prompt += f"Question: {request.prompt}\n\nRéponse:"

        # Tokenizer
        inputs = tokenizer(full_prompt, return_tensors="pt").to(device)

        # Générer
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=request.max_tokens,
                temperature=request.temperature,
                do_sample=True,
                top_p=0.9,
                top_k=50,
                repetition_penalty=1.1
            )

        # Décoder
        response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Extraire seulement la réponse (après "Réponse:")
        response_text = response_text.split("Réponse:")[-1].strip()

        # Calculer la confiance (simplifiée pour l'instant)
        confidence = 0.85  # À améliorer avec des métriques réelles

        return ProtonANKResponse(
            response=response_text,
            mode=request.mode,
            confidence=confidence,
            tokens_used=len(outputs[0]),
            timestamp=datetime.now().isoformat(),
            metadata={
                "temperature": request.temperature,
                "language": request.language
            }
        )

    except Exception as e:
        logger.error(f"Erreur lors de la génération: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur de génération: {str(e)}")


@app.post("/score-lead", response_model=LeadScoringResponse)
async def score_lead(request: LeadScoringRequest):
    """
    Scoring intelligent d'un lead avec analyse psychologique
    """
    try:
        lead_data = request.lead_data
        history = request.interaction_history or []

        # Construire le prompt pour l'analyse
        analysis_prompt = f"""Analyse ce lead et fournis un scoring détaillé:

Données du lead:
- Nom: {lead_data.get('name', 'N/A')}
- Entreprise: {lead_data.get('company', 'N/A')}
- Revenus annuels: {lead_data.get('annual_revenue', 'N/A')}
- Taille équipe: {lead_data.get('team_size', 'N/A')}
- Secteur: {lead_data.get('industry', 'N/A')}
- Objectifs: {lead_data.get('goals', 'N/A')}

Historique des interactions: {len(history)} interactions

Fournis:
1. Intent score (0-100): Niveau d'intention d'achat
2. Fit score (0-100): Adéquation produit/besoin
3. Engagement score (0-100): Niveau d'engagement
4. Urgency score (0-100): Urgence de la décision
5. Risk score (0-100): Risque de perdre le deal
6. Insights actionnables
7. Actions recommandées
8. Profil psychologique (motivations, biais, type de décideur)"""

        # Générer l'analyse
        proton_request = ProtonANKRequest(
            prompt=analysis_prompt,
            mode="scoring",
            temperature=0.3,  # Plus déterministe pour le scoring
            max_tokens=800
        )

        analysis = await generate(proton_request)

        # Parser la réponse (à améliorer avec un parsing structuré)
        # Pour l'instant, retourner des scores mock basés sur les données

        # Calcul simplifié des scores
        intent_score = min(100, max(0, 70 + (len(history) * 5)))
        fit_score = 75 if lead_data.get('annual_revenue', 0) > 100000 else 60
        engagement_score = min(100, 50 + (len(history) * 10))
        urgency_score = 65
        risk_score = max(0, 100 - engagement_score)
        overall_score = int((intent_score + fit_score + engagement_score + urgency_score + (100 - risk_score)) / 5)

        return LeadScoringResponse(
            intent_score=intent_score,
            fit_score=fit_score,
            engagement_score=engagement_score,
            urgency_score=urgency_score,
            risk_score=risk_score,
            overall_score=overall_score,
            insights=[
                f"Lead avec {len(history)} interactions - bon engagement" if len(history) > 3 else "Lead à engager davantage",
                f"Revenus annuels: {lead_data.get('annual_revenue', 'N/A')} - {'fort potentiel' if lead_data.get('annual_revenue', 0) > 100000 else 'potentiel moyen'}",
                "Profil décideur identifié" if lead_data.get('role') in ['CEO', 'Owner', 'Director'] else "Influenceur identifié"
            ],
            recommended_actions=[
                "Planifier un call de découverte approfondi" if engagement_score < 60 else "Préparer une proposition commerciale",
                "Identifier les autres décideurs" if lead_data.get('role') not in ['CEO', 'Owner'] else "Closer directement",
                "Utiliser l'urgence: montrer la rareté de l'offre" if urgency_score < 70 else "Maintenir la pression positive"
            ],
            psychological_profile={
                "decision_style": "analytique" if lead_data.get('industry') in ['tech', 'finance'] else "émotionnel",
                "primary_motivation": "croissance" if lead_data.get('annual_revenue', 0) > 100000 else "stabilité",
                "objections_prévues": ["prix", "timing", "alternatives"],
                "levier_influence": "preuve sociale et ROI" if lead_data.get('industry') == 'tech' else "relation et confiance",
                "biais_cognitifs": ["ancrage", "aversion à la perte", "preuve sociale"]
            }
        )

    except Exception as e:
        logger.error(f"Erreur lors du scoring: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur de scoring: {str(e)}")


@app.get("/prompts")
async def get_prompts():
    """Retourne les prompts système disponibles"""
    return {
        "prompts": {
            mode: prompt[:100] + "..."
            for mode, prompt in SYSTEM_PROMPTS.items()
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
