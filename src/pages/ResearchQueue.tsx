import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle, CheckCircle, XCircle, Flag, ExternalLink,
  Loader2, FlaskConical, ChevronDown, ChevronUp, Beaker, Plus, Check,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const ADMIN_EMAIL = "peptidesupplyuk@gmail.com";
const STATUS_TABS = ["all", "pending", "approved", "rejected", "needs_review"] as const;
type StatusFilter = (typeof STATUS_TABS)[number];

const scoreColor = (s: number) =>
  s >= 4 ? "bg-green-500/10 text-green-400 border-green-500/20"
  : s === 3 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
  : "bg-red-500/10 text-red-400 border-red-500/20";

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  needs_review: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

interface EntityLookup {
  name: string;
  type: "compound" | "gene" | "biomarker";
  existingId: string | null;
}

interface ApprovePreview {
  item: any;
  entities: EntityLookup[];
  edges: { from: string; relationship: string; to: string }[];
  loading: boolean;
}

// ── Helper: resolve or auto-create an entity ──
async function resolveEntity(name: string, type: string): Promise<string> {
  // Try exact name match first
  const { data: byName } = await (supabase.from("entities") as any)
    .select("id")
    .eq("name", name)
    .limit(1)
    .maybeSingle();
  if (byName?.id) return byName.id;

  // Try alias match
  const { data: byAlias } = await (supabase.from("entities") as any)
    .select("id")
    .contains("aliases", [name])
    .limit(1)
    .maybeSingle();
  if (byAlias?.id) return byAlias.id;

  // Auto-create
  const { data: created, error } = await (supabase.from("entities") as any)
    .insert({
      name,
      type,
      evidence_score: 2,
      notes: "Auto-created by research agent — review and enrich manually",
    })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to create entity "${name}": ${error.message}`);
  return created.id;
}

// ── Helper: check if entity exists (for preview) ──
async function checkEntityExists(name: string): Promise<string | null> {
  const { data: byName } = await (supabase.from("entities") as any)
    .select("id").eq("name", name).limit(1).maybeSingle();
  if (byName?.id) return byName.id;
  const { data: byAlias } = await (supabase.from("entities") as any)
    .select("id").contains("aliases", [name]).limit(1).maybeSingle();
  return byAlias?.id ?? null;
}

const ResearchQueue = ({ embedded = false }: { embedded?: boolean }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [scoreFilter, setScoreFilter] = useState<number | null>(null);
  const [noteEditing, setNoteEditing] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [approvePreview, setApprovePreview] = useState<ApprovePreview | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const isAdmin = user?.email === ADMIN_EMAIL;

  // ── Queries ──
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["research-queue", filter, scoreFilter],
    enabled: isAdmin,
    queryFn: async () => {
      let q = (supabase.from("research_queue") as any)
        .select("*").order("evidence_score", { ascending: false }).order("created_at", { ascending: false }).limit(200);
      if (filter !== "all") q = q.eq("status", filter);
      if (scoreFilter !== null) q = q.gte("evidence_score", scoreFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: counts = {} } = useQuery({
    queryKey: ["research-queue-counts"],
    enabled: isAdmin,
    queryFn: async () => {
      const out: Record<string, number> = {};
      for (const s of ["pending", "approved", "rejected", "needs_review"]) {
        const { count } = await (supabase.from("research_queue") as any)
          .select("id", { count: "exact", head: true }).eq("status", s);
        out[s] = count ?? 0;
      }
      out.all = Object.values(out).reduce((a, b) => a + b, 0);
      return out;
    },
  });

  // ── Access guard (after hooks) ──
  if (!isAdmin) {
    if (embedded) return <div className="text-center py-12"><AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" /><h1 className="text-xl font-heading font-bold text-foreground">Access Denied</h1></div>;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h1 className="text-xl font-heading font-bold text-foreground">Access Denied</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Prepare approve preview (entity lookups) ──
  const prepareApprovePreview = async (item: any) => {
    setApprovePreview({ item, entities: [], edges: [], loading: true });

    const compoundNames: string[] = item.compound_names ?? [];
    const geneNames: string[] = item.gene_names ?? [];
    const biomarkerNames: string[] = item.biomarker_names ?? [];

    // Check each entity
    const entityChecks: EntityLookup[] = [];
    for (const name of compoundNames) {
      entityChecks.push({ name, type: "compound", existingId: await checkEntityExists(name) });
    }
    for (const name of geneNames) {
      entityChecks.push({ name, type: "gene", existingId: await checkEntityExists(name) });
    }
    for (const name of biomarkerNames) {
      entityChecks.push({ name, type: "biomarker", existingId: await checkEntityExists(name) });
    }

    // Determine planned edges
    const fromNames = compoundNames.length > 0 ? compoundNames : geneNames.slice(0, 1);
    const toNames = [
      ...(compoundNames.length > 0 ? geneNames : geneNames.slice(1)),
      ...biomarkerNames,
    ].slice(0, 3);

    const edges = fromNames.flatMap(from =>
      toNames.map(to => ({
        from,
        relationship: item.relationship_type || "supports",
        to,
      }))
    ).slice(0, 3);

    setApprovePreview({ item, entities: entityChecks, edges, loading: false });
  };

  // ── Write to graph mutation ──
  const writeToGraph = useMutation({
    mutationFn: async (item: any) => {
      const compoundNames: string[] = item.compound_names ?? [];
      const geneNames: string[] = item.gene_names ?? [];
      const biomarkerNames: string[] = item.biomarker_names ?? [];

      // Step 1: Resolve all entities (auto-create missing)
      const entityMap = new Map<string, { id: string; type: string }>();
      let autoCreated = 0;

      for (const name of compoundNames) {
        const existed = await checkEntityExists(name);
        const id = existed || await resolveEntity(name, "compound");
        if (!existed) autoCreated++;
        entityMap.set(name, { id, type: "compound" });
      }
      for (const name of geneNames) {
        const existed = await checkEntityExists(name);
        const id = existed || await resolveEntity(name, "gene");
        if (!existed) autoCreated++;
        entityMap.set(name, { id, type: "gene" });
      }
      for (const name of biomarkerNames) {
        const existed = await checkEntityExists(name);
        const id = existed || await resolveEntity(name, "biomarker");
        if (!existed) autoCreated++;
        entityMap.set(name, { id, type: "biomarker" });
      }

      // Step 2: Determine from/to and create edges (max 3)
      const fromNames = compoundNames.length > 0 ? compoundNames : geneNames.slice(0, 1);
      const toNames = [
        ...(compoundNames.length > 0 ? geneNames : geneNames.slice(1)),
        ...biomarkerNames,
      ].slice(0, 3);

      const edgePairs = fromNames.flatMap(from =>
        toNames.map(to => ({ from, to }))
      ).slice(0, 3);

      let edgesCreated = 0;
      let firstEdgeId: string | null = null;

      for (const pair of edgePairs) {
        const fromEntity = entityMap.get(pair.from);
        const toEntity = entityMap.get(pair.to);
        if (!fromEntity || !toEntity) continue;

        const { data: edge, error } = await (supabase.from("knowledge_edges") as any)
          .insert({
            from_entity_id: fromEntity.id,
            to_entity_id: toEntity.id,
            relationship: item.relationship_type || "supports",
            strength: item.strength || "moderate",
            evidence_level: item.evidence_level || "observational",
            dose_note: item.dose_note || null,
            source: `pubmed:${item.pubmed_id}`,
            notes: item.ai_summary,
          })
          .select("id")
          .single();

        if (error) throw new Error(`Edge creation failed: ${error.message}`);
        edgesCreated++;
        if (!firstEdgeId) firstEdgeId = edge.id;
      }

      if (edgesCreated === 0) {
        throw new Error("No valid entity pairs found — cannot create edges");
      }

      // Step 3: Update research_queue
      const { error: updateError } = await (supabase.from("research_queue") as any)
        .update({
          status: "approved",
          written_to_graph: true,
          knowledge_edge_id: firstEdgeId,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq("id", item.id);

      if (updateError) throw new Error(`Queue update failed: ${updateError.message}`);

      return { edgesCreated, autoCreated };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["research-queue"] });
      queryClient.invalidateQueries({ queryKey: ["research-queue-counts"] });
      setApprovePreview(null);
      toast({
        title: "Written to knowledge graph",
        description: `${result.edgesCreated} edge(s) created, ${result.autoCreated} entity/entities auto-created`,
      });
    },
    onError: (err: any) => {
      toast({ title: "Write failed", description: err.message, variant: "destructive" });
    },
  });

  // ── Approve-only / reject / needs_review ──
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase.from("research_queue") as any)
        .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-queue"] });
      queryClient.invalidateQueries({ queryKey: ["research-queue-counts"] });
      setApprovePreview(null);
      toast({ title: "Updated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const saveNote = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await (supabase.from("research_queue") as any)
        .update({ review_notes: notes }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-queue"] });
      setNoteEditing(null);
      toast({ title: "Note saved" });
    },
  });

  const runAgent = async () => {
    setIsRunning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research-agent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: "{}",
        }
      );
      const result = await res.json();
      toast({
        title: "Agent complete",
        description: `Searched ${result.results?.searched} terms, inserted ${result.results?.inserted} new findings.`,
      });
      queryClient.invalidateQueries({ queryKey: ["research-queue"] });
      queryClient.invalidateQueries({ queryKey: ["research-queue-counts"] });
    } catch (err: any) {
      toast({ title: "Agent failed", description: err.message, variant: "destructive" });
    } finally {
      setIsRunning(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const content = (
    <div className={embedded ? "" : "min-h-screen bg-background"}>
      {!embedded && <SEO title="Research Queue — Admin" description="Review AI-extracted PubMed findings." path="/admin/research-queue" />}
      {!embedded && <Header />}
      <main className={embedded ? "" : "pt-20 pb-16"}>
        <div className={embedded ? "" : "container mx-auto px-4 sm:px-6 max-w-4xl"}>
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
                Research <span className="text-gradient-teal">Queue</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                AI-extracted PubMed findings — review before publishing to knowledge graph
              </p>
            </div>
            <Button onClick={runAgent} disabled={isRunning} className="shrink-0">
              {isRunning ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Running...</>
                : <><Beaker className="h-4 w-4 mr-2" /> Run Agent Now</>}
            </Button>
          </div>

          {/* Status tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {STATUS_TABS.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                  filter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                }`}>
                {s.replace("_", " ")}
                <span className="ml-1.5 opacity-70">({counts[s] ?? 0})</span>
              </button>
            ))}
            {/* Score filter */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground">Min score:</span>
              {[null, 3, 4, 5].map(s => (
                <button key={s ?? "all"} onClick={() => setScoreFilter(s)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                    scoreFilter === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                  }`}>
                  {s === null ? "All" : `≥${s}`}
                </button>
              ))}
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : items.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <CheckCircle className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">All caught up — no {filter !== "all" ? filter.replace("_", " ") : ""} research to review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item: any) => (
                <div key={item.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {item.source_url ? (
                          <a href={item.source_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-mono text-primary hover:underline flex items-center gap-1">
                            PMID:{item.pubmed_id} <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs font-mono text-muted-foreground">PMID:{item.pubmed_id}</span>
                        )}
                        {item.published_date && (
                          <span className="text-[10px] text-muted-foreground">{new Date(item.published_date).toLocaleDateString()}</span>
                        )}
                        {item.evidence_score && (
                          <Badge variant="outline" className={`text-[10px] ${scoreColor(item.evidence_score)}`}>
                            Score: {item.evidence_score}/5
                          </Badge>
                        )}
                        <Badge variant="outline" className={`text-[10px] capitalize ${statusBadge[item.status] || ""}`}>
                          {item.status?.replace("_", " ")}
                        </Badge>
                        {item.written_to_graph && (
                          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                            In Graph
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-heading font-semibold text-foreground text-sm leading-tight">{item.title}</h3>
                    </div>
                  </div>

                  {/* AI Summary */}
                  {item.ai_summary && (
                    <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
                      <p className="text-xs text-foreground leading-relaxed">{item.ai_summary}</p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {(item.compound_names ?? []).map((c: string) => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10">{c}</span>
                    ))}
                    {(item.gene_names ?? []).map((g: string) => (
                      <span key={g} className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">{g}</span>
                    ))}
                    {(item.biomarker_names ?? []).map((b: string) => (
                      <span key={b} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">{b}</span>
                    ))}
                  </div>

                  {/* Relationship row */}
                  {item.relationship_type && (
                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                      <span className="font-mono">{item.relationship_type}</span>
                      {item.strength && <span>• {item.strength}</span>}
                      {item.evidence_level && <span>• {item.evidence_level}</span>}
                      {item.dose_note && <span>• {item.dose_note}</span>}
                    </div>
                  )}

                  {/* Expandable abstract */}
                  {item.abstract && (
                    <div>
                      <button onClick={() => toggleExpand(item.id)}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                        {expandedIds.has(item.id) ? <><ChevronUp className="h-3 w-3" /> Hide abstract</> : <><ChevronDown className="h-3 w-3" /> Show abstract</>}
                      </button>
                      {expandedIds.has(item.id) && (
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.abstract}</p>
                      )}
                    </div>
                  )}

                  {/* Authors */}
                  {item.authors?.length > 0 && (
                    <p className="text-[10px] text-muted-foreground/60">{item.authors.join(", ")}</p>
                  )}

                  {/* Review notes */}
                  {item.review_notes && noteEditing !== item.id && (
                    <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">{item.review_notes}</p>
                  )}

                  {/* Note editing */}
                  {noteEditing === item.id && (
                    <div className="space-y-2">
                      <Textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                        placeholder="Add review notes..." rows={2} className="text-xs" />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs"
                          onClick={() => setNoteEditing(null)}>Cancel</Button>
                        <Button size="sm" className="h-7 text-xs"
                          onClick={() => saveNote.mutate({ id: item.id, notes: noteText })}>Save</Button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    {item.status === "pending" || item.status === "needs_review" ? (
                      <>
                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700"
                          onClick={() => prepareApprovePreview(item)}
                          disabled={updateStatus.isPending || writeToGraph.isPending}>
                          <CheckCircle className="h-3 w-3 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 hover:text-red-600"
                          onClick={() => updateStatus.mutate({ id: item.id, status: "rejected" })}
                          disabled={updateStatus.isPending}>
                          <XCircle className="h-3 w-3 mr-1" /> Reject
                        </Button>
                        {item.status !== "needs_review" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs text-orange-400 hover:text-orange-500"
                            onClick={() => updateStatus.mutate({ id: item.id, status: "needs_review" })}
                            disabled={updateStatus.isPending}>
                            <Flag className="h-3 w-3 mr-1" /> Needs Review
                          </Button>
                        )}
                      </>
                    ) : null}
                    <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto"
                      onClick={() => { setNoteEditing(item.id); setNoteText(item.review_notes || ""); }}>
                      Add Note
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      {!embedded && <Footer />}

      {/* ── Approve confirmation dialog ── */}
      <Dialog open={!!approvePreview} onOpenChange={() => setApprovePreview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Approve and write to knowledge graph?</DialogTitle>
          </DialogHeader>
          {approvePreview && (
            <div className="space-y-4 text-sm">
              {approvePreview.loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                  <span className="text-muted-foreground text-xs">Checking entities…</span>
                </div>
              ) : (
                <>
                  {/* Entities section */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Entities</p>
                    <div className="space-y-1">
                      {approvePreview.entities.map(e => (
                        <div key={`${e.type}-${e.name}`} className="flex items-center gap-2 text-xs">
                          {e.existingId ? (
                            <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
                          ) : (
                            <Plus className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          )}
                          <span className={e.type === "compound" ? "text-primary" : e.type === "gene" ? "text-purple-400" : "text-blue-400"}>
                            {e.name}
                          </span>
                          <span className="text-muted-foreground/50 text-[10px]">
                            {e.existingId ? "exists" : "will be created"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Edges section */}
                  {approvePreview.edges.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Edges to create</p>
                      <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-xs font-mono">
                        {approvePreview.edges.map((edge, i) => (
                          <div key={i}>
                            <span className="text-primary">{edge.from}</span>
                            <span className="text-muted-foreground"> → {edge.relationship} → </span>
                            <span className="text-blue-400">{edge.to}</span>
                          </div>
                        ))}
                        <div className="text-muted-foreground/60 mt-2">
                          Strength: {approvePreview.item.strength || "—"} | Evidence: {approvePreview.item.evidence_level || "—"}
                        </div>
                      </div>
                    </div>
                  )}

                  {approvePreview.edges.length === 0 && (
                    <p className="text-xs text-muted-foreground">No valid entity pairs found — will approve without writing edges.</p>
                  )}
                </>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              if (approvePreview) updateStatus.mutate({ id: approvePreview.item.id, status: "approved" });
            }} disabled={updateStatus.isPending || writeToGraph.isPending || approvePreview?.loading}>
              Approve Only
            </Button>
            <Button onClick={() => {
              if (approvePreview) writeToGraph.mutate(approvePreview.item);
            }} disabled={writeToGraph.isPending || approvePreview?.loading || (approvePreview && !approvePreview.loading && approvePreview.edges.length === 0)}>
              {writeToGraph.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FlaskConical className="h-4 w-4 mr-2" />}
              Confirm & Write
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResearchQueue;
