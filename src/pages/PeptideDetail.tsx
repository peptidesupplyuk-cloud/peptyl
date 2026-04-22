import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FlaskConical, Syringe, CalendarDays, Clock, ShieldAlert, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { findPeptideBySlug, toSlug } from "@/lib/seo-slug";
import { peptides } from "@/data/peptides";

const gradeLabel: Record<string, string> = {
  A: "Strong human evidence",
  B: "Moderate evidence",
  C: "Limited / early evidence",
  D: "Pre-clinical or anecdotal",
};

const PeptideDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const peptide = slug ? findPeptideBySlug(slug) : undefined;

  if (!peptide) return <Navigate to="/peptides" replace />;

  // Suggest related compounds in the same category (max 6).
  const related = peptides
    .filter((p) => p.category === peptide.category && p.name !== peptide.name)
    .slice(0, 6);

  const path = `/peptides/${toSlug(peptide.name)}`;
  const title = `${peptide.name} (${peptide.fullName}) — Dosing, Mechanism & Evidence`;
  const description = `${peptide.name}: ${peptide.description.slice(0, 155)}`.replace(/\s+/g, " ").trim().slice(0, 160);

  // JSON-LD Drug schema (helps Google AI Overviews + rich results).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Drug",
    name: peptide.name,
    alternateName: peptide.fullName,
    description: peptide.description,
    drugClass: peptide.category,
    administrationRoute: peptide.administration,
    dosageForm: peptide.administration,
    ...(peptide.doseRange && {
      doseSchedule: {
        "@type": "DoseSchedule",
        doseValue: peptide.doseRange,
        frequency: peptide.frequency,
      },
    }),
    mechanismOfAction: peptide.description,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path={path} type="article" jsonLd={jsonLd} />
      <Header />

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        <Link to="/peptides" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> All peptides
        </Link>

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {peptide.category}
            </span>
            {peptide.evidenceGrade && (
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Evidence {peptide.evidenceGrade} — {gradeLabel[peptide.evidenceGrade]}
              </span>
            )}
            {peptide.isNew && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warm/10 text-warm">New</span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2">
            {peptide.name}
          </h1>
          <p className="text-lg text-muted-foreground">{peptide.fullName}</p>
        </header>

        {/* Overview */}
        <section className="mb-8">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-3">Overview</h2>
          <p className="text-base text-muted-foreground leading-relaxed">{peptide.description}</p>
        </section>

        {/* Benefits / Mechanism */}
        {peptide.benefits.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">Reported benefits & mechanism</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {peptide.benefits.map((b) => (
                <div key={b} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-card border border-border">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{b}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dosing & timing */}
        <section className="mb-8">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-3">Dosing & timing</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Syringe className="h-3.5 w-3.5" /> Administration
              </div>
              <p className="text-sm font-medium text-foreground">{peptide.administration}</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <CalendarDays className="h-3.5 w-3.5" /> Frequency
              </div>
              <p className="text-sm font-medium text-foreground">{peptide.frequency}</p>
            </div>
            {peptide.doseRange && (
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <FlaskConical className="h-3.5 w-3.5" /> Typical dose range
                </div>
                <p className="text-sm font-medium text-foreground">{peptide.doseRange}</p>
              </div>
            )}
            {peptide.cycleDuration && (
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3.5 w-3.5" /> Typical cycle duration
                </div>
                <p className="text-sm font-medium text-foreground">{peptide.cycleDuration}</p>
              </div>
            )}
          </div>
          {peptide.notes && (
            <p className="text-sm text-muted-foreground italic mt-4">💡 {peptide.notes}</p>
          )}
        </section>

        {/* Side effects / cautions (from experiences flagged caution) */}
        {peptide.experiences.some((e) => e.sentiment === "caution") && (
          <section className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-warm" /> Side effects & cautions
            </h2>
            <ul className="space-y-2">
              {peptide.experiences.filter((e) => e.sentiment === "caution").map((e, i) => (
                <li key={i} className="text-sm text-muted-foreground p-3 rounded-lg bg-warm/5 border border-warm/20">
                  {e.text}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Evidence / research references */}
        {peptide.experiences.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Research references
            </h2>
            <ul className="space-y-2">
              {peptide.experiences.map((e, i) => (
                <li key={i} className="text-sm text-muted-foreground p-3 rounded-lg bg-card border border-border">
                  {e.text}
                  {e.source && <span className="block text-[11px] mt-1 italic">Source: {e.source}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Regulatory status */}
        {peptide.regulatoryStatus && (
          <section className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">Regulatory status</h2>
            <div className="grid sm:grid-cols-3 gap-2 text-sm">
              {(["uk", "eu", "us"] as const).map((region) => {
                const r = peptide.regulatoryStatus?.[region];
                if (!r) return null;
                const text = r.status === "approved" ? r.label : r.status === "trial" ? r.phase : "Not approved";
                return (
                  <div key={region} className="p-3 rounded-lg bg-card border border-border">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">{region.toUpperCase()}</div>
                    <div className="text-sm text-foreground">{text}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Related compounds (internal linking for SEO) */}
        {related.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">Related peptides in {peptide.category}</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {related.map((r) => (
                <Link
                  key={r.name}
                  to={`/peptides/${toSlug(r.name)}`}
                  className="block p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="text-sm font-semibold text-foreground">{r.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.fullName}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mt-12 p-6 rounded-2xl bg-card border border-border text-center">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
            Track {peptide.name} with Peptyl
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Free dose reminders, adherence tracking, and bloodwork integration.
          </p>
          <Link to="/auth">
            <Button className="shadow-brand">Start free</Button>
          </Link>
        </section>

        <p className="text-[11px] text-muted-foreground italic text-center mt-8">
          For research and education only. Not medical advice. Consult a qualified clinician before use.
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default PeptideDetail;
