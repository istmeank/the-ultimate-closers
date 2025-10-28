import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadCard } from './LeadCard';

const columns = [
  { id: 'new', title: 'Nouveau', color: 'violet' },
  { id: 'qualified', title: 'Qualifié', color: 'blue' },
  { id: 'in_progress', title: 'En cours', color: 'orange' },
  { id: 'won', title: 'Gagné', color: 'green' },
  { id: 'lost', title: 'Perdu', color: 'red' }
];

export const KanbanBoard = () => {
  const { data: leads, isLoading } = useQuery({
    queryKey: ['closerLeads'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columns.map((column) => (
          <Card key={column.id} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Grouper les leads par statut
  const leadsByStatus = leads?.reduce((acc, lead) => {
    const status = lead.status || 'new';
    if (!acc[status]) acc[status] = [];
    acc[status].push(lead);
    return acc;
  }, {} as Record<string, any[]>) || {};

  return (
    <div className="space-y-4">
      <h2 className="font-playfair text-2xl font-bold text-primary">
        Pipeline de Leads
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columns.map((column) => {
          const columnLeads = leadsByStatus[column.id] || [];
          
          return (
            <Card key={column.id} className={`border-2 border-${column.color}-200 bg-${column.color}-50/30`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{column.title}</span>
                  <Badge variant="secondary" className="bg-white/50">
                    {columnLeads.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {columnLeads.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="text-sm">Aucun lead</p>
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
