import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FlaskConical, Beaker, Clock, ShieldAlert, BookOpen, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { findSupplementBySlug, toSlug } from "@/lib/seo-slug";
import { supplements } from "@/data/supplements";

const gradeLabel: Record<string, string> = {
  A: "Strong human evidence",
  B: "Moderate evidence",
  C: "Limited / early evidence",
  D: "Pre-clinical or anecdotal",
};

const SupplementDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const supplement = slug ? findSupplementBySlug(slug) : undefined;

  if (!supplement) return <Navigate to="/improve" replace />;

  const related = supplements
    .filter((s) => s.category === supplement.category && s.name !== supplement.name)
    .slice(0, 6);

  const path = `/supplements/${toSlug(supplement.name)}`;
  const title = `${supplement.name} (${supplement.fullName}) — Dosing, Benefits & Evidence`;
  const description = `${supplement.name}: ${supplement.description.slice(0, 155)}`.replace(/\s+/g, " ").trim().slice(0, 160);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DietarySupplement",
    name: supplement.name,
    alternateName: supplement.fullName,
    description: supplement.description,
    nonProprietaryName: supplement.fullName,
    activeIngredient: supplement.fullName,
    recommendedIntake: {
      "@type": "RecommendedDoseSchedule",
      doseValue: supplement.doseRange,
      frequency: supplement.timing,
    },
    safetyConsideration: supplement.contraindications?.join("; "),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path={path} type="article" jsonLd={jsonLd} />
      <Header />

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        <Link to="/improve" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> All supplements
        </Link>

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {supplement.category}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              Evidence {supplement.evidenceGrade} — {gradeLabel[supplement.evidenceGrade]}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2">
            {supplement.name}
          </h1>
          <p className="text-lg text-muted-foreground">{supplement.fullName}</p>
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-3">Overview</h2>
          <p className="text-base text-muted-foreground leading-relaxed">{supplement.description}</p>
        </section>

        {supplement.benefits.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">Reported benefits</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {supplement.benefits.map((b) => (
                <div key={b} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-card border border-border">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{b}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-3">Dosing & timing</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Beaker className="h-3.5 w-3.5" /> Form
              </div>
              <p className="text-sm font-medium text-foreground">{supplement.form}</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <FlaskConical className="h-3.5 w-3.5" /> Typical dose range
              </div>
              <p className="text-sm font-medium text-foreground">{supplement.doseRange}</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Clock className="h-3.5 w-3.5" /> Timing
              </div>
              <p className="text-sm font-medium text-foreground">{supplement.timing}</p>
            </div>
            {supplement.halfLife && (
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3.5 w-3.5" /> Half-life
                </div>
                <p className="text-sm font-medium text-foreground">{supplement.halfLife}</p>
              </div>
            )}
          </div>
          {supplement.notes && (
            <p className="text-sm text-muted-foreground italic mt-4">💡 {supplement.notes}</p>
          )}
        </section>

        {supplement.synergies && supplement.synergies.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Synergies
            </h2>
            <div className="flex flex-wrap gap-2">
              {supplement.synergies.map((syn) => (
                <span key={syn} className="text-sm px-3 py-1 rounded-full bg-success/10 text-success border border-success/20">
                  ✦ {syn}
                </span>
              ))}
            </div>
          </section>
        )}

        {supplement.contraindications && supplement.contraindications.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-warm" /> Side effects & cautions
            </h2>
            <ul className="space-y-2">
              {supplement.contraindications.map((c) => (
                <li key={c} className="text-sm text-muted-foreground p-3 rounded-lg bg-warm/5 border border-warm/20">
                  {c}
                </li>
              ))}
            </ul>
          </section>
        )}

        {supplement.biomarkerTargets && supplement.biomarkerTargets.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">Biomarker targets</h2>
            <div className="flex flex-wrap gap-2">
              {supplement.biomarkerTargets.map((bm, i) => {
                const label = typeof bm === "string"
                  ? bm
                  : ((bm as any).biomarker ?? "Unknown");
                return (
                  <span key={i} className="text-xs px-3 py-1 rounded-full bg-accent text-accent-foreground">
                    📊 {label}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {supplement.keyStudies && supplement.keyStudies.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Key studies
            </h2>
            <ul className="space-y-2">
              {supplement.keyStudies.map((st) => (
                <li key={st} className="text-sm text-muted-foreground p-3 rounded-lg bg-card border border-border italic">
                  {st}
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">Related supplements in {supplement.category}</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {related.map((r) => (
                <Link
                  key={r.name}
                  to={`/supplements/${toSlug(r.name)}`}
                  className="block p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="text-sm font-semibold text-foreground">{r.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.fullName}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 p-6 rounded-2xl bg-card border border-border text-center">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
            Track {supplement.name} with Peptyl
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

export default SupplementDetail;
