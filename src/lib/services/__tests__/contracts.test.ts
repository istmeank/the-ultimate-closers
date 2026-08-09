/**
 * Test de contrat de la couche services (ADR-025 / T28).
 *
 * Ce que ce test prouve : chaque service exporté expose bien l'intégralité des
 * méthodes de son interface. Une méthode supprimée ou renommée dans un adapter
 * casse ici, et non en production dans un écran client.
 *
 * Les interfaces TypeScript disparaissent à la compilation : sans ce test, rien
 * ne vérifie à l'exécution que l'adapter honore réellement son contrat.
 */
import { describe, expect, it } from 'vitest';

import {
  aiService,
  analyticsService,
  authService,
  contentService,
  integrationsService,
  leadsService,
  matchingService,
  meetService,
  messagingService,
  profilesService,
  realtimeService,
  secretsService,
  storageService,
} from '@/lib/services';

/** Contrat attendu par service. Source de vérité : les interfaces *.service.ts. */
const CONTRACTS: Array<[string, unknown, string[]]> = [
  ['auth', authService, [
    'getCurrentUser', 'getSession', 'onAuthStateChange', 'signInWithEmail',
    'signOut', 'getUserRoles', 'createUser', 'listUserRoles', 'manageUserRole',
    'deleteUser',
  ]],
  ['leads', leadsService, [
    'listForCloser', 'getById', 'updateStatus', 'countAll', 'countQualified',
    'listInteractions', 'getCloserPipelineStats',
  ]],
  ['profiles', profilesService, [
    'getById', 'listAll', 'update', 'setActive', 'listClosersWithStats',
  ]],
  ['content', contentService, [
    'listFormations', 'saveFormation', 'deleteFormation',
    'setFormationPublished', 'listSiteContent', 'addSiteContent',
    'upsertSiteContent',
  ]],
  ['analytics', analyticsService, [
    'trackEvent', 'getPageViewsByDay', 'getAdminOverview',
  ]],
  ['meet', meetService, [
    'submitBooking', 'listDealsForLead', 'listForCloser', 'updateStage',
  ]],
  ['integrations', integrationsService, [
    'getHubspotConnection', 'listHubspotSyncLogs', 'testHubspotConnection',
    'saveHubspotApiKey', 'syncAllLeads', 'syncLead', 'disconnectHubspot',
    'getGoogleCalendarConnection',
  ]],
  ['matching', matchingService, [
    'scoreAffinity', 'matchClosersToProspect', 'getMatchExplanation',
  ]],
  ['messaging', messagingService, [
    'sendMessage', 'listConversation', 'markRead', 'byChannel',
  ]],
  ['realtime', realtimeService, ['subscribeToTable', 'broadcastEvent', 'presence']],
  ['secrets', secretsService, ['getDecryptedToken', 'storeToken', 'rotateToken']],
  ['storage', storageService, ['upload', 'download', 'getSignedUrl', 'delete']],
  ['ai', aiService, ['scoreLead', 'generateScript', 'classifyLead', 'askANK']],
];

describe('couche services — contrat', () => {
  it('expose les 13 services du barrel', () => {
    expect(CONTRACTS).toHaveLength(13);
    for (const [name, service] of CONTRACTS) {
      expect(service, `service ${name} manquant`).toBeDefined();
    }
  });

  describe.each(CONTRACTS)('%s.service', (name, service, methods) => {
    it.each(methods)(`expose %s()`, (method) => {
      expect(
        typeof (service as Record<string, unknown>)[method],
        `${name}.${method} absent ou non appelable`
      ).toBe('function');
    });
  });
});
