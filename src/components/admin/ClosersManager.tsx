import { useEffect, useState } from 'react';
import { profilesService } from '@/lib/services/profiles.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, UserMinus, TrendingUp, Target, RefreshCw } from 'lucide-react';
import { CreateUserDialog } from './CreateUserDialog';

interface Closer {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  max_concurrent_leads: number;
  current_leads: number;
  total_assigned: number;
  last_assigned_at: string | null;
}

export const ClosersManager = () => {
  const [closers, setClosers] = useState<Closer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClosers();
  }, []);

  const loadClosers = async () => {
    try {
      const data = await profilesService.listClosersWithStats();
      setClosers(data as Closer[]);
    } catch (error) {
      console.error('Error loading closers:', error);
      toast.error('Erreur lors du chargement des closers');
    } finally {
      setLoading(false);
    }
  };

  const toggleCloserActive = async (closerId: string, currentStatus: boolean) => {
    try {
      await profilesService.setActive(closerId, !currentStatus);

      toast.success(
        currentStatus ? 'Closer désactivé' : 'Closer activé'
      );
      loadClosers();
    } catch (error) {
      console.error('Error toggling closer:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair font-bold text-3xl text-background">
            Gestion des Closers
          </h2>
          <p className="text-muted-foreground mt-1">
            {closers.length} closer{closers.length > 1 ? 's' : ''} enregistré{closers.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadClosers}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <CreateUserDialog onUserCreated={loadClosers} />
        </div>
      </div>

      <div className="grid gap-4">
        {closers.map((closer) => (
          <Card
            key={closer.id}
            className="p-6 bg-background/95 backdrop-blur-sm border-secondary/20"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{closer.full_name}</h3>
                  <Badge variant={closer.is_active ? 'default' : 'secondary'}>
                    {closer.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">{closer.email}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span>
                      {closer.current_leads} / {closer.max_concurrent_leads} leads actifs
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>{closer.total_assigned} leads assignés au total</span>
                  </div>
                </div>

                {closer.last_assigned_at && (
                  <p className="text-xs text-muted-foreground">
                    Dernière assignation:{' '}
                    {new Date(closer.last_assigned_at).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>

              <Button
                variant={closer.is_active ? 'destructive' : 'default'}
                size="sm"
                onClick={() => toggleCloserActive(closer.id, closer.is_active)}
              >
                {closer.is_active ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Activer
                  </>
                )}
              </Button>
            </div>

            {/* Barre de progression */}
            <div className="mt-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(
                      (closer.current_leads / closer.max_concurrent_leads) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </Card>
        ))}

        {closers.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Aucun closer enregistré. Attribuez le rôle "closer" à un utilisateur.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
