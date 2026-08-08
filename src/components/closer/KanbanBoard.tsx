import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/services/auth.service';
import { leadsService } from '@/lib/services/leads.service';
import { KanbanColumn } from './KanbanColumn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface LeadsByStatus {
  [key: string]: Lead[];
}

const columns = [
  { id: 'new', title: 'Nouveau', color: 'violet', description: 'Nouveaux leads' },
  { id: 'qualified', title: 'Qualifié', color: 'blue', description: 'Leads qualifiés' },
  { id: 'in_progress', title: 'En cours', color: 'orange', description: 'En négociation' },
  { id: 'won', title: 'Gagné', color: 'green', description: 'Deals conclus' },
  { id: 'lost', title: 'Perdu', color: 'red', description: 'Opportunités perdues' }
];

export const KanbanBoard = () => {
  const queryClient = useQueryClient();
  const [leadsByStatus, setLeadsByStatus] = useState<LeadsByStatus>({});

  // Récupérer les leads du closer connecté
  const { data: leads, isLoading } = useQuery({
    queryKey: ['closerLeads'],
    queryFn: async () => {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const data = await leadsService.listForCloser(user.id);
      return data as unknown as Lead[];
    },
  });

  // Mutation pour mettre à jour le statut d'un lead
  const updateLeadStatus = useMutation({
    mutationFn: async ({ leadId, newStatus }: { leadId: string; newStatus: string }) => {
      await leadsService.updateStatus(leadId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closerLeads'] });
    },
  });

  // Organiser les leads par statut
  useEffect(() => {
    if (leads) {
      const organized: LeadsByStatus = {};
      columns.forEach(col => {
        organized[col.id] = leads.filter(lead => lead.status === col.id);
      });
      setLeadsByStatus(organized);
    }
  }, [leads]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Si pas de destination, on ne fait rien
    if (!destination) return;

    // Si même colonne et même position, on ne fait rien
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Mettre à jour le statut du lead
    try {
      await updateLeadStatus.mutateAsync({
        leadId: draggableId,
        newStatus: destination.droppableId,
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Kanban</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalLeads = leads?.length || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-playfair text-xl">Pipeline Kanban</CardTitle>
          <Badge variant="secondary" className="text-sm">
            {totalLeads} leads au total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                leads={leadsByStatus[column.id] || []}
                isUpdating={updateLeadStatus.isPending}
              />
            ))}
          </div>
        </DragDropContext>
      </CardContent>
    </Card>
  );
};