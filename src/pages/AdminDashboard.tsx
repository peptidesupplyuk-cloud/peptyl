import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { AlertTriangle, Users, Globe, Target, Mail, Activity, FlaskConical, Droplets, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const ADMIN_EMAIL = "peptidesupplyuk@gmail.com";

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
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#22d3ee",
  "#a78bfa",
  "#f97316",
  "#10b981",
  "#f43f5e",
  "#6366f1",
  "#eab308",
  "#ec4899",
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

const AdminDashboard = () => {
  const { user } = useAuth();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!resp.ok) throw new Error("Failed to load stats");
      return resp.json();
    },
    enabled: user?.email === ADMIN_EMAIL,
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16 flex items-center justify-center">
          <p className="text-destructive text-sm">Failed to load dashboard data.</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Prepare chart data
  const countryData = Object.entries(stats.by_country as Record<string, number>)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const goalData = Object.entries(stats.by_goal as Record<string, number>)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name: GOAL_LABELS[name] || name, value }));

  const signupData = Object.entries(stats.signups_by_day as Record<string, number>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: date.slice(5), count }));

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Admin Dashboard" description="Platform analytics and user insights." path="/admin/dashboard" />
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Admin <span className="text-gradient-teal">Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">User analytics, demographics, and platform activity.</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <StatCard icon={Users} label="Total Users" value={stats.total_users} />
            <StatCard icon={Globe} label="Countries" value={Object.keys(stats.by_country).filter(c => c !== "Not specified").length} />
            <StatCard icon={FlaskConical} label="Protocols Created" value={stats.total_protocols} />
            <StatCard icon={Activity} label="Protocol Users" value={stats.active_protocol_users} />
            <StatCard icon={Droplets} label="Bloodwork Panels" value={stats.total_bloodwork_panels} />
            <StatCard icon={Mail} label="Contact Messages" value={stats.total_contact_submissions} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Signups over time */}
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

            {/* Users by country */}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Research goals pie chart */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-heading font-semibold text-foreground text-sm mb-4">Research Interests</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={goalData} dataKey="value" cx="50%" cy="50%" outerRadius={70} stroke="none">
                      {goalData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
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

            {/* Recent signups */}
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
                {(stats.recent_signups || []).length === 0 && (
                  <p className="text-xs text-muted-foreground">No signups yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact submissions */}
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
              {(stats.recent_contacts || []).length === 0 && (
                <p className="text-xs text-muted-foreground">No contact submissions yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
