import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RefreshCw, CheckCircle2, Flame, Thermometer, Snowflake, Sparkles } from 'lucide-react';
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
 * Signal de température appliqué à la carte.
 * Charte TUC : chaud = filet or et fond or pâle ; tiède = contour or sans
 * remplissage ; froid = filet neutre. Aucun halo, aucun néon (charte §8).
 *
 * WCAG 1.4.1 : la couleur ne porte jamais seule le sens — l'icône et le libellé
 * (« Chaud », « Tiède », « Froid ») accompagnent systématiquement la teinte.
 */
const TEMPERATURE_CARD_CLASS = {
  chaud: 'border-gold bg-gold-soft/50',
  tiede: 'border-gold-ink/45',
  froid: 'border-hairline',
} as const;

const TEMPERATURE_CHIP_CLASS = {
  chaud: 'border-gold-ink/50 bg-gold-soft/80 text-gold-ink',
  tiede: 'border-gold-ink/45 text-gold-ink',
  froid: 'border-hairline text-muted-foreground',
} as const;

const TEMPERATURE_ICON = {
  chaud: Flame,
  tiede: Thermometer,
  froid: Snowflake,
} as const;

/** Libellés lisibles des sources — la source est une information, pas une décoration. */
const SOURCE_LABELS: Record<string, string> = {
  chatbot: 'Chatbot',
  website: 'Site web',
  referral: 'Recommandation',
  ads: 'Publicité',
  audit: 'Audit',
};

export const LeadCard = ({ deal, hubspotSynced = false, onSyncSuccess }: LeadCardProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { lead } = deal;

  const temperature = resolveTemperature(lead.score, lead.temperature_override);
  const TemperatureIcon = TEMPERATURE_ICON[temperature];
  const isQualified = lead.qualification === 'qualifie';
  /*
   * Sans arbitrage humain, la température est déduite du score par le moteur de
   * scoring. Le violet le signale — le closer doit savoir à tout instant si ce
   * qu'il lit vient de lui ou de la machine. C'est le volet technologique de
   * TUC rendu visible là où il compte : dans la décision.
   */
  const isMachineDerived = lead.temperature_override == null;

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
        description:
          error instanceof Error ? error.message : 'Impossible de synchroniser avec HubSpot',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-[calc(var(--radius)-2px)] border bg-surface-1 p-3 pl-3.5 transition-shadow duration-150 hover:shadow-soft ${TEMPERATURE_CARD_CLASS[temperature]}`}
    >
      {/* Liseré de qualification — doublé du libellé plus bas, jamais seul (WCAG 1.4.1). */}
      {lead.qualification !== 'non_evalue' && (
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 w-[3px] ${
            isQualified ? 'bg-secondary' : 'bg-muted-foreground/35'
          }`}
        />
      )}

      {/* Nom + température */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="min-w-0 flex-1 truncate text-sm font-semibold leading-snug text-ink-strong">
          {lead.full_name}
        </h4>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-2xs font-medium ${TEMPERATURE_CHIP_CLASS[temperature]}`}
          title={
            isMachineDerived
              ? `Température déduite du score (${lead.score}/100) par le moteur de scoring`
              : 'Température fixée par le closer'
          }
        >
          <TemperatureIcon className="h-3 w-3" aria-hidden="true" />
          {LEAD_TEMPERATURE_LABELS[temperature]}
          {isMachineDerived && (
            <>
              <Sparkles className="h-2.5 w-2.5 text-tech" aria-hidden="true" />
              <span className="sr-only">déduite par le moteur de scoring</span>
            </>
          )}
        </span>
      </div>

      <p className="mt-0.5 truncate text-2xs text-muted-foreground">{lead.email}</p>

      {/* Affaire : l'offre et son montant sont la ligne que le closer lit en premier. */}
      <div className="mt-2 flex items-baseline justify-between gap-2 border-t border-hairline pt-2">
        <span className="min-w-0 truncate text-xs text-foreground">{deal.offer_name}</span>
        <span className="tuc-numeric shrink-0 text-xs font-semibold text-ink-strong">
          {formatAmountCents(deal.amount_cents, deal.currency)}
        </span>
      </div>

      {/* Qualification, source, ancienneté */}
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-muted-foreground">
        {lead.qualification !== 'non_evalue' && (
          <span className={isQualified ? 'font-medium text-secondary' : ''}>
            {LEAD_QUALIFICATION_LABELS[lead.qualification]}
          </span>
        )}
        {lead.qualification !== 'non_evalue' && <span aria-hidden="true">·</span>}
        <span>{SOURCE_LABELS[lead.source] ?? lead.source}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={lead.created_at}>
          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: fr })}
        </time>
      </div>

      {/* HubSpot — affiché seulement quand il y a quelque chose à faire ou à dire. */}
      {(hubspotSynced || lead.score >= 75) && (
        <div className="mt-2 flex justify-end">
          {hubspotSynced ? (
            <span className="inline-flex items-center gap-1 text-2xs text-secondary">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              HubSpot
            </span>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-2xs text-muted-foreground hover:text-foreground"
              onClick={handleSyncToHubSpot}
              disabled={isSyncing}
            >
              <RefreshCw
                className={`mr-1 h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              {isSyncing ? 'Sync…' : 'Envoyer vers HubSpot'}
            </Button>
          )}
        </div>
      )}
    </article>
  );
};
