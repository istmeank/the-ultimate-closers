import { useQuery } from '@tanstack/react-query';
import { leadsService } from '@/lib/services/leads.service';
import type { InteractionType, LeadInteraction } from '@/lib/services/leads.service';
import {
  INTERACTION_TYPE_LABELS,
  translateChannel,
} from '@/lib/services/leads.service';
import { DEAL_STAGE_LABELS, formatAmountCents } from '@/lib/services/meet.service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  MessageCircle,
  Send,
  Instagram,
  FileText,
  User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InteractionsTimelineProps {
  leadId: string;
}

/** Icône par type réel d'interaction (contrainte CHECK `interactions.type`). */
const INTERACTION_ICON: Record<InteractionType, LucideIcon> = {
  call: Phone,
  msg: MessageSquare,
  email: Mail,
  meet: Calendar,
  whatsapp: MessageSquare,
  telegram: Send,
  messenger: MessageCircle,
  instagram: Instagram,
  note: FileText,
};

/** Habillage décoratif par type — pas un jeton de sens, juste un repère visuel. */
const INTERACTION_COLOR: Record<InteractionType, string> = {
  call: 'bg-green-100 text-green-800',
  msg: 'bg-yellow-100 text-yellow-800',
  email: 'bg-blue-100 text-blue-800',
  meet: 'bg-accent/15 text-accent',
  whatsapp: 'bg-green-100 text-green-800',
  telegram: 'bg-sky-100 text-sky-800',
  messenger: 'bg-indigo-100 text-indigo-800',
  instagram: 'bg-orange-100 text-orange-800',
  note: 'bg-gray-100 text-gray-800',
};

/**
 * Formatte une date/heure dans le fuseau du navigateur — aucune option
 * `timeZone` n'est passée à `Intl.DateTimeFormat`, donc le runtime utilise le
 * fuseau local de qui regarde l'écran. C'est tout l'objet du changement : ne
 * jamais réintroduire un fuseau figé (ex: 'Europe/Paris', 'Africa/Algiers').
 */
const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

/** Contenu structuré si `metadata` est renseigné, sinon repli sur `content`. */
function hasStructuredMetadata(
  interaction: LeadInteraction
): interaction is LeadInteraction & {
  metadata: Extract<LeadInteraction['metadata'], { kind: string }>;
} {
  return Boolean(interaction.metadata) && 'kind' in interaction.metadata;
}

const InteractionBody = ({ interaction }: { interaction: LeadInteraction }) => {
  if (hasStructuredMetadata(interaction)) {
    const { metadata } = interaction;

    if (metadata.kind === 'appointment_created') {
      return (
        <div className="space-y-1">
          <p className="text-sm text-foreground dark:text-white">Rendez-vous programmé</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(metadata.start_at)} → {formatDateTime(metadata.end_at)} ·{' '}
            {translateChannel(metadata.channel)}
          </p>
        </div>
      );
    }

    if (metadata.kind === 'deal_created') {
      return (
        <div className="space-y-1">
          <p className="text-sm text-foreground dark:text-white">
            Affaire créée — {metadata.offer_name}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatAmountCents(metadata.amount_cents, metadata.currency)} ·{' '}
            {DEAL_STAGE_LABELS[metadata.stage]}
          </p>
        </div>
      );
    }
  }

  return (
    <p className="text-sm text-muted-foreground">{interaction.content || 'Aucun contenu'}</p>
  );
};

export const InteractionsTimeline = ({ leadId }: InteractionsTimelineProps) => {
  const { data: interactions, isLoading } = useQuery({
    queryKey: ['interactions', leadId],
    queryFn: () => leadsService.listInteractions(leadId),
  });

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
      {interactions.map((interaction) => {
        const Icon = INTERACTION_ICON[interaction.type] ?? FileText;
        return (
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
                  <Icon className="h-4 w-4" />
                </div>
              )}
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={INTERACTION_COLOR[interaction.type] ?? 'bg-gray-100 text-gray-800'}>
                        <Icon className="h-4 w-4" />
                        <span className="ml-1">
                          {INTERACTION_TYPE_LABELS[interaction.type] ?? interaction.type}
                        </span>
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(interaction.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <InteractionBody interaction={interaction} />

                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(interaction.created_at)}
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
        );
      })}
    </div>
  );
};
