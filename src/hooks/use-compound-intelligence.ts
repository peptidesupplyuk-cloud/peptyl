import { useQuery } from '@tanstack/react-query';
import { knowledgeDB, normaliseCompoundId, type CompoundKnowledge, type Pharmacokinetics, type DosingProtocol, type InteractionRule, type ClaimEntry } from '@/integrations/knowledge/client';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/** Try multiple compound_id variants to find a match */
async function findCompound(compoundId: string): Promise<CompoundKnowledge | null> {
  // Try exact match first
  const { data } = await knowledgeDB
    .from('compound_knowledge')
    .select('*')
    .eq('compound_id', compoundId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();
  if (data) return data as CompoundKnowledge;

  // Try with hyphens instead of underscores
  const hyphenated = compoundId.replace(/_/g, '-');
  if (hyphenated !== compoundId) {
    const { data: d2 } = await knowledgeDB
      .from('compound_knowledge')
      .select('*')
      .eq('compound_id', hyphenated)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    if (d2) return d2 as CompoundKnowledge;
  }

  // Try ilike on name
  const { data: d3 } = await knowledgeDB
    .from('compound_knowledge')
    .select('*')
    .ilike('name', compoundId.replace(/[-_]/g, '%'))
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();
  return (d3 as CompoundKnowledge) || null;
}

export function useCompoundKnowledge(compoundId: string) {
  return useQuery({
    queryKey: ['compound-knowledge', compoundId],
    queryFn: () => findCompound(compoundId),
    enabled: !!compoundId,
    staleTime: 1000 * 60 * 30, // 30 min cache
  });
}

export function usePharmacokinetics(compoundId: string) {
  return useQuery({
    queryKey: ['compound-pk', compoundId],
    queryFn: async () => {
      const { data } = await knowledgeDB
        .from('pharmacokinetics')
        .select('*')
        .eq('compound_id', compoundId)
        .limit(1)
        .maybeSingle();
      return data as Pharmacokinetics | null;
    },
    enabled: !!compoundId,
    staleTime: 1000 * 60 * 30,
  });
}

export function useDosingProtocols(compoundId: string) {
  return useQuery({
    queryKey: ['compound-dosing', compoundId],
    queryFn: async () => {
      const { data } = await knowledgeDB
        .from('dosing_protocols')
        .select('*')
        .or(`compound_id.eq.${compoundId},supplement_id.eq.${compoundId}`)
        .limit(10);
      return (data ?? []) as DosingProtocol[];
    },
    enabled: !!compoundId,
    staleTime: 1000 * 60 * 30,
  });
}

export function useInteractionRules(compoundId: string) {
  return useQuery({
    queryKey: ['compound-interactions', compoundId],
    queryFn: async () => {
      const { data } = await knowledgeDB
        .from('interaction_timing_rules')
        .select('*')
        .or(`compound1.eq.${compoundId},compound2.eq.${compoundId}`)
        .limit(50);
      return (data ?? []) as InteractionRule[];
    },
    enabled: !!compoundId,
    staleTime: 1000 * 60 * 30,
  });
}

export function useClaimRegistry(compoundId: string) {
  return useQuery({
    queryKey: ['compound-claims', compoundId],
    queryFn: async () => {
      const { data } = await knowledgeDB
        .from('claim_registry')
        .select('*')
        .eq('compound', compoundId)
        .limit(20);
      return (data ?? []) as ClaimEntry[];
    },
    enabled: !!compoundId,
    staleTime: 1000 * 60 * 30,
  });
}

export function useUserDnaReport() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-dna-report', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('dna_reports')
        .select('id, report_json, overall_score, assessment_tier')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserBloodwork() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-bloodwork-latest', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data: panel } = await supabase
        .from('bloodwork_panels')
        .select('id, test_date')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!panel) return null;
      const { data: markers } = await supabase
        .from('bloodwork_markers')
        .select('marker_name, value, unit, marker_status')
        .eq('panel_id', panel.id);
      return { panel, markers: markers ?? [] };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserActiveProtocol() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-active-protocols-compound', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('protocols')
        .select('*, protocol_peptides(*)')
        .eq('user_id', user.id)
        .eq('status', 'active');
      return data ?? [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });
}

/** Calculate DNA match score: how many gene signals match the user's risk genotypes */
export function calculateDnaMatch(
  compound: CompoundKnowledge | null,
  dnaReport: any
): { score: number; matchedGenes: { gene: string; rsid: string; genotype: string; explanation: string; confidence: string }[]; totalSignals: number } {
  if (!compound?.gene_interactions?.length || !dnaReport?.report_json) {
    return { score: 0, matchedGenes: [], totalSignals: compound?.gene_interactions?.length ?? 0 };
  }

  const report = dnaReport.report_json as any;
  const geneResults = report?.gene_results ?? report?.genes ?? [];
  if (!Array.isArray(geneResults) || geneResults.length === 0) {
    return { score: 0, matchedGenes: [], totalSignals: compound.gene_interactions.length };
  }

  // Build lookup: gene name -> { genotype, variant }
  const userGenes = new Map<string, { genotype: string; variant: string }>();
  for (const g of geneResults) {
    if (g.gene) {
      userGenes.set(g.gene.toUpperCase(), { genotype: g.variant || g.genotype || '', variant: g.variant || '' });
    }
  }

  const matchedGenes: { gene: string; rsid: string; genotype: string; explanation: string; confidence: string }[] = [];
  for (const gi of compound.gene_interactions) {
    const userGene = userGenes.get(gi.gene.toUpperCase());
    if (userGene) {
      // Check if the user has one of the risk genotypes
      const hasRisk = gi.riskGenotypes?.some(rg =>
        userGene.genotype.toUpperCase().includes(rg.toUpperCase()) ||
        userGene.variant.toUpperCase().includes(rg.toUpperCase())
      );
      if (hasRisk) {
        matchedGenes.push({
          gene: gi.gene,
          rsid: gi.rsid,
          genotype: userGene.genotype || userGene.variant,
          explanation: `Your ${gi.gene} ${userGene.genotype || userGene.variant} — ${gi.reason}. ${gi.adjustment}`,
          confidence: gi.confidence || 'inferred',
        });
      }
    }
  }

  const score = compound.gene_interactions.length > 0
    ? Math.round((matchedGenes.length / compound.gene_interactions.length) * 100)
    : 0;

  return { score, matchedGenes, totalSignals: compound.gene_interactions.length };
}
