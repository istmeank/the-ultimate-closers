import { useState, useCallback } from 'react';
import { predictDarija, completePhrase, getSuggestions, DziriBERTPrediction, checkDziriBERTHealth } from '@/lib/dziribert';
import { toast } from 'sonner';

export function useDziriBERT() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Vérifier la disponibilité au montage
  const checkAvailability = useCallback(async () => {
    try {
      const available = await checkDziriBERTHealth();
      setIsAvailable(available);
      return available;
    } catch {
      setIsAvailable(false);
      return false;
    }
  }, []);

  // Faire une prédiction
  const predict = useCallback(async (text: string, topK: number = 5) => {
    if (!text.trim()) {
      setError('Le texte ne peut pas être vide');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await predictDarija({ text, top_k: topK });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la prédiction';
      setError(errorMessage);
      toast.error(`Erreur DziriBERT: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Compléter une phrase
  const complete = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);

    try {
      const completed = await completePhrase(text);
      return completed;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la complétion';
      setError(errorMessage);
      toast.error(`Erreur DziriBERT: ${errorMessage}`);
      return text; // Retourner le texte original en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtenir des suggestions
  const suggest = useCallback(async (text: string, topK: number = 5) => {
    setLoading(true);
    setError(null);

    try {
      const suggestions = await getSuggestions(text, topK);
      return suggestions;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la récupération des suggestions';
      setError(errorMessage);
      toast.error(`Erreur DziriBERT: ${errorMessage}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    predict,
    complete,
    suggest,
    checkAvailability,
    loading,
    error,
    isAvailable,
  };
}

