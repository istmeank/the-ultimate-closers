import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { integrationsService } from '@/lib/services/integrations.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const GoogleCalendarSettings = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calendarEmail, setCalendarEmail] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, [user]);

  const checkConnection = async () => {
    if (!user) return;

    try {
      const { connected, calendarEmail } =
        await integrationsService.getGoogleCalendarConnection(user.id);
      setIsConnected(connected);
      setCalendarEmail(calendarEmail);
    } catch (error) {
      console.error('Error:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);

      const authUrl = await integrationsService.getGoogleAuthUrl();
      if (authUrl) {
        // Rediriger vers la page d'authentification Google
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Erreur lors de la connexion à Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;

    try {
      setLoading(true);

      await integrationsService.disconnectGoogleCalendar(user.id);

      setIsConnected(false);
      setCalendarEmail(null);
      toast.success('Déconnecté de Google Calendar');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-3xl text-primary dark:text-gold mb-2">
          Google Calendar
        </h2>
        <p className="text-muted-foreground dark:text-white/70">
          Connectez votre agenda Google pour synchroniser vos rendez-vous
        </p>
      </div>

      <Card className="p-6 bg-surface-1 border-hairline">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-secondary/20 dark:bg-gold/20">
            <Calendar className="w-6 h-6 text-secondary dark:text-gold" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 text-foreground dark:text-white">
              Connexion Google Calendar
            </h3>

            {loading ? (
              <p className="text-muted-foreground dark:text-white/70">Vérification...</p>
            ) : isConnected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Connecté</span>
                </div>
                {calendarEmail && (
                  <p className="text-sm text-muted-foreground dark:text-white/70">
                    Compte: {calendarEmail}
                  </p>
                )}
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                  disabled={loading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Déconnecter
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground dark:text-white/70">
                  Autorisez l'accès à votre Google Calendar pour synchroniser automatiquement vos rendez-vous.
                </p>
                <Button
                  onClick={handleConnect}
                  className="bg-secondary hover:bg-secondary/90 dark:bg-gold dark:hover:bg-gold/90 text-white"
                  disabled={loading}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Connecter Google Calendar
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
