/**
 * secrets.service — abstraction for encrypted secret/token storage.
 * Reserved for T01 (token encryption via Supabase Vault). Migrates to
 * Vault/KMS in Phase 2 (ADR-025). NEVER store secrets in clear (global.md veto).
 */

export interface SecretsService {
  /** Decrypt and return a stored OAuth token for a closer integration. */
  getDecryptedToken(closerId: string, integrationType: string): Promise<string | null>;
  /** Store a token encrypted at rest; returns its opaque reference. */
  storeToken(closerId: string, integrationType: string, token: string): Promise<string>;
  /** Rotate an existing token. */
  rotateToken(closerId: string, integrationType: string, token: string): Promise<void>;
}

import { supabaseSecretsAdapter } from '@/lib/adapters/supabase/secrets.supabase';

export const secretsService: SecretsService = supabaseSecretsAdapter;
