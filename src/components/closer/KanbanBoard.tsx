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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      <Card>
        <CardHeader>
          <CardTitle>Pipeline d'affaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalDeals = deals?.length ?? 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-playfair text-xl">Pipeline d'affaires</CardTitle>
          <Badge variant="secondary" className="text-sm">
            {totalDeals} affaire{totalDeals > 1 ? 's' : ''} au total
          </Badge>
        </div>
        {unmatchedDeals.length > 0 && (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {unmatchedDeals.length} affaire{unmatchedDeals.length > 1 ? 's' : ''} avec un stade
              inconnu — masquée{unmatchedDeals.length > 1 ? 's' : ''} du pipeline, voir la console.
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
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
      </CardContent>
    </Card>
  );
};
