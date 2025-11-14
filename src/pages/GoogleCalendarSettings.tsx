import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('google_calendar_tokens')
        .select('calendar_email, expires_at')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking connection:', error);
        setIsConnected(false);
        return;
      }

      if (data && data.expires_at) {
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        setIsConnected(expiresAt > now);
        setCalendarEmail(data.calendar_email);
      } else {
        setIsConnected(false);
      }
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
      
      // Appeler l'edge function pour obtenir l'URL d'authentification
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { action: 'get_auth_url' }
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Rediriger vers la page d'authentification Google
        window.location.href = data.authUrl;
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
      
      const { error } = await supabase
        .from('google_calendar_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

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
        <h2 className="font-playfair font-bold text-3xl text-primary dark:text-gold mb-2">
          Google Calendar
        </h2>
        <p className="text-muted-foreground dark:text-white/70">
          Connectez votre agenda Google pour synchroniser vos rendez-vous
        </p>
      </div>

      <Card className="p-6 bg-background/95 dark:bg-[hsl(167,69%,18%)]/80 backdrop-blur-sm border-secondary/20 dark:border-gold/20">
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
