import { Droppable, Draggable } from '@hello-pangea/dnd';
import { LeadCard } from './LeadCard';
import { STAGE_TOKENS } from './stageTokens';
import { formatAmountCents, type DealStage, type DealWithLead } from '@/lib/services/meet.service';

interface KanbanColumnProps {
  stage: DealStage;
  title: string;
  deals: DealWithLead[];
  isUpdating: boolean;
}

/**
 * Colonne du pipeline. Grammaire Linear : largeur fixe, filet fin, entête
 * collante, densité d'information — pas d'aplat coloré ni d'ombre portée
 * décorative. Le seul signal chromatique est la pastille de stade, doublée du
 * libellé (voir stageTokens.ts).
 */
export const KanbanColumn = ({ stage, title, deals, isUpdating }: KanbanColumnProps) => {
  const token = STAGE_TOKENS[stage];

  // Somme des montants de la colonne — un closer lit d'abord la valeur du stade.
  // Les affaires sans montant sont ignorées, elles ne valent pas zéro.
  const valued = deals.filter((deal) => deal.amount_cents != null);
  const currency = valued[0]?.currency ?? 'DZD';
  const totalCents = valued.reduce((sum, deal) => sum + (deal.amount_cents ?? 0), 0);

  return (
    <section
      aria-label={`${title} — ${token.srLabel}`}
      className="flex w-[286px] shrink-0 flex-col rounded-[var(--radius)] border border-hairline bg-surface-2/60"
    >
      {/* Filet de stade — 2 px, le seul aplat de couleur autorisé. */}
      <div className={`h-0.5 w-full rounded-t-[var(--radius)] ${token.rail}`} aria-hidden="true" />

      <header className="sticky top-0 z-10 rounded-t-[var(--radius)] bg-surface-2/95 px-3 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${token.dot}`} aria-hidden="true" />
          <h3 className={`min-w-0 flex-1 truncate font-inter text-[0.8125rem] font-semibold tracking-tight ${token.title}`}>
            {title}
          </h3>
          <span className="tuc-numeric rounded-full bg-background/70 px-1.5 py-0.5 text-2xs font-medium text-muted-foreground">
            {deals.length}
          </span>
        </div>

        {valued.length > 0 && (
          <p className="tuc-numeric mt-1 pl-3.5 text-2xs text-muted-foreground">
            {formatAmountCents(totalCents, currency)}
          </p>
        )}
      </header>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2 px-2 pb-2 transition-colors duration-150 ${
              snapshot.isDraggingOver ? token.dropTint : ''
            } ${isUpdating ? 'pointer-events-none opacity-60' : ''}`}
            style={{ minHeight: 180 }}
          >
            {deals.map((deal, index) => (
              <Draggable key={deal.id} draggableId={deal.id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={
                      dragSnapshot.isDragging
                        ? 'shadow-raised [&>*]:border-primary/60'
                        : 'transition-shadow duration-150'
                    }
                  >
                    <LeadCard deal={deal} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {deals.length === 0 && !snapshot.isDraggingOver && (
              <p className="px-2 py-6 text-center text-2xs text-muted-foreground/70">
                Aucune affaire
              </p>
            )}
          </div>
        )}
      </Droppable>
    </section>
  );
};
