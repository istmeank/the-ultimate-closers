import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RefreshCw, CheckCircle2, MoreHorizontal, Flame, Thermometer, Snowflake } from 'lucide-react';
import { useState } from 'react';
import { integrationsService } from '@/lib/services/integrations.service';
import { useToast } from '@/hooks/use-toast';
import {
  LEAD_QUALIFICATION_LABELS,
  LEAD_TEMPERATURE_LABELS,
  resolveTemperature,
} from '@/lib/services/leads.service';
import { formatAmountCents, type DealWithLead } from '@/lib/services/meet.service';

interface LeadCardProps {
  deal: DealWithLead;
  hubspotSynced?: boolean;
  onSyncSuccess?: () => void;
}

/**
 * Classes du signal température appliquées à la carte elle-même.
 * Règle charte TUC : chaud = fond/bordure or + halo --glow-gold ; tiède =
 * contour or sans remplissage ni halo ; froid = bordure --border, aucun halo.
 * Jamais de texte or sur fond crème : le texte du badge chaud est en malachite
 * (text-secondary), pas en or, pour respecter le contraste (charte TUC).
 */
const TEMPERATURE_CARD_CLASS = {
  chaud: 'border-2 border-primary bg-primary/10 shadow-[var(--glow-gold)]',
  tiede: 'border-2 border-primary bg-transparent',
  froid: 'border-2 border-border',
} as const;

const TEMPERATURE_BADGE_CLASS = {
  chaud: 'bg-primary text-secondary border-transparent',
  tiede: 'border-primary text-primary bg-transparent',
  froid: 'border-border text-muted-foreground bg-transparent',
} as const;

const TEMPERATURE_ICON = {
  chaud: Flame,
  tiede: Thermometer,
  froid: Snowflake,
} as const;

export const LeadCard = ({ deal, hubspotSynced = false, onSyncSuccess }: LeadCardProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { lead } = deal;

  const temperature = resolveTemperature(lead.score, lead.temperature_override);
  const TemperatureIcon = TEMPERATURE_ICON[temperature];

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
    <Card
      className={`group relative overflow-hidden p-4 hover:shadow-xl hover:-translate-y-2 cursor-pointer bg-background dark:bg-black/80 transition-all duration-300 ${TEMPERATURE_CARD_CLASS[temperature]}`}
    >
      {/* Liseré de qualification — jamais seul porteur du sens : toujours accompagné du libellé (WCAG 1.4.1). */}
      {lead.qualification !== 'non_evalue' && (
        <div
          aria-hidden="true"
          className={`absolute left-0 top-0 bottom-0 w-1.5 ${
            lead.qualification === 'qualifie' ? 'bg-secondary' : 'bg-muted-foreground/40'
          }`}
        />
      )}

      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10 opacity-50 group-hover:opacity-100 transition-opacity" />

      <CardContent className="relative z-10 p-0 space-y-3 pl-2">
        {/* Header avec nom et menu */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-primary dark:text-gold truncate">
              {lead.full_name}
            </h4>
            <p className="text-sm text-muted-foreground dark:text-white/70 truncate">
              {lead.email}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-2 shrink-0">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>

        {/* Affaire : offre + montant */}
        <div className="text-xs">
          <span className="font-medium text-foreground dark:text-white">{deal.offer_name}</span>
          <span className="text-muted-foreground"> · {formatAmountCents(deal.amount_cents, deal.currency)}</span>
        </div>

        {/* Qualification et température — deux signaux, toujours texte + couleur */}
        <div className="flex flex-wrap items-center gap-2">
          {lead.qualification !== 'non_evalue' && (
            <Badge
              variant="outline"
              className={
                lead.qualification === 'qualifie'
                  ? 'border-secondary text-secondary'
                  : 'border-muted-foreground/40 text-muted-foreground'
              }
            >
              {LEAD_QUALIFICATION_LABELS[lead.qualification]}
            </Badge>
          )}
          <Badge variant="outline" className={`gap-1 ${TEMPERATURE_BADGE_CLASS[temperature]}`}>
            <TemperatureIcon className="h-3 w-3" aria-hidden="true" />
            {LEAD_TEMPERATURE_LABELS[temperature]}
          </Badge>
        </div>

        {/* Source et date */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {getSourceBadge(lead.source)}
          </div>
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(lead.created_at), {
              addSuffix: true,
              locale: fr,
            })}
          </span>
        </div>

        {/* HubSpot sync */}
        <div className="flex items-center justify-end gap-2">
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
