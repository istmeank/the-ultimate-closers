/**
 * Service layer barrel (ADR-025 / T28).
 * Components/pages/hooks import services from here; adapters stay internal.
 */
export { authService } from './auth.service';
export { leadsService } from './leads.service';
export { matchingService } from './matching.service';
export { messagingService } from './messaging.service';
export { meetService } from './meet.service';
export { storageService } from './storage.service';
export { realtimeService } from './realtime.service';
export { integrationsService } from './integrations.service';
export { secretsService } from './secrets.service';
export { aiService } from './ai.service';
// Additional services required by the existing MVP (see T28 RÉSULTAT note):
export { profilesService } from './profiles.service';
export { contentService } from './content.service';
export { analyticsService } from './analytics.service';
