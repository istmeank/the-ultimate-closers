import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CloserLayout } from '@/components/closer/CloserLayout';
import { InteractionsTimeline } from '@/components/closer/InteractionsTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  ExternalLink, 
  CreditCard,
  MoreHorizontal,
  Edit
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      if (!id) throw new Error('Lead ID is required');

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: deals } = useQuery({
    queryKey: ['leadDeals', id],
    queryFn: async () => {
      if (!id) return [];

      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const getScoreBadge = (score: number) => {
    if (score >= 75) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">🔥 Score: {score}</Badge>;
    }
    if (score >= 50) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">⚡ Score: {score}</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800 border-red-200">❄️ Score: {score}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      new: 'bg-violet-100 text-violet-800',
      qualified: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    };
    
    const statusLabels = {
      new: 'Nouveau',
      qualified: 'Qualifié',
      in_progress: 'En cours',
      won: 'Gagné',
      lost: 'Perdu',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  const handleCall = () => {
    if (lead?.phone) {
      window.open(`tel:${lead.phone}`, '_self');
    }
  };

  const handleEmail = () => {
    if (lead?.email) {
      window.open(`mailto:${lead.email}`, '_self');
    }
  };

  const handleSchedule = () => {
    // TODO: Ouvrir modal de planification RDV
    console.log('Schedule appointment for:', lead?.id);
  };

  const handleSyncHubSpot = () => {
    // TODO: Sync avec HubSpot
    console.log('Sync with HubSpot:', lead?.id);
  };

  const handleCreatePayment = () => {
    // TODO: Créer paiement Stripe
    console.log('Create payment for:', lead?.id);
  };

  if (isLoading) {
    return (
      <CloserLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </CloserLayout>
    );
  }

  if (!lead) {
    return (
      <CloserLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-primary mb-4">Lead non trouvé</h2>
          <Button onClick={() => navigate('/dashboard-closer')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au pipeline
          </Button>
        </div>
      </CloserLayout>
    );
  }

  return (
    <CloserLayout>
      <div className="space-y-6">
        {/* Header avec navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard-closer')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="font-playfair text-3xl text-primary">{lead.full_name}</h1>
              <p className="text-muted-foreground">
                Créé {formatDistanceToNow(new Date(lead.created_at), { 
                  addSuffix: true, 
                  locale: fr 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getScoreBadge(lead.score)}
            {getStatusBadge(lead.status)}
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline des interactions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair text-xl">Timeline des Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <InteractionsTimeline leadId={lead.id} />
              </CardContent>
            </Card>

            {/* Deals associés */}
            {deals && deals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair text-xl">Deals Associés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deals.map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{deal.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Montant: {(deal.amount_cents / 100).toLocaleString('fr-FR')} €
                          </p>
                        </div>
                        <Badge variant="outline">{deal.stage}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Informations et actions */}
          <div className="space-y-6">
            {/* Informations du lead */}
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{lead.email}</p>
                </div>
                
                {lead.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                    <p className="text-sm">{lead.phone}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Source</label>
                  <Badge variant="outline" className="mt-1">{lead.source}</Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Intérêt</label>
                  <p className="text-sm">{lead.interest || 'Non spécifié'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair text-lg">Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.phone && (
                  <Button onClick={handleCall} className="w-full" variant="outline">
                    <Phone className="mr-2 h-4 w-4" />
                    Appeler
                  </Button>
                )}
                
                <Button onClick={handleEmail} className="w-full" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Envoyer Email
                </Button>
                
                <Button onClick={handleSchedule} className="w-full" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Planifier RDV
                </Button>
                
                <Separator />
                
                <Button onClick={handleSyncHubSpot} className="w-full" variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Sync HubSpot
                </Button>
                
                <Button onClick={handleCreatePayment} className="w-full" variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Créer Paiement
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CloserLayout>
  );
};

export default LeadDetail;
