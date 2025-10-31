import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SyncLog {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  error: string | null;
  last_sync: string;
  hubspot_id: string | null;
}

export default function HubSpotSettings() {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    checkConnection();
    loadSyncLogs();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('closer_integrations')
        .select('*')
        .eq('closer_id', user.id)
        .eq('integration_type', 'hubspot')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      setIsConnected(!!data);
      if (data?.access_token) {
        setApiKey('••••••••••••••••');
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('external_sync_log')
        .select('*')
        .eq('entity_type', 'lead')
        .order('last_sync', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSyncLogs(data || []);
    } catch (error) {
      console.error('Error loading sync logs:', error);
    }
  };

  const testConnection = async () => {
    if (!apiKey || apiKey.startsWith('••••')) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer une clé API valide',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('hubspot-sync', {
        body: { action: 'test_connection', apiKey },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Connexion réussie',
          description: 'Votre clé API HubSpot est valide',
        });
        await saveApiKey();
      } else {
        throw new Error(data.message || 'Test de connexion échoué');
      }
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: error instanceof Error ? error.message : 'Impossible de se connecter à HubSpot',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const saveApiKey = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('closer_integrations')
        .upsert({
          closer_id: user.id,
          integration_type: 'hubspot',
          access_token: apiKey,
          is_active: true,
        }, {
          onConflict: 'closer_id,integration_type',
        });

      if (error) throw error;
      setIsConnected(true);
      setApiKey('••••••••••••••••');
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  const syncAllLeads = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('hubspot-sync', {
        body: { action: 'sync_all' },
      });

      if (error) throw error;

      toast({
        title: 'Synchronisation lancée',
        description: `${data.synced || 0} leads synchronisés avec succès`,
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

  const disconnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('closer_integrations')
        .update({ is_active: false })
        .eq('closer_id', user.id)
        .eq('integration_type', 'hubspot');

      if (error) throw error;

      setIsConnected(false);
      setApiKey('');
      toast({
        title: 'Déconnecté',
        description: 'Votre intégration HubSpot a été désactivée',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de déconnecter HubSpot',
        variant: 'destructive',
      });
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
        <h1 className="text-3xl font-bold">Intégration HubSpot CRM</h1>
        <p className="text-muted-foreground mt-2">
          Synchronisez automatiquement vos leads qualifiés avec votre CRM HubSpot
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Connecté à HubSpot
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-muted-foreground" />
                Non connecté
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isConnected
              ? 'Votre intégration HubSpot est active et fonctionnelle'
              : 'Configurez votre clé API HubSpot pour commencer la synchronisation'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Clé API HubSpot</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type="password"
                placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isConnected}
              />
              {!isConnected ? (
                <Button onClick={testConnection} disabled={isTesting || !apiKey}>
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Tester'
                  )}
                </Button>
              ) : (
                <Button variant="destructive" onClick={disconnect}>
                  Déconnecter
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Vous pouvez créer une clé API dans HubSpot : Settings → Integrations → Private Apps
            </p>
          </div>

          {isConnected && (
            <>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="autoSync">Synchronisation automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Synchroniser automatiquement les leads avec un score ≥ 75
                  </p>
                </div>
                <Switch
                  id="autoSync"
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                />
              </div>

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
                      Synchroniser tous les leads
                    </>
                  )}
                </Button>
              </div>
            </>
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
