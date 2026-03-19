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
      audit_results: {
        Row: {
          audit_run_id: string | null
          compound_name: string
          compound_type: string
          created_at: string
          current_value: string | null
          field_affected: string | null
          fixed_at: string | null
          fixed_by: string | null
          id: string
          issue_description: string | null
          issue_type: string
          peptyl_id: string | null
          recommended_fix: string | null
          severity: string
          status: string
        }
        Insert: {
          audit_run_id?: string | null
          compound_name: string
          compound_type?: string
          created_at?: string
          current_value?: string | null
          field_affected?: string | null
          fixed_at?: string | null
          fixed_by?: string | null
          id?: string
          issue_description?: string | null
          issue_type: string
          peptyl_id?: string | null
          recommended_fix?: string | null
          severity?: string
          status?: string
        }
        Update: {
          audit_run_id?: string | null
          compound_name?: string
          compound_type?: string
          created_at?: string
          current_value?: string | null
          field_affected?: string | null
          fixed_at?: string | null
          fixed_by?: string | null
          id?: string
          issue_description?: string | null
          issue_type?: string
          peptyl_id?: string | null
          recommended_fix?: string | null
          severity?: string
          status?: string
        }
        Relationships: []
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
          marker_status: string | null
          optimal_high: number | null
          optimal_low: number | null
          panel_id: string
          ref_high: number | null
          ref_low: number | null
          unit: string
          value: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          marker_name: string
          marker_status?: string | null
          optimal_high?: number | null
          optimal_low?: number | null
          panel_id: string
          ref_high?: number | null
          ref_low?: number | null
          unit: string
          value?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          marker_name?: string
          marker_status?: string | null
          optimal_high?: number | null
          optimal_low?: number | null
          panel_id?: string
          ref_high?: number | null
          ref_low?: number | null
          unit?: string
          value?: number | null
        }
        Relationships: []
      }
      bloodwork_panels: {
        Row: {
          created_at: string | null
          dna_report_id: string | null
          id: string
          medichecks_product_code: string | null
          panel_name: string
          panel_type: string | null
          protocol_id: string | null
          rationale: string
          recommended_tests: string[]
          test_date: string | null
          tier: string | null
          trigger_biomarker: string | null
          trigger_condition: string | null
          trigger_gene: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dna_report_id?: string | null
          id?: string
          medichecks_product_code?: string | null
          panel_name: string
          panel_type?: string | null
          protocol_id?: string | null
          rationale: string
          recommended_tests: string[]
          test_date?: string | null
          tier?: string | null
          trigger_biomarker?: string | null
          trigger_condition?: string | null
          trigger_gene?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dna_report_id?: string | null
          id?: string
          medichecks_product_code?: string | null
          panel_name?: string
          panel_type?: string | null
          protocol_id?: string | null
          rationale?: string
          recommended_tests?: string[]
          test_date?: string | null
          tier?: string | null
          trigger_biomarker?: string | null
          trigger_condition?: string | null
          trigger_gene?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bloodwork_panels_dna_report_id_fkey"
            columns: ["dna_report_id"]
            isOneToOne: false
            referencedRelation: "dna_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bloodwork_panels_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
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
      derived_biomarkers: {
        Row: {
          created_at: string
          date: string
          id: string
          metadata: Json | null
          metric_name: string
          user_id: string
          value: number | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          metadata?: Json | null
          metric_name: string
          user_id: string
          value?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      dna_consents: {
        Row: {
          consent_version: string | null
          consented_at: string
          feature: string
          id: string
          user_id: string
        }
        Insert: {
          consent_version?: string | null
          consented_at?: string
          feature?: string
          id?: string
          user_id: string
        }
        Update: {
          consent_version?: string | null
          consented_at?: string
          feature?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      dna_reports: {
        Row: {
          assessment_tier: string | null
          confidence: string | null
          created_at: string
          id: string
          input_method: string
          lifestyle_context: Json | null
          narrative: string | null
          overall_score: number | null
          plan_start_date: string | null
          report_json: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_tier?: string | null
          confidence?: string | null
          created_at?: string
          id?: string
          input_method: string
          lifestyle_context?: Json | null
          narrative?: string | null
          overall_score?: number | null
          plan_start_date?: string | null
          report_json: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_tier?: string | null
          confidence?: string | null
          created_at?: string
          id?: string
          input_method?: string
          lifestyle_context?: Json | null
          narrative?: string | null
          overall_score?: number | null
          plan_start_date?: string | null
          report_json?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dna_reviews: {
        Row: {
          created_at: string
          id: string
          note: string | null
          rating: number
          report_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          rating: number
          report_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          rating?: number
          report_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dna_reviews_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "dna_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      drug_interactions: {
        Row: {
          clinical_note: string
          compound_name: string
          created_at: string | null
          drug_class: string
          drug_examples: string[]
          id: string
          interaction_type: string
          mechanism: string | null
          rxnorm_ids: string[] | null
          severity: string
        }
        Insert: {
          clinical_note: string
          compound_name: string
          created_at?: string | null
          drug_class: string
          drug_examples: string[]
          id?: string
          interaction_type: string
          mechanism?: string | null
          rxnorm_ids?: string[] | null
          severity: string
        }
        Update: {
          clinical_note?: string
          compound_name?: string
          created_at?: string | null
          drug_class?: string
          drug_examples?: string[]
          id?: string
          interaction_type?: string
          mechanism?: string | null
          rxnorm_ids?: string[] | null
          severity?: string
        }
        Relationships: []
      }
      entities: {
        Row: {
          aliases: string[] | null
          created_at: string | null
          dbsnp_id: string | null
          evidence_score: number | null
          id: string
          loinc_code: string | null
          name: string
          notes: string | null
          pubmed_ids: string[] | null
          rxnorm_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          aliases?: string[] | null
          created_at?: string | null
          dbsnp_id?: string | null
          evidence_score?: number | null
          id?: string
          loinc_code?: string | null
          name: string
          notes?: string | null
          pubmed_ids?: string[] | null
          rxnorm_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          aliases?: string[] | null
          created_at?: string | null
          dbsnp_id?: string | null
          evidence_score?: number | null
          id?: string
          loinc_code?: string | null
          name?: string
          notes?: string | null
          pubmed_ids?: string[] | null
          rxnorm_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
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
      feedback: {
        Row: {
          category: string | null
          created_at: string
          id: string
          message: string
          page: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          message: string
          page?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          message?: string
          page?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fitbit_connections: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          fitbit_user_id: string | null
          id: string
          last_sync_at: string | null
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          fitbit_user_id?: string | null
          id?: string
          last_sync_at?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          fitbit_user_id?: string | null
          id?: string
          last_sync_at?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fitbit_daily_metrics: {
        Row: {
          active_zone_minutes: number | null
          calories_burned: number | null
          created_at: string
          date: string
          hrv: number | null
          id: string
          raw_json: Json | null
          resting_heart_rate: number | null
          sleep_duration_minutes: number | null
          sleep_score: number | null
          steps: number | null
          stress_score: number | null
          user_id: string
        }
        Insert: {
          active_zone_minutes?: number | null
          calories_burned?: number | null
          created_at?: string
          date: string
          hrv?: number | null
          id?: string
          raw_json?: Json | null
          resting_heart_rate?: number | null
          sleep_duration_minutes?: number | null
          sleep_score?: number | null
          steps?: number | null
          stress_score?: number | null
          user_id: string
        }
        Update: {
          active_zone_minutes?: number | null
          calories_burned?: number | null
          created_at?: string
          date?: string
          hrv?: number | null
          id?: string
          raw_json?: Json | null
          resting_heart_rate?: number | null
          sleep_duration_minutes?: number | null
          sleep_score?: number | null
          steps?: number | null
          stress_score?: number | null
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
      journal_entries: {
        Row: {
          article_id: string | null
          content: string
          created_at: string
          evidence_quality: string | null
          findings_count: number | null
          id: string
          peptides: string[] | null
          summary: string | null
          user_id: string
        }
        Insert: {
          article_id?: string | null
          content: string
          created_at?: string
          evidence_quality?: string | null
          findings_count?: number | null
          id?: string
          peptides?: string[] | null
          summary?: string | null
          user_id: string
        }
        Update: {
          article_id?: string | null
          content?: string
          created_at?: string
          evidence_quality?: string | null
          findings_count?: number | null
          id?: string
          peptides?: string[] | null
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
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
      knowledge_edges: {
        Row: {
          created_at: string | null
          direction: string | null
          dose_note: string | null
          evidence_level: string | null
          from_entity_id: string
          id: string
          notes: string | null
          relationship: string
          source: string | null
          strength: string | null
          to_entity_id: string
        }
        Insert: {
          created_at?: string | null
          direction?: string | null
          dose_note?: string | null
          evidence_level?: string | null
          from_entity_id: string
          id?: string
          notes?: string | null
          relationship: string
          source?: string | null
          strength?: string | null
          to_entity_id: string
        }
        Update: {
          created_at?: string | null
          direction?: string | null
          dose_note?: string | null
          evidence_level?: string | null
          from_entity_id?: string
          id?: string
          notes?: string | null
          relationship?: string
          source?: string | null
          strength?: string | null
          to_entity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_edges_from_entity_id_fkey"
            columns: ["from_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_edges_to_entity_id_fkey"
            columns: ["to_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      marker_requests: {
        Row: {
          created_at: string
          id: string
          marker_name: string
          source: string | null
          status: string
          user_email: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          marker_name: string
          source?: string | null
          status?: string
          user_email?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          marker_name?: string
          source?: string | null
          status?: string
          user_email?: string | null
          user_id?: string
          user_name?: string | null
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
      nudge_log: {
        Row: {
          clinical_tier: string | null
          email_sent: boolean | null
          error_message: string | null
          id: string
          message_content: string | null
          nudge_type: string
          protocol_id: string | null
          push_sent: boolean | null
          sent_at: string
          user_id: string
        }
        Insert: {
          clinical_tier?: string | null
          email_sent?: boolean | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          nudge_type: string
          protocol_id?: string | null
          push_sent?: boolean | null
          sent_at?: string
          user_id: string
        }
        Update: {
          clinical_tier?: string | null
          email_sent?: boolean | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          nudge_type?: string
          protocol_id?: string | null
          push_sent?: boolean | null
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nudge_log_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      outcome_records: {
        Row: {
          adherence_percentage: number | null
          aggregation_genotype_key: string | null
          avg_hrv_baseline: number | null
          avg_hrv_protocol: number | null
          avg_recovery_baseline: number | null
          avg_recovery_protocol: number | null
          avg_sleep_score_baseline: number | null
          avg_sleep_score_protocol: number | null
          baseline_date: string | null
          baseline_markers: Json | null
          baseline_panel_id: string | null
          consented_to_aggregate: boolean | null
          created_at: string | null
          dna_report_id: string | null
          genotype_signals: Json | null
          id: string
          outcome_markers: Json | null
          overall_responder_status: string | null
          protocol_id: string | null
          protocol_snapshot: Json | null
          protocol_start_date: string | null
          retest_date: string | null
          retest_markers: Json | null
          retest_panel_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          weeks_on_protocol: number | null
        }
        Insert: {
          adherence_percentage?: number | null
          aggregation_genotype_key?: string | null
          avg_hrv_baseline?: number | null
          avg_hrv_protocol?: number | null
          avg_recovery_baseline?: number | null
          avg_recovery_protocol?: number | null
          avg_sleep_score_baseline?: number | null
          avg_sleep_score_protocol?: number | null
          baseline_date?: string | null
          baseline_markers?: Json | null
          baseline_panel_id?: string | null
          consented_to_aggregate?: boolean | null
          created_at?: string | null
          dna_report_id?: string | null
          genotype_signals?: Json | null
          id?: string
          outcome_markers?: Json | null
          overall_responder_status?: string | null
          protocol_id?: string | null
          protocol_snapshot?: Json | null
          protocol_start_date?: string | null
          retest_date?: string | null
          retest_markers?: Json | null
          retest_panel_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          weeks_on_protocol?: number | null
        }
        Update: {
          adherence_percentage?: number | null
          aggregation_genotype_key?: string | null
          avg_hrv_baseline?: number | null
          avg_hrv_protocol?: number | null
          avg_recovery_baseline?: number | null
          avg_recovery_protocol?: number | null
          avg_sleep_score_baseline?: number | null
          avg_sleep_score_protocol?: number | null
          baseline_date?: string | null
          baseline_markers?: Json | null
          baseline_panel_id?: string | null
          consented_to_aggregate?: boolean | null
          created_at?: string | null
          dna_report_id?: string | null
          genotype_signals?: Json | null
          id?: string
          outcome_markers?: Json | null
          overall_responder_status?: string | null
          protocol_id?: string | null
          protocol_snapshot?: Json | null
          protocol_start_date?: string | null
          retest_date?: string | null
          retest_markers?: Json | null
          retest_panel_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          weeks_on_protocol?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "outcome_records_dna_report_id_fkey"
            columns: ["dna_report_id"]
            isOneToOne: false
            referencedRelation: "dna_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcome_records_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          event_type: string | null
          gocardless_event_id: string | null
          id: string
          payment_id: string | null
          product: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          event_type?: string | null
          gocardless_event_id?: string | null
          id?: string
          payment_id?: string | null
          product?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          event_type?: string | null
          gocardless_event_id?: string | null
          id?: string
          payment_id?: string | null
          product?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      peptide_experience_votes: {
        Row: {
          created_at: string
          experience_key: string
          id: string
          peptide_name: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          experience_key: string
          id?: string
          peptide_name: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          experience_key?: string
          id?: string
          peptide_name?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: []
      }
      peptides_enriched: {
        Row: {
          administration: string[] | null
          aliases: string[] | null
          antagonistic_compounds: string[] | null
          category: string | null
          contraindications: string[] | null
          created_at: string
          cycle_duration: string | null
          description: string | null
          dna_profile_signals: Json | null
          dose_range: string | null
          dosing_notes: string | null
          drug_interactions: string[] | null
          enriched_at: string | null
          enrichment_model: string | null
          enrichment_status: string
          evidence_grade: string | null
          evidence_summary: string | null
          fitness_relevance: string | null
          frequency: string | null
          full_name: string | null
          health_optimisation_relevance: string | null
          id: string
          is_active: boolean
          key_research_refs: Json | null
          longevity_relevance: string | null
          mechanism_of_action: string | null
          name: string
          peptyl_id: string
          primary_effects: string[] | null
          regulatory_note: string | null
          regulatory_status_eu: string | null
          regulatory_status_uk: string | null
          regulatory_status_us: string | null
          side_effects_common: string[] | null
          side_effects_rare: string[] | null
          synergistic_compounds: string[] | null
          updated_at: string
        }
        Insert: {
          administration?: string[] | null
          aliases?: string[] | null
          antagonistic_compounds?: string[] | null
          category?: string | null
          contraindications?: string[] | null
          created_at?: string
          cycle_duration?: string | null
          description?: string | null
          dna_profile_signals?: Json | null
          dose_range?: string | null
          dosing_notes?: string | null
          drug_interactions?: string[] | null
          enriched_at?: string | null
          enrichment_model?: string | null
          enrichment_status?: string
          evidence_grade?: string | null
          evidence_summary?: string | null
          fitness_relevance?: string | null
          frequency?: string | null
          full_name?: string | null
          health_optimisation_relevance?: string | null
          id?: string
          is_active?: boolean
          key_research_refs?: Json | null
          longevity_relevance?: string | null
          mechanism_of_action?: string | null
          name: string
          peptyl_id: string
          primary_effects?: string[] | null
          regulatory_note?: string | null
          regulatory_status_eu?: string | null
          regulatory_status_uk?: string | null
          regulatory_status_us?: string | null
          side_effects_common?: string[] | null
          side_effects_rare?: string[] | null
          synergistic_compounds?: string[] | null
          updated_at?: string
        }
        Update: {
          administration?: string[] | null
          aliases?: string[] | null
          antagonistic_compounds?: string[] | null
          category?: string | null
          contraindications?: string[] | null
          created_at?: string
          cycle_duration?: string | null
          description?: string | null
          dna_profile_signals?: Json | null
          dose_range?: string | null
          dosing_notes?: string | null
          drug_interactions?: string[] | null
          enriched_at?: string | null
          enrichment_model?: string | null
          enrichment_status?: string
          evidence_grade?: string | null
          evidence_summary?: string | null
          fitness_relevance?: string | null
          frequency?: string | null
          full_name?: string | null
          health_optimisation_relevance?: string | null
          id?: string
          is_active?: boolean
          key_research_refs?: Json | null
          longevity_relevance?: string | null
          mechanism_of_action?: string | null
          name?: string
          peptyl_id?: string
          primary_effects?: string[] | null
          regulatory_note?: string | null
          regulatory_status_eu?: string | null
          regulatory_status_uk?: string | null
          regulatory_status_us?: string | null
          side_effects_common?: string[] | null
          side_effects_rare?: string[] | null
          synergistic_compounds?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      pip_product_recommendations: {
        Row: {
          created_at: string | null
          id: string
          link_clicked: boolean | null
          message_sent: string | null
          product_id: string | null
          symptom_trigger: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link_clicked?: boolean | null
          message_sent?: string | null
          product_id?: string | null
          symptom_trigger?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link_clicked?: boolean | null
          message_sent?: string | null
          product_id?: string | null
          symptom_trigger?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pip_product_recommendations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "support_products"
            referencedColumns: ["id"]
          },
        ]
      }
      pip_protocol_debriefs: {
        Row: {
          created_at: string | null
          debrief_complete: boolean | null
          id: string
          protocol_id: string
          q1_answered_at: string | null
          q1_rating: number | null
          q2_answered_at: string | null
          q2_changes: string | null
          q3_adjustments: string | null
          q3_answered_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debrief_complete?: boolean | null
          id?: string
          protocol_id: string
          q1_answered_at?: string | null
          q1_rating?: number | null
          q2_answered_at?: string | null
          q2_changes?: string | null
          q3_adjustments?: string | null
          q3_answered_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          debrief_complete?: boolean | null
          id?: string
          protocol_id?: string
          q1_answered_at?: string | null
          q1_rating?: number | null
          q2_answered_at?: string | null
          q2_changes?: string | null
          q3_adjustments?: string | null
          q3_answered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pip_wellness_notes: {
        Row: {
          context: string | null
          created_at: string | null
          escalated_to: string | null
          id: string
          note_type: string
          protocol_day: number | null
          protocol_id: string | null
          resolved: boolean | null
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          escalated_to?: string | null
          id?: string
          note_type: string
          protocol_day?: number | null
          protocol_id?: string | null
          resolved?: boolean | null
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          escalated_to?: string | null
          id?: string
          note_type?: string
          protocol_day?: number | null
          protocol_id?: string | null
          resolved?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          biomarker_availability: string | null
          bp_diastolic: number | null
          bp_systolic: number | null
          country: string | null
          created_at: string
          current_compounds: string | null
          current_medications: string | null
          dna_advanced_unlocked: boolean | null
          dna_assessment_unlocked: boolean | null
          dna_standard_unlocked: boolean | null
          experience_level: string | null
          first_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          last_name: string | null
          notify_am_time: string
          notify_email: boolean
          notify_pm_time: string
          notify_whatsapp: boolean
          pip_frequency: string | null
          pip_last_contacted_at: string | null
          pip_onboarding_done: boolean | null
          pip_paused_until: string | null
          pip_weekly_message_count: number | null
          primary_health_goal: string | null
          research_goal: string | null
          risk_tolerance: string | null
          safety_age: number | null
          safety_conditions: string[] | null
          safety_country: string | null
          safety_height_cm: number | null
          safety_medications: string[] | null
          safety_onboarding_complete: boolean | null
          safety_onboarding_completed_at: string | null
          safety_sex: string | null
          safety_weight_kg: number | null
          subscription_end: string | null
          subscription_start: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
          username: string | null
          weight_kg: number | null
          whatsapp_number: string | null
          whatsapp_verified: boolean | null
          whatsapp_verify_code: string | null
          whatsapp_verify_expires_at: string | null
        }
        Insert: {
          age?: number | null
          biomarker_availability?: string | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          country?: string | null
          created_at?: string
          current_compounds?: string | null
          current_medications?: string | null
          dna_advanced_unlocked?: boolean | null
          dna_assessment_unlocked?: boolean | null
          dna_standard_unlocked?: boolean | null
          experience_level?: string | null
          first_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          notify_am_time?: string
          notify_email?: boolean
          notify_pm_time?: string
          notify_whatsapp?: boolean
          pip_frequency?: string | null
          pip_last_contacted_at?: string | null
          pip_onboarding_done?: boolean | null
          pip_paused_until?: string | null
          pip_weekly_message_count?: number | null
          primary_health_goal?: string | null
          research_goal?: string | null
          risk_tolerance?: string | null
          safety_age?: number | null
          safety_conditions?: string[] | null
          safety_country?: string | null
          safety_height_cm?: number | null
          safety_medications?: string[] | null
          safety_onboarding_complete?: boolean | null
          safety_onboarding_completed_at?: string | null
          safety_sex?: string | null
          safety_weight_kg?: number | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          weight_kg?: number | null
          whatsapp_number?: string | null
          whatsapp_verified?: boolean | null
          whatsapp_verify_code?: string | null
          whatsapp_verify_expires_at?: string | null
        }
        Update: {
          age?: number | null
          biomarker_availability?: string | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          country?: string | null
          created_at?: string
          current_compounds?: string | null
          current_medications?: string | null
          dna_advanced_unlocked?: boolean | null
          dna_assessment_unlocked?: boolean | null
          dna_standard_unlocked?: boolean | null
          experience_level?: string | null
          first_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          notify_am_time?: string
          notify_email?: boolean
          notify_pm_time?: string
          notify_whatsapp?: boolean
          pip_frequency?: string | null
          pip_last_contacted_at?: string | null
          pip_onboarding_done?: boolean | null
          pip_paused_until?: string | null
          pip_weekly_message_count?: number | null
          primary_health_goal?: string | null
          research_goal?: string | null
          risk_tolerance?: string | null
          safety_age?: number | null
          safety_conditions?: string[] | null
          safety_country?: string | null
          safety_height_cm?: number | null
          safety_medications?: string[] | null
          safety_onboarding_complete?: boolean | null
          safety_onboarding_completed_at?: string | null
          safety_sex?: string | null
          safety_weight_kg?: number | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          weight_kg?: number | null
          whatsapp_number?: string | null
          whatsapp_verified?: boolean | null
          whatsapp_verify_code?: string | null
          whatsapp_verify_expires_at?: string | null
        }
        Relationships: []
      }
      protocol_change_log: {
        Row: {
          change_detail: Json
          change_type: string
          created_at: string
          day_number: number | null
          id: string
          protocol_id: string
          user_id: string
        }
        Insert: {
          change_detail?: Json
          change_type: string
          created_at?: string
          day_number?: number | null
          id?: string
          protocol_id: string
          user_id: string
        }
        Update: {
          change_detail?: Json
          change_type?: string
          created_at?: string
          day_number?: number | null
          id?: string
          protocol_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocol_change_log_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      protocol_outcomes: {
        Row: {
          baseline_tested_at: string | null
          baseline_value: number | null
          biomarker_name: string
          clinical_significance: string | null
          created_at: string | null
          delta_absolute: number | null
          delta_percent: number | null
          follow_up_tested_at: string | null
          follow_up_value: number | null
          id: string
          outcome_direction: string | null
          protocol_ids: string[] | null
          user_id: string
        }
        Insert: {
          baseline_tested_at?: string | null
          baseline_value?: number | null
          biomarker_name: string
          clinical_significance?: string | null
          created_at?: string | null
          delta_absolute?: number | null
          delta_percent?: number | null
          follow_up_tested_at?: string | null
          follow_up_value?: number | null
          id?: string
          outcome_direction?: string | null
          protocol_ids?: string[] | null
          user_id: string
        }
        Update: {
          baseline_tested_at?: string | null
          baseline_value?: number | null
          biomarker_name?: string
          clinical_significance?: string | null
          created_at?: string | null
          delta_absolute?: number | null
          delta_percent?: number | null
          follow_up_tested_at?: string | null
          follow_up_value?: number | null
          id?: string
          outcome_direction?: string | null
          protocol_ids?: string[] | null
          user_id?: string
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
      protocol_scorecards: {
        Row: {
          adherence_percentage: number | null
          biomarker_improvements: Json | null
          changes_made: Json | null
          created_at: string
          day_number: number
          id: string
          milestone: string
          protocol_id: string
          protocol_snapshot: Json | null
          streak_best: number | null
          summary_text: string | null
          user_id: string
          wearable_improvements: Json | null
        }
        Insert: {
          adherence_percentage?: number | null
          biomarker_improvements?: Json | null
          changes_made?: Json | null
          created_at?: string
          day_number: number
          id?: string
          milestone: string
          protocol_id: string
          protocol_snapshot?: Json | null
          streak_best?: number | null
          summary_text?: string | null
          user_id: string
          wearable_improvements?: Json | null
        }
        Update: {
          adherence_percentage?: number | null
          biomarker_improvements?: Json | null
          changes_made?: Json | null
          created_at?: string
          day_number?: number
          id?: string
          milestone?: string
          protocol_id?: string
          protocol_snapshot?: Json | null
          streak_best?: number | null
          summary_text?: string | null
          user_id?: string
          wearable_improvements?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "protocol_scorecards_protocol_id_fkey"
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
          notes: string | null
          start_date: string
          status: string
          supplements: Json | null
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
          notes?: string | null
          start_date?: string
          status?: string
          supplements?: Json | null
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
          notes?: string | null
          start_date?: string
          status?: string
          supplements?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          benefit_granted: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string
          referral_code: string
          referred_name: string | null
          referred_user_id: string | null
          referrer_user_id: string
          status: string | null
        }
        Insert: {
          benefit_granted?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          referral_code: string
          referred_name?: string | null
          referred_user_id?: string | null
          referrer_user_id: string
          status?: string | null
        }
        Update: {
          benefit_granted?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          referral_code?: string
          referred_name?: string | null
          referred_user_id?: string | null
          referrer_user_id?: string
          status?: string | null
        }
        Relationships: []
      }
      research_queue: {
        Row: {
          abstract: string | null
          ai_summary: string | null
          authors: string[] | null
          biomarker_names: string[] | null
          compound_names: string[] | null
          created_at: string | null
          dose_note: string | null
          evidence_level: string | null
          evidence_score: number | null
          gene_names: string[] | null
          id: string
          knowledge_edge_id: string | null
          published_date: string | null
          pubmed_id: string | null
          relationship_type: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_url: string | null
          status: string | null
          strength: string | null
          title: string
          updated_at: string | null
          written_to_graph: boolean | null
        }
        Insert: {
          abstract?: string | null
          ai_summary?: string | null
          authors?: string[] | null
          biomarker_names?: string[] | null
          compound_names?: string[] | null
          created_at?: string | null
          dose_note?: string | null
          evidence_level?: string | null
          evidence_score?: number | null
          gene_names?: string[] | null
          id?: string
          knowledge_edge_id?: string | null
          published_date?: string | null
          pubmed_id?: string | null
          relationship_type?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_url?: string | null
          status?: string | null
          strength?: string | null
          title: string
          updated_at?: string | null
          written_to_graph?: boolean | null
        }
        Update: {
          abstract?: string | null
          ai_summary?: string | null
          authors?: string[] | null
          biomarker_names?: string[] | null
          compound_names?: string[] | null
          created_at?: string | null
          dose_note?: string | null
          evidence_level?: string | null
          evidence_score?: number | null
          gene_names?: string[] | null
          id?: string
          knowledge_edge_id?: string | null
          published_date?: string | null
          pubmed_id?: string | null
          relationship_type?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_url?: string | null
          status?: string | null
          strength?: string | null
          title?: string
          updated_at?: string | null
          written_to_graph?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "research_queue_knowledge_edge_id_fkey"
            columns: ["knowledge_edge_id"]
            isOneToOne: false
            referencedRelation: "knowledge_edges"
            referencedColumns: ["id"]
          },
        ]
      }
      retest_recommendations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          dna_report_id: string | null
          due_date: string | null
          id: string
          medichecks_url: string | null
          rationale: string | null
          recommended_at: string
          recommended_panel: string
          recommended_tests: string[]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          dna_report_id?: string | null
          due_date?: string | null
          id?: string
          medichecks_url?: string | null
          rationale?: string | null
          recommended_at: string
          recommended_panel: string
          recommended_tests: string[]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          dna_report_id?: string | null
          due_date?: string | null
          id?: string
          medichecks_url?: string | null
          rationale?: string | null
          recommended_at?: string
          recommended_panel?: string
          recommended_tests?: string[]
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
      supplement_logs: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          dose_amount: number | null
          dose_unit: string | null
          id: string
          item: string
          protocol_id: string | null
          source: string | null
          supplement_form: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date?: string
          dose_amount?: number | null
          dose_unit?: string | null
          id?: string
          item: string
          protocol_id?: string | null
          source?: string | null
          supplement_form?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          dose_amount?: number | null
          dose_unit?: string | null
          id?: string
          item?: string
          protocol_id?: string | null
          source?: string | null
          supplement_form?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplement_logs_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      supplements_enriched: {
        Row: {
          aliases: string[] | null
          antagonistic_supplements: string[] | null
          best_form: string | null
          bioavailability_notes: string | null
          biomarker_targets: Json | null
          category: string | null
          contraindications: string[] | null
          created_at: string
          cycling_notes: string | null
          description: string | null
          dna_profile_signals: Json | null
          dose_range: string | null
          drug_interactions: string[] | null
          enriched_at: string | null
          enrichment_model: string | null
          enrichment_status: string
          evidence_grade: string | null
          evidence_summary: string | null
          fitness_relevance: string | null
          food_sources: string[] | null
          forms_available: string[] | null
          gene_interactions: Json | null
          health_optimisation_relevance: string | null
          id: string
          is_active: boolean
          key_research_refs: Json | null
          longevity_relevance: string | null
          mechanism_of_action: string | null
          name: string
          peptyl_id: string
          primary_effects: string[] | null
          side_effects_common: string[] | null
          side_effects_rare: string[] | null
          synergistic_supplements: string[] | null
          timing: string | null
          updated_at: string
          upper_safe_limit: string | null
        }
        Insert: {
          aliases?: string[] | null
          antagonistic_supplements?: string[] | null
          best_form?: string | null
          bioavailability_notes?: string | null
          biomarker_targets?: Json | null
          category?: string | null
          contraindications?: string[] | null
          created_at?: string
          cycling_notes?: string | null
          description?: string | null
          dna_profile_signals?: Json | null
          dose_range?: string | null
          drug_interactions?: string[] | null
          enriched_at?: string | null
          enrichment_model?: string | null
          enrichment_status?: string
          evidence_grade?: string | null
          evidence_summary?: string | null
          fitness_relevance?: string | null
          food_sources?: string[] | null
          forms_available?: string[] | null
          gene_interactions?: Json | null
          health_optimisation_relevance?: string | null
          id?: string
          is_active?: boolean
          key_research_refs?: Json | null
          longevity_relevance?: string | null
          mechanism_of_action?: string | null
          name: string
          peptyl_id: string
          primary_effects?: string[] | null
          side_effects_common?: string[] | null
          side_effects_rare?: string[] | null
          synergistic_supplements?: string[] | null
          timing?: string | null
          updated_at?: string
          upper_safe_limit?: string | null
        }
        Update: {
          aliases?: string[] | null
          antagonistic_supplements?: string[] | null
          best_form?: string | null
          bioavailability_notes?: string | null
          biomarker_targets?: Json | null
          category?: string | null
          contraindications?: string[] | null
          created_at?: string
          cycling_notes?: string | null
          description?: string | null
          dna_profile_signals?: Json | null
          dose_range?: string | null
          drug_interactions?: string[] | null
          enriched_at?: string | null
          enrichment_model?: string | null
          enrichment_status?: string
          evidence_grade?: string | null
          evidence_summary?: string | null
          fitness_relevance?: string | null
          food_sources?: string[] | null
          forms_available?: string[] | null
          gene_interactions?: Json | null
          health_optimisation_relevance?: string | null
          id?: string
          is_active?: boolean
          key_research_refs?: Json | null
          longevity_relevance?: string | null
          mechanism_of_action?: string | null
          name?: string
          peptyl_id?: string
          primary_effects?: string[] | null
          side_effects_common?: string[] | null
          side_effects_rare?: string[] | null
          synergistic_supplements?: string[] | null
          timing?: string | null
          updated_at?: string
          upper_safe_limit?: string | null
        }
        Relationships: []
      }
      supplier_prices: {
        Row: {
          category: string
          created_at: string
          currency: string
          id: string
          in_stock: boolean
          price: number
          product_name: string
          scraped_at: string
          supplier_name: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          currency?: string
          id?: string
          in_stock?: boolean
          price: number
          product_name: string
          scraped_at?: string
          supplier_name: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          id?: string
          in_stock?: boolean
          price?: number
          product_name?: string
          scraped_at?: string
          supplier_name?: string
          url?: string
        }
        Relationships: []
      }
      supplier_scrape_log: {
        Row: {
          completed_at: string | null
          errors: Json | null
          id: string
          products_matched: number | null
          started_at: string
          status: string
          suppliers_scraped: number | null
        }
        Insert: {
          completed_at?: string | null
          errors?: Json | null
          id?: string
          products_matched?: number | null
          started_at?: string
          status?: string
          suppliers_scraped?: number | null
        }
        Update: {
          completed_at?: string | null
          errors?: Json | null
          id?: string
          products_matched?: number | null
          started_at?: string
          status?: string
          suppliers_scraped?: number | null
        }
        Relationships: []
      }
      support_products: {
        Row: {
          affiliate_url: string
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          rating: number | null
          review_count: string | null
          sort_order: number | null
          tags: string[] | null
        }
        Insert: {
          affiliate_url: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rating?: number | null
          review_count?: string | null
          sort_order?: number | null
          tags?: string[] | null
        }
        Update: {
          affiliate_url?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rating?: number | null
          review_count?: string | null
          sort_order?: number | null
          tags?: string[] | null
        }
        Relationships: []
      }
      trajectory_scores: {
        Row: {
          adherence_component: number | null
          biomarker_component: number | null
          created_at: string | null
          data_completeness: number | null
          direction: string
          id: string
          score: number
          user_id: string
          wearable_component: number | null
          week_start: string
          wellbeing_component: number | null
        }
        Insert: {
          adherence_component?: number | null
          biomarker_component?: number | null
          created_at?: string | null
          data_completeness?: number | null
          direction: string
          id?: string
          score: number
          user_id: string
          wearable_component?: number | null
          week_start: string
          wellbeing_component?: number | null
        }
        Update: {
          adherence_component?: number | null
          biomarker_component?: number | null
          created_at?: string | null
          data_completeness?: number | null
          direction?: string
          id?: string
          score?: number
          user_id?: string
          wearable_component?: number | null
          week_start?: string
          wellbeing_component?: number | null
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          created_at: string
          device_type: string | null
          display_mode: string | null
          id: string
          is_pwa: boolean
          page_path: string | null
          referrer: string | null
          screen_width: number | null
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          display_mode?: string | null
          id?: string
          is_pwa?: boolean
          page_path?: string | null
          referrer?: string | null
          screen_width?: number | null
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_type?: string | null
          display_mode?: string | null
          id?: string
          is_pwa?: boolean
          page_path?: string | null
          referrer?: string | null
          screen_width?: number | null
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_biomarker_results: {
        Row: {
          biomarker_name: string
          created_at: string | null
          entity_id: string | null
          id: string
          is_in_range: boolean | null
          loinc_code: string | null
          notes: string | null
          optimal_high: number | null
          optimal_low: number | null
          provider_test_id: string | null
          reference_high: number | null
          reference_low: number | null
          source: string | null
          tested_at: string
          unit: string | null
          user_id: string
          value: number
        }
        Insert: {
          biomarker_name: string
          created_at?: string | null
          entity_id?: string | null
          id?: string
          is_in_range?: boolean | null
          loinc_code?: string | null
          notes?: string | null
          optimal_high?: number | null
          optimal_low?: number | null
          provider_test_id?: string | null
          reference_high?: number | null
          reference_low?: number | null
          source?: string | null
          tested_at: string
          unit?: string | null
          user_id: string
          value: number
        }
        Update: {
          biomarker_name?: string
          created_at?: string | null
          entity_id?: string | null
          id?: string
          is_in_range?: boolean | null
          loinc_code?: string | null
          notes?: string | null
          optimal_high?: number | null
          optimal_low?: number | null
          provider_test_id?: string | null
          reference_high?: number | null
          reference_low?: number | null
          source?: string | null
          tested_at?: string
          unit?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_biomarker_results_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_protocols: {
        Row: {
          compound_entity_id: string | null
          compound_name: string
          created_at: string | null
          dna_report_id: string | null
          dose_amount: number | null
          dose_frequency: string | null
          dose_unit: string | null
          id: string
          is_active: boolean | null
          protocol_end_date: string | null
          protocol_start_date: string
          user_id: string
        }
        Insert: {
          compound_entity_id?: string | null
          compound_name: string
          created_at?: string | null
          dna_report_id?: string | null
          dose_amount?: number | null
          dose_frequency?: string | null
          dose_unit?: string | null
          id?: string
          is_active?: boolean | null
          protocol_end_date?: string | null
          protocol_start_date: string
          user_id: string
        }
        Update: {
          compound_entity_id?: string | null
          compound_name?: string
          created_at?: string | null
          dna_report_id?: string | null
          dose_amount?: number | null
          dose_frequency?: string | null
          dose_unit?: string | null
          id?: string
          is_active?: boolean | null
          protocol_end_date?: string | null
          protocol_start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_protocols_compound_entity_id_fkey"
            columns: ["compound_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
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
      video_views: {
        Row: {
          created_at: string
          id: string
          user_id: string | null
          video_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id?: string | null
          video_name: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string | null
          video_name?: string
        }
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          created_at: string | null
          direction: string
          id: string
          intent_classified: string | null
          message: string
          message_type: string | null
          trigger_type: string | null
          user_id: string
          wa_message_id: string | null
        }
        Insert: {
          created_at?: string | null
          direction: string
          id?: string
          intent_classified?: string | null
          message: string
          message_type?: string | null
          trigger_type?: string | null
          user_id: string
          wa_message_id?: string | null
        }
        Update: {
          created_at?: string | null
          direction?: string
          id?: string
          intent_classified?: string | null
          message?: string
          message_type?: string | null
          trigger_type?: string | null
          user_id?: string
          wa_message_id?: string | null
        }
        Relationships: []
      }
      whoop_connections: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          last_sync_at: string | null
          refresh_token: string | null
          updated_at: string
          user_id: string
          whoop_user_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          last_sync_at?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id: string
          whoop_user_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          last_sync_at?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
          whoop_user_id?: string | null
        }
        Relationships: []
      }
      whoop_daily_metrics: {
        Row: {
          created_at: string
          date: string
          hrv: number | null
          id: string
          raw_json: Json | null
          recovery_score: number | null
          respiratory_rate: number | null
          resting_heart_rate: number | null
          sleep_duration_seconds: number | null
          sleep_efficiency: number | null
          sleep_performance: number | null
          sleep_score: number | null
          strain: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          hrv?: number | null
          id?: string
          raw_json?: Json | null
          recovery_score?: number | null
          respiratory_rate?: number | null
          resting_heart_rate?: number | null
          sleep_duration_seconds?: number | null
          sleep_efficiency?: number | null
          sleep_performance?: number | null
          sleep_score?: number | null
          strain?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          hrv?: number | null
          id?: string
          raw_json?: Json | null
          recovery_score?: number | null
          respiratory_rate?: number | null
          resting_heart_rate?: number | null
          sleep_duration_seconds?: number | null
          sleep_efficiency?: number | null
          sleep_performance?: number | null
          sleep_score?: number | null
          strain?: number | null
          user_id?: string
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
      community_experiences: {
        Row: {
          created_at: string | null
          evidence_quality: string | null
          journal_id: string | null
          peptide_name: string | null
          summary: string | null
        }
        Relationships: []
      }
      experience_vote_counts: {
        Row: {
          downvotes: number | null
          experience_key: string | null
          peptide_name: string | null
          upvotes: number | null
        }
        Relationships: []
      }
      fitbit_connections_safe: {
        Row: {
          created_at: string | null
          fitbit_user_id: string | null
          id: string | null
          last_sync_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fitbit_user_id?: string | null
          id?: string | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fitbit_user_id?: string | null
          id?: string | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      outcome_aggregates: {
        Row: {
          aggregation_genotype_key: string | null
          avg_adherence: number | null
          avg_homocysteine_change: number | null
          avg_vitd_change: number | null
          avg_weeks: number | null
          responder_count: number | null
          sample_size: number | null
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
      whoop_connections_safe: {
        Row: {
          created_at: string | null
          id: string | null
          last_sync_at: string | null
          updated_at: string | null
          user_id: string | null
          whoop_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          whoop_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          whoop_user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
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
