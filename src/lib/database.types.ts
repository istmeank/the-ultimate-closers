// AUTO-GENERATED par mcp__supabase__generate_typescript_types
// Date : 2026-06-09 - TUC-v2 — M1 Vault schema (access_token_secret_id / refresh_token_secret_id)
// Ne PAS éditer manuellement — régénérer via : npx supabase gen types typescript --project-id llxgyomevketvypusafl

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          assigned_to: string | null
          auto_assigned: boolean
          channel: string
          created_at: string
          deleted_at: string | null
          end_at: string
          gcal_event_id: string | null
          id: string
          lead_id: string
          start_at: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          auto_assigned?: boolean
          channel?: string
          created_at?: string
          deleted_at?: string | null
          end_at: string
          gcal_event_id?: string | null
          id?: string
          lead_id: string
          start_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          auto_assigned?: boolean
          channel?: string
          created_at?: string
          deleted_at?: string | null
          end_at?: string
          gcal_event_id?: string | null
          id?: string
          lead_id?: string
          start_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      call_bookings: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          lead_id: string | null
          main_challenge: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          lead_id?: string | null
          main_challenge?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          lead_id?: string | null
          main_challenge?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      closer_assignments: {
        Row: {
          closer_id: string
          created_at: string
          id: string
          last_assigned_at: string | null
          total_assigned: number
        }
        Insert: {
          closer_id: string
          created_at?: string
          id?: string
          last_assigned_at?: string | null
          total_assigned?: number
        }
        Update: {
          closer_id?: string
          created_at?: string
          id?: string
          last_assigned_at?: string | null
          total_assigned?: number
        }
        Relationships: []
      }
      closer_integrations: {
        Row: {
          access_token_secret_id: string
          closer_id: string
          created_at: string
          expires_at: string | null
          id: string
          integration_type: string
          is_active: boolean
          refresh_token_secret_id: string | null
          updated_at: string
        }
        Insert: {
          access_token_secret_id: string
          closer_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          integration_type: string
          is_active?: boolean
          refresh_token_secret_id?: string | null
          updated_at?: string
        }
        Update: {
          access_token_secret_id?: string
          closer_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean
          refresh_token_secret_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          deleted_at: string | null
          expected_close_date: string | null
          id: string
          lead_id: string
          offer_name: string
          stage: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          deleted_at?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id: string
          offer_name: string
          stage?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          deleted_at?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string
          offer_name?: string
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      external_sync_log: {
        Row: {
          entity_id: string
          entity_type: string
          error: string | null
          hubspot_id: string | null
          id: string
          last_sync: string
          status: string
        }
        Insert: {
          entity_id: string
          entity_type: string
          error?: string | null
          hubspot_id?: string | null
          id?: string
          last_sync?: string
          status?: string
        }
        Update: {
          entity_id?: string
          entity_type?: string
          error?: string | null
          hubspot_id?: string | null
          id?: string
          last_sync?: string
          status?: string
        }
        Relationships: []
      }
      formations: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          file_type: string | null
          file_url: string
          id: string
          is_published: boolean
          order_index: number
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_published?: boolean
          order_index?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_published?: boolean
          order_index?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_tokens: {
        Row: {
          access_token_secret_id: string
          calendar_email: string | null
          created_at: string
          expires_at: string
          id: string
          refresh_token_secret_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_secret_id: string
          calendar_email?: string | null
          created_at?: string
          expires_at: string
          id?: string
          refresh_token_secret_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_secret_id?: string
          calendar_email?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token_secret_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          by_user_id: string | null
          content: string | null
          created_at: string
          id: string
          lead_id: string
          type: string
        }
        Insert: {
          by_user_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          lead_id: string
          type: string
        }
        Update: {
          by_user_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_by_user_id_fkey"
            columns: ["by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_scores: {
        Row: {
          features: Json | null
          id: string
          lead_id: string
          model: string | null
          score: number
          sentiment: number | null
          updated_at: string
        }
        Insert: {
          features?: Json | null
          id?: string
          lead_id: string
          model?: string | null
          score: number
          sentiment?: number | null
          updated_at?: string
        }
        Update: {
          features?: Json | null
          id?: string
          lead_id?: string
          model?: string | null
          score?: number
          sentiment?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_scores_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          full_name: string
          id: string
          interest: string | null
          owner_id: string | null
          phone: string | null
          score: number
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          full_name: string
          id?: string
          interest?: string | null
          owner_id?: string | null
          phone?: string | null
          score?: number
          source: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          full_name?: string
          id?: string
          interest?: string | null
          owner_id?: string | null
          phone?: string | null
          score?: number
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          deal_id: string
          id: string
          paid_at: string | null
          provider: string
          status: string
          tx_ref: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          deal_id: string
          id?: string
          paid_at?: string | null
          provider: string
          status?: string
          tx_ref?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          deal_id?: string
          id?: string
          paid_at?: string | null
          provider?: string
          status?: string
          tx_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          max_concurrent_leads: number
          specialties: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          max_concurrent_leads?: number
          specialties?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          max_concurrent_leads?: number
          specialties?: Json
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string
          id: string
          lead_id: string | null
          title: string
          type: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id?: string | null
          title: string
          type?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string | null
          title?: string
          type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      site_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          page_path: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_ar: string | null
          content_en: string | null
          content_fr: string | null
          id: string
          image_url: string | null
          section_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content_ar?: string | null
          content_en?: string | null
          content_fr?: string | null
          id?: string
          image_url?: string | null
          section_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content_ar?: string | null
          content_en?: string | null
          content_fr?: string | null
          id?: string
          image_url?: string | null
          section_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_content_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "closer" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "closer", "user"],
    },
  },
} as const
