/**
 * Utilitaire de détection de langue Darija via DziriBERT
 */

const DZIRIBERT_API_URL = import.meta.env.VITE_DZIRIBERT_API_URL || 'http://localhost:8000';

export interface DarijaDetectionResult {
  isDarija: boolean;
  confidence: number;
  detectedWords: string[];
}

/**
 * Mots-clés Darija courants pour fallback
 */
const DARIJA_KEYWORDS = [
  'واش', 'كيفاش', 'علاه', 'بصح', 'مليح', 'صحيح', 'راني',
  'كاين', 'ماكاينش', 'بزاف', 'شوية', 'دابا', 'غدوة',
  'ياسر', 'برك', 'وين', 'فين', 'شكون', 'شحال'
];

/**
 * Détection par mots-clés (fallback si API indisponible)
 */
function detectByKeywords(text: string): DarijaDetectionResult {
  const detectedWords = DARIJA_KEYWORDS.filter(keyword => 
    text.includes(keyword)
  );
  
  const confidence = Math.min(detectedWords.length * 0.25, 0.95);
  
  return {
    isDarija: detectedWords.length > 0,
    confidence,
    detectedWords
  };
}

/**
 * Détection via l'API DziriBERT
 */
export async function detectDarijaLanguage(text: string): Promise<DarijaDetectionResult> {
  // Vérification texte vide
  if (!text || text.trim().length < 5) {
    return { isDarija: false, confidence: 0, detectedWords: [] };
  }

  try {
    // Vérifier d'abord avec les mots-clés (rapide)
    const keywordResult = detectByKeywords(text);
    
    // Si confiance élevée via mots-clés, retourner directement
    if (keywordResult.confidence > 0.7) {
      console.log('✅ Darija détecté via mots-clés:', keywordResult);
      return keywordResult;
    }

    // Sinon, essayer l'API DziriBERT pour analyse plus fine
    const response = await fetch(`${DZIRIBERT_API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        top_k: 1,
        normalize: true
      }),
    });

    if (!response.ok) {
      console.warn('API DziriBERT non disponible, fallback sur mots-clés');
      return keywordResult;
    }

    const result = await response.json();
    
    // L'API retourne des prédictions de mots, on analyse le contexte
    const apiConfidence = result.predictions?.[0]?.score || 0;
    
    // Combiner les résultats API + mots-clés
    const combinedConfidence = Math.max(keywordResult.confidence, apiConfidence);
    
    return {
      isDarija: combinedConfidence > 0.3,
      confidence: combinedConfidence,
      detectedWords: keywordResult.detectedWords
    };
    
  } catch (error) {
    console.warn('Erreur détection Darija:', error);
    // Fallback sur détection par mots-clés
    return detectByKeywords(text);
  }
}

/**
 * Vérifier si l'API DziriBERT est disponible
 */
export async function isDziriBERTAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${DZIRIBERT_API_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}
