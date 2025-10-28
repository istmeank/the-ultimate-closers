import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  Calendar, 
  TrendingUp, 
  Target,
  Users,
  DollarSign
} from 'lucide-react';

export const StatsCards = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['closerStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Requêtes parallèles pour les KPIs
      const [hotLeads, upcomingAppointments, activeDeals, totalRevenue] = await Promise.all([
        // Leads chauds (score >= 75)
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id)
          .gte('score', 75),
        
        // RDV à venir (7 prochains jours)
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', user.id)
          .gte('start_at', new Date().toISOString())
          .lt('start_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Deals en cours
        supabase
          .from('deals')
          .select('*, leads!inner(*)', { count: 'exact', head: true })
          .eq('leads.owner_id', user.id)
          .in('stage', ['qualified', 'proposal', 'negotiation']),
        
        // CA généré (deals won)
        supabase
          .from('deals')
          .select('amount_cents')
          .eq('stage', 'won')
          .eq('leads.owner_id', user.id)
      ]);

      const totalRevenueAmount = totalRevenue.data?.reduce((sum, deal) => sum + (deal.amount_cents || 0), 0) / 100 || 0;

      return {
        hotLeads: hotLeads.count || 0,
        upcomingAppointments: upcomingAppointments.count || 0,
        activeDeals: activeDeals.count || 0,
        totalRevenue: totalRevenueAmount
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Leads Chauds',
      value: stats?.hotLeads || 0,
      icon: Flame,
      description: 'Score ≥ 75',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'RDV à Venir',
      value: stats?.upcomingAppointments || 0,
      icon: Calendar,
      description: '7 prochains jours',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Deals Actifs',
      value: stats?.activeDeals || 0,
      icon: TrendingUp,
      description: 'En négociation',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'CA Généré',
      value: `€${stats?.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: 'Deals gagnés',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className={`${stat.borderColor} ${stat.bgColor} hover:shadow-lg transition-shadow`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
