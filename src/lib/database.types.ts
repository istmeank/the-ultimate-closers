// AUTO-GENERATED par mcp__supabase__generate_typescript_types
// Date : 2026-06-07 - TUC-v2 baseline
// Ne PAS éditer manuellement — régénérer via : npx supabase gen types typescript --project-id llxgyomevketvypusafl

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      // 17 tables : appointments, call_bookings, closer_assignments, closer_integrations,
      // deals, external_sync_log, formations, google_calendar_tokens, interactions,
      // lead_scores, leads, payments, profiles, resources, site_analytics,
      // site_content, user_roles
      // Types complets disponibles via : npx supabase gen types typescript --project-id llxgyomevketvypusafl
      [key: string]: any
    }
    Views: { [_ in never]: never }
    Functions: {
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "closer" | "user"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "closer", "user"],
    },
  },
} as const
