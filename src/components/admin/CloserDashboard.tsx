import { useEffect, useState } from 'react';
import { authService } from '@/lib/services/auth.service';
import { leadsService } from '@/lib/services/leads.service';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Flame, Calendar, TrendingUp, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import heroImage from '@/assets/hero-handshake.jpg';

export const CloserDashboard = () => {
  const [stats, setStats] = useState({
    hotLeads: 0,
    upcomingAppointments: 0,
    activeDeals: 0,
    closingRate: 0,
    totalLeads: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      const stats = await leadsService.getCloserPipelineStats(user.id);
      setStats({
        hotLeads: stats.hotLeads,
        upcomingAppointments: stats.upcomingAppointments,
        activeDeals: stats.activeDeals,
        closingRate: stats.closingRate,
        totalLeads: stats.totalLeads,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Leads Chauds',
      value: stats.hotLeads,
      subtitle: 'Score ≥ 75',
      icon: Flame,
      color: 'text-secondary',
    },
    {
      title: 'RDV à Venir',
      value: stats.upcomingAppointments,
      subtitle: '7 prochains jours',
      icon: Calendar,
      color: 'text-secondary',
    },
    {
      title: 'Deals Actifs',
      value: stats.activeDeals,
      subtitle: 'En négociation',
      icon: TrendingUp,
      color: 'text-secondary',
    },
    {
      title: 'Taux Closing',
      value: `${stats.closingRate}%`,
      subtitle: 'Conversion',
      icon: Target,
      color: 'text-secondary',
    },
  ];

  const kanbanColumns = [
    { id: 'new', title: 'Nouveau', description: 'Nouveaux leads', color: 'violet' },
    { id: 'qualified', title: 'Qualifié', description: 'Leads qualifiés', color: 'blue' },
    { id: 'in_progress', title: 'En cours', description: 'En négociation', color: 'orange' },
    { id: 'won', title: 'Gagné', description: 'Deals conclus', color: 'green' },
    { id: 'lost', title: 'Perdu', description: 'Opportunités perdues', color: 'red' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-lg overflow-hidden">
        <img 
          src={heroImage} 
          alt="Pipeline Closers" 
          className="w-full h-48 object-cover opacity-60" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center px-8">
          <div>
            <h1 className="font-display text-4xl text-background font-bold drop-shadow-lg">
              Pipeline Closers
            </h1>
            <p className="text-background/90 mt-2 font-inter text-lg">
              Gestion de vos leads et rendez-vous
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="group relative overflow-hidden border border-hairline hover:border-secondary transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5 animate-fade-in-scale bg-background dark:bg-black/80"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient background */}
              
              {/* Glow effect */}

              <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-muted-foreground dark:text-white/70">
                  {stat.title}
                </h3>
                <div className="p-2 rounded-lg bg-background dark:bg-gold/20">
                  <Icon className={`h-4 w-4 ${stat.color} dark:text-gold group-hover:scale-110 transition-transform`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-primary dark:text-gold">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground dark:text-white/60 mt-1">
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pipeline Kanban */}
      <Card className="group relative overflow-hidden border border-hairline hover:border-secondary transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5 animate-fade-in-scale">
        {/* Gradient background */}
        
        {/* Glow effect */}

        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold tracking-tight font-display text-xl">
              Pipeline Kanban
            </h3>
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
              {stats.totalLeads} leads au total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {kanbanColumns.map((column, index) => {
              const borderColor = {
                violet: 'border-violet-200 bg-violet-50/50',
                blue: 'border-blue-200 bg-blue-50/50',
                orange: 'border-orange-200 bg-orange-50/50',
                green: 'border-green-200 bg-green-50/50',
                red: 'border-red-200 bg-red-50/50',
              }[column.color];

              return (
                <div
                  key={column.id}
                  className={`group relative overflow-hidden bg-background/80 dark:bg-black/80 backdrop-blur-sm rounded-2xl border-2 ${borderColor} hover:border-secondary transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5 animate-fade-in-scale`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient background */}
                  
                  {/* Glow effect */}

                  <div className="flex flex-col space-y-1.5 p-6 relative z-10 pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="tracking-tight font-display font-bold text-lg text-primary dark:text-gold">
                        {column.title}
                      </h3>
                      <Badge variant="outline" className="text-foreground text-xs dark:text-white/80">
                        0
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground dark:text-white/60">
                      {column.description}
                    </p>
                  </div>
                  <div className="p-6 relative z-10 pt-0">
                    <div className="space-y-3 min-h-[200px] transition-colors">
                      <div className="text-center text-muted-foreground text-sm py-8">
                        Aucun lead
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

