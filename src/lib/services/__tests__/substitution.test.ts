/**
 * Test de substituabilité (ADR-025 / T28) — le test qui justifie la couche.
 *
 * Ce que ce test prouve : un service délègue intégralement à son adapter et ne
 * contient aucune logique liée à Supabase. Si l'adapter est remplacé — par un
 * double de test aujourd'hui, par un backend NestJS demain (ADR-025 phase 3) —
 * le service continue de fonctionner sans qu'aucun appelant ne change.
 *
 * Chaque `vi.mock` ci-dessous simule cette bascule de backend.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/adapters/supabase/auth.supabase', () => ({
  supabaseAuthAdapter: {
    getCurrentUser: vi.fn(async () => ({ id: 'u-1', email: 'closer@tuc.dz' })),
    getSession: vi.fn(async () => null),
    onAuthStateChange: vi.fn(() => ({ unsubscribe: vi.fn() })),
    signInWithEmail: vi.fn(async () => ({ error: null })),
    signOut: vi.fn(async () => ({ error: null })),
    getUserRoles: vi.fn(async () => ['closer']),
    createUser: vi.fn(async () => ({})),
    listUserRoles: vi.fn(async () => []),
    manageUserRole: vi.fn(async () => undefined),
    deleteUser: vi.fn(async () => ({})),
  },
}));

vi.mock('@/lib/adapters/supabase/leads.supabase', () => ({
  supabaseLeadsAdapter: {
    listForCloser: vi.fn(async () => [{ id: 'lead-1' }]),
    getById: vi.fn(async () => null),
    updateStatus: vi.fn(async () => undefined),
    countAll: vi.fn(async () => 42),
    countQualified: vi.fn(async () => 7),
    listInteractions: vi.fn(async () => []),
    getCloserPipelineStats: vi.fn(async () => ({
      hotLeads: 3,
      upcomingAppointments: 1,
      activeDeals: 2,
      conversionRate: 25,
      closingRate: 50,
      totalLeads: 12,
    })),
  },
}));

vi.mock('@/lib/adapters/supabase/storage.supabase', () => ({
  supabaseStorageAdapter: {
    upload: vi.fn(async () => 'avatars/u-1.png'),
    download: vi.fn(async () => new Blob()),
    getSignedUrl: vi.fn(async () => 'https://signed.example/u-1.png'),
    delete: vi.fn(async () => undefined),
  },
}));

const { supabaseAuthAdapter } = await import('@/lib/adapters/supabase/auth.supabase');
const { supabaseLeadsAdapter } = await import('@/lib/adapters/supabase/leads.supabase');
const { supabaseStorageAdapter } = await import('@/lib/adapters/supabase/storage.supabase');
const { authService } = await import('@/lib/services/auth.service');
const { leadsService } = await import('@/lib/services/leads.service');
const { storageService } = await import('@/lib/services/storage.service');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('auth.service — délégation', () => {
  it('retourne l\'utilisateur fourni par l\'adapter, sans le transformer', async () => {
    const user = await authService.getCurrentUser();
    expect(user).toEqual({ id: 'u-1', email: 'closer@tuc.dz' });
    expect(supabaseAuthAdapter.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('transmet les identifiants tels quels à l\'adapter', async () => {
    await authService.signInWithEmail('closer@tuc.dz', 'motdepasse');
    expect(supabaseAuthAdapter.signInWithEmail).toHaveBeenCalledWith(
      'closer@tuc.dz',
      'motdepasse'
    );
  });

  it('remonte les rôles sans les réinterpréter', async () => {
    await expect(authService.getUserRoles('u-1')).resolves.toEqual(['closer']);
  });
});

describe('leads.service — délégation', () => {
  it('transmet l\'identifiant du closer sans le réécrire', async () => {
    await leadsService.listForCloser('u-1');
    expect(supabaseLeadsAdapter.listForCloser).toHaveBeenCalledWith('u-1');
  });

  it('remonte les KPI du pipeline tels que calculés par l\'adapter', async () => {
    const stats = await leadsService.getCloserPipelineStats('u-1');
    expect(stats.hotLeads).toBe(3);
    expect(stats.closingRate).toBe(50);
  });

  it('propage le seuil de qualification choisi par l\'appelant', async () => {
    await leadsService.countQualified(80);
    expect(supabaseLeadsAdapter.countQualified).toHaveBeenCalledWith(80);
  });
});

describe('storage.service — délégation', () => {
  it('transmet bucket, chemin et fichier sans les altérer', async () => {
    const file = new Blob(['x']);
    await storageService.upload('avatars', 'u-1.png', file);
    expect(supabaseStorageAdapter.upload).toHaveBeenCalledWith(
      'avatars',
      'u-1.png',
      file
    );
  });

  it('retourne l\'URL signée produite par l\'adapter', async () => {
    await expect(storageService.getSignedUrl('avatars', 'u-1.png')).resolves.toBe(
      'https://signed.example/u-1.png'
    );
  });
});
