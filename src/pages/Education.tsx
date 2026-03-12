import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/blog-posts";
import SEO from "@/components/SEO";

const EducationPage = () => {
  const { t } = useTranslation();
  const ALL = t("educationPage.all");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(blogPosts.map((p) => p.category)));
    return [ALL, ...cats];
  }, [ALL]);

  const [active, setActive] = useState(ALL);

  const filtered = active === ALL ? blogPosts : blogPosts.filter((p) => p.category === active);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Peptide Guides — Reconstitution, Storage, GLP-1 & More"
        description="Free science-backed guides on peptide reconstitution, storage, GLP-1 protocols, BPC-157 vs TB-500, NAD+ longevity stacks, and peptide cycling. Updated for 2026."
        path="/education"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Peptide Education Articles",
          "itemListElement": blogPosts.map((post, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "url": `https://peptyl.co.uk/education/${post.slug}`,
            "name": post.title,
          })),
        }}
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
              {t("educationPage.title")} <span className="text-gradient-teal">{t("educationPage.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {t("educationPage.subtitle")}
            </p>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/education/${post.slug}`}
                  className="block bg-card rounded-2xl border border-border p-6 sm:p-8 hover:border-primary/20 hover:shadow-md transition-all group h-full"
                >
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground">
                    {post.category}
                  </span>
                  <h2 className="text-lg font-heading font-bold text-foreground mt-4 mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                      <span>{post.date}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                      {t("educationPage.read")} <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EducationPage;