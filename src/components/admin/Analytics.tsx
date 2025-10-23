import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Analytics = () => {
  const [pageViews, setPageViews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get page views for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('site_analytics')
        .select('*')
        .eq('event_type', 'page_view')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped = data.reduce((acc: any, item: any) => {
        const date = new Date(item.created_at).toLocaleDateString('fr-FR');
        if (!acc[date]) {
          acc[date] = { date, views: 0 };
        }
        acc[date].views++;
        return acc;
      }, {});

      setPageViews(Object.values(grouped));
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-background font-inter">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="font-playfair font-bold text-3xl text-background">
        Statistiques
      </h2>

      <Card className="bg-background/95 backdrop-blur-sm border-secondary/20 p-6">
        <h3 className="font-playfair font-bold text-xl text-primary mb-4">
          Vues par jour (7 derniers jours)
        </h3>
        
        {pageViews.length === 0 ? (
          <p className="text-muted-foreground font-inter">
            Aucune donnée disponible pour le moment.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pageViews}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="hsl(var(--secondary))" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="bg-background/95 backdrop-blur-sm border-secondary/20 p-6">
        <h3 className="font-playfair font-bold text-xl text-primary mb-4">
          Informations
        </h3>
        <p className="text-muted-foreground font-inter">
          Les statistiques sont collectées automatiquement lorsque les utilisateurs visitent le site.
          Plus de métriques seront ajoutées prochainement (temps moyen, taux de conversion, etc.).
        </p>
      </Card>
    </div>
  );
};
