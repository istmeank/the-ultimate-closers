import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RefreshCw, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { integrationsService } from '@/lib/services/integrations.service';
import { useToast } from '@/hooks/use-toast';

interface LeadCardProps {
  lead: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    score: number;
    source: string;
    created_at: string;
    status: string;
  };
  hubspotSynced?: boolean;
  onSyncSuccess?: () => void;
}

export const LeadCard = ({ lead, hubspotSynced = false, onSyncSuccess }: LeadCardProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSyncToHubSpot = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSyncing(true);

    try {
      await integrationsService.syncLead(lead.id, 'create');

      toast({
        title: 'Synchronisé',
        description: `${lead.full_name} a été synchronisé avec HubSpot`,
      });

      onSyncSuccess?.();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de synchroniser avec HubSpot',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };
  const getScoreBadge = (score: number) => {
    if (score >= 75) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">🔥 {score}</Badge>;
    }
    if (score >= 50) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">⚡ {score}</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800 border-red-200">❄️ {score}</Badge>;
  };

  const getSourceBadge = (source: string) => {
    const sourceColors = {
      chatbot: 'bg-purple-100 text-purple-800',
      website: 'bg-blue-100 text-blue-800',
      referral: 'bg-green-100 text-green-800',
      ads: 'bg-yellow-100 text-yellow-800',
      audit: 'bg-pink-100 text-pink-800',
    };
    
    return (
      <Badge className={sourceColors[source as keyof typeof sourceColors] || 'bg-gray-100 text-gray-800'}>
        {source}
      </Badge>
    );
  };


  return (
    <Card className="group relative overflow-hidden p-4 border-2 hover:border-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer bg-background dark:bg-black/80">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10 opacity-50 group-hover:opacity-100 transition-opacity" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--secondary)/0.15),transparent_70%)]" />

      <CardContent className="relative z-10 p-0 space-y-3">
        {/* Header avec nom et score */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-primary dark:text-gold truncate">
              {lead.full_name}
            </h4>
            <p className="text-sm text-muted-foreground dark:text-white/70 truncate">
              {lead.email}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            {getScoreBadge(lead.score)}
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Source et date */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {getSourceBadge(lead.source)}
          </div>
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(lead.created_at), { 
              addSuffix: true, 
              locale: fr 
            })}
          </span>
        </div>
        
        {/* Status and HubSpot sync */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              lead.status === 'won' ? 'bg-green-500' :
              lead.status === 'lost' ? 'bg-red-500' :
              lead.status === 'in_progress' ? 'bg-orange-500' :
              lead.status === 'qualified' ? 'bg-blue-500' :
              'bg-gray-500'
            }`} />
            <span className="text-xs text-muted-foreground capitalize">
              {lead.status.replace('_', ' ')}
            </span>
          </div>

          {hubspotSynced ? (
            <Badge variant="outline" className="text-xs gap-1 bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="w-3 h-3" />
              HubSpot
            </Badge>
          ) : lead.score >= 75 ? (
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs px-2"
              onClick={handleSyncToHubSpot}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Sync
                </>
              )}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};