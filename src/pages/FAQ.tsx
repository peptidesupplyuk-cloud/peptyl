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
    a: "Peptyl is a health intelligence platform that combines AI-driven analysis, biomarker tracking, wearable integrations, and peer-reviewed research to help users make informed, data-driven decisions about their health optimisation protocols. We cover peptides (including GLP-1 agonists), supplements, and broader longevity strategies.",
  },
  {
    q: "Is Peptyl a medical service?",
    a: "No. Peptyl is strictly an educational and research tool. We are not medical professionals and do not provide medical advice, diagnose conditions, or prescribe treatments. Always consult a qualified healthcare professional before starting any new protocol.",
  },
  {
    q: "Do I need an account to use Peptyl?",
    a: "You can browse our compound database, supplement guides, and educational articles without an account. Creating a free account unlocks personalised features like the health dashboard, protocol tracking, bloodwork analysis, wearable sync, and the AI research assistant.",
  },
  {
    q: "What is the DNA analysis feature?",
    a: "Our DNA analysis lets you upload genetic data (from providers like 23andMe or AncestryDNA) to receive personalised insights on how your genetics may influence your response to specific compounds and supplements. All data is processed securely and you retain full control.",
  },
  {
    q: "How does the protocol tracker work?",
    a: "The protocol tracker lets you log your peptide and supplement regimen, set reminders, and monitor adherence over time. It integrates with wearable data (Whoop, Fitbit) to correlate protocol adherence with recovery, HRV, and sleep metrics for a complete picture.",
  },
  {
    q: "Can I track my bloodwork on Peptyl?",
    a: "Yes. You can manually enter biomarker results from blood panels. Peptyl highlights values outside optimal ranges and tracks trends over time, helping you and your healthcare provider make data-driven decisions. Full lab integration is coming soon.",
  },
  {
    q: "Does Peptyl sell peptides or supplements?",
    a: "No. Peptyl does not currently sell any products. Our Shop section provides independent supplier comparisons and price tracking for research purposes only. We are not affiliated with any supplier. We may introduce curated product offerings in the future, but that is not our primary focus.",
  },
  {
    q: "What compounds does Peptyl cover?",
    a: "Our database covers a wide range of research compounds including BPC-157, TB-500, GHK-Cu, Thymosin Alpha-1, GLP-1 agonists (semaglutide, tirzepatide, retatrutide), CJC-1295, Ipamorelin, and many more. Each entry includes dosing research, mechanism of action, evidence grades, and safety data.",
  },
  {
    q: "Is my data safe on Peptyl?",
    a: "Your privacy is a top priority. All data is encrypted, stored securely, and never sold to third parties. You can delete your account and all associated data at any time. See our Privacy Policy for full details.",
  },
  {
    q: "What are the reconstitution and dose calculators?",
    a: "Our calculators help researchers accurately reconstitute lyophilised peptides with bacteriostatic water, calculate precise doses based on concentration, and plan cycles. They include visual guides and validation warnings for accuracy.",
  },
  {
    q: "How does the AI research assistant work?",
    a: "The AI assistant is trained on peer-reviewed peptide and supplement research alongside our curated knowledge base. It can answer questions about compound mechanisms, dosing protocols, supplement interactions, and more, always citing evidence quality and recommending professional consultation.",
  },
  {
    q: "Is Peptyl available outside the UK?",
    a: "Yes. Peptyl is accessible globally. However, regulatory information is region-specific. We display UK, EU, and US regulatory statuses for each compound so researchers understand the legal landscape in their jurisdiction.",
  },
  {
    q: "How often is the database updated?",
    a: "Our AI enrichment pipeline continuously scans new research, and our editorial team reviews and publishes updates weekly. Community experience data is updated in real-time as users contribute.",
  },
  {
    q: "Can I connect my wearable device?",
    a: "Yes. Peptyl supports integration with Whoop and Fitbit. Once connected, your recovery, HRV, sleep, and activity data are synced automatically and displayed alongside your protocol data for holistic tracking.",
  },
  {
    q: "What is the patent-pending BPC-157 formulation?",
    a: "Peptyl is developing a patent-pending BPC-157 formulation engineered for increased half-life. This is an active area of our proprietary research. More details will be published as the patent process progresses.",
  },
  {
    q: "Is there a dashboard for PTs and coaches?",
    a: "We are building a dedicated dashboard that will allow personal trainers and coaches to manage client protocols, track adherence, and view aggregated progress in one place. This feature is coming soon.",
  },
  {
    q: "What subscription tiers are available?",
    a: "Peptyl currently offers a free tier with full access to the compound database, educational articles, and basic dashboard features. A Pro tier with advanced bloodwork analytics, AI-powered health assessments, and priority wearable sync is in development.",
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
      title="FAQ - Health Intelligence & Peptide Research Questions"
      description="Answers to common questions about Peptyl's health intelligence platform, AI-driven insights, bloodwork tracking, wearable integration, peptide research, and more."
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
          Everything you need to know about using Peptyl for health intelligence, peptide research, and protocol tracking.
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
