import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { integrationsService } from '@/lib/services/integrations.service';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface SyncLog {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  error: string | null;
  last_sync: string;
  hubspot_id: string | null;
}

export default function HubSpotSettingsCloser() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
    loadSyncLogs();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const { isConnected } = await integrationsService.getHubspotConnection();
      setIsConnected(isConnected);
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSyncLogs = async () => {
    try {
      const data = await integrationsService.listHubspotSyncLogs(10);
      setSyncLogs(data);
    } catch (error) {
      console.error('Error loading sync logs:', error);
    }
  };

  const syncAllLeads = async () => {
    setIsSyncing(true);
    try {
      const { synced } = await integrationsService.syncAllLeads();

      toast({
        title: 'Synchronisation lancée',
        description: `${synced || 0} leads synchronisés avec succès`,
      });

      await loadSyncLogs();
    } catch (error) {
      toast({
        title: 'Erreur de synchronisation',
        description: error instanceof Error ? error.message : 'Impossible de synchroniser les leads',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Synchronisation HubSpot</h1>
        <p className="text-muted-foreground mt-2">
          Synchronisez vos leads qualifiés avec HubSpot CRM
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                HubSpot Connecté
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-muted-foreground" />
                HubSpot Non Connecté
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isConnected
              ? "L'intégration HubSpot est active. Vous pouvez synchroniser vos leads."
              : "L'intégration HubSpot n'est pas configurée. Contactez un administrateur."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected && (
            <div className="pt-4 border-t">
              <Button
                onClick={syncAllLeads}
                disabled={isSyncing}
                className="w-full"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Synchronisation en cours...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Synchroniser mes leads
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isConnected && syncLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des synchronisations</CardTitle>
            <CardDescription>Les 10 dernières synchronisations de leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {syncLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {log.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Lead #{log.entity_id.slice(0, 8)}</p>
                      {log.error && (
                        <p className="text-xs text-red-500">{log.error}</p>
                      )}
                      {log.hubspot_id && (
                        <p className="text-xs text-muted-foreground">
                          HubSpot ID: {log.hubspot_id}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.last_sync).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
