import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ArticleLayoutProps {
  category: string;
  title: string;
  readTime: string;
  date: string;
  children: React.ReactNode;
  slug?: string;
  description?: string;
}

const BASE_URL = "https://peptyl.co.uk";

const ArticleLayout = ({ category, title, readTime, date, children, slug, description }: ArticleLayoutProps) => {
  const articleJsonLd = slug ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description || title,
    "datePublished": "2026-02-01",
    "dateModified": "2026-02-01",
    "author": { "@type": "Organization", "name": "Peptyl" },
    "publisher": { "@type": "Organization", "name": "Peptyl", "url": BASE_URL },
    "mainEntityOfPage": `${BASE_URL}/education/${slug}`,
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {articleJsonLd && (
        <Helmet>
          <title>{`${title} | Peptyl`}</title>
          <meta name="description" content={description || title} />
          <link rel="canonical" href={`${BASE_URL}/education/${slug}`} />
          <meta property="og:title" content={`${title} | Peptyl`} />
          <meta property="og:description" content={description || title} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={`${BASE_URL}/education/${slug}`} />
          <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        </Helmet>
      )}
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/education"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Education Hub
            </Link>

            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground">
              {category}
            </span>

            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mt-4 mb-4">
              {title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {date}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {readTime}</span>
            </div>

            <article className="prose prose-sm max-w-none 
              prose-headings:font-heading prose-headings:text-foreground 
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-strong:text-foreground
              prose-li:text-muted-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-table:text-sm
              prose-th:text-foreground prose-th:font-heading prose-th:bg-muted/50 prose-th:px-4 prose-th:py-2
              prose-td:px-4 prose-td:py-2 prose-td:text-muted-foreground prose-td:border-border
            ">
              {children}
            </article>

            <div className="mt-12 p-6 rounded-2xl bg-accent border border-primary/20 space-y-3">
              <p className="text-xs font-semibold text-foreground">⚠ Research &amp; Educational Content Only</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All peptides and compounds discussed in Peptyl content are research chemicals. They are not approved for human consumption, veterinary use, or dietary supplementation by the MHRA, FDA, or any other regulatory authority. This content is for educational and informational purposes only.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Peptyl is not operated by medical professionals. Nothing in this article constitutes medical advice, clinical guidance, or a recommendation to use any compound. Always consult a qualified GP, pharmacist, or specialist before beginning any new health intervention.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dosing figures, protocols, and safety data referenced in articles are drawn from published research literature. Peptyl makes no representations about their accuracy, completeness, or applicability to any individual.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArticleLayout;
