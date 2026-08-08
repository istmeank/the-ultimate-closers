/**
 * Composant de Scoring Intelligent de Lead avec Proton ANK
 * Affiche les scores détaillés et insights psychologiques
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { useLeadScoring } from '@/hooks/useProtonANK';
import type { LeadScoringResponse } from '@/lib/proton-ank';

interface ProtonANKLeadScoringProps {
  leadData: any;
  interactions?: any[];
  onScoreCalculated?: (score: LeadScoringResponse) => void;
  autoScore?: boolean;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
};

const getScoreBgColor = (score: number): string => {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-blue-100';
  if (score >= 40) return 'bg-amber-100';
  return 'bg-red-100';
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Bon';
  if (score >= 40) return 'Moyen';
  return 'Faible';
};

export const ProtonANKLeadScoring = ({
  leadData,
  interactions = [],
  onScoreCalculated,
  autoScore = false,
}: ProtonANKLeadScoringProps) => {
  const { isLoading, error, scoringResult, scoreLead, reset } = useLeadScoring();
  const [hasScored, setHasScored] = useState(false);

  // Auto-score au montage si autoScore est activé
  useEffect(() => {
    if (autoScore && leadData && !hasScored) {
      handleScore();
    }
  }, [autoScore, leadData, hasScored]);

  // Callback quand le score est calculé
  useEffect(() => {
    if (scoringResult && onScoreCalculated) {
      onScoreCalculated(scoringResult);
    }
  }, [scoringResult, onScoreCalculated]);

  const handleScore = async () => {
    if (!leadData) return;

    await scoreLead({
      lead_data: leadData,
      interaction_history: interactions,
    });

    setHasScored(true);
  };

  const handleReset = () => {
    reset();
    setHasScored(false);
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec action */}
      <Card className="border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Scoring Intelligent Proton ANK
              </CardTitle>
              <CardDescription>
                Analyse prédictive avec profil psychologique
              </CardDescription>
            </div>
            {!hasScored ? (
              <Button onClick={handleScore} disabled={isLoading || !leadData}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyse...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Scorer le lead
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleReset} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Rescorer
              </Button>
            )}
          </div>
        </CardHeader>

        {error && (
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Erreur lors du scoring: {error.message}</AlertDescription>
            </Alert>
          </CardContent>
        )}

        {scoringResult && (
          <CardContent className="space-y-6">
            {/* Score global */}
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Score Global</span>
              </div>
              <div
                className={`text-6xl font-bold ${getScoreColor(scoringResult.overall_score)}`}
              >
                {scoringResult.overall_score}
              </div>
              <Badge className={`mt-2 ${getScoreBgColor(scoringResult.overall_score)}`}>
                {getScoreLabel(scoringResult.overall_score)}
              </Badge>
            </div>

            <Separator />

            {/* Scores détaillés */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Scores Détaillés
              </h3>

              {/* Intent Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Intention d'achat</span>
                  <span className={`font-bold ${getScoreColor(scoringResult.intent_score)}`}>
                    {scoringResult.intent_score}/100
                  </span>
                </div>
                <Progress value={scoringResult.intent_score} className="h-2" />
              </div>

              {/* Fit Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Adéquation produit/besoin</span>
                  <span className={`font-bold ${getScoreColor(scoringResult.fit_score)}`}>
                    {scoringResult.fit_score}/100
                  </span>
                </div>
                <Progress value={scoringResult.fit_score} className="h-2" />
              </div>

              {/* Engagement Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Niveau d'engagement</span>
                  <span className={`font-bold ${getScoreColor(scoringResult.engagement_score)}`}>
                    {scoringResult.engagement_score}/100
                  </span>
                </div>
                <Progress value={scoringResult.engagement_score} className="h-2" />
              </div>

              {/* Urgency Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Urgence de décision</span>
                  <span className={`font-bold ${getScoreColor(scoringResult.urgency_score)}`}>
                    {scoringResult.urgency_score}/100
                  </span>
                </div>
                <Progress value={scoringResult.urgency_score} className="h-2" />
              </div>

              {/* Risk Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Risque de perte</span>
                  <span className={`font-bold ${getScoreColor(100 - scoringResult.risk_score)}`}>
                    {scoringResult.risk_score}/100
                  </span>
                </div>
                <Progress value={scoringResult.risk_score} className="h-2 [&>div]:bg-red-500" />
              </div>
            </div>

            <Separator />

            {/* Insights */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Insights
              </h3>
              <div className="space-y-2">
                {scoringResult.insights.map((insight, index) => (
                  <Alert key={index} className="bg-amber-50 border-amber-200">
                    <CheckCircle2 className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm">{insight}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>

            <Separator />

            {/* Actions recommandées */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                Actions Recommandées
              </h3>
              <div className="space-y-2">
                {scoringResult.recommended_actions.map((action, index) => (
                  <Alert key={index} className="bg-blue-50 border-blue-200">
                    <Target className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm">{action}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>

            <Separator />

            {/* Profil psychologique */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                Profil Psychologique
              </h3>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Style de décision:</span>
                      <p className="font-semibold capitalize">
                        {scoringResult.psychological_profile.decision_style}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Motivation primaire:</span>
                      <p className="font-semibold capitalize">
                        {scoringResult.psychological_profile.primary_motivation}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <span className="font-medium text-gray-600 text-sm">
                      Levier d'influence:
                    </span>
                    <p className="text-sm mt-1">
                      {scoringResult.psychological_profile.levier_influence}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <span className="font-medium text-gray-600 text-sm">
                      Objections prévues:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {scoringResult.psychological_profile.objections_prévues.map(
                        (objection, index) => (
                          <Badge key={index} variant="outline" className="capitalize">
                            {objection}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <span className="font-medium text-gray-600 text-sm">Biais cognitifs:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {scoringResult.psychological_profile.biais_cognitifs.map((biais, index) => (
                        <Badge key={index} variant="secondary" className="capitalize">
                          {biais}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
