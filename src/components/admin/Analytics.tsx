import { useState, useEffect } from 'react';
import { analyticsService } from '@/lib/services/analytics.service';
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
      const data = await analyticsService.getPageViewsByDay(7);
      setPageViews(data);
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

      <Card className="group relative overflow-hidden bg-background/95 backdrop-blur-sm border-2 border-border hover:border-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fade-in-scale p-6">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,rgba(233,196,106,0.15),transparent_70%)]" />

        <div className="relative z-10">
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
        </div>
      </Card>

      <Card className="group relative overflow-hidden bg-background/95 backdrop-blur-sm border-2 border-border hover:border-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fade-in-scale p-6">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,rgba(233,196,106,0.15),transparent_70%)]" />

        <div className="relative z-10">
          <h3 className="font-playfair font-bold text-xl text-primary mb-4">
            Informations
          </h3>
          <p className="text-muted-foreground font-inter">
            Les statistiques sont collectées automatiquement lorsque les utilisateurs visitent le site.
            Plus de métriques seront ajoutées prochainement (temps moyen, taux de conversion, etc.).
          </p>
        </div>
      </Card>
    </div>
  );
};
