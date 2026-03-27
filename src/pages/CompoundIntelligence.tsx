import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Dna, FlaskConical, Shield, Clock, BarChart3, BookOpen, Users, Pill, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PremiumCard from '@/components/ui/PremiumCard';
import DnaMatchRing from '@/components/compound/DnaMatchRing';
import {
  useCompoundKnowledge,
  usePharmacokinetics,
  useDosingProtocols,
  useInteractionRules,
  useClaimRegistry,
  useUserDnaReport,
  useUserBloodwork,
  useUserActiveProtocol,
  calculateDnaMatch,
} from '@/hooks/use-compound-intelligence';
import { normaliseCompoundId } from '@/integrations/knowledge/client';
import SEO from '@/components/SEO';

const GRADE_STYLES: Record<string, string> = {
  A: 'bg-primary text-primary-foreground',
  B: 'border border-primary text-primary bg-transparent',
  C: 'border border-amber-500 text-amber-500 bg-transparent',
  D: 'border border-muted-foreground text-muted-foreground bg-transparent',
};

const CompoundIntelligence = () => {
  const { compoundId = '' } = useParams();
  const navigate = useNavigate();

  const { data: compound, isLoading } = useCompoundKnowledge(compoundId);
  const { data: pk } = usePharmacokinetics(compound?.compound_id ?? compoundId);
  const { data: dosingProtocols = [] } = useDosingProtocols(compound?.compound_id ?? compoundId);
  const { data: interactions = [] } = useInteractionRules(compound?.compound_id ?? compoundId);
  const { data: claims = [] } = useClaimRegistry(compound?.compound_id ?? compoundId);
  const { data: dnaReport } = useUserDnaReport();
  const { data: bloodwork } = useUserBloodwork();
  const { data: activeProtocols = [] } = useUserActiveProtocol();

  const dnaMatch = calculateDnaMatch(compound ?? null, dnaReport);

  // Find this compound in the user's active protocols
  const userProtocolCompounds = activeProtocols.flatMap((p: any) => [
    ...(p.protocol_peptides ?? []).map((pp: any) => pp.peptide_name),
    ...(p.supplements ?? []).map((s: any) => s.name),
  ]).map((n: string) => n.toLowerCase());

  const isInUserProtocol = compound ? userProtocolCompounds.includes(compound.name.toLowerCase()) : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!compound) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 text-center space-y-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-xl font-heading font-bold text-foreground">Compound Not Found</h1>
          <p className="text-muted-foreground text-sm">
            We don't have intelligence data for "{compoundId}" yet. Our knowledge base is growing — check back soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${compound.name} — Compound Intelligence | Peptyl`} description={compound.description?.slice(0, 155) || `Deep dive into ${compound.name}`} path={`/compound/${compoundId}`} />

      {/* Sticky back button */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8 px-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <nav className="text-xs text-muted-foreground truncate">
            <span className="cursor-pointer hover:text-foreground" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span className="mx-1.5">›</span>
            <span className="text-foreground font-medium">{compound.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-32 space-y-4">

        {/* Card 1: Hero Overview */}
        <PremiumCard glow delay={0}>
          <div className="p-5 md:p-6" style={{ background: 'var(--gradient-hero)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 min-w-0">
                <h1 className="font-heading text-[28px] font-bold text-white leading-tight">{compound.name}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  {compound.category && (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-white/80 font-medium">
                      {compound.category}
                    </span>
                  )}
                  {compound.evidence_grade && (
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${GRADE_STYLES[compound.evidence_grade] || GRADE_STYLES.D}`}>
                      Grade {compound.evidence_grade}
                    </span>
                  )}
                  {compound.compound_type && (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 font-medium capitalize">
                      {compound.compound_type}
                    </span>
                  )}
                </div>
                {compound.mechanism_of_action && (
                  <p className="text-[15px] text-white/70 leading-relaxed line-clamp-3">
                    {compound.mechanism_of_action.split('.')[0]}.
                  </p>
                )}
              </div>
              {dnaReport && dnaMatch.totalSignals > 0 && (
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <DnaMatchRing score={dnaMatch.score} size={56} />
                  <span className="text-[9px] text-white/50 uppercase tracking-wider">DNA Match</span>
                </div>
              )}
            </div>
          </div>
        </PremiumCard>

        {/* Card 2: Your Genetic Match */}
        {dnaReport ? (
          dnaMatch.matchedGenes.length > 0 ? (
            <PremiumCard glow delay={0.08}>
              <div className="p-5 md:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Dna className="h-5 w-5 text-primary" />
                  <h2 className="font-heading text-lg font-semibold text-foreground">How Your DNA Responds</h2>
                </div>
                <div className="space-y-3">
                  {dnaMatch.matchedGenes.map((g, i) => (
                    <div key={i} className="bg-muted/30 rounded-xl p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-semibold text-sm text-foreground">{g.gene}</span>
                          <span className="text-[10px] text-muted-foreground">{g.rsid}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{g.genotype}</span>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${g.confidence === 'direct' ? 'bg-primary/10 text-primary' : 'border border-amber-500/30 text-amber-500'}`}>
                          {g.confidence === 'direct' ? 'Direct evidence' : 'Inferred'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{g.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </PremiumCard>
          ) : (
            <PremiumCard delay={0.08}>
              <div className="p-5 md:p-6 space-y-2">
                <div className="flex items-center gap-2">
                  <Dna className="h-5 w-5 text-primary" />
                  <h2 className="font-heading text-lg font-semibold text-foreground">Your Genetic Match</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  No specific genetic interaction detected for {compound.name}. Standard dosing recommended.
                </p>
              </div>
            </PremiumCard>
          )
        ) : (
          <PremiumCard delay={0.08}>
            <div className="p-5 md:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Dna className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-heading text-lg font-semibold text-foreground">Personalise With Your DNA</h2>
              </div>
              <p className="text-sm text-muted-foreground">Upload your DNA to see how your genetics interact with {compound.name}.</p>
              <Button size="sm" variant="outline" onClick={() => navigate('/dna')}>
                <Dna className="h-3.5 w-3.5 mr-1.5" /> Upload DNA
              </Button>
            </div>
          </PremiumCard>
        )}

        {/* Card 3: Pharmacokinetics */}
        {pk ? (
          <PremiumCard delay={0.16}>
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold text-foreground">How It Works In Your Body</h2>
              </div>
              {/* Timeline bar */}
              {(pk.tmax_hours || pk.half_life_hours || pk.duration_hours) && (
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute h-full rounded-full"
                    style={{
                      background: 'var(--gradient-teal)',
                      width: `${Math.min(100, ((pk.tmax_hours ?? 1) / (pk.duration_hours ?? 24)) * 100)}%`,
                    }}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {pk.bioavailability_percent != null && (
                  <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Bioavailability</span>
                    <p className="font-heading text-xl font-bold text-primary">{pk.bioavailability_percent}%</p>
                  </div>
                )}
                {pk.half_life_hours != null && (
                  <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Half-life</span>
                    <p className="font-heading text-xl font-bold text-primary">{pk.half_life_hours}h</p>
                  </div>
                )}
                {pk.steady_state_days != null && (
                  <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Steady State</span>
                    <p className="font-heading text-xl font-bold text-foreground">{pk.steady_state_days} days</p>
                  </div>
                )}
                {pk.absorption_notes && (
                  <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Absorption</span>
                    <p className="text-xs text-foreground">{pk.absorption_notes}</p>
                  </div>
                )}
              </div>
              {pk.cycling_required && pk.cycling_protocol && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-amber-500 mb-1">⚡ Cycling Required</p>
                  <p className="text-xs text-muted-foreground">{pk.cycling_protocol}</p>
                </div>
              )}
            </div>
          </PremiumCard>
        ) : (
          /* Fallback: show what we know from compound_knowledge */
          compound.bioavailability_notes && (
            <PremiumCard delay={0.16}>
              <div className="p-5 md:p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <h2 className="font-heading text-lg font-semibold text-foreground">How It Works In Your Body</h2>
                </div>
                <p className="text-sm text-muted-foreground">{compound.bioavailability_notes}</p>
                {compound.forms_available && compound.forms_available.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {compound.forms_available.map(f => (
                      <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{f}</span>
                    ))}
                  </div>
                )}
                {compound.best_form && (
                  <p className="text-xs text-primary">Best form: {compound.best_form}</p>
                )}
              </div>
            </PremiumCard>
          )
        )}

        {/* Card 4: Dosing Protocol */}
        {dosingProtocols.length > 0 ? (
          <PremiumCard glow delay={0.24}>
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold text-foreground">Your Personalised Dose</h2>
              </div>
              {dosingProtocols.map((dp, i) => (
                <div key={i} className="space-y-3 bg-muted/20 rounded-xl p-4">
                  <p className="text-sm font-medium text-foreground">{dp.condition}</p>
                  <p className="font-heading text-2xl font-bold text-primary">{dp.base_dose}</p>
                  {dp.timing && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {dp.timing}
                    </div>
                  )}
                  {dp.max_dose && (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                      <p className="text-xs text-destructive">⚠ Do not exceed {dp.max_dose} without supervision</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </PremiumCard>
        ) : null}

        {/* Card 5: Predicted Outcome */}
        {compound.biomarker_targets && (
          <PremiumCard delay={0.32}>
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold text-foreground">What We Predict</h2>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Target</span>
                  <span className="font-heading font-semibold text-foreground">{compound.biomarker_targets.primaryTarget}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Expected Change</span>
                  <span className="font-heading font-bold text-primary text-lg">{compound.biomarker_targets.expectedChange}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Timeline</span>
                  <span className="text-sm text-foreground">{compound.biomarker_targets.timelineWeeks} weeks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confidence</span>
                  <span className="text-sm text-foreground">{Math.round((compound.biomarker_targets.confidence ?? 0) * 100)}%</span>
                </div>
              </div>
              {!bloodwork ? (
                <div className="bg-accent/30 rounded-xl px-4 py-3">
                  <p className="text-xs text-accent-foreground">Add bloodwork to unlock personalised predicted outcomes</p>
                  <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => navigate('/dashboard?tab=biomarkers')}>
                    Add Bloodwork
                  </Button>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground italic">
                  Retest at {compound.biomarker_targets.timelineWeeks} weeks to verify response.
                </p>
              )}
            </div>
          </PremiumCard>
        )}

        {/* Card 6: Safety & Interactions */}
        <PremiumCard delay={0.4}>
          <div className="p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-lg font-semibold text-foreground">Safety Profile</h2>
            </div>

            {interactions.length > 0 ? (
              <div className="space-y-2">
                {interactions.map((ir, i) => (
                  <div key={i} className={`rounded-xl px-4 py-3 ${ir.severity === 'high' ? 'bg-destructive/5 border border-destructive/20' : 'bg-amber-500/5 border border-amber-500/20'}`}>
                    <p className="text-xs font-semibold mb-1" style={{ color: ir.severity === 'high' ? 'hsl(var(--destructive))' : 'hsl(var(--warm))' }}>
                      {ir.interaction_type}
                    </p>
                    <p className="text-xs text-muted-foreground">{ir.description}</p>
                    {ir.timing_gap_hours && (
                      <p className="text-[10px] text-muted-foreground mt-1">Separate by {ir.timing_gap_hours}h</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific interaction warnings on record for {compound.name}.</p>
            )}

            {compound.evidence_grade && (compound.evidence_grade === 'C' || compound.evidence_grade === 'D') && (
              <div className="bg-muted/30 rounded-xl px-4 py-3">
                <p className="text-[11px] text-muted-foreground italic">
                  Current evidence is {compound.evidence_grade === 'C' ? 'preclinical or from small human studies' : 'preclinical only / theoretical mechanism'}. This is a developing research area. Peptyl monitors emerging literature and will update recommendations as evidence evolves.
                </p>
              </div>
            )}
          </div>
        </PremiumCard>

        {/* Card 7: Stack Context */}
        {isInUserProtocol ? (
          <PremiumCard delay={0.48}>
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold text-foreground">In Your Stack</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {compound.name} is currently in your active protocol. View your full stack in the Protocols tab.
              </p>
              <Button size="sm" variant="outline" onClick={() => navigate('/dashboard?tab=protocols')} className="h-8 text-xs">
                View Protocol
              </Button>
            </div>
          </PremiumCard>
        ) : (
          <PremiumCard delay={0.48}>
            <div className="p-5 md:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-heading text-lg font-semibold text-foreground">Add to Your Protocol</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {compound.name} is not in your current protocol. Add it to see how it interacts with your stack.
              </p>
              <Button size="sm" variant="outline" onClick={() => navigate('/dashboard?tab=protocols')} className="h-8 text-xs">
                Create Protocol
              </Button>
            </div>
          </PremiumCard>
        )}

        {/* Card 8: Evidence Base */}
        <PremiumCard delay={0.56}>
          <div className="p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-lg font-semibold text-foreground">Research Evidence</h2>
            </div>

            {compound.evidence_summary && (
              <p className="text-sm text-muted-foreground leading-relaxed">{compound.evidence_summary}</p>
            )}

            {claims.length > 0 ? (
              <div className="space-y-2">
                {claims.map((c, i) => (
                  <div key={i} className="bg-muted/20 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{c.claim}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${GRADE_STYLES[c.evidence_grade] || GRADE_STYLES.D}`}>
                        Grade {c.evidence_grade}
                      </span>
                    </div>
                    {c.pmids && c.pmids.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {c.pmids.slice(0, 3).map(pmid => (
                          <a
                            key={pmid}
                            href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-primary hover:underline flex items-center gap-0.5"
                          >
                            PMID:{pmid} <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              compound.key_research_refs && Array.isArray(compound.key_research_refs) && compound.key_research_refs.length > 0 && (
                <div className="space-y-2">
                  {(compound.key_research_refs as any[]).slice(0, 5).map((ref: any, i: number) => (
                    <div key={i} className="bg-muted/20 rounded-xl p-3">
                      <p className="text-xs text-foreground">{ref.title || ref.summary || JSON.stringify(ref)}</p>
                      {ref.pmid && (
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-primary hover:underline flex items-center gap-0.5 mt-1"
                        >
                          PMID:{ref.pmid} <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {compound.evidence_grade && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${GRADE_STYLES[compound.evidence_grade]}`}>
                  {compound.evidence_grade}
                </span>
                {compound.evidence_grade === 'A' && 'Multiple RCTs, NICE/FDA approved'}
                {compound.evidence_grade === 'B' && 'Single RCT or strong observational'}
                {compound.evidence_grade === 'C' && 'Animal studies + small human case series'}
                {compound.evidence_grade === 'D' && 'Preclinical only / theoretical'}
              </div>
            )}
          </div>
        </PremiumCard>

        {/* Card 9: Primary Effects */}
        {compound.primary_effects && compound.primary_effects.length > 0 && (
          <PremiumCard delay={0.64}>
            <div className="p-5 md:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold text-foreground">Key Effects</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {compound.primary_effects.map((effect, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1.5 rounded-full bg-accent/40 text-accent-foreground font-medium"
                  >
                    {effect}
                  </span>
                ))}
              </div>
              {compound.longevity_relevance && (
                <div className="bg-muted/20 rounded-xl p-3 mt-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Longevity</p>
                  <p className="text-xs text-muted-foreground">{compound.longevity_relevance}</p>
                </div>
              )}
              {compound.fitness_relevance && (
                <div className="bg-muted/20 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Fitness</p>
                  <p className="text-xs text-muted-foreground">{compound.fitness_relevance}</p>
                </div>
              )}
            </div>
          </PremiumCard>
        )}

        {/* Legal disclaimer */}
        <div className="text-[10px] text-muted-foreground text-center py-4 italic">
          ⚠️ Peptyl does not prescribe, diagnose, or recommend medications. This information is educational only. Consult your physician before starting any protocol.
        </div>
      </div>
    </div>
  );
};

export default CompoundIntelligence;
