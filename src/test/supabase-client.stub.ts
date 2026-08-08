/**
 * Stub du client Supabase pour les tests.
 *
 * Le client réel instancie une connexion et lit `localStorage` au moment de
 * l'import : impossible à charger dans un contexte de test Node. Ce stub
 * expose la même surface d'API, sous forme chaînable, sans effet de bord.
 *
 * Il ne simule aucun comportement métier : les tests de service mockent
 * l'adapter, pas la base. Ce stub sert uniquement à ce que l'import
 * des adapters soit possible.
 */

const chainable = (): Record<string, unknown> => {
  const handler: ProxyHandler<Record<string, unknown>> = {
    get: (_target, prop) => {
      if (prop === 'then') return undefined; // ne pas se faire passer pour une promesse
      return (..._args: unknown[]) => chainable();
    },
  };
  return new Proxy({}, handler);
};

export const supabase = {
  from: () => chainable(),
  rpc: () => chainable(),
  channel: () => chainable(),
  removeChannel: () => undefined,
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => undefined } },
    }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
  },
  storage: {
    from: () => chainable(),
  },
  functions: {
    invoke: async () => ({ data: null, error: null }),
  },
};
