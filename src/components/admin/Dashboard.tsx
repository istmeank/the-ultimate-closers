import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Users, FileText, TrendingUp, Calendar } from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFormations: 0,
    publishedFormations: 0,
    recentViews: 0,
    totalLeads: 0,
    qualifiedLeads: 0,
    totalDeals: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Count users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Count formations
      const { count: formationsCount } = await supabase
        .from('formations')
        .select('*', { count: 'exact', head: true });

      // Count published formations
      const { count: publishedCount } = await supabase
        .from('formations')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Count recent page views (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: viewsCount } = await supabase
        .from('site_analytics')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .gte('created_at', sevenDaysAgo.toISOString());

      // CRM Stats
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      const { count: qualifiedCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('score', 75);

      const { count: dealsCount } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true });

      const { data: revenueData } = await supabase
        .from('deals')
        .select('amount_cents')
        .eq('stage', 'won');

      const totalRevenue = (revenueData || []).reduce((sum, deal) => sum + deal.amount_cents, 0) / 100;

      setStats({
        totalUsers: usersCount || 0,
        totalFormations: formationsCount || 0,
        publishedFormations: publishedCount || 0,
        recentViews: viewsCount || 0,
        totalLeads: leadsCount || 0,
        qualifiedLeads: qualifiedCount || 0,
        totalDeals: dealsCount || 0,
        totalRevenue: totalRevenue || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Utilisateurs',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-secondary',
    },
    {
      title: 'Leads totaux',
      value: stats.totalLeads,
      icon: Users,
      color: 'text-secondary',
    },
    {
      title: 'Leads qualifiés',
      value: stats.qualifiedLeads,
      icon: TrendingUp,
      color: 'text-secondary',
    },
    {
      title: 'Deals',
      value: stats.totalDeals,
      icon: FileText,
      color: 'text-secondary',
    },
    {
      title: 'CA généré',
      value: `${stats.totalRevenue.toLocaleString('fr-FR')}€`,
      icon: TrendingUp,
      color: 'text-secondary',
    },
    {
      title: 'Formations',
      value: stats.totalFormations,
      icon: Calendar,
      color: 'text-secondary',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-playfair font-bold text-3xl text-background">
        Vue d'ensemble
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="bg-background/95 backdrop-blur-sm border-secondary/20 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-inter mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-primary">
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`w-10 h-10 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-background/95 backdrop-blur-sm border-secondary/20 p-6">
        <h3 className="font-playfair font-bold text-xl text-primary mb-4">
          Bienvenue dans le panel d'administration
        </h3>
        <p className="text-muted-foreground font-inter">
          Utilisez les onglets ci-dessus pour gérer le contenu du site, les formations, les utilisateurs et consulter les statistiques.
        </p>
      </Card>
    </div>
  );
};
