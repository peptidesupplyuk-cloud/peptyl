import { useState, lazy, Suspense, createContext, useContext } from "react";
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
  Upload, CheckCircle, XCircle, Clock, FileText, ExternalLink, Twitter, BarChart3, Target, Sparkles, Megaphone, Search, Copy, Link as LinkIcon, MessageSquare, Trash2, BookOpen, TrendingUp, CreditCard, Star, Dna, Smartphone, Monitor, Tablet, RotateCcw, Eye,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import MonitoredAccounts from "@/components/admin/MonitoredAccounts";
import { campaigns } from "@/data/campaigns";

const LazyResearchQueue = lazy(() => import("@/pages/ResearchQueue"));
import IngestChat from "@/components/admin/IngestChat";
import UserDetailPanel from "@/components/admin/UserDetailPanel";
import CoachPlanBuilder from "@/components/admin/CoachPlanBuilder";

const ADMIN_EMAIL = "peptidesupplyuk@gmail.com";

// Context to allow child tabs to open user detail
const UserDetailContext = createContext<{ openUser: (userId: string, name: string) => void }>({ openUser: () => {} });

/* ========== ANALYTICS TAB ========== */

const GOAL_LABELS: Record<string, string> = {
  fat_loss: "Fat Loss",
  weight_loss: "Weight Loss / Metabolic",
  longevity: "Longevity / Anti-Ageing",
  healing: "Healing / Recovery",
  performance: "Performance / Muscle",
  cognitive: "Cognitive / Nootropic",
  muscle: "Muscle / Growth",
  hormone: "Hormone Optimisation",
  general: "General Research",
  "Not specified": "Not specified",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  none: "No Experience",
  beginner: "Beginner (< 6 months)",
  intermediate: "Intermediate (6–24 months)",
  advanced: "Advanced (2+ years)",
  "Not specified": "Not specified",
};

const RISK_LABELS: Record<string, string> = {
  conservative: "Conservative",
  moderate: "Moderate",
  aggressive: "Aggressive",
  "Not specified": "Not specified",
};

const BIOMARKER_LABELS: Record<string, string> = {
  none: "No Bloodwork",
  basic: "Basic Panel",
  hormones: "Hormones Panel",
  comprehensive: "Comprehensive",
  "Not specified": "Not specified",
};

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--accent))", "#22d3ee", "#a78bfa",
  "#f97316", "#10b981", "#f43f5e", "#6366f1", "#eab308", "#ec4899",
];

const StatCard = ({ icon: Icon, label, value, delta }: { icon: any; label: string; value: string | number; delta?: number }) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
          {delta !== undefined && delta > 0 && (
            <span className="flex items-center text-xs font-semibold text-emerald-500">
              <TrendingUp className="h-3 w-3 mr-0.5" />+{delta}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </div>
);

const AnalyticsTab = () => {
  const { user } = useAuth();
  const { openUser } = useContext(UserDetailContext);

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
  const experienceData = Object.entries((stats.by_experience || {}) as Record<string, number>)
    .sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name: EXPERIENCE_LABELS[name] || name, value }));
  const riskData = Object.entries((stats.by_risk || {}) as Record<string, number>)
    .sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name: RISK_LABELS[name] || name, value }));
  const biomarkerData = Object.entries((stats.by_biomarker || {}) as Record<string, number>)
    .sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name: BIOMARKER_LABELS[name] || name, value }));
  const signupData = Object.entries(stats.signups_by_day as Record<string, number>)
    .sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date: date.slice(5), count }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <StatCard icon={Users} label="Total Users" value={stats.total_users} />
        <StatCard icon={Globe} label="Countries" value={Object.keys(stats.by_country).filter(c => c !== "Not specified").length} />
        <StatCard icon={FlaskConical} label="Protocols" value={stats.total_protocols} />
        <StatCard icon={Activity} label="Protocol Users" value={stats.active_protocol_users} />
        <StatCard icon={Droplets} label="Bloodwork" value={stats.total_bloodwork_panels} />
        <StatCard icon={BookOpen} label="Journal Entries" value={stats.total_journal_entries || 0} delta={stats.journal_entries_today} />
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

        <div className="bg-card border border-border rounded-xl p-5 col-span-full">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-4">Recent Signups</h3>
          <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider border-b border-border">
                  <th className="text-left py-1.5 pr-2">Name</th>
                  <th className="text-left py-1.5 pr-2">Email</th>
                  <th className="text-left py-1.5 pr-2">Country</th>
                  <th className="text-left py-1.5 pr-2">Goal</th>
                  <th className="text-left py-1.5 pr-2">Experience</th>
                  <th className="text-left py-1.5 pr-2">Compounds</th>
                  <th className="text-right py-1.5">Date</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recent_signups || []).map((u: any, i: number) => {
                  const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || "—";
                  const missingFields = [!u.first_name && "name", !u.country && "country", !u.research_goal && "goal"].filter(Boolean);
                  return (
                     <tr key={i} className={`border-b border-border/30 last:border-0 cursor-pointer hover:bg-muted/30 transition-colors ${missingFields.length >= 2 ? "bg-destructive/5" : ""}`}
                       onClick={() => openUser(u.user_id, name)}>
                      <td className="py-1.5 pr-2 text-foreground font-medium whitespace-nowrap">{name}</td>
                      <td className="py-1.5 pr-2 text-muted-foreground">{u.email || "—"}</td>
                      <td className="py-1.5 pr-2 text-muted-foreground">{u.country || <span className="text-destructive/70">—</span>}</td>
                      <td className="py-1.5 pr-2 text-muted-foreground capitalize">{u.research_goal?.replace(/_/g, " ") || <span className="text-destructive/70">—</span>}</td>
                      <td className="py-1.5 pr-2 text-muted-foreground capitalize">{u.experience_level?.replace(/_/g, " ") || "—"}</td>
                      <td className="py-1.5 pr-2 text-muted-foreground">{u.current_compounds || "—"}</td>
                      <td className="py-1.5 text-right text-muted-foreground whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(stats.recent_signups || []).length === 0 && <p className="text-xs text-muted-foreground py-2">No signups yet.</p>}
          </div>
        </div>
      </div>

      {/* Onboarding Responses Pie Charts */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" /> Onboarding Responses
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Experience Level", data: experienceData },
            { title: "Risk Tolerance", data: riskData },
            { title: "Biomarker Availability", data: biomarkerData },
          ].map(({ title, data }) => (
            <div key={title}>
              <p className="text-xs font-medium text-muted-foreground mb-2">{title}</p>
              {data.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={55} stroke="none">
                        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-1 mt-2">
                    {data.map((g, i) => (
                      <div key={g.name} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground">{g.name} ({g.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No data yet.</p>
              )}
            </div>
          ))}
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

      {/* Journal Entries Analytics */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" /> Journal Entries
          <span className="ml-auto text-xs text-muted-foreground">{stats.unique_journal_users || 0} unique users</span>
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Journal entries over time */}
          {Object.keys(stats.journal_by_day || {}).length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Entries (Last 30 Days)</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={Object.entries(stats.journal_by_day as Record<string, number>).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date: date.slice(5), count }))}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top peptide mentions */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Top Peptides Mentioned</p>
            {Object.keys(stats.journal_peptide_mentions || {}).length > 0 ? (
              <div className="space-y-1.5">
                {Object.entries(stats.journal_peptide_mentions as Record<string, number>)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([peptide, count]) => (
                    <div key={peptide} className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">{peptide}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full bg-primary/20 w-24">
                          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, (count / Math.max(...Object.values(stats.journal_peptide_mentions as Record<string, number>))) * 100)}%` }} />
                        </div>
                        <span className="text-muted-foreground w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No peptide mentions yet.</p>
            )}
          </div>
        </div>

        {/* Recent journal entries */}
        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-3">Recent Journal Entries</p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {(stats.recent_journal || []).map((j: any) => (
              <div key={j.id} className="border border-border/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground truncate">{j.email || "Unknown"}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(j.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{j.content}</p>
                {Array.isArray(j.peptides) && j.peptides.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {j.peptides.map((p: string) => (
                      <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/10">{p}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {(stats.recent_journal || []).length === 0 && <p className="text-xs text-muted-foreground">No journal entries yet.</p>}
          </div>
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
  <Tabs defaultValue="chat" className="space-y-6">
    <TabsList className="grid w-full grid-cols-5 max-w-xl">
      <TabsTrigger value="chat" className="text-xs sm:text-sm"><Sparkles className="h-4 w-4 mr-1.5 hidden sm:inline" /> Chat</TabsTrigger>
      <TabsTrigger value="ingest" className="text-xs sm:text-sm"><Upload className="h-4 w-4 mr-1.5 hidden sm:inline" /> Ingest</TabsTrigger>
      <TabsTrigger value="twitter" className="text-xs sm:text-sm"><Twitter className="h-4 w-4 mr-1.5 hidden sm:inline" /> X Feed</TabsTrigger>
      <TabsTrigger value="review" className="text-xs sm:text-sm"><FileText className="h-4 w-4 mr-1.5 hidden sm:inline" /> Review</TabsTrigger>
      <TabsTrigger value="queue" className="text-xs sm:text-sm"><Clock className="h-4 w-4 mr-1.5 hidden sm:inline" /> Queue</TabsTrigger>
    </TabsList>
    <TabsContent value="chat"><IngestChat /></TabsContent>
    <TabsContent value="ingest"><IngestForm /></TabsContent>
    <TabsContent value="twitter"><MonitoredAccounts /></TabsContent>
    <TabsContent value="review"><ReviewQueue /></TabsContent>
    <TabsContent value="queue"><ProcessingQueue /></TabsContent>
  </Tabs>
);

/* ========== CAMPAIGNS TAB ========== */

const CampaignsTab = () => {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.headline.toLowerCase().includes(search.toLowerCase())
  );

  const copyUrl = (slug: string) => {
    const url = `https://peptyl.co.uk/start/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" /> Ad Landing Pages ({campaigns.length})
        </h2>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.slug} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-foreground text-sm">{c.name}</h3>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{c.headline}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <code className="flex-1 text-[10px] bg-muted/50 rounded-md px-2 py-1.5 text-muted-foreground truncate font-mono">
                  /start/{c.slug}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={() => copyUrl(c.slug)}
                >
                  {copied === c.slug ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                <a
                  href={`/start/${c.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {c.stats.map((s, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10">
                    {s.value} {s.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No campaigns match "{search}"</p>
        </div>
      )}
    </div>
  );
};

/* ========== FEEDBACK TAB ========== */

const FEEDBACK_CATEGORIES = [
  { value: "all", label: "All", color: "" },
  { value: "ui_ux", label: "UI/UX", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { value: "error", label: "Error", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  { value: "feature_request", label: "Feature Request", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { value: "not_relevant", label: "Not Relevant", color: "bg-muted text-muted-foreground border-border" },
  { value: "other", label: "Other", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  { value: "uncategorised", label: "Uncategorised", color: "" },
];

/* ========== MARKER REQUESTS TAB ========== */

const MarkerRequestsTab = () => {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["admin-marker-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marker_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Group by marker name and count, collect unique requesters
  const grouped = requests.reduce<Record<string, { count: number; status: string; latest: string; requesters: { email: string; name: string }[] }>>((acc, r: any) => {
    const name = r.marker_name;
    if (!acc[name]) acc[name] = { count: 0, status: r.status, latest: r.created_at, requesters: [] };
    acc[name].count++;
    if (new Date(r.created_at) > new Date(acc[name].latest)) acc[name].latest = r.created_at;
    const email = r.user_email || r.user_id?.slice(0, 8);
    const rName = r.user_name || email;
    if (email && !acc[name].requesters.some((req: any) => req.email === email)) {
      acc[name].requesters.push({ email, name: rName });
    }
    return acc;
  }, {});

  const sorted = Object.entries(grouped).sort((a, b) => b[1].count - a[1].count);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg">Marker Tracking Requests</h3>
        <Badge variant="outline">{requests.length} total requests</Badge>
      </div>
      <p className="text-xs text-muted-foreground">Users who requested tracking — notify them when you add support.</p>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No marker requests yet.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map(([name, info]) => (
            <div key={name} className="rounded-lg border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{info.count} request{info.count > 1 ? "s" : ""} • Latest: {new Date(info.latest).toLocaleDateString()}</p>
                </div>
                <Badge variant={info.count >= 3 ? "default" : "outline"} className={info.count >= 3 ? "bg-primary" : ""}>
                  {info.count >= 3 ? "High demand" : info.count >= 2 ? "Growing" : "New"}
                </Badge>
              </div>
              {info.requesters.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {info.requesters.map((r) => (
                    <span key={r.email} className="inline-flex items-center gap-1 text-[11px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground" title={r.email}>
                      <Mail className="h-2.5 w-2.5" /> {r.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FeedbackTab = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase.from("feedback" as any).select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data as any[];
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, category }: { id: string; category: string }) => {
      const { error } = await supabase.from("feedback" as any).update({ category } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-feedback"] }); },
  });

  const deleteFeedback = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feedback" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-feedback"] }); toast({ title: "Feedback deleted" }); },
  });

  const filtered = filter === "all"
    ? feedback
    : filter === "uncategorised"
      ? feedback.filter((f: any) => !f.category)
      : feedback.filter((f: any) => f.category === filter);

  const getCategoryMeta = (cat: string | null) =>
    FEEDBACK_CATEGORIES.find((c) => c.value === cat) || FEEDBACK_CATEGORIES.find((c) => c.value === "uncategorised")!;

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" /> User Feedback ({feedback.length})
        </h2>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {FEEDBACK_CATEGORIES.map((cat) => {
          const count = cat.value === "all"
            ? feedback.length
            : cat.value === "uncategorised"
              ? feedback.filter((f: any) => !f.category).length
              : feedback.filter((f: any) => f.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                filter === cat.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No feedback in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f: any) => {
            const catMeta = getCategoryMeta(f.category);
            return (
              <div key={f.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{f.message}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {f.page && <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{f.page}</span>}
                      {f.category && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border ${catMeta.color}`}>
                          {catMeta.label}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{new Date(f.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <select
                      value={f.category || ""}
                      onChange={(e) => updateCategory.mutate({ id: f.id, category: e.target.value })}
                      className="text-[10px] bg-muted border border-border rounded-md px-1.5 py-1 text-foreground cursor-pointer"
                    >
                      <option value="">Tag…</option>
                      <option value="ui_ux">UI/UX</option>
                      <option value="error">Error</option>
                      <option value="feature_request">Feature Request</option>
                      <option value="not_relevant">Not Relevant</option>
                      <option value="other">Other</option>
                    </select>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteFeedback.mutate(f.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ========== PAYMENTS TAB ========== */

const PRODUCT_LABELS: Record<string, string> = {
  dna_standard: "DNA Standard",
  dna_advanced: "DNA Advanced",
  dna_assessment: "DNA Assessment",
  subscription_individual: "Individual Plan",
  subscription_coach: "Coach Plan",
};

const PRODUCT_COLORS: Record<string, string> = {
  dna_standard: "bg-muted text-muted-foreground border-border",
  dna_advanced: "bg-primary/10 text-primary border-primary/20",
  dna_assessment: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  subscription_individual: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  subscription_coach: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const PaymentsTab = () => {
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["admin-dna-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dna_reviews" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as any[];
    },
  });

  const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const productCounts = payments.reduce((acc: Record<string, number>, p: any) => {
    const key = p.product || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "N/A";

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={CreditCard} label="Total Payments" value={payments.length} />
        <StatCard icon={CreditCard} label="Revenue" value={`£${(totalRevenue / 100).toFixed(2)}`} />
        <StatCard icon={Star} label="Avg Rating" value={avgRating} />
        <StatCard icon={Dna} label="Reviews" value={reviews.length} />
      </div>

      {/* Product breakdown */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Sales by Product</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(productCounts).sort(([,a],[,b]) => (b as number) - (a as number)).map(([product, count]) => (
            <div key={product} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <Badge variant="outline" className={`text-[10px] ${PRODUCT_COLORS[product] || ""}`}>
                {PRODUCT_LABELS[product] || product}
              </Badge>
              <span className="text-sm font-semibold text-foreground">{count as number}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DNA Reviews */}
      {reviews.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" /> DNA Report Reviews
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {reviews.map((r: any) => (
              <div key={r.id} className="border border-border/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">{r.rating}/5</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.note && <p className="text-xs text-muted-foreground mt-1">{r.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent payments list */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Recent Payments</h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {payments.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between border border-border/50 rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={`text-[10px] ${PRODUCT_COLORS[p.product] || ""}`}>
                  {PRODUCT_LABELS[p.product] || p.product || "Unknown"}
                </Badge>
                <span className="text-sm font-medium text-foreground">
                  {p.amount ? `£${(p.amount / 100).toFixed(2)}` : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
                  {p.event_type || "confirmed"}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {payments.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No payments yet.</p>}
        </div>
      </div>
    </div>
  );
};

/* ========== KNOWLEDGE BASE TAB ========== */

const KnowledgeBaseTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [migrating, setMigrating] = useState(false);
  const [enriching, setEnriching] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [enrichResults, setEnrichResults] = useState<any>(null);
  const [analyzingGaps, setAnalyzingGaps] = useState(false);
  const [gapResults, setGapResults] = useState<any>(null);
  const [addingGaps, setAddingGaps] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [auditSummary, setAuditSummary] = useState<any>(null);


  const { data: peptideCount } = useQuery({
    queryKey: ["kb-peptide-count"],
    queryFn: async () => {
      const { count } = await supabase.from("peptides_enriched").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: supplementCount } = useQuery({
    queryKey: ["kb-supplement-count"],
    queryFn: async () => {
      const { count } = await supabase.from("supplements_enriched").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: pendingPeptides } = useQuery({
    queryKey: ["kb-pending-peptides"],
    queryFn: async () => {
      const { count } = await supabase.from("peptides_enriched").select("*", { count: "exact", head: true }).eq("enrichment_status", "pending");
      return count || 0;
    },
  });

  const { data: pendingSupplements } = useQuery({
    queryKey: ["kb-pending-supplements"],
    queryFn: async () => {
      const { count } = await supabase.from("supplements_enriched").select("*", { count: "exact", head: true }).eq("enrichment_status", "pending");
      return count || 0;
    },
  });

  const { data: enrichedPeptides } = useQuery({
    queryKey: ["kb-enriched-peptides"],
    queryFn: async () => {
      const { count } = await supabase.from("peptides_enriched").select("*", { count: "exact", head: true }).eq("enrichment_status", "enriched");
      return count || 0;
    },
  });

  const { data: enrichedSupplements } = useQuery({
    queryKey: ["kb-enriched-supplements"],
    queryFn: async () => {
      const { count } = await supabase.from("supplements_enriched").select("*", { count: "exact", head: true }).eq("enrichment_status", "enriched");
      return count || 0;
    },
  });

  const runEnrichment = async (type: "peptides" | "supplements") => {
    setEnriching(type);
    setEnrichResults(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enrich-knowledge-base`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type, batch_size: 20 }),
        }
      );
      const data = await resp.json();
      setEnrichResults(data);
      if (data.error) {
        toast({ title: "Enrichment failed", description: data.error, variant: "destructive" });
      } else {
        toast({
          title: "Enrichment complete",
          description: `${data.enriched} enriched, ${data.failed} failed, ${data.remaining} remaining. Est. cost: $${data.estimated_cost_usd?.toFixed(2)}`,
        });
        queryClient.invalidateQueries({ queryKey: ["kb-"] });
      }
    } catch (e: any) {
      toast({ title: "Enrichment error", description: e.message, variant: "destructive" });
    } finally {
      setEnriching(null);
    }
  };

  const runGapAnalysis = async () => {
    setAnalyzingGaps(true);
    setGapResults(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/knowledge-gap-analysis`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const data = await resp.json();
      setGapResults(data);
      if (data.error) {
        toast({ title: "Gap analysis failed", description: data.error, variant: "destructive" });
      } else {
        toast({
          title: "Gap analysis complete",
          description: `Found ${data.missing_peptides?.length || 0} missing peptides and ${data.missing_supplements?.length || 0} missing supplements.`,
        });
      }
    } catch (e: any) {
      toast({ title: "Gap analysis error", description: e.message, variant: "destructive" });
    } finally {
      setAnalyzingGaps(false);
    }
  };

  const addGapItemsToDatabase = async () => {
    if (!gapResults) return;
    setAddingGaps(true);
    try {
      const peptides = (gapResults.missing_peptides || []).map((p: any) => ({
        name: p.name,
        fullName: p.full_name || null,
        category: p.category || null,
        description: p.rationale || null,
      }));
      const supplements = (gapResults.missing_supplements || []).map((s: any) => ({
        name: s.name,
        category: s.category || null,
        description: s.rationale || null,
      }));

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/migrate-knowledge-base`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ peptides, supplements }),
        }
      );
      const data = await resp.json();
      if (data.error) {
        toast({ title: "Failed to add items", description: data.error, variant: "destructive" });
      } else {
        toast({
          title: "Items added to database",
          description: `${data.peptides?.migrated || 0} peptides and ${data.supplements?.migrated || 0} supplements added with pending enrichment status.`,
        });
        queryClient.invalidateQueries({ queryKey: ["kb-"] });
      }
    } catch (e: any) {
      toast({ title: "Error adding items", description: e.message, variant: "destructive" });
    } finally {
      setAddingGaps(false);
    }
  };

  const runAudit = async () => {
    setAuditing(true);
    setAuditSummary(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/audit-knowledge-base`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const data = await resp.json();
      setAuditSummary(data);
      if (data.error) {
        toast({ title: "Audit failed", description: data.error, variant: "destructive" });
      } else {
        toast({
          title: "Audit complete",
          description: `${data.issues_found} issues found across ${data.total_records_audited} records.`,
        });
        queryClient.invalidateQueries({ queryKey: ["kb-audit-issues"] });
      }
    } catch (e: any) {
      toast({ title: "Audit error", description: e.message, variant: "destructive" });
    } finally {
      setAuditing(false);
    }
  };


  const runMigration = async () => {
    setMigrating(true);
    setResults(null);
    try {
      // Dynamic import of static data
      const { peptides } = await import("@/data/peptides");
      const { supplements } = await import("@/data/supplements");

      const peptidesPayload = peptides.map((p) => ({
        name: p.name,
        fullName: p.fullName,
        category: p.category,
        description: p.description,
        administration: p.administration,
        frequency: p.frequency,
        doseRange: p.doseRange,
        cycleDuration: p.cycleDuration,
        notes: p.notes,
        benefits: p.benefits,
        regulatoryStatus: p.regulatoryStatus,
      }));

      const supplementsPayload = supplements.map((s) => ({
        name: s.name,
        fullName: s.fullName,
        category: s.category,
        description: s.description,
        form: s.form,
        doseRange: s.doseRange,
        timing: s.timing,
        benefits: s.benefits,
        evidenceGrade: s.evidenceGrade,
        synergies: s.synergies,
        contraindications: s.contraindications,
        biomarkerTargets: s.biomarkerTargets,
        keyStudies: s.keyStudies,
        notes: s.notes,
      }));

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/migrate-knowledge-base`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ peptides: peptidesPayload, supplements: supplementsPayload }),
        }
      );

      const data = await resp.json();
      setResults(data);

      if (data.error) {
        toast({ title: "Migration failed", description: data.error, variant: "destructive" });
      } else {
        toast({
          title: "Migration complete",
          description: `Peptides: ${data.peptides?.migrated || 0} migrated. Supplements: ${data.supplements?.migrated || 0} migrated.`,
        });
      }
    } catch (e: any) {
      toast({ title: "Migration error", description: e.message, variant: "destructive" });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={FlaskConical} label="Peptides in DB" value={peptideCount ?? 0} />
        <StatCard icon={Sparkles} label="Supplements in DB" value={supplementCount ?? 0} />
        <StatCard icon={Clock} label="Peptides Pending" value={pendingPeptides ?? 0} />
        <StatCard icon={Clock} label="Supps Pending" value={pendingSupplements ?? 0} />
        <StatCard icon={CheckCircle} label="Peptides Enriched" value={enrichedPeptides ?? 0} />
        <StatCard icon={CheckCircle} label="Supps Enriched" value={enrichedSupplements ?? 0} />
      </div>

      {/* Enrichment Progress */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading font-semibold text-foreground mb-2">AI Enrichment</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Enriches next 5 pending records using AI. Adds mechanism of action, evidence grades, research refs, DNA signals, and more.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => runEnrichment("peptides")} disabled={!!enriching || (pendingPeptides ?? 0) === 0} className="gap-2">
            {enriching === "peptides" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
            {enriching === "peptides" ? "Enriching Peptides..." : `Enrich Peptides (${pendingPeptides ?? 0} pending)`}
          </Button>
          <Button onClick={() => runEnrichment("supplements")} disabled={!!enriching || (pendingSupplements ?? 0) === 0} className="gap-2" variant="secondary">
            {enriching === "supplements" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {enriching === "supplements" ? "Enriching Supplements..." : `Enrich Supplements (${pendingSupplements ?? 0} pending)`}
          </Button>
        </div>

        {enrichResults && !enrichResults.error && (
          <div className="mt-4 bg-muted/50 rounded-lg p-3 text-xs space-y-1">
            <p className="text-foreground font-semibold">Enrichment Results</p>
            <p className="text-muted-foreground">Enriched: {enrichResults.enriched} | Failed: {enrichResults.failed} | Remaining: {enrichResults.remaining}</p>
            <p className="text-muted-foreground">Est. cost: ${enrichResults.estimated_cost_usd?.toFixed(2)}</p>
            {enrichResults.errors?.length > 0 && (
              <div className="mt-1 text-destructive">{enrichResults.errors.join(", ")}</div>
            )}
          </div>
        )}
      </div>

      {/* Gap Analysis */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading font-semibold text-foreground mb-2">Knowledge Gap Analysis</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Uses AI to identify peptides and supplements missing from the database based on current research landscape.
        </p>
        <Button onClick={runGapAnalysis} disabled={analyzingGaps} className="gap-2" variant="outline">
          {analyzingGaps ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {analyzingGaps ? "Analysing Gaps..." : "Run Gap Analysis"}
        </Button>

        {gapResults && !gapResults.error && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Current DB: {gapResults.current_peptides} peptides, {gapResults.current_supplements} supplements
              </p>
              {((gapResults.missing_peptides?.length || 0) + (gapResults.missing_supplements?.length || 0)) > 0 && (
                <Button onClick={addGapItemsToDatabase} disabled={addingGaps} size="sm" className="gap-2">
                  {addingGaps ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  {addingGaps ? "Adding..." : `Add All ${(gapResults.missing_peptides?.length || 0) + (gapResults.missing_supplements?.length || 0)} to Database`}
                </Button>
              )}
            </div>

            {gapResults.missing_peptides?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Missing Peptides ({gapResults.missing_peptides.length})</p>
                <div className="space-y-2">
                  {gapResults.missing_peptides.map((p: any, i: number) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-3 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{p.name}</span>
                        {p.full_name && <span className="text-muted-foreground">({p.full_name})</span>}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          p.priority === "high" ? "bg-destructive/20 text-destructive" :
                          p.priority === "medium" ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" :
                          "bg-muted text-muted-foreground"
                        }`}>{p.priority}</span>
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">{p.category}</span>
                      </div>
                      <p className="text-muted-foreground">{p.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gapResults.missing_supplements?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Missing Supplements ({gapResults.missing_supplements.length})</p>
                <div className="space-y-2">
                  {gapResults.missing_supplements.map((s: any, i: number) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-3 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{s.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          s.priority === "high" ? "bg-destructive/20 text-destructive" :
                          s.priority === "medium" ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" :
                          "bg-muted text-muted-foreground"
                        }`}>{s.priority}</span>
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">{s.category}</span>
                      </div>
                      <p className="text-muted-foreground">{s.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading font-semibold text-foreground mb-2">Migrate Static Data → Database</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Upserts all peptides.ts and supplements.ts entries into the enriched tables. Safe to run multiple times (idempotent).
        </p>
        <Button onClick={runMigration} disabled={migrating} className="gap-2" variant="outline">
          {migrating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {migrating ? "Migrating..." : "Run Migration"}
        </Button>

        {results && !results.error && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-semibold text-foreground mb-1">Peptides</p>
              <p className="text-muted-foreground">Migrated: {results.peptides?.migrated}</p>
              <p className="text-muted-foreground">Errors: {results.peptides?.errors?.length || 0}</p>
              {results.peptides?.errors?.length > 0 && (
                <div className="mt-1 text-destructive">{results.peptides.errors.join(", ")}</div>
              )}
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-semibold text-foreground mb-1">Supplements</p>
              <p className="text-muted-foreground">Migrated: {results.supplements?.migrated}</p>
              <p className="text-muted-foreground">Errors: {results.supplements?.errors?.length || 0}</p>
              {results.supplements?.errors?.length > 0 && (
                <div className="mt-1 text-destructive">{results.supplements.errors.join(", ")}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* E2E Audit */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading font-semibold text-foreground mb-2">E2E Knowledge Base Audit</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Uses AI to audit all enriched records for factual errors, contradictions, missing safety data, and regulatory issues. Also checks articles for contradictions.
        </p>
        <Button onClick={runAudit} disabled={auditing} className="gap-2" variant="outline">
          {auditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
          {auditing ? "Auditing..." : "Run Full Audit"}
        </Button>

        {auditSummary && !auditSummary.error && (
          <div className="mt-4 bg-muted/50 rounded-lg p-3 text-xs space-y-1">
            <p className="font-semibold text-foreground">Audit Summary</p>
            <p className="text-muted-foreground">Records audited: {auditSummary.total_records_audited} | Fixes applied: {auditSummary.fixes_applied}{auditSummary.fixes_failed > 0 ? ` | Failed: ${auditSummary.fixes_failed}` : ""}</p>
            <div className="flex gap-3 mt-1">
              {auditSummary.critical > 0 && <span className="px-1.5 py-0.5 rounded bg-destructive/20 text-destructive text-[10px] font-medium">{auditSummary.critical} Critical</span>}
              {auditSummary.high > 0 && <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-700 dark:text-orange-400 text-[10px] font-medium">{auditSummary.high} High</span>}
              {auditSummary.medium > 0 && <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-[10px] font-medium">{auditSummary.medium} Medium</span>}
              {auditSummary.low > 0 && <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-medium">{auditSummary.low} Low</span>}
            </div>
            <p className="text-muted-foreground">Est. cost: ${auditSummary.estimated_cost_usd?.toFixed(2)}</p>

            {auditSummary.fix_details?.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="font-medium text-foreground text-[11px]">Fixes Applied:</p>
                {auditSummary.fix_details.map((fix: any, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground"><span className="text-foreground font-medium">{fix.name}</span> → {fix.field}: {fix.reason}</span>
                  </div>
                ))}
              </div>
            )}

            {auditSummary.article_notes?.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="font-medium text-foreground text-[11px]">Article Notes ({auditSummary.article_notes.length}):</p>
                {auditSummary.article_notes.map((note: any, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <BookOpen className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-muted-foreground">
                      <span className="text-foreground font-medium">{note.article_title}</span>
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium ${
                        note.type === "supplemental" ? "bg-primary/10 text-primary" :
                        note.type === "contrarian" ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" :
                        "bg-muted text-muted-foreground"
                      }`}>{note.type}</span>
                      <span className="ml-1.5 text-muted-foreground/80">re: {note.compound}</span>
                      <p className="mt-0.5">{note.perspective}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ========== USERS / ENGAGEMENT TAB ========== */

const UsersTab = () => {
  const { user } = useAuth();
  const { openUser } = useContext(UserDetailContext);

  const { data: stats, isLoading } = useQuery({
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

  const eng = stats?.engagement;
  if (!eng) return <p className="text-muted-foreground text-sm text-center py-12">No engagement data yet. Data will appear once users start visiting.</p>;

  const deviceData = Object.entries(eng.device_counts as Record<string, number>)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  const sessionData = Object.entries(eng.session_distribution as Record<string, number>)
    .map(([name, value]) => ({ name: name + " sessions", value }));

  const pwaVsBrowser = [
    { name: "PWA / Standalone", value: eng.pwa_users },
    { name: "Browser", value: eng.browser_users },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Eye} label="DAU (Today)" value={eng.dau} />
        <StatCard icon={Activity} label="WAU (7d)" value={eng.wau} />
        <StatCard icon={Users} label="MAU (30d)" value={eng.mau} />
        <StatCard icon={Smartphone} label="PWA Users" value={eng.pwa_users} />
        <StatCard icon={RotateCcw} label="Return Rate" value={`${eng.return_rate}%`} />
        <StatCard icon={Eye} label="Page Views (30d)" value={eng.total_page_views} />
      </div>

      {/* DAU Trend + PWA vs Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {eng.dau_trend?.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-heading font-semibold text-foreground text-sm mb-4">Daily Active Users (30 Days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={eng.dau_trend}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-4">PWA vs Browser</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={pwaVsBrowser} dataKey="value" cx="50%" cy="50%" outerRadius={70} stroke="none">
                  {pwaVsBrowser.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {pwaVsBrowser.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Device Types + Session Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" /> Device Breakdown
          </h3>
          {deviceData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={deviceData} dataKey="value" cx="50%" cy="50%" outerRadius={60} stroke="none">
                    {deviceData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5">
                {deviceData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[(i + 2) % COLORS.length] }} />
                    <span className="text-muted-foreground">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No device data yet.</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-primary" /> Session Frequency
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {eng.returning_users} of {eng.total_tracked} tracked users have returned ({eng.return_rate}%)
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={sessionData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" /> Top Pages (30 Days)
        </h3>
        {(eng.top_pages || []).length > 0 ? (
          <div className="space-y-1.5">
            {(eng.top_pages as { path: string; views: number }[]).map((p) => (
              <div key={p.path} className="flex items-center justify-between text-xs">
                <span className="text-foreground font-medium font-mono">{p.path}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 rounded-full bg-primary/20 w-24">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, (p.views / (eng.top_pages as any[])[0].views) * 100)}%` }} />
                  </div>
                  <span className="text-muted-foreground w-10 text-right">{p.views}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No page view data yet.</p>
        )}
      </div>

      {/* Most Active Users */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> Most Active Users (30 Days)
        </h3>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider border-b border-border">
                <th className="text-left py-1.5 pr-2">Email</th>
                <th className="text-right py-1.5 pr-2">Page Views</th>
                <th className="text-right py-1.5 pr-2">Sessions</th>
                <th className="text-center py-1.5">PWA</th>
              </tr>
            </thead>
            <tbody>
              {(eng.most_active_users as { userId: string; email: string; pageViews: number; sessions: number; isPwa: boolean }[]).map((u, i) => (
                <tr key={i} className="border-b border-border/30 last:border-0 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => openUser(u.userId, u.email)}>
                  <td className="py-1.5 pr-2 text-foreground font-medium">{u.email}</td>
                  <td className="py-1.5 pr-2 text-right text-muted-foreground">{u.pageViews}</td>
                  <td className="py-1.5 pr-2 text-right text-muted-foreground">{u.sessions}</td>
                  <td className="py-1.5 text-center">
                    {u.isPwa ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        <Smartphone className="h-3 w-3" /> Yes
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(eng.most_active_users || []).length === 0 && <p className="text-xs text-muted-foreground py-2">No activity data yet.</p>}
        </div>
      </div>
    </div>
  );
};

/* ========== MAIN PAGE ========== */

const AdminDashboard = () => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<{ userId: string; name: string } | null>(null);

  const openUser = (userId: string, name: string) => setSelectedUser({ userId, name });

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

          <UserDetailContext.Provider value={{ openUser }}>
            {selectedUser && (
              <div className="mb-6">
                <UserDetailPanel
                  userId={selectedUser.userId}
                  userName={selectedUser.name}
                  onClose={() => setSelectedUser(null)}
                />
              </div>
            )}

            <Tabs defaultValue="analytics" className="space-y-6">
              <TabsList className="w-auto overflow-x-auto no-scrollbar">
                <TabsTrigger value="analytics" className="gap-1.5">
                  <BarChart3 className="h-4 w-4" /> Analytics
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-1.5">
                  <Users className="h-4 w-4" /> Users
                </TabsTrigger>
                <TabsTrigger value="payments" className="gap-1.5">
                  <CreditCard className="h-4 w-4" /> Payments
                </TabsTrigger>
                <TabsTrigger value="content" className="gap-1.5">
                  <FileText className="h-4 w-4" /> Content
                </TabsTrigger>
                <TabsTrigger value="campaigns" className="gap-1.5">
                  <Megaphone className="h-4 w-4" /> Campaigns
                </TabsTrigger>
                <TabsTrigger value="feedback" className="gap-1.5">
                  <MessageSquare className="h-4 w-4" /> Feedback
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="gap-1.5">
                  <Sparkles className="h-4 w-4" /> Knowledge Base
                </TabsTrigger>
                <TabsTrigger value="research" className="gap-1.5">
                  <FlaskConical className="h-4 w-4" /> Research
                </TabsTrigger>
                <TabsTrigger value="marker-requests" className="gap-1.5">
                  <Droplets className="h-4 w-4" /> Marker Requests
                </TabsTrigger>
                <TabsTrigger value="coach-plans" className="gap-1.5">
                  <FlaskConical className="h-4 w-4" /> Coach Plans
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analytics">
                <AnalyticsTab />
              </TabsContent>
              <TabsContent value="users">
                <UsersTab />
              </TabsContent>
              <TabsContent value="payments">
                <PaymentsTab />
              </TabsContent>
              <TabsContent value="content">
                <ContentTab />
              </TabsContent>
              <TabsContent value="campaigns">
                <CampaignsTab />
              </TabsContent>
              <TabsContent value="feedback">
                <FeedbackTab />
              </TabsContent>
              <TabsContent value="knowledge">
                <KnowledgeBaseTab />
              </TabsContent>
              <TabsContent value="research">
                <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
                  <LazyResearchQueue embedded />
                </Suspense>
              </TabsContent>
              <TabsContent value="marker-requests">
                <MarkerRequestsTab />
              </TabsContent>
              <TabsContent value="coach-plans">
                <CoachPlanBuilder />
              </TabsContent>
            </Tabs>
          </UserDetailContext.Provider>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
