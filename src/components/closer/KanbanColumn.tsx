import { Droppable, Draggable } from '@hello-pangea/dnd';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadCard } from './LeadCard';
import type { DealStage, DealWithLead } from '@/lib/services/meet.service';

interface KanbanColumnProps {
  stage: DealStage;
  title: string;
  deals: DealWithLead[];
  isUpdating: boolean;
}

/** Habillage décoratif par stade — pas un jeton de sens (ne remplace jamais un libellé). */
const STAGE_SURFACE: Record<DealStage, string> = {
  opportunite: 'border-violet-200 bg-violet-50/50 dark:border-violet-900/40 dark:bg-violet-950/20',
  programme: 'border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20',
  a_reprogrammer: 'border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20',
  a_relancer: 'border-orange-200 bg-orange-50/50 dark:border-orange-900/40 dark:bg-orange-950/20',
  close: 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20',
  paye: 'border-primary/40 bg-primary/10',
  perdu: 'border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20',
};

export const KanbanColumn = ({ stage, title, deals, isUpdating }: KanbanColumnProps) => {
  return (
    <div
      className={`group relative overflow-hidden bg-background/80 dark:bg-black/80 backdrop-blur-sm rounded-2xl border-2 ${STAGE_SURFACE[stage]} transition-all hover:shadow-lg`}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10 opacity-30 group-hover:opacity-50 transition-opacity" />

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-playfair font-bold text-lg text-primary dark:text-gold">
            {title}
          </CardTitle>
          <Badge variant="outline" className="text-xs dark:text-white/80">
            {deals.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <Droppable droppableId={stage}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-3 min-h-[200px] transition-colors ${
                snapshot.isDraggingOver ? 'bg-primary/5 rounded-lg' : ''
              } ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {deals.map((deal, index) => (
                <Draggable key={deal.id} draggableId={deal.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-all ${
                        snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl' : 'hover:scale-105'
                      }`}
                    >
                      <LeadCard deal={deal} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {deals.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Aucune affaire
                </div>
              )}
            </div>
          )}
        </Droppable>
      </CardContent>
    </div>
  );
};
