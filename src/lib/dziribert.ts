/**
 * Service pour intégrer l'API DziriBERT
 * Prédiction de mots masqués en dialecte algérien (Darija)
 */

const DZIRIBERT_API_URL = import.meta.env.VITE_DZIRIBERT_API_URL || 'http://localhost:8000';

export interface DziriBERTPrediction {
  word: string;
  score: number;
}

export interface DziriBERTResponse {
  input: string;
  predictions: DziriBERTPrediction[];
  model: string;
}

export interface DziriBERTRequest {
  text: string;
  top_k?: number;
  normalize?: boolean;
}

/**
 * Faire une prédiction avec DziriBERT
 */
export async function predictDarija(request: DziriBERTRequest): Promise<DziriBERTResponse> {
  try {
    const response = await fetch(`${DZIRIBERT_API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        top_k: request.top_k || 5,
        normalize: request.normalize !== false, // true par défaut
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Erreur inconnue' }));
      throw new Error(error.detail || `Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur DziriBERT:', error);
    throw error;
  }
}

/**
 * Compléter automatiquement une phrase avec le meilleur mot
 */
export async function completePhrase(text: string): Promise<string> {
  // Ajouter [MASK] si absent
  const textWithMask = text.toUpperCase().includes('[MASK]') 
    ? text 
    : `${text} [MASK]`;

  const result = await predictDarija({ text: textWithMask, top_k: 1 });
  
  if (result.predictions.length > 0) {
    return textWithMask.replace('[MASK]', result.predictions[0].word);
  }
  
  return text;
}

/**
 * Obtenir des suggestions pour un mot manquant
 */
export async function getSuggestions(text: string, topK: number = 5): Promise<DziriBERTPrediction[]> {
  // S'assurer qu'il y a un [MASK]
  const textWithMask = text.toUpperCase().includes('[MASK]') 
    ? text 
    : `${text} [MASK]`;

  const result = await predictDarija({ text: textWithMask, top_k: topK });
  return result.predictions;
}

/**
 * Vérifier si l'API DziriBERT est accessible
 */
export async function checkDziriBERTHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${DZIRIBERT_API_URL}/health`);
    if (response.ok) {
      const health = await response.json();
      return health.model_loaded === true;
    }
    return false;
  } catch {
    return false;
  }
}

