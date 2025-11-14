/**
 * Proton ANK - Service Client TypeScript
 * Communication avec l'API backend du LLM propriétaire
 */

const PROTON_ANK_API_URL = import.meta.env.VITE_PROTON_ANK_API_URL || 'http://localhost:8001';

/**
 * Types pour Proton ANK
 */
export type ProtonANKMode = 'acquisition' | 'structuration' | 'psychologie' | 'scoring';
export type ProtonANKLanguage = 'darija' | 'français' | 'arabe';

export interface ProtonANKRequest {
  prompt: string;
  context?: string;
  mode?: ProtonANKMode;
  language?: ProtonANKLanguage;
  temperature?: number;
  max_tokens?: number;
}

export interface ProtonANKResponse {
  response: string;
  mode: string;
  confidence: number;
  tokens_used: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface LeadData {
  name?: string;
  email?: string;
  company?: string;
  annual_revenue?: number;
  team_size?: number;
  industry?: string;
  role?: string;
  goals?: string;
  [key: string]: any;
}

export interface Interaction {
  type: string;
  date: string;
  content?: string;
  [key: string]: any;
}

export interface LeadScoringRequest {
  lead_data: LeadData;
  interaction_history?: Interaction[];
}

export interface LeadScoringResponse {
  intent_score: number;
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

export interface ProtonANKHealth {
  status: string;
  model_loaded: boolean;
  device: string;
  timestamp: string;
}

/**
 * Classe de service Proton ANK
 */
class ProtonANKService {
  private baseUrl: string;

  constructor(baseUrl: string = PROTON_ANK_API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Vérifie la santé du service Proton ANK
   */
  async healthCheck(): Promise<ProtonANKHealth> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur health check Proton ANK:', error);
      throw error;
    }
  }

  /**
   * Génère une réponse avec Proton ANK
   */
  async generate(request: ProtonANKRequest): Promise<ProtonANKResponse> {
    try {
      const payload = {
        prompt: request.prompt,
        context: request.context,
        mode: request.mode || 'acquisition',
        language: request.language || 'darija',
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 500,
      };

      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur génération Proton ANK:', error);
      throw error;
    }
  }

  /**
   * Score un lead avec analyse psychologique
   */
  async scoreLead(request: LeadScoringRequest): Promise<LeadScoringResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/score-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur scoring lead Proton ANK:', error);
      throw error;
    }
  }

  /**
   * Récupère les prompts système disponibles
   */
  async getPrompts(): Promise<Record<string, string>> {
    try {
      const response = await fetch(`${this.baseUrl}/prompts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.prompts;
    } catch (error) {
      console.error('Erreur récupération prompts:', error);
      throw error;
    }
  }

  /**
   * Suggestions pour un closer pendant une conversation
   * Mode spécialisé pour l'assistance en temps réel
   */
  async getCloserSuggestion(
    leadContext: string,
    conversationHistory: string[],
    currentSituation: string
  ): Promise<string> {
    const context = `
Contexte du lead: ${leadContext}

Historique de la conversation:
${conversationHistory.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}

Situation actuelle: ${currentSituation}
    `.trim();

    const prompt = `
En tant qu'expert en closing, suggère la meilleure réponse ou approche pour cette situation.
Sois concis, actionnable, et adapté au contexte darija si pertinent.
    `.trim();

    const response = await this.generate({
      prompt,
      context,
      mode: 'acquisition',
      language: 'darija',
      temperature: 0.6,
      max_tokens: 300,
    });

    return response.response;
  }

  /**
   * Analyse psychologique d'un lead
   */
  async analyzeLeadPsychology(leadData: LeadData, history: Interaction[]): Promise<string> {
    const context = `
Lead: ${leadData.name || 'N/A'}
Entreprise: ${leadData.company || 'N/A'}
Secteur: ${leadData.industry || 'N/A'}
Objectifs: ${leadData.goals || 'N/A'}
Interactions: ${history.length} interactions
    `.trim();

    const prompt = `
Analyse le profil psychologique de ce lead:
- Type de décideur (analytique, émotionnel, pragmatique)
- Motivations principales
- Biais cognitifs exploitables (éthiquement)
- Stratégie de persuasion recommandée
- Objections probables

Fournis une analyse concise et actionable.
    `.trim();

    const response = await this.generate({
      prompt,
      context,
      mode: 'psychologie',
      language: 'français',
      temperature: 0.5,
      max_tokens: 600,
    });

    return response.response;
  }

  /**
   * Génère un email personnalisé pour un lead
   */
  async generatePersonalizedEmail(
    leadData: LeadData,
    emailType: 'first_contact' | 'follow_up' | 'proposal' | 'closing',
    context?: string
  ): Promise<string> {
    const emailPrompts = {
      first_contact: 'Premier contact - email d\'introduction personnalisé',
      follow_up: 'Email de suivi après une interaction',
      proposal: 'Email de proposition commerciale',
      closing: 'Email de closing pour conclure le deal',
    };

    const leadContext = `
Lead: ${leadData.name || 'N/A'}
Entreprise: ${leadData.company || 'N/A'}
Secteur: ${leadData.industry || 'N/A'}
${context ? `Contexte: ${context}` : ''}
    `.trim();

    const prompt = `
Génère un email professionnel et personnalisé pour:
${emailPrompts[emailType]}

Le ton doit être:
- Professionnel mais accessible
- Orienté valeur (pas vendeur)
- Adapté au secteur ${leadData.industry || 'non spécifié'}
- Court et impactant (max 200 mots)

Structure:
1. Objet accrocheur
2. Corps du message
3. Call-to-action clair
    `.trim();

    const response = await this.generate({
      prompt,
      context: leadContext,
      mode: 'acquisition',
      language: 'français',
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.response;
  }

  /**
   * Identifie les signaux d'achat dans une conversation
   */
  async identifyBuyingSignals(conversationText: string): Promise<{
    signals: string[];
    urgency_level: 'low' | 'medium' | 'high';
    recommended_action: string;
  }> {
    const prompt = `
Analyse cette conversation et identifie:
1. Les signaux d'achat (buying signals)
2. Le niveau d'urgence
3. L'action recommandée immédiate

Conversation:
${conversationText}

Fournis une réponse structurée et concise.
    `.trim();

    const response = await this.generate({
      prompt,
      mode: 'acquisition',
      language: 'français',
      temperature: 0.4,
      max_tokens: 400,
    });

    // Parser la réponse (à améliorer avec un format structuré)
    return {
      signals: ['Signal 1', 'Signal 2'], // À parser depuis response.response
      urgency_level: 'medium',
      recommended_action: response.response,
    };
  }
}

// Export de l'instance singleton
export const protonANK = new ProtonANKService();

// Export de la classe pour usage avancé
export { ProtonANKService };

// Fonctions helper
export const isProtonANKAvailable = async (): Promise<boolean> => {
  try {
    const health = await protonANK.healthCheck();
    return health.status === 'healthy' && health.model_loaded;
  } catch {
    return false;
  }
};

export const getProtonANKStatus = async (): Promise<{
  available: boolean;
  device: string | null;
  modelLoaded: boolean;
}> => {
  try {
    const health = await protonANK.healthCheck();
    return {
      available: true,
      device: health.device,
      modelLoaded: health.model_loaded,
    };
  } catch {
    return {
      available: false,
      device: null,
      modelLoaded: false,
    };
  }
};
