import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { useDziriBERT } from '@/hooks/useDziriBERT';
import { DziriBERTPrediction } from '@/lib/dziribert';

interface DziriBERTSuggestionsProps {
  placeholder?: string;
  onSelect?: (word: string) => void;
  showAutoComplete?: boolean;
}

export const DziriBERTSuggestions = ({
  placeholder = "Entrez votre phrase avec [MASK]...",
  onSelect,
  showAutoComplete = true,
}: DziriBERTSuggestionsProps) => {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState<DziriBERTPrediction[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { predict, checkAvailability, loading, isAvailable } = useDziriBERT();

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  const handlePredict = async () => {
    if (!text.trim()) return;

    // Ajouter [MASK] si absent
    const textWithMask = text.toUpperCase().includes('[MASK]')
      ? text
      : `${text} [MASK]`;

    const result = await predict(textWithMask, 5);
    if (result) {
      setSuggestions(result.predictions);
    }
  };

  const handleSelect = (word: string) => {
    const completed = text.replace(/\[MASK\]/gi, word);
    setText(completed);
    setSuggestions([]);
    if (onSelect) {
      onSelect(completed);
    }
  };

  const handleCopy = async (word: string, index: number) => {
    const completed = text.replace(/\[MASK\]/gi, word);
    await navigator.clipboard.writeText(completed);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePredict();
    }
  };

  if (isAvailable === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            DziriBERT - Suggestions Darija
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ⚠️ L'API DziriBERT n'est pas disponible. Assurez-vous qu'elle est démarrée sur{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">http://localhost:8000</code>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          DziriBERT - Suggestions Darija
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handlePredict} disabled={loading || !text.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recherche...
              </>
            ) : (
              'Prédire'
            )}
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Suggestions :</p>
            <div className="grid gap-2">
              {suggestions.map((pred, index) => {
                const completed = text.replace(/\[MASK\]/gi, pred.word);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{completed}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          Score: {pred.score.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelect(pred.word)}
                      >
                        Utiliser
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(pred.word, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          💡 Exemples : "tahya el [MASK]", "rabi [MASK] khouya", "أنا من الجزائر من ولاية [MASK]"
        </p>
      </CardContent>
    </Card>
  );
};

