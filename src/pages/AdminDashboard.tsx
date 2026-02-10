import { useState, lazy, Suspense } from "react";
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
  AlertTriangle, Users, Globe, Mail, Activity, FlaskConical, Droplets, Loader2,
  Upload, CheckCircle, XCircle, Clock, FileText, ExternalLink, Twitter, BarChart3, Target,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import MonitoredAccounts from "@/components/admin/MonitoredAccounts";

const ADMIN_EMAIL = "peptidesupplyuk@gmail.com";

/* ========== ANALYTICS TAB ========== */

const GOAL_LABELS: Record<string, string> = {
  weight_loss: "Weight Loss / Metabolic",
  longevity: "Longevity / Anti-Ageing",
  healing: "Healing / Recovery",
  performance: "Performance / Muscle",
  cognitive: "Cognitive / Nootropic",
  general: "General Research",
  "Not specified": "Not specified",
};

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--accent))", "#22d3ee", "#a78bfa",
  "#f97316", "#10b981", "#f43f5e", "#6366f1", "#eab308", "#ec4899",
];

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </div>
);

const AnalyticsTab = () => {
  const { user } = useAuth();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats`,
        { headers: { Authorization: `Bearer ${session?.access_token}`, "Content-Type": "application/json" } }
      );
      if (!resp.ok) throw new Error("Failed to load stats");
      return resp.json();
    },
    enabled: user?.email === ADMIN_EMAIL,
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (error || !stats) return <p className="text-destructive text-sm text-center py-12">Failed to load analytics.</p>;

  const countryData = Object.entries(stats.by_country as Record<string, number>)
    .sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, value]) => ({ name, value }));
  const goalData = Object.entries(stats.by_goal as Record<string, number>)
    .sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name: GOAL_LABELS[name] || name, value }));
  const signupData = Object.entries(stats.signups_by_day as Record<string, number>)
    .sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date: date.slice(5), count }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Users} label="Total Users" value={stats.total_users} />
        <StatCard icon={Globe} label="Countries" value={Object.keys(stats.by_country).filter(c => c !== "Not specified").length} />
        <StatCard icon={FlaskConical} label="Protocols" value={stats.total_protocols} />
        <StatCard icon={Activity} label="Protocol Users" value={stats.active_protocol_users} />
        <StatCard icon={Droplets} label="Bloodwork" value={stats.total_bloodwork_panels} />
        <StatCard icon={Mail} label="Messages" value={stats.total_contact_submissions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {signupData.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-heading font-semibold text-foreground text-sm mb-4">Signups (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={signupData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-4">Users by Country (Top 10)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={countryData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={100} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-4">Research Interests</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={goalData} dataKey="value" cx="50%" cy="50%" outerRadius={70} stroke="none">
                  {goalData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5">
              {goalData.map((g, i) => (
                <div key={g.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{g.name} ({g.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-4">Recent Signups</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {(stats.recent_signups || []).map((u: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs border-b border-border/50 pb-1.5 last:border-0">
                <div>
                  <span className="text-foreground font-medium">{u.username || "No username"}</span>
                  <span className="text-muted-foreground ml-2">{u.country || "—"}</span>
                </div>
                <span className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {(stats.recent_signups || []).length === 0 && <p className="text-xs text-muted-foreground">No signups yet.</p>}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" /> Recent Contact Messages
        </h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {(stats.recent_contacts || []).map((c: any) => (
            <div key={c.id} className="border border-border/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{c.name}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-[11px] text-primary mb-1">{c.email}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{c.message}</p>
            </div>
          ))}
          {(stats.recent_contacts || []).length === 0 && <p className="text-xs text-muted-foreground">No contact submissions yet.</p>}
        </div>
      </div>
    </div>
  );
};

/* ========== CONTENT TAB — Ingest Form ========== */

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
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingest-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ content, content_type: contentType, source_url: sourceUrl || undefined, source_name: sourceName || undefined }),
      });
      if (!resp.ok) { const err = await resp.json().catch(() => ({})); throw new Error(err.error || "Ingestion failed"); }
      const result = await resp.json();
      toast({ title: "Content ingested", description: `"${result.article?.title}" — ${result.extracted?.findings_count} findings extracted.` });
      setContent(""); setSourceUrl(""); setSourceName("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4">
      <h2 className="font-heading font-semibold text-foreground flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Ingest Content</h2>
      <p className="text-xs text-muted-foreground">Paste raw content (article, transcript, blog post). AI will extract structured peptide data.</p>
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
      <Textarea placeholder="Paste article text, YouTube transcript, or blog content here..." value={content} onChange={(e) => setContent(e.target.value)} rows={10} className="resize-y" />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{content.length} chars</span>
        <Button type="submit" disabled={isSubmitting || content.trim().length < 50}>
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</> : <><FlaskConical className="h-4 w-4 mr-2" /> Extract & Queue</>}
        </Button>
      </div>
    </form>
  );
};

/* ========== CONTENT TAB — Review Queue ========== */

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
      const { data, error } = await supabase.from("articles").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "published") { updates.published_at = new Date().toISOString(); updates.reviewed_by = user?.id; updates.reviewed_at = new Date().toISOString(); }
      else if (status === "rejected") { updates.reviewed_by = user?.id; updates.reviewed_at = new Date().toISOString(); }
      const { error } = await supabase.from("articles").update(updates).eq("id", id);
      if (error) throw error;
      if (status === "published") {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chunk-content`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
            body: JSON.stringify({ article_id: id }),
          });
        } catch (e) { console.error("Embedding generation failed:", e); }
      }
    },
    onSuccess: (_, { status }) => { queryClient.invalidateQueries({ queryKey: ["admin-articles"] }); toast({ title: status === "published" ? "Article published" : "Article rejected" }); },
    onError: (err: any) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" /> Review Queue ({articles.filter(a => a.status === "pending_review").length} pending)
      </h2>
      {articles.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No articles yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div key={article.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-semibold text-foreground text-sm truncate">{article.title}</h3>
                    <Badge variant="outline" className={statusColors[article.status] || ""}>{article.status === "pending_review" ? "Pending" : article.status}</Badge>
                    <Badge variant="outline" className="text-[10px]">{(article.credibility_tier as string).replace("_", " ")}</Badge>
                  </div>
                  {article.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(article.peptides_mentioned as string[] || []).map((p: string) => (
                  <span key={p} className="text-[10px] px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10">{p}</span>
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
                  {(article.findings as any[]).length > 3 && <span className="text-muted-foreground/50">+{(article.findings as any[]).length - 3} more</span>}
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                {article.url && <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" /> Source</a>}
                <span className="text-[10px] text-muted-foreground ml-auto">{new Date(article.created_at).toLocaleDateString()}</span>
                {article.status === "pending_review" && (
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 hover:text-red-600" onClick={() => updateStatus.mutate({ id: article.id, status: "rejected" })} disabled={updateStatus.isPending}>
                      <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>
                    <Button size="sm" className="h-7 text-xs" onClick={() => updateStatus.mutate({ id: article.id, status: "published" })} disabled={updateStatus.isPending}>
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

/* ========== CONTENT TAB — Processing Queue ========== */

const ProcessingQueue = () => {
  const { data: queue = [], isLoading } = useQuery({
    queryKey: ["content-queue"],
    queryFn: async () => {
      const { data, error } = await supabase.from("content_queue").select("*").order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-3">
      <h2 className="font-heading font-semibold text-foreground flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Processing History</h2>
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

/* ========== CONTENT TAB (combined) ========== */

const ContentTab = () => (
  <Tabs defaultValue="ingest" className="space-y-6">
    <TabsList className="grid w-full grid-cols-4 max-w-lg">
      <TabsTrigger value="ingest" className="text-xs sm:text-sm"><Upload className="h-4 w-4 mr-1.5 hidden sm:inline" /> Ingest</TabsTrigger>
      <TabsTrigger value="twitter" className="text-xs sm:text-sm"><Twitter className="h-4 w-4 mr-1.5 hidden sm:inline" /> X Feed</TabsTrigger>
      <TabsTrigger value="review" className="text-xs sm:text-sm"><FileText className="h-4 w-4 mr-1.5 hidden sm:inline" /> Review</TabsTrigger>
      <TabsTrigger value="queue" className="text-xs sm:text-sm"><Clock className="h-4 w-4 mr-1.5 hidden sm:inline" /> Queue</TabsTrigger>
    </TabsList>
    <TabsContent value="ingest"><IngestForm /></TabsContent>
    <TabsContent value="twitter"><MonitoredAccounts /></TabsContent>
    <TabsContent value="review"><ReviewQueue /></TabsContent>
    <TabsContent value="queue"><ProcessingQueue /></TabsContent>
  </Tabs>
);

/* ========== MAIN PAGE ========== */

const AdminDashboard = () => {
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
      <SEO title="Admin Dashboard" description="Platform analytics, content management, and user insights." path="/admin/dashboard" />
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Admin <span className="text-gradient-teal">Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Analytics, content management, and platform activity — all in one place.</p>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="w-auto">
              <TabsTrigger value="analytics" className="gap-1.5">
                <BarChart3 className="h-4 w-4" /> Analytics
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-1.5">
                <FileText className="h-4 w-4" /> Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <AnalyticsTab />
            </TabsContent>
            <TabsContent value="content">
              <ContentTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
