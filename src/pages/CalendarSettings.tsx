import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function CalendarSettings() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    checkConnection();
    
    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    
    if (code && state) {
      handleCallback(code, state);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  
  const checkConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('closer_integrations')
        .select('*')
        .eq('closer_id', user.id)
        .eq('integration_type', 'google_calendar')
        .eq('is_active', true)
        .single();
      
      if (!error && data) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConnect = async () => {
    try {
      setIsProcessing(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Vous devez être connecté');
        return;
      }

      const { data, error } = await supabase.functions.invoke('google-calendar-auth/initiate', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Erreur lors de la connexion à Google Calendar');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCallback = async (code: string, state: string) => {
    try {
      setIsProcessing(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('google-calendar-auth/callback', {
        body: { code, state },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      
      setIsConnected(true);
      toast.success('Google Calendar connecté avec succès');
    } catch (error) {
      console.error('Error handling callback:', error);
      toast.error('Erreur lors de la connexion');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      setIsProcessing(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('google-calendar-auth/disconnect', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      
      setIsConnected(false);
      toast.success('Google Calendar déconnecté');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-playfair text-3xl text-primary mb-2">Paramètres Google Calendar</h1>
        <p className="text-muted-foreground">
          Synchronisez votre agenda pour la gestion automatique des rendez-vous
        </p>
      </div>
      
      <Card className="p-6 bg-background/95 backdrop-blur-sm border-secondary/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Google Calendar</h3>
              <p className="text-sm text-muted-foreground">
                {isConnected ? 'Connecté et synchronisé' : 'Non connecté'}
              </p>
            </div>
          </div>
          
          {isConnected ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <XCircle className="w-6 h-6 text-red-500" />
          )}
        </div>
        
        <div className="space-y-4">
          {isConnected ? (
            <>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✓ Les rendez-vous qualifiés sont automatiquement ajoutés à votre agenda
                </p>
              </div>
              <Button 
                onClick={handleDisconnect} 
                variant="outline"
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Déconnexion...
                  </>
                ) : (
                  'Déconnecter'
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  En connectant Google Calendar, vous pourrez :
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  <li>Synchroniser automatiquement vos rendez-vous</li>
                  <li>Éviter les doubles réservations</li>
                  <li>Recevoir des notifications de rappel</li>
                </ul>
              </div>
              <Button 
                onClick={handleConnect} 
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Connecter Google Calendar'
                )}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
