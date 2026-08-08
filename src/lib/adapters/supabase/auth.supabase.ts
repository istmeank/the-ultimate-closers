/**
 * Supabase implementation of AuthService.
 *
 * This is the ONLY place in the frontend allowed to touch `supabase.auth`,
 * `supabase.from('user_roles')` and the identity Edge Functions. Swapping the
 * backend means writing a sibling adapter (e.g. nestjs/auth.nestjs.ts) and
 * changing one import in auth.service.ts.
 */
import { supabase } from '@/integrations/supabase/client';
import type {
  AppRole,
  AuthService,
  AuthSession,
  AuthStateSubscription,
  AuthUser,
  UserRolePair,
} from '@/lib/services/auth.service';

function toAuthUser(user: { id: string; email?: string | null } | null | undefined): AuthUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}

/** Resolve the current access token, or throw a clear error if signed out. */
async function requireAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Session invalide. Veuillez vous reconnecter.');
  }
  return session.access_token;
}

export const supabaseAuthAdapter: AuthService = {
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return toAuthUser(user);
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    return { user: toAuthUser(session.user) } as AuthSession;
  },

  onAuthStateChange(callback): AuthStateSubscription {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(session ? ({ user: toAuthUser(session.user) } as AuthSession) : null);
      }
    );
    return { unsubscribe: () => subscription.unsubscribe() };
  },

  async signInWithEmail(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ?? null };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error: error ?? null };
  },

  async getUserRoles(userId) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    if (error) throw error;
    return (data ?? []).map((r) => r.role as AppRole);
  },

  async createUser(input) {
    const accessToken = await requireAccessToken();
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        email: input.email,
        password: input.password,
        fullName: input.fullName,
        roles: input.roles && input.roles.length > 0 ? input.roles : ['user'],
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (error) throw error;
    return data;
  },

  async listUserRoles() {
    const accessToken = await requireAccessToken();
    const { data, error } = await supabase.functions.invoke('list-user-roles', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (error) throw error;
    return (((data as { roles?: UserRolePair[] })?.roles) ?? []) as UserRolePair[];
  },

  async manageUserRole({ userId, role, action }) {
    const accessToken = await requireAccessToken();
    const { error } = await supabase.functions.invoke('manage-user-role', {
      body: { userId, role, action },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (error) throw error;
  },

  async deleteUser(userId) {
    const accessToken = await requireAccessToken();
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { userId },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (error) throw error;
    return data;
  },
};
