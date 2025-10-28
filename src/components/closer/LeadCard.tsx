import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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
}

export const LeadCard = ({ lead }: LeadCardProps) => {
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
        
        {/* Status indicator */}
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
      </div>
    </Card>
  );
};
