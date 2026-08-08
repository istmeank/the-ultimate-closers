import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/services/auth.service';
import { leadsService } from '@/lib/services/leads.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, TrendingUp, Target } from 'lucide-react';

export const StatsCards = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['closerStats'],
    queryFn: async () => {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const stats = await leadsService.getCloserPipelineStats(user.id);
      return {
        hotLeads: stats.hotLeads,
        upcomingAppointments: stats.upcomingAppointments,
        activeDeals: stats.activeDeals,
        conversionRate: stats.conversionRate,
      };
    },
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
    },
    {
      title: 'RDV à Venir',
      value: stats?.upcomingAppointments || 0,
      icon: Calendar,
      description: '7 prochains jours',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Deals Actifs',
      value: stats?.activeDeals || 0,
      icon: TrendingUp,
      description: 'En négociation',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Taux Closing',
      value: `${stats?.conversionRate || 0}%`,
      icon: Target,
      description: 'Conversion',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="group relative overflow-hidden border-2 hover:border-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-background dark:bg-black/80">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10 opacity-50 group-hover:opacity-100 transition-opacity" />
          
          {/* Glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--secondary)/0.15),transparent_70%)]" />

          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground dark:text-white/70">
              {stat.title}
            </CardTitle>
            <div className="p-2 rounded-lg bg-background dark:bg-gold/20">
              <stat.icon className="h-4 w-4 text-secondary dark:text-gold" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-primary dark:text-gold">{stat.value}</div>
            <p className="text-xs text-muted-foreground dark:text-white/60 mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};