import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeadCardProps {
  lead: {
    id: string;
    full_name: string;
    email: string;
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

  const handleSyncToHubSpot = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSyncing(true);

    try {
      const { data, error } = await supabase.functions.invoke('hubspot-sync', {
        body: { leadId: lead.id, action: 'create' },
      });

      if (error) throw error;

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
    const sourceColors: Record<string, string> = {
      'chatbot': 'bg-purple-100 text-purple-800',
      'audit': 'bg-blue-100 text-blue-800',
      'ads': 'bg-yellow-100 text-yellow-800',
      'referral': 'bg-green-100 text-green-800',
      'website': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={sourceColors[source] || 'bg-gray-100 text-gray-800'}>
        {source}
      </Badge>
    );
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary">
      <div className="space-y-3">
        {/* Header avec nom et score */}
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-sm leading-tight">{lead.full_name}</h4>
          {getScoreBadge(lead.score)}
        </div>
        
        {/* Email */}
        <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
        
        {/* Source et date */}
        <div className="flex justify-between items-center">
          {getSourceBadge(lead.source)}
          <span className="text-xs text-muted-foreground">
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
      </div>
    </Card>
  );
};
