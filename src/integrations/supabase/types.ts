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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          assigned_to: string | null
          auto_assigned: boolean | null
          channel: string | null
          created_at: string | null
          end_at: string
          gcal_event_id: string | null
          id: string
          lead_id: string
          start_at: string
          status: string | null
        }
        Insert: {
          assigned_to?: string | null
          auto_assigned?: boolean | null
          channel?: string | null
          created_at?: string | null
          end_at: string
          gcal_event_id?: string | null
          id?: string
          lead_id: string
          start_at: string
          status?: string | null
        }
        Update: {
          assigned_to?: string | null
          auto_assigned?: boolean | null
          channel?: string | null
          created_at?: string | null
          end_at?: string
          gcal_event_id?: string | null
          id?: string
          lead_id?: string
          start_at?: string
          status?: string | null
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
          annual_revenue: string
          call_objective: string
          commitment_confirmed: boolean
          company_linkedin: string | null
          company_name: string
          company_website: string | null
          confirmed_at: string | null
          created_at: string | null
          current_channels: Json | null
          email: string
          first_name: string
          has_used_ai_crm: string
          id: string
          industry: string
          ip_address: string | null
          is_business_email: boolean | null
          job_title: string
          language: string | null
          last_name: string
          main_challenge: string
          phone: string
          preferred_date: string | null
          preferred_platform: string
          sales_team_size: number | null
          status: string | null
          submission_source: string | null
          timezone: string
          updated_at: string | null
          urgency: string
          user_agent: string | null
        }
        Insert: {
          annual_revenue: string
          call_objective: string
          commitment_confirmed?: boolean
          company_linkedin?: string | null
          company_name: string
          company_website?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          current_channels?: Json | null
          email: string
          first_name: string
          has_used_ai_crm: string
          id?: string
          industry: string
          ip_address?: string | null
          is_business_email?: boolean | null
          job_title: string
          language?: string | null
          last_name: string
          main_challenge: string
          phone: string
          preferred_date?: string | null
          preferred_platform: string
          sales_team_size?: number | null
          status?: string | null
          submission_source?: string | null
          timezone: string
          updated_at?: string | null
          urgency: string
          user_agent?: string | null
        }
        Update: {
          annual_revenue?: string
          call_objective?: string
          commitment_confirmed?: boolean
          company_linkedin?: string | null
          company_name?: string
          company_website?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          current_channels?: Json | null
          email?: string
          first_name?: string
          has_used_ai_crm?: string
          id?: string
          industry?: string
          ip_address?: string | null
          is_business_email?: boolean | null
          job_title?: string
          language?: string | null
          last_name?: string
          main_challenge?: string
          phone?: string
          preferred_date?: string | null
          preferred_platform?: string
          sales_team_size?: number | null
          status?: string | null
          submission_source?: string | null
          timezone?: string
          updated_at?: string | null
          urgency?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      closer_assignments: {
        Row: {
          closer_id: string
          created_at: string | null
          id: string
          last_assigned_at: string | null
          total_assigned: number | null
        }
        Insert: {
          closer_id: string
          created_at?: string | null
          id?: string
          last_assigned_at?: string | null
          total_assigned?: number | null
        }
        Update: {
          closer_id?: string
          created_at?: string | null
          id?: string
          last_assigned_at?: string | null
          total_assigned?: number | null
        }
        Relationships: []
      }
      closer_integrations: {
        Row: {
          access_token: string
          closer_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          refresh_token: string | null
          updated_at: string | null
        }
        Insert: {
          access_token: string
          closer_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          refresh_token?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          closer_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          refresh_token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string | null
          expected_close_date: string | null
          id: string
          lead_id: string
          offer_name: string
          stage: string | null
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id: string
          offer_name: string
          stage?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string
          offer_name?: string
          stage?: string | null
          updated_at?: string | null
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
          last_sync: string | null
          status: string | null
        }
        Insert: {
          entity_id: string
          entity_type: string
          error?: string | null
          hubspot_id?: string | null
          id?: string
          last_sync?: string | null
          status?: string | null
        }
        Update: {
          entity_id?: string
          entity_type?: string
          error?: string | null
          hubspot_id?: string | null
          id?: string
          last_sync?: string | null
          status?: string | null
        }
        Relationships: []
      }
      formations: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          file_type: string | null
          file_url: string
          id: string
          is_published: boolean | null
          order_index: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      interactions: {
        Row: {
          by_user_id: string | null
          content: string | null
          created_at: string | null
          id: string
          lead_id: string
          type: string
        }
        Insert: {
          by_user_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          lead_id: string
          type: string
        }
        Update: {
          by_user_id?: string | null
          content?: string | null
          created_at?: string | null
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
          updated_at: string | null
        }
        Insert: {
          features?: Json | null
          id?: string
          lead_id: string
          model?: string | null
          score: number
          sentiment?: number | null
          updated_at?: string | null
        }
        Update: {
          features?: Json | null
          id?: string
          lead_id?: string
          model?: string | null
          score?: number
          sentiment?: number | null
          updated_at?: string | null
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
          created_at: string | null
          email: string
          full_name: string
          id: string
          interest: string | null
          owner_id: string | null
          phone: string | null
          score: number | null
          source: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          interest?: string | null
          owner_id?: string | null
          phone?: string | null
          score?: number | null
          source: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          interest?: string | null
          owner_id?: string | null
          phone?: string | null
          score?: number | null
          source?: string
          status?: string | null
          updated_at?: string | null
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
          created_at: string | null
          deal_id: string
          id: string
          paid_at: string | null
          provider: string
          status: string | null
          tx_ref: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          deal_id: string
          id?: string
          paid_at?: string | null
          provider: string
          status?: string | null
          tx_ref?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          deal_id?: string
          id?: string
          paid_at?: string | null
          provider?: string
          status?: string | null
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
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          max_concurrent_leads: number | null
          specialties: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          max_concurrent_leads?: number | null
          specialties?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          max_concurrent_leads?: number | null
          specialties?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string | null
          title: string
          type: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          title: string
          type?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
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
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          page_path: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
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
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content_ar?: string | null
          content_en?: string | null
          content_fr?: string | null
          id?: string
          image_url?: string | null
          section_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content_ar?: string | null
          content_en?: string | null
          content_fr?: string | null
          id?: string
          image_url?: string | null
          section_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      app_role: "admin" | "user" | "closer" | "owner" | "client" | "developer"
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
      app_role: ["admin", "user", "closer", "owner", "client", "developer"],
    },
  },
} as const
