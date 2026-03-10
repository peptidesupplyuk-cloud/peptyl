import { useState } from "react";
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
  Loader2, FlaskConical, ChevronDown, ChevronUp, Beaker,
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

const ResearchQueue = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [noteEditing, setNoteEditing] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [approveItem, setApproveItem] = useState<any | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const isAdmin = user?.email === ADMIN_EMAIL;

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["research-queue", filter],
    enabled: isAdmin,
    queryFn: async () => {
      let q = (supabase.from("research_queue") as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (filter !== "all") q = q.eq("status", filter);
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
          .select("id", { count: "exact", head: true })
          .eq("status", s);
        out[s] = count ?? 0;
      }
      out.all = Object.values(out).reduce((a, b) => a + b, 0);
      return out;
    },
  });

  // Access check — after all hooks
  if (!isAdmin) {
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




  const updateStatus = useMutation({
    mutationFn: async ({ id, status, writeToGraph }: { id: string; status: string; writeToGraph?: boolean }) => {
      const updates: any = { status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id };

      if (writeToGraph && approveItem) {
        // Write to knowledge graph via entities + edges
        // First find or create entities for the compounds/genes/biomarkers
        const item = approveItem;
        const compoundNames = item.compound_names ?? [];
        const targetNames = [...(item.gene_names ?? []), ...(item.biomarker_names ?? [])];

        if (compoundNames.length > 0 && targetNames.length > 0) {
          // Create entities
          for (const name of [...compoundNames, ...targetNames]) {
            const entityType = compoundNames.includes(name) ? "compound" : 
              (item.gene_names ?? []).includes(name) ? "gene" : "biomarker";
            await (supabase.from("entities") as any).upsert(
              { name, type: entityType },
              { onConflict: "name,type", ignoreDuplicates: true }
            );
          }

          // Get entity IDs
          const { data: entities } = await (supabase.from("entities") as any)
            .select("id, name, type")
            .in("name", [...compoundNames, ...targetNames]);

          if (entities && entities.length >= 2) {
            const fromEntities = entities.filter((e: any) => compoundNames.includes(e.name));
            const toEntities = entities.filter((e: any) => targetNames.includes(e.name));

            for (const from of fromEntities) {
              for (const to of toEntities) {
                const { data: edge } = await (supabase.from("knowledge_edges") as any).insert({
                  from_entity_id: from.id,
                  to_entity_id: to.id,
                  relationship: item.relationship_type || "supports",
                  strength: item.strength || "moderate",
                  evidence_level: item.evidence_level || "observational",
                  dose_note: item.dose_note || null,
                  source: `PubMed:${item.pubmed_id}`,
                  notes: item.ai_summary,
                }).select("id").single();

                if (edge) {
                  updates.knowledge_edge_id = edge.id;
                  updates.written_to_graph = true;
                }
              }
            }
          }
        }
      }

      const { error } = await (supabase.from("research_queue") as any).update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-queue"] });
      queryClient.invalidateQueries({ queryKey: ["research-queue-counts"] });
      setApproveItem(null);
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

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Research Queue — Admin" description="Review AI-extracted PubMed findings." path="/admin/research-queue" />
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
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
          </div>

          {/* Items */}
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
                          onClick={() => setApproveItem(item)}
                          disabled={updateStatus.isPending}>
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
      <Footer />

      {/* Approve confirmation dialog */}
      <Dialog open={!!approveItem} onOpenChange={() => setApproveItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Approve and write to knowledge graph?</DialogTitle>
          </DialogHeader>
          {approveItem && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">This will create entity relationships:</p>
              <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-xs font-mono">
                {(approveItem.compound_names ?? []).map((c: string) => (
                  <div key={c}>
                    <span className="text-primary">{c}</span>
                    <span className="text-muted-foreground"> → {approveItem.relationship_type || "supports"} → </span>
                    <span className="text-blue-400">{[...(approveItem.gene_names ?? []), ...(approveItem.biomarker_names ?? [])].join(", ") || "—"}</span>
                  </div>
                ))}
                <div className="text-muted-foreground/60 mt-2">
                  Strength: {approveItem.strength || "—"} | Evidence: {approveItem.evidence_level || "—"}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              updateStatus.mutate({ id: approveItem.id, status: "approved", writeToGraph: false });
            }} disabled={updateStatus.isPending}>
              Approve Only
            </Button>
            <Button onClick={() => {
              updateStatus.mutate({ id: approveItem.id, status: "approved", writeToGraph: true });
            }} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FlaskConical className="h-4 w-4 mr-2" />}
              Confirm & Write
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResearchQueue;
