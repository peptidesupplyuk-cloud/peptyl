import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { blogPosts } from "@/data/blog-posts";

const sections = [
  {
    title: "Main Pages",
    links: [
      { to: "/", label: "Home" },
      { to: "/peptides", label: "Peptide Database" },
      { to: "/improve", label: "Peptides & Supplements" },
      { to: "/calculators", label: "Reconstitution & Dosing Calculators" },
      { to: "/education", label: "Education Hub" },
      { to: "/suppliers", label: "UK Supplier Comparison" },
      { to: "/shop", label: "Supplement Shop" },
      { to: "/dna", label: "DNA Analysis" },
      { to: "/about", label: "About Peptyl" },
      { to: "/faq", label: "Frequently Asked Questions" },
      { to: "/glossary", label: "Peptide Glossary" },
    ],
  },
  {
    title: "Education Articles",
    links: blogPosts.map(p => ({
      to: `/education/${p.slug}`,
      label: p.title,
    })),
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy-policy", label: "Privacy Policy" },
      { to: "/terms-of-service", label: "Terms of Service" },
    ],
  },
];

const SiteMapPage = () => (
  <div className="min-h-screen bg-background">
    <SEO
        title="Sitemap — All Pages | Peptyl"
        description="Complete list of all pages on Peptyl. Browse the peptide database, educational guides, calculators, DNA analysis, and more."
      path="/sitemap"
    />
    <Header />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-8">Sitemap</h1>
          {sections.map(s => (
            <section key={s.title} className="mb-10">
              <h2 className="text-lg font-heading font-semibold text-foreground mb-3">{s.title}</h2>
              <ul className="space-y-1.5">
                {s.links.map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-primary hover:underline">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default SiteMapPage;
