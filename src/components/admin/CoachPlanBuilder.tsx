import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Trash2, Loader2, Save, Calculator, AlertTriangle, FileText,
  Beaker, Calendar, User, Pill, Syringe, Eye, ArrowLeft, Printer, Copy, Mail,
} from "lucide-react";

function exportPlanToPrintable(plan: any) {
  const peptidesHtml = (plan.peptides as any[] || []).map((p: any) => {
    const benefitsHtml = p.benefits?.length
      ? `<div class="chips-row">
          <div class="chips-label">Benefits</div>
          <div class="chips">${p.benefits.map((b: string) => `<span class="chip chip-primary">${b}</span>`).join("")}</div>
        </div>` : "";
    const sideHtml = p.side_effects_common?.length
      ? `<div class="chips-row">
          <div class="chips-label warn">Common Side Effects</div>
          <div class="chips">${p.side_effects_common.map((s: string) => `<span class="chip chip-warn">${s}</span>`).join("")}</div>
        </div>` : "";
    const contraHtml = p.contraindications?.length
      ? `<div class="chips-row">
          <div class="chips-label danger">Contraindications</div>
          <div class="chips">${p.contraindications.map((c: string) => `<span class="chip chip-danger">${c}</span>`).join("")}</div>
        </div>` : "";
    return `
      <div class="peptide-card">
        <div class="peptide-head">
          <div>
            <div class="peptide-name">${p.peptide_name}</div>
            ${p.category ? `<div class="peptide-cat">${p.category}</div>` : ""}
          </div>
          <div class="peptide-tags">
            <span class="tag tag-outline">${p.frequency}</span>
            ${p.evidence_grade ? `<span class="tag">Evidence: ${p.evidence_grade}</span>` : ""}
          </div>
        </div>

        <div class="metrics">
          <div class="metric"><div class="metric-label">Dose</div><div class="metric-value">${p.dose_mg} <span>mg</span></div></div>
          <div class="metric"><div class="metric-label">Vial</div><div class="metric-value">${p.vial_strength_mg}<span> mg</span></div><div class="metric-sub">${p.bac_water_ml} ml BAC</div></div>
          <div class="metric metric-hero"><div class="metric-label">Clicks / dose</div><div class="metric-value">${p.calc?.clicks ?? "—"}</div><div class="metric-sub">${p.calc?.volumeMl ?? "—"} ml</div></div>
          <div class="metric"><div class="metric-label">Doses / vial</div><div class="metric-value">${p.calc?.dosesPerVial ?? "—"}</div></div>
        </div>

        ${benefitsHtml}
        ${p.mechanism ? `<div class="text-block"><div class="block-label">Mechanism of Action</div><p>${p.mechanism}</p></div>` : ""}
        ${sideHtml}
        ${contraHtml}
        ${p.notes ? `<div class="coach-note"><strong>Coach note:</strong> ${p.notes}</div>` : ""}
      </div>
    `;
  }).join("");

  const supplementsHtml = (plan.supplements as any[] || []).length
    ? `<section><h2>Supplement Stack</h2>
        <table class="data-table">
          <thead><tr><th>Supplement</th><th>Dose</th><th>Frequency</th><th>Timing</th></tr></thead>
          <tbody>${(plan.supplements as any[]).map((s: any) => `<tr><td><strong>${s.name}</strong></td><td>${s.dose}</td><td>${s.frequency}</td><td>${s.timing}</td></tr>`).join("")}</tbody>
        </table></section>` : "";

  const titrationHtml = (plan.titration_schedule as any[] || []).length
    ? `<section><h2>Titration Schedule</h2>
        <table class="data-table">
          <thead><tr><th>Week</th><th>Dose</th><th>Note</th></tr></thead>
          <tbody>${(plan.titration_schedule as any[]).map((t: any) => `<tr><td><strong>Week ${t.week}</strong></td><td>${t.dose_mg} mg</td><td>${t.note || "—"}</td></tr>`).join("")}</tbody>
        </table></section>` : "";

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>${plan.client_name} — Bespoke Plan • Peptyl</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --teal: #14b8a6;
    --teal-dark: #0d9488;
    --teal-light: #5eead4;
    --bg: #fafafa;
    --ink: #0a0a0a;
    --ink-soft: #404040;
    --muted: #737373;
    --border: #e5e5e5;
    --surface: #ffffff;
    --warn: #d97706;
    --danger: #dc2626;
  }
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, sans-serif; color: var(--ink); background: var(--bg); line-height: 1.55; -webkit-font-smoothing: antialiased; }

  .page { max-width: 210mm; margin: 0 auto; background: var(--surface); }

  /* ==== HERO ==== */
  .hero {
    background: linear-gradient(135deg, #0f172a 0%, #134e4a 60%, #0d9488 100%);
    color: white;
    padding: 48px 56px 56px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: ""; position: absolute; top: -50%; right: -20%; width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(94,234,212,0.25) 0%, transparent 70%);
    pointer-events: none;
  }
  .brand {
    display: flex; align-items: center; gap: 10px; font-size: 13px;
    letter-spacing: 3px; text-transform: uppercase; font-weight: 600;
    color: var(--teal-light); margin-bottom: 32px; position: relative;
  }
  .brand-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--teal-light); box-shadow: 0 0 12px var(--teal-light); }
  .hero h1 { font-size: 42px; font-weight: 800; letter-spacing: -1px; margin-bottom: 8px; position: relative; }
  .hero-sub { font-size: 14px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 2px; font-weight: 500; margin-bottom: 28px; position: relative; }
  .hero-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; position: relative; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.15); }
  .hero-meta-item .label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.55); margin-bottom: 4px; }
  .hero-meta-item .value { font-size: 15px; font-weight: 600; color: white; }
  .hero-goal { display: inline-block; padding: 6px 14px; background: rgba(94,234,212,0.15); border: 1px solid rgba(94,234,212,0.4); color: var(--teal-light); border-radius: 999px; font-size: 12px; font-weight: 600; margin-top: 12px; position: relative; }

  /* ==== CONTENT ==== */
  .content { padding: 48px 56px; }
  section { margin-bottom: 40px; page-break-inside: avoid; }
  section h2 {
    font-size: 11px; text-transform: uppercase; letter-spacing: 3px; font-weight: 700;
    color: var(--teal-dark); margin-bottom: 16px;
    padding-bottom: 10px; border-bottom: 2px solid var(--teal);
    display: flex; align-items: center; gap: 8px;
  }

  /* ==== PEPTIDE CARDS ==== */
  .peptide-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 4px solid var(--teal);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 16px;
    page-break-inside: avoid;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .peptide-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 12px; }
  .peptide-name { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
  .peptide-cat { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: var(--muted); margin-top: 2px; }
  .peptide-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .tag { padding: 4px 10px; background: #f5f5f5; color: var(--ink-soft); border-radius: 6px; font-size: 11px; font-weight: 600; }
  .tag-outline { background: transparent; border: 1px solid var(--teal); color: var(--teal-dark); }

  .metrics {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;
    padding: 16px; background: #fafafa; border-radius: 10px;
  }
  .metric-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 4px; font-weight: 600; }
  .metric-value { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: var(--ink); }
  .metric-value span { font-size: 12px; font-weight: 500; color: var(--muted); }
  .metric-sub { font-size: 10px; color: var(--muted); margin-top: 2px; }
  .metric-hero { background: linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%); border-radius: 8px; padding: 12px; margin: -4px; color: white; }
  .metric-hero .metric-label { color: rgba(255,255,255,0.8); }
  .metric-hero .metric-value { color: white; font-size: 26px; }
  .metric-hero .metric-sub { color: rgba(255,255,255,0.85); }

  .chips-row { margin-top: 14px; }
  .chips-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--teal-dark); font-weight: 700; margin-bottom: 6px; }
  .chips-label.warn { color: var(--warn); }
  .chips-label.danger { color: var(--danger); }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; background: #f5f5f5; color: var(--ink-soft); }
  .chip-primary { background: rgba(20,184,166,0.1); color: var(--teal-dark); border: 1px solid rgba(20,184,166,0.2); }
  .chip-warn { background: rgba(217,119,6,0.08); color: var(--warn); border: 1px solid rgba(217,119,6,0.2); }
  .chip-danger { background: rgba(220,38,38,0.08); color: var(--danger); border: 1px solid rgba(220,38,38,0.2); }

  .text-block { margin-top: 14px; }
  .block-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); font-weight: 700; margin-bottom: 4px; }
  .text-block p { font-size: 13px; color: var(--ink-soft); line-height: 1.6; }

  .coach-note {
    margin-top: 14px; padding: 12px 14px; background: rgba(20,184,166,0.06);
    border-left: 3px solid var(--teal); border-radius: 4px; font-size: 13px; color: var(--ink-soft);
  }

  /* ==== TABLES ==== */
  .data-table { width: 100%; border-collapse: collapse; background: var(--surface); border-radius: 8px; overflow: hidden; border: 1px solid var(--border); }
  .data-table th { background: #fafafa; padding: 10px 14px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); font-weight: 700; border-bottom: 1px solid var(--border); }
  .data-table td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid var(--border); }
  .data-table tr:last-child td { border-bottom: 0; }

  /* ==== INFO BLOCKS ==== */
  .info-block { padding: 18px 20px; border-radius: 10px; background: #fafafa; border: 1px solid var(--border); white-space: pre-wrap; font-size: 13px; color: var(--ink-soft); line-height: 1.6; }
  .info-block.safety { background: linear-gradient(135deg, rgba(217,119,6,0.04), rgba(217,119,6,0.08)); border: 1px solid rgba(217,119,6,0.3); border-left: 4px solid var(--warn); }
  .info-block.safety .safety-title { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: var(--warn); font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }

  .pill-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .pill-list .chip { background: rgba(20,184,166,0.1); color: var(--teal-dark); border: 1px solid rgba(20,184,166,0.2); }

  /* ==== FOOTER ==== */
  .footer {
    margin-top: 48px; padding: 24px 56px 36px; background: #0a0a0a; color: rgba(255,255,255,0.6);
    font-size: 11px; line-height: 1.6;
  }
  .footer-brand { color: var(--teal-light); font-weight: 700; letter-spacing: 2px; text-transform: uppercase; font-size: 10px; margin-bottom: 6px; }
  .footer-disclaim { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 8px; }

  /* ==== ACTIONS (hidden on print) ==== */
  .actions {
    position: sticky; top: 0; z-index: 100; background: rgba(10,10,10,0.95); backdrop-filter: blur(10px);
    padding: 14px 56px; display: flex; gap: 10px; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .actions-brand { color: var(--teal-light); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; }
  .actions-buttons { display: flex; gap: 8px; }
  .btn { background: var(--teal); color: white; border: 0; padding: 9px 18px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; font-family: inherit; transition: all 0.15s; }
  .btn:hover { background: var(--teal-dark); }
  .btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: white; }
  .btn-ghost:hover { background: rgba(255,255,255,0.1); }

  @media print {
    .actions { display: none; }
    body { background: white; }
    .page { max-width: 100%; }
    .footer { background: #0a0a0a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .hero { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .metric-hero { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .chip-primary, .chip-warn, .chip-danger { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style></head>
<body>
  <div class="actions">
    <span class="actions-brand">◆ Peptyl</span>
    <div class="actions-buttons">
      <button class="btn" onclick="window.print()">Save as PDF</button>
      <button class="btn btn-ghost" onclick="window.close()">Close</button>
    </div>
  </div>

  <div class="page">
    <header class="hero">
      <div class="brand"><span class="brand-dot"></span> Peptyl • Bespoke Coach Plan</div>
      <h1>${plan.client_name}</h1>
      <div class="hero-sub">Personalised Protocol</div>
      ${plan.goal ? `<div class="hero-goal">◆ ${plan.goal}</div>` : ""}
      <div class="hero-meta">
        <div class="hero-meta-item"><div class="label">Status</div><div class="value">${(plan.status || "draft").toUpperCase()}</div></div>
        <div class="hero-meta-item"><div class="label">Start</div><div class="value">${plan.start_date || "—"}</div></div>
        <div class="hero-meta-item"><div class="label">End</div><div class="value">${plan.end_date || "Ongoing"}</div></div>
      </div>
    </header>

    <main class="content">
      ${peptidesHtml ? `<section><h2>◆ Peptide Protocol</h2>${peptidesHtml}</section>` : ""}
      ${supplementsHtml}
      ${titrationHtml}

      ${plan.injection_sites?.length ? `<section><h2>◆ Injection Sites</h2><div class="pill-list">${plan.injection_sites.map((s: string) => `<span class="chip">${s}</span>`).join("")}</div></section>` : ""}
      ${plan.timing_notes ? `<section><h2>◆ Timing Instructions</h2><div class="info-block">${plan.timing_notes}</div></section>` : ""}
      ${plan.safety_notes ? `<section><div class="info-block safety"><div class="safety-title">⚠ Safety Notes</div>${plan.safety_notes}</div></section>` : ""}
      ${plan.coach_rationale ? `<section><h2>◆ Coach Rationale</h2><div class="info-block">${plan.coach_rationale}</div></section>` : ""}
      ${plan.client_notes ? `<section><h2>◆ Notes for Client</h2><div class="info-block">${plan.client_notes}</div></section>` : ""}
    </main>

    <footer class="footer">
      <div class="footer-brand">◆ Peptyl • Health Intelligence</div>
      <div>Generated ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} at ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
      <div class="footer-disclaim">This protocol is provided for research and educational purposes only and does not constitute medical advice. All compounds referenced are intended for in-vitro research use under the Human Medicines Regulations 2012 (UK). Consult a qualified healthcare professional before commencing any protocol.</div>
    </footer>
  </div>
</body></html>`;

  const win = window.open("", "_blank", "width=1000,height=1200");
  if (!win) {
    alert("Please allow pop-ups to export the plan.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

function planToPlainText(plan: any): string {
  const lines: string[] = [];
  lines.push(`BESPOKE PLAN — ${plan.client_name}`);
  lines.push("=".repeat(50));
  if (plan.goal) lines.push(`Goal: ${plan.goal}`);
  if (plan.start_date || plan.end_date) lines.push(`Duration: ${plan.start_date || "—"} → ${plan.end_date || "ongoing"}`);
  lines.push("");
  if ((plan.peptides as any[])?.length) {
    lines.push("PEPTIDES");
    lines.push("-".repeat(50));
    (plan.peptides as any[]).forEach((p: any) => {
      lines.push(`• ${p.peptide_name} — ${p.dose_mg} mg ${p.frequency}`);
      lines.push(`  Vial: ${p.vial_strength_mg} mg in ${p.bac_water_ml} ml BAC`);
      if (p.calc) lines.push(`  → ${p.calc.clicks} clicks per dose (${p.calc.volumeMl} ml) • ${p.calc.dosesPerVial} doses/vial`);
      if (p.notes) lines.push(`  Notes: ${p.notes}`);
      lines.push("");
    });
  }
  if ((plan.supplements as any[])?.length) {
    lines.push("SUPPLEMENTS");
    lines.push("-".repeat(50));
    (plan.supplements as any[]).forEach((s: any) => lines.push(`• ${s.name} — ${s.dose}, ${s.frequency} (${s.timing})`));
    lines.push("");
  }
  if (plan.safety_notes) { lines.push("SAFETY NOTES"); lines.push("-".repeat(50)); lines.push(plan.safety_notes); lines.push(""); }
  if (plan.coach_rationale) { lines.push("COACH RATIONALE"); lines.push("-".repeat(50)); lines.push(plan.coach_rationale); lines.push(""); }
  lines.push("---");
  lines.push("For research and educational purposes only. Not medical advice.");
  return lines.join("\n");
}

const FREQUENCIES = [
  "Once daily", "Twice daily", "Once weekly", "Twice weekly", "3x per week",
  "5x per week", "Every other day", "Once monthly",
];

const INJECTION_SITES = ["Abdomen", "Thigh", "Upper arm", "Glute", "Subcutaneous (any)"];

interface PeptideEntry {
  peptide_name: string;
  peptyl_id?: string;
  dose_mg: number;            // dose per administration in mg
  frequency: string;
  vial_strength_mg: number;   // total mg in vial
  bac_water_ml: number;       // ml of BAC water used to reconstitute
  ml_per_click: number;       // 0.01 by default
  timing: string;
  route: string;
  notes: string;
}

interface SupplementEntry {
  name: string;
  dose: string;
  frequency: string;
  timing: string;
}

interface TitrationStep {
  week: number;
  dose_mg: number;
  note: string;
}

const blankPeptide = (): PeptideEntry => ({
  peptide_name: "",
  peptyl_id: undefined,
  dose_mg: 0,
  frequency: "Once weekly",
  vial_strength_mg: 0,
  bac_water_ml: 2,
  ml_per_click: 0.01,
  timing: "AM",
  route: "Subcutaneous",
  notes: "",
});

/**
 * Calculate clicks per dose for a pen where each click = ml_per_click ml.
 * Concentration (mg/ml) = vial_strength_mg / bac_water_ml
 * Volume needed (ml)    = dose_mg / concentration
 * Clicks                = Volume / ml_per_click
 */
function calcClicks(p: PeptideEntry) {
  if (!p.dose_mg || !p.vial_strength_mg || !p.bac_water_ml || !p.ml_per_click) return null;
  const concentration = p.vial_strength_mg / p.bac_water_ml; // mg per ml
  const volumeMl = p.dose_mg / concentration;
  const clicks = volumeMl / p.ml_per_click;
  return {
    concentration: +concentration.toFixed(3),
    volumeMl: +volumeMl.toFixed(4),
    clicks: +clicks.toFixed(1),
    dosesPerVial: Math.floor(p.vial_strength_mg / p.dose_mg),
  };
}

const CoachPlanBuilder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [mode, setMode] = useState<"list" | "create" | "view">("list");
  const [viewingId, setViewingId] = useState<string | null>(null);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [peptides, setPeptides] = useState<PeptideEntry[]>([blankPeptide()]);
  const [supplements, setSupplements] = useState<SupplementEntry[]>([]);
  const [titration, setTitration] = useState<TitrationStep[]>([]);
  const [sites, setSites] = useState<string[]>([]);
  const [timingNotes, setTimingNotes] = useState("");
  const [safetyNotes, setSafetyNotes] = useState("");
  const [coachRationale, setCoachRationale] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  // Pull peptide library for autocomplete + safety auto-fill
  const { data: peptideLibrary } = useQuery({
    queryKey: ["coach-peptide-library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("peptides_enriched")
        .select("peptyl_id, name, full_name, category, dose_range, frequency, dosing_notes, side_effects_common, side_effects_rare, contraindications, drug_interactions, mechanism_of_action, primary_effects, cycle_duration, evidence_grade")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["coach-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_plans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: viewingPlanRaw } = useQuery({
    queryKey: ["coach-plan", viewingId],
    enabled: !!viewingId,
    queryFn: async () => {
      const { data, error } = await supabase.from("coach_plans").select("*").eq("id", viewingId).single();
      if (error) throw error;
      return data;
    },
  });

  // Hydrate peptides with enrichment data from the library so older plans
  // (saved before enrichment was added) still show benefits / mechanism / side effects.
  const viewingPlan = useMemo(() => {
    if (!viewingPlanRaw) return null;
    const plan: any = { ...viewingPlanRaw };
    plan.peptides = ((plan.peptides as any[]) || []).map((p: any) => {
      const lib = peptideLibrary?.find(
        (l) => l.peptyl_id === p.peptyl_id || l.name?.toLowerCase() === p.peptide_name?.toLowerCase()
      );
      if (!lib) return p;
      return {
        ...p,
        benefits: p.benefits?.length ? p.benefits : lib.primary_effects || [],
        mechanism: p.mechanism || lib.mechanism_of_action || null,
        side_effects_common: p.side_effects_common?.length ? p.side_effects_common : lib.side_effects_common || [],
        side_effects_rare: p.side_effects_rare?.length ? p.side_effects_rare : lib.side_effects_rare || [],
        contraindications: p.contraindications?.length ? p.contraindications : lib.contraindications || [],
        drug_interactions: p.drug_interactions?.length ? p.drug_interactions : lib.drug_interactions || [],
        evidence_grade: p.evidence_grade || lib.evidence_grade || null,
        category: p.category || lib.category || null,
        cycle_duration: p.cycle_duration || lib.cycle_duration || null,
      };
    });
    return plan;
  }, [viewingPlanRaw, peptideLibrary]);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (!clientName.trim()) throw new Error("Client name is required");

      const { error } = await supabase.from("coach_plans").insert({
        created_by: user.id,
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || null,
        client_notes: clientNotes.trim() || null,
        goal: goal.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
        status: "draft",
        peptides: peptides.map((p) => {
          const lib = peptideLibrary?.find((l) => l.peptyl_id === p.peptyl_id);
          return {
            ...p,
            calc: calcClicks(p),
            benefits: lib?.primary_effects || [],
            mechanism: lib?.mechanism_of_action || null,
            side_effects_common: lib?.side_effects_common || [],
            side_effects_rare: lib?.side_effects_rare || [],
            contraindications: lib?.contraindications || [],
            drug_interactions: lib?.drug_interactions || [],
            evidence_grade: lib?.evidence_grade || null,
            category: lib?.category || null,
            cycle_duration: lib?.cycle_duration || null,
          };
        }) as any,
        supplements: supplements as any,
        titration_schedule: titration as any,
        injection_sites: sites,
        timing_notes: timingNotes.trim() || null,
        safety_notes: safetyNotes.trim() || null,
        coach_rationale: coachRationale.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Plan saved", description: `Bespoke plan created for ${clientName}.` });
      qc.invalidateQueries({ queryKey: ["coach-plans"] });
      resetForm();
      setMode("list");
    },
    onError: (err: any) => {
      toast({ title: "Failed to save plan", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coach_plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coach-plans"] });
      toast({ title: "Plan deleted" });
    },
  });

  function resetForm() {
    setClientName(""); setClientEmail(""); setGoal(""); setStartDate(""); setEndDate("");
    setPeptides([blankPeptide()]); setSupplements([]); setTitration([]); setSites([]);
    setTimingNotes(""); setSafetyNotes(""); setCoachRationale(""); setClientNotes("");
  }

  function applyPeptideTemplate(idx: number, peptylId: string) {
    const lib = peptideLibrary?.find((p) => p.peptyl_id === peptylId);
    if (!lib) return;
    const next = [...peptides];
    next[idx] = {
      ...next[idx],
      peptide_name: lib.name,
      peptyl_id: lib.peptyl_id,
    };
    setPeptides(next);

    // Auto-append safety info to safety_notes if empty
    if (!safetyNotes && lib.side_effects_common?.length) {
      const lines = [
        `[${lib.name}] Common side effects: ${(lib.side_effects_common || []).join(", ")}.`,
        lib.contraindications?.length ? `Contraindications: ${lib.contraindications.join(", ")}.` : "",
        lib.drug_interactions?.length ? `Drug interactions: ${lib.drug_interactions.join(", ")}.` : "",
      ].filter(Boolean).join(" ");
      setSafetyNotes(lines);
    }
  }

  // ===== LIST VIEW =====
  if (mode === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-semibold text-foreground">Coach Plan Builder</h2>
            <p className="text-sm text-muted-foreground">Bespoke client protocols with auto-calculated clicks per pen.</p>
          </div>
          <Button onClick={() => { resetForm(); setMode("create"); }} className="gap-2">
            <Plus className="h-4 w-4" /> New Plan
          </Button>
        </div>

        {plansLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !plans?.length ? (
          <Card className="p-12 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No bespoke plans yet. Click "New Plan" to create one.</p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {plans.map((plan: any) => (
              <Card key={plan.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{plan.client_name}</h3>
                    {plan.goal && <Badge variant="outline" className="text-[10px]">{plan.goal}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(plan.peptides as any[])?.length || 0} peptide(s) • {(plan.supplements as any[])?.length || 0} supplement(s) • Created {new Date(plan.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setViewingId(plan.id); setMode("view"); }} className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Delete plan for ${plan.client_name}?`)) deleteMutation.mutate(plan.id); }} className="gap-1.5 text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ===== VIEW MODE =====
  if (mode === "view" && viewingPlan) {
    const plan = viewingPlan as any;
    return (
      <div className="space-y-5">
        <Button variant="ghost" size="sm" onClick={() => { setMode("list"); setViewingId(null); }} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to plans
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="default" onClick={() => exportPlanToPrintable(plan)} className="gap-2">
            <Printer className="h-4 w-4" /> Export / Print PDF
          </Button>
          <Button size="sm" variant="outline" onClick={async () => {
            await navigator.clipboard.writeText(planToPlainText(plan));
            toast({ title: "Copied to clipboard", description: "Plan copied as plain text — paste into any message." });
          }} className="gap-2">
            <Copy className="h-4 w-4" /> Copy as Text
          </Button>
          {plan.client_email && (
            <Button size="sm" variant="outline" asChild className="gap-2">
              <a href={`mailto:${plan.client_email}?subject=${encodeURIComponent(`Your bespoke plan — ${plan.client_name}`)}&body=${encodeURIComponent(planToPlainText(plan))}`}>
                <Mail className="h-4 w-4" /> Email Client
              </a>
            </Button>
          )}
        </div>
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-heading font-semibold">{plan.client_name}</h2>
              {plan.client_email && <p className="text-sm text-muted-foreground">{plan.client_email}</p>}
              {plan.goal && <Badge className="mt-2">{plan.goal}</Badge>}
            </div>
            <Badge variant="secondary">{plan.status}</Badge>
          </div>
          {(plan.start_date || plan.end_date) && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {plan.start_date || "—"} → {plan.end_date || "ongoing"}
            </p>
          )}
        </Card>

        {(plan.peptides as any[])?.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Syringe className="h-4 w-4 text-primary" /> Peptide Protocol</h3>
            <div className="space-y-3">
              {(plan.peptides as any[]).map((p, i) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-semibold">{p.peptide_name}</h4>
                      {p.category && <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.category}</p>}
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge variant="outline">{p.frequency}</Badge>
                      {p.evidence_grade && <Badge variant="secondary" className="text-[10px]">Evidence: {p.evidence_grade}</Badge>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div><p className="text-muted-foreground">Dose</p><p className="font-semibold">{p.dose_mg} mg</p></div>
                    <div><p className="text-muted-foreground">Vial</p><p className="font-semibold">{p.vial_strength_mg} mg / {p.bac_water_ml} ml BAC</p></div>
                    <div><p className="text-muted-foreground">Clicks/dose</p><p className="font-semibold text-primary">{p.calc?.clicks ?? "—"}</p></div>
                    <div><p className="text-muted-foreground">Doses/vial</p><p className="font-semibold">{p.calc?.dosesPerVial ?? "—"}</p></div>
                  </div>
                  {p.benefits?.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Benefits</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.benefits.map((b: string, k: number) => (
                          <Badge key={k} variant="secondary" className="text-[11px] bg-primary/10 text-primary border-0">{b}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {p.mechanism && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Mechanism</p>
                      <p className="text-xs text-foreground/80">{p.mechanism}</p>
                    </div>
                  )}
                  {p.side_effects_common?.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">Common Side Effects</p>
                      <p className="text-xs text-muted-foreground">{p.side_effects_common.join(" • ")}</p>
                    </div>
                  )}
                  {p.notes && <p className="text-xs text-muted-foreground italic pt-1 border-t border-border/50">{p.notes}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {(plan.supplements as any[])?.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Pill className="h-4 w-4 text-primary" /> Supplements</h3>
            <ul className="space-y-2">
              {(plan.supplements as any[]).map((s, i) => (
                <li key={i} className="text-sm flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground text-xs">{s.dose} • {s.frequency} • {s.timing}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {(plan.titration_schedule as any[])?.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Titration Schedule</h3>
            <div className="space-y-2">
              {(plan.titration_schedule as any[]).map((t, i) => (
                <div key={i} className="text-sm flex gap-3 items-center">
                  <Badge variant="outline" className="w-20 justify-center">Week {t.week}</Badge>
                  <span className="font-medium">{t.dose_mg} mg</span>
                  {t.note && <span className="text-xs text-muted-foreground">— {t.note}</span>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {plan.injection_sites?.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Injection Sites</h3>
            <div className="flex gap-2 flex-wrap">{plan.injection_sites.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
          </Card>
        )}

        {plan.timing_notes && <Card className="p-6"><h3 className="font-semibold mb-2">Timing</h3><p className="text-sm whitespace-pre-wrap">{plan.timing_notes}</p></Card>}
        {plan.safety_notes && (
          <Card className="p-6 border-amber-500/30 bg-amber-500/5">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-400"><AlertTriangle className="h-4 w-4" /> Safety Notes</h3>
            <p className="text-sm whitespace-pre-wrap">{plan.safety_notes}</p>
          </Card>
        )}
        {plan.coach_rationale && <Card className="p-6"><h3 className="font-semibold mb-2">Coach Rationale</h3><p className="text-sm whitespace-pre-wrap">{plan.coach_rationale}</p></Card>}
        {plan.client_notes && <Card className="p-6"><h3 className="font-semibold mb-2">Client Notes</h3><p className="text-sm whitespace-pre-wrap">{plan.client_notes}</p></Card>}
      </div>
    );
  }

  // ===== CREATE FORM =====
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setMode("list")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h2 className="text-xl font-heading font-semibold">New Bespoke Plan</h2>
        </div>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !clientName} className="gap-2">
          {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Plan
        </Button>
      </div>

      {/* CLIENT */}
      <Card className="p-5 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Client</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Client name *</Label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. John Smith" />
          </div>
          <div>
            <Label>Client email (optional)</Label>
            <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@example.com" />
          </div>
          <div>
            <Label>Goal</Label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Fat loss, recovery, longevity" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Start date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
            <div><Label>End date</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
          </div>
        </div>
      </Card>

      {/* PEPTIDES */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><Syringe className="h-4 w-4 text-primary" /> Peptides & Click Calculator</h3>
          <Button size="sm" variant="outline" onClick={() => setPeptides([...peptides, blankPeptide()])} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add peptide
          </Button>
        </div>

        {peptides.map((p, i) => {
          const calc = calcClicks(p);
          const lib = peptideLibrary?.find((l) => l.peptyl_id === p.peptyl_id);
          return (
            <div key={i} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Peptide #{i + 1}</span>
                {peptides.length > 1 && (
                  <Button size="sm" variant="ghost" onClick={() => setPeptides(peptides.filter((_, x) => x !== i))} className="h-7 w-7 p-0 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Label className="text-xs">Peptide (from library)</Label>
                  <Select value={p.peptyl_id} onValueChange={(v) => applyPeptideTemplate(i, v)}>
                    <SelectTrigger><SelectValue placeholder="Select peptide..." /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {peptideLibrary?.map((lp) => (
                        <SelectItem key={lp.peptyl_id} value={lp.peptyl_id}>
                          {lp.name} {lp.full_name && lp.full_name !== lp.name ? `— ${lp.full_name}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {lib?.dose_range && <p className="text-[10px] text-muted-foreground mt-1">Reference dose range: {lib.dose_range}{lib.frequency ? ` • ${lib.frequency}` : ""}</p>}
                </div>
                <div>
                  <Label className="text-xs">Dose per administration (mg)</Label>
                  <Input type="number" step="0.01" value={p.dose_mg || ""} onChange={(e) => { const n = [...peptides]; n[i].dose_mg = parseFloat(e.target.value) || 0; setPeptides(n); }} />
                </div>
                <div>
                  <Label className="text-xs">Frequency</Label>
                  <Select value={p.frequency} onValueChange={(v) => { const n = [...peptides]; n[i].frequency = v; setPeptides(n); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Vial strength (mg)</Label>
                  <Input type="number" step="0.1" value={p.vial_strength_mg || ""} onChange={(e) => { const n = [...peptides]; n[i].vial_strength_mg = parseFloat(e.target.value) || 0; setPeptides(n); }} placeholder="e.g. 10" />
                </div>
                <div>
                  <Label className="text-xs">BAC water (ml)</Label>
                  <Input type="number" step="0.1" value={p.bac_water_ml || ""} onChange={(e) => { const n = [...peptides]; n[i].bac_water_ml = parseFloat(e.target.value) || 0; setPeptides(n); }} placeholder="e.g. 2" />
                </div>
                <div>
                  <Label className="text-xs">ml per click</Label>
                  <Input type="number" step="0.001" value={p.ml_per_click || ""} onChange={(e) => { const n = [...peptides]; n[i].ml_per_click = parseFloat(e.target.value) || 0; setPeptides(n); }} />
                </div>
                <div>
                  <Label className="text-xs">Timing</Label>
                  <Select value={p.timing} onValueChange={(v) => { const n = [...peptides]; n[i].timing = v; setPeptides(n); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM (morning)</SelectItem>
                      <SelectItem value="PM">PM (evening)</SelectItem>
                      <SelectItem value="Pre-workout">Pre-workout</SelectItem>
                      <SelectItem value="Post-workout">Post-workout</SelectItem>
                      <SelectItem value="Bedtime">Bedtime</SelectItem>
                      <SelectItem value="Anytime">Anytime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* CALCULATOR OUTPUT */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                <p className="text-[10px] uppercase font-semibold text-primary mb-2 flex items-center gap-1.5">
                  <Calculator className="h-3 w-3" /> Auto-calculated
                </p>
                {calc ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div><p className="text-muted-foreground">Concentration</p><p className="font-semibold">{calc.concentration} mg/ml</p></div>
                    <div><p className="text-muted-foreground">Volume per dose</p><p className="font-semibold">{calc.volumeMl} ml</p></div>
                    <div><p className="text-muted-foreground">Clicks per dose</p><p className="font-bold text-primary text-base">{calc.clicks}</p></div>
                    <div><p className="text-muted-foreground">Doses per vial</p><p className="font-semibold">{calc.dosesPerVial}</p></div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Fill dose, vial strength & BAC water to calculate.</p>
                )}
              </div>

              <Textarea placeholder="Notes for this peptide…" value={p.notes} onChange={(e) => { const n = [...peptides]; n[i].notes = e.target.value; setPeptides(n); }} rows={2} />

              {lib && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View clinical reference for {lib.name}</summary>
                  <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-border">
                    {lib.mechanism_of_action && <p><span className="font-semibold">Mechanism:</span> {lib.mechanism_of_action}</p>}
                    {lib.primary_effects?.length > 0 && <p><span className="font-semibold">Primary effects:</span> {lib.primary_effects.join(", ")}</p>}
                    {lib.side_effects_common?.length > 0 && <p><span className="font-semibold">Common side effects:</span> {lib.side_effects_common.join(", ")}</p>}
                    {lib.contraindications?.length > 0 && <p className="text-destructive"><span className="font-semibold">Contraindications:</span> {lib.contraindications.join(", ")}</p>}
                    {lib.cycle_duration && <p><span className="font-semibold">Cycle:</span> {lib.cycle_duration}</p>}
                    {lib.evidence_grade && <p><span className="font-semibold">Evidence grade:</span> {lib.evidence_grade}</p>}
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </Card>

      {/* TITRATION */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Titration Schedule (optional)</h3>
          <Button size="sm" variant="outline" onClick={() => setTitration([...titration, { week: titration.length + 1, dose_mg: 0, note: "" }])} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add step
          </Button>
        </div>
        {titration.map((t, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <Input className="col-span-2" type="number" placeholder="Week" value={t.week} onChange={(e) => { const n = [...titration]; n[i].week = parseInt(e.target.value) || 0; setTitration(n); }} />
            <Input className="col-span-3" type="number" step="0.01" placeholder="Dose mg" value={t.dose_mg || ""} onChange={(e) => { const n = [...titration]; n[i].dose_mg = parseFloat(e.target.value) || 0; setTitration(n); }} />
            <Input className="col-span-6" placeholder="Note (e.g. titrate up if tolerated)" value={t.note} onChange={(e) => { const n = [...titration]; n[i].note = e.target.value; setTitration(n); }} />
            <Button size="sm" variant="ghost" onClick={() => setTitration(titration.filter((_, x) => x !== i))} className="col-span-1 h-8 w-8 p-0 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
      </Card>

      {/* SUPPLEMENTS */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><Pill className="h-4 w-4 text-primary" /> Supplements</h3>
          <Button size="sm" variant="outline" onClick={() => setSupplements([...supplements, { name: "", dose: "", frequency: "Once daily", timing: "AM" }])} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
        {supplements.map((s, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <Input className="col-span-4" placeholder="Name" value={s.name} onChange={(e) => { const n = [...supplements]; n[i].name = e.target.value; setSupplements(n); }} />
            <Input className="col-span-3" placeholder="Dose (e.g. 500mg)" value={s.dose} onChange={(e) => { const n = [...supplements]; n[i].dose = e.target.value; setSupplements(n); }} />
            <Input className="col-span-2" placeholder="Frequency" value={s.frequency} onChange={(e) => { const n = [...supplements]; n[i].frequency = e.target.value; setSupplements(n); }} />
            <Input className="col-span-2" placeholder="Timing" value={s.timing} onChange={(e) => { const n = [...supplements]; n[i].timing = e.target.value; setSupplements(n); }} />
            <Button size="sm" variant="ghost" onClick={() => setSupplements(supplements.filter((_, x) => x !== i))} className="col-span-1 h-8 w-8 p-0 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
      </Card>

      {/* SITES & TIMING */}
      <Card className="p-5 space-y-3">
        <h3 className="font-semibold">Injection Sites & Timing</h3>
        <div className="flex flex-wrap gap-2">
          {INJECTION_SITES.map((site) => (
            <Button key={site} type="button" size="sm" variant={sites.includes(site) ? "default" : "outline"}
              onClick={() => setSites(sites.includes(site) ? sites.filter((s) => s !== site) : [...sites, site])}>
              {site}
            </Button>
          ))}
        </div>
        <Textarea placeholder="Timing & rotation guidance (e.g. rotate sites weekly, inject at same time daily)…" value={timingNotes} onChange={(e) => setTimingNotes(e.target.value)} rows={2} />
      </Card>

      {/* SAFETY & RATIONALE */}
      <Card className="p-5 space-y-3 border-amber-500/30">
        <h3 className="font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400"><AlertTriangle className="h-4 w-4" /> Safety Notes</h3>
        <Textarea placeholder="Side effects, contraindications, drug interactions, monitoring requirements… (auto-filled from peptide library)" value={safetyNotes} onChange={(e) => setSafetyNotes(e.target.value)} rows={4} />
      </Card>

      <Card className="p-5 space-y-3">
        <h3 className="font-semibold">Coach Rationale</h3>
        <Textarea placeholder="Why this protocol was chosen for this client…" value={coachRationale} onChange={(e) => setCoachRationale(e.target.value)} rows={3} />
      </Card>

      <Card className="p-5 space-y-3">
        <h3 className="font-semibold">Client Notes</h3>
        <Textarea placeholder="Client background, goals, history, restrictions…" value={clientNotes} onChange={(e) => setClientNotes(e.target.value)} rows={3} />
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !clientName} className="gap-2" size="lg">
          {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Bespoke Plan
        </Button>
      </div>
    </div>
  );
};

export default CoachPlanBuilder;
