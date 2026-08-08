/**
 * auth.service — Service abstraction layer for authentication & identity.
 *
 * ADR-025 / T28: components and hooks MUST consume this service, never the
 * `supabase` client directly. The concrete implementation is selected at the
 * bottom of this file by importing a single adapter. To migrate the backend
 * (e.g. Supabase -> NestJS), only the adapter import changes.
 */

export type AppRole =
  | 'owner'
  | 'admin'
  | 'developer'
  | 'closer'
  | 'client'
  | 'user';

export interface AuthUser {
  id: string;
  email: string | null;
}

export interface AuthSession {
  user: AuthUser;
}

export interface AuthStateSubscription {
  unsubscribe: () => void;
}

/** Flat (user_id, role) pair as returned by the list-user-roles function. */
export interface UserRolePair {
  user_id: string;
  role: AppRole;
}

export interface AuthService {
  /** Current authenticated user, or null if signed out. */
  getCurrentUser(): Promise<AuthUser | null>;
  /** Current session, or null if signed out. */
  getSession(): Promise<AuthSession | null>;
  /** Subscribe to auth state changes. Returns an unsubscribe handle. */
  onAuthStateChange(
    callback: (session: AuthSession | null) => void
  ): AuthStateSubscription;
  /** Sign in with email + password. */
  signInWithEmail(
    email: string,
    password: string
  ): Promise<{ error: Error | null }>;
  /** Sign out the current session. */
  signOut(): Promise<{ error: Error | null }>;
  /** All roles assigned to a user (from the user_roles table). */
  getUserRoles(userId: string): Promise<AppRole[]>;

  // --- Admin user management (identity domain) ---
  /** Create a new user (admin only). Adapter attaches the caller's session. */
  createUser(input: {
    email: string;
    password: string;
    fullName?: string;
    roles?: string[];
  }): Promise<unknown>;
  /** List all (user_id, role) pairs (admin only). */
  listUserRoles(): Promise<UserRolePair[]>;
  /** Assign or remove a role for a user (admin only). */
  manageUserRole(input: {
    userId: string;
    role: AppRole;
    action: 'add' | 'remove';
  }): Promise<void>;
  /** Delete a user (admin only). */
  deleteUser(userId: string): Promise<unknown>;
}

import { supabaseAuthAdapter } from '@/lib/adapters/supabase/auth.supabase';

export const authService: AuthService = supabaseAuthAdapter;
