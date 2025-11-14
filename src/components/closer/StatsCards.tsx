import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, TrendingUp, Target } from 'lucide-react';

export const StatsCards = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['closerStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Requêtes parallèles pour les KPIs
      const [hotLeads, upcomingAppointments, activeDeals, conversionRate] = await Promise.all([
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
        
        // Taux de conversion (deals won / total leads)
        supabase
          .from('leads')
          .select('id, deals(stage)')
          .eq('owner_id', user.id)
      ]);

      // Calculer le taux de conversion
      const totalLeads = conversionRate.data?.length || 0;
      const wonDeals = conversionRate.data?.filter(lead => 
        lead.deals?.some(deal => deal.stage === 'won')
      ).length || 0;
      const conversion = totalLeads > 0 ? Math.round((wonDeals / totalLeads) * 100) : 0;

      return {
        hotLeads: hotLeads.count || 0,
        upcomingAppointments: upcomingAppointments.count || 0,
        activeDeals: activeDeals.count || 0,
        conversionRate: conversion,
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