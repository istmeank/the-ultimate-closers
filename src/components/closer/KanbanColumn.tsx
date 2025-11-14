import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadCard } from './LeadCard';

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

interface Column {
  id: string;
  title: string;
  color: string;
  description: string;
}

interface KanbanColumnProps {
  column: Column;
  leads: Lead[];
  isUpdating: boolean;
}

export const KanbanColumn = ({ column, leads, isUpdating }: KanbanColumnProps) => {
  const getColumnColor = (color: string) => {
    const colors = {
      violet: 'border-violet-200 bg-violet-50/50',
      blue: 'border-blue-200 bg-blue-50/50',
      orange: 'border-orange-200 bg-orange-50/50',
      green: 'border-green-200 bg-green-50/50',
      red: 'border-red-200 bg-red-50/50',
    };
    return colors[color as keyof typeof colors] || 'border-gray-200 bg-gray-50/50';
  };

  return (
    <div className={`group relative overflow-hidden bg-background/80 dark:bg-black/80 backdrop-blur-sm rounded-2xl border-2 ${getColumnColor(column.color)} transition-all hover:shadow-lg`}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10 opacity-30 group-hover:opacity-50 transition-opacity" />
      
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-playfair font-bold text-lg text-primary dark:text-gold">
            {column.title}
          </CardTitle>
          <Badge variant="outline" className="text-xs dark:text-white/80">
            {leads.length}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground dark:text-white/60">
          {column.description}
        </p>
      </CardHeader>
      
      <CardContent className="relative z-10 pt-0">
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-3 min-h-[200px] transition-colors ${
                snapshot.isDraggingOver ? 'bg-primary/5 rounded-lg' : ''
              } ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {leads.map((lead, index) => (
                <Draggable key={lead.id} draggableId={lead.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-all ${
                        snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl' : 'hover:scale-105'
                      }`}
                    >
                      <LeadCard lead={lead} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {leads.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Aucun lead
                </div>
              )}
            </div>
          )}
        </Droppable>
      </CardContent>
    </div>
  );
};
