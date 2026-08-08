/** Supabase placeholder for SecretsService (reserved — T01 Vault encryption). */
import type { SecretsService } from '@/lib/services/secrets.service';

const NOT_IMPLEMENTED = 'secrets.service: not implemented yet (T01 — Supabase Vault).';

export const supabaseSecretsAdapter: SecretsService = {
  async getDecryptedToken() {
    throw new Error(NOT_IMPLEMENTED);
  },
  async storeToken() {
    throw new Error(NOT_IMPLEMENTED);
  },
  async rotateToken() {
    throw new Error(NOT_IMPLEMENTED);
  },
};
