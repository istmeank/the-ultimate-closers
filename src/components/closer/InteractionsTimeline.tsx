import { useQuery } from '@tanstack/react-query';
import { leadsService } from '@/lib/services/leads.service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  FileText, 
  ExternalLink,
  User
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Interaction {
  id: string;
  lead_id: string;
  type: string;
  content: string;
  created_at: string;
  by_user_id: string | null;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface InteractionsTimelineProps {
  leadId: string;
}

export const InteractionsTimeline = ({ leadId }: InteractionsTimelineProps) => {
  const { data: interactions, isLoading } = useQuery({
    queryKey: ['interactions', leadId],
    queryFn: async () => {
      const data = await leadsService.listInteractions(leadId);
      return data as unknown as Interaction[];
    },
  });

  const getInteractionIcon = (type: string) => {
    const icons = {
      call: Phone,
      email: Mail,
      meeting: Calendar,
      note: FileText,
      message: MessageSquare,
      whatsapp: MessageSquare,
      hubspot: ExternalLink,
    };
    
    const Icon = icons[type as keyof typeof icons] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const getInteractionColor = (type: string) => {
    const colors = {
      call: 'bg-green-100 text-green-800',
      email: 'bg-blue-100 text-blue-800',
      meeting: 'bg-purple-100 text-purple-800',
      note: 'bg-gray-100 text-gray-800',
      message: 'bg-yellow-100 text-yellow-800',
      whatsapp: 'bg-green-100 text-green-800',
      hubspot: 'bg-orange-100 text-orange-800',
    };
    
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getInteractionLabel = (type: string) => {
    const labels = {
      call: 'Appel téléphonique',
      email: 'Email',
      meeting: 'Rendez-vous',
      note: 'Note',
      message: 'Message',
      whatsapp: 'WhatsApp',
      hubspot: 'HubSpot',
    };
    
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!interactions || interactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Aucune interaction enregistrée</p>
        <p className="text-sm">Les interactions apparaîtront ici au fur et à mesure</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction) => (
        <div key={interaction.id} className="flex gap-4">
          {/* Avatar/Icon */}
          <div className="flex-shrink-0">
            {interaction.by_user_id ? (
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {interaction.profiles?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                {getInteractionIcon(interaction.type)}
              </div>
            )}
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getInteractionColor(interaction.type)}>
                      {getInteractionIcon(interaction.type)}
                      <span className="ml-1">{getInteractionLabel(interaction.type)}</span>
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(interaction.created_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {interaction.content || 'Aucun contenu'}
                  </p>
                  
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(interaction.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </div>
                </div>

                {/* Auteur */}
                {interaction.by_user_id && interaction.profiles && (
                  <div className="mt-2 pt-2 border-t border-muted">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{interaction.profiles.full_name}</span>
                      <span>•</span>
                      <span>{interaction.profiles.email}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
};
