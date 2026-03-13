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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_choices: {
        Row: {
          activity_name: string
          activity_type: string
          category: string | null
          created_at: string
          id: string
          organization: string | null
          psychological_drivers: Json | null
          reasons: Json
          source: string
          token_id: string
        }
        Insert: {
          activity_name: string
          activity_type?: string
          category?: string | null
          created_at?: string
          id?: string
          organization?: string | null
          psychological_drivers?: Json | null
          reasons?: Json
          source?: string
          token_id: string
        }
        Update: {
          activity_name?: string
          activity_type?: string
          category?: string | null
          created_at?: string
          id?: string
          organization?: string | null
          psychological_drivers?: Json | null
          reasons?: Json
          source?: string
          token_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_choices_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      global_retiree_insights: {
        Row: {
          activity_suggested: string
          constraints: string
          created_at: string
          dream: string
          gap_detected: boolean | null
          holland_top: Json
          id: string
          market_unmet_need: string | null
          motivation_logic: string
          motivation_tag: string | null
          preferences: Json
          profession_category: string | null
          scarcity_score: number | null
          schein_top: Json
          skills_winner: Json
          token_id: string
          user_persona: string
          via_top: Json
        }
        Insert: {
          activity_suggested?: string
          constraints?: string
          created_at?: string
          dream?: string
          gap_detected?: boolean | null
          holland_top?: Json
          id?: string
          market_unmet_need?: string | null
          motivation_logic?: string
          motivation_tag?: string | null
          preferences?: Json
          profession_category?: string | null
          scarcity_score?: number | null
          schein_top?: Json
          skills_winner?: Json
          token_id: string
          user_persona?: string
          via_top?: Json
        }
        Update: {
          activity_suggested?: string
          constraints?: string
          created_at?: string
          dream?: string
          gap_detected?: boolean | null
          holland_top?: Json
          id?: string
          market_unmet_need?: string | null
          motivation_logic?: string
          motivation_tag?: string | null
          preferences?: Json
          profession_category?: string | null
          scarcity_score?: number | null
          schein_top?: Json
          skills_winner?: Json
          token_id?: string
          user_persona?: string
          via_top?: Json
        }
        Relationships: [
          {
            foreignKeyName: "global_retiree_insights_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: true
            referencedRelation: "questionnaire_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          link: string
          location: string | null
          logo_url: string | null
          organization_name: string
          target_traits: Json
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          link?: string
          location?: string | null
          logo_url?: string | null
          organization_name: string
          target_traits?: Json
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          link?: string
          location?: string | null
          logo_url?: string | null
          organization_name?: string
          target_traits?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      questionnaire_responses: {
        Row: {
          created_at: string
          id: string
          response_data: Json
          token_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          response_data?: Json
          token_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          response_data?: Json
          token_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_responses_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: true
            referencedRelation: "questionnaire_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_tokens: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          id_number: string | null
          token: string
          used: boolean
          username: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          id_number?: string | null
          token?: string
          used?: boolean
          username: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          id_number?: string | null
          token?: string
          used?: boolean
          username?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          created_at: string
          feedback: string
          id: string
          opportunity_id: string
          token_id: string
        }
        Insert: {
          created_at?: string
          feedback: string
          id?: string
          opportunity_id: string
          token_id: string
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          opportunity_id?: string
          token_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedback_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          metadata: Json | null
          target_id: string | null
          target_title: string
          target_type: string
          token_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          target_id?: string | null
          target_title: string
          target_type: string
          token_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          target_id?: string | null
          target_title?: string
          target_type?: string
          token_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          archetype: string | null
          career_history: string | null
          created_at: string
          id: string
          personality_sliders: Json | null
          primary_interests: Json | null
          psychometric_scores: Json | null
          token_id: string
          updated_at: string
          value_alignment: Json | null
        }
        Insert: {
          archetype?: string | null
          career_history?: string | null
          created_at?: string
          id?: string
          personality_sliders?: Json | null
          primary_interests?: Json | null
          psychometric_scores?: Json | null
          token_id: string
          updated_at?: string
          value_alignment?: Json | null
        }
        Update: {
          archetype?: string | null
          career_history?: string | null
          created_at?: string
          id?: string
          personality_sliders?: Json | null
          primary_interests?: Json | null
          psychometric_scores?: Json | null
          token_id?: string
          updated_at?: string
          value_alignment?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
