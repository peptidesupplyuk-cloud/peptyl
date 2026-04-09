import { createClient } from '@supabase/supabase-js';

const KNOWLEDGE_URL = 'https://pmebegdwqizozfmzxpuw.supabase.co';
const KNOWLEDGE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZWJlZ2R3cWl6b3pmbXp4cHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzODQ2MzEsImV4cCI6MjA4OTk2MDYzMX0.B3z3hxwR7RBaPx2Q8S4Bp1mpQyaKifAHry7_z2RjiZI';

export const knowledgeDB = createClient(KNOWLEDGE_URL, KNOWLEDGE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Normalise a compound name to a knowledge DB compound_id for lookup */
export function normaliseCompoundId(name: unknown): string {
  const safeName = typeof name === 'string' ? name : '';

  return safeName
    .toLowerCase()
    .trim()
    .replace(/[()]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '');
}

export interface CompoundKnowledge {
  id: string;
  compound_type: string;
  compound_id: string;
  name: string;
  aliases: string[] | null;
  category: string | null;
  description: string | null;
  mechanism_of_action: string | null;
  primary_effects: string[] | null;
  forms_available: string[] | null;
  best_form: string | null;
  bioavailability_notes: string | null;
  evidence_grade: string | null;
  evidence_summary: string | null;
  key_research_refs: any[] | null;
  dna_profile_signals: DnaSignal[] | null;
  gene_interactions: GeneInteraction[] | null;
  biomarker_targets: BiomarkerTarget | null;
  longevity_relevance: string | null;
  fitness_relevance: string | null;
  health_optimisation_relevance: string | null;
  is_active: boolean;
}

export interface DnaSignal {
  signal_type: string;
  signal_value: string;
  rationale: string;
}

export interface GeneInteraction {
  gene: string;
  rsid: string;
  riskGenotypes: string[];
  adjustment: string;
  reason: string;
  confidence: string;
}

export interface BiomarkerTarget {
  primaryTarget: string;
  expectedChange: string;
  timelineWeeks: number;
  confidence: number;
}

export interface Pharmacokinetics {
  id: string;
  compound_id: string;
  tmax_hours: number | null;
  half_life_hours: number | null;
  duration_hours: number | null;
  bioavailability_percent: number | null;
  absorption_notes: string | null;
  elimination_pathway: string | null;
  steady_state_days: number | null;
  cycling_required: boolean;
  cycling_protocol: string | null;
  titration_required: boolean;
  titration_schedule: string | null;
}

export interface DosingProtocol {
  id: string;
  compound_id: string;
  supplement_id: string | null;
  condition: string;
  base_dose: string;
  modifiers: any[];
  cofactors: any[];
  timing: string | null;
  max_dose: string | null;
}

export interface InteractionRule {
  id: string;
  compound1: string;
  compound2: string;
  interaction_type: string;
  timing_gap_hours: number | null;
  description: string;
  severity: string;
}

export interface ClaimEntry {
  id: string;
  compound: string;
  claim: string;
  evidence_grade: string;
  study_count: number | null;
  pmids: string[] | null;
  confidence: string;
  recency: string | null;
}
