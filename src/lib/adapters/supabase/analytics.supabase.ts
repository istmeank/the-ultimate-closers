/** Supabase implementation of AnalyticsService. */
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type {
  AdminOverview,
  AnalyticsService,
  DailyPageViews,
} from '@/lib/services/analytics.service';

export const supabaseAnalyticsAdapter: AnalyticsService = {
  async trackEvent(event) {
    // Best-effort: analytics must never break the user flow.
    try {
      const row: { event_type: string; page_path: string; metadata?: Json } = {
        event_type: event.event_type,
        page_path: event.page_path,
      };
      if (event.metadata) row.metadata = event.metadata as unknown as Json;
      await supabase.from('site_analytics').insert(row);
    } catch (err) {
      console.error('analytics trackEvent failed', err);
    }
  },

  async getPageViewsByDay(days = 7): Promise<DailyPageViews[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('site_analytics')
      .select('*')
      .eq('event_type', 'page_view')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });
    if (error) throw error;

    const grouped: Record<string, DailyPageViews> = {};
    for (const item of data ?? []) {
      const date = new Date((item as { created_at: string }).created_at).toLocaleDateString('fr-FR');
      if (!grouped[date]) grouped[date] = { date, views: 0 };
      grouped[date].views++;
    }
    return Object.values(grouped);
  },

  async getAdminOverview(): Promise<AdminOverview> {
    const head = { count: 'exact' as const, head: true };
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: usersCount } = await supabase.from('profiles').select('*', head);
    const { count: formationsCount } = await supabase.from('formations').select('*', head);
    const { count: publishedCount } = await supabase
      .from('formations')
      .select('*', head)
      .eq('is_published', true);
    const { count: viewsCount } = await supabase
      .from('site_analytics')
      .select('*', head)
      .eq('event_type', 'page_view')
      .gte('created_at', sevenDaysAgo.toISOString());
    const { count: leadsCount } = await supabase.from('leads').select('*', head);
    const { count: qualifiedCount } = await supabase
      .from('leads')
      .select('*', head)
      .gte('score', 75);
    const { count: dealsCount } = await supabase.from('deals').select('*', head);
    const { data: revenueData } = await supabase
      .from('deals')
      .select('amount_cents')
      .eq('stage', 'won');
    const totalRevenue =
      (revenueData ?? []).reduce((sum, deal) => sum + (deal.amount_cents ?? 0), 0) / 100;

    return {
      totalUsers: usersCount ?? 0,
      totalFormations: formationsCount ?? 0,
      publishedFormations: publishedCount ?? 0,
      recentViews: viewsCount ?? 0,
      totalLeads: leadsCount ?? 0,
      qualifiedLeads: qualifiedCount ?? 0,
      totalDeals: dealsCount ?? 0,
      totalRevenue: totalRevenue || 0,
    };
  },
};
