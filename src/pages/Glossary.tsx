import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface Term {
  term: string;
  definition: string;
  link?: string;
}

const glossaryTerms: Term[] = [
  { term: "AMPK", definition: "AMP-activated protein kinase, a cellular energy sensor that regulates metabolism and is activated by exercise and caloric restriction. MOTS-c activates AMPK to mimic exercise at the cellular level.", link: "/education/mots-c-mitochondrial-peptide" },
  { term: "Bacteriostatic Water", definition: "Sterile water containing 0.9% benzyl alcohol, used to reconstitute lyophilised peptides for subcutaneous injection.", link: "/education/how-to-reconstitute-peptides" },
  { term: "Biomarker", definition: "A measurable biological indicator used to assess health status, disease progression, or treatment response. Common examples include IGF-1, hsCRP, HbA1c, and testosterone.", link: "/education/bloodwork-comes-first" },
  { term: "BPC-157", definition: "Body Protection Compound-157, a synthetic pentadecapeptide derived from gastric juice proteins. Studied for tissue repair, gut healing, and angiogenesis.", link: "/education/bpc157-vs-tb500" },
  { term: "Cardiolipin", definition: "A phospholipid found exclusively in the inner mitochondrial membrane, essential for electron transport chain function. SS-31 stabilises cardiolipin to restore mitochondrial efficiency.", link: "/education/ss31-elamipretide-mitochondrial-ageing" },
  { term: "CJC-1295", definition: "A synthetic analogue of growth hormone-releasing hormone (GHRH) with a longer half-life, often paired with Ipamorelin for growth hormone secretion research." },
  { term: "Cycling", definition: "The practice of alternating periods of peptide use with off periods to prevent receptor desensitisation and maintain efficacy.", link: "/education/peptide-cycling-guide" },
  { term: "Elamipretide", definition: "Also known as SS-31 or Bendavia, a mitochondria-targeted tetrapeptide that binds cardiolipin to improve electron transport chain efficiency.", link: "/education/ss31-elamipretide-mitochondrial-ageing" },
  { term: "GHK-Cu", definition: "Glycyl-L-histidyl-L-lysine copper complex, a naturally occurring tripeptide with wound-healing, anti-inflammatory, and skin-remodelling properties.", link: "/education/ghk-cu-pretty-peptide" },
  { term: "GLP-1", definition: "Glucagon-like peptide-1, an incretin hormone that stimulates insulin secretion and suppresses appetite. GLP-1 receptor agonists include semaglutide, tirzepatide, and retatrutide.", link: "/education/understanding-glp1-peptides" },
  { term: "HbA1c", definition: "Glycated haemoglobin, a blood marker reflecting average blood glucose levels over the preceding 2-3 months. Used to assess metabolic health and diabetes risk." },
  { term: "hsCRP", definition: "High-sensitivity C-reactive protein, an inflammatory biomarker produced by the liver. Elevated levels indicate systemic inflammation." },
  { term: "IGF-1", definition: "Insulin-like growth factor 1, a hormone produced primarily by the liver in response to growth hormone. Used as a biomarker for GH secretagogue protocols." },
  { term: "Ipamorelin", definition: "A selective growth hormone secretagogue that stimulates GH release without significantly affecting cortisol or prolactin levels." },
  { term: "KPV", definition: "A tripeptide derived from alpha-melanocyte-stimulating hormone (alpha-MSH) with anti-inflammatory properties, studied for inflammatory bowel conditions.", link: "/education/gut-health-peptides" },
  { term: "Larazotide", definition: "A synthetic peptide that targets tight junctions in the intestinal wall to reduce intestinal permeability (leaky gut).", link: "/education/gut-health-peptides" },
  { term: "Lyophilisation", definition: "Freeze-drying process used to preserve peptides in a stable powder form. Lyophilised peptides must be reconstituted before use.", link: "/education/peptide-storage-guide" },
  { term: "Melanotan I", definition: "A synthetic analogue of alpha-MSH with selectivity for the MC1R receptor, studied for photoprotection and skin pigmentation.", link: "/education/mt1-vs-mt2" },
  { term: "Melanotan II", definition: "A non-selective melanocortin receptor agonist studied for tanning, libido, and appetite suppression, with a broader side-effect profile than MT-I.", link: "/education/mt1-vs-mt2" },
  { term: "MOTS-c", definition: "Mitochondrial open reading frame of the 12S rRNA type-c, a mitochondrial-derived peptide that activates AMPK and declines with age.", link: "/education/mots-c-mitochondrial-peptide" },
  { term: "NAD+", definition: "Nicotinamide adenine dinucleotide, a coenzyme critical for cellular energy production, DNA repair, and sirtuin activation. Declines with age.", link: "/education/nad-longevity-stack" },
  { term: "NMN", definition: "Nicotinamide mononucleotide, a direct precursor to NAD+ used in longevity research to restore cellular NAD+ levels.", link: "/education/nad-longevity-stack" },
  { term: "Peptide-Drug Conjugate (PDC)", definition: "A targeted therapy combining a tumour-homing peptide with a cytotoxic drug payload, designed to deliver chemotherapy directly to cancer cells with reduced systemic toxicity.", link: "/education/peptides-cancer-therapy-2026" },
  { term: "Reconstitution", definition: "The process of dissolving a lyophilised peptide powder in bacteriostatic water to create an injectable solution.", link: "/education/how-to-reconstitute-peptides" },
  { term: "Retatrutide", definition: "A triple-agonist peptide targeting GLP-1, GIP, and glucagon receptors simultaneously. Phase III trials show greater weight loss than semaglutide or tirzepatide.", link: "/education/retatrutide-triple-agonist-review" },
  { term: "Semax", definition: "A synthetic analogue of ACTH(4-10) developed in Russia, studied for neuroprotection, cognitive enhancement, and BDNF upregulation.", link: "/education/russia-cognitive-peptides" },
  { term: "Semaglutide", definition: "A GLP-1 receptor agonist marketed as Ozempic (injection) and Wegovy (weight management). Now available in oral formulation.", link: "/education/oral-glp1-boom-2026" },
  { term: "Selank", definition: "A synthetic analogue of tuftsin developed in Russia with anxiolytic and nootropic properties, studied for its effects on IL-6 and GABAergic modulation.", link: "/education/russia-cognitive-peptides" },
  { term: "SS-31", definition: "A mitochondria-targeted tetrapeptide (also called Elamipretide) that stabilises cardiolipin and improves electron transport chain efficiency.", link: "/education/ss31-elamipretide-mitochondrial-ageing" },
  { term: "TB-500", definition: "A synthetic fragment of thymosin beta-4, studied for wound healing, tissue repair, and anti-inflammatory effects.", link: "/education/bpc157-vs-tb500" },
  { term: "Thymosin Alpha-1", definition: "A thymic peptide approved in 35+ countries for immune modulation, studied in hepatitis, cancer immunotherapy, and post-surgical recovery.", link: "/education/thymosin-alpha-1-immune-peptide" },
  { term: "Tirzepatide", definition: "A dual GIP/GLP-1 receptor agonist marketed as Mounjaro and Zepbound, showing superior weight loss and glycaemic control compared to semaglutide.", link: "/education/understanding-glp1-peptides" },
  { term: "Titration", definition: "The practice of gradually increasing a peptide dose from a low starting point to minimise side effects and assess individual tolerance." },
];

const grouped = glossaryTerms.reduce<Record<string, Term[]>>((acc, t) => {
  const letter = t.term[0].toUpperCase();
  if (!acc[letter]) acc[letter] = [];
  acc[letter].push(t);
  return acc;
}, {});

const letters = Object.keys(grouped).sort();

const Glossary = () => (
  <div className="min-h-screen bg-background">
    <SEO
      title="Peptide Glossary: Key Terms & Definitions"
      description="A comprehensive glossary of peptide research terminology. Understand BPC-157, GLP-1, reconstitution, biomarkers, and 30+ key terms used in peptide science."
      path="/glossary"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "DefinedTermSet",
        "name": "Peptide Research Glossary",
        "description": "Key terms and definitions used in peptide research and biohacking",
        "url": "https://peptyl.co.uk/glossary",
        "hasDefinedTerm": glossaryTerms.map(t => ({
          "@type": "DefinedTerm",
          "name": t.term,
          "description": t.definition,
        })),
      }}
    />
    <Header />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
            Peptide Research <span className="text-gradient-teal">Glossary</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Key terms, compounds, and biomarkers referenced across Peptyl's educational content.
          </p>

          {/* Letter jump links */}
          <nav className="flex flex-wrap gap-1.5 mb-10" aria-label="Glossary letter navigation">
            {letters.map(l => (
              <a key={l} href={`#letter-${l}`} className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium border border-border hover:border-primary/40 hover:text-primary transition-colors">
                {l}
              </a>
            ))}
          </nav>

          {letters.map(letter => (
            <section key={letter} id={`letter-${letter}`} className="mb-8">
              <h2 className="text-xl font-heading font-bold text-foreground border-b border-border pb-2 mb-4">{letter}</h2>
              <dl className="space-y-4">
                {grouped[letter].map(t => (
                  <div key={t.term}>
                    <dt className="font-medium text-foreground text-sm">
                      {t.link ? <Link to={t.link} className="text-primary hover:underline">{t.term}</Link> : t.term}
                    </dt>
                    <dd className="text-sm text-muted-foreground leading-relaxed mt-0.5 ml-4">{t.definition}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Glossary;
