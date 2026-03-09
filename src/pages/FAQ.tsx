import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is Peptyl?",
    a: "Peptyl is an independent educational platform for peptide and supplement research. We combine AI-driven analysis, community data, and peer-reviewed evidence to help researchers make informed decisions about peptides, supplements, and health optimisation protocols.",
  },
  {
    q: "Is Peptyl a medical service?",
    a: "No. Peptyl is strictly an educational and research tool. We do not provide medical advice, diagnose conditions, or prescribe treatments. Always consult a qualified healthcare professional before starting any new protocol.",
  },
  {
    q: "Do I need an account to use Peptyl?",
    a: "You can browse our peptide database, supplement guides, and educational articles without an account. Creating a free account unlocks personalised features like the health dashboard, protocol tracking, bloodwork analysis, and the AI research assistant.",
  },
  {
    q: "What is the DNA analysis feature?",
    a: "Our DNA analysis lets you upload genetic data (from providers like 23andMe or AncestryDNA) to receive personalised insights on how your genetics may influence your response to specific peptides and supplements. All data is processed securely and you retain full control.",
  },
  {
    q: "How does the protocol tracker work?",
    a: "The protocol tracker lets you log your peptide and supplement regimen, set reminders, track injection schedules, and monitor adherence over time. It also integrates with wearable data (Whoop, Fitbit) to correlate protocol adherence with recovery and sleep metrics.",
  },
  {
    q: "Can I track my bloodwork on Peptyl?",
    a: "Yes. You can manually enter biomarker results from blood panels. Peptyl highlights values outside optimal ranges and tracks trends over time, helping you and your healthcare provider make data-driven decisions.",
  },
  {
    q: "Does Peptyl sell peptides or supplements?",
    a: "No. Peptyl does not sell any products. Our Shop section provides independent supplier comparisons and price tracking for research purposes only. We are not affiliated with any supplier.",
  },
  {
    q: "What peptides does Peptyl cover?",
    a: "Our database covers a wide range of research peptides including BPC-157, TB-500, GHK-Cu, Thymosin Alpha-1, GLP-1 agonists (semaglutide, tirzepatide, retatrutide), CJC-1295, Ipamorelin, and many more. Each entry includes dosing research, mechanism of action, evidence grades, and safety data.",
  },
  {
    q: "Is my data safe on Peptyl?",
    a: "Your privacy is a top priority. All data is encrypted, stored securely, and never sold to third parties. You can delete your account and all associated data at any time. See our Privacy Policy for full details.",
  },
  {
    q: "What are the reconstitution and dose calculators?",
    a: "Our calculators help researchers accurately reconstitute lyophilised peptides with bacteriostatic water, calculate precise doses based on concentration, and plan injection cycles. They include syringe diagrams and validation warnings for safety.",
  },
  {
    q: "How does the AI research assistant work?",
    a: "The AI assistant is trained on peer-reviewed peptide research and our curated knowledge base. It can answer questions about peptide mechanisms, dosing protocols, supplement interactions, and more — always citing evidence quality and recommending professional consultation.",
  },
  {
    q: "Is Peptyl available outside the UK?",
    a: "Yes. Peptyl is accessible globally. However, regulatory information is region-specific — we display UK, EU, and US regulatory statuses for each compound so researchers understand the legal landscape in their jurisdiction.",
  },
  {
    q: "How often is the database updated?",
    a: "Our AI enrichment pipeline continuously scans new research, and our editorial team reviews and publishes updates weekly. Community experience data is updated in real-time as users contribute.",
  },
  {
    q: "Can I connect my wearable device?",
    a: "Yes. Peptyl supports integration with Whoop and Fitbit. Once connected, your recovery, HRV, sleep, and activity data are synced automatically and displayed alongside your protocol data for holistic tracking.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const FAQ = () => (
  <div className="min-h-screen bg-background">
    <SEO
      title="FAQ | Peptyl — Peptide Research Questions Answered"
      description="Frequently asked questions about Peptyl's peptide database, protocol tracker, DNA analysis, dose calculators, and AI research assistant."
      path="/faq"
    />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
    />
    <Header />

    <section className="pt-28 pb-12">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground mb-10">
          Everything you need to know about using Peptyl for peptide and supplement research.
        </p>

        <Accordion type="multiple" className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-border rounded-xl px-5 data-[state=open]:bg-muted/40 transition-colors"
            >
              <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>

    <Footer />
  </div>
);

export default FAQ;
