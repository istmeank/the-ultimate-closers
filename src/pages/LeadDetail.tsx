import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { leadsService, LEAD_STATUS_LABELS, type LeadStatus } from '@/lib/services/leads.service';
import { meetService, DEAL_STAGE_LABELS, formatAmountCents } from '@/lib/services/meet.service';
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
      return leadsService.getById(id);
    },
    enabled: !!id,
  });

  const { data: deals } = useQuery({
    queryKey: ['leadDeals', id],
    queryFn: async () => {
      if (!id) return [];
      return meetService.listDealsForLead(id);
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

  const getStatusBadge = (status: LeadStatus) => {
    const statusColors: Record<LeadStatus, string> = {
      new: 'bg-violet-100 text-violet-800',
      qualified: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {LEAD_STATUS_LABELS[status] || status}
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
            <h1 className="font-playfair text-3xl text-primary dark:text-gold">{lead.full_name}</h1>
            <p className="text-muted-foreground dark:text-white/70">
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
            <Card className="group relative overflow-hidden border-2 hover:border-secondary transition-all duration-300 bg-background dark:bg-black/80">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--secondary)/0.15),transparent_70%)]" />

              <CardHeader className="relative z-10">
                <CardTitle className="font-playfair text-xl dark:text-gold">Timeline des Interactions</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <InteractionsTimeline leadId={lead.id} />
              </CardContent>
            </Card>

            {/* Deals associés */}
            {deals && deals.length > 0 && (
              <Card className="group relative overflow-hidden border-2 hover:border-secondary transition-all duration-300 bg-background dark:bg-black/80">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10 opacity-50 group-hover:opacity-100 transition-opacity" />
                
                {/* Glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--secondary)/0.15),transparent_70%)]" />

                <CardHeader className="relative z-10">
                  <CardTitle className="font-playfair text-xl dark:text-gold">Deals Associés</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    {deals.map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-white/10">
                        <div>
                          <h4 className="font-semibold dark:text-white">{deal.offer_name}</h4>
                          <p className="text-sm text-muted-foreground dark:text-white/70">
                            Montant: {formatAmountCents(deal.amount_cents, deal.currency)}
                          </p>
                        </div>
                        <Badge variant="outline">{DEAL_STAGE_LABELS[deal.stage]}</Badge>
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
            <Card className="group relative overflow-hidden border-2 hover:border-secondary transition-all duration-300 bg-background dark:bg-black/80">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--secondary)/0.15),transparent_70%)]" />

              <CardHeader className="relative z-10">
                <CardTitle className="font-playfair text-lg dark:text-gold">Informations</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground dark:text-white/70">Email</label>
                  <p className="text-sm dark:text-white">{lead.email}</p>
                </div>
                
                {lead.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground dark:text-white/70">Téléphone</label>
                    <p className="text-sm dark:text-white">{lead.phone}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground dark:text-white/70">Source</label>
                  <Badge variant="outline" className="mt-1">{lead.source}</Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground dark:text-white/70">Intérêt</label>
                  <p className="text-sm dark:text-white">{lead.interest || 'Non spécifié'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="group relative overflow-hidden border-2 hover:border-secondary transition-all duration-300 bg-background dark:bg-black/80">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--secondary)/0.15),transparent_70%)]" />

              <CardHeader className="relative z-10">
                <CardTitle className="font-playfair text-lg dark:text-gold">Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
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
