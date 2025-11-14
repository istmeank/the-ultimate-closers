/**
 * Composant Assistant Proton ANK
 * Assistant IA en temps réel pour les closers
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Mail,
  Loader2,
  Copy,
  CheckCheck,
  AlertCircle,
} from 'lucide-react';
import {
  useProtonANK,
  useCloserAssistant,
  usePsychologicalAnalysis,
  useEmailGenerator,
} from '@/hooks/useProtonANK';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProtonANKAssistantProps {
  leadData?: any;
  interactions?: any[];
  onSuggestionApply?: (suggestion: string) => void;
}

export const ProtonANKAssistant = ({
  leadData,
  interactions = [],
  onSuggestionApply,
}: ProtonANKAssistantProps) => {
  const { isAvailable } = useProtonANK();
  const {
    isLoading: loadingSuggestion,
    suggestion,
    getSuggestion,
    clearSuggestion,
  } = useCloserAssistant();
  const {
    isLoading: loadingAnalysis,
    analysis,
    analyzeLeadPsychology,
  } = usePsychologicalAnalysis();
  const {
    isLoading: loadingEmail,
    email,
    generateEmail,
    clearEmail,
    copyToClipboard,
  } = useEmailGenerator();

  const [currentSituation, setCurrentSituation] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailType, setEmailType] = useState<'first_contact' | 'follow_up' | 'proposal' | 'closing'>(
    'follow_up'
  );

  // Réinitialiser l'état "copié" après 2 secondes
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleGetSuggestion = async () => {
    if (!leadData || !currentSituation.trim()) return;

    const leadContext = `
Lead: ${leadData.name || 'N/A'}
Entreprise: ${leadData.company || 'N/A'}
Secteur: ${leadData.industry || 'N/A'}
Objectifs: ${leadData.goals || 'N/A'}
    `.trim();

    const conversationHistory = interactions
      .slice(-5) // Dernières 5 interactions
      .map((int) => `${int.type}: ${int.content || 'N/A'}`);

    await getSuggestion(leadContext, conversationHistory, currentSituation);
  };

  const handleAnalyzePsychology = async () => {
    if (!leadData) return;
    await analyzeLeadPsychology(leadData, interactions);
  };

  const handleGenerateEmail = async () => {
    if (!leadData) return;
    const context = `${interactions.length} interactions précédentes`;
    await generateEmail(leadData, emailType, context);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  if (!isAvailable) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Proton ANK non disponible
          </CardTitle>
          <CardDescription>
            L'assistant IA n'est pas accessible actuellement. Vérifiez que le backend est démarré.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Assistant Proton ANK
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            IA
          </Badge>
        </CardTitle>
        <CardDescription>
          Assistant intelligent spécialisé en acquisition clients et psychologie comportementale
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="suggestion" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestion">
              <MessageSquare className="h-4 w-4 mr-2" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="psychology">
              <Brain className="h-4 w-4 mr-2" />
              Psychologie
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Emails
            </TabsTrigger>
          </TabsList>

          {/* Onglet Suggestions */}
          <TabsContent value="suggestion" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Décrivez la situation actuelle</label>
              <Textarea
                placeholder="Ex: Le lead hésite sur le prix, j'ai besoin d'arguments pour justifier la valeur..."
                value={currentSituation}
                onChange={(e) => setCurrentSituation(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleGetSuggestion}
              disabled={loadingSuggestion || !currentSituation.trim()}
              className="w-full"
            >
              {loadingSuggestion ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Obtenir une suggestion
                </>
              )}
            </Button>

            {suggestion && (
              <Alert className="bg-white border-purple-200">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <AlertDescription className="mt-2">
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="whitespace-pre-wrap text-sm">{suggestion}</div>
                  </ScrollArea>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(suggestion)}
                    >
                      {copied ? (
                        <>
                          <CheckCheck className="h-3 w-3 mr-1" />
                          Copié
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copier
                        </>
                      )}
                    </Button>
                    {onSuggestionApply && (
                      <Button
                        size="sm"
                        onClick={() => onSuggestionApply(suggestion)}
                      >
                        Appliquer
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearSuggestion}
                    >
                      Effacer
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Onglet Psychologie */}
          <TabsContent value="psychology" className="space-y-4">
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                Analyse psychologique cognitive-comportementale du lead pour adapter votre stratégie
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleAnalyzePsychology}
              disabled={loadingAnalysis || !leadData}
              className="w-full"
            >
              {loadingAnalysis ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyser le profil psychologique
                </>
              )}
            </Button>

            {analysis && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-base">Profil Psychologique</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="whitespace-pre-wrap text-sm">{analysis}</div>
                  </ScrollArea>

                  <Separator className="my-4" />

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(analysis)}
                    className="w-full"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copier l'analyse
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Onglet Emails */}
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type d'email</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={emailType === 'first_contact' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEmailType('first_contact')}
                >
                  Premier contact
                </Button>
                <Button
                  variant={emailType === 'follow_up' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEmailType('follow_up')}
                >
                  Suivi
                </Button>
                <Button
                  variant={emailType === 'proposal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEmailType('proposal')}
                >
                  Proposition
                </Button>
                <Button
                  variant={emailType === 'closing' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEmailType('closing')}
                >
                  Closing
                </Button>
              </div>
            </div>

            <Button
              onClick={handleGenerateEmail}
              disabled={loadingEmail || !leadData}
              className="w-full"
            >
              {loadingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Générer l'email
                </>
              )}
            </Button>

            {email && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-base">Email personnalisé</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="whitespace-pre-wrap text-sm font-mono">{email}</div>
                  </ScrollArea>

                  <Separator className="my-4" />

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copier
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearEmail}
                    >
                      Effacer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
