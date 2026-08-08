/**
 * Test des capacités différées (ADR-025 / T28).
 *
 * Sept méthodes de la couche services sont déclarées mais pas encore
 * implémentées. Ce n'est pas un oubli : chacune attend une tâche du backlog.
 *
 * Ce que ce test prouve : une capacité différée échoue immédiatement, bruyamment,
 * et en nommant la tâche qui la débloquera — plutôt que de renvoyer `undefined`
 * et de produire une page blanche chez un closer.
 *
 * Quand une tâche est livrée, le test correspondant échoue. C'est voulu :
 * il force la mise à jour du registre de dette ci-dessous.
 */
import { describe, expect, it } from 'vitest';

import {
  aiService,
  matchingService,
  messagingService,
  realtimeService,
  secretsService,
} from '@/lib/services';

/** [libellé, appel, tâche qui lèvera la dette] */
const DEFERRED: Array<[string, () => unknown, string]> = [
  ['ai.generateScript', () => aiService.generateScript({}), 'phase ANK'],
  ['ai.classifyLead', () => aiService.classifyLead({}), 'phase ANK'],
  ['ai.askANK', () => aiService.askANK('bonjour'), 'phase ANK'],
  ['matching.scoreAffinity', () => matchingService.scoreAffinity('l-1', 'c-1'), 'T08'],
  ['matching.matchClosersToProspect', () => matchingService.matchClosersToProspect('l-1'), 'T08'],
  ['messaging.sendMessage', () => messagingService.sendMessage({} as never), 'Domain 2'],
  ['messaging.listConversation', () => messagingService.listConversation('l-1'), 'Domain 2'],
  ['realtime.broadcastEvent', () => realtimeService.broadcastEvent('c', 'e', {}), 'réservé'],
  ['secrets.getDecryptedToken', () => secretsService.getDecryptedToken('c-1', 'google'), 'T01'],
  ['secrets.storeToken', () => secretsService.storeToken('c-1', 'google', 'tok'), 'T01'],
];

describe('capacités différées — échec explicite', () => {
  it.each(DEFERRED)(
    '%s échoue en annonçant la tâche qui la débloque',
    async (label, call) => {
      let message = '';
      try {
        await call();
        throw new Error(
          `${label} n'échoue plus : la capacité a été implémentée. ` +
            'Retirer cette ligne du registre et écrire un vrai test de comportement.'
        );
      } catch (error) {
        message = error instanceof Error ? error.message : String(error);
      }
      expect(message, `${label} doit signaler qu'elle n'est pas implémentée`).toMatch(
        /not implemented/i
      );
    }
  );

  it('ne laisse aucune capacité différée renvoyer silencieusement undefined', async () => {
    for (const [label, call] of DEFERRED) {
      await expect(
        Promise.resolve().then(call),
        `${label} doit rejeter, pas résoudre`
      ).rejects.toBeDefined();
    }
  });
});
