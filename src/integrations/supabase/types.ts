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
      articles: {
        Row: {
          created_at: string
          credibility_tier: Database["public"]["Enums"]["credibility_tier"]
          dosing_details: Json | null
          evidence_quality: string | null
          findings: Json | null
          id: string
          peptides_mentioned: string[] | null
          published_at: string | null
          raw_content: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          search_vector: unknown
          source_account_handle: string | null
          source_id: string | null
          status: string
          summary: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          credibility_tier?: Database["public"]["Enums"]["credibility_tier"]
          dosing_details?: Json | null
          evidence_quality?: string | null
          findings?: Json | null
          id?: string
          peptides_mentioned?: string[] | null
          published_at?: string | null
          raw_content?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          search_vector?: unknown
          source_account_handle?: string | null
          source_id?: string | null
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          credibility_tier?: Database["public"]["Enums"]["credibility_tier"]
          dosing_details?: Json | null
          evidence_quality?: string | null
          findings?: Json | null
          id?: string
          peptides_mentioned?: string[] | null
          published_at?: string | null
          raw_content?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          search_vector?: unknown
          source_account_handle?: string | null
          source_id?: string | null
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
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
      content_embeddings: {
        Row: {
          article_id: string
          chunk_index: number
          chunk_text: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          article_id: string
          chunk_index?: number
          chunk_text: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          article_id?: string
          chunk_index?: number
          chunk_text?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "content_embeddings_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_queue: {
        Row: {
          article_id: string | null
          content_type: string
          created_at: string
          id: string
          processing_error: string | null
          processing_status: string
          raw_input: string
          source_url: string | null
          submitted_by: string
          updated_at: string
        }
        Insert: {
          article_id?: string | null
          content_type?: string
          created_at?: string
          id?: string
          processing_error?: string | null
          processing_status?: string
          raw_input: string
          source_url?: string | null
          submitted_by: string
          updated_at?: string
        }
        Update: {
          article_id?: string | null
          content_type?: string
          created_at?: string
          id?: string
          processing_error?: string | null
          processing_status?: string
          raw_input?: string
          source_url?: string | null
          submitted_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_queue_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          post_type: string
          published_at: string | null
          related_article_ids: string[] | null
          related_peptides: string[] | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_type?: string
          published_at?: string | null
          related_article_ids?: string[] | null
          related_peptides?: string[] | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_type?: string
          published_at?: string | null
          related_article_ids?: string[] | null
          related_peptides?: string[] | null
          status?: string
          title?: string
          updated_at?: string
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
      keyword_scores: {
        Row: {
          accept_count: number
          created_at: string
          id: string
          keyword: string
          reject_count: number
          score: number
          updated_at: string
        }
        Insert: {
          accept_count?: number
          created_at?: string
          id?: string
          keyword: string
          reject_count?: number
          score?: number
          updated_at?: string
        }
        Update: {
          accept_count?: number
          created_at?: string
          id?: string
          keyword?: string
          reject_count?: number
          score?: number
          updated_at?: string
        }
        Relationships: []
      }
      monitored_accounts: {
        Row: {
          added_by: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          handle: string
          id: string
          is_active: boolean
          last_scanned_at: string | null
          last_tweet_id: string | null
          platform: string
          quality_score: number
          scan_frequency: string
          total_accepted: number
          total_rejected: number
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          handle: string
          id?: string
          is_active?: boolean
          last_scanned_at?: string | null
          last_tweet_id?: string | null
          platform?: string
          quality_score?: number
          scan_frequency?: string
          total_accepted?: number
          total_rejected?: number
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          handle?: string
          id?: string
          is_active?: boolean
          last_scanned_at?: string | null
          last_tweet_id?: string | null
          platform?: string
          quality_score?: number
          scan_frequency?: string
          total_accepted?: number
          total_rejected?: number
          updated_at?: string
        }
        Relationships: []
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
      sources: {
        Row: {
          created_at: string
          credibility: Database["public"]["Enums"]["credibility_tier"]
          description: string | null
          id: string
          name: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          credibility?: Database["public"]["Enums"]["credibility_tier"]
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          credibility?: Database["public"]["Enums"]["credibility_tier"]
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          url?: string | null
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
      match_embeddings: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          article_id: string
          chunk_text: string
          id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      credibility_tier:
        | "peer_reviewed"
        | "clinical_trial"
        | "expert_review"
        | "established_media"
        | "community_verified"
        | "anecdotal"
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
      credibility_tier: [
        "peer_reviewed",
        "clinical_trial",
        "expert_review",
        "established_media",
        "community_verified",
        "anecdotal",
      ],
    },
  },
} as const
