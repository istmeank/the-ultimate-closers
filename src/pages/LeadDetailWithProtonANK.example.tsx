/**
 * Exemple d'intégration complète de Proton ANK dans une page de détail de lead
 * Ce fichier est un exemple - copiez-le et adaptez-le à votre structure
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  MessageSquare,
  Brain,
  Sparkles,
} from 'lucide-react';

// Import des composants Proton ANK
import { ProtonANKAssistant } from '@/components/closer/ProtonANKAssistant';
import { ProtonANKLeadScoring } from '@/components/closer/ProtonANKLeadScoring';

// Imports Supabase (adaptez selon votre structure)
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function LeadDetailWithProtonANK() {
  const { leadId } = useParams<{ leadId: string }>();
  const { toast } = useToast();

  // États
  const [lead, setLead] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Charger les données du lead
  useEffect(() => {
    if (leadId) {
      loadLeadData();
    }
  }, [leadId]);

  const loadLeadData = async () => {
    try {
      setLoading(true);

      // Charger le lead
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError) throw leadError;
      setLead(leadData);

      // Charger les interactions
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('interactions')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (interactionsError) throw interactionsError;
      setInteractions(interactionsData || []);

      // Charger les deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .eq('lead_id', leadId);

      if (dealsError) throw dealsError;
      setDeals(dealsData || []);

    } catch (error: any) {
      console.error('Erreur chargement lead:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de charger le lead',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionApply = (suggestion: string) => {
    // Copier la suggestion dans le presse-papiers
    navigator.clipboard.writeText(suggestion);
    toast({
      title: 'Suggestion copiée',
      description: 'La suggestion a été copiée dans le presse-papiers',
    });
  };

  const handleScoreCalculated = (score: any) => {
    // Optionnel: Sauvegarder le score en base de données
    console.log('Score calculé:', score);
    toast({
      title: 'Score calculé',
      description: `Score global: ${score.overall_score}/100`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">Lead introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête du lead */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-3xl flex items-center gap-3">
                <User className="h-8 w-8 text-purple-600" />
                {lead.name}
                <Badge
                  variant={lead.status === 'won' ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {lead.status}
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-4 text-base">
                {lead.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {lead.company}
                  </span>
                )}
                {lead.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {lead.email}
                  </span>
                )}
                {lead.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {lead.phone}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Planifier un call
              </Button>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Contacter
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contenu principal avec onglets */}
      <div className="grid grid-cols-3 gap-6">
        {/* Colonne principale (2/3) */}
        <div className="col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <TrendingUp className="h-4 w-4 mr-2" />
                Aperçu
              </TabsTrigger>
              <TabsTrigger value="interactions">
                <MessageSquare className="h-4 w-4 mr-2" />
                Interactions
              </TabsTrigger>
              <TabsTrigger value="ai-scoring">
                <Brain className="h-4 w-4 mr-2" />
                Scoring IA
              </TabsTrigger>
              <TabsTrigger value="deals">
                <TrendingUp className="h-4 w-4 mr-2" />
                Deals
              </TabsTrigger>
            </TabsList>

            {/* Onglet Aperçu */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations du lead</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Secteur</span>
                      <p className="text-base font-semibold">{lead.industry || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Source</span>
                      <p className="text-base font-semibold">{lead.source || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Revenus annuels</span>
                      <p className="text-base font-semibold">
                        {lead.annual_revenue ? `${lead.annual_revenue}€` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Taille équipe</span>
                      <p className="text-base font-semibold">{lead.team_size || 'N/A'}</p>
                    </div>
                  </div>

                  {lead.goals && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-sm font-medium text-gray-500">Objectifs</span>
                        <p className="text-base mt-1">{lead.goals}</p>
                      </div>
                    </>
                  )}

                  {lead.notes && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-sm font-medium text-gray-500">Notes</span>
                        <p className="text-base mt-1">{lead.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Interactions */}
            <TabsContent value="interactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des interactions</CardTitle>
                  <CardDescription>
                    {interactions.length} interaction{interactions.length > 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {interactions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Aucune interaction enregistrée
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {interactions.map((interaction) => (
                        <Card key={interaction.id} className="bg-gray-50">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="capitalize">
                                    {interaction.type}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {new Date(interaction.created_at).toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: 'long',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                {interaction.content && (
                                  <p className="text-sm mt-2">{interaction.content}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Scoring IA - PROTON ANK */}
            <TabsContent value="ai-scoring" className="space-y-4">
              <ProtonANKLeadScoring
                leadData={lead}
                interactions={interactions}
                onScoreCalculated={handleScoreCalculated}
                autoScore={true}
              />
            </TabsContent>

            {/* Onglet Deals */}
            <TabsContent value="deals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Opportunités commerciales</CardTitle>
                  <CardDescription>
                    {deals.length} deal{deals.length > 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deals.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Aucun deal créé</p>
                  ) : (
                    <div className="space-y-4">
                      {deals.map((deal) => (
                        <Card key={deal.id} className="bg-gray-50">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <p className="font-semibold">{deal.title}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>Montant: {deal.amount / 100}€</span>
                                  <Badge variant="secondary">{deal.stage}</Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Colonne Assistant IA (1/3) - PROTON ANK */}
        <div className="col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Badge Proton ANK */}
            <Card className="bg-gradient-to-br from-purple-500 to-blue-500 text-white border-0">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6" />
                  <div>
                    <h3 className="font-bold text-lg">Proton ANK</h3>
                    <p className="text-sm opacity-90">Assistant IA intelligent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Composant Assistant Proton ANK */}
            <ProtonANKAssistant
              leadData={lead}
              interactions={interactions}
              onSuggestionApply={handleSuggestionApply}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadDetailWithProtonANK;
