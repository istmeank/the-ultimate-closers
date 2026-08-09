import { useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/services/auth.service';
import {
  meetService,
  DEAL_STAGE_ORDER,
  DEAL_STAGE_LABELS,
  computeNextPreviousStage,
  isDealStage,
  type DealStage,
  type DealWithLead,
} from '@/lib/services/meet.service';
import { KanbanColumn } from './KanbanColumn';
import { AlertTriangle } from 'lucide-react';

type DealsByStage = Record<DealStage, DealWithLead[]>;

const emptyDealsByStage = (): DealsByStage =>
  DEAL_STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = [];
    return acc;
  }, {} as DealsByStage);

export const KanbanBoard = () => {
  const queryClient = useQueryClient();

  // Récupérer les affaires (deals) du closer connecté, avec le lead dénormalisé
  const { data: deals, isLoading } = useQuery({
    queryKey: ['closerDeals'],
    queryFn: async () => {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      return meetService.listForCloser(user.id);
    },
  });

  // Mutation pour déplacer une affaire vers un nouveau stade
  const updateDealStage = useMutation({
    mutationFn: async (vars: {
      dealId: string;
      stage: DealStage;
      previousStage: DealStage | null;
    }) => {
      await meetService.updateStage(vars.dealId, {
        stage: vars.stage,
        previousStage: vars.previousStage,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closerDeals'] });
    },
  });

  // Organiser les affaires par stade. Garde-fou : une affaire dont le stade ne
  // correspond à aucune des 7 colonnes ne doit jamais disparaître en silence
  // (bug constaté sur l'ancien filtrage strict par leads.status).
  const { dealsByStage, unmatchedDeals } = useMemo(() => {
    const organized = emptyDealsByStage();
    const unmatched: DealWithLead[] = [];

    for (const deal of deals ?? []) {
      if (isDealStage(deal.stage)) {
        organized[deal.stage].push(deal);
      } else {
        unmatched.push(deal);
      }
    }

    return { dealsByStage: organized, unmatchedDeals: unmatched };
  }, [deals]);

  if (unmatchedDeals.length > 0) {
    console.error(
      `KanbanBoard : ${unmatchedDeals.length} affaire(s) avec un stade inconnu, ` +
        'exclue(s) des 7 colonnes pour éviter un affichage incohérent :',
      unmatchedDeals.map((d) => ({ id: d.id, stage: d.stage }))
    );
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const destinationStage = destination.droppableId as DealStage;
    const sourceStage = source.droppableId as DealStage;
    const deal = (deals ?? []).find((d) => d.id === draggableId);
    if (!deal) return;

    const nextPreviousStage = computeNextPreviousStage(
      sourceStage,
      deal.previous_stage,
      destinationStage
    );

    try {
      await updateDealStage.mutateAsync({
        dealId: draggableId,
        stage: destinationStage,
        previousStage: nextPreviousStage,
      });
    } catch (error) {
      console.error('Error updating deal stage:', error);
    }
  };

  if (isLoading) {
    return (
      <section className="tuc-panel p-4" aria-busy="true">
        <div className="tuc-eyebrow mb-4">Pipeline d'affaires</div>
        <div className="flex gap-3 overflow-hidden">
          {DEAL_STAGE_ORDER.map((stage) => (
            <div
              key={stage}
              className="h-56 w-[286px] shrink-0 animate-pulse rounded-[var(--radius)] border border-hairline bg-surface-2/60"
            />
          ))}
        </div>
        <span className="sr-only">Chargement du pipeline…</span>
      </section>
    );
  }

  const totalDeals = deals?.length ?? 0;

  return (
    <section className="tuc-panel overflow-hidden">
      <header className="tuc-hairline flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
        <div>
          <h2 className="font-display text-lg leading-tight text-ink-strong">Pipeline d'affaires</h2>
          <p className="tuc-eyebrow mt-0.5">
            {totalDeals} affaire{totalDeals > 1 ? 's' : ''} · {DEAL_STAGE_ORDER.length} stades
          </p>
        </div>
        <p className="text-2xs text-muted-foreground">
          Glissez une carte pour changer son stade
        </p>
      </header>

      {unmatchedDeals.length > 0 && (
        <div
          role="status"
          className="flex items-start gap-2 border-b border-hairline bg-bordeaux-soft px-4 py-2.5 text-sm text-bordeaux"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {unmatchedDeals.length} affaire{unmatchedDeals.length > 1 ? 's' : ''} avec un stade
            inconnu — masquée{unmatchedDeals.length > 1 ? 's' : ''} du pipeline, voir la console.
          </span>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        {/*
          Défilement horizontal plutôt qu'une grille de 7 colonnes écrasées :
          en dessous de 1 900 px, sept colonnes en grille rendent chaque carte
          illisible. Le rail garde une largeur de colonne constante à toutes les
          tailles d'écran, y compris sur mobile.
        */}
        <div className="flex gap-3 overflow-x-auto px-4 py-4">
          {DEAL_STAGE_ORDER.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              title={DEAL_STAGE_LABELS[stage]}
              deals={dealsByStage[stage]}
              isUpdating={updateDealStage.isPending}
            />
          ))}
        </div>
      </DragDropContext>
    </section>
  );
};
