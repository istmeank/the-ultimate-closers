import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/services/auth.service';
import { leadsService } from '@/lib/services/leads.service';
import { Flame, Calendar, TrendingUp, Target, type LucideIcon } from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  /** Teinte de l'icône — issue de la charte TUC, jamais d'une palette Tailwind par défaut. */
  tone: string;
}

/**
 * Bandeau d'indicateurs du closer.
 *
 * Grammaire Linear : chiffre large en tabulaire, libellé discret au-dessus,
 * filet fin, aucune ombre portée ni halo. Les quatre cartes se lisent comme une
 * ligne d'instruments, pas comme quatre objets décorés.
 */
export const StatsCards = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['closerStats'],
    queryFn: async () => {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const pipeline = await leadsService.getCloserPipelineStats(user.id);
      return {
        hotLeads: pipeline.hotLeads,
        upcomingAppointments: pipeline.upcomingAppointments,
        activeDeals: pipeline.activeDeals,
        conversionRate: pipeline.conversionRate,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-busy="true">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="tuc-panel h-[92px] animate-pulse" />
        ))}
        <span className="sr-only">Chargement des indicateurs…</span>
      </div>
    );
  }

  const statCards: StatCard[] = [
    {
      title: 'Prospects chauds',
      value: stats?.hotLeads ?? 0,
      icon: Flame,
      // Sortie du moteur de scoring : le violet le dit.
      description: 'Score ≥ 75',
      tone: 'text-tech',
    },
    {
      title: 'RDV à venir',
      value: stats?.upcomingAppointments ?? 0,
      icon: Calendar,
      description: '7 prochains jours',
      tone: 'text-secondary',
    },
    {
      title: 'Affaires actives',
      value: stats?.activeDeals ?? 0,
      icon: TrendingUp,
      description: 'En négociation',
      tone: 'text-secondary',
    },
    {
      title: 'Taux de closing',
      value: `${stats?.conversionRate ?? 0} %`,
      icon: Target,
      description: 'Conversion',
      tone: 'text-gold-ink',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {statCards.map((stat) => (
        <article
          key={stat.title}
          className="tuc-panel flex items-start justify-between gap-3 p-4 transition-colors hover:border-primary/40"
        >
          <div className="min-w-0">
            <p className="tuc-eyebrow truncate">{stat.title}</p>
            <p className="tuc-numeric mt-1.5 font-display text-2xl font-bold leading-none text-ink-strong">
              {stat.value}
            </p>
            <p className="mt-1.5 text-2xs text-muted-foreground">{stat.description}</p>
          </div>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-surface-2">
            <stat.icon className={`h-4 w-4 ${stat.tone}`} aria-hidden="true" />
          </span>
        </article>
      ))}
    </div>
  );
};
