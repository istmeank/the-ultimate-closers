import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Phone, Mail, Calendar, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  status: string;
  score: number;
  source: string;
  created_at: string;
  owner_id: string;
}

interface LeadCardProps {
  lead: Lead;
}

export const LeadCard = ({ lead }: LeadCardProps) => {
  const navigate = useNavigate();

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

  const handleCall = () => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_self');
    }
  };

  const handleEmail = () => {
    window.open(`mailto:${lead.email}`, '_self');
  };

  const handleSchedule = () => {
    // TODO: Ouvrir modal de planification RDV
    console.log('Schedule appointment for:', lead.id);
  };

  const handleViewDetails = () => {
    navigate(`/dashboard-closer/lead/${lead.id}`);
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-primary/20 hover:border-primary/40">
      <CardContent className="p-0 space-y-3">
        {/* Header avec nom et score */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-primary truncate">
              {lead.full_name}
            </h4>
            <p className="text-sm text-muted-foreground truncate">
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

        {/* Actions rapides */}
        <div className="flex gap-1 pt-2 border-t border-primary/10">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={handleViewDetails}
          >
            <Eye className="h-3 w-3 mr-1" />
            Voir
          </Button>
          {lead.phone && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 h-8 text-xs"
              onClick={handleCall}
            >
              <Phone className="h-3 w-3 mr-1" />
              Appeler
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={handleEmail}
          >
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};