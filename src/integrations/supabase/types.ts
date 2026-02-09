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
      benefit_votes: {
        Row: {
          benefit: string
          created_at: string
          id: string
          stack_name: string
          user_id: string
          vote_type: string
        }
        Insert: {
          benefit: string
          created_at?: string
          id?: string
          stack_name: string
          user_id: string
          vote_type: string
        }
        Update: {
          benefit?: string
          created_at?: string
          id?: string
          stack_name?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: []
      }
      bloodwork_markers: {
        Row: {
          created_at: string
          id: string
          marker_name: string
          panel_id: string
          unit: string
          value: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          marker_name: string
          panel_id: string
          unit: string
          value?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          marker_name?: string
          panel_id?: string
          unit?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bloodwork_markers_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "bloodwork_panels"
            referencedColumns: ["id"]
          },
        ]
      }
      bloodwork_panels: {
        Row: {
          created_at: string
          id: string
          panel_type: string
          test_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          panel_type?: string
          test_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          panel_type?: string
          test_date?: string
          user_id?: string
        }
        Relationships: []
      }
      injection_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          dose_mcg: number
          id: string
          injection_site: string | null
          notes: string | null
          peptide_name: string
          protocol_peptide_id: string | null
          scheduled_time: string
          side_effects: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          dose_mcg: number
          id?: string
          injection_site?: string | null
          notes?: string | null
          peptide_name: string
          protocol_peptide_id?: string | null
          scheduled_time: string
          side_effects?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          dose_mcg?: number
          id?: string
          injection_site?: string | null
          notes?: string | null
          peptide_name?: string
          protocol_peptide_id?: string | null
          scheduled_time?: string
          side_effects?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "injection_logs_protocol_peptide_id_fkey"
            columns: ["protocol_peptide_id"]
            isOneToOne: false
            referencedRelation: "protocol_peptides"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      protocol_peptides: {
        Row: {
          created_at: string
          dose_mcg: number
          frequency: string
          id: string
          notes: string | null
          peptide_name: string
          protocol_id: string
          route: string | null
          timing: string | null
        }
        Insert: {
          created_at?: string
          dose_mcg: number
          frequency?: string
          id?: string
          notes?: string | null
          peptide_name: string
          protocol_id: string
          route?: string | null
          timing?: string | null
        }
        Update: {
          created_at?: string
          dose_mcg?: number
          frequency?: string
          id?: string
          notes?: string | null
          peptide_name?: string
          protocol_id?: string
          route?: string | null
          timing?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "protocol_peptides_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      protocols: {
        Row: {
          created_at: string
          disclaimer_accepted: boolean
          end_date: string | null
          goal: string | null
          id: string
          name: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disclaimer_accepted?: boolean
          end_date?: string | null
          goal?: string | null
          id?: string
          name: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          disclaimer_accepted?: boolean
          end_date?: string | null
          goal?: string | null
          id?: string
          name?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_stacks: {
        Row: {
          created_at: string
          id: string
          name: string
          peptides: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          peptides?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          peptides?: string[]
          user_id?: string
        }
        Relationships: []
      }
      side_effect_votes: {
        Row: {
          created_at: string
          id: string
          side_effect: string
          stack_name: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          side_effect: string
          stack_name: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          side_effect?: string
          stack_name?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: []
      }
      stack_votes: {
        Row: {
          created_at: string
          id: string
          stack_name: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          stack_name: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          stack_name?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      benefit_vote_counts: {
        Row: {
          benefit: string | null
          downvotes: number | null
          stack_name: string | null
          upvotes: number | null
        }
        Relationships: []
      }
      side_effect_vote_counts: {
        Row: {
          downvotes: number | null
          side_effect: string | null
          stack_name: string | null
          upvotes: number | null
        }
        Relationships: []
      }
      stack_vote_counts: {
        Row: {
          downvotes: number | null
          stack_name: string | null
          upvotes: number | null
        }
        Relationships: []
      }
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
