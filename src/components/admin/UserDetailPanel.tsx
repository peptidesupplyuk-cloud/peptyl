import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X, Loader2, User, Globe, FlaskConical, Activity, BookOpen, Droplets,
  Dna, Eye, Smartphone, Monitor, ArrowLeft,
} from "lucide-react";

interface Props {
  userId: string;
  userName: string;
  onClose: () => void;
}

const UserDetailPanel = ({ userId, userName, onClose }: Props) => {
  const [activeSection, setActiveSection] = useState<string>("overview");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-detail`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );
      if (!resp.ok) throw new Error("Failed to load user data");
      return resp.json();
    },
  });

  const sections = [
    { key: "overview", label: "Overview", icon: User },
    { key: "activity", label: "Activity", icon: Eye },
    { key: "protocols", label: "Protocols", icon: FlaskConical },
    { key: "injections", label: "Doses", icon: Activity },
    { key: "journal", label: "Journal", icon: BookOpen },
    { key: "bloodwork", label: "Bloodwork", icon: Droplets },
    { key: "dna", label: "DNA", icon: Dna },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div>
            <h2 className="font-heading font-semibold text-foreground text-sm">{userName}</h2>
            {data?.email && <p className="text-[11px] text-muted-foreground">{data.email}</p>}
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-border overflow-x-auto">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeSection === s.key
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <s.icon className="h-3 w-3" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5 max-h-[600px] overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && <p className="text-xs text-destructive text-center py-8">Failed to load user data.</p>}
        {data && (
          <>
            {activeSection === "overview" && <OverviewSection data={data} />}
            {activeSection === "activity" && <ActivitySection data={data} />}
            {activeSection === "protocols" && <ProtocolsSection data={data} />}
            {activeSection === "injections" && <InjectionsSection data={data} />}
            {activeSection === "journal" && <JournalSection data={data} />}
            {activeSection === "bloodwork" && <BloodworkSection data={data} />}
            {activeSection === "dna" && <DnaSection data={data} />}
          </>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-xs text-foreground font-medium">{value || "—"}</span>
  </div>
);

const OverviewSection = ({ data }: { data: any }) => {
  const p = data.profile;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Profile</p>
          <InfoRow label="Name" value={[p?.first_name, p?.last_name].filter(Boolean).join(" ") || p?.username} />
          <InfoRow label="Email" value={data.email} />
          <InfoRow label="Country" value={p?.country} />
          <InfoRow label="Age" value={p?.age} />
          <InfoRow label="Gender" value={p?.gender} />
          <InfoRow label="Signed up" value={p?.created_at ? new Date(p.created_at).toLocaleDateString() : "—"} />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Research Profile</p>
          <InfoRow label="Goal" value={p?.research_goal?.replace(/_/g, " ")} />
          <InfoRow label="Experience" value={p?.experience_level} />
          <InfoRow label="Risk tolerance" value={p?.risk_tolerance} />
          <InfoRow label="Biomarkers" value={p?.biomarker_availability} />
          <InfoRow label="Current compounds" value={p?.current_compounds} />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <StatBadge label="Protocols" value={data.protocols.length} />
        <StatBadge label="Doses logged" value={data.injection_summary.total} />
        <StatBadge label="Journal entries" value={data.journal.length} />
        <StatBadge label="Page views" value={data.activity_summary.total_page_views} />
      </div>
    </div>
  );
};

const StatBadge = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-muted/30 rounded-xl border border-border/50 px-3 py-2.5 text-center">
    <p className="text-lg font-heading font-bold text-foreground">{value}</p>
    <p className="text-[10px] text-muted-foreground">{label}</p>
  </div>
);

const ActivitySection = ({ data }: { data: any }) => {
  const a = data.activity_summary;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBadge label="Page views" value={a.total_page_views} />
        <StatBadge label="Sessions" value={a.unique_sessions} />
        <div className="bg-muted/30 rounded-xl border border-border/50 px-3 py-2.5 text-center">
          <div className="flex items-center justify-center gap-1">
            {a.is_pwa ? <Smartphone className="h-3.5 w-3.5 text-primary" /> : <Monitor className="h-3.5 w-3.5 text-muted-foreground" />}
            <p className="text-xs font-medium text-foreground capitalize">{a.device_type}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">{a.is_pwa ? "PWA" : "Browser"}</p>
        </div>
        <div className="bg-muted/30 rounded-xl border border-border/50 px-3 py-2.5 text-center">
          <p className="text-xs font-medium text-foreground">{a.last_seen ? new Date(a.last_seen).toLocaleString() : "—"}</p>
          <p className="text-[10px] text-muted-foreground">Last seen</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Top Pages</p>
        <div className="space-y-1">
          {(a.top_pages || []).map((p: any) => (
            <div key={p.path} className="flex items-center justify-between text-xs py-1 border-b border-border/20">
              <span className="text-foreground font-mono text-[11px]">{p.path}</span>
              <span className="text-muted-foreground">{p.views} views</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recent Activity</p>
        <div className="space-y-0.5 max-h-[250px] overflow-y-auto">
          {(a.recent_activity || []).map((act: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-[11px] py-1 border-b border-border/20">
              <span className="text-foreground font-mono">{act.page_path}</span>
              <span className="text-muted-foreground whitespace-nowrap">{new Date(act.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProtocolsSection = ({ data }: { data: any }) => {
  if (data.protocols.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-8">No protocols created.</p>;
  }
  return (
    <div className="space-y-3">
      {data.protocols.map((proto: any) => {
        const peptides = (data.protocol_peptides || []).filter((pp: any) => pp.protocol_id === proto.id);
        return (
          <div key={proto.id} className="border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{proto.name}</h3>
              <Badge variant="outline" className="text-[10px] capitalize">{proto.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span>Goal: {proto.goal || "—"}</span>
              <span>•</span>
              <span>Created: {new Date(proto.created_at).toLocaleDateString()}</span>
              {proto.start_date && <><span>•</span><span>Start: {proto.start_date}</span></>}
              {proto.end_date && <><span>•</span><span>End: {proto.end_date}</span></>}
            </div>
            {peptides.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {peptides.map((pp: any) => (
                  <span key={pp.id} className="text-[10px] px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10">
                    {pp.peptide_name} — {pp.dose_mcg}mcg {pp.frequency} ({pp.route})
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const InjectionsSection = ({ data }: { data: any }) => {
  const s = data.injection_summary;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBadge label="Total" value={s.total} />
        <StatBadge label="Completed" value={s.completed} />
        <StatBadge label="Missed" value={s.missed} />
        <StatBadge label="Skipped" value={s.skipped} />
      </div>
      {s.recent.length > 0 ? (
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recent Doses</p>
          {s.recent.map((inj: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/20">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[9px] ${
                  inj.status === "completed" ? "bg-green-500/10 text-green-600" :
                  inj.status === "skipped" ? "bg-yellow-500/10 text-yellow-600" :
                  "bg-red-500/10 text-red-600"
                }`}>{inj.status}</Badge>
                <span className="text-foreground font-medium">{inj.peptide_name}</span>
                <span className="text-muted-foreground">{inj.dose_mcg}mcg</span>
              </div>
              <span className="text-muted-foreground whitespace-nowrap text-[11px]">{new Date(inj.scheduled_time).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-6">No doses logged.</p>
      )}
    </div>
  );
};

const JournalSection = ({ data }: { data: any }) => {
  if (data.journal.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-8">No journal entries.</p>;
  }
  return (
    <div className="space-y-3">
      {data.journal.map((j: any) => (
        <div key={j.id} className="border border-border/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">{new Date(j.created_at).toLocaleString()}</span>
          </div>
          <p className="text-xs text-foreground">{j.content}</p>
          {j.summary && <p className="text-[11px] text-muted-foreground mt-1 italic">{j.summary}</p>}
          {Array.isArray(j.peptides) && j.peptides.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {j.peptides.map((p: string) => (
                <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/10">{p}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const BloodworkSection = ({ data }: { data: any }) => {
  if (data.bloodwork.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-8">No bloodwork panels.</p>;
  }
  return (
    <div className="space-y-2">
      {data.bloodwork.map((b: any) => (
        <div key={b.id} className="flex items-center justify-between border border-border/50 rounded-lg p-3">
          <div>
            <p className="text-xs font-medium text-foreground">{b.panel_name}</p>
            <p className="text-[11px] text-muted-foreground">{b.panel_type || "—"}</p>
          </div>
          <span className="text-[11px] text-muted-foreground">{b.test_date || new Date(b.created_at).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
};

const DnaSection = ({ data }: { data: any }) => {
  if (data.dna_reports.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-8">No DNA reports.</p>;
  }
  return (
    <div className="space-y-2">
      {data.dna_reports.map((d: any) => (
        <div key={d.id} className="flex items-center justify-between border border-border/50 rounded-lg p-3">
          <div>
            <p className="text-xs font-medium text-foreground">DNA Report</p>
            <p className="text-[11px] text-muted-foreground">Method: {d.input_method} • Score: {d.overall_score ?? "—"}</p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="text-[9px] capitalize">{d.pipeline_status}</Badge>
            <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(d.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserDetailPanel;
