import { useAuth } from '@/hooks/useAuth';
import HubSpotSettingsAPI from './HubSpotSettingsAPI';
import HubSpotSettingsCloser from './HubSpotSettingsCloser';

export default function HubSpotSettings() {
  const { isOwner, isDeveloper } = useAuth();

  // Owners et développeurs voient l'interface API complète
  if (isOwner || isDeveloper) {
    return <HubSpotSettingsAPI />;
  }

  // Admins et closers voient l'interface simplifiée
  return <HubSpotSettingsCloser />;
}
