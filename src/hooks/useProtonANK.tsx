/**
 * Hook React pour Proton ANK
 * Facilite l'intégration du LLM dans les composants React
 */

import { useState, useEffect, useCallback } from 'react';
import {
  protonANK,
  type ProtonANKRequest,
  type ProtonANKResponse,
  type LeadScoringRequest,
  type LeadScoringResponse,
  isProtonANKAvailable,
} from '@/lib/proton-ank';
import { useToast } from '@/hooks/use-toast';

interface UseProtonANKState {
  isLoading: boolean;
  error: Error | null;
  response: ProtonANKResponse | null;
}

/**
 * Hook principal pour utiliser Proton ANK
 */
export const useProtonANK = () => {
  const [state, setState] = useState<UseProtonANKState>({
    isLoading: false,
    error: null,
    response: null,
  });
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const { toast } = useToast();

  // Vérifier la disponibilité au montage
  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await isProtonANKAvailable();
      setIsAvailable(available);

      if (!available) {
        console.warn('Proton ANK non disponible - mode dégradé activé');
      }
    } catch (error) {
      console.error('Erreur vérification Proton ANK:', error);
      setIsAvailable(false);
    }
  };

  /**
   * Génère une réponse avec Proton ANK
   */
  const generate = useCallback(
    async (request: ProtonANKRequest): Promise<ProtonANKResponse | null> => {
      setState({ isLoading: true, error: null, response: null });

      try {
        const response = await protonANK.generate(request);
        setState({ isLoading: false, error: null, response });
        return response;
      } catch (error) {
        const err = error as Error;
        setState({ isLoading: false, error: err, response: null });

        toast({
          title: 'Erreur Proton ANK',
          description: err.message || 'Impossible de générer une réponse',
          variant: 'destructive',
        });

        return null;
      }
    },
    [toast]
  );

  /**
   * Réinitialise l'état
   */
  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, response: null });
  }, []);

  return {
    ...state,
    isAvailable,
    generate,
    reset,
    checkAvailability,
  };
};

/**
 * Hook spécialisé pour le scoring de leads
 */
export const useLeadScoring = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [scoringResult, setScoringResult] = useState<LeadScoringResponse | null>(null);
  const { toast } = useToast();

  const scoreLead = useCallback(
    async (request: LeadScoringRequest): Promise<LeadScoringResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await protonANK.scoreLead(request);
        setScoringResult(result);
        setIsLoading(false);
        return result;
      } catch (error) {
        const err = error as Error;
        setError(err);
        setIsLoading(false);

        toast({
          title: 'Erreur de scoring',
          description: err.message || 'Impossible de scorer le lead',
          variant: 'destructive',
        });

        return null;
      }
    },
    [toast]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setScoringResult(null);
  }, []);

  return {
    isLoading,
    error,
    scoringResult,
    scoreLead,
    reset,
  };
};

/**
 * Hook pour les suggestions en temps réel aux closers
 */
export const useCloserAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string>('');
  const { toast } = useToast();

  const getSuggestion = useCallback(
    async (
      leadContext: string,
      conversationHistory: string[],
      currentSituation: string
    ): Promise<string> => {
      setIsLoading(true);

      try {
        const result = await protonANK.getCloserSuggestion(
          leadContext,
          conversationHistory,
          currentSituation
        );
        setSuggestion(result);
        setIsLoading(false);
        return result;
      } catch (error) {
        const err = error as Error;
        setIsLoading(false);

        toast({
          title: 'Erreur assistant',
          description: err.message || 'Impossible d\'obtenir une suggestion',
          variant: 'destructive',
        });

        return '';
      }
    },
    [toast]
  );

  const clearSuggestion = useCallback(() => {
    setSuggestion('');
  }, []);

  return {
    isLoading,
    suggestion,
    getSuggestion,
    clearSuggestion,
  };
};

/**
 * Hook pour l'analyse psychologique
 */
export const usePsychologicalAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const { toast } = useToast();

  const analyzeLeadPsychology = useCallback(
    async (leadData: any, history: any[]): Promise<string> => {
      setIsLoading(true);

      try {
        const result = await protonANK.analyzeLeadPsychology(leadData, history);
        setAnalysis(result);
        setIsLoading(false);
        return result;
      } catch (error) {
        const err = error as Error;
        setIsLoading(false);

        toast({
          title: 'Erreur d\'analyse',
          description: err.message || 'Impossible d\'analyser le lead',
          variant: 'destructive',
        });

        return '';
      }
    },
    [toast]
  );

  const clearAnalysis = useCallback(() => {
    setAnalysis('');
  }, []);

  return {
    isLoading,
    analysis,
    analyzeLeadPsychology,
    clearAnalysis,
  };
};

/**
 * Hook pour la génération d'emails personnalisés
 */
export const useEmailGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>('');
  const { toast } = useToast();

  const generateEmail = useCallback(
    async (
      leadData: any,
      emailType: 'first_contact' | 'follow_up' | 'proposal' | 'closing',
      context?: string
    ): Promise<string> => {
      setIsLoading(true);

      try {
        const result = await protonANK.generatePersonalizedEmail(
          leadData,
          emailType,
          context
        );
        setEmail(result);
        setIsLoading(false);

        toast({
          title: 'Email généré',
          description: 'L\'email a été généré avec succès',
        });

        return result;
      } catch (error) {
        const err = error as Error;
        setIsLoading(false);

        toast({
          title: 'Erreur de génération',
          description: err.message || 'Impossible de générer l\'email',
          variant: 'destructive',
        });

        return '';
      }
    },
    [toast]
  );

  const clearEmail = useCallback(() => {
    setEmail('');
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      toast({
        title: 'Copié',
        description: 'Email copié dans le presse-papiers',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier l\'email',
        variant: 'destructive',
      });
    }
  }, [email, toast]);

  return {
    isLoading,
    email,
    generateEmail,
    clearEmail,
    copyToClipboard,
  };
};
