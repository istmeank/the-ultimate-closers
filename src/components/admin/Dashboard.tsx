import { useEffect, useState } from 'react';
import { analyticsService } from '@/lib/services/analytics.service';
import { Card } from '@/components/ui/card';
import { Users, FileText, TrendingUp, Calendar } from 'lucide-react';
import handshake from '@/assets/hero-handshake.jpg';
export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFormations: 0,
    publishedFormations: 0,
    recentViews: 0,
    totalLeads: 0,
    qualifiedLeads: 0,
    totalDeals: 0,
    totalRevenue: 0
  });
  useEffect(() => {
    loadStats();
  }, []);
  const loadStats = async () => {
    try {
      const overview = await analyticsService.getAdminOverview();
      setStats(overview);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };
  const statCards = [{
    title: 'Utilisateurs',
    value: stats.totalUsers,
    icon: Users,
    color: 'text-secondary'
  }, {
    title: 'Leads totaux',
    value: stats.totalLeads,
    icon: Users,
    color: 'text-secondary'
  }, {
    title: 'Leads qualifiés',
    value: stats.qualifiedLeads,
    icon: TrendingUp,
    color: 'text-secondary'
  }, {
    title: 'Deals',
    value: stats.totalDeals,
    icon: FileText,
    color: 'text-secondary'
  }, {
    title: 'CA généré',
    value: `${stats.totalRevenue.toLocaleString('fr-FR')}€`,
    icon: TrendingUp,
    color: 'text-secondary'
  }, {
    title: 'Formations',
    value: stats.totalFormations,
    icon: Calendar,
    color: 'text-secondary'
  }];
  return <div className="space-y-6">
      <h2 className="font-display font-bold text-3xl text-primary dark:text-gold">
        Vue d'ensemble
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => <Card key={stat.title} className="group relative overflow-hidden bg-surface-1 border border-hairline hover:border-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 animate-fade-in-scale p-6" style={{
        animationDelay: `${index * 0.1}s`
      }}>
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity" />
            
            {/* Glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--gold-glow)/0.14),transparent_70%)]" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-white/70 font-inter mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-primary dark:text-gold">
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`w-10 h-10 ${stat.color} dark:text-gold group-hover:scale-110 transition-transform`} />
            </div>
          </Card>)}
      </div>

      <Card className="group relative overflow-hidden bg-background/95 dark:bg-background/95 backdrop-blur-sm border-2 border-border hover:border-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 animate-fade-in-scale p-6">
        {/* Background image pour light mode */}
        <div 
          className="absolute inset-0 dark:hidden bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${handshake})` }}
        />
        
        {/* Overlay vert pour light mode */}
        <div className="absolute inset-0 dark:hidden bg-secondary/60" />
        
        {/* Gradient background pour dark mode */}
        <div className="hidden dark:block absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity" />
        
        {/* Glow effect pour dark mode */}
        <div className="hidden dark:block absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--gold-glow)/0.14),transparent_70%)] bg-malachite" />

        <div className="relative z-10 bg-white dark:bg-transparent p-6 rounded-lg">
          <h3 className="font-display font-bold text-xl mb-4 text-secondary dark:text-[#e8c669]">
            Bienvenue dans le panel d'administration
          </h3>
          <p className="text-foreground dark:text-muted-foreground font-inter">
            Utilisez les onglets ci-dessus pour gérer le contenu du site, les formations, les utilisateurs et consulter les statistiques.
          </p>
        </div>
      </Card>
    </div>;
};