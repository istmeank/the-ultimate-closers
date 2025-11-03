import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { MessageSquare, CheckCircle, XCircle } from 'lucide-react';

export default function SlackSettings() {
  const [isConnected, setIsConnected] = useState(false);
  
  const handleConnect = () => {
    // TODO: Rediriger vers OAuth Slack
    toast.info('Connexion Slack à implémenter');
    // window.location.href = `https://slack.com/oauth/v2/authorize?...`;
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    toast.success('Slack déconnecté');
  };
  
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-playfair text-3xl text-primary mb-2">Paramètres Slack</h1>
        <p className="text-muted-foreground">
          Recevez des notifications en temps réel sur vos leads qualifiés
        </p>
      </div>
      
      <Card className="p-6 bg-background/95 backdrop-blur-sm border-secondary/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Slack</h3>
              <p className="text-sm text-muted-foreground">
                {isConnected ? 'Connecté au workspace' : 'Non connecté'}
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
                  ✓ Notifications actives pour les nouveaux leads qualifiés
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
                  En connectant Slack, vous pourrez :
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  <li>Recevoir une notification instantanée pour chaque nouveau lead</li>
                  <li>Voir le score de qualification en temps réel</li>
                  <li>Accéder rapidement aux détails du lead</li>
                </ul>
              </div>
              <Button 
                onClick={handleConnect} 
                className="w-full"
              >
                Connecter Slack
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
