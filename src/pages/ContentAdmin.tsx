import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Upload, CheckCircle, XCircle, Clock, Loader2, FileText, AlertTriangle,
  ExternalLink, FlaskConical, Twitter,
} from "lucide-react";
import MonitoredAccounts from "@/components/admin/MonitoredAccounts";

/* ---------- Ingest Form ---------- */
const IngestForm = () => {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [contentType, setContentType] = useState("text");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 50) {
      toast({ title: "Too short", description: "Content must be at least 50 characters.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingest-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ content, content_type: contentType, source_url: sourceUrl || undefined, source_name: sourceName || undefined }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Ingestion failed");
      }

      const result = await resp.json();
      toast({
        title: "Content ingested",
        description: `"${result.article?.title}" — ${result.extracted?.findings_count} findings extracted. Pending review.`,
      });
      setContent("");
      setSourceUrl("");
      setSourceName("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4">
      <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
        <Upload className="h-5 w-5 text-primary" /> Ingest Content
      </h2>
      <p className="text-xs text-muted-foreground">
        Paste raw content (article, transcript, blog post). AI will extract structured peptide data.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input placeholder="Source name (e.g. PubMed, Reddit)" value={sourceName} onChange={(e) => setSourceName(e.target.value)} />
        <Input placeholder="Source URL (optional)" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
      </div>
      <div className="flex gap-2">
        {["text", "transcript", "url"].map((t) => (
          <button key={t} type="button" onClick={() => setContentType(t)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${contentType === t ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Paste article text, YouTube transcript, or blog content here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        className="resize-y"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{content.length} chars</span>
        <Button type="submit" disabled={isSubmitting || content.trim().length < 50}>
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</> : <><FlaskConical className="h-4 w-4 mr-2" /> Extract & Queue</>}
        </Button>
      </div>
    </form>
  );
};

/* ---------- Review Queue ---------- */
const statusColors: Record<string, string> = {
  pending_review: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  published: "bg-green-500/10 text-green-600 border-green-500/20",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20",
};

const ReviewQueue = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "published") {
        updates.published_at = new Date().toISOString();
        updates.reviewed_by = user?.id;
        updates.reviewed_at = new Date().toISOString();
      } else if (status === "rejected") {
        updates.reviewed_by = user?.id;
        updates.reviewed_at = new Date().toISOString();
      }
      const { error } = await supabase.from("articles").update(updates).eq("id", id);
      if (error) throw error;

      // If publishing, trigger embedding generation
      if (status === "published") {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chunk-content`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({ article_id: id }),
            }
          );
        } catch (embErr) {
          console.error("Embedding generation failed:", embErr);
        }
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast({ title: status === "published" ? "Article published & embeddings generated" : "Article rejected" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" /> Review Queue ({articles.filter(a => a.status === "pending_review").length} pending)
      </h2>

      {articles.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No articles yet. Ingest some content to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div key={article.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-semibold text-foreground text-sm truncate">{article.title}</h3>
                    <Badge variant="outline" className={statusColors[article.status] || ""}>
                      {article.status === "pending_review" ? "Pending" : article.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {(article.credibility_tier as string).replace("_", " ")}
                    </Badge>
                  </div>
                  {article.summary && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(article.peptides_mentioned as string[] || []).map((p: string) => (
                  <span key={p} className="text-[10px] px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10">
                    {p}
                  </span>
                ))}
              </div>

              {Array.isArray(article.findings) && (article.findings as any[]).length > 0 && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {(article.findings as any[]).slice(0, 3).map((f: any, i: number) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>{f.peptide}:</strong> {f.finding} <span className="text-muted-foreground/60">({f.evidence_strength})</span></span>
                    </div>
                  ))}
                  {(article.findings as any[]).length > 3 && (
                    <span className="text-muted-foreground/50">+{(article.findings as any[]).length - 3} more findings</span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                {article.url && (
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> Source
                  </a>
                )}
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {new Date(article.created_at).toLocaleDateString()}
                </span>

                {article.status === "pending_review" && (
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 hover:text-red-600"
                      onClick={() => updateStatus.mutate({ id: article.id, status: "rejected" })}
                      disabled={updateStatus.isPending}>
                      <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>
                    <Button size="sm" className="h-7 text-xs"
                      onClick={() => updateStatus.mutate({ id: article.id, status: "published" })}
                      disabled={updateStatus.isPending}>
                      <CheckCircle className="h-3 w-3 mr-1" /> Publish
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- Processing Queue ---------- */
const ProcessingQueue = () => {
  const { data: queue = [], isLoading } = useQuery({
    queryKey: ["content-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_queue")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-3">
      <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" /> Processing History
      </h2>
      {queue.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items processed yet.</p>
      ) : (
        <div className="space-y-2">
          {queue.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2.5">
              {item.processing_status === "completed" && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
              {item.processing_status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-yellow-500 flex-shrink-0" />}
              {item.processing_status === "failed" && <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />}
              {item.processing_status === "queued" && <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">{item.raw_input.slice(0, 80)}...</p>
                <p className="text-[10px] text-muted-foreground">{item.content_type} • {new Date(item.created_at).toLocaleString()}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">{item.processing_status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- Main Page ---------- */
const ADMIN_EMAIL = "peptidesupplyuk@gmail.com";

const ContentAdmin = () => {
  const { user } = useAuth();

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h1 className="text-xl font-heading font-bold text-foreground">Access Denied</h1>
            <p className="text-muted-foreground text-sm mt-1">You do not have permission to view this page.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Content Admin — Ingestion & Review" description="Manage content ingestion pipeline and review AI-extracted peptide data." path="/admin/content" />
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Content <span className="text-gradient-teal">Admin</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Ingest raw content, review AI extractions, monitor X accounts, and manage the knowledge base.
            </p>
          </div>

          <Tabs defaultValue="ingest" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-lg">
              <TabsTrigger value="ingest" className="text-xs sm:text-sm">
                <Upload className="h-4 w-4 mr-1.5 hidden sm:inline" /> Ingest
              </TabsTrigger>
              <TabsTrigger value="twitter" className="text-xs sm:text-sm">
                <Twitter className="h-4 w-4 mr-1.5 hidden sm:inline" /> X Feed
              </TabsTrigger>
              <TabsTrigger value="review" className="text-xs sm:text-sm">
                <FileText className="h-4 w-4 mr-1.5 hidden sm:inline" /> Review
              </TabsTrigger>
              <TabsTrigger value="queue" className="text-xs sm:text-sm">
                <Clock className="h-4 w-4 mr-1.5 hidden sm:inline" /> Queue
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ingest">
              <IngestForm />
            </TabsContent>
            <TabsContent value="twitter">
              <MonitoredAccounts />
            </TabsContent>
            <TabsContent value="review">
              <ReviewQueue />
            </TabsContent>
            <TabsContent value="queue">
              <ProcessingQueue />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContentAdmin;
