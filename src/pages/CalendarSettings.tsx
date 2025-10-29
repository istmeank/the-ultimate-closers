import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function CalendarSettings() {
  const [isConnected, setIsConnected] = useState(false);
  
  const handleConnect = () => {
    // TODO: Rediriger vers OAuth Google
    toast.info('Connexion Google Calendar à implémenter');
    // window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?...`;
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    toast.success('Google Calendar déconnecté');
  };
  
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
              >
                Déconnecter
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
              >
                Connecter Google Calendar
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
